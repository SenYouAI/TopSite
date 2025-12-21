document.addEventListener('DOMContentLoaded', () => {
  init();
});

const state = {
  music: [],
  news: [],
  artists: [],
  novels: [],
  stamps: [],
  currentArtistFilter: null // null (all), 'ouki', 'miyabi'
};

const ARTIST_MAPPING = {
  '/ouki.html': 'ouki',
  '/miyabi.html': 'miyabi'
};

async function init() {
  try {
    // 1. Determine current page context
    const path = window.location.pathname.split('/').pop();
    state.currentArtistFilter = ARTIST_MAPPING['/' + path] || null;

    // Adjust UI based on page
    if (state.currentArtistFilter) {
      document.body.classList.add('artist-page');
      // Hide other artist from filter bar if present (optional, or auto-select)
      updateFilterBarForArtistPage(state.currentArtistFilter);
    }

    // 2. Fetch data
    await loadData();

    // 3. Render content
    renderHero();
    renderNews();
    renderMusic();
    renderNovels();
    renderStamps();
    renderArtists();

    // 4. Setup event listeners
    setupFilters();
    setupMobileMenu();
    setupModal();

    // 5. Remove loader
    setTimeout(() => {
      document.body.classList.add('body-loaded');
    }, 500);

  } catch (error) {
    console.error('Initialization failed:', error);
    document.body.classList.add('body-loaded');
  }
}

function updateFilterBarForArtistPage(artistId) {
  // If we are on ouki.html, we effectively only show Ouki content.
  // We can hide the filter bar or force select.
  // Let's hide the filter bar to simplify, as the page itself is the filter.
  // Or we can keep it but hide the other buttons.
  const filterBar = document.getElementById('music-filter-bar');
  if (filterBar) {
    filterBar.style.display = 'none'; // Simplify: no music filter on specific artist page
  }

  // Also hide top nav links that might not be relevant? 
  // User asked to "filter only that item" in menu too.
  // Menu items: Top, News, Music, Novels, Stamps, Artists.
  // We should keep them but filter the content they link to.
}

async function loadData() {
  const [musicRes, newsRes, artistsRes, novelsRes, stampsRes] = await Promise.all([
    fetch('data/music.json'),
    fetch('data/news.json'),
    fetch('data/artists.json'),
    fetch('data/novels.json'),
    fetch('data/stamps.json')
  ]);

  const musicData = await musicRes.json();
  const newsData = await newsRes.json();
  const artistsData = await artistsRes.json();
  const novelsData = await novelsRes.json();
  const stampsData = await stampsRes.json();

  // Process Music
  // music.json might be { sections: [...] } -> flatten
  state.music = musicData.sections ? musicData.sections.flatMap(s => s.items) : (musicData.items || []);
  state.music.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

  // Process News
  state.news = newsData.items || [];

  // Artists
  state.artists = artistsData.items || [];

  // Novels
  state.novels = novelsData.sections ? novelsData.sections.flatMap(s => s.items) : (novelsData.items || []);

  // Stamps
  state.stamps = stampsData.sections ? stampsData.sections.flatMap(s => s.items) : (stampsData.items || []);
}

function shouldShow(item) {
  if (!state.currentArtistFilter) return true;

  // Logic to determine if an item belongs to the current artist.

  // 1. Explicit artistId property (Music)
  if (item.artistId && item.artistId === state.currentArtistFilter) return true;

  // 2. inferred from ID prefix (common pattern: ouki_xxx)
  if (item.id && item.id.startsWith(state.currentArtistFilter)) return true;

  // 3. Tags containing artist ID or name?
  if (item.tags && (item.tags.includes(state.currentArtistFilter) || item.tags.includes('ouki') && state.currentArtistFilter === 'ouki')) return true;

  return false;
}

function renderHero() {
  // 1. Gather all content into one array with type info
  const allContent = [
    ...state.music.filter(shouldShow).map(i => ({ ...i, type: 'music', date: i.releaseDate })),
    ...state.novels.filter(shouldShow).map(i => ({ ...i, type: 'novel', date: i.date })),
    ...state.stamps.filter(shouldShow).map(i => ({ ...i, type: 'stamp', date: i.date }))
  ];

  if (allContent.length === 0) return;

  // 2. Sort by date desc
  allContent.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 3. Find latest date group
  const latestDate = allContent[0].date;
  const latestItems = allContent.filter(i => i.date === latestDate);

  const heroSection = document.getElementById('hero');
  const container = heroSection.querySelector('.hero-content');

  // Clear existing content logic
  // If we have single item vs multiple, layout differs.

  if (latestItems.length === 1) {
    // SINGLE ITEM LAYOUT (Keep close to original but dynamic)
    const item = latestItems[0];
    renderSingleHero(item, container);
  } else {
    // MULTI ITEM LAYOUT
    renderMultiHero(latestItems, container);
  }
}

function renderSingleHero(item, container) {
  // Clear container to rebuild safe
  container.innerHTML = '';

  const tag = document.createElement('div');
  tag.className = 'hero-tag';
  tag.textContent = 'LATEST RELEASE';
  container.appendChild(tag);

  const img = document.createElement('img');
  img.id = 'hero-cover';
  img.className = 'hero-cover';
  img.src = item.cover || 'images/default_cover.png';
  img.alt = item.title;
  container.appendChild(img);

  const h1 = document.createElement('h1');
  h1.id = 'hero-title';
  h1.className = 'hero-title';
  h1.textContent = item.title;
  container.appendChild(h1);

  const p = document.createElement('p');
  p.id = 'hero-desc';
  p.className = 'hero-desc';
  // Desc logic per type
  if (item.type === 'music') p.textContent = item.lyricsPreview || item.subtitle || 'New Single';
  else if (item.type === 'novel') p.textContent = item.description || 'New Story';
  else if (item.type === 'stamp') p.textContent = 'New LINE Stamps';
  container.appendChild(p);

  const actions = document.createElement('div');
  actions.className = 'hero-actions';

  // Primary Button
  if (item.type === 'music') {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.innerHTML = '<i class="fas fa-play"></i> 試聴する';
    btn.onclick = () => openMusicModal(item);
    actions.appendChild(btn);
  } else if (item.link || (item.links && (item.links.Store || item.links.Read))) {
    const url = item.link || item.links.Store || item.links.Read;
    const btn = document.createElement('a');
    btn.href = url;
    btn.target = '_blank';
    btn.className = 'btn btn-primary';
    btn.innerHTML = item.type === 'novel' ? '<i class="fas fa-book-open"></i> 読む' : '<i class="fas fa-store"></i> 見る';
    actions.appendChild(btn);
  } else if (item.detailUrl) { // stamp json uses detailUrl in original
    const btn = document.createElement('a');
    btn.href = item.detailUrl;
    btn.target = '_blank';
    btn.className = 'btn btn-primary';
    btn.innerHTML = '<i class="fas fa-store"></i> 見る';
    actions.appendChild(btn);
  }

  // Secondary Button
  const secBtn = document.createElement('button'); // using button to navigate smoothly or anchor
  secBtn.className = 'btn btn-outline';
  secBtn.textContent = 'View All';
  secBtn.onclick = () => {
    // scroll to relevant section
    const targetId = item.type === 'music' ? 'music' : (item.type === 'novel' ? 'novels' : 'stamps');
    document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
  };
  actions.appendChild(secBtn);

  container.appendChild(actions);
}

function renderMultiHero(items, container) {
  container.innerHTML = '';

  const tag = document.createElement('div');
  tag.className = 'hero-tag';
  tag.textContent = `LATEST RELEASE - ${items[0].date}`;
  container.appendChild(tag);

  const title = document.createElement('h1');
  title.className = 'hero-title';
  title.style.fontSize = '2rem';
  title.style.marginBottom = '2rem';
  title.textContent = 'New Arrivals';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'hero-multi-grid'; // will style this
  grid.style.display = 'flex';
  grid.style.gap = '2rem';
  grid.style.justifyContent = 'center';
  grid.style.flexWrap = 'wrap';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'hero-mini-card';
    card.style.background = '#fff';
    card.style.padding = '1rem';
    card.style.borderRadius = '12px';
    card.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    card.style.width = '200px';
    card.style.textAlign = 'center';

    const imgC = document.createElement('img');
    imgC.src = item.cover || 'images/default_cover.png';
    imgC.style.width = '100%';
    imgC.style.borderRadius = '8px';
    imgC.style.marginBottom = '0.5rem';

    const tit = document.createElement('div');
    tit.style.fontWeight = 'bold';
    tit.style.fontSize = '0.9rem';
    tit.style.marginBottom = '0.5rem';
    tit.textContent = item.title;

    const btn = document.createElement('button');
    btn.className = 'btn btn-outline';
    btn.style.fontSize = '0.7rem';
    btn.style.padding = '0.4rem 1rem';
    btn.textContent = 'Check';

    if (item.type === 'music') {
      btn.onclick = () => openMusicModal(item);
    } else {
      // simple link logic
      const url = item.link || item.detailUrl || (item.links && (item.links.Store || item.links.Read));
      if (url) {
        btn.onclick = () => window.open(url, '_blank');
      }
    }

    card.appendChild(imgC);
    card.appendChild(tit);
    card.appendChild(btn);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderNews() {
  const list = document.getElementById('news-list');
  list.innerHTML = '';

  // Assuming News might not be strictly tagged by artist, or we show all news?
  // Let's filter if possible, otherwise show all.
  // The User didn't specify news filtering rules, but "Show only items for that artist".
  // If news has no artist info, we might show all or none.
  // Let's assume global news for now unless we add tags to news.

  state.news.slice(0, 3).forEach(item => {
    // Determine if it's a link
    const isLink = !!item.link;
    const elementType = isLink ? 'a' : 'div';

    const wrapper = document.createElement(elementType);
    wrapper.className = `news-item ${isLink ? 'has-link' : ''}`;
    if (isLink) {
      wrapper.href = item.link;
      wrapper.target = '_blank';
    }

    wrapper.innerHTML = `
      <div class="news-icon">${item.icon || 'INFO'}</div>
      <div class="news-date">${item.date}</div>
      <div class="news-content">
        <div class="news-title">${item.title}</div>
        <p style="font-size:0.9rem; color:#888;">${item.description}</p>
      </div>
    `;
    list.appendChild(wrapper);
  });
}

function renderMusic() {
  const grid = document.getElementById('music-grid');
  grid.innerHTML = '';

  const displayItems = state.music.filter(shouldShow);

  if (displayItems.length === 0 && state.currentArtistFilter) {
    grid.innerHTML = '<p style="text-align:center; color:#aaa;">No music found for this artist.</p>';
    return;
  }

  displayItems.forEach(track => {
    const card = document.createElement('div');
    card.className = `music-card ${track.artistId}`;
    card.dataset.artist = track.artistId;

    let artistClass = '';
    if (track.artistId === 'ouki') artistClass = 'artist-ouki';
    if (track.artistId === 'miyabi') artistClass = 'artist-miyabi';

    card.innerHTML = `
      <div class="card-image">
        <img src="${track.cover || 'images/default_cover.png'}" alt="${track.title}" loading="lazy">
      </div>
      <div class="card-info">
        <div class="card-title">${track.title}</div>
        <div class="card-artist">
          <span class="${artistClass}">${getArtistName(track.artistId)}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openMusicModal(track));
    grid.appendChild(card);
  });
}

function renderArtists() {
  const grid = document.getElementById('artists-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const displayItems = state.artists.filter(shouldShow);

  displayItems.forEach(artist => {
    const links = artist.links || {};
    let socialsHtml = '<div class="artist-socials" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem;">';

    if (links.Youtube) socialsHtml += `<a href="${links.Youtube}" target="_blank" title="YouTube"><i class="fab fa-youtube"></i></a>`;
    if (links.X) socialsHtml += `<a href="${links.X}" target="_blank" title="X (Twitter)"><i class="fab fa-x-twitter"></i></a>`;
    if (links.Instagram) socialsHtml += `<a href="${links.Instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>`;
    if (links.Facebook) socialsHtml += `<a href="${links.Facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>`;

    socialsHtml += '</div>';

    let playlistHtml = '';
    if (artist.playlistUrl) {
      playlistHtml = `<div style="margin-top: 1rem;">
        <a href="${artist.playlistUrl}" target="_blank" class="btn btn-outline" style="font-size: 0.85rem;">
          <i class="fas fa-list"></i> Artist Playlist
        </a>
      </div>`;
    }

    // "Profile Page" link logic:
    // If we are on index.html, link to artist page.
    // If we are on artist page, maybe no link needed or link to "About" section?
    // User requested "Link from index.html to artist page".
    let profileLink = '';
    if (!state.currentArtistFilter && artist.artistPageUrl) {
      profileLink = `<a href="${artist.artistPageUrl}" class="btn btn-outline" style="margin-top: 1rem;">Profile Page</a>`;
    }

    const card = document.createElement('div');
    card.className = `artist-card ${artist.id}`;

    // Determine color class or style
    const isOuki = artist.id === 'ouki';
    const isMiyabi = artist.id === 'miyabi';

    // We already have CSS for .artist-card.ouki etc.

    card.innerHTML = `
      <div class="artist-image-wrapper">
        <img src="${artist.cover}" class="artist-thumb" alt="${artist.name}">
      </div>
      <div class="artist-name-group">
        <span class="artist-en">${artist.name.split('（')[0]}</span> <!-- English/Main Name approach -->
        <span class="artist-jp">${artist.name}</span>
      </div>
      <p class="artist-bio">
        ${artist.bio}
      </p>
      ${socialsHtml}
      ${playlistHtml}
      ${profileLink}
    `;
    grid.appendChild(card);
  });
}

function renderNovels() {
  const grid = document.getElementById('novels-grid');
  grid.innerHTML = '';

  const displayItems = state.novels.filter(shouldShow);

  displayItems.forEach(novel => {
    const card = document.createElement('div');
    card.className = 'novel-card';
    card.innerHTML = `
      <div class="novel-date">${novel.date || ''}</div>
      <div class="novel-title">${novel.title}</div>
      <p class="novel-desc">${novel.description}</p>
      <div class="novel-tag">Read More</div>
    `;
    // Link logic? JSON has 'link'?
    if (novel.link || novel.links) {
      card.style.cursor = 'pointer';
      // card.onclick ...
    }
    grid.appendChild(card);
  });
}

function renderStamps() {
  const grid = document.getElementById('stamps-grid');
  grid.innerHTML = '';

  const displayItems = state.stamps.filter(shouldShow);

  displayItems.forEach(stamp => {
    const card = document.createElement('div');
    card.className = 'stamp-card';
    card.innerHTML = `
      <div class="stamp-image">
        <img src="${stamp.cover}" alt="${stamp.title}" loading="lazy">
      </div>
      <div class="stamp-title">${stamp.title}</div>
      <a href="${stamp.detailUrl || '#'}" target="_blank" class="stamp-link">View Store</a>
    `;
    grid.appendChild(card);
  });
}

function getArtistName(id) {
  const artist = state.artists.find(a => a.id === id);
  return artist ? artist.name.split('（')[0] : id;
}

function setupFilters() {
  // Only relevant on index.html where we have filters
  if (state.currentArtistFilter) return;

  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll('.music-card');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.artist === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Modal Logic (Same as before but refined style)
const modal = document.getElementById('music-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

function setupModal() {
  modalClose.addEventListener('click', closeMusicModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
      closeMusicModal();
    }
  });
}

function openMusicModal(track) {
  const artist = state.artists.find(a => a.id === track.artistId);
  const artistName = artist ? artist.name : track.artistId;
  const color = track.artistId === 'ouki' ? 'var(--accent-ouki)' : 'var(--accent-miyabi)';

  let embedHtml = '';
  if (track.spotifyEmbed) {
    embedHtml = track.spotifyEmbed;
  } else if (track.links && track.links.Spotify) { // JSON structure might be nested or flat based on CSV
    // Check both possibilities
    const url = track.links.Spotify || track.links_Spotify;
    if (url) {
      embedHtml = `<a href="${url}" target="_blank" class="btn btn-primary" style="margin-top:1.5rem; width:100%; justify-content:center;">
         <i class="fab fa-spotify"></i> Listen on Spotify
       </a>`;
    }
  } else if (track.links_Spotify) { // Direct flat check
    embedHtml = `<a href="${track.links_Spotify}" target="_blank" class="btn btn-primary" style="margin-top:1.5rem; width:100%; justify-content:center;">
         <i class="fab fa-spotify"></i> Listen on Spotify
       </a>`;
  } else {
    embedHtml = `<div class="modal-player-placeholder">Preview not available</div>`;
  }

  const lyricsHtml = track.lyrics ?
    `<div style="margin-top:2rem; text-align:left; border-top:1px solid #eee; padding-top:1.5rem;">
      <h4 style="font-size:0.9rem; color:#ccc; margin-bottom:1rem;">LYRICS</h4>
      <p style="white-space: pre-line; font-size: 0.95rem; line-height: 2; color: var(--text-main); font-family: var(--font-heading);">${track.lyrics}</p>
     </div>` : '';

  modalBody.innerHTML = `
    <div style="display: flex; gap: 2rem; align-items: flex-start; text-align: left; margin-bottom: 2rem;">
      <img src="${track.cover || 'images/default_cover.png'}" style="width: 140px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      <div>
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.5rem; line-height: 1.2;">${track.title}</h2>
        <p style="color: ${color}; font-weight: 700;">${artistName}</p>
        <p style="color: var(--text-sub); font-size: 0.85rem; margin-top: 0.5rem;">${track.releaseDate}</p>
      </div>
    </div>
    ${embedHtml}
    ${lyricsHtml}
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMusicModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function setupMobileMenu() {
  // Simple toggle
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.site-nav');

  toggle.addEventListener('click', () => {
    if (nav.style.display === 'flex') {
      nav.style.display = 'none';
    } else {
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = 'var(--nav-height)';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.background = 'rgba(255,255,255,0.98)';
      nav.style.padding = '2rem';
      nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
      nav.style.alignItems = 'center';
    }
  });
}
