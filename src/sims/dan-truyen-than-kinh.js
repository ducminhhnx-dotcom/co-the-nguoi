// Mô phỏng: xung thần kinh — điện thế nghỉ, điện thế hoạt động, dẫn truyền nhảy cóc, khớp thần kinh (synapse).
// Nguồn: OpenStax Anatomy and Physiology 2e, mục 12.4 (The Action Potential), 12.5 (Communication Between Neurons).
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = x => Math.max(0, Math.min(1, x));
const T_KT = 2.5, T_XUNG = 4.5, T_LAN = 7, T_SYN = 11, T_DON = 15, T_HET = 18;
const SO_EO = 7;                                   // số eo Ranvier vẽ trên sợi trục
let S = null;

// Bố cục: nửa trên là nơron (thân, sợi trục có myelin, cúc tận cùng, tế bào sau); nửa dưới là đồ thị điện thế
function boCuc(W, H) {
  const y = Math.round(H * 0.24), than = { x: 26, y, r: 13 }, x0 = 42, xc = W * 0.80, xs = W * 0.87;
  const eo = Array.from({ length: SO_EO }, (_, i) => x0 + (xc - 10 - x0) * i / (SO_EO - 1));
  return { y, than, x0, xc, xs, eo, g: { x: 34, y: Math.round(H * 0.52), w: W - 44, h: H - Math.round(H * 0.52) - 16 } };
}
// Điện thế màng ghi ở gò sợi trục (mV) theo thời gian mô phỏng — dạng điện thế hoạt động kéo giãn để dễ nhìn
function dienThe(t) {
  if (t < T_KT) return -70;
  if (t < T_XUNG) return -70 + 15 * (1 - Math.cos(Math.PI * clamp((t - T_KT) / (T_XUNG - T_KT)))) / 2;
  if (t < T_XUNG + 0.4) return -55 + 85 * clamp((t - T_XUNG) / 0.4);
  if (t < T_XUNG + 1.2) return 30 - 110 * clamp((t - T_XUNG - 0.4) / 0.8);
  if (t < T_XUNG + 2.2) return -80 + 10 * clamp((t - T_XUNG - 1.2) / 1.0);
  return -70;
}
const tEo = i => T_XUNG + i * (T_SYN - T_XUNG) / SO_EO;   // lúc xung tới eo thứ i

export default {
  id: 'dan-truyen-than-kinh',
  ten: 'Xung thần kinh và khớp thần kinh',
  nut: 'Xung thần kinh',
  nhom: 'van-hanh',
  vi_tri: null,
  diem: null,
  giai_doan: [
    { t: 0, bo_phan: 'nao', mo_ta: 'Lúc nghỉ: màng tế bào thần kinh mang điện thế khoảng −70 mV (bên trong âm hơn bên ngoài); bơm Na⁺/K⁺ dùng năng lượng ATP để giữ chênh lệch: nhiều Na⁺ bên ngoài, nhiều K⁺ bên trong', thuc_te: 'nồng độ Na⁺ bên ngoài cao gấp khoảng 10 lần bên trong; điện thế nghỉ khác nhau đôi chút giữa các loại tế bào' },
    { t: T_KT, mo_ta: 'Kích thích: tín hiệu tới làm màng bớt âm dần; chạm ngưỡng −55 mV thì phát xung, chưa tới ngưỡng thì không có xung', thuc_te: 'xung theo luật "tất cả hoặc không": kích thích mạnh hơn tạo nhiều xung hơn, nhanh hơn, chứ không tạo xung to hơn' },
    { t: T_XUNG, mo_ta: 'Điện thế hoạt động: kênh Na⁺ mở, Na⁺ ùa vào, điện thế vọt lên +30 mV; rồi kênh K⁺ mở, K⁺ đi ra, điện thế hạ xuống, hơi âm quá mức nghỉ một chút rồi trở lại', thuc_te: 'mỗi điện thế hoạt động chỉ kéo dài khoảng 2 mili giây; mọi xung đều đạt cùng đỉnh +30 mV' },
    { t: T_LAN, mo_ta: 'Lan truyền: trên sợi trục có bao myelin, kênh Na⁺ chỉ nằm ở các eo Ranvier nên xung "nhảy cóc" từ eo này sang eo khác, nhanh hơn kiểu dẫn truyền liên tục trên sợi không có myelin', thuc_te: 'sợi trục to hơn dẫn xung nhanh hơn; ngay sau xung, đoạn màng vừa phát xung có giai đoạn trơ, chưa phát xung lại được ngay' },
    { t: T_SYN, mo_ta: 'Khớp thần kinh: xung tới cúc tận cùng, kênh Ca²⁺ mở, Ca²⁺ đi vào làm các túi chất dẫn truyền hòa vào màng, đổ chất dẫn truyền vào khe; chất này khuếch tán sang và gắn vào thụ thể như chìa khóa vào ổ khóa, mở kênh ion ở tế bào sau', thuc_te: 'tín hiệu ở tế bào sau có thể kích thích (đẩy về phía ngưỡng) hoặc ức chế (đẩy xa ngưỡng); nhiều tín hiệu cộng lại, ví dụ +15 mV, mới đưa được −70 mV lên ngưỡng −55 mV' },
    { t: T_DON, mo_ta: 'Dọn khe: chất dẫn truyền bị men phân giải hoặc được tế bào thần kinh, tế bào thần kinh đệm hút trở lại, để khớp sẵn sàng cho tín hiệu kế tiếp', thuc_te: 'ví dụ acetylcholine bị men acetylcholinesterase phân giải ngay trong khe' },
    { t: 0, cuoi: true, bo_phan: 'nao', mo_ta: 'Các tế bào thần kinh nối với nhau qua những khớp như vậy, tạo nên mạng lưới truyền tin của não và tủy sống', thuc_te: 'ở khớp điện (ít gặp hơn), ion đi thẳng từ tế bào này sang tế bào kia, không cần chất dẫn truyền' }
  ],
  chu_giai: [
    { mau: '#ffb36b', ten: 'Na⁺' }, { mau: '#4d8dff', ten: 'K⁺' }, { mau: '#5be38a', ten: 'Ca²⁺' },
    { mau: '#7fe8ff', ten: 'Chất dẫn truyền' }, { mau: '#e8d27a', ten: 'Bao myelin' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: xung thật kéo dài khoảng 2 mili giây và đi hết sợi trục trong phần nhỏ của giây, mô phỏng làm chậm hàng nghìn lần; đồ thị kéo giãn cho dễ nhìn; số ion, túi và eo Ranvier vẽ ít hơn rất nhiều.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    const L = boCuc(this.W, this.H);
    S = { t: 0, xong: false, ion: [], tui: [], cdt: [], ca: [] };
    for (let i = 0; i < 22; i++) S.ion.push({ loai: 'na', x: rnd(L.x0, L.xc), y: L.y + (Math.random() < .5 ? -1 : 1) * rnd(11, 22), v: 0 });
    for (let i = 0; i < 12; i++) S.ion.push({ loai: 'k', x: rnd(L.x0, L.xc), y: L.y + rnd(-2.5, 2.5), v: 0 });
    for (let i = 0; i < 6; i++) S.tui.push({ dx: rnd(-6, 2), dy: rnd(-6, 6), st: 'trong' });
  },

  cap_nhat(dt) {
    const W = this.W, H = this.H, L = boCuc(W, H); S.t += dt; const t = S.t;
    // ion: Na⁺ ùa vào ở eo đang phát xung, K⁺ đi ra ngay sau đó
    for (let i = 0; i < SO_EO; i++) {
      const k = t - tEo(i);
      if (k >= 0 && k < dt) {
        for (let j = 0; j < 3; j++) S.ion.push({ loai: 'na', x: L.eo[i] + rnd(-3, 3), y: L.y + (Math.random() < .5 ? -1 : 1) * 16, v: 1, ty: L.y, song: 1.2 });
      }
      if (k >= 0.4 && k < 0.4 + dt) {
        for (let j = 0; j < 2; j++) S.ion.push({ loai: 'k', x: L.eo[i] + rnd(-3, 3), y: L.y, v: 1, ty: L.y + (Math.random() < .5 ? -1 : 1) * 18, song: 1.2 });
      }
    }
    for (const o of S.ion) {
      if (o.v) { o.y += (o.ty - o.y) * dt * 5; o.song -= dt; }
      else { o.x += rnd(-6, 6) * dt; o.x = Math.max(L.x0, Math.min(L.xc, o.x)); }
    }
    S.ion = S.ion.filter(o => !o.v || o.song > 0);
    // khớp thần kinh: Ca²⁺ vào, túi hòa màng, chất dẫn truyền qua khe
    if (t >= T_SYN && t < T_SYN + 1 && Math.random() < dt * 10) S.ca.push({ x: L.xc + rnd(-4, 4), y: L.y + (Math.random() < .5 ? -1 : 1) * 16, song: 1 });
    for (const c of S.ca) { c.y += (L.y - c.y) * dt * 4; c.song -= dt; }
    S.ca = S.ca.filter(c => c.song > 0);
    for (const v of S.tui) {
      if (t >= T_SYN + 0.6 && v.st === 'trong') { v.dx += 14 * dt; if (v.dx >= 7) { v.st = 'mo'; for (let j = 0; j < 5; j++) S.cdt.push({ x: L.xc + 10, y: L.y + v.dy + rnd(-2, 2), vx: rnd(10, 22), vy: rnd(-8, 8), st: 'khe', a: 1 }); } }
    }
    for (const c of S.cdt) {
      if (c.st === 'khe') { c.x += c.vx * dt; c.y += c.vy * dt; if (c.x >= L.xs - 2) { c.x = L.xs - 2; c.st = 'gan'; } }
      if (t >= T_DON) c.a -= dt * 0.6;
    }
    S.cdt = S.cdt.filter(c => c.a > 0);
    if (t >= T_HET) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t;
    const dot = (x, y, r, f) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // thân tế bào và sợi nhánh
    ctx.strokeStyle = 'rgba(197,139,255,.75)'; ctx.lineWidth = 1.5;
    for (const g of [-2.4, -1.6, 2.2, 1.5]) { ctx.beginPath(); ctx.moveTo(L.than.x, L.than.y); ctx.lineTo(L.than.x + Math.cos(g) * 24, L.than.y + Math.sin(g) * 22); ctx.stroke(); }
    const kt = clamp((t - T_KT) / (T_XUNG - T_KT));
    ctx.beginPath(); ctx.arc(L.than.x, L.than.y, L.than.r, 0, 7); ctx.fillStyle = `rgba(197,139,255,${0.15 + 0.3 * kt * (t < T_XUNG + 1 ? 1 : 0)})`; ctx.fill(); ctx.stroke();
    // sợi trục
    ctx.strokeStyle = 'rgba(197,139,255,.75)'; ctx.beginPath(); ctx.moveTo(L.x0 - 4, L.y - 3); ctx.lineTo(L.xc, L.y - 3); ctx.moveTo(L.x0 - 4, L.y + 3); ctx.lineTo(L.xc, L.y + 3); ctx.stroke();
    // bao myelin giữa các eo
    ctx.fillStyle = 'rgba(232,210,122,.28)'; ctx.strokeStyle = 'rgba(232,210,122,.6)'; ctx.lineWidth = 1;
    for (let i = 0; i < SO_EO - 1; i++) { const a = L.eo[i] + 4, b = L.eo[i + 1] - 4; ctx.beginPath(); ctx.roundRect(a, L.y - 9, b - a, 18, 8); ctx.fill(); ctx.stroke(); }
    // eo Ranvier: sáng khi xung đang ở đó, mờ khi đang trơ
    for (let i = 0; i < SO_EO; i++) {
      const k = t - tEo(i);
      if (k >= 0 && k < 0.6) { ctx.beginPath(); ctx.arc(L.eo[i], L.y, 9 - k * 6, 0, 7); ctx.fillStyle = `rgba(255,179,107,${0.8 - k})`; ctx.fill(); }
      else if (k >= 0.6 && k < 1.6) { ctx.fillStyle = 'rgba(77,141,255,.25)'; ctx.fillRect(L.eo[i] - 3, L.y - 5, 6, 10); }
    }
    // cúc tận cùng, khe synapse, tế bào sau
    ctx.strokeStyle = 'rgba(197,139,255,.75)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(L.xc + 2, L.y, 12, -Math.PI / 2, Math.PI / 2, false); ctx.stroke();
    const sang = t >= T_SYN + 1 && t < T_DON + 1 ? 0.35 : 0.12;
    ctx.fillStyle = `rgba(197,139,255,${sang})`; ctx.fillRect(L.xs, L.y - 22, W - L.xs - 4, 44);
    ctx.strokeRect(L.xs, L.y - 22, W - L.xs - 4, 44);
    for (let j = -2; j <= 2; j++) { ctx.fillStyle = 'rgba(127,232,255,.6)'; ctx.fillRect(L.xs - 2, L.y + j * 7 - 2, 3, 4); }   // thụ thể
    for (const v of S.tui) if (v.st === 'trong') { ctx.beginPath(); ctx.arc(L.xc + v.dx, L.y + v.dy, 3.2, 0, 7); ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.stroke(); dot(L.xc + v.dx, L.y + v.dy, 1.2, '#7fe8ff'); }
    for (const o of S.ion) dot(o.x, o.y, 1.8, o.loai === 'na' ? '#ffb36b' : '#4d8dff');
    for (const c of S.ca) dot(c.x, c.y, 1.8, '#5be38a');
    for (const c of S.cdt) { ctx.globalAlpha = Math.max(0, c.a); dot(c.x, c.y, 1.6, '#7fe8ff'); } ctx.globalAlpha = 1;
    // đồ thị điện thế ở gò sợi trục
    const G = L.g, yMv = v => G.y + G.h * (30 - v) / 115;
    ctx.strokeStyle = 'rgba(143,168,189,.35)'; ctx.lineWidth = 1; ctx.strokeRect(G.x, G.y, G.w, G.h);
    ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(G.x, yMv(-55)); ctx.lineTo(G.x + G.w, yMv(-55)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '10px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd'; ctx.textAlign = 'right';
    ctx.fillText('+30', G.x - 3, yMv(30) + 4); ctx.fillText('−55', G.x - 3, yMv(-55) + 3); ctx.fillText('−70', G.x - 3, yMv(-70) + 6);
    ctx.textAlign = 'left'; ctx.fillText('ngưỡng', G.x + 4, yMv(-55) - 3);
    ctx.textAlign = 'right'; ctx.fillText('điện thế màng (mV) ở gò sợi trục', G.x + G.w, G.y - 4); ctx.textAlign = 'left';
    ctx.strokeStyle = '#c58bff'; ctx.lineWidth = 1.6; ctx.beginPath();
    const n = Math.max(2, Math.floor(G.w));
    for (let i = 0; i <= n; i++) { const tt = i / n * T_HET; if (tt > t) break; const x = G.x + i, y = yMv(dienThe(tt)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = '#8fa8bd'; ctx.font = '11px "Be Vietnam Pro",sans-serif';
    ctx.fillText('thân', L.than.x - 12, L.y + 28); ctx.fillText('sợi trục có myelin', L.x0 + 30, L.y + 26);
    ctx.textAlign = 'right'; ctx.fillText('tế bào sau', W - 4, L.y + 34); ctx.textAlign = 'left';
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 140, H / 2 - 18, 280, 32);
      ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 140, H / 2 - 18, 280, 32);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Xung đã qua khớp — bấm lại để xem lần nữa', W / 2, H / 2 + 3); ctx.textAlign = 'left';
    }
  }
};
