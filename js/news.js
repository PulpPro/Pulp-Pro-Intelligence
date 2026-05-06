const NewsManager = (() => {
    const API_KEY = 'pub_69f6c17e1162426fa0edc42bd8683c52';
    const CACHE_KEY = 'pulpProNews';
    const CACHE_TIME_KEY = 'pulpProNewsTime';
    const CACHE_DURATION = 6 * 60 * 60 * 1000;

    // More specific industry keywords for EU fruit trade
    const QUERIES = [
        { keyword: 'banana ripening import export fresh produce', fruit: 'banana' },
        { keyword: 'mango fresh produce import EU market', fruit: 'mango' },
        { keyword: 'avocado fresh produce import EU market', fruit: 'avocado' }
    ];

    let allArticles = [];
    let activeFilter = 'all';
    let activeArticle = null;

    function init() {
        activeFilter = 'all';
        loadNews();
    }

    async function loadNews() {
        showLoading();
        const cached = getCachedNews();
        if (cached) {
            allArticles = cached.articles;
            renderNews();
            updateCacheStatus(cached.timestamp);
            return;
        }
        await fetchNews();
    }

    async function fetchNews() {
        try {
            const results = await Promise.all(
                QUERIES.map(q =>
                    fetch(`https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=${encodeURIComponent(q.keyword)}&language=en&category=business,food,science`)
                        .then(r => r.json())
                )
            );

            allArticles = [];
            results.forEach((result, idx) => {
                if (result.status === 'success' && result.results) {
                    result.results.forEach(article => {
                        if (!allArticles.find(a => a.link === article.link)) {
                            allArticles.push({
                                ...article,
                                fruit: QUERIES[idx].fruit
                            });
                        }
                    });
                }
            });

            allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            const now = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(allArticles));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());

            renderNews();
            updateCacheStatus(now);
        } catch (err) {
            console.error('News fetch failed:', err);
            showError();
        }
    }

    function getCachedNews() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
            if (!cached || !cachedTime) return null;
            const age = Date.now() - parseInt(cachedTime);
            if (age > CACHE_DURATION) return null;
            return { articles: JSON.parse(cached), timestamp: parseInt(cachedTime) };
        } catch (e) { return null; }
    }

    function updateCacheStatus(timestamp) {
        const el = document.getElementById('newsCacheStatus');
        if (!el) return;
        const age = Date.now() - timestamp;
        const mins = Math.floor(age / 60000);
        const hrs = Math.floor(mins / 60);
        let timeStr = hrs > 0 ? `${hrs}h ago` : mins > 0 ? `${mins}m ago` : 'just now';
        el.innerHTML = `<i class="bi bi-clock"></i> Updated ${timeStr} — <span onclick="NewsManager.forceRefresh()" style="color:var(--pulp-lime); cursor:pointer; text-decoration:underline;">Refresh</span>`;
        el.style.display = 'flex';
    }

    function setFilter(filter) {
        activeFilter = filter;
        document.querySelectorAll('.news-filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        renderNews();
    }

    function getFilteredArticles() {
        if (activeFilter === 'all') return allArticles;
        return allArticles.filter(a => a.fruit === activeFilter);
    }

    function getFruitColor(fruit) {
        if (fruit === 'banana') return '#78c830';
        if (fruit === 'mango') return '#ff8c00';
        return '#a6e22e';
    }

    function getFruitEmoji(fruit) {
        if (fruit === 'banana') return '🍌';
        if (fruit === 'mango') return '🥭';
        return '🥑';
    }

    function timeAgo(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const diff = Math.floor((new Date() - date) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }

    // Fix for clicking — store articles in a map instead of inline JSON
    const articleMap = {};

    function storeArticle(article) {
        const id = 'art_' + Math.random().toString(36).substr(2, 9);
        articleMap[id] = article;
        return id;
    }

    function renderNews() {
        const list = document.getElementById('newsArticleList');
        if (!list) return;

        const articles = getFilteredArticles();

        if (articles.length === 0) {
            list.innerHTML = `
            <div style="text-align:center; padding:40px 20px; opacity:0.4;">
                <div style="font-size:2rem; margin-bottom:10px;">📰</div>
                <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--text-main);">No articles found</div>
            </div>`;
            return;
        }

        const featured = articles[0];
        const rest = articles.slice(1);
        list.innerHTML = renderFeatured(featured) + rest.map(renderCard).join('');
    }

    function renderFeatured(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const fruit = article.fruit.charAt(0).toUpperCase() + article.fruit.slice(1);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-featured-card" onclick="NewsManager.openArticleById('${id}')">
            <div class="news-featured-img" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:rgba(22,22,24,0.98);`}">
                ${!img ? `<div style="font-size:3.5rem;">${emoji}</div>` : ''}
                <div class="news-featured-overlay"></div>
                <div class="news-cat-badge" style="background:${colour}20; border:1px solid ${colour}50; color:${colour};">${emoji} ${fruit}</div>
            </div>
            <div class="news-featured-body">
                <div class="news-featured-title">${article.title || 'No title'}</div>
                <div class="news-meta-row">
                    <span class="news-source">${article.source_id || 'Unknown'}</span>
                    <span class="news-dot"></span>
                    <span class="news-time">${time}</span>
                </div>
            </div>
        </div>`;
    }

    function renderCard(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const fruit = article.fruit.charAt(0).toUpperCase() + article.fruit.slice(1);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-card" onclick="NewsManager.openArticleById('${id}')">
            <div class="news-thumb" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:${colour}12;`}">
                ${!img ? `<span style="font-size:1.8rem;">${emoji}</span>` : ''}
            </div>
            <div class="news-content">
                <div class="news-cat" style="color:${colour};">${emoji} ${fruit}</div>
                <div class="news-title">${article.title || 'No title'}</div>
                <div class="news-meta-row">
                    <span class="news-source">${article.source_id || 'Unknown'}</span>
                    <span class="news-dot"></span>
                    <span class="news-time">${time}</span>
                </div>
            </div>
        </div>`;
    }

    // New — open article by ID instead of encoded JSON
    function openArticleById(id) {
        const article = articleMap[id];
        if (!article) return;
        openArticle(article);
    }

    function openArticle(article) {
        activeArticle = article;
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const fruit = article.fruit.charAt(0).toUpperCase() + article.fruit.slice(1);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);
        const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '';

        const hero = document.getElementById('articleHero');
        if (hero) {
            hero.style.backgroundImage = img ? `url('${img}')` : '';
            hero.style.backgroundSize = 'cover';
            hero.style.backgroundPosition = 'center';
        }
        const emojiEl = document.getElementById('articleEmoji');
        if (emojiEl) emojiEl.innerText = !img ? emoji : '';
        const badge = document.getElementById('articleCatBadge');
        if (badge) {
            badge.innerText = `${emoji} ${fruit}`;
            badge.style.color = colour;
            badge.style.borderColor = colour + '50';
            badge.style.background = colour + '20';
        }

        const fields = {
            articleTitle: article.title || '',
            articleSource: article.source_id || '',
            articleTime: time,
            articleDate: date,
            articleCountry: article.country ? article.country.join(', ').toUpperCase() : '',
            articleSummary: article.description || article.content || 'No summary available.'
        };
        Object.entries(fields).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        });

        const readBtn = document.getElementById('articleReadBtn');
        if (readBtn) readBtn.onclick = () => { if (article.link) window.open(article.link, '_blank'); };

        const shareBtn = document.getElementById('articleShareBtn');
        if (shareBtn) {
            shareBtn.onclick = () => {
                if (navigator.share) {
                    navigator.share({ title: article.title, url: article.link });
                } else {
                    navigator.clipboard.writeText(article.link);
                    shareBtn.innerText = '✓ Link Copied!';
                    setTimeout(() => shareBtn.innerHTML = '<i class="bi bi-share-fill"></i> Share Article', 2000);
                }
            };
        }

        document.getElementById('news-list-view').classList.add('hidden');
        document.getElementById('news-article-view').classList.remove('hidden');
    }

    function closeArticle() {
        document.getElementById('news-article-view').classList.add('hidden');
        document.getElementById('news-list-view').classList.remove('hidden');
    }

    function forceRefresh() {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);
        allArticles = [];
        fetchNews();
    }

    function showLoading() {
        const list = document.getElementById('newsArticleList');
        if (!list) return;
        list.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
            <div style="font-size:0.7rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px; animation:pulse 1.5s infinite;">Loading News...</div>
        </div>`;
    }

    function showError() {
        const list = document.getElementById('newsArticleList');
        if (!list) return;
        list.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:2rem; margin-bottom:10px;">📡</div>
            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--pulp-red); margin-bottom:8px;">Could not load news</div>
            <div style="font-size:0.6rem; color:var(--text-dim); margin-bottom:16px;">Check your internet connection</div>
            <div onclick="NewsManager.forceRefresh()" style="font-size:0.65rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:1px; cursor:pointer; text-decoration:underline;">Try Again</div>
        </div>`;
    }

    return { init, setFilter, openArticleById, closeArticle, forceRefresh };
})();
