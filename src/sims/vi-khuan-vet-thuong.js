// Mô phỏng: vi khuẩn lọt qua vết thương trên da và phản ứng viêm. Chuyển từ bản 0.1.
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const near = (o, arr, f) => { let best = null, bd = 1e9; for (const x of arr) { if (f && !f(x)) continue; const d = dist(o, x); if (d < bd) { bd = d; best = x; } } return best; };
const step = (o, t, sp, dt) => { const d = dist(o, t) || 1; o.x += (t.x - o.x) / d * sp * dt + rnd(-.5, .5); o.y += (t.y - o.y) / d * sp * dt + rnd(-.5, .5); return d; };
const CAP_Y = 16;
let S = null;

export default {
  id: 'vi-khuan-vet-thuong',
  ten: 'Vi khuẩn qua vết thương',
  nut: 'Vi khuẩn',
  vi_tri: null,
  diem: 'vet-thuong-tay',
  giai_doan: [
    { t: 0, mo_ta: 'Vi khuẩn lọt qua vết thương trên da và bắt đầu nhân lên', thuc_te: 'vài giờ đầu, vi khuẩn có thể nhân đôi sau mỗi 20–30 phút' },
    { t: 2.5, mo_ta: 'Tế bào tại chỗ (dưỡng bào, đại thực bào thường trú) tiết chất báo động như histamin, cytokine', thuc_te: 'chấm tím là tín hiệu hóa học lan về phía mạch máu' },
    { t: 4, mo_ta: 'Mạch máu giãn và dễ thấm hơn: vùng đó đỏ, nóng, sưng, đau', thuc_te: 'đây là phản ứng viêm — dấu hiệu cơ thể đang chống lại' },
    { t: 5.5, mo_ta: 'Bạch cầu trung tính bám vào thành mạch, chui qua, lần theo tín hiệu đến nuốt vi khuẩn', thuc_te: 'tới trong vài giờ, là lực lượng chủ yếu trong 1–2 ngày đầu' },
    { t: 12, mo_ta: 'Đại thực bào đến dọn vi khuẩn còn lại và xác bạch cầu', thuc_te: 'xác bạch cầu chết lẫn vi khuẩn và dịch mô chính là mủ' },
    { t: 0, cuoi: true, mo_ta: 'Đã dọn sạch, mô bắt đầu lành', thuc_te: 'nếu vùng da ngày càng sưng đỏ lan rộng, sốt, chảy mủ nhiều: cần đi khám' }
  ],
  chu_giai: [
    { mau: '#5be38a', ten: 'Vi khuẩn' }, { mau: '#ffffff', ten: 'Bạch cầu trung tính' }, { mau: '#ffb36b', ten: 'Đại thực bào' },
    { mau: '#c58bff', ten: 'Tín hiệu hóa học' }, { mau: '#8a8270', ten: 'Xác bạch cầu (mủ)' }, { mau: '#ff4d6a', ten: 'Hồng cầu' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: thời gian nén từ giờ, ngày xuống vài giây; số tế bào và hình dạng chỉ tượng trưng; chưa vẽ kháng thể và bổ thể.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    const W = this.W, H = this.H;
    S = { t: 0, xong: false, rbc: Array.from({ length: 12 }, (_, i) => ({ x: i * W / 12 })), bac: [], neu: [], mac: [], sig: [] };
    for (let i = 0; i < 8; i++) S.bac.push({ x: W / 2 + rnd(-10, 10), y: H - 34, a: rnd(0, 3), r: rnd(0, 6) });
  },

  capH() { return 22 + Math.min(14, Math.max(0, (S.t - 4) * 4)); },

  cap_nhat(dt) {
    const W = this.W, H = this.H; S.t += dt;
    const top = CAP_Y + this.capH() + 6, bot = H - 30;
    for (const b of S.bac) {
      b.x += rnd(-12, 12) * dt * 3; b.y += rnd(-14, 8) * dt * 3;
      b.x = Math.max(6, Math.min(W - 6, b.x)); b.y = Math.max(top, Math.min(bot, b.y)); b.a += dt; b.r += rnd(-1, 1) * dt;
      if (b.a > 3.5 && S.bac.length < 140) { b.a = 0; S.bac.push({ x: b.x + 4, y: b.y, a: rnd(0, 1), r: b.r + 1 }); }
    }
    if (S.t > 2.5 && S.bac.length && Math.random() < dt * 8) { const b = S.bac[Math.random() * S.bac.length | 0]; S.sig.push({ x: b.x, y: b.y }); }
    S.sig = S.sig.filter(s => (s.y -= 30 * dt, s.x += rnd(-1, 1), s.y > CAP_Y + this.capH()));
    if (S.t > 5.5 && S.bac.length && Math.random() < dt * 3 && S.neu.filter(n => n.st !== 'dead').length < 28)
      S.neu.push({ x: rnd(W * .15, W * .85), y: CAP_Y + this.capH() / 2, st: 'roll', tm: .8, e: 0 });
    for (const n of S.neu) {
      if (n.st === 'roll') { n.x += 18 * dt; if ((n.tm -= dt) <= 0) n.st = 'out'; }
      else if (n.st === 'out') { n.y += 30 * dt; if (n.y > CAP_Y + this.capH() + 8) n.st = 'hunt'; }
      else if (n.st === 'hunt') {
        const b = near(n, S.bac);
        if (b) { if (step(n, b, 48, dt) < 7) { S.bac.splice(S.bac.indexOf(b), 1); if (++n.e >= 5) n.st = 'dead'; } }
        else { n.x += rnd(-8, 8) * dt; n.y += rnd(-8, 8) * dt; }
      }
    }
    if (S.t > 12 && Math.random() < dt * .8 && S.mac.length < 5) S.mac.push({ x: rnd(W * .2, W * .8), y: CAP_Y + this.capH() + 12 });
    for (const m of S.mac) {
      const b = near(m, S.bac) || near(m, S.neu, n => n.st === 'dead');
      if (b && step(m, b, 30, dt) < 11) { if (S.bac.includes(b)) S.bac.splice(S.bac.indexOf(b), 1); else S.neu.splice(S.neu.indexOf(b), 1); }
    }
    if (S.t > 8 && !S.bac.length && !S.neu.some(n => n.st === 'dead')) S.xong = true;
    this._dt = dt;
  },

  ve(ctx) {
    const W = this.W, H = this.H, dt = S.xong ? 0.016 : (this._dt || 0.016);
    const dot = (x, y, r, f, s) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); if (s) { ctx.strokeStyle = s; ctx.lineWidth = 1; ctx.stroke(); } };
    const viem = Math.min(1, Math.max(0, (S.t - 4) / 4)) * (S.xong ? .3 : 1);
    ctx.fillStyle = `rgb(${11 + viem * 40},${26 - viem * 6},${43 - viem * 10})`; ctx.fillRect(0, 0, W, H);
    // mao mạch
    const h = this.capH();
    ctx.fillStyle = 'rgba(255,77,106,.28)'; ctx.fillRect(0, CAP_Y - 3, W, h + 6);
    ctx.fillStyle = 'rgba(255,77,106,.12)'; ctx.fillRect(0, CAP_Y, W, h);
    for (const r of S.rbc) { r.x = (r.x + 70 * dt) % W; ctx.beginPath(); ctx.ellipse(r.x, CAP_Y + h / 2, 7, 4.5, 0, 0, 7); ctx.fillStyle = '#ff4d6a'; ctx.fill(); }
    ctx.font = '12px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd'; ctx.fillText('mao mạch', 8, CAP_Y + h + 15);
    // da và vết thương
    ctx.fillStyle = '#3a2f2a'; ctx.fillRect(0, H - 20, W / 2 - 18, 20); ctx.fillRect(W / 2 + 18, H - 20, W / 2 - 18, 20);
    ctx.fillStyle = '#c9b7a6'; ctx.fillText('da (vết thương)', 8, H - 6);
    for (const s of S.sig) dot(s.x, s.y, 1.8, '#c58bff');
    for (const b of S.bac) { ctx.beginPath(); ctx.ellipse(b.x, b.y, 5, 2.4, b.r, 0, 7); ctx.fillStyle = '#5be38a'; ctx.fill(); }
    for (const n of S.neu) {
      if (n.st === 'dead') { dot(n.x, n.y, 5, '#8a8270'); continue; }
      dot(n.x, n.y, 6.5, 'rgba(255,255,255,.12)', '#ffffff');
      for (let k = 0; k < 3; k++) dot(n.x - 2.5 + k * 2.5, n.y + (k % 2 ? -1 : 1), 1.5, '#c58bff');
    }
    for (const m of S.mac) { dot(m.x, m.y, 11, 'rgba(255,179,107,.25)', '#ffb36b'); dot(m.x + 2, m.y - 1, 4, '#ffb36b'); }
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 130, H / 2 - 18, 260, 36);
      ctx.strokeStyle = '#7fe8ff'; ctx.strokeRect(W / 2 - 130, H / 2 - 18, 260, 36);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Đã dọn sạch — bấm lại để chạy lần nữa', W / 2, H / 2 + 5); ctx.textAlign = 'left';
    }
  }
};
