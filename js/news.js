const NewsManager = (() => {
    const CACHE_KEY = 'pulpProNews';
    const CACHE_TIME_KEY = 'pulpProNewsTime';
    const CACHE_DURATION = 6 * 60 * 60 * 1000;
    const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000;
    const MAX_AGE_DAYS = 30;
    const PROXY = 'https://corsproxy.io/?url=';

    const RSS_FEEDS = [
        { url: 'https://www.agf.nl/rss.xml/', fruit: 'all', source: 'AGF.nl', hasImages: true, showAll: true },
        { url: 'https://news.google.com/rss/search?q=banaan+bananen+fruit+handel+-site:agf.nl&hl=nl&gl=NL&ceid=NL:nl', fruit: 'banana', source: 'Google Nieuws', hasImages: false },
        { url: 'https://news.google.com/rss/search?q=mango+fruit+import+export+europa+-site:agf.nl&hl=nl&gl=NL&ceid=NL:nl', fruit: 'mango', source: 'Google Nieuws', hasImages: false },
        { url: 'https://news.google.com/rss/search?q=avocado+fruit+import+export+europa+-site:agf.nl&hl=nl&gl=NL&ceid=NL:nl', fruit: 'avocado', source: 'Google Nieuws', hasImages: false },
        { url: 'https://news.google.com/rss/search?q=banana+fresh+produce+europe+-site:agf.nl&hl=en&gl=NL&ceid=NL:en', fruit: 'banana', source: 'Google News', hasImages: false },
        { url: 'https://news.google.com/rss/search?q=mango+fresh+produce+europe+-site:agf.nl&hl=en&gl=NL&ceid=NL:en', fruit: 'mango', source: 'Google News', hasImages: false },
        { url: 'https://news.google.com/rss/search?q=avocado+fresh+produce+europe+-site:agf.nl&hl=en&gl=NL&ceid=NL:en', fruit: 'avocado', source: 'Google News', hasImages: false },
    ];

    const KEYWORDS = {
        banana: ['banaan', 'bananen', 'banana', 'bananas', 'chiquita', 'fyffes', 'dole', 'del monte', 'rijpcel', 'bananencel', 'ripening'],
        mango: ['mango', "mango's", 'mangoes', 'mangos'],
        avocado: ['avocado', "avocado's", 'avocados', 'hass']
    };

    let allArticles = [];
    let activeFilter = 'all';
    const articleMap = {};
    let autoRefreshTimer = null;

    function getFruitImage(fruit) {
        if (fruit === 'banana') return 'banana.png';
        if (fruit === 'mango') return 'mango.png';
        if (fruit === 'avocado') return 'avocado.png';
        return 'banana.png';
    }

    function init() {
        activeFilter = 'all';
        document.querySelectorAll('.news-filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === 'all');
        });
        loadNews();
        startAutoRefresh();
    }

    function startAutoRefresh() {
        if (autoRefreshTimer) clearInterval(autoRefreshTimer);
        autoRefreshTimer = setInterval(() => { silentRefresh(); }, AUTO_REFRESH_INTERVAL);
    }

    async function silentRefresh() {
        try {
            const freshArticles = await fetchArticles();
            if (!freshArticles || freshArticles.length === 0) return;
            const currentLinks = new Set(allArticles.map(a => a.link));
            const hasNew = freshArticles.some(a => !currentLinks.has(a.link));
            if (hasNew) {
                allArticles = freshArticles;
                const now = Date.now();
                localStorage.setItem(CACHE_KEY, JSON.stringify(allArticles));
                localStorage.setItem(CACHE_TIME_KEY, now.toString());
                renderNews();
                updateCacheStatus(now);
            }
        } catch (e) {}
    }

    async function loadNews() {
        showLoading();
        // Always clear old cache first to prevent stale articles showing
        const cached = getCachedNews();
        if (cached) {
            allArticles = cached.articles;
            renderNews();
            updateCacheStatus(cached.timestamp);
            return;
        }
        const articles = await fetchArticles();
        if (articles) {
            allArticles = articles;
            const now = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(allArticles));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
            renderNews();
            updateCacheStatus(now);
        } else {
            showError();
        }
    }

    async function fetchArticles() {
        try {
            const results = await Promise.allSettled(
                RSS_FEEDS.map(feed =>
                    fetch(PROXY + encodeURIComponent(feed.url))
                        .then(r => r.text())
                        .then(xml => ({ xml, feed }))
                )
            );

            const articles = [];
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

            results.forEach(result => {
                if (result.status !== 'fulfilled') return;
                const { xml, feed } = result.value;
                if (!xml) return;

                const items = parseRSS(xml);
                items.forEach(item => {
                    if (articles.find(a => a.link === item.link)) return;

                    // Skip articles older than MAX_AGE_DAYS
                    if (item.pubDate) {
                        const articleDate = new Date(item.pubDate);
                        if (!isNaN(articleDate) && articleDate < cutoffDate) return;
                    }

                    const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
                    let fruit = null;

                    if (feed.showAll) {
                        if (KEYWORDS.banana.some(k => text.includes(k))) fruit = 'banana';
                        else if (KEYWORDS.mango.some(k => text.includes(k))) fruit = 'mango';
                        else if (KEYWORDS.avocado.some(k => text.includes(k))) fruit = 'avocado';
                        else fruit = 'general';
                    } else if (feed.fruit === 'banana') {
                        fruit = 'banana';
                    } else if (feed.fruit === 'mango') {
                        fruit = 'mango';
                    } else if (feed.fruit === 'avocado') {
                        fruit = 'avocado';
                    } else {
                        if (KEYWORDS.banana.some(k => text.includes(k))) fruit = 'banana';
                        else if (KEYWORDS.mango.some(k => text.includes(k))) fruit = 'mango';
                        else if (KEYWORDS.avocado.some(k => text.includes(k))) fruit = 'avocado';
                        else return;
                    }

                    const cleanDesc = (item.description || '')
                        .replace(/<[^>]*>/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();

                    articles.push({
                        title: item.title,
                        description: cleanDesc,
                        link: item.link,
                        image_url: feed.hasImages ? (item.image || null) : null,
                        pubDate: item.pubDate,
                        source_id: feed.source,
                        fruit
                    });
                });
            });

            // Deduplicate
            const seen = new Set();
            const deduped = articles.filter(a => {
                const key = (a.title || '').toLowerCase().substring(0, 50);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Always sort newest first
            deduped.sort((a, b) => {
                const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
                const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
                return dateB - dateA;
            });

            return deduped;
        } catch (err) {
            console.error('News fetch failed:', err);
            return null;
        }
    }

    function parseRSS(xml) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, 'text/xml');
            const items = doc.querySelectorAll('item');
            return Array.from(items).map(item => {
                const get = tag => item.querySelector(tag)?.textContent?.trim() || '';
                const enclosure = item.querySelector('enclosure');
                const img = enclosure?.getAttribute('url') ||
                    item.querySelector('thumbnail')?.getAttribute('url') ||
                    extractImageFromDesc(get('description')) || null;
                return {
                    title: get('title'),
                    description: get('description'),
                    link: get('link'),
                    pubDate: get('pubDate'),
                    image: img
                };
            });
        } catch (e) { return []; }
    }

    function extractImageFromDesc(html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        return match ? match[1] : null;
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
        if (fruit === 'avocado') return '#a6e22e';
        return '#78c830';
    }

    function getFruitBg(fruit) {
        if (fruit === 'banana') return 'linear-gradient(135deg, #0d1f0d 0%, #152b10 100%)';
        if (fruit === 'mango') return 'linear-gradient(135deg, #1f1200 0%, #2e1c00 100%)';
        if (fruit === 'avocado') return 'linear-gradient(135deg, #0a1a0a 0%, #152515 100%)';
        return 'linear-gradient(135deg, #0d1f0d 0%, #152b10 100%)';
    }

    function getFruitEmoji(fruit) {
        if (fruit === 'banana') return '🍌';
        if (fruit === 'mango') return '🥭';
        if (fruit === 'avocado') return '🥑';
        return '🌿';
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

    function getTileSize(article, index) {
        if (index === 0) return 'hero';
        if (article.image_url) {
            if (index % 5 === 0) return 'large';
            return 'medium';
        }
        const titleLen = (article.title || '').length;
        const descLen = (article.description || '').length;
        if (titleLen > 80 || descLen > 200) return 'large-text';
        if (titleLen > 50 || descLen > 100) return 'medium-text';
        return 'compact-text';
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
            renderDesktop(articles, list);
        } else {
            renderMobile(articles, list);
        }
    }

    function renderMobile(articles, list) {
        list.innerHTML = articles.map((a, i) => renderMobileCard(a, i)).join('');
    }

    function renderMobileCard(article, index) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const time = timeAgo(article.pubDate);
        const size = getTileSize(article, index);
        const badge = `<div class="flip-badge" style="background:${colour}25; border:1px solid ${colour}50; color:${colour};">${emoji} ${article.source_id}</div>`;

        if (article.image_url) {
            const imgHeight = size === 'hero' ? '220px' : size === 'large' ? '180px' : '140px';
            return `
            <div class="flip-mobile-card" onclick="NewsManager.openArticleById('${id}')">
                <div class="flip-img-wrap" style="height:${imgHeight}; background-image:url('${article.image_url}'); background-size:cover; background-position:center; position:relative;">
                    <div class="flip-img-overlay"></div>
                    ${badge}
                </div>
                <div class="flip-body">
                    <div class="flip-title-lg">${article.title || ''}</div>
                    ${article.description ? `<div class="flip-excerpt">${article.description.substring(0, 160)}...</div>` : ''}
                    <div class="flip-meta"><span style="color:${colour}; font-weight:900; font-size:0.55rem;">${article.source_id}</span><span class="flip-dot"></span><span class="flip-time">${time}</span></div>
                </div>
            </div>`;
        } else {
            const minHeight = size === 'large-text' ? '160px' : size === 'medium-text' ? '120px' : '90px';
            const titleClass = size === 'large-text' ? 'flip-title-lg' : 'flip-title-md';
            return `
            <div class="flip-mobile-card flip-text-fill" style="${getFruitBg(article.fruit)}; min-height:${minHeight};" onclick="NewsManager.openArticleById('${id}')">
                ${badge}
                <div class="flip-text-fill-inner">
                    <div class="${titleClass}">${article.title || ''}</div>
                    ${article.description ? `<div class="flip-excerpt" style="color:rgba(255,255,255,0.5);">${article.description.substring(0, 120)}...</div>` : ''}
                    <div class="flip-meta"><span style="color:${colour}; font-weight:900; font-size:0.55rem;">${article.source_id}</span><span class="flip-dot"></span><span class="flip-time">${time}</span></div>
                </div>
            </div>`;
        }
    }

    function renderDesktop(articles, list) {
        const hero = articles[0];
        const rest = articles.slice(1);
        const heroHtml = renderDesktopHero(hero);
        const masonryHtml = `<div class="flip-masonry">${rest.map((a, i) => renderDesktopTile(a, i + 1)).join('')}</div>`;
        list.innerHTML = heroHtml + masonryHtml;
    }

    function renderDesktopHero(article) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const time = timeAgo(article.pubDate);

        if (article.image_url) {
            return `
            <div class="flip-dt-hero" onclick="NewsManager.openArticleById('${id}')">
                <div class="flip-dt-hero-img" style="background-image:url('${article.image_url}'); background-size:cover; background-position:center;">
                    <div class="flip-img-overlay"></div>
                    <div class="flip-badge" style="background:${colour}25; border:1px solid ${colour}50; color:${colour};">${emoji} ${article.source_id}</div>
                </div>
                <div class="flip-dt-hero-body">
                    <div class="flip-dt-hero-title">${article.title || ''}</div>
                    ${article.description ? `<div class="flip-dt-hero-excerpt">${article.description}</div>` : ''}
                    <div class="flip-meta"><span style="color:${colour}; font-weight:900; font-size:0.6rem;">${article.source_id}</span><span class="flip-dot"></span><span class="flip-time">${time}</span></div>
                </div>
            </div>`;
        } else {
            return `
            <div class="flip-dt-hero flip-dt-hero-text" style="${getFruitBg(article.fruit)};" onclick="NewsManager.openArticleById('${id}')">
                <div class="flip-badge" style="background:${colour}25; border:1px solid ${colour}50; color:${colour}; position:relative; margin-bottom:16px; align-self:flex-start;">${emoji} ${article.source_id}</div>
                <div class="flip-dt-hero-title">${article.title || ''}</div>
                ${article.description ? `<div class="flip-dt-hero-excerpt">${article.description}</div>` : ''}
                <div class="flip-meta" style="margin-top:auto;"><span style="color:${colour}; font-weight:900; font-size:0.6rem;">${article.source_id}</span><span class="flip-dot"></span><span class="flip-time">${time}</span></div>
            </div>`;
        }
    }

    function renderDesktopTile(article, index) {
        const id = storeArticle(article);
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const time = timeAgo(article.pubDate);
        const size = getTileSize(article, index);
        const badge = `<div class="flip-badge" style="background:${colour}25; border:1px solid ${colour}50; color:${colour};">${emoji} ${article.source_id}</div>`;

        if (article.image_url) {
            const imgHeight = size === 'large' ? '180px' : '120px';
            return `
            <div class="flip-dt-tile" onclick="NewsManager.openArticleById('${id}')">
                <div class="flip-img-wrap" style="height:${imgHeight}; background-image:url('${article.image_url}'); background-size:cover; background-position:center; position:relative;">
                    <div class="flip-img-overlay"></div>
                    ${badge}
                </div>
                <div class="flip-body">
                    <div class="flip-title-md">${article.title || ''}</div>
                    ${article.description ? `<div class="flip-excerpt">${article.description.substring(0, 120)}...</div>` : ''}
                    <div class="flip-meta"><span style="color:${colour}; font-weight:900; font-size:0.52rem;">${article.source_id}</span><span class="flip-dot"></span><span class="flip-time">${time}</span></div>
                </div>
            </div>`;
        } else {
            const minH = size === 'large-text' ? '170px' : size === 'medium-text' ? '130px' : '100px';
            const titleClass = size === 'large-text' ? 'flip-title-md' : 'flip-title-sm';
            return `
            <div class="flip-dt-tile flip-text-fill" style="${getFruitBg(article.fruit)}; min-height:${minH};" onclick="NewsManager.openArticleById('${id}')">
                ${badge}
                <div class="flip-text-fill-inner">
                    <div class="${titleClass}">${article.title || ''}</div>
                    ${article.description && size !== 'compact-text' ? `<div class="flip-excerpt" style="color:rgba(255,255,255,0.5);">${article.description.substring(0, 100)}...</div>` : ''}
                    <div class="flip-meta"><span style="color:${colour}; font-weight:900; font-size:0.52rem;">${article.source_id}</span><span class="flip-dot"></span><span class="flip-time">${time}</span></div>
                </div>
            </div>`;
        }
    }

    function openArticleById(id) {
        const article = articleMap[id];
        if (!article) return;
        openArticle(article);
    }

    function openArticle(article) {
        const colour = getFruitColor(article.fruit);
        const emoji = getFruitEmoji(article.fruit);
        const time = timeAgo(article.pubDate);
        const date = article.pubDate
            ? new Date(article.pubDate).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
            : '';

        const hero = document.getElementById('articleHero');
        if (hero) {
            if (article.image_url) {
                hero.style.backgroundImage = `url('${article.image_url}')`;
                hero.style.backgroundSize = 'cover';
                hero.style.backgroundPosition = 'center';
                hero.style.background = '';
            } else {
                hero.style.backgroundImage = '';
                hero.style.background = getFruitBg(article.fruit);
            }
        }

        const emojiEl = document.getElementById('articleEmoji');
        if (emojiEl) emojiEl.innerText = '';

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
        setField('articleSummary', article.description || 'Geen samenvatting beschikbaar voor dit artikel.');

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
                    setTimeout(() => { shareBtn.innerHTML = '<i class="bi bi-share-fill"></i> Artikel Delen'; }, 2000);
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
        loadNews();
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
