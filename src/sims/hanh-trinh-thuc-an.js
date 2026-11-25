// Mô phỏng: hành trình của một miếng thức ăn qua ống tiêu hóa (sơ đồ cách điệu, không theo tỷ lệ).
// Nguồn: OpenStax Anatomy and Physiology 2e, mục 23.3 (miệng, thực quản), 23.4 (dạ dày),
// 23.5 (ruột non, ruột già), 23.6 (mật, dịch tụy), 23.7 (hấp thu).
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = x => Math.max(0, Math.min(1, x));
const MOC = [0, 3, 6, 10, 13, 17, 21];          // mốc bắt đầu từng giai đoạn (giây mô phỏng)
let S = null;

// Bố cục: các đoạn xếp từ trái sang phải; trả về khung từng đoạn
function boCuc(W, H) {
  const y = H * 0.42, x0 = 10, w = W - 20;
  const ti = [0.11, 0.15, 0.22, 0.29, 0.23];      // miệng, thực quản, dạ dày, ruột non, ruột già
  const ds = []; let x = x0;
  for (const k of ti) { ds.push({ a: x, b: x + k * w }); x += k * w; }
  return { y, ds, mau: H - 34 };
}
// Vị trí viên thức ăn theo thời gian: đi qua từng đoạn
function viTriVien(L, t) {
  const [m, tq, dd, rn, rg] = L.ds;
  const lerp = (d, k) => d.a + (d.b - d.a) * k;
  if (t < MOC[1]) return { x: lerp(m, 0.55), y: L.y };
  if (t < MOC[2]) return { x: lerp(tq, clamp((t - MOC[1]) / 3)), y: L.y };
  if (t < MOC[3]) return { x: lerp(dd, 0.2 + 0.6 * clamp((t - MOC[2]) / 4)) + Math.sin(t * 5) * 6, y: L.y + Math.cos(t * 4) * 5 };
  if (t < MOC[5]) { const k = clamp((t - MOC[3]) / 7); return { x: lerp(rn, k), y: L.y + Math.sin(k * Math.PI * 8) * 9 }; }
  return { x: lerp(rg, clamp((t - MOC[5]) / 5)), y: L.y };
}

export default {
  id: 'hanh-trinh-thuc-an',
  ten: 'Hành trình của thức ăn qua ống tiêu hóa',
  nut: 'Tiêu hóa',
  nhom: 'van-hanh',
  vi_tri: null,
  diem: null,
  giai_doan: [
    { t: MOC[0], mo_ta: 'Miệng: răng nhai nhỏ thức ăn, nước bọt làm ướt; men amylase trong nước bọt bắt đầu cắt tinh bột; lưỡi vo thức ăn thành viên', thuc_te: 'mỗi ngày tiết khoảng 1–1,5 lít nước bọt; thức ăn ở miệng quá ngắn nên tinh bột mới được cắt một phần' },
    { t: MOC[1], bo_phan: 'thuc-quan', mo_ta: 'Nuốt: các làn sóng nhu động của thực quản đẩy viên thức ăn xuống; cơ thắt dưới thực quản mở cho thức ăn vào rồi đóng lại để axit dạ dày không trào ngược', thuc_te: 'nuốt mất khoảng 4–8 giây với thức ăn đặc, khoảng 1 giây với chất lỏng; thực quản dài khoảng 25 cm' },
    { t: MOC[2], bo_phan: 'da-day', mo_ta: 'Dạ dày: co bóp nhào trộn thức ăn với dịch vị (axit HCl, men pepsin cắt protein) thành dưỡng chấp sệt; mỗi lần chỉ khoảng 3 ml đi qua môn vị xuống ruột', thuc_te: 'dịch vị có pH 1,5–3,5; dạ dày rỗng sau 2–4 giờ, bữa nhiều mỡ có thể 6 giờ trở lên; dạ dày giãn chứa được tới khoảng 4 lít' },
    { t: MOC[3], bo_phan: 'tui-mat', mo_ta: 'Tá tràng (đoạn đầu ruột non): túi mật co lại đẩy mật (do gan tạo ra) xuống, nhũ tương hóa mỡ thành giọt nhỏ; dịch tụy có bicarbonat trung hòa axit và các men cắt tinh bột, protein, mỡ', thuc_te: 'gan tiết khoảng 1 lít mật mỗi ngày, túi mật cô đặc mật tới 10 lần; tụy tiết hơn 1 lít dịch tụy mỗi ngày' },
    { t: MOC[4], bo_phan: 'ruot-non', mo_ta: 'Ruột non: các men cắt thức ăn tới đơn vị nhỏ nhất (đường đơn, axit amin, axit béo) rồi hấp thu qua thành ruột vào máu và bạch huyết', thuc_te: 'ruột non dài khoảng 3 m ở người sống; dưỡng chấp đi qua hết trong 3–5 giờ; hấp thu gần hết thức ăn và khoảng 90% nước' },
    { t: MOC[5], bo_phan: 'ruot-gia', mo_ta: 'Ruột già: hút phần nước còn lại, vi khuẩn sống trong ruột lên men phần bã và tạo một số vitamin; bã đặc dần thành phân', thuc_te: 'bã ở ruột già khoảng 12–24 giờ; hơn 700 loài vi khuẩn, tạo vitamin K, biotin; mỗi 500 ml bã vào ruột già còn khoảng 150 ml phân' },
    { t: 0, cuoi: true, bo_phan: 'ruot-gia', mo_ta: 'Thải phân: phân xuống trực tràng gây phản xạ đại tiện qua tủy sống; cơ thắt hậu môn ngoài giúp ta chủ động nhịn hoặc đi', thuc_te: 'toàn bộ quá trình tiêu hóa một bữa ăn mất khoảng 24–72 giờ' }
  ],
  chu_giai: [
    { mau: '#ffb36b', ten: 'Thức ăn, dưỡng chấp' }, { mau: '#7fe8ff', ten: 'Nước bọt, nước' }, { mau: '#e8d27a', ten: 'Dịch vị (axit)' },
    { mau: '#5be38a', ten: 'Mật, dịch tụy' }, { mau: '#ff4d6a', ten: 'Chất dinh dưỡng vào máu' }, { mau: '#c58bff', ten: 'Vi khuẩn đường ruột' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: sơ đồ duỗi thẳng ống tiêu hóa, không theo tỷ lệ; thời gian nén từ 1–3 ngày xuống khoảng 20 giây (các đoạn không cùng tỷ lệ nén); thực tế thức ăn đi liên tục, nhiều bữa nối nhau.',

  get xong() { return !!S?.xong; },

  khoi_tao() { S = { t: 0, xong: false, giot: [], vk: [] }; for (let i = 0; i < 14; i++) S.vk.push({ k: Math.random(), dy: rnd(-12, 12), p: rnd(0, 6) }); },

  cap_nhat(dt) {
    const W = this.W, H = this.H, L = boCuc(W, H); S.t += dt; const t = S.t, v = viTriVien(L, t);
    const [m, , dd, rn, rg] = L.ds;
    const them = (o) => S.giot.push({ song: 1.2, ...o });
    if (t < MOC[1] && Math.random() < dt * 10) them({ x: rnd(m.a + 4, m.b - 4), y: L.y - 22, vx: 0, vy: 30, mau: '#7fe8ff' });           // nước bọt
    if (t >= MOC[2] && t < MOC[3] && Math.random() < dt * 14) them({ x: rnd(dd.a + 10, dd.b - 10), y: L.y - 26, vx: 0, vy: 28, mau: '#e8d27a' }); // dịch vị
    if (t >= MOC[3] && t < MOC[4] + 1 && Math.random() < dt * 12) them({ x: rn.a + rnd(4, 18), y: L.y - 34, vx: 0, vy: 34, mau: '#5be38a' });   // mật, dịch tụy
    if (t >= MOC[4] && t < MOC[5] && Math.random() < dt * 14) them({ x: v.x + rnd(-6, 6), y: v.y + 6, vx: 0, vy: 40, mau: '#ff4d6a', song: 2 }); // chất dinh dưỡng xuống máu
    if (t >= MOC[5] && t < MOC[6] && Math.random() < dt * 10) them({ x: v.x + rnd(-8, 8), y: v.y + 6, vx: 0, vy: 40, mau: '#7fe8ff', song: 2 }); // nước được hút
    for (const g of S.giot) { g.x += g.vx * dt; g.y += g.vy * dt; g.song -= dt; }
    S.giot = S.giot.filter(g => g.song > 0 && g.y < L.mau + 8);
    if (t >= MOC[6] + 1.5) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t, v = viTriVien(L, t);
    const [m, tq, dd, rn, rg] = L.ds;
    const dot = (x, y, r, f) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    const dangO = t < MOC[1] ? 0 : t < MOC[2] ? 1 : t < MOC[3] ? 2 : t < MOC[5] ? 3 : 4;
    const net = i => i === dangO ? 'rgba(255,179,107,.9)' : 'rgba(255,179,107,.4)';
    ctx.lineWidth = 1.5;
    // miệng
    ctx.strokeStyle = net(0); ctx.beginPath(); ctx.ellipse((m.a + m.b) / 2, L.y, (m.b - m.a) / 2, 16, 0, 0, 7); ctx.stroke();
    // thực quản: ống hẹp, vòng nhu động chạy dọc
    ctx.strokeStyle = net(1); ctx.strokeRect(tq.a, L.y - 6, tq.b - tq.a, 12);
    if (dangO === 1) { const x = tq.a + (tq.b - tq.a) * clamp((t - MOC[1]) / 3) - 8; ctx.strokeStyle = '#ffb36b'; ctx.beginPath(); ctx.moveTo(x, L.y - 9); ctx.lineTo(x, L.y + 9); ctx.stroke(); }
    // dạ dày: túi phình, co bóp
    const bop = dangO === 2 ? Math.sin(t * 6) * 3 : 0;
    ctx.strokeStyle = net(2); ctx.beginPath(); ctx.ellipse((dd.a + dd.b) / 2, L.y + 4, (dd.b - dd.a) / 2 - 2 + bop, 30 - bop, 0, 0, 7); ctx.stroke();
    // ruột non: ống uốn lượn
    ctx.strokeStyle = net(3); ctx.lineWidth = 9; ctx.globalAlpha = .35; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const k = i / 40, x = rn.a + (rn.b - rn.a) * k, y = L.y + Math.sin(k * Math.PI * 8) * 9; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1.5;
    // ruột già: ống to, có vi khuẩn
    ctx.strokeStyle = net(4); ctx.strokeRect(rg.a + 2, L.y - 15, rg.b - rg.a - 4, 30);
    for (const b of S.vk) { const x = rg.a + 6 + b.k * (rg.b - rg.a - 12), y = L.y + b.dy + Math.sin(t * 2 + b.p) * 2; ctx.fillStyle = 'rgba(197,139,255,.7)'; ctx.fillRect(x - 2, y - 1, 4, 2); }
    // mạch máu ở dưới nhận chất dinh dưỡng
    ctx.fillStyle = 'rgba(255,77,106,.18)'; ctx.fillRect(rn.a, L.mau, rg.b - rn.a, 8);
    ctx.fillStyle = '#8fa8bd'; ctx.font = '11px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('máu → tĩnh mạch cửa → gan', rg.b, L.mau + 20); ctx.textAlign = 'left';
    // mật, dịch tụy đổ vào đầu ruột non
    ctx.strokeStyle = 'rgba(91,227,138,.6)'; ctx.beginPath(); ctx.moveTo(rn.a + 11, L.y - 40); ctx.lineTo(rn.a + 11, L.y - 12); ctx.stroke();
    ctx.fillStyle = '#5be38a'; ctx.fillText('mật, dịch tụy', rn.a, L.y - 44);
    for (const g of S.giot) dot(g.x, g.y, 2, g.mau);
    // viên thức ăn: nhỏ dần, đổi từ viên sang dưỡng chấp sệt rồi thành phân sẫm
    const r = dangO < 2 ? 7 : dangO === 2 ? 7.5 : dangO === 3 ? 6 : 6 - 2 * clamp((t - MOC[5]) / 4);
    const mau = dangO < 2 ? '#ffb36b' : dangO === 2 ? '#ffd29a' : dangO === 3 ? '#ffc27a' : '#9a6b3f';
    if (t < MOC[6] + 0.8) dot(v.x, v.y, r, mau);
    // tên đoạn
    ctx.font = '12px "Be Vietnam Pro",sans-serif';
    [['miệng', m], ['thực quản', tq], ['dạ dày', dd], ['ruột non', rn], ['ruột già', rg]].forEach(([s, d], i) => {
      ctx.fillStyle = i === dangO ? '#ffffff' : '#8fa8bd'; ctx.textAlign = 'center'; ctx.fillText(s, (d.a + d.b) / 2, L.y + (i % 2 ? 62 : 48));   // so le hai hàng cho khỏi chồng chữ
    });
    ctx.textAlign = 'left';
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 140, 8, 280, 32);
      ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 140, 8, 280, 32);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Hết hành trình — bấm lại để xem lần nữa', W / 2, 29); ctx.textAlign = 'left';
    }
  }
};
