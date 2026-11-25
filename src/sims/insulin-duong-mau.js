// Mô phỏng: insulin đưa glucose vào tế bào sau bữa ăn — người bình thường, đái tháo đường týp 1 và týp 2.
// Nguồn: OpenStax Anatomy and Physiology 2e, mục 17.9 (insulin, glucagon, tế bào beta, týp 1 và týp 2);
// MSD Manual — Overview of Diabetes Mellitus (tỷ lệ các týp, ngưỡng chẩn đoán).
const rnd = (a, b) => a + Math.random() * (b - a);
const T_INS = 3, T_VAO = 6, T_T1 = 10, T_T2 = 14, T_HET = 19;
const NEN = 10;                                    // số chấm glucose lúc đói (minh họa ~ 90 mg/dL)
let S = null;

function boCuc(W, H) {
  const gY = Math.round(H * 0.64);                 // đồ thị ở dưới
  return { tuy: { x: 8, y: 8, w: 74, h: 46 }, mach: { y0: 62, y1: 96 }, tb: [0.42, 0.62, 0.82].map(k => ({ x: W * k, y: 22, r: 15 })),
           g: { x: 34, y: gY, w: W - 44, h: H - gY - 16 } };
}
const pha = t => t < T_T1 ? 'thuong' : t < T_T2 ? 't1' : 't2';

export default {
  id: 'insulin-duong-mau',
  ten: 'Insulin và đường máu',
  nut: 'Insulin, đường máu',
  nhom: 'benh',
  vi_tri: null,
  diem: null,
  giai_doan: [
    { t: 0, bo_phan: 'ruot-non', mo_ta: 'Sau bữa ăn, tinh bột được tiêu hóa thành glucose, hấp thu qua ruột non vào máu: đường máu tăng', thuc_te: 'đường đơn được hấp thu vào mao mạch nhung mao rồi theo tĩnh mạch cửa về gan' },
    { t: T_INS, bo_phan: 'tuy', mo_ta: 'Tế bào beta ở đảo tụy nhận ra đường máu tăng và tiết insulin vào máu', thuc_te: 'tế bào beta chiếm khoảng 75% tế bào mỗi đảo tụy; tế bào alpha (khoảng 20%) tiết glucagon làm tăng đường máu khi đói' },
    { t: T_VAO, bo_phan: 'gan', mo_ta: 'Insulin như chìa khóa: gắn vào tế bào cơ, mỡ để mở cửa cho glucose đi vào; gan cất glucose thành glycogen — đường máu trở về mức bình thường', thuc_te: 'lúc đói, đường máu bình thường khoảng 70–100 mg/dL' },
    { t: T_T1, bo_phan: 'tuy', mo_ta: 'Đái tháo đường týp 1: hệ miễn dịch đã phá hủy tế bào beta, tụy không tạo được insulin — glucose không vào được tế bào, ứ lại trong máu', thuc_te: 'týp 1 chiếm khoảng 5–10% số ca, thường khởi phát khi còn trẻ; người bệnh cần insulin hằng ngày' },
    { t: T_T2, bo_phan: 'tuy', mo_ta: 'Đái tháo đường týp 2: tụy vẫn tiết insulin nhưng tế bào kém đáp ứng (kháng insulin) — cửa mở chậm, glucose vào ít, đường máu vẫn cao', thuc_te: 'týp 2 chiếm khoảng 90–95% số ca; khoảng 80–90% người bệnh thừa cân hoặc béo phì; giảm cân, vận động giúp phòng và làm chậm bệnh' },
    { t: 0, cuoi: true, bo_phan: 'than', mo_ta: 'Đường máu cao kéo dài làm hỏng mạch máu nhỏ và lớn: thận, mắt, thần kinh, tim, não', thuc_te: 'chẩn đoán đái tháo đường khi đường máu lúc đói từ 126 mg/dL (7,0 mmol/L) trở lên' }
  ],
  chu_giai: [
    { mau: '#ffb36b', ten: 'Glucose' }, { mau: '#ffe066', ten: 'Insulin' }, { mau: '#5be38a', ten: 'Cửa nhận insulin (thụ thể)' },
    { mau: '#ff9ecb', ten: 'Tụy (tế bào beta)' }, { mau: '#c58bff', ten: 'Tế bào cơ, mỡ' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: thời gian một bữa ăn (vài giờ) nén còn vài giây; đồ thị chỉ minh họa xu hướng, không phải số đo thật; bỏ qua gan tạo glucose, glucagon và nhiều hormone khác; "cửa" là hình ảnh tượng trưng cho cơ chế insulin giúp tế bào nhận glucose.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    S = { t: 0, xong: false, glu: [], ins: [], vet: [], phaCu: 'thuong', cua: [0, 0, 0] };
    const L = boCuc(this.W, this.H);
    for (let i = 0; i < NEN; i++) S.glu.push(this._g(L));
  },
  _g(L, x) { return { x: x ?? rnd(10, this.W - 10), y: rnd(L.mach.y0 + 5, L.mach.y1 - 5), vx: rnd(10, 25), st: 'mau' }; },

  cap_nhat(dt) {
    const W = this.W, L = boCuc(W, this.H); S.t += dt; const t = S.t, p = pha(t);
    // đổi kịch bản: đường máu và insulin về mức lúc đói
    if (p !== S.phaCu) {
      S.phaCu = p; S.ins = []; S.cua = [0, 0, 0];
      S.glu = S.glu.filter(g => g.st === 'mau').slice(0, NEN);
      while (S.glu.filter(g => g.st === 'mau').length < NEN) S.glu.push(this._g(L));
    }
    const t0 = p === 'thuong' ? 0 : p === 't1' ? T_T1 : T_T2, k = t - t0;
    // bữa ăn: glucose từ ruột vào máu trong khoảng 1,5 giây đầu mỗi kịch bản
    if (k < 1.5 && Math.random() < dt * 14) S.glu.push(this._g(L, rnd(0, 20)));
    // tụy tiết insulin (týp 1: không có)
    const dangMau = S.glu.filter(g => g.st === 'mau').length;
    if (p !== 't1' && k > (p === 'thuong' ? T_INS : 1.2) && dangMau > NEN && Math.random() < dt * 6)
      S.ins.push({ x: L.tuy.x + L.tuy.w / 2 + rnd(-10, 10), y: L.tuy.y + L.tuy.h, vx: rnd(15, 30), vy: 18, st: 'mau' });
    for (const n of S.ins) {
      if (n.st === 'mau') {
        n.x += n.vx * dt; n.y += n.vy * dt; if (n.y > L.mach.y1 - 6) n.vy = -Math.abs(n.vy); if (n.y < L.mach.y0 + 4) n.vy = Math.abs(n.vy);
        if (n.x > W + 8) n.x = 4;
        // gắn vào cửa tế bào gần nhất
        if (k > (p === 'thuong' ? T_VAO - 0.3 : 2.2)) for (let i = 0; i < 3; i++) { const c = L.tb[i]; if (Math.abs(n.x - c.x) < 8 && S.cua[i] < 1) { n.st = 'gan'; n.i = i; S.cua[i] = Math.min(1, S.cua[i] + (p === 't2' ? 0.25 : 0.6)); } }
      }
    }
    S.ins = S.ins.filter(n => n.st === 'mau').slice(-30);
    // glucose: trôi trong mạch; vào tế bào khi cửa mở (týp 2: cửa mở kém)
    const moCua = p === 't2' ? 0.18 : 1;
    for (const g of S.glu) {
      if (g.st === 'mau') {
        g.x += g.vx * dt; if (g.x > W + 6) g.x = -4;
        for (let i = 0; i < 3; i++) {
          const c = L.tb[i];
          if (S.cua[i] > 0.5 && Math.abs(g.x - c.x) < 10 && dangMau > NEN - 2 && Math.random() < dt * 6 * moCua) { g.st = 'vao'; g.c = i; }
        }
      } else if (g.st === 'vao') {
        const c = L.tb[g.c]; g.x += (c.x - g.x) * dt * 4; g.y += (c.y - g.y) * dt * 4;
        if (Math.hypot(c.x - g.x, c.y - g.y) < 3) g.st = 'het';
      }
    }
    S.glu = S.glu.filter(g => g.st !== 'het');
    for (let i = 0; i < 3; i++) S.cua[i] = Math.max(0, S.cua[i] - dt * 0.08);
    S.vet.push({ t, n: S.glu.filter(g => g.st === 'mau').length });
    if (t >= T_HET) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t, p = pha(t);
    const dot = (x, y, r, f) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // tụy với các tế bào beta
    ctx.strokeStyle = 'rgba(255,158,203,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(L.tuy.x, L.tuy.y, L.tuy.w, L.tuy.h, 10); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const x = L.tuy.x + 12 + i * 12, y = L.tuy.y + 22;
      if (p === 't1') { ctx.strokeStyle = 'rgba(255,158,203,.45)'; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
      else dot(x, y, 4.5, 'rgba(255,158,203,.75)');
    }
    ctx.font = '11px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#ff9ecb'; ctx.fillText(p === 't1' ? 'beta bị hủy' : 'tụy (beta)', L.tuy.x + 6, L.tuy.y + L.tuy.h - 6);
    // mạch máu
    ctx.fillStyle = 'rgba(255,77,106,.13)'; ctx.fillRect(0, L.mach.y0, W, L.mach.y1 - L.mach.y0);
    ctx.strokeStyle = 'rgba(255,77,106,.5)'; ctx.beginPath(); ctx.moveTo(0, L.mach.y0); ctx.lineTo(W, L.mach.y0); ctx.moveTo(0, L.mach.y1); ctx.lineTo(W, L.mach.y1); ctx.stroke();
    ctx.fillStyle = '#8fa8bd'; ctx.fillText('máu', 6, L.mach.y1 - 4);
    // tế bào cơ, mỡ với cửa (thụ thể) ở mặt dưới
    L.tb.forEach((c, i) => {
      dot(c.x, c.y, c.r, 'rgba(197,139,255,.25)'); ctx.strokeStyle = '#c58bff'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.stroke();
      const mo = S.cua[i] > 0.5;
      ctx.strokeStyle = mo ? '#5be38a' : 'rgba(91,227,138,.4)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(c.x - 6, c.y + c.r + 1); ctx.lineTo(c.x - (mo ? 8 : 2), c.y + c.r + 9); ctx.moveTo(c.x + 6, c.y + c.r + 1); ctx.lineTo(c.x + (mo ? 8 : 2), c.y + c.r + 9); ctx.stroke(); ctx.lineWidth = 1;
      if (S.cua[i] > 0.1) dot(c.x, c.y + c.r + 10, 3, '#ffe066');
    });
    ctx.fillStyle = '#c58bff'; ctx.textAlign = 'center'; ctx.fillText('tế bào cơ, mỡ', L.tb[1].x, 58); ctx.textAlign = 'left';
    for (const g of S.glu) { ctx.save(); ctx.translate(g.x, g.y); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.lineTo(Math.cos(a) * 3.2, Math.sin(a) * 3.2); } ctx.closePath(); ctx.fillStyle = '#ffb36b'; ctx.fill(); ctx.restore(); }
    for (const n of S.ins) dot(n.x, n.y, 2.4, '#ffe066');
    // nhãn kịch bản
    ctx.textAlign = 'right'; ctx.font = '600 12px "Be Vietnam Pro",sans-serif';
    ctx.fillStyle = p === 'thuong' ? '#5be38a' : '#ff8fa3';
    ctx.fillText(p === 'thuong' ? 'Người bình thường' : p === 't1' ? 'Đái tháo đường týp 1' : 'Đái tháo đường týp 2', W - 6, L.mach.y1 + 14);
    ctx.textAlign = 'left';
    // đồ thị đường máu (minh họa)
    const G = L.g, gt = n => G.y + G.h - Math.min(1, n / (NEN * 3.8)) * G.h;
    ctx.strokeStyle = 'rgba(143,168,189,.35)'; ctx.strokeRect(G.x, G.y, G.w, G.h);
    ctx.fillStyle = 'rgba(91,227,138,.1)'; ctx.fillRect(G.x, gt(NEN * 1.1), G.w, gt(NEN * 0.8) - gt(NEN * 1.1));
    ctx.fillStyle = '#8fa8bd'; ctx.font = '10px "Be Vietnam Pro",sans-serif';
    ctx.fillText('đường máu (minh họa)', G.x + 4, G.y + 10); ctx.fillText('vùng lúc đói bình thường', G.x + 4, gt(NEN * 0.8) - 2);
    for (const m of [T_T1, T_T2]) { const x = G.x + m / T_HET * G.w; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, G.y); ctx.lineTo(x, G.y + G.h); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = '#ffb36b'; ctx.lineWidth = 1.6; ctx.beginPath();
    S.vet.forEach((v, i) => { const x = G.x + v.t / T_HET * G.w, y = gt(v.n); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineWidth = 1;
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 130, 60, 260, 32);
      ctx.strokeStyle = '#7fe8ff'; ctx.strokeRect(W / 2 - 130, 60, 260, 32);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Hết 3 kịch bản — bấm lại để xem lần nữa', W / 2, 81); ctx.textAlign = 'left';
    }
  }
};
