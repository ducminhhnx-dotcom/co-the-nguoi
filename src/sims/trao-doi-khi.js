// Mô phỏng: trao đổi khí giữa phế nang và mao mạch phổi trong một nhịp thở.
// Nguồn: OpenStax Anatomy and Physiology 2e, mục 22.3 (cơ chế thở), 22.4 (trao đổi khí, phân áp), 22.5 (vận chuyển khí).
const rnd = (a, b) => a + Math.random() * (b - a);
const T_MAU = 3, T_O2 = 6, T_CO2 = 10, T_THO_RA = 14, T_HET = 18;
let S = null;

// Bố cục: phế nang ở trên, màng hô hấp, mao mạch ở dưới
function boCuc(W, H, t) {
  const mang = Math.round(H * 0.6);
  // phế nang phồng khi hít vào (0–3 s), xẹp khi thở ra (14–17 s)
  const phong = t < T_MAU ? 0.86 + 0.14 * t / T_MAU : t < T_THO_RA ? 1 : Math.max(0.86, 1 - 0.14 * (t - T_THO_RA) / 3);
  const cao = (mang - 26) * phong;
  return { mang, day: mang - 3, dinh: mang - 3 - cao, mmTren: mang + 5, mmDuoi: H - 22, cx: W / 2 };
}

export default {
  id: 'trao-doi-khi',
  ten: 'Trao đổi khí ở phế nang',
  nut: 'Trao đổi khí',
  nhom: 'van-hanh',
  vi_tri: 'phoi',
  diem: 'phoi',
  giai_doan: [
    { t: 0, mo_ta: 'Hít vào: cơ hoành và cơ liên sườn ngoài co, lồng ngực nở rộng, áp suất trong phế nang xuống thấp hơn khí trời nên không khí tràn vào', thuc_te: 'mỗi lần thở bình thường đưa vào khoảng 500 ml khí; người lớn lúc nghỉ thở 12–18 lần/phút' },
    { t: T_MAU, mo_ta: 'Hồng cầu nghèo oxy (xanh) chạy qua mao mạch sát phế nang', thuc_te: 'máu tới phổi có phân áp O₂ khoảng 40 mmHg, CO₂ khoảng 45 mmHg; khí trong phế nang có O₂ khoảng 104 mmHg, CO₂ khoảng 40 mmHg' },
    { t: T_O2, mo_ta: 'O₂ khuếch tán qua màng hô hấp rất mỏng vào máu, từ nơi phân áp cao sang nơi thấp, không tốn năng lượng; hồng cầu đỏ dần', thuc_te: 'chênh lệch phân áp O₂ khoảng 64 mmHg; mỗi phân tử hemoglobin mang được tối đa 4 phân tử O₂; chỉ khoảng 1,5% O₂ hòa tan trong huyết tương' },
    { t: T_CO2, mo_ta: 'CO₂ đi theo chiều ngược lại: từ máu sang phế nang', thuc_te: 'chênh lệch phân áp CO₂ chỉ khoảng 5 mmHg, nhưng CO₂ hòa tan tốt gấp khoảng 20 lần O₂ nên lượng qua màng tương đương; trong máu, CO₂ đi chủ yếu dưới dạng bicarbonat (khoảng 70%)' },
    { t: T_THO_RA, mo_ta: 'Thở ra: cơ hoành và cơ liên sườn giãn, phổi tự co lại nhờ tính đàn hồi, đẩy khí giàu CO₂ ra ngoài', thuc_te: 'thở ra lúc nghỉ là quá trình thụ động, không tốn năng lượng' },
    { t: 0, cuoi: true, mo_ta: 'Máu giàu oxy theo tĩnh mạch phổi về tim trái rồi đi nuôi cơ thể; nhịp thở sau lặp lại', thuc_te: 'máu rời phổi có phân áp O₂ khoảng 100 mmHg; hemoglobin bão hòa oxy khoảng 95–99% ở người khỏe' }
  ],
  chu_giai: [
    { mau: '#7fe8ff', ten: 'O₂' }, { mau: '#c58bff', ten: 'CO₂' },
    { mau: '#4d8dff', ten: 'Hồng cầu nghèo oxy' }, { mau: '#ff4d6a', ten: 'Hồng cầu giàu oxy' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: thực tế O₂ và CO₂ trao đổi cùng lúc và liên tục, mô phỏng tách thành từng bước cho dễ theo dõi; một nhịp thở thật chỉ khoảng 4 giây; số phân tử và kích thước đã được phóng to rất nhiều.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    S = { t: 0, xong: false, o2: [], co2: [], hc: [], hen: 0 };
    const L = boCuc(this.W, this.H, 0);
    for (let i = 0; i < 8; i++) S.o2.push({ x: rnd(30, this.W - 30), y: rnd(L.dinh + 10, L.day - 8), vx: rnd(-20, 20), vy: rnd(-20, 20), st: 'khi' });
    for (let i = 0; i < 5; i++) S.co2.push({ x: rnd(30, this.W - 30), y: rnd(L.dinh + 10, L.day - 8), vx: rnd(-20, 20), vy: rnd(-20, 20), st: 'khi' });
  },

  cap_nhat(dt) {
    const W = this.W, H = this.H; S.t += dt;
    const t = S.t, L = boCuc(W, H, t), mmY = (L.mmTren + L.mmDuoi) / 2;
    // hít vào: không khí giàu O₂ vào qua tiểu phế quản ở đỉnh
    if (t < T_MAU && Math.random() < dt * 10) S.o2.push({ x: L.cx + rnd(-6, 6), y: 4, vx: rnd(-30, 30), vy: rnd(25, 45), st: 'khi' });
    // khí còn lại trong phổi giữ cho phế nang luôn nhiều O₂ tới lúc thở ra
    if (t >= T_MAU && t < T_THO_RA && S.o2.filter(p => p.st === 'khi').length < 26 && Math.random() < dt * 20)
      S.o2.push({ x: rnd(20, W - 20), y: rnd(L.dinh + 8, L.day - 20), vx: rnd(-20, 20), vy: rnd(-20, 20), st: 'khi' });
    // hồng cầu chảy trái → phải
    if ((S.hen -= dt) <= 0) { S.hen = 1.1; S.hc.push({ x: -14, o2: 0, co2: 2, nha: 0 }); }
    for (const h of S.hc) {
      h.x += 34 * dt;
      // CO₂ rời hồng cầu sang phế nang
      if (t >= T_CO2 && h.co2 > 0 && h.x > 30 && h.x < W - 30 && Math.random() < dt * 2) { h.co2--; S.co2.push({ x: h.x, y: mmY, vx: rnd(-6, 6), vy: -42, st: 'qua' }); }
    }
    S.hc = S.hc.filter(h => h.x < W + 16);
    // phân tử khí trong phế nang: chuyển động nhiệt, dội vào thành
    const trongPN = p => {
      p.vx += rnd(-60, 60) * dt; p.vy += rnd(-60, 60) * dt;
      const v = Math.hypot(p.vx, p.vy); if (v > 40) { p.vx *= 40 / v; p.vy *= 40 / v; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 10 || p.x > W - 10) p.vx = -p.vx;
      p.x = Math.max(10, Math.min(W - 10, p.x));
      if (p.y < L.dinh + 6 && !(t >= T_THO_RA && Math.abs(p.x - L.cx) < 14)) { p.y = L.dinh + 6; p.vy = Math.abs(p.vy); }
      if (p.y > L.day - 4) { p.y = L.day - 4; p.vy = -Math.abs(p.vy); }
    };
    for (const p of S.o2) {
      if (p.st === 'khi') {
        if (t >= T_THO_RA) { p.vx += (L.cx - p.x) * dt * 0.8; p.vy -= 40 * dt; }   // thở ra: một phần khí ra ngoài
        trongPN(p);
        // sát màng thì khuếch tán sang hồng cầu còn chỗ
        if (t >= T_O2 && p.y > L.day - 30 && Math.random() < dt * 8) {
          const h = S.hc.filter(h => h.o2 + h.nha < 4 && h.x > 10 && h.x < W - 10).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
          if (h) { p.st = 'qua'; p.h = h; h.nha++; }
        }
      } else if (p.st === 'qua') {
        const dx = p.h.x - p.x, dy = mmY - p.y, d = Math.hypot(dx, dy) || 1;
        p.x += dx / d * 110 * dt; p.y += dy / d * 110 * dt;
        if (d < 5) { p.h.o2++; p.h.nha--; p.st = 'xong'; }
      }
    }
    S.o2 = S.o2.filter(p => p.st !== 'xong' && p.y > -6);
    for (const p of S.co2) {
      if (p.st === 'qua') { p.y += p.vy * dt; p.x += p.vx * dt; if (p.y < L.day - 6) { p.st = 'khi'; p.vy = rnd(-30, -10); } continue; }
      if (t >= T_THO_RA) { p.vx += (L.cx - p.x) * dt * 1.2; p.vy -= 60 * dt; }
      trongPN(p);
    }
    S.co2 = S.co2.filter(p => p.y > -6);
    if (t >= T_HET) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, t = S.t, L = boCuc(W, H, t), mmY = (L.mmTren + L.mmDuoi) / 2;
    const dot = (x, y, r, f, s) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = 1; ctx.stroke(); } };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // tiểu phế quản và phế nang
    ctx.fillStyle = 'rgba(127,232,255,.07)'; ctx.fillRect(L.cx - 12, 0, 24, L.dinh + 4);
    ctx.beginPath(); ctx.moveTo(6, L.day); ctx.lineTo(6, L.dinh + 18); ctx.quadraticCurveTo(6, L.dinh, 26, L.dinh);
    ctx.lineTo(L.cx - 12, L.dinh); ctx.lineTo(L.cx - 12, 0); ctx.moveTo(L.cx + 12, 0); ctx.lineTo(L.cx + 12, L.dinh);
    ctx.lineTo(W - 26, L.dinh); ctx.quadraticCurveTo(W - 6, L.dinh, W - 6, L.dinh + 18); ctx.lineTo(W - 6, L.day);
    ctx.strokeStyle = 'rgba(127,232,255,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(127,232,255,.05)'; ctx.fillRect(6, L.dinh, W - 12, L.day - L.dinh);
    // màng hô hấp
    ctx.fillStyle = 'rgba(232,210,122,.5)'; ctx.fillRect(0, L.mang - 2, W, 3);
    // mao mạch: nửa trái nghèo oxy, sang phải giàu dần
    const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(77,141,255,.22)'); g.addColorStop(1, t >= T_O2 ? 'rgba(255,77,106,.22)' : 'rgba(77,141,255,.22)');
    ctx.fillStyle = g; ctx.fillRect(0, L.mmTren, W, L.mmDuoi - L.mmTren);
    ctx.strokeStyle = 'rgba(255,77,106,.45)'; ctx.lineWidth = 1; ctx.strokeRect(-1, L.mmTren, W + 2, L.mmDuoi - L.mmTren);
    // hồng cầu: màu theo số O₂ đã gắn (0–4)
    for (const h of S.hc) {
      const k = h.o2 / 4, r = Math.round(77 + (255 - 77) * k), gg = Math.round(141 + (77 - 141) * k), b = Math.round(255 + (106 - 255) * k);
      ctx.beginPath(); ctx.ellipse(h.x, mmY, 11, 7, 0, 0, 7); ctx.fillStyle = `rgb(${r},${gg},${b})`; ctx.fill();
      ctx.beginPath(); ctx.ellipse(h.x, mmY, 5, 3, 0, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fill();
      for (let i = 0; i < 4; i++) dot(h.x - 7.5 + i * 5, mmY - 9, 1.6, i < h.o2 ? '#7fe8ff' : null, i < h.o2 ? null : 'rgba(127,232,255,.35)');
    }
    for (const p of S.o2) dot(p.x, p.y, 2.6, '#7fe8ff');
    for (const p of S.co2) { dot(p.x, p.y, 2.8, '#c58bff'); }
    ctx.font = '12px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd';
    ctx.fillText('phế nang', 12, L.dinh + 14 > L.day - 4 ? L.day - 4 : L.dinh + 14);
    ctx.fillText('mao mạch phổi', 8, H - 6);
    ctx.textAlign = 'right'; ctx.fillText('về tim trái →', W - 8, H - 6); ctx.textAlign = 'left';
    ctx.fillStyle = '#7fe8ff'; ctx.textAlign = 'right';
    ctx.fillText(t < T_MAU ? 'hít vào ↓' : t >= T_THO_RA && t < T_THO_RA + 3 ? 'thở ra ↑' : '', W / 2 - 18, 14); ctx.textAlign = 'left';
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 140, H / 2 - 40, 280, 36);
      ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 140, H / 2 - 40, 280, 36);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Hết một nhịp thở — bấm lại để xem tiếp', W / 2, H / 2 - 17); ctx.textAlign = 'left';
    }
  }
};
