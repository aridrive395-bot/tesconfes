/* ============ EDIT DI SINI ============
   Bisa juga lewat link: index.html?untuk=Rani&dari=Dimas */
const P = new URLSearchParams(location.search);
const CONFIG = {
  untuk: P.get("untuk") || "Kamu",
  dari: P.get("dari") || "Aku",
  pesan: [
    "Ada hal yang sudah lama ingin kusampaikan.",
    "Setiap kali kamu tertawa, hariku terasa lebih ringan.",
    "Aku tidak pandai merangkai kata, jadi kubuatkan taman kecil ini.",
    "Karena rasanya, kamu pantas diberi bunga sebanyak ini.",
  ],
  pertanyaan: "Maukah kamu jadi pacarku?",
  tidak: ["Tidak", "Yakin?", "Coba pikir lagi", "Beneran?", "Jangan gitu dong", "Sekali ini saja", "Please…"],
  terima: "Terima kasih.",
  kata: "Mulai hari ini, biarkan aku merawat taman ini bersamamu.",
};
/* ====================================== */

const $ = (s) => document.querySelector(s);
const rand = Math.random, pick = (a) => a[(rand() * a.length) | 0];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const tampil = (id) => document.querySelectorAll(".layar").forEach((l) => l.classList.toggle("aktif", l.id === id));

$("#untuk").textContent = CONFIG.untuk;
$("#halo").textContent = CONFIG.untuk + ",";
$("#pertanyaan").textContent = CONFIG.pertanyaan;
$("#terima").textContent = CONFIG.terima;
$("#kata").textContent = CONFIG.kata;
$("#ttd").textContent = "— " + CONFIG.dari;

/* ---------- Musik: langsung diputar saat link dibuka ---------- */
const audio = $("#audio"), tm = $("#musik");
const nyala = () => tm.classList.add("main");
audio.addEventListener("canplay", () => (tm.hidden = false), { once: true });
tm.onclick = (e) => { e.stopPropagation(); if (audio.paused) { audio.play(); nyala(); } else { audio.pause(); tm.classList.remove("main"); } };
function putar() { return audio.play().then(nyala); }
// 1) coba langsung; 2) kalau diblokir browser, mulai di sentuhan/klik/tombol pertama
putar().catch(() => {
  const mulaiSuara = () => { putar().catch(() => {}); ["pointerdown", "touchstart", "keydown", "click"].forEach((ev) => removeEventListener(ev, mulaiSuara, true)); };
  ["pointerdown", "touchstart", "keydown", "click"].forEach((ev) => addEventListener(ev, mulaiSuara, true));
});

/* ---------- Alur ---------- */
$("#buka").onclick = () => {
  tampil("pesan"); setTimeout(baris, 700);
};

let i = 0, siap = false;
$("#titik").innerHTML = CONFIG.pesan.map(() => "<i></i>").join("");
function baris() {
  const el = $("#teks"), kata = CONFIG.pesan[i].split(" ");
  el.classList.remove("keluar"); el.innerHTML = "";
  kata.forEach((k, n) => { const s = document.createElement("span"); s.className = "w"; s.textContent = k; s.style.animationDelay = n * 0.13 + "s"; el.append(s); });
  document.querySelectorAll("#titik i").forEach((d, n) => d.classList.toggle("on", n === i));
  $("#lanjut").classList.remove("tampil"); siap = false;
  setTimeout(() => { siap = true; $("#lanjut").classList.add("tampil"); }, kata.length * 130 + 900);
}
$("#pesan").onclick = () => {
  if (!siap) return; siap = false;
  $("#teks").classList.add("keluar"); $("#lanjut").classList.remove("tampil");
  setTimeout(() => { if (++i >= CONFIG.pesan.length) tampil("tanya"); else baris(); }, 450);
};

/* Tombol "Tidak" yang kabur */
const ya = $("#ya"), tidak = $("#tidak"); let n = 0;
function lari(e) {
  if (e) e.preventDefault();
  n++; tidak.textContent = CONFIG.tidak[Math.min(n, CONFIG.tidak.length - 1)];
  ya.style.transform = `scale(${Math.min(1 + n * 0.12, 1.7)})`;
  tidak.style.position = "fixed"; tidak.style.margin = 0; tidak.style.zIndex = 5;
  const w = tidak.offsetWidth, h = tidak.offsetHeight, r = ya.getBoundingClientRect();
  let x, y, t = 0;
  do { x = 12 + rand() * (innerWidth - w - 24); y = 12 + rand() * (innerHeight - h - 24); t++; }
  while (t < 30 && x < r.right + 12 && x + w > r.left - 12 && y < r.bottom + 12 && y + h > r.top - 12);
  tidak.style.left = x + "px"; tidak.style.top = y + "px"; tidak.style.transition = "left .35s,top .35s";
}
tidak.addEventListener("mouseenter", lari);
tidak.addEventListener("touchstart", lari, { passive: false });
tidak.addEventListener("click", lari);

ya.onclick = () => {
  tidak.style.display = "none";
  tampil("akhir"); document.body.classList.add("pagi");
  mulaiTaman(); mode = "kelopak"; parts.length = 0;
  for (let k = 0; k < 40; k++) kelopak(true);
  setTimeout(() => $("#akhir").classList.add("muncul"), 4500);
  setTimeout(() => $("#tap").classList.add("tampil"), 9000);
  setTimeout(() => (aktifTap = true), 800);
};

/* ---------- Kanvas ---------- */
const cT = $("#taman"), xT = cT.getContext("2d"), cF = $("#fx"), xF = cF.getContext("2d");
let W, H, DPR, mode = "bokeh", parts = [], fl = [], mulai = false, aktifTap = false;
function ukuran() {
  DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  [cT, cF].forEach((c) => { c.width = W * DPR; c.height = H * DPR; });
  xT.setTransform(DPR, 0, 0, DPR, 0, 0); xF.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (mulai) susunTaman(true);
}
addEventListener("resize", ukuran); ukuran();

const mix = (hex, t) => { // t>0 terang, t<0 gelap
  const n = parseInt(hex.slice(1), 16), f = (c) => Math.round(t > 0 ? c + (255 - c) * t : c * (1 + t));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
const petal = (c, len, wid) => { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(wid, -len * 0.3, wid * 0.8, -len * 0.9, 0, -len); c.bezierCurveTo(-wid * 0.8, -len * 0.9, -wid, -len * 0.3, 0, 0); c.closePath(); };

/* ---------- Latar: cahaya & kelopak jatuh ---------- */
const WP = ["#ff8fab", "#ffb3c6", "#ffffff", "#ffc8a2", "#e63962"];
function kelopak(acak) { parts.push({ k: "p", x: rand() * W, y: acak ? rand() * H : -20, vy: 0.6 + rand() * 1.1, vx: (rand() - 0.5) * 0.6, r: rand() * 6.28, vr: (rand() - 0.5) * 0.06, s: 6 + rand() * 8, c: pick(WP), ph: rand() * 6.28 }); }
function cahaya() { parts.push({ k: "o", x: rand() * W, y: H + 30, r: 8 + rand() * 30, vy: -(0.15 + rand() * 0.35), vx: (rand() - 0.5) * 0.2, a: 0.06 + rand() * 0.16 }); }
function gambarFx(t) {
  xF.clearRect(0, 0, W, H);
  if (mode === "bokeh" && parts.length < 30 && rand() < 0.06) cahaya();
  if (mode === "kelopak" && parts.length < 90 && rand() < 0.35) kelopak();
  parts = parts.filter((p) => p.y > -60 && p.y < H + 40);
  for (const p of parts) {
    p.y += p.vy; p.x += p.vx;
    if (p.k === "o") {
      const g = xF.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(255,190,220,${p.a})`); g.addColorStop(1, "rgba(255,190,220,0)");
      xF.fillStyle = g; xF.beginPath(); xF.arc(p.x, p.y, p.r, 0, 6.3); xF.fill();
    } else {
      p.x += Math.sin(t * 0.002 + p.ph) * 0.6; p.r += p.vr;
      xF.save(); xF.translate(p.x, p.y); xF.rotate(p.r); xF.scale(1, Math.abs(Math.cos(t * 0.003 + p.ph)) * 0.6 + 0.4);
      xF.fillStyle = p.c; xF.globalAlpha = 0.85; petal(xF, p.s, p.s * 0.55); xF.fill(); xF.restore();
    }
  }
}

/* ---------- Taman bunga ---------- */
const WARNA = {
  daisy: ["#ffffff", "#fff1f5", "#ffe9a8"],
  cosmos: ["#ff8fab", "#ffb3c6", "#c8b6ff", "#ffc8a2"],
  tulip: ["#ff5d8f", "#ff9e6d", "#ffd166", "#e63962"],
  rose: ["#e63962", "#ff6b8b", "#ffb3c6", "#fff0f3"],
};
const HIJAU = ["#4f9d5d", "#3f8a52", "#66b36f"];
const TIPE = ["daisy", "cosmos", "tulip", "rose", "cosmos", "rose", "tulip"];

function baru(x, b, h, R, t0, dur) {
  const tipe = pick(TIPE);
  return { x, b, h, R, t0, dur, tipe, c: pick(WARNA[tipe]), bend: (rand() - 0.5) * 44, ph: rand() * 6.28, rot: (rand() - 0.5) * 0.6, g: pick(HIJAU) };
}
function susunTaman(instan) {
  fl = []; const now = performance.now(), k = clamp(W / 500, 0.9, 1.4), baris = 5;
  for (let r = 0; r < baris; r++) {
    const d = r / (baris - 1), b = H * (0.84 + 0.14 * d), jarak = (50 - d * 14) * (W < 600 ? 1.1 : 1);
    for (let x = -10; x < W + 20; x += jarak * (0.7 + rand() * 0.6)) {
      const R = (16 + rand() * 10) * (0.75 + 0.6 * d) * k;
      const h = Math.min(H * (0.16 + 0.32 * rand()) * (0.8 + 0.4 * d), b - H * 0.42);
      fl.push(baru(x, b, h, R, instan ? now - 9999 : now + 300 + d * 2600 + rand() * 4200, 1800 + rand() * 1400));
    }
  }
}
function mulaiTaman() { mulai = true; susunTaman(false); }

function tanam(x, y) { // ketuk layar -> bunga baru
  const b = H * (0.9 + rand() * 0.08), f = baru(x, b, Math.max(70, b - y), (18 + rand() * 12) * clamp(W / 500, 0.9, 1.4), performance.now(), 1300);
  fl.push(f); fl.sort((a, c) => a.b - c.b); if (fl.length > 520) fl.splice(0, 20);
  for (let k = 0; k < 6; k++) parts.push({ k: "p", x: x + (rand() - 0.5) * 60, y: y + (rand() - 0.5) * 30, vy: 0.5 + rand(), vx: (rand() - 0.5) * 1.4, r: rand() * 6, vr: 0.04, s: 6 + rand() * 7, c: pick(WP), ph: rand() * 6 });
}
document.addEventListener("pointerdown", (e) => { if (aktifTap && !e.target.closest("button")) { tanam(e.clientX, e.clientY); $("#tap").classList.remove("tampil"); } });

function bunga(f, now) {
  const c = xT, g = ease(clamp((now - f.t0) / f.dur, 0, 1)); if (g <= 0) return;
  const sw = Math.sin(now * 0.0016 + f.ph) * 5 * g;
  const tx = f.x + f.bend * g + sw, ty = f.b - f.h * g, cx = f.x - f.bend * 0.2 + sw * 0.3, cy = f.b - f.h * g * 0.55;
  c.strokeStyle = f.g; c.lineWidth = Math.max(2, f.R * 0.14); c.lineCap = "round";
  c.beginPath(); c.moveTo(f.x, f.b); c.quadraticCurveTo(cx, cy, tx, ty); c.stroke();
  const pt = (u) => [(1 - u) * (1 - u) * f.x + 2 * (1 - u) * u * cx + u * u * tx, (1 - u) * (1 - u) * f.b + 2 * (1 - u) * u * cy + u * u * ty];
  const daun = (p, a, l) => { c.save(); c.translate(p[0], p[1]); c.rotate(a); c.fillStyle = mix(f.g, 0.05); petal(c, l, l * 0.38); c.fill(); c.restore(); };
  const L = f.R * 1.3 * g;
  daun(pt(0.02), -1.1, L); daun(pt(0.02), 1.1, L); daun(pt(0.35), 1.0, L * 0.9); daun(pt(0.6), -1.0, L * 0.75);
  const s = ease(clamp((g - 0.55) / 0.45, 0, 1)); if (s <= 0) return;
  const R = f.R * s;
  c.save(); c.translate(tx, ty); c.rotate(f.rot + sw * 0.02); c.strokeStyle = "rgba(90,31,69,.12)"; c.lineWidth = 1;
  const ring = (n, len, wid, col, off) => { for (let j = 0; j < n; j++) { c.save(); c.rotate(off + (j * 6.2832) / n); c.fillStyle = col; petal(c, len, wid); c.fill(); c.stroke(); c.restore(); } };
  if (f.tipe === "daisy") { ring(16, R, R * 0.15, f.c, 0); c.fillStyle = "#ffcc33"; c.beginPath(); c.arc(0, 0, R * 0.24, 0, 6.3); c.fill(); }
  else if (f.tipe === "cosmos") { ring(8, R, R * 0.42, f.c, 0); ring(8, R * 0.55, R * 0.25, mix(f.c, 0.35), 0.4); c.fillStyle = "#ffd166"; c.beginPath(); c.arc(0, 0, R * 0.14, 0, 6.3); c.fill(); }
  else if (f.tipe === "rose") { for (let k = 0; k < 4; k++) ring(5, R * (1 - k * 0.22), R * (1 - k * 0.22) * 0.5, mix(f.c, k * 0.12 - 0.12), k * 0.6); c.fillStyle = mix(f.c, -0.35); c.beginPath(); c.arc(0, 0, R * 0.08, 0, 6.3); c.fill(); }
  else { // tulip
    [[-0.42, -0.25], [0.42, -0.25], [0, 0]].forEach(([a, sh]) => { c.save(); c.rotate(a); c.fillStyle = mix(f.c, sh); petal(c, R * 1.5, R * 0.6); c.fill(); c.stroke(); c.restore(); });
  }
  c.restore();
}
function gambarTaman(now) {
  xT.clearRect(0, 0, W, H);
  const hy = H * 0.84, gr = xT.createLinearGradient(0, hy - 20, 0, H);
  gr.addColorStop(0, "rgba(63,138,82,0)"); gr.addColorStop(0.25, "#4f9d5d"); gr.addColorStop(1, "#1f5e3c");
  xT.fillStyle = gr; xT.beginPath(); xT.moveTo(0, hy);
  for (let x = 0; x <= W; x += 20) xT.lineTo(x, hy + Math.sin(x * 0.012) * 8 - 6);
  xT.lineTo(W, H); xT.lineTo(0, H); xT.fill();
  fl.forEach((f) => bunga(f, now));
}

/* ---------- Loop ---------- */
(function loop(t) {
  gambarFx(t); if (mulai) gambarTaman(t);
  requestAnimationFrame(loop);
})(0);
