// Mô phỏng: một đơn vị lọc của thận (nephron) lọc máu và tạo nước tiểu.
// Nguồn: OpenStax Anatomy and Physiology 2e, mục 25.4 (cấu tạo nephron, màng lọc), 25.5 (mức lọc cầu thận),
// 25.6 (tái hấp thu theo từng đoạn ống), 25.8 (ADH, aldosterone). Tỷ lệ tái hấp thu dưới đây theo bảng 25.5.
const rnd = (a, b) => a + Math.random() * (b - a);
const T_LOC = 3, T_GAN = 7, T_QUAI = 10, T_XA = 13, T_HET = 19;
const CHAT = {
  nuoc: { mau: '#7fe8ff', r: 2.2 }, duong: { mau: '#ffb36b', r: 2.4 }, muoi: { mau: '#e8d27a', r: 2 },
  ure: { mau: '#c58bff', r: 2.4 }, h: { mau: '#5be38a', r: 2 }
};
let S = null;

// Đường đi của dịch lọc: nang Bowman → ống lượn gần → quai Henle (xuống, lên) → ống lượn xa → ống góp
function boCuc(W, H) {
  const cau = { x: 34, y: 54, r: 19 }, yO = 54, a = W * 0.40, b = a + 26, c = W * 0.76, d = W * 0.88, day = H - 44;
  const P = [], moc = {};
  const them = (x, y) => P.push({ x, y });
  for (let i = 0; i <= 24; i++) { const k = i / 24; them(cau.x + cau.r + (a - cau.x - cau.r) * k, yO + Math.sin(k * Math.PI * 6) * 7); }
  moc.gan = P.length - 1;
  for (let i = 1; i <= 10; i++) them(a, yO + (day - yO) * i / 10);
  moc.xuong = P.length - 1;
  for (let i = 1; i <= 8; i++) { const g = Math.PI - Math.PI * i / 8; them((a + b) / 2 + Math.cos(g) * 13, day + Math.sin(g) * 10); }
  for (let i = 1; i <= 10; i++) them(b, day - (day - yO) * i / 10);
  moc.len = P.length - 1;
  for (let i = 1; i <= 20; i++) { const k = i / 20; them(b + (c - b) * k, yO + Math.sin(k * Math.PI * 4) * 6); }
  moc.xa = P.length - 1;
  them(d, yO); for (let i = 1; i <= 10; i++) them(d, yO + (H - 12 - yO) * i / 10);
  const dai = [0]; for (let i = 1; i < P.length; i++) dai.push(dai[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const doan = k => dai[moc[k]];
  return { cau, yO, a, b, c, d, day, P, dai, mm: yO + 28, ranh: { gan: doan('gan'), xuong: doan('xuong'), len: doan('len'), xa: doan('xa'), het: dai[dai.length - 1] } };
}
function tai(L, s) {
  const { P, dai } = L; let i = 1;
  while (i < P.length - 1 && dai[i] < s) i++;
  const k = Math.min(1, Math.max(0, (s - dai[i - 1]) / ((dai[i] - dai[i - 1]) || 1)));
  return { x: P[i - 1].x + (P[i].x - P[i - 1].x) * k, y: P[i - 1].y + (P[i].y - P[i - 1].y) * k, doc: Math.abs(P[i].x - P[i - 1].x) < Math.abs(P[i].y - P[i - 1].y) };
}
// Số phận của từng chất: tái hấp thu ở đoạn nào (vị trí 0–1 trong đoạn), hay đi ra nước tiểu
function soPhan(loai) {
  const r = Math.random();
  if (loai === 'duong') return { doan: 'gan' };                               // gần 100% ở ống lượn gần
  if (loai === 'nuoc') return r < 0.67 ? { doan: 'gan' } : r < 0.82 ? { doan: 'xuong' } : r < 0.97 ? { doan: 'gop' } : null;
  if (loai === 'muoi') return r < 0.65 ? { doan: 'gan' } : r < 0.90 ? { doan: 'len' } : r < 0.95 ? { doan: 'xa' } : r < 0.99 ? { doan: 'gop' } : null;
  if (loai === 'ure') return r < 0.5 ? { doan: 'gan' } : null;
  return null;
}

export default {
  id: 'loc-mau-o-than',
  ten: 'Thận lọc máu thành nước tiểu',
  nut: 'Thận lọc máu',
  nhom: 'van-hanh',
  vi_tri: null,
  diem: null,
  giai_doan: [
    { t: 0, bo_phan: 'dong-mach-than', mo_ta: 'Máu theo động mạch thận vào thận, tới tiểu động mạch đến rồi vào cầu thận — một búi mao mạch áp suất cao nằm trong nang Bowman', thuc_te: 'mỗi thận có khoảng 1,3 triệu đơn vị lọc (nephron); thận nhận khoảng 20–25% lượng máu tim bơm ra lúc nghỉ' },
    { t: T_LOC, bo_phan: 'than', mo_ta: 'Lọc ở cầu thận: nước, đường, muối, ure lọt qua màng lọc vào nang Bowman thành dịch lọc; tế bào máu và protein lớn (như albumin) bị giữ lại trong máu', thuc_te: 'mức lọc khoảng 125 ml/phút ở nam, 105 ml/phút ở nữ — tức khoảng 180 lít (nam) và 150 lít (nữ) dịch lọc mỗi ngày' },
    { t: T_GAN, bo_phan: 'than', mo_ta: 'Ống lượn gần: lấy lại gần như toàn bộ đường và axit amin, khoảng 2/3 nước và muối, khoảng một nửa ure, trả về mao mạch quanh ống', thuc_te: 'sức lấy lại đường của ống thận có giới hạn: khoảng 375 mg/phút ở nam, 300 mg/phút ở nữ' },
    { t: T_QUAI, bo_phan: 'than', mo_ta: 'Quai Henle: nhánh xuống cho nước thấm ra; nhánh lên không thấm nước nhưng bơm muối ra ngoài, làm vùng tủy thận rất mặn — nhờ đó thận cô đặc được nước tiểu', thuc_te: 'nhánh xuống lấy lại tới 15% nước; độ đậm đặc của dịch quanh quai tăng từ khoảng 300 lên khoảng 1200 mOsmol/kg' },
    { t: T_XA, bo_phan: 'than', mo_ta: 'Ống lượn xa và ống góp tinh chỉnh theo nhu cầu: hormone ADH mở thêm kênh nước để giữ nước; aldosterone giữ muối, thải kali; ống thận còn tiết H⁺ và một số thuốc vào nước tiểu', thuc_te: 'khi máu đặc lại (áp suất thẩm thấu tăng), thận lấy lại nhiều nước hơn và lượng nước tiểu giảm' },
    { t: 0, cuoi: true, bo_phan: 'bang-quang', mo_ta: 'Phần còn lại thành nước tiểu, theo ống góp xuống bể thận, niệu quản rồi vào bàng quang', thuc_te: 'khoảng 99% dịch lọc được trả lại máu; mỗi ngày chỉ còn khoảng 1–2 lít nước tiểu' }
  ],
  chu_giai: [
    { mau: '#7fe8ff', ten: 'Nước' }, { mau: '#ffb36b', ten: 'Đường' }, { mau: '#e8d27a', ten: 'Muối' },
    { mau: '#c58bff', ten: 'Ure' }, { mau: '#ff4d6a', ten: 'Tế bào máu, protein' }, { mau: '#5be38a', ten: 'H⁺ tiết vào' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: một nephron vẽ phẳng, không theo tỷ lệ; dịch lọc thật chảy qua hết các đoạn trong vài phút, mô phỏng nén lại; mỗi chấm là rất nhiều phân tử; tỷ lệ tái hấp thu từng đoạn theo bảng 25.5 của OpenStax.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    S = { t: 0, xong: false, dich: [], mau: [], hen: 0 };
    for (let i = 0; i < 10; i++) S.mau.push({ g: rnd(0, 6.3), r: rnd(5, 14), v: rnd(1.5, 3), to: Math.random() < .3 });
  },

  cap_nhat(dt) {
    const W = this.W, H = this.H, L = boCuc(W, H); S.t += dt; const t = S.t;
    for (const m of S.mau) m.g += m.v * dt;                          // máu quay vòng trong búi mao mạch
    if (t >= T_LOC && t < T_HET - 4 && (S.hen -= dt) <= 0) {         // lọc: dịch lọc vào nang Bowman
      S.hen = 0.07;
      const r = Math.random(), loai = r < .5 ? 'nuoc' : r < .62 ? 'duong' : r < .85 ? 'muoi' : 'ure';
      const sp = soPhan(loai);
      let o = null;
      if (sp) {
        const [a0, a1] = { gan: [0, L.ranh.gan], xuong: [L.ranh.gan, L.ranh.xuong], len: [L.ranh.xuong + 30, L.ranh.len], xa: [L.ranh.len, L.ranh.xa], gop: [L.ranh.xa + 20, L.ranh.het - 30] }[sp.doan];
        o = rnd(a0, a1);
      }
      S.dich.push({ loai, s: 0, o, st: 'ong', x: 0, y: 0, a: 1 });
    }
    if (t >= T_XA && t < T_HET - 3 && Math.random() < dt * 4) {      // tiết H⁺ vào ống lượn xa
      const s = rnd(L.ranh.len + 10, L.ranh.xa - 10), p = tai(L, s);
      S.dich.push({ loai: 'h', st: 'tiet', s, o: null, x: p.x, y: L.mm, a: 1 });
    }
    for (const p of S.dich) {
      if (p.st === 'ong') {
        p.s += 48 * dt; const q = tai(L, p.s); p.x = q.x; p.y = q.y;
        if (p.o != null && p.s >= p.o) { p.st = 've'; p.doc = q.doc; p.dx = q.doc ? (Math.random() < .5 ? -1 : 1) : 0; }
        if (p.s >= L.ranh.het) p.st = 'het';
      } else if (p.st === 've') {                     // tái hấp thu: rời ống, về máu rồi mờ dần
        if (p.doc) p.x += p.dx * 30 * dt; else p.y += 34 * dt;
        p.a -= dt * 1.4; if (p.a <= 0) p.st = 'het';
      } else if (p.st === 'tiet') {                   // tiết: từ máu vào ống, rồi trôi theo dịch
        const q = tai(L, p.s); p.y -= 30 * dt; if (p.y <= q.y) p.st = 'ong';
      }
    }
    S.dich = S.dich.filter(p => p.st !== 'het');
    if (t >= T_HET) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t;
    const dot = (x, y, r, f) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // mao mạch quanh ống nhận lại các chất
    ctx.strokeStyle = 'rgba(255,77,106,.4)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(L.cau.x + 10, L.cau.y + 14); ctx.lineTo(L.cau.x + 14, L.mm); ctx.lineTo(L.c, L.mm); ctx.lineTo(L.c + 10, L.mm + 18); ctx.stroke();
    // tiểu động mạch đến, đi
    ctx.strokeStyle = 'rgba(255,77,106,.75)'; ctx.beginPath(); ctx.moveTo(0, L.cau.y + 6); ctx.lineTo(L.cau.x - 6, L.cau.y + 4); ctx.stroke();
    // nang Bowman và cầu thận
    ctx.strokeStyle = 'rgba(127,232,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(L.cau.x, L.cau.y, L.cau.r, 0.35, Math.PI * 2 - 0.35); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,77,106,.8)'; ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(L.cau.x - 3 + (k % 2) * 6, L.cau.y - 3 + (k > 1) * 6, 6, 0, 7); ctx.stroke(); }
    for (const m of S.mau) dot(L.cau.x + Math.cos(m.g) * m.r * .7, L.cau.y + Math.sin(m.g) * m.r * .7, m.to ? 2.6 : 3, m.to ? '#ff8fa3' : '#ff4d6a');
    // ống thận
    ctx.strokeStyle = 'rgba(127,232,255,.35)'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.beginPath();
    L.P.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.lineWidth = 1;
    // vùng tủy mặn quanh quai Henle
    if (t >= T_QUAI) { const g = ctx.createLinearGradient(0, L.yO, 0, L.day); g.addColorStop(0, 'rgba(232,210,122,0)'); g.addColorStop(1, 'rgba(232,210,122,.18)'); ctx.fillStyle = g; ctx.fillRect(L.a - 24, L.yO + 10, L.b - L.a + 48, L.day - L.yO); }
    for (const p of S.dich) { ctx.globalAlpha = Math.max(0, p.a); dot(p.x, p.y, CHAT[p.loai].r, CHAT[p.loai].mau); }
    ctx.globalAlpha = 1;
    ctx.font = '11px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd'; ctx.textAlign = 'center';
    ctx.fillText('cầu thận', L.cau.x, L.mm + 18);
    ctx.fillText('ống lượn gần', (L.cau.x + L.a) / 2 + 10, 22);
    ctx.fillText('ống lượn xa', (L.b + L.c) / 2, 22);
    ctx.fillText('quai Henle', (L.a + L.b) / 2, H - 14);
    ctx.fillStyle = '#ff8fa3'; ctx.textAlign = 'right'; ctx.fillText('trả về máu', L.a - 14, L.mm + 34); ctx.textAlign = 'center';
    ctx.textAlign = 'right'; ctx.fillStyle = '#8fa8bd'; ctx.fillText('ống góp', L.d - 8, H - 26); ctx.fillText('→ bàng quang', W - 4, H - 4);
    ctx.textAlign = 'left';
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 140, H / 2 - 18, 280, 32);
      ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 140, H / 2 - 18, 280, 32);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Hết lượt lọc — bấm lại để xem lần nữa', W / 2, H / 2 + 3); ctx.textAlign = 'left';
    }
  }
};
