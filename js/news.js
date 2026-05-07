const NewsManager = (() => {
    const CACHE_KEY = 'pulpProNews';
    const CACHE_TIME_KEY = 'pulpProNewsTime';
    const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

    const RSS_FEEDS = [
        { url: 'https://www.fruitnet.com/products/fruit/bananas/rss', fruit: 'banana' },
        { url: 'https://www.fruitnet.com/products/fruit/mangoes/rss', fruit: 'mango' },
        { url: 'https://www.fruitnet.com/products/fruit/avocados/rss', fruit: 'avocado' },
        { url: 'https://www.freshfruitportal.com/feed', fruit: 'all' },
        { url: 'https://www.freshplaza.com/rss', fruit: 'all' },
        { url: 'https://news.google.com/rss/search?q=banana+fruit+trade&hl=en&gl=US&ceid=US:en', fruit: 'banana' },
        { url: 'https://news.google.com/rss/search?q=mango+fruit+trade&hl=en&gl=US&ceid=US:en', fruit: 'mango' },
        { url: 'https://news.google.com/rss/search?q=avocado+fruit+trade&hl=en&gl=US&ceid=US:en', fruit: 'avocado' }
    ];

    const KEYWORDS = {
        banana: ['banana', 'bananen', 'cavendish', 'chiquita', 'dole'],
        mango: ['mango', 'mango\'s', 'mangoes'],
        avocado: ['avocado', 'avocados', 'avocado\'s', 'hass']
    };

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

    function detectFruit(title, description) {
        const text = ((title || '') + ' ' + (description || '')).toLowerCase();
        for (const [fruit, words] of Object.entries(KEYWORDS)) {
            if (words.some(w => text.includes(w))) return fruit;
        }
        return null;
    }

    function parseRSS(xmlText) {
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');
            const items = xml.querySelectorAll('item');
            return Array.from(items).map(item => ({
                title: item.querySelector('title')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
                description: item.querySelector('description')?.textContent || '',
                pubDate: item.querySelector('pubDate')?.textContent || '',
                thumbnail: item.querySelector('enclosure')?.getAttribute('url') || '',
                author: item.querySelector('source')?.textContent || ''
            }));
        } catch (e) {
            return [];
        }
    }

    async function fetchFeed(feedUrl) {
        try {
            // Try rss2json first
            const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=20`;
            const response = await fetch(proxy);
            const data = await response.json();
            if (data.status === 'ok' && data.items?.length > 0) return data.items;

            // Fallback: fetch raw XML via corsproxy and parse manually
            const corsProxy = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
            const xmlResponse = await fetch(corsProxy);
            const xmlText = await xmlResponse.text();
            return parseRSS(xmlText);
        } catch (err) {
            console.warn('Feed failed:', feedUrl, err);
            return [];
        }
    }

    async function fetchNews() {
        try {
            const results = await Promise.allSettled(
                RSS_FEEDS.map(feed => fetchFeed(feed.url).then(items =>
                    items.map(item => ({ ...item, feedFruit: feed.fruit }))
                ))
            );

            allArticles = [];

            results.forEach(result => {
                if (result.status !== 'fulfilled') return;
                result.value.forEach(item => {
                    if (allArticles.find(a => a.link === item.link)) return;

                    let fruit = item.feedFruit;
                    if (fruit === 'all') {
                        fruit = detectFruit(item.title, item.description);
                        if (!fruit) return;
                    }

                    allArticles.push({
                        title: item.title || '',
                        link: item.link || '',
                        description: item.description || item.content || '',
                        image_url: item.thumbnail || item.enclosure?.link || null,
                        pubDate: item.pubDate || '',
                        source_id: item.author || extractDomain(item.link),
                        fruit: fruit
                    });
                });
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

    function extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Unknown';
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
        } catch (e) {
            return null;
        }
    }

    function updateCacheStatus(timestamp) {
        const el = document.getElementById('newsCacheStatus');
        if (!el) return;
        const age = Date.now() - timestamp;
        const mins = Math.floor(age / 60000);
        const hrs = Math.floor(mins / 60);
        let timeStr = '';
        if (hrs > 0) timeStr = `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        else if (mins > 0) timeStr = `${mins} minute${mins > 1 ? 's' : ''} ago`;
        else timeStr = 'just now';
        el.innerHTML = `<i class="bi bi-clock"></i> Last updated ${timeStr} — <span onclick="NewsManager.forceRefresh()" style="color:var(--pulp-lime); cursor:pointer; text-decoration:underline;">Refresh</span>`;
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
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
        return Math.floor(diff / 86400) + ' days ago';
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
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const fruit = article.fruit.charAt(0).toUpperCase() + article.fruit.slice(1);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-featured-card" onclick="NewsManager.openArticle('${encodeURIComponent(JSON.stringify(article))}')">
            <div class="news-featured-img" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background: linear-gradient(135deg, rgba(22,22,24,0.98), rgba(40,40,40,0.98));`}">
                ${!img ? `<div style="font-size:3.5rem;">${emoji}</div>` : ''}
                <div class="news-featured-overlay"></div>
                <div class="news-cat-badge" style="background:${colour}20; border:1px solid ${colour}50; color:${colour};">
                    ${emoji} ${fruit}
                </div>
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
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const fruit = article.fruit.charAt(0).toUpperCase() + article.fruit.slice(1);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-card" onclick="NewsManager.openArticle('${encodeURIComponent(JSON.stringify(article))}')">
            <div class="news-thumb" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:${colour}10;`}">
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

    function openArticle(encoded) {
        try {
            activeArticle = JSON.parse(decodeURIComponent(encoded));
        } catch (e) { return; }

        const article = activeArticle;
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const fruit = article.fruit.charAt(0).toUpperCase() + article.fruit.slice(1);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);
        const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '';

        document.getElementById('articleHero').style.backgroundImage = img ? `url('${img}')` : '';
        document.getElementById('articleHero').style.backgroundSize = 'cover';
        document.getElementById('articleHero').style.backgroundPosition = 'center';
        document.getElementById('articleEmoji').innerText = !img ? emoji : '';
        document.getElementById('articleCatBadge').innerText = `${emoji} ${fruit}`;
        document.getElementById('articleCatBadge').style.color = colour;
        document.getElementById('articleCatBadge').style.borderColor = colour + '50';
        document.getElementById('articleCatBadge').style.background = colour + '20';
        document.getElementById('articleTitle').innerText = article.title || '';
        document.getElementById('articleSource').innerText = article.source_id || '';
        document.getElementById('articleTime').innerText = time;
        document.getElementById('articleDate').innerText = date;
        document.getElementById('articleCountry').innerText = '';
        document.getElementById('articleSummary').innerText = article.description
            ? article.description.replace(/<[^>]*>/g, '').substring(0, 400) + '...'
            : 'No summary available for this article.';

        const readBtn = document.getElementById('articleReadBtn');
        if (readBtn) {
            readBtn.onclick = () => { if (article.link) window.open(article.link, '_blank'); };
        }

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

    return { init, setFilter, openArticle, closeArticle, forceRefresh };
})();
