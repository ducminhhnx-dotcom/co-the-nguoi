// Mô phỏng: virus cúm xâm nhập lớp tế bào lót đường thở và phản ứng của cơ thể. Chuyển từ bản 0.1.
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const near = (o, arr, f) => { let best = null, bd = 1e9; for (const x of arr) { if (f && !f(x)) continue; const d = dist(o, x); if (d < bd) { bd = d; best = x; } } return best; };
const step = (o, t, sp, dt) => { const d = dist(o, t) || 1; o.x += (t.x - o.x) / d * sp * dt + rnd(-.5, .5); o.y += (t.y - o.y) / d * sp * dt + rnd(-.5, .5); return d; };
const TOP = 14, CAO_TB = 40;
let S = null;

export default {
  id: 'virus-ho-hap',
  ten: 'Virus cúm qua đường hô hấp',
  nut: 'Virus cúm',
  vi_tri: 'khi-quan',
  diem: 'khi-quan',
  giai_doan: [
    { t: 0, mo_ta: 'Hít phải giọt bắn chứa virus cúm; virus bám vào tế bào lót đường hô hấp', thuc_te: 'thời gian ủ bệnh cúm khoảng 2 ngày, dao động 1–4 ngày' },
    { t: 2, mo_ta: 'Virus vào trong tế bào, chiếm bộ máy của tế bào để sao chép, rồi giải phóng hàng loạt virus mới', thuc_te: 'virus nảy chồi ra khỏi màng tế bào; mô phỏng vẽ gọn thành "vỡ" cho dễ nhìn' },
    { t: 4, mo_ta: 'Tế bào nhiễm tiết interferon cảnh báo tế bào bên cạnh (viền xanh lá = đã vào trạng thái kháng virus)', thuc_te: 'interferon và cytokine cũng gây sốt, mệt, đau mỏi người — triệu chứng bạn cảm thấy khi cúm' },
    { t: 8, mo_ta: 'Tế bào NK (đến sớm) và tế bào T gây độc (đến sau, khoảng một tuần) tiêu diệt tế bào đã nhiễm', thuc_te: 'giết tế bào nhiễm trước khi nó kịp thả virus ra' },
    { t: 13, mo_ta: 'Kháng thể hình chữ Y bám vào virus tự do, vô hiệu hóa chúng', thuc_te: 'kháng thể đặc hiệu tăng rõ sau khoảng 1–2 tuần; vắc-xin giúp có sẵn kháng thể từ trước' },
    { t: 0, cuoi: true, mo_ta: 'Hết virus; tế bào nền tái tạo lại lớp lót đường thở', thuc_te: 'ho có thể kéo dài thêm vài tuần trong lúc lớp lông chuyển hồi phục' }
  ],
  chu_giai: [
    { mau: '#ff5fb0', ten: 'Virus cúm' }, { mau: '#2c4a63', ten: 'Tế bào lót đường thở' }, { mau: '#9c3b6b', ten: 'Tế bào bị nhiễm' },
    { mau: '#5be38a', ten: 'Interferon / đã kháng' }, { mau: '#4d8dff', ten: 'Tế bào NK, T' }, { mau: '#ffb36b', ten: 'Kháng thể' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: thời gian nén từ ngày, tuần xuống vài giây; virus thực tế nảy chồi chứ không làm vỡ tế bào ngay; tế bào T đến muộn hơn nhiều so với hình.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    const W = this.W, ct = this.H - CAO_TB - 14;
    S = { t: 0, xong: false, vir: [], cells: [], kil: [], ab: [] };
    const n = 10, w = W / n;
    for (let i = 0; i < n; i++) S.cells.push({ x: i * w, w, st: 'ok', tm: 0 });
    // virus xuất phát đủ gần để chạm tế bào trong khoảng 1–2,5 giây, khớp với bước 2 (t = 2)
    for (let i = 0; i < 10; i++) S.vir.push({ x: rnd(20, W - 20), y: rnd(ct - 70, ct - 30), vx: rnd(-8, 8), vy: rnd(18, 30), st: 'f' });
  },

  cap_nhat(dt) {
    const W = this.W, H = this.H, ct = H - CAO_TB - 14; S.t += dt;
    S.cells.forEach(c => { c.w = W / S.cells.length; });
    S.cells.forEach((c, i) => { c.x = i * c.w; });
    for (const v of S.vir) {
      if (v.st === 'ab') { v.fade -= dt; continue; }
      v.x += v.vx * dt; v.y += v.vy * dt; v.vx += rnd(-20, 20) * dt;
      if (v.x < 4 || v.x > W - 4) v.vx *= -1;
      if (v.y < TOP + 10) v.vy = Math.abs(v.vy);
      if (v.y >= ct - 6) {
        const c = S.cells[Math.min(S.cells.length - 1, Math.max(0, v.x / (W / S.cells.length) | 0))];
        const p = c.st === 'ok' ? .9 : c.st === 'res' ? .12 : 0;
        if (Math.random() < p) { c.st = 'inf'; c.tm = 4.5; v.st = 'x'; } else { v.vy = -Math.abs(v.vy) * rnd(.6, 1.2); v.y = ct - 8; }
      }
    }
    S.vir = S.vir.filter(v => v.st === 'f' || v.st === 'ab' && v.fade > 0);
    S.cells.forEach((c, i) => {
      if (c.st === 'inf') {
        c.tm -= dt;
        if (S.t > 4) for (const j of [i - 2, i - 1, i + 1, i + 2]) { const n = S.cells[j]; if (n && n.st === 'ok' && Math.random() < dt * .6) n.st = 'res'; }
        if (c.tm <= 0) { c.st = 'dead'; c.tm = 7; for (let k = 0; k < 7 && S.vir.length < 160; k++) S.vir.push({ x: c.x + c.w / 2 + rnd(-8, 8), y: ct - 8, vx: rnd(-30, 30), vy: rnd(-40, -15), st: 'f' }); }
      } else if (c.st === 'dead' && (c.tm -= dt) <= 0) c.st = 'ok';
    });
    if (S.t > 8 && Math.random() < dt * 1.3 && S.kil.length < 8) S.kil.push({ x: rnd(20, W - 20), y: TOP + 10 });
    for (const k of S.kil) {
      const c = near(k, S.cells.filter(c => c.st === 'inf').map(c => ({ x: c.x + c.w / 2, y: ct - 6, c })));
      if (c) { if (step(k, c, 55, dt) < 8) { c.c.st = 'dead'; c.c.tm = 7; } } else { k.x += rnd(-10, 10) * dt; k.y += rnd(-6, 6) * dt; }
    }
    if (S.t > 13 && Math.random() < dt * 8 && S.ab.length < 60) S.ab.push({ x: rnd(10, W - 10), y: TOP + 10 });
    for (const a of S.ab) { const v = near(a, S.vir, v => v.st === 'f'); if (v && step(a, v, 65, dt) < 6) { v.st = 'ab'; v.fade = 1.5; a.u = 1; } }
    S.ab = S.ab.filter(a => !a.u);
    if (S.t > 13 && !S.vir.some(v => v.st === 'f') && !S.cells.some(c => c.st === 'inf')) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, ct = H - CAO_TB - 14;
    const dot = (x, y, r, f, s) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); if (s) { ctx.strokeStyle = s; ctx.lineWidth = 1; ctx.stroke(); } };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    ctx.font = '12px "Be Vietnam Pro",sans-serif';
    ctx.fillStyle = 'rgba(91,227,138,.12)'; ctx.fillRect(0, ct - 14, W, 14);
    ctx.fillStyle = '#8fa8bd'; ctx.fillText('lớp chất nhầy', 8, ct - 18);
    for (const c of S.cells) {
      if (c.st === 'dead') { ctx.fillStyle = 'rgba(143,168,189,.18)'; ctx.fillRect(c.x + 2, ct + CAO_TB - 14, c.w - 4, 12); continue; }
      ctx.fillStyle = c.st === 'inf' ? '#9c3b6b' : '#2c4a63'; ctx.fillRect(c.x + 2, ct, c.w - 4, CAO_TB);
      dot(c.x + c.w / 2, ct + 24, 4.5, c.st === 'inf' ? '#ff5fb0' : '#7fe8ff');
      ctx.strokeStyle = c.st === 'res' ? '#5be38a' : 'rgba(127,232,255,.45)'; ctx.lineWidth = c.st === 'res' ? 2.5 : 1; ctx.strokeRect(c.x + 2, ct, c.w - 4, CAO_TB);
      ctx.strokeStyle = 'rgba(127,232,255,.55)'; ctx.lineWidth = 1;
      for (let k = 6; k < c.w - 4; k += 5) { ctx.beginPath(); ctx.moveTo(c.x + k, ct); ctx.lineTo(c.x + k + Math.sin(S.t * 6 + k) * 2, ct - 6); ctx.stroke(); }
      if (c.st === 'inf' && S.t > 4) { ctx.beginPath(); ctx.arc(c.x + c.w / 2, ct + 18, (S.t * 30) % 40 + 8, 0, 7); ctx.strokeStyle = 'rgba(91,227,138,.5)'; ctx.stroke(); }
    }
    ctx.fillStyle = '#8fa8bd'; ctx.fillText('tế bào lót đường thở (có lông chuyển)', 8, H - 2);
    for (const v of S.vir) {
      ctx.globalAlpha = v.st === 'ab' ? Math.max(0, v.fade / 1.5) : 1;
      dot(v.x, v.y, 3.4, v.st === 'ab' ? '#6b7a88' : '#ff5fb0');
      for (let k = 0; k < 6; k++) { const g = k * 1.047; dot(v.x + Math.cos(g) * 4.6, v.y + Math.sin(g) * 4.6, 1, '#ffb3d9'); }
      ctx.globalAlpha = 1;
    }
    for (const k of S.kil) dot(k.x, k.y, 8, 'rgba(77,141,255,.35)', '#4d8dff');
    ctx.strokeStyle = '#ffb36b'; ctx.lineWidth = 2;
    for (const a of S.ab) { ctx.beginPath(); ctx.moveTo(a.x, a.y + 5); ctx.lineTo(a.x, a.y); ctx.lineTo(a.x - 4, a.y - 4); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + 4, a.y - 4); ctx.stroke(); }
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 130, H / 2 - 40, 260, 36);
      ctx.strokeStyle = '#7fe8ff'; ctx.strokeRect(W / 2 - 130, H / 2 - 40, 260, 36);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Đã hết virus — bấm lại để chạy lần nữa', W / 2, H / 2 - 17); ctx.textAlign = 'left';
    }
  }
};
