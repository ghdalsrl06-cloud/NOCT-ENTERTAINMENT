/*
  NOCT ENTERTAINMENT — main.js
  data/*.json 을 읽어서 화면을 그리고, 필터·검색·문의 폼 전송을 담당합니다.
  콘텐츠 추가는 JSON만 고치면 되고, 이 파일은 "그리는 규칙"만 담고 있어요.
*/

// ===== Google Forms 연동 =====
// 문의 내용을 구글 폼으로 전송합니다. (폼 응답 탭/스프레드시트에 쌓임)
const GOOGLE_FORM = {
  actionUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSemV4-gf_BMMy12I6Hp9KWUQwVNmME3PPRZc5eO56dmUYMLRA/formResponse",
  entries: {
    type: "entry.1112692107",    // 문의 유형
    name: "entry.710663101",     // 이름 / 회사
    contact: "entry.1648432180", // 연락처
    when: "entry.514236630",     // 희망 일정
    detail: "entry.1008244424",  // 내용
    budget: "entry.980443711",   // 예산
  },
};

// ===== 유틸 =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + " 로드 실패");
  return res.json();
}

// ===== 아티스트 =====
function renderArtists(list) {
  const root = $("#artist-list");
  root.innerHTML = list.map((a) => `
    <article class="artist-card reveal">
      <img src="${esc(a.image)}" alt="${esc(a.name)}" loading="lazy" />
      <div class="artist-body">
        <p class="eyebrow">${esc(a.role)}</p>
        <h3 class="artist-name">${esc(a.name)}<small>${esc(a.nameJa || "")}</small></h3>
        <p class="artist-role">${esc(a.tagline)}</p>
        <p class="artist-desc">${esc(a.desc)}</p>
        <div class="chips">${(a.lines || []).map((l) => `<span class="chip-tag">${esc(l)}</span>`).join("")}</div>
        <div class="link-row">
          ${Object.entries(a.links || {}).map(([k, v]) => `<a class="btn btn-sm" href="${esc(v)}" target="_blank" rel="noopener">${esc(LINK_LABEL[k] || k)}</a>`).join("")}
        </div>
      </div>
    </article>`).join("");

  // 문의 섹션 옆 링크에도 아티스트 링크 노출
  const side = $("#side-links");
  const first = list[0];
  if (side && first) {
    side.innerHTML = Object.entries(first.links || {}).map(([k, v]) => `<a class="btn btn-sm" href="${esc(v)}" target="_blank" rel="noopener">${esc(first.name)} · ${esc(LINK_LABEL[k] || k)}</a>`).join("");
  }
}
const LINK_LABEL = { site: "공식 사이트", youtube: "YouTube", spotify: "Spotify", apple: "Apple Music", instagram: "Instagram" };

// ===== 작업물 =====
const KIND_LABEL = { music: "MUSIC", webtoon: "WEBTOON", video: "VIDEO" };
function renderWorks(list) {
  const grid = $("#works-grid");
  grid.innerHTML = list.map((w) => `
    <a class="work reveal ${w.type === "webtoon" ? "wide" : ""}" data-type="${esc(w.type)}" href="${esc(w.link || "#")}" ${w.link ? 'target="_blank" rel="noopener"' : ""}>
      ${w.badge ? `<span class="work-badge">${esc(w.badge)}</span>` : ""}
      <img src="${esc(w.cover)}" alt="${esc(w.title)}" loading="lazy" />
      <div class="work-body">
        <span class="work-kind">${esc(KIND_LABEL[w.type] || w.type)}${w.line ? " · " + esc(w.line) : ""}</span>
        <div class="work-title">${esc(w.title)}</div>
        <div class="work-sub">${esc(w.subtitle || "")}${w.date ? " · " + esc(w.date) : ""}</div>
      </div>
    </a>`).join("");

  $$("#works-filter .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#works-filter .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      $$("#works-grid .work").forEach((el) => { el.hidden = f !== "all" && el.dataset.type !== f; });
    });
  });
}

// ===== 서비스 =====
function renderServices(list) {
  $("#service-grid").innerHTML = list.map((s) => `
    <article class="service reveal">
      ${s.image ? `<img class="service-img" src="${esc(s.image)}" alt="" loading="lazy" />` : `<div class="service-icon">${esc(s.icon)}</div>`}
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.desc)}</p>
      <ul>${(s.deliverables || []).map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
      <button class="btn btn-sm btn-ghost" data-contact="제작 의뢰" data-detail="[${esc(s.title)}] ">문의하기</button>
    </article>`).join("");
}

// ===== 라이선싱 카탈로그 =====
let TRACKS = [];
function renderCatalog() {
  const q = ($("#track-search").value || "").trim().toLowerCase();
  const line = $("#track-filter .chip.active")?.dataset.line || "all";
  const rows = TRACKS.filter((t) => {
    const okLine = line === "all" || t.line === line;
    const hay = [t.title, t.titleKo, t.album, t.mood, t.line].join(" ").toLowerCase();
    return okLine && (!q || hay.includes(q));
  });
  $("#catalog tbody").innerHTML = rows.map((t, i) => `
    <tr>
      <td class="muted">${String(i + 1).padStart(2, "0")}</td>
      <td class="t-title">${esc(t.title)}${t.titleKo ? `<small>${esc(t.titleKo)}</small>` : ""}</td>
      <td>${esc(t.album)}</td>
      <td class="t-line">${esc(t.line)}</td>
      <td class="muted">${esc(t.bpm)} · ${esc(t.mood)}</td>
      <td class="t-actions">
        ${t.preview ? `<a class="btn btn-sm" href="${esc(t.preview)}" target="_blank" rel="noopener">▶ 듣기</a>` : ""}
        <button class="btn btn-sm btn-primary" data-contact="음원 라이선싱" data-detail="[라이선스 문의] ${esc(t.title)} (${esc(t.album)}) — 사용처: ">문의</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="6" class="muted" style="text-align:center;padding:28px">검색 결과가 없어요.</td></tr>`;
  $("#catalog-count").textContent = `총 ${TRACKS.length}곡 중 ${rows.length}곡 표시`;
}

// ===== 스토어 =====
function renderStore(list) {
  $("#store-grid").innerHTML = list.map((p) => `
    <article class="product reveal">
      <div class="product-visual">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" />` : esc(p.icon)}</div>
      <div class="product-body">
        <span class="product-status ${p.status === "live" ? "live" : ""}">${p.status === "live" ? "AVAILABLE" : "COMING SOON"}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
        ${p.link
          ? `<a class="btn btn-sm btn-primary" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.cta || "바로가기")}</a>`
          : `<button class="btn btn-sm btn-ghost" data-contact="스토어 · 굿즈" data-detail="[출시 알림] ${esc(p.title)}">출시 알림</button>`}
      </div>
    </article>`).join("");
}

// ===== 문의 폼 =====
// data-contact / data-detail 버튼을 누르면 폼으로 스크롤하면서 유형·내용을 미리 채움
function bindContactShortcuts() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-contact]");
    if (!btn) return;
    $("#c-type").value = btn.dataset.contact;
    if (btn.dataset.detail) $("#c-detail").value = btn.dataset.detail;
    $("#contact").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#c-detail").focus(), 500);
  });
}

function showMsg(text, ok) {
  const el = $("#contact-msg");
  el.textContent = text;
  el.className = "form-msg " + (ok ? "ok" : "err");
  el.hidden = false;
}

$("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    type: $("#c-type").value,
    name: $("#c-name").value.trim(),
    contact: $("#c-contact").value.trim(),
    when: $("#c-when").value.trim() || "미정",
    detail: $("#c-detail").value.trim(),
    budget: $("#c-budget").value.trim() || "미정",
  };
  if (!data.type || !data.name || !data.contact || !data.detail) {
    showMsg("문의 유형, 이름, 연락처, 내용은 꼭 입력해주세요.", false);
    return;
  }
  const body = new FormData();
  Object.keys(data).forEach((k) => body.append(GOOGLE_FORM.entries[k], data[k]));
  fetch(GOOGLE_FORM.actionUrl, { method: "POST", mode: "no-cors", body }).catch(() => {});
  e.target.reset();
  showMsg(`${data.name}님, 문의가 접수되었어요. 영업일 기준 2~3일 안에 연락드릴게요.`, true);
});

// ===== 내비게이션 =====
const navToggle = $(".nav-toggle");
const navLinks = $(".nav-links");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.textContent = open ? "✕" : "☰";
  navToggle.setAttribute("aria-expanded", String(open));
});
$$(".nav-links a").forEach((a) => a.addEventListener("click", () => { navLinks.classList.remove("open"); navToggle.textContent = "☰"; }));

// 스크롤스파이
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    $$(".nav-links a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
$$("section[id]").forEach((s) => spy.observe(s));

// 등장 애니메이션 (동적으로 그려진 요소까지 포함하려고 렌더 후 호출)
function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$(".reveal:not(.visible)").forEach((el) => io.observe(el));
}

// =====================================================
// 미래지향 디테일
// =====================================================
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

// (2) 도쿄 실시간 시계 — 내비게이션(HH:MM)과 히어로 HUD(HH:MM:SS)
function tickClock() {
  const now = new Date();
  const fmt = (opts) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour12: false, ...opts }).format(now);
  const nav = $("#nav-clock"), hero = $("#hero-clock");
  if (nav) nav.textContent = fmt({ hour: "2-digit", minute: "2-digit" });
  if (hero) hero.textContent = fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
tickClock();
setInterval(tickClock, 1000);

// (1) 섹션 번호 01 / 07
function numberSections() {
  const secs = $$("section[id]").filter((s) => s.id !== "top");
  secs.forEach((s, i) => {
    const head = $(".section-head", s);
    if (!head) return;
    const n = document.createElement("span");
    n.className = "sec-num";
    n.textContent = `${String(i + 1).padStart(2, "0")} / ${String(secs.length).padStart(2, "0")}`;
    head.prepend(n);
  });
}
numberSections();

// (3) 히어로 별먼지 파티클
function startStars() {
  const canvas = $("#stars");
  if (!canvas || REDUCED) return;
  const ctx = canvas.getContext("2d");
  let w, h, stars = [];
  const resize = () => {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    stars = Array.from({ length: Math.round((w * h) / 22000) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: (Math.random() * 1.2 + 0.3) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.08 * devicePixelRatio, vy: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
      a: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.005,
    }));
  };
  resize();
  window.addEventListener("resize", resize);
  (function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const st of stars) {
      st.x += st.vx; st.y += st.vy; st.a += st.s;
      if (st.x < 0) st.x = w; if (st.x > w) st.x = 0;
      if (st.y < 0) st.y = h; if (st.y > h) st.y = 0;
      ctx.globalAlpha = 0.35 + Math.sin(st.a) * 0.3; // 별이 은은하게 깜빡임
      ctx.fillStyle = "#a9b8ff";
      ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(frame);
  })();
}
startStars();

// (3) 커서 스포트라이트
if (FINE_POINTER && !REDUCED) {
  const glow = $(".cursor-glow");
  document.body.classList.add("has-cursor");
  window.addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`;
  }, { passive: true });
}

// (4) 카드 틸트 + 유리 하이라이트 — 렌더된 카드에 적용
function applyTilt() {
  const cards = $$(".work, .service, .product, .tier, .duo-card, .artist-card");
  cards.forEach((card) => {
    card.classList.add("tilt");
    if (card.matches(".artist-card, .duo-card")) card.classList.add("bracket");
    if (!FINE_POINTER || REDUCED) return;
    const strength = card.matches(".artist-card, .duo-card") ? 2 : 6; // 큰 카드는 살짝만
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * strength}deg) rotateY(${(px - 0.5) * strength}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// 이미지 에셋(키비주얼·배경)을 데이터에서 주입
function applyAssets(assets) {
  if (assets.hero) document.documentElement.style.setProperty("--hero-img", `url("${assets.hero}")`);
  $$(".duo-card[data-bg]").forEach((card) => {
    const src = assets[card.dataset.bg];
    if (src) { card.style.backgroundImage = `url("${src}")`; card.classList.add("has-bg"); }
  });
}

// ===== 시작 =====
(async () => {
  try {
    const [artists, works, services, licensing, store, assets] = await Promise.all([
      loadJSON("data/artists.json"),
      loadJSON("data/works.json"),
      loadJSON("data/services.json"),
      loadJSON("data/licensing.json"),
      loadJSON("data/store.json"),
      loadJSON("data/assets.json").catch(() => ({})), // 아직 없으면 무시
    ]);
    renderArtists(artists);
    renderWorks(works);
    renderServices(services);
    TRACKS = licensing;
    renderCatalog();
    renderStore(store);
    applyAssets(assets);
    applyTilt();
    bindContactShortcuts();
    observeReveal();

    $("#track-search").addEventListener("input", renderCatalog);
    $$("#track-filter .chip").forEach((chip) => chip.addEventListener("click", () => {
      $$("#track-filter .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderCatalog();
    }));
  } catch (err) {
    console.error(err);
  }
})();
