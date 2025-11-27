let globalData = {};

const DATA_FILES = {
  site: "data/site.json",
  artists: "data/artists.json",
  music: "data/music.json",
  novels: "data/novels.json",
  stamps: "data/stamps.json"
};

async function loadData() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, path]) => {
      const res = await fetch(path);
      if (!res.ok) {
        throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      return [key, json];
    })
  );

  globalData = {};
  for (const [key, value] of entries) {
    globalData[key] = value;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  try {
    await loadData();
  } catch (err) {
    console.error(err);
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML =
        "<p style='color:#ff9191;font-size:0.9rem;'>データ(JSON)の読み込みに失敗しました。GitHub Pages やローカルの簡易サーバーなど、HTTP経由で開いているか確認してください。</p>";
    }
    return;
  }

  applySiteMeta(globalData.site);
  renderNav(globalData.site.nav);
  initRevealObserver();
  renderPage("home");
});

function applySiteMeta(site) {
  const theme = site.theme || "dark";
  const season = site.season || "default";
  document.body.dataset.theme = theme;
  document.body.dataset.season = season;
  document.title = site.title || document.title;
}

function renderNav(nav) {
  const navRoot = document.getElementById("site-nav");
  navRoot.innerHTML = "";
  nav.forEach((item, idx) => {
    const a = document.createElement("a");
    a.href = "#" + item.id;
    a.textContent = item.label;
    if (idx === 0) a.classList.add("active");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      renderPage(item.id);
    });
    navRoot.appendChild(a);
  });
}

function setActiveNav(pageId) {
  const navRoot = document.getElementById("site-nav");
  navRoot.querySelectorAll("a").forEach((a) => {
    const target = a.getAttribute("href")?.replace("#", "");
    if (target === pageId) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });
}

let revealObserver = null;

function initRevealObserver() {
  if (revealObserver) return;
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
}

function registerRevealTargets(root) {
  if (!revealObserver) return;
  root.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      revealObserver.observe(el);
    }
  });
}

function renderPage(pageId) {
  const app = document.getElementById("app");
  const { site, artists, music, novels, stamps } = globalData;
  app.innerHTML = "";

  if (pageId === "home") {
    app.appendChild(renderHome(site, artists, music, novels, stamps));
  } else if (pageId === "music") {
    app.appendChild(renderMusic(artists, music));
  } else if (pageId === "novels") {
    app.appendChild(renderNovels(novels));
  } else if (pageId === "stamps") {
    app.appendChild(renderStamps(stamps));
  } else if (pageId === "about") {
    app.appendChild(renderAbout(artists));
  }

  setActiveNav(pageId);
  registerRevealTargets(app);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Page renderers ---------- */

function renderHome(site, artists, music, novels, stamps) {
  const root = document.createElement("div");

  const hero = document.createElement("section");
  hero.className = "hero reveal";
  hero.innerHTML = `
    <div>
      <div class="hero-main-title">${site.title}</div>
      <div class="hero-tagline">${site.tagline}</div>
      <div class="hero-pills">
        <span class="pill"><span class="pill-dot"></span> Music</span>
        <span class="pill"><span class="pill-dot"></span> Novel</span>
        <span class="pill"><span class="pill-dot"></span> LINEスタンプ</span>
      </div>
    </div>
    <div>
      <div class="hero-secondary-title">ARTISTS</div>
      <div class="hero-card-grid">
        ${artists.items
          .map(
            (a) => `
          <article class="hero-artist-card">
            <div class="hero-artist-avatar"></div>
            <div>
              <div class="hero-artist-main">${a.name}</div>
              <div class="hero-artist-sub">${a.role}</div>
              <div class="hero-artist-meta">SenYouAI Project</div>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    </div>
  `;
  root.appendChild(hero);

  const section = document.createElement("section");
  section.className = "section reveal";
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Latest</h2>
      <div class="section-subtitle">最近の公開コンテンツ</div>
    </div>
  `;
  const grid = document.createElement("div");
  grid.className = "card-grid card-grid--single";

  const latestSong = music.sections[0]?.items[0];
  if (latestSong) {
    grid.appendChild(createMusicCard(latestSong, artists));
  }

  const latestNovel = novels.items[0];
  if (latestNovel) {
    grid.appendChild(createNovelCard(latestNovel));
  }

  const latestStamp = stamps.items[0];
  if (latestStamp) {
    grid.appendChild(createStampCard(latestStamp));
  }

  section.appendChild(grid);
  root.appendChild(section);

  return root;
}

function renderMusic(artists, music) {
  const root = document.createElement("div");

  const header = document.createElement("header");
  header.className = "page-header reveal";
  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">Music</h1>
    <p class="page-header-subtitle">配信リンクと歌詞（予定）をまとめる楽曲一覧ページです。</p>
  `;
  root.appendChild(header);

  const sec = document.createElement("section");
  sec.className = "section reveal";
  sec.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">All Tracks</h2>
      <div class="section-subtitle">シングル一覧</div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "card-grid card-grid--single";
  music.sections.forEach((section) => {
    section.items.forEach((track) => {
      grid.appendChild(createMusicCard(track, artists));
    });
  });
  sec.appendChild(grid);
  root.appendChild(sec);

  return root;
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
  grid.className = "card-grid card-grid--single";
  novels.items.forEach((novel) => {
    grid.appendChild(createNovelCard(novel));
  });
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
  grid.className = "card-grid card-grid--single";
  stamps.items.forEach((stamp) => {
    grid.appendChild(createStampCard(stamp));
  });
  sec.appendChild(grid);
  root.appendChild(sec);

  return root;
}

function renderAbout(artists) {
  const root = document.createElement("div");

  const header = document.createElement("header");
  header.className = "page-header reveal";
  header.innerHTML = `
    <div class="page-header-kicker">PAGE</div>
    <h1 class="page-header-title">About</h1>
    <p class="page-header-subtitle">SenYouAI Studio と、その中の人たちの簡単な紹介ページです。</p>
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
  grid.className = "card-grid card-grid--single";
  artists.items.forEach((a) => {
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

    const metaEl = document.createElement("div");
    metaEl.className = "card-meta";
    metaEl.textContent = a.role;
    body.appendChild(metaEl);

    if (a.bio) {
      const desc = document.createElement("p");
      desc.className = "card-meta";
      desc.textContent = a.bio;
      body.appendChild(desc);
    }

    card.appendChild(body);
    grid.appendChild(card);
  });
  sec.appendChild(grid);
  root.appendChild(sec);

  return root;
}

/* ---------- Card helpers ---------- */

function createMusicCard(track, artists) {
  const card = document.createElement("article");
  card.className = "card card--music reveal";

  const artist = artists.items.find((a) => a.id === track.artistId);

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
  metaEl.textContent = `${artist ? artist.name : ""} ／ ${track.releaseDate || ""}`;
  body.appendChild(metaEl);

  if (track.note || track.lyricsPreview) {
    const desc = document.createElement("p");
    desc.className = "card-meta";
    desc.textContent = track.note || track.lyricsPreview;
    body.appendChild(desc);
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

  const linkRow = document.createElement("div");
  linkRow.className = "link-row";
  if (track.links) {
    Object.entries(track.links)
      .filter(([_, url]) => url)
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
      a.className = "ghost-link";
      a.href = novel.links.narou;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "小説サイト";
      linkRow.appendChild(a);
    }
    if (novel.links.kindle) {
      const a = document.createElement("a");
      a.className = "ghost-link";
      a.href = novel.links.kindle;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Kindle";
      linkRow.appendChild(a);
    }
    if (novel.links.other) {
      const a = document.createElement("a");
      a.className = "ghost-link";
      a.href = novel.links.other;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
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
    a.className = "ghost-link";
    a.href = stamp.listUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "作者スタンプ一覧";
    linkRow.appendChild(a);
  }
  if (stamp.detailUrl) {
    const a = document.createElement("a");
    a.className = "ghost-link";
    a.href = stamp.detailUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "このスタンプを見る";
    linkRow.appendChild(a);
  }
  body.appendChild(linkRow);

  card.appendChild(body);
  return card;
}
