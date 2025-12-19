let globalData = null;
let revealObserver = null;
let currentArtistFilter = null;

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Failed to load " + path);
  return res.json();
}

async function loadAllData() {
  const [site, artists, music, novels, stamps, news] = await Promise.all([
    loadJson("data/site.json"),
    loadJson("data/artists.json"),
    loadJson("data/music.json"),
    loadJson("data/novels.json"),
    loadJson("data/stamps.json"),
    loadJson("data/news.json").catch(() => ({ items: [] })),
  ]);
  return { site, artists, music, novels, stamps, news };
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

  try {
    globalData = await loadAllData();
    applySiteMeta(globalData.site);
    initRevealObserver();

    const filterFromPage = window.__ARTIST_FILTER__ || null;
    const initial = parseInitialState();
    currentArtistFilter = filterFromPage || initial.artistId;
    
    renderPage(initial.pageId);
  } catch (err) {
    console.error(err);
    if (app) app.innerHTML = "<p>データの読み込みに失敗しました。</p>";
  }
});

function parseInitialState() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace("#", "");
  const allPages = ["home", "music", "novels", "stamps", "about"];
  let pageId = params.get("page") || hash;
  if (!allPages.includes(pageId)) pageId = "home";
  return { pageId, artistId: params.get("artist") || null };
}

function applySiteMeta(site) {
  document.title = site.title || document.title;
  document.body.dataset.theme = site.theme || "dark";
  document.body.dataset.season = site.season || "default";
}

function renderNav(navItems) {
  const navRoot = document.getElementById("site-nav");
  if (!navRoot) return;
  navRoot.innerHTML = "";

  navItems.forEach((item, index) => {
    if (item.id === "novels") {
      if (currentArtistFilter === "chiya_masa") return;
      const hasNovels = globalData.novels?.sections?.some(s => s.items?.length > 0);
      if (!hasNovels) return;
    }
    if (item.id === "stamps") {
      if (currentArtistFilter === "chiya_masa") return;
      const hasStamps = globalData.stamps?.sections?.some(s => s.items?.length > 0);
      if (!hasStamps) return;
    }

    const a = document.createElement("a");
    a.href = "#" + item.id;
    a.textContent = item.label;
    if (index === 0) a.classList.add("active");
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      renderPage(item.id);
    });
    navRoot.appendChild(a);
  });
}

function setActiveNav(pageId) {
  const navRoot = document.getElementById("site-nav");
  if (!navRoot) return;
  navRoot.querySelectorAll("a").forEach((a) => {
    const target = a.getAttribute("href")?.replace("#", "");
    a.classList.toggle("active", target === pageId);
  });
}

function updateFooter() {
  const footer = document.querySelector(".site-footer > div");
  if (!footer) return;
  const year = new Date().getFullYear();
  
  if (currentArtistFilter === "ouki") {
    footer.innerHTML = "© " + year + " SenYouAI / 愛玩王姫プロジェクト";
  } else if (currentArtistFilter === "chiya_masa") {
    footer.innerHTML = "© " + year + " SenYouAI / 千夕 雅プロジェクト";
  } else {
    footer.innerHTML = "© " + year + " SenYouAI / 愛玩王姫 & 千夕 雅 プロジェクト";
  }
}

function initRevealObserver() {
  if (typeof IntersectionObserver === "undefined") return;
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px 100px 0px" });
}

function registerRevealTargets(root) {
  if (!revealObserver || !root) return;
  root.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        revealObserver.observe(el);
      }
    }
  });
}

function renderPage(pageId) {
  const app = document.getElementById("app");
  if (!app || !globalData) return;

  const { site, artists, music, novels, stamps, news } = globalData;
  app.innerHTML = "";

  let root;
  if (pageId === "home") root = renderHome(site, artists, music, novels, stamps, news);
  else if (pageId === "music") root = renderMusic(artists, music, currentArtistFilter);
  else if (pageId === "novels") root = renderNovels(novels);
  else if (pageId === "stamps") root = renderStamps(stamps);
  else if (pageId === "about") root = renderAbout(artists, currentArtistFilter);
  else {
    root = document.createElement("div");
    root.innerHTML = "<p>ページが見つかりません。</p>";
  }

  app.appendChild(root);
  renderNav(site.nav);
  setActiveNav(pageId);
  updateFooter();
  registerRevealTargets(app);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== 統合Latestセクション用：全コンテンツを日付順にマージ =====
function getAllLatestItems(music, novels, stamps, filterArtistId) {
  const items = [];
  
  // Music items
  const allTracks = (music.sections || []).flatMap((s) => s.items || []);
  let tracks = filterArtistId ? allTracks.filter(t => t.artistId === filterArtistId) : allTracks;
  tracks.forEach(track => {
    items.push({
      type: "music",
      date: track.releaseDate || "1900-01-01",
      data: track
    });
  });
  
  // Novel items (フィルタなしの場合のみ)
  if (!filterArtistId) {
    const allNovels = (novels.sections || []).flatMap(s => s.items || []);
    allNovels.forEach(novel => {
      items.push({
        type: "novel",
        date: novel.date || novel.releaseDate || "1900-01-01",
        data: novel
      });
    });
  }
  
  // Stamp items (フィルタなしの場合のみ)
  if (!filterArtistId) {
    const allStamps = (stamps.sections || []).flatMap(s => s.items || []);
    allStamps.forEach(stamp => {
      items.push({
        type: "stamp",
        date: stamp.date || stamp.releaseDate || "1900-01-01",
        data: stamp
      });
    });
  }
  
  // 日付で降順ソート（新しいものが先）
  items.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
  
  return items;
}

function renderHome(site, artists, music, novels, stamps, news) {
  const root = document.createElement("div");
  const filterArtistId = currentArtistFilter;
  let filteredArtists = artists.items || [];
  
  if (filterArtistId) {
    filteredArtists = filteredArtists.filter(a => a.id === filterArtistId);
  }

  const hero = document.createElement("section");
  hero.className = "hero reveal";
  
  const currentArtist = filterArtistId ? getArtistById(artists, filterArtistId) : null;
  const heroTitle = currentArtist 
    ? currentArtist.name + " Official" 
    : "愛玩王姫 & 千夕 雅 Official";
  const heroTagline = currentArtist ? currentArtist.bio : site.tagline;
  
  hero.innerHTML = `
    <div class="hero-main">
      <div class="hero-kicker">SenYouAI Studio</div>
      <h1 class="hero-title">${escapeHtml(heroTitle)}</h1>
      <p class="hero-tagline">${escapeHtml(heroTagline)}</p>
      <div class="hero-actions">
        <button class="button button-primary" data-jump="music">最新曲を聴く</button>
        ${filterArtistId ? "" : "<button class=\"button button-ghost\" data-jump=\"novels\">物語を読む</button>"}
      </div>
    </div>
    <div class="hero-side">
      <div class="hero-side-title">ARTISTS</div>
      <div class="hero-artist-grid">
        ${filteredArtists.map((a) => `
          <button class="hero-artist-card hero-artist-card--${escapeHtml(a.id)}" data-artist-id="${escapeHtml(a.id)}">
            <div class="hero-artist-avatar ${a.id === "chiya_masa" ? "hero-artist-avatar--alt" : ""}" style="background-image: url('${escapeHtml(a.cover || "")}');"></div>
            <div class="hero-artist-text">
              <div class="hero-artist-name">${escapeHtml(a.name)}</div>
              <div class="hero-artist-role">${escapeHtml(a.role || "")}</div>
              <div class="hero-artist-meta">SenYouAI Project</div>
            </div>
          </button>
        `).join("")}
      </div>
    </div>
  `;
  root.appendChild(hero);

  hero.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-jump");
      if (target === "music") currentArtistFilter = null;
      renderPage(target);
    });
  });

  hero.querySelectorAll(".hero-artist-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentArtistFilter = btn.dataset.artistId || null;
      renderPage("home");
    });
  });

  // News section (フィルタなしの場合のみ)
  if (!filterArtistId && news?.items?.length > 0) {
    const newsSection = document.createElement("section");
    newsSection.className = "section section-news reveal";
    newsSection.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">NEWS</h2>
        <div class="section-subtitle">お知らせ・最新情報</div>
      </div>
    `;
    
    const newsContainer = document.createElement("div");
    newsContainer.className = "news-container";
    
    news.items.slice(0, 5).forEach((item) => {
      const newsCard = document.createElement("div");
      newsCard.className = "news-card";
      newsCard.innerHTML = `
        <div class="news-date">
          <span class="news-icon">${escapeHtml(item.icon || "📢")}</span>
          <span class="news-date-text">${escapeHtml(item.date)}</span>
        </div>
        <div class="news-content">
          <div class="news-title">${escapeHtml(item.title)}</div>
          ${item.description ? `<div class="news-description">${escapeHtml(item.description)}</div>` : ""}
        </div>
      `;
      
      if (item.link) {
        newsCard.style.cursor = "pointer";
        newsCard.addEventListener("click", () => {
          if (item.link.startsWith("#")) renderPage(item.link.substring(1));
          else window.open(item.link, "_blank");
        });
      }
      newsContainer.appendChild(newsCard);
    });
    
    newsSection.appendChild(newsContainer);
    root.appendChild(newsSection);
  }

  // ===== 統合 Latest セクション =====
  const latestSection = document.createElement("section");
  latestSection.className = "section reveal";
  latestSection.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Latest</h2>
      <div class="section-subtitle">最新コンテンツ</div>
    </div>
  `;
  const latestGrid = document.createElement("div");
  latestGrid.className = "card-grid";

  // 全コンテンツを日付順に取得
  const allLatest = getAllLatestItems(music, novels, stamps, filterArtistId);
  
  // 上位6件を表示
  allLatest.slice(0, 6).forEach((item) => {
    if (item.type === "music") {
      latestGrid.appendChild(createMusicCard(item.data, artists));
    } else if (item.type === "novel") {
      latestGrid.appendChild(createNovelCard(item.data));
    } else if (item.type === "stamp") {
      latestGrid.appendChild(createStampCard(item.data));
    }
  });

  latestSection.appendChild(latestGrid);
  root.appendChild(latestSection);

  return root;
}

function renderMusic(artists, music, artistFilter) {
  const root = document.createElement("div");
  const header = document.createElement("header");
  header.className = "page-header reveal";

  let subtitle = "配信リンクと歌詞をまとめる楽曲一覧ページです。";
  let artistName = "";
  if (artistFilter) {
    const artist = getArtistById(artists, artistFilter);
    if (artist) {
      artistName = artist.name;
      subtitle = artistName + " 名義の楽曲一覧です。";
    }
  }

  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">Music ${artistName ? `<span class="page-header-filter">/ ${escapeHtml(artistName)}</span>` : ""}</h1>
    <p class="page-header-subtitle">${escapeHtml(subtitle)}</p>
  `;
  appendPlaylistRow(header, artists, artistFilter);
  root.appendChild(header);

  const sec = document.createElement("section");
  sec.className = "section reveal";
  sec.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">All Tracks</h2>
      <div class="section-subtitle">${artistName ? escapeHtml(artistName) + " のシングル" : "シングル一覧"}</div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "card-grid";

  const allTracks = (music.sections || []).flatMap((s) => s.items || []);
  const tracks = artistFilter ? allTracks.filter((t) => t.artistId === artistFilter) : allTracks;

  tracks.forEach((track) => grid.appendChild(createMusicCard(track, artists)));

  if (!tracks.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "まだ楽曲が登録されていません。";
    sec.appendChild(empty);
  }

  sec.appendChild(grid);
  root.appendChild(sec);
  return root;
}

function appendPlaylistRow(headerEl, artists, artistFilter) {
  if (!headerEl || !artists?.items) return;
  let targetArtist = artistFilter 
    ? getArtistById(artists, artistFilter)
    : artists.items.find(a => a.playlists && Object.keys(a.playlists).length > 0);

  if (!targetArtist?.playlists) return;

  const row = document.createElement("div");
  row.className = "page-header-playlists";
  
  const label = document.createElement("span");
  label.className = "page-header-playlists-label";
  label.textContent = targetArtist.name + " Playlist";
  row.appendChild(label);

  const addLink = (key, text, cls) => {
    const url = targetArtist.playlists[key];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "playlist-link " + cls;
    a.textContent = text;
    row.appendChild(a);
  };

  addLink("spotify", "Spotify", "playlist-link--spotify");
  addLink("appleMusic", "Apple Music", "playlist-link--apple");
  addLink("amazonMusic", "Amazon Music", "playlist-link--amazon");
  addLink("youtubeMusic", "YouTube Music", "playlist-link--ytmusic");
  headerEl.appendChild(row);
}

function renderNovels(novels) {
  const root = document.createElement("div");
  const header = document.createElement("header");
  header.className = "page-header reveal";
  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">Novel</h1>
    <p class="page-header-subtitle">愛玩王姫の物語やラノベ企画の概要をまとめるページです。</p>
  `;
  root.appendChild(header);

  const sec = document.createElement("section");
  sec.className = "section reveal";
  sec.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Projects</h2>
      <div class="section-subtitle">進行中のラノベ企画</div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "card-grid";
  (novels.sections || []).flatMap(s => s.items || []).forEach(novel => grid.appendChild(createNovelCard(novel)));
  sec.appendChild(grid);
  root.appendChild(sec);
  return root;
}

function renderStamps(stamps) {
  const root = document.createElement("div");
  const header = document.createElement("header");
  header.className = "page-header reveal";
  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">LINEスタンプ</h1>
    <p class="page-header-subtitle">愛玩王姫のLINEスタンプへのリンクをまとめるページです。</p>
  `;
  root.appendChild(header);

  const sec = document.createElement("section");
  sec.className = "section reveal";
  sec.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Stamp Packs</h2>
      <div class="section-subtitle">公開中のスタンプ</div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "card-grid";
  (stamps.sections || []).flatMap(s => s.items || []).forEach(stamp => grid.appendChild(createStampCard(stamp)));
  sec.appendChild(grid);
  root.appendChild(sec);
  return root;
}

function renderAbout(artists, filterArtistId) {
  const root = document.createElement("div");
  const header = document.createElement("header");
  header.className = "page-header reveal";
  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">About</h1>
    <p class="page-header-subtitle">SenYouAI Studio と、その中の人たちの紹介ページです。</p>
  `;
  root.appendChild(header);

  const sec = document.createElement("section");
  sec.className = "section reveal";
  sec.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Artists</h2>
      <div class="section-subtitle">所属アーティスト</div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "card-grid";

  const filteredArtists = filterArtistId
    ? (artists.items || []).filter(a => a.id === filterArtistId)
    : (artists.items || []);

  filteredArtists.forEach((a) => {
    const card = document.createElement("article");
    card.className = "card card--media reveal";

    const cover = document.createElement("div");
    cover.className = "card-cover card-cover--top";
    if (a.cover) {
      cover.style.backgroundImage = "url('" + a.cover + "')";
      cover.style.backgroundSize = "cover";
      cover.style.backgroundPosition = "center";
    }
    card.appendChild(cover);

    const body = document.createElement("div");
    body.className = "card-body";

    const titleEl = document.createElement("div");
    titleEl.className = "card-title";
    titleEl.textContent = a.name;
    body.appendChild(titleEl);

    if (a.role) {
      const roleEl = document.createElement("div");
      roleEl.className = "card-meta";
      roleEl.textContent = a.role;
      body.appendChild(roleEl);
    }

    if (a.bio) {
      const bioEl = document.createElement("p");
      bioEl.className = "card-meta card-meta--bio";
      bioEl.textContent = a.bio;
      body.appendChild(bioEl);
    }

    card.appendChild(body);
    grid.appendChild(card);
  });

  sec.appendChild(grid);
  root.appendChild(sec);
  return root;
}

function getArtistById(artists, id) {
  return (artists.items || []).find((a) => a.id === id) || null;
}

function createMusicCard(track, artists) {
  const artist = getArtistById(artists, track.artistId);
  const status = track.status || "released";

  const card = document.createElement("article");
  card.className = "card card--media card--music reveal";
  if (status === "coming") card.classList.add("card--coming");
  if (artist) card.classList.add(artist.id === "chiya_masa" ? "card--artist-miyabi" : "card--artist-ouki");

  const cover = document.createElement("div");
  cover.className = "card-cover card-cover--top";
  if (track.cover) {
    cover.style.backgroundImage = "url('" + track.cover + "')";
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "card-body";

  // タイプバッジ
  const typeBadge = document.createElement("div");
  typeBadge.className = "card-type-badge card-type-badge--music";
  typeBadge.textContent = "🎵 Music";
  body.appendChild(typeBadge);

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = track.title;
  body.appendChild(titleEl);

  const metaEl = document.createElement("div");
  metaEl.className = "card-meta";
  let dateLabel = track.releaseDate || "";
  if (status === "coming" && dateLabel) dateLabel += "（予定）";
  
  if (artist?.artistPageUrl) {
    const artistLink = document.createElement("a");
    artistLink.href = artist.artistPageUrl;
    artistLink.className = "artist-link";
    artistLink.textContent = artist.name;
    metaEl.appendChild(artistLink);
    if (dateLabel) metaEl.appendChild(document.createTextNode(" ／ " + dateLabel));
  } else {
    metaEl.textContent = [artist?.name || "", dateLabel].filter(Boolean).join(" ／ ");
  }
  body.appendChild(metaEl);

  // Spotify player
  if (track.spotifyEmbed?.trim()) {
    const spotifyContainer = document.createElement("div");
    spotifyContainer.className = "card-spotify";
    
    const spotifyLabel = document.createElement("div");
    spotifyLabel.className = "card-spotify-label";
    spotifyLabel.textContent = "Spotifyで試聴";
    spotifyContainer.appendChild(spotifyLabel);
    
    const spotifyIframe = document.createElement("iframe");
    spotifyIframe.src = track.spotifyEmbed;
    spotifyIframe.loading = "lazy";
    spotifyIframe.allow = "encrypted-media";
    spotifyContainer.appendChild(spotifyIframe);
    body.appendChild(spotifyContainer);
  }

  if (track.tags?.length) {
    const chipRow = document.createElement("div");
    chipRow.className = "chip-row";
    track.tags.forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = t;
      chipRow.appendChild(chip);
    });
    body.appendChild(chipRow);
  }

  if (track.note || track.lyricsPreview) {
    const desc = document.createElement("p");
    desc.className = "card-meta";
    desc.textContent = track.note || track.lyricsPreview;
    body.appendChild(desc);
  }

  // Lyrics toggle
  if (track.lyrics?.trim()) {
    const toggleRow = document.createElement("div");
    toggleRow.className = "card-lyrics-toggle-row";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "button button-ghost button-lyrics-toggle";
    toggleBtn.textContent = "歌詞を表示";

    const lyricsEl = document.createElement("div");
    lyricsEl.className = "card-lyrics";
    lyricsEl.innerHTML = track.lyrics.split(/\r?\n/).map(line => escapeHtml(line)).join("<br>");

    toggleBtn.addEventListener("click", () => {
      const open = card.classList.toggle("card--lyrics-open");
      toggleBtn.textContent = open ? "歌詞を閉じる" : "歌詞を表示";
    });

    toggleRow.appendChild(toggleBtn);
    body.appendChild(toggleRow);
    body.appendChild(lyricsEl);
  }

  const linkRow = document.createElement("div");
  linkRow.className = "link-row";
  if (track.links) {
    Object.entries(track.links).filter(([, url]) => !!url).forEach(([label, url]) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "ghost-link";
      a.textContent = label;
      linkRow.appendChild(a);
    });
  }
  body.appendChild(linkRow);
  card.appendChild(body);
  return card;
}

function createNovelCard(novel) {
  const card = document.createElement("article");
  card.className = "card card--media card--novel reveal";

  const cover = document.createElement("div");
  cover.className = "card-cover card-cover--top";
  if (novel.cover) {
    cover.style.backgroundImage = "url('" + novel.cover + "')";
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "card-body";

  // タイプバッジ
  const typeBadge = document.createElement("div");
  typeBadge.className = "card-type-badge card-type-badge--novel";
  typeBadge.textContent = "📖 Novel";
  body.appendChild(typeBadge);

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = novel.title;
  body.appendChild(titleEl);

  if (novel.subtitle) {
    const subEl = document.createElement("div");
    subEl.className = "card-meta";
    subEl.textContent = novel.subtitle;
    body.appendChild(subEl);
  }

  if (novel.date) {
    const dateEl = document.createElement("div");
    dateEl.className = "card-meta";
    dateEl.textContent = novel.date;
    body.appendChild(dateEl);
  }

  if (novel.description) {
    const desc = document.createElement("p");
    desc.className = "card-meta";
    desc.textContent = novel.description;
    body.appendChild(desc);
  }

  if (novel.links) {
    const linkRow = document.createElement("div");
    linkRow.className = "link-row";
    if (novel.links.narou) {
      const a = document.createElement("a");
      a.href = novel.links.narou;
      a.target = "_blank";
      a.className = "ghost-link";
      a.textContent = "小説サイト";
      linkRow.appendChild(a);
    }
    if (novel.links.kindle) {
      const a = document.createElement("a");
      a.href = novel.links.kindle;
      a.target = "_blank";
      a.className = "ghost-link";
      a.textContent = "Kindle";
      linkRow.appendChild(a);
    }
    body.appendChild(linkRow);
  }
  card.appendChild(body);
  return card;
}

function createStampCard(stamp) {
  const card = document.createElement("article");
  card.className = "card card--media card--stamp reveal";

  const cover = document.createElement("div");
  cover.className = "card-cover card-cover--top";
  if (stamp.cover) {
    cover.style.backgroundImage = "url('" + stamp.cover + "')";
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "card-body";

  // タイプバッジ
  const typeBadge = document.createElement("div");
  typeBadge.className = "card-type-badge card-type-badge--stamp";
  typeBadge.textContent = "🎨 LINE Stamp";
  body.appendChild(typeBadge);

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = stamp.title;
  body.appendChild(titleEl);

  if (stamp.date) {
    const dateEl = document.createElement("div");
    dateEl.className = "card-meta";
    dateEl.textContent = stamp.date;
    body.appendChild(dateEl);
  }

  if (stamp.description) {
    const desc = document.createElement("p");
    desc.className = "card-meta";
    desc.textContent = stamp.description;
    body.appendChild(desc);
  }

  if (stamp.tags?.length) {
    const chipRow = document.createElement("div");
    chipRow.className = "chip-row";
    stamp.tags.forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = t;
      chipRow.appendChild(chip);
    });
    body.appendChild(chipRow);
  }

  const linkRow = document.createElement("div");
  linkRow.className = "link-row";
  if (stamp.listUrl) {
    const a = document.createElement("a");
    a.href = stamp.listUrl;
    a.target = "_blank";
    a.className = "ghost-link";
    a.textContent = "作者スタンプ一覧";
    linkRow.appendChild(a);
  }
  if (stamp.detailUrl) {
    const a = document.createElement("a");
    a.href = stamp.detailUrl;
    a.target = "_blank";
    a.className = "ghost-link";
    a.textContent = "このスタンプを見る";
    linkRow.appendChild(a);
  }
  body.appendChild(linkRow);
  card.appendChild(body);
  return card;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
