const NewsManager = (() => {
    const CACHE_KEY = 'pulpProNews';
    const CACHE_TIME_KEY = 'pulpProNewsTime';
    const CACHE_DURATION = 6 * 60 * 60 * 1000;

    const RSS2JSON = 'https://api.rss2json.com/v1/api.json?count=50&rss_url=';

    const RSS_FEEDS = [
        { url: 'https://www.agf.nl/sector/78/bananen/rss.xml/', fruit: 'banana', source: 'AGF.nl' },
        { url: 'https://www.agf.nl/sector/93/exotische-agf/rss.xml/', fruit: 'exotic', source: 'AGF.nl' },
        { url: 'https://www.agf.nl/sector/91/fruit/rss.xml/', fruit: 'fruit', source: 'AGF.nl' },
        { url: 'https://www.freshplaza.com/europe/rss/', fruit: 'all', source: 'FreshPlaza EU' },
        { url: 'https://www.freshplaza.com/rss/', fruit: 'all', source: 'FreshPlaza' },
        { url: 'https://www.groentennieuws.nl/rss.xml/', fruit: 'all', source: 'Groentennieuws' },
        { url: 'https://www.fruitnet.com/rss', fruit: 'all', source: 'Fruitnet' },
    ];

    const KEYWORDS = {
        banana: ['banaan', 'bananen', 'banana', 'bananas', 'chiquita', 'fyffes', 'dole', 'del monte', 'fyffes', 'rijpcel', 'bananencel', 'ripening'],
        mango: ['mango', "mango's", 'mangoes', 'mangos'],
        avocado: ['avocado', "avocado's", 'avocados', 'hass']
    };

    let allArticles = [];
    let activeFilter = 'all';
    const articleMap = {};

    function init() {
        activeFilter = 'all';
        document.querySelectorAll('.news-filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === 'all');
        });
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
            const results = await Promise.allSettled(
                RSS_FEEDS.map(feed =>
                    fetch(RSS2JSON + encodeURIComponent(feed.url))
                        .then(r => r.json())
                        .then(data => ({ data, feed }))
                )
            );

            allArticles = [];

            results.forEach(result => {
                if (result.status !== 'fulfilled') return;
                const { data, feed } = result.value;
                if (!data || data.status !== 'ok') return;

                const items = data.items || [];
                items.forEach(item => {
                    if (allArticles.find(a => a.link === item.link)) return;

                    const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
                    let fruit = null;

                    if (feed.fruit === 'banana') {
                        fruit = 'banana';
                    } else if (feed.fruit === 'exotic') {
                        if (KEYWORDS.mango.some(k => text.includes(k))) fruit = 'mango';
                        else if (KEYWORDS.avocado.some(k => text.includes(k))) fruit = 'avocado';
                        else return;
                    } else if (feed.fruit === 'fruit') {
                        if (KEYWORDS.banana.some(k => text.includes(k))) fruit = 'banana';
                        else if (KEYWORDS.mango.some(k => text.includes(k))) fruit = 'mango';
                        else if (KEYWORDS.avocado.some(k => text.includes(k))) fruit = 'avocado';
                        else return;
                    } else {
                        if (KEYWORDS.banana.some(k => text.includes(k))) fruit = 'banana';
                        else if (KEYWORDS.mango.some(k => text.includes(k))) fruit = 'mango';
                        else if (KEYWORDS.avocado.some(k => text.includes(k))) fruit = 'avocado';
                        else return;
                    }

                    const cleanDesc = (item.description || '')
                        .replace(/<[^>]*>/g, '')
                        .substring(0, 300);

                    allArticles.push({
                        title: item.title,
                        description: cleanDesc,
                        link: item.link,
                        image_url: item.enclosure?.link || item.thumbnail || null,
                        pubDate: item.pubDate,
                        source_id: feed.source,
                        fruit
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
        const timeStr = hrs > 0 ? `${hrs}u geleden` : mins > 0 ? `${mins}m geleden` : 'zojuist';
        el.innerHTML = `<i class="bi bi-clock"></i> Bijgewerkt ${timeStr} — <span onclick="NewsManager.forceRefresh()" style="color:var(--pulp-lime); cursor:pointer; text-decoration:underline;">Vernieuwen</span>`;
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
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'zojuist';
        if (diff < 3600) return Math.floor(diff / 60) + 'm geleden';
        if (diff < 86400) return Math.floor(diff / 3600) + 'u geleden';
        return Math.floor(diff / 86400) + 'd geleden';
    }

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
                <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--text-main);">Geen artikelen gevonden</div>
            </div>`;
            return;
        }

        const isDesktop = window.innerWidth >= 900;
        if (isDesktop) {
            renderDesktop(articles);
        } else {
            renderMobile(articles);
        }
    }

    function renderDesktop(articles) {
        const list = document.getElementById('newsArticleList');
        const hero = articles[0];
        const top = articles.slice(1, 5);
        const rest = articles.slice(5);

        let html = `<div class="news-desktop-grid">`;

        // Hero
        html += renderDesktopHero(hero);

        // Top right 2x2
        html += `<div class="news-desktop-right">`;
        top.forEach(a => { html += renderDesktopCard(a); });
        html += `</div></div>`;

        // Bottom horizontal row
        if (rest.length > 0) {
            html += `<div class="news-bottom-row">`;
            rest.slice(0, 6).forEach(a => { html += renderHorizontalCard(a); });
            html += `</div>`;
        }

        list.innerHTML = html;
    }

    function renderMobile(articles) {
        const list = document.getElementById('newsArticleList');
        const hero = articles[0];
        const rest = articles.slice(1);

        let html = renderMobileHero(hero);
        html += `<div class="news-masonry">`;
        rest.forEach((a, i) => { html += renderMasonryCard(a, i); });
        html += `</div>`;

        list.innerHTML = html;
    }

    function renderDesktopHero(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-desktop-hero" onclick="NewsManager.openArticleById('${id}')">
            <div class="news-desktop-hero-img" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:rgba(22,22,24,0.98);`}">
                ${!img ? `<div style="font-size:5rem;">${emoji}</div>` : ''}
                <div class="news-desktop-hero-overlay"></div>
                <div class="news-cat-badge" style="background:${colour}20; border:1px solid ${colour}50; color:${colour};">${emoji} ${article.source_id}</div>
            </div>
            <div class="news-desktop-hero-body">
                <div class="news-desktop-hero-title">${article.title || ''}</div>
                <div class="news-desktop-hero-desc">${article.description || ''}</div>
                <div class="news-desktop-hero-meta">
                    <span style="color:var(--pulp-lime);">${article.source_id}</span>
                    <span>${time}</span>
                </div>
            </div>
        </div>`;
    }

    function renderDesktopCard(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-desktop-card" onclick="NewsManager.openArticleById('${id}')">
            <div class="news-desktop-card-img" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:${colour}10;`}">
                ${!img ? `<span style="font-size:2rem;">${emoji}</span>` : ''}
            </div>
            <div class="news-desktop-card-body">
                <div class="news-cat" style="color:${colour};">${emoji} ${article.source_id}</div>
                <div class="news-desktop-card-title">${article.title || ''}</div>
                <div class="news-desktop-card-meta">${time}</div>
            </div>
        </div>`;
    }

    function renderHorizontalCard(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-h-card" onclick="NewsManager.openArticleById('${id}')">
            <div class="news-h-thumb" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:${colour}10;`}">
                ${!img ? `<span style="font-size:1.6rem;">${emoji}</span>` : ''}
            </div>
            <div class="news-h-content">
                <div class="news-cat" style="color:${colour};">${emoji} ${article.source_id}</div>
                <div class="news-h-title">${article.title || ''}</div>
                <div class="news-h-meta">${time}</div>
            </div>
        </div>`;
    }

    function renderMobileHero(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);

        return `
        <div class="news-featured-card" onclick="NewsManager.openArticleById('${id}')">
            <div class="news-featured-img" style="${img ? `background-image:url('${img}'); background-size:cover; background-position:center;` : `background:rgba(22,22,24,0.98);`}">
                ${!img ? `<div style="font-size:3.5rem;">${emoji}</div>` : ''}
                <div class="news-featured-overlay"></div>
                <div class="news-cat-badge" style="background:${colour}20; border:1px solid ${colour}50; color:${colour};">${emoji} ${article.source_id}</div>
            </div>
            <div class="news-featured-body">
                <div class="news-featured-title">${article.title || ''}</div>
                <div class="news-meta-row">
                    <span class="news-source" style="color:${colour};">${article.source_id}</span>
                    <span class="news-dot"></span>
                    <span class="news-time">${time}</span>
                </div>
            </div>
        </div>`;
    }

    function renderMasonryCard(article, index) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);
        const tall = img && index % 3 === 0;

        return `
        <div class="news-masonry-card" onclick="NewsManager.openArticleById('${id}')">
            ${img ? `
            <div class="news-masonry-img ${tall ? 'tall' : 'short'}" style="background-image:url('${img}'); background-size:cover; background-position:center;"></div>
            ` : ''}
            <div class="news-masonry-body">
                <div class="news-cat" style="color:${colour};">${emoji} ${article.source_id}</div>
                <div class="news-masonry-title">${article.title || ''}</div>
                <div class="news-masonry-meta">${time}</div>
            </div>
        </div>`;
    }

    function openArticleById(id) {
        const article = articleMap[id];
        if (!article) return;
        openArticle(article);
    }

    function openArticle(article) {
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const img = article.image_url;
        const time = timeAgo(article.pubDate);
        const date = article.pubDate
            ? new Date(article.pubDate).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
            : '';

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
            badge.innerText = `${emoji} ${article.source_id}`;
            badge.style.color = colour;
            badge.style.borderColor = colour + '50';
            badge.style.background = colour + '20';
        }

        const setField = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setField('articleTitle', article.title || '');
        setField('articleSource', article.source_id || '');
        setField('articleTime', time);
        setField('articleDate', date);
        setField('articleCountry', '');
        setField('articleSummary', article.description || 'Geen samenvatting beschikbaar.');

        const readBtn = document.getElementById('articleReadBtn');
        if (readBtn) readBtn.onclick = () => { if (article.link) window.open(article.link, '_blank'); };

        const shareBtn = document.getElementById('articleShareBtn');
        if (shareBtn) {
            shareBtn.onclick = () => {
                if (navigator.share) {
                    navigator.share({ title: article.title, url: article.link });
                } else {
                    navigator.clipboard.writeText(article.link);
                    shareBtn.innerText = '✓ Link gekopieerd!';
                    setTimeout(() => shareBtn.innerHTML = '<i class="bi bi-share-fill"></i> Artikel Delen', 2000);
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
            <div style="font-size:0.7rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:2px; animation:pulse 1.5s infinite;">Nieuws laden...</div>
        </div>`;
    }

    function showError() {
        const list = document.getElementById('newsArticleList');
        if (!list) return;
        list.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:2rem; margin-bottom:10px;">📡</div>
            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--pulp-red); margin-bottom:8px;">Nieuws laden mislukt</div>
            <div style="font-size:0.6rem; color:var(--text-dim); margin-bottom:16px;">Controleer uw internetverbinding</div>
            <div onclick="NewsManager.forceRefresh()" style="font-size:0.65rem; font-weight:900; color:var(--pulp-lime); text-transform:uppercase; letter-spacing:1px; cursor:pointer; text-decoration:underline;">Opnieuw proberen</div>
        </div>`;
    }

    return { init, setFilter, openArticleById, closeArticle, forceRefresh };
})();
