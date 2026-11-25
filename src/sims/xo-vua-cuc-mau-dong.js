// Mô phỏng: mảng xơ vữa hình thành trong thành động mạch, nứt vỡ, cục máu đông bít mạch (nhồi máu cơ tim, đột quỵ).
// Nguồn: MSD Manual — Atherosclerosis (hình thành mảng, tế bào bọt, vỏ xơ, nứt vỡ và cục máu đông);
// MSD Manual — Acute Coronary Syndromes (tiểu cầu dính hơn, mô tim chết khi thiếu máu quá vài phút); CDC — Stroke.
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = x => Math.max(0, Math.min(1, x));
const T_LDL = 3, T_HEP = 7, T_VO = 11, T_BIT = 14, T_HET = 19;
let S = null;

// Bố cục: một đoạn động mạch cắt dọc; mô được động mạch nuôi ở bên phải
function boCuc(W, H) {
  const tren = 30, duoi = H - 44, giua = (tren + duoi) / 2, mangX = W * 0.42, mo = W * 0.8;
  return { tren, duoi, giua, day: 12, mangX, mangR: W * 0.14, mo };
}

export default {
  id: 'xo-vua-cuc-mau-dong',
  ten: 'Xơ vữa động mạch và cục máu đông',
  nut: 'Xơ vữa, cục máu đông',
  nhom: 'benh',
  vi_tri: null,
  diem: null,
  giai_doan: [
    { t: 0, bo_phan: 'dong-mach-chu', mo_ta: 'Động mạch khỏe: lớp lót trong trơn láng, máu chảy thông suốt', thuc_te: 'xơ vữa hay xảy ra ở các động mạch vừa và lớn, nhất là chỗ động mạch chia nhánh' },
    { t: T_LDL, mo_ta: 'Lớp lót bị tổn thương nhỏ lặp đi lặp lại (hút thuốc, huyết áp cao, đường máu cao…); cholesterol LDL thấm vào thành mạch; bạch cầu chui vào, ăn cholesterol thành tế bào bọt', thuc_te: 'quá trình diễn ra âm thầm trong nhiều năm, thường không có triệu chứng' },
    { t: T_HEP, mo_ta: 'Mảng xơ vữa lớn dần: cholesterol, canxi tích tụ, phủ ngoài một vỏ xơ; lòng mạch hẹp lại, máu qua ít hơn', thuc_te: 'hẹp động mạch vành gây đau thắt ngực khi gắng sức; hẹp động mạch chân gây đau bắp chân khi đi bộ' },
    { t: T_VO, mo_ta: 'Mảng xơ vữa nứt vỡ: chất bên trong lộ ra làm tiểu cầu dính hơn, bám vào chỗ vỡ và kết lại thành cục máu đông', thuc_te: 'nứt vỡ mảng xơ vữa rồi tạo cục máu đông là nguyên nhân chính của nhồi máu cơ tim và đột quỵ' },
    { t: T_BIT, bo_phan: 'tim', mo_ta: 'Cục máu đông bít kín lòng mạch: mô phía sau không còn máu nuôi — ở tim là nhồi máu cơ tim, ở não là đột quỵ', thuc_te: 'mô tim bắt đầu chết nếu thiếu máu quá vài phút; với đột quỵ, mỗi phút đều quan trọng — gọi cấp cứu ngay' },
    { t: 0, cuoi: true, bo_phan: 'nao', mo_ta: 'Phòng ngừa từ sớm: bỏ thuốc lá, ăn uống lành mạnh, vận động, kiểm soát huyết áp, cholesterol LDL và đường máu', thuc_te: 'lợi ích của việc bỏ thuốc lá bắt đầu ngay và tăng dần theo thời gian' }
  ],
  chu_giai: [
    { mau: '#ff4d6a', ten: 'Hồng cầu' }, { mau: '#e8d27a', ten: 'Cholesterol LDL' }, { mau: '#4d8dff', ten: 'Bạch cầu, tế bào bọt' },
    { mau: '#c58bff', ten: 'Tiểu cầu' }, { mau: '#b33a52', ten: 'Cục máu đông' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: quá trình thật kéo dài nhiều năm (riêng cục máu đông hình thành trong vài phút) được nén vào vài giây; một đoạn mạch cắt dọc, không theo tỷ lệ; không phải mảng xơ vữa nào cũng vỡ và không phải cục máu đông nào cũng bít kín mạch.',

  get xong() { return !!S?.xong; },

  khoi_tao() { S = { t: 0, xong: false, hc: [], ldl: [], bc: [], tc: [], hen: 0 }; },

  cap_nhat(dt) {
    const W = this.W, H = this.H, L = boCuc(W, H); S.t += dt; const t = S.t;
    const cao = clamp((t - T_LDL) / (T_VO - T_LDL)) * 0.55;       // mảng xơ vữa chiếm tối đa khoảng nửa lòng mạch; phần còn lại do cục máu đông bít
    S.cao = cao;
    const tdc = clamp((t - T_VO) / (T_BIT - T_VO));               // cục máu đông lớn dần
    const kin = t >= T_BIT;
    // hồng cầu: càng hẹp càng ít máu qua; bít kín thì dồn lại trước chỗ tắc
    if ((S.hen -= dt) <= 0) { S.hen = 0.12 / Math.max(0.15, 1 - cao * 0.8); S.hc.push({ x: -6, y: rnd(L.tren + L.day + 6, L.duoi - L.day - 6), v: rnd(70, 95) }); }
    for (const h of S.hc) {
      const truocTac = h.x < L.mangX - L.mangR * 0.2;
      if (kin && truocTac && h.x > L.mangX - L.mangR - 8 - rnd(0, 30)) continue;     // dừng lại trước cục máu đông
      h.x += h.v * dt;
      // bị đẩy lên khi đi qua chỗ hẹp
      const dx = Math.abs(h.x - L.mangX); if (dx < L.mangR) { const day = L.duoi - L.day - (L.duoi - L.tren - 2 * L.day) * cao * Math.cos(dx / L.mangR * Math.PI / 2); if (h.y > day - 4) h.y = day - 4; }
    }
    S.hc = S.hc.filter(h => h.x < W + 8).slice(-90);
    // cholesterol LDL thấm vào thành dưới, bạch cầu chui vào thành tế bào bọt
    if (t >= T_LDL && t < T_VO && Math.random() < dt * 5) S.ldl.push({ x: L.mangX + rnd(-L.mangR, L.mangR) * 0.8, y: L.tren + L.day + rnd(6, 20), st: 'troi' });
    for (const p of S.ldl) if (p.st === 'troi') { p.y += 45 * dt; if (p.y >= L.duoi - L.day + rnd(2, 8)) p.st = 'thanh'; }
    if (t >= T_LDL + 1 && t < T_VO && S.bc.length < 6 && Math.random() < dt * 1.2) S.bc.push({ x: L.mangX + rnd(-L.mangR, L.mangR) * 0.6, y: L.duoi - L.day + 4, bot: 0 });
    for (const b of S.bc) b.bot = Math.min(1, b.bot + dt * 0.4);
    // tiểu cầu tụ vào chỗ vỡ
    if (t >= T_VO && t < T_HET - 2 && Math.random() < dt * 14) S.tc.push({ x: rnd(-4, L.mangX - L.mangR), y: rnd(L.tren + L.day + 4, L.duoi - L.day - 4), st: 'troi' });
    for (const p of S.tc) {
      if (p.st !== 'troi') continue;
      const dichX = L.mangX + rnd(-8, 8), dichY = L.giua + (L.duoi - L.giua) * (1 - tdc) * 0.6;
      p.x += (dichX - p.x) * dt * 1.8 + 20 * dt; p.y += (dichY - p.y) * dt * 1.5;
      if (Math.abs(p.x - dichX) < 6) p.st = 'bam';
    }
    if (t >= T_HET) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t, cao = S.cao || 0;
    const dot = (x, y, r, f) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // mô được nuôi phía sau chỗ hẹp: tối dần khi bị bít
    const thieu = clamp((t - T_BIT) / 2);
    ctx.fillStyle = `rgba(${Math.round(255 - 150 * thieu)},${Math.round(120 - 80 * thieu)},${Math.round(150 - 90 * thieu)},.18)`;
    ctx.fillRect(L.mo, L.tren, W - L.mo, L.duoi - L.tren);
    // lòng mạch và thành mạch
    ctx.fillStyle = 'rgba(255,77,106,.10)'; ctx.fillRect(0, L.tren + L.day, W, L.duoi - L.tren - 2 * L.day);
    ctx.fillStyle = 'rgba(255,143,163,.28)'; ctx.fillRect(0, L.tren, W, L.day); ctx.fillRect(0, L.duoi - L.day, W, L.day);
    // mảng xơ vữa trên thành dưới
    if (cao > 0.01) {
      const dinh = (L.duoi - L.tren - 2 * L.day) * cao;
      ctx.beginPath(); ctx.moveTo(L.mangX - L.mangR, L.duoi - L.day);
      for (let i = 0; i <= 30; i++) { const a = -1 + 2 * i / 30, x = L.mangX + a * L.mangR; ctx.lineTo(x, L.duoi - L.day - dinh * Math.cos(a * Math.PI / 2)); }
      ctx.closePath(); ctx.fillStyle = 'rgba(232,210,122,.45)'; ctx.fill();
      ctx.strokeStyle = t >= T_HEP ? 'rgba(240,240,240,.7)' : 'rgba(232,210,122,.7)'; ctx.lineWidth = t >= T_HEP ? 2 : 1; ctx.stroke(); ctx.lineWidth = 1;
      if (t >= T_HEP) for (let i = 0; i < 5; i++) { const x = L.mangX - L.mangR * 0.5 + i * L.mangR * 0.25; dot(x, L.duoi - L.day - 4, 2, 'rgba(255,255,255,.55)'); }   // canxi
      if (t >= T_VO) { ctx.strokeStyle = '#ff4d6a'; ctx.lineWidth = 2; ctx.beginPath(); const x = L.mangX, y = L.duoi - L.day - dinh * 0.97; ctx.moveTo(x - 6, y - 2); ctx.lineTo(x - 1, y + 6); ctx.lineTo(x + 5, y); ctx.stroke(); ctx.lineWidth = 1; }
    }
    for (const p of S.ldl) dot(p.x, p.y, 2, '#e8d27a');
    for (const b of S.bc) { const x = b.x, y = L.duoi - L.day - 6; dot(x, y, 4 + b.bot * 2.5, `rgba(77,141,255,${0.5 + 0.3 * b.bot})`); if (b.bot > 0.5) for (let k = 0; k < 3; k++) dot(x - 2 + k * 2, y - 1, 1, '#e8d27a'); }
    // cục máu đông: lưới đỏ sẫm lớn dần từ chỗ vỡ tới thành trên
    const tdc = clamp((t - T_VO) / (T_BIT - T_VO));
    if (tdc > 0) {
      const day = L.duoi - L.day - (L.duoi - L.tren - 2 * L.day) * cao, ct = L.tren + L.day + (day - L.tren - L.day) * (1 - tdc);
      ctx.fillStyle = 'rgba(179,58,82,.85)'; ctx.beginPath(); ctx.ellipse(L.mangX, (ct + day) / 2 + 2, 14 + 10 * tdc, (day - ct) / 2 + 4, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,230,.35)'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(L.mangX - 14, ct + k * (day - ct) / 6); ctx.lineTo(L.mangX + 14, ct + (k + 1) * (day - ct) / 6); ctx.stroke(); }
    }
    for (const p of S.tc) dot(p.x, p.y, 1.8, '#c58bff');
    for (const h of S.hc) { ctx.beginPath(); ctx.ellipse(h.x, h.y, 4, 2.6, 0, 0, 7); ctx.fillStyle = '#ff4d6a'; ctx.fill(); }
    ctx.font = '11px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd';
    ctx.fillText('dòng máu →', 6, L.tren - 8); ctx.fillText('thành động mạch', 6, H - 28);
    ctx.textAlign = 'right'; ctx.fillStyle = thieu > 0.3 ? '#ff8fa3' : '#8fa8bd';
    ctx.fillText(thieu > 0.3 ? 'mô thiếu máu' : 'mô được nuôi', W - 6, L.tren - 8);
    ctx.fillStyle = '#e8d27a'; ctx.textAlign = 'center'; if (cao > 0.15) ctx.fillText('mảng xơ vữa', L.mangX, H - 12);
    ctx.textAlign = 'left';
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 130, 6, 260, 30);
      ctx.strokeStyle = '#7fe8ff'; ctx.strokeRect(W / 2 - 130, 6, 260, 30);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Mạch đã bị bít — bấm lại để xem lần nữa', W / 2, 26); ctx.textAlign = 'left';
    }
  }
};
