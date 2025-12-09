let globalData = null;
let revealObserver = null;
let currentArtistFilter = null;

// ---------- Data loading ----------

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error("Failed to load " + path + " (" + res.status + ")");
  }
  return res.json();
}

async function loadAllData() {
  const [site, artists, music, novels, stamps, news] = await Promise.all([
    loadJson("data/site.json"),
    loadJson("data/artists.json"),
    loadJson("data/music.json"),
    loadJson("data/novels.json"),
    loadJson("data/stamps.json"),
    loadJson("data/news.json").catch(() => ({ items: [] })), // Newsがない場合は空配列
  ]);
  return { site, artists, music, novels, stamps, news };
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

  try {
    globalData = await loadAllData();
    applySiteMeta(globalData.site);
    renderNav(globalData.site.nav);

    initRevealObserver();

    // アーティストフィルタを window.__ARTIST_FILTER__ から取得
    const filterFromPage = window.__ARTIST_FILTER__ || null;
    const initial = parseInitialState();
    
    // ページにフィルタが設定されている場合は優先
    currentArtistFilter = filterFromPage || initial.artistId;
    
    renderPage(initial.pageId);
  } catch (err) {
    console.error(err);
    if (app) {
      app.innerHTML = "<p>データの読み込みに失敗しました。</p>";
    }
  }
});

// ---------- URL helpers ----------

function parseInitialState() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace("#", "");
  const allPages = ["home", "music", "novels", "stamps", "about"];

  let pageId = params.get("page") || hash;
  if (!allPages.includes(pageId)) {
    pageId = "home";
  }

  const artistId = params.get("artist") || null;
  return { pageId, artistId };
}

// ---------- Meta / nav ----------

function applySiteMeta(site) {
  document.title = site.title || document.title;
  const theme = site.theme || "dark";
  const season = site.season || "default";
  document.body.dataset.theme = theme;
  document.body.dataset.season = season;
}

function renderNav(navItems) {
  const navRoot = document.getElementById("site-nav");
  if (!navRoot) return;

  navRoot.innerHTML = "";

  navItems.forEach((item, index) => {
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
    if (target === pageId) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });
}

// ---------- Reveal animation ----------

function initRevealObserver() {
  if (typeof IntersectionObserver === "undefined") return;
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { 
      threshold: 0.1,
      rootMargin: "0px 0px 100px 0px" // 下方向に100px早めに表示開始
    }
  );
}

function registerRevealTargets(root) {
  if (!revealObserver || !root) return;
  root.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      // 初期表示時にビューポート内にある要素は即座に表示
      const rect = el.getBoundingClientRect();
      const isInitiallyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInitiallyVisible) {
        el.classList.add("is-visible");
      } else {
        revealObserver.observe(el);
      }
    }
  });
}

// ---------- Page rendering ----------

function renderPage(pageId) {
  const app = document.getElementById("app");
  if (!app || !globalData) return;

  const { site, artists, music, novels, stamps, news } = globalData;
  app.innerHTML = "";

  let root;
  if (pageId === "home") {
    root = renderHome(site, artists, music, novels, stamps, news);
  } else if (pageId === "music") {
    root = renderMusic(artists, music, currentArtistFilter);
  } else if (pageId === "novels") {
    root = renderNovels(novels);
  } else if (pageId === "stamps") {
    root = renderStamps(stamps);
  } else if (pageId === "about") {
    root = renderAbout(artists);
  } else {
    root = document.createElement("div");
    root.innerHTML = "<p>ページが見つかりません。</p>";
  }

  app.appendChild(root);
  setActiveNav(pageId);
  registerRevealTargets(app);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Home ----------

function renderHome(site, artists, music, novels, stamps, news) {
  const root = document.createElement("div");
  
  // アーティストフィルタが設定されている場合、フィルタリング
  const filterArtistId = currentArtistFilter;
  let filteredArtists = artists.items || [];
  
  if (filterArtistId) {
    filteredArtists = filteredArtists.filter(a => a.id === filterArtistId);
  }

  const hero = document.createElement("section");
  hero.className = "hero reveal";
  
  // フィルタされている場合はタイトルを変更
  const currentArtist = filterArtistId ? getArtistById(artists, filterArtistId) : null;
  const heroTitle = currentArtist 
    ? `${currentArtist.name} Official` 
    : "愛玩王姫 & 千夕 雅 Official";
  const heroTagline = currentArtist ? currentArtist.bio : site.tagline;
  
  hero.innerHTML = `
    <div class="hero-main">
      <div class="hero-kicker">SenYouAI Studio</div>
      <h1 class="hero-title">${escapeHtml(heroTitle)}</h1>
      <p class="hero-tagline">${escapeHtml(heroTagline)}</p>
      <div class="hero-actions">
        <button class="button button-primary" data-jump="music">最新曲を聴く</button>
        ${filterArtistId ? '' : '<button class="button button-ghost" data-jump="novels">物語を読む</button>'}
      </div>
    </div>
    <div class="hero-side">
      <div class="hero-side-title">ARTISTS</div>
      <div class="hero-artist-grid">
        ${filteredArtists
          .map(
            (a, index) => `
          <button class="hero-artist-card hero-artist-card--${escapeHtml(
            a.id
          )}" data-artist-id="${escapeHtml(a.id)}">
            <div class="hero-artist-avatar ${
              a.id === 'chiya_masa' ? "hero-artist-avatar--alt" : ""
            }" style="background-image: url('${escapeHtml(a.cover || '')}');"></div>
            <div class="hero-artist-text">
              <div class="hero-artist-name">${escapeHtml(a.name)}</div>
              <div class="hero-artist-role">${escapeHtml(a.role || "")}</div>
              <div class="hero-artist-meta">SenYouAI Project</div>
            </div>
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
  root.appendChild(hero);

  // hero 内ショートカットをナビに接続
  hero.querySelectorAll(".pill--nav").forEach((btn) => {
    const target = btn.dataset.navTarget;
    if (!target) return;
    btn.addEventListener("click", () => {
      renderPage(target);
    });
  });

  // Hero buttons
  hero.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-jump");
      if (!target) return;
      if (target === "music") {
        currentArtistFilter = null;
      }
      renderPage(target);
    });
  });

  // Artist cards -> Music page with filter
  hero.querySelectorAll(".hero-artist-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const artistId = btn.dataset.artistId || null;
      currentArtistFilter = artistId;
      renderPage("music");
    });
  });

  // News section（フィルタなしの場合のみ）
  if (!filterArtistId && news && news.items && news.items.length > 0) {
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
    
    // 最新5件を表示
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
          ${item.description ? `<div class="news-description">${escapeHtml(item.description)}</div>` : ''}
        </div>
      `;
      
      // リンクがある場合はクリック可能に
      if (item.link) {
        newsCard.style.cursor = "pointer";
        newsCard.addEventListener("click", () => {
          if (item.link.startsWith("#")) {
            const pageId = item.link.substring(1);
            renderPage(pageId);
          } else {
            window.open(item.link, "_blank");
          }
        });
      }
      
      newsContainer.appendChild(newsCard);
    });
    
    newsSection.appendChild(newsContainer);
    root.appendChild(newsSection);
  }

  // Latest Music section
  const latestMusicSection = document.createElement("section");
  latestMusicSection.className = "section reveal";
  latestMusicSection.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Latest Music</h2>
      <div class="section-subtitle">最新の楽曲</div>
    </div>
  `;
  const musicGrid = document.createElement("div");
  musicGrid.className = "card-grid";

  // アーティストフィルタを適用
  let allTracks = (music.sections || []).flatMap((s) => s.items || []);
  if (filterArtistId) {
    allTracks = allTracks.filter(t => t.artistId === filterArtistId);
  }
  
  // 最新3曲を表示
  const latestTracks = allTracks.slice(0, 3);
  latestTracks.forEach((track) => {
    musicGrid.appendChild(createMusicCard(track, artists));
  });

  latestMusicSection.appendChild(musicGrid);
  root.appendChild(latestMusicSection);

  // Latest Novels & Stamps section（フィルタなしの場合のみ）
  if (!filterArtistId) {
    const latestOthersSection = document.createElement("section");
    latestOthersSection.className = "section reveal";
    latestOthersSection.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Latest Novels & Stamps</h2>
        <div class="section-subtitle">最新の小説・スタンプ</div>
      </div>
    `;
    const othersGrid = document.createElement("div");
    othersGrid.className = "card-grid";

    const latestNovel = (novels.items || [])[0];
    if (latestNovel) {
      othersGrid.appendChild(createNovelCard(latestNovel));
    }

    const latestStamp = (stamps.items || [])[0];
    if (latestStamp) {
      othersGrid.appendChild(createStampCard(latestStamp));
    }
    
    latestOthersSection.appendChild(othersGrid);
    root.appendChild(latestOthersSection);
  }

  return root;
}

// ---------- Music ----------

function renderMusic(artists, music, artistFilter) {
  const root = document.createElement("div");

  const header = document.createElement("header");
  header.className = "page-header reveal";

  let subtitle = "配信リンクと歌詞（予定）をまとめる楽曲一覧ページです。";
  let artistName = "";
  if (artistFilter) {
    const artist = getArtistById(artists, artistFilter);
    if (artist) {
      artistName = artist.name;
      subtitle = `${artist.name} 名義の楽曲一覧です。`;
    }
  }

  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">Music ${
      artistName ? `<span class="page-header-filter">/ ${escapeHtml(artistName)}</span>` : ""
    }</h1>
    <p class="page-header-subtitle">${escapeHtml(subtitle)}</p>
  `;

  // プレイリストリンク行を追加（対応しているアーティストのみ）
  appendPlaylistRow(header, artists, artistFilter);

  root.appendChild(header);

  const sec = document.createElement("section");
  sec.className = "section reveal";
  sec.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">All Tracks</h2>
      <div class="section-subtitle">${
        artistName ? `${escapeHtml(artistName)} のシングル` : "シングル一覧"
      }</div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "card-grid";

  const allTracks = (music.sections || []).flatMap((s) => s.items || []);
  const tracks = artistFilter
    ? allTracks.filter((t) => t.artistId === artistFilter)
    : allTracks;

  tracks.forEach((track) => {
    grid.appendChild(createMusicCard(track, artists));
  });

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

// Music ヘッダにプレイリスト行を追加するヘルパー
function appendPlaylistRow(headerEl, artists, artistFilter) {
  if (!headerEl || !artists || !artists.items) return;

  let targetArtist = null;

  if (artistFilter) {
    targetArtist = getArtistById(artists, artistFilter);
  } else {
    // フィルタがない場合は、プレイリストを持っている最初のアーティスト（今は王姫）を表示
    targetArtist = (artists.items || []).find(
      (a) => a.playlists && Object.keys(a.playlists).length > 0
    );
  }

  if (!targetArtist || !targetArtist.playlists) return;

  const playlists = targetArtist.playlists;
  const row = document.createElement("div");
  row.className = "page-header-playlists";

  const label = document.createElement("span");
  label.className = "page-header-playlists-label";
  label.textContent = `${targetArtist.name} Playlist`;
  row.appendChild(label);

  function addLink(key, labelText, extraClass) {
    const url = playlists[key];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "playlist-link" + (extraClass ? " " + extraClass : "");
    a.textContent = labelText;
    row.appendChild(a);
  }

  addLink("spotify", "Spotify", "playlist-link--spotify");
  addLink("appleMusic", "Apple Music", "playlist-link--apple");
  addLink("amazonMusic", "Amazon Music", "playlist-link--amazon");
  addLink("youtubeMusic", "YouTube Music", "playlist-link--ytmusic");

  headerEl.appendChild(row);
}

// ---------- Novels ----------

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

  (novels.items || []).forEach((novel) => {
    grid.appendChild(createNovelCard(novel));
  });

  sec.appendChild(grid);
  root.appendChild(sec);

  return root;
}

// ---------- Stamps ----------

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

  (stamps.items || []).forEach((stamp) => {
    grid.appendChild(createStampCard(stamp));
  });

  sec.appendChild(grid);
  root.appendChild(sec);

  return root;
}

// ---------- About ----------

function renderAbout(artists) {
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

  (artists.items || []).forEach((a) => {
    const card = document.createElement("article");
    card.className = "card card--media reveal";

    const cover = document.createElement("div");
    cover.className = "card-cover card-cover--top";
    if (a.cover) {
      cover.style.backgroundImage = `url('${a.cover}')`;
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

// ---------- Card helpers ----------

function getArtistById(artists, id) {
  return (artists.items || []).find((a) => a.id === id) || null;
}

function createMusicCard(track, artists) {
  const artist = getArtistById(artists, track.artistId);
  const status = track.status || "released";

  const card = document.createElement("article");
  card.className = "card card--media card--music reveal";
  if (status === "coming") {
    card.classList.add("card--coming");
  }
  if (artist) {
    if (artist.id === "chiya_masa") {
      card.classList.add("card--artist-miyabi");
    } else {
      card.classList.add("card--artist-ouki");
    }
  }

  // カバー画像（常にPNG画像を表示）
  const cover = document.createElement("div");
  cover.className = "card-cover card-cover--top";
  if (track.cover) {
    cover.style.backgroundImage = `url('${track.cover}')`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "card-body";

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = track.title;
  body.appendChild(titleEl);

  const metaEl = document.createElement("div");
  metaEl.className = "card-meta";
  let dateLabel = track.releaseDate || "";
  if (status === "coming" && dateLabel) {
    dateLabel += "（予定）";
  }
  
  // アーティスト名をリンク可能に
  if (artist && artist.artistPageUrl) {
    const artistLink = document.createElement("a");
    artistLink.href = artist.artistPageUrl;
    artistLink.className = "artist-link";
    artistLink.textContent = artist.name;
    metaEl.appendChild(artistLink);
    
    if (dateLabel) {
      metaEl.appendChild(document.createTextNode(" ／ " + dateLabel));
    }
  } else {
    const artistName = artist ? artist.name : "";
    metaEl.textContent = [artistName, dateLabel].filter(Boolean).join(" ／ ");
  }
  
  body.appendChild(metaEl);

  // Spotifyコンパクトプレーヤー（spotifyEmbed がある場合だけ）
  if (track.spotifyEmbed && track.spotifyEmbed.trim().length > 0) {
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

  if (track.tags && track.tags.length) {
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

  // 歌詞トグル（track.lyrics がある場合だけ）
  const rawLyrics = track.lyrics;
  const hasLyrics =
    rawLyrics != null && String(rawLyrics).trim().length > 0;

  if (hasLyrics) {
    const toggleRow = document.createElement("div");
    toggleRow.className = "card-lyrics-toggle-row";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "button button-ghost button-lyrics-toggle";
    toggleBtn.textContent = "歌詞を表示";

    const lyricsEl = document.createElement("div");
    lyricsEl.className = "card-lyrics";

    const lyricsHtml = String(rawLyrics)
      .split(/\r?\n/)
      .map((line) => escapeHtml(line))
      .join("<br>");
    lyricsEl.innerHTML = lyricsHtml;

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
    Object.entries(track.links)
      .filter(([, url]) => !!url)
      .forEach(([label, url]) => {
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
  card.className = "card card--media reveal";

  const cover = document.createElement("div");
  cover.className = "card-cover card-cover--top";
  if (novel.cover) {
    cover.style.backgroundImage = `url('${novel.cover}')`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "card-body";

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
      a.rel = "noopener noreferrer";
      a.className = "ghost-link";
      a.textContent = "小説サイト";
      linkRow.appendChild(a);
    }
    if (novel.links.kindle) {
      const a = document.createElement("a");
      a.href = novel.links.kindle;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "ghost-link";
      a.textContent = "Kindle";
      linkRow.appendChild(a);
    }
    if (novel.links.other) {
      const a = document.createElement("a");
      a.href = novel.links.other;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "ghost-link";
      a.textContent = "Other";
      linkRow.appendChild(a);
    }
    body.appendChild(linkRow);
  }

  card.appendChild(body);
  return card;
}

function createStampCard(stamp) {
  const card = document.createElement("article");
  card.className = "card card--media reveal";

  const cover = document.createElement("div");
  cover.className = "card-cover card-cover--top";
  if (stamp.cover) {
    cover.style.backgroundImage = `url('${stamp.cover}')`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "card-body";

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = stamp.title;
  body.appendChild(titleEl);

  const metaEl = document.createElement("div");
  metaEl.className = "card-meta";
  metaEl.textContent = "LINEスタンプ";
  body.appendChild(metaEl);

  if (stamp.description) {
    const desc = document.createElement("p");
    desc.className = "card-meta";
    desc.textContent = stamp.description;
    body.appendChild(desc);
  }

  if (stamp.tags && stamp.tags.length) {
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
    a.rel = "noopener noreferrer";
    a.className = "ghost-link";
    a.textContent = "作者スタンプ一覧";
    linkRow.appendChild(a);
  }
  if (stamp.detailUrl) {
    const a = document.createElement("a");
    a.href = stamp.detailUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "ghost-link";
    a.textContent = "このスタンプを見る";
    linkRow.appendChild(a);
  }
  body.appendChild(linkRow);

  card.appendChild(body);
  return card;
}

// ---------- Utils ----------

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
