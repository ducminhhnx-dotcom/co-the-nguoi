// Mô phỏng: hấp thu chất dinh dưỡng qua một nhung mao ruột non.
// Nguồn: OpenStax Anatomy and Physiology 2e, mục 23.5 (nhung mao, diện tích), 23.7 (tiêu hóa hóa học và hấp thu),
// 23.6 (gan nhận máu từ ống tiêu hóa qua tĩnh mạch cửa).
const rnd = (a, b) => a + Math.random() * (b - a);
const T_DUONG = 3, T_DAM = 7, T_MO = 11, T_HET = 15;
const LOAI = {
  duong: { mau: '#ffb36b', r: 2.4, dich: 'mm' },     // glucose, galactose, fructose → mao mạch
  dam: { mau: '#5be38a', r: 2.4, dich: 'mm' },       // axit amin → mao mạch
  mo: { mau: '#e8d27a', r: 3.6, dich: 'bh' }         // micelle → chylomicron → mạch bạch huyết
};
let S = null;

// Nhung mao: hình ngón tay dựng đứng ở giữa khung
function boCuc(W, H) {
  const cx = W / 2, rong = Math.min(110, W * 0.3), day = H - 26, dinh = 22;
  return { cx, rong, day, dinh, trai: cx - rong / 2, phai: cx + rong / 2, mm: cx + rong * 0.28, bh: cx, dm: cx - rong * 0.28 };
}

export default {
  id: 'hap-thu-ruot-non',
  ten: 'Hấp thu chất dinh dưỡng ở nhung mao ruột non',
  nut: 'Hấp thu ở ruột non',
  nhom: 'van-hanh',
  vi_tri: 'ruot-non',
  diem: null,
  giai_doan: [
    { t: 0, bo_phan: 'ruot-non', mo_ta: 'Lòng ruột non có nếp gấp, trên đó là hàng triệu nhung mao, mỗi tế bào phủ nhung mao lại có vi nhung mao; bên trong nhung mao có lưới mao mạch và một mạch bạch huyết ở giữa', thuc_te: 'nhung mao dài 0,5–1 mm; nếp gấp, nhung mao và vi nhung mao làm diện tích hấp thu tăng hơn 600 lần, tới khoảng 200 m²' },
    { t: T_DUONG, mo_ta: 'Tinh bột và đường đôi được cắt thành đường đơn (glucose, galactose, fructose); glucose và galactose đi vào tế bào cùng natri, rồi sang mao mạch', thuc_te: 'fructose đi vào bằng khuếch tán có hỗ trợ; ruột non hấp thu đường đơn khoảng 120 g mỗi giờ' },
    { t: T_DAM, mo_ta: 'Protein được cắt thành axit amin (và một ít đoạn 2–3 axit amin); axit amin được vận chuyển chủ động vào tế bào rồi sang mao mạch', thuc_te: '95–98% protein được tiêu hóa và hấp thu ở ruột non' },
    { t: T_MO, mo_ta: 'Mỡ được mật nhũ tương hóa và men lipase của tụy cắt nhỏ; các hạt micelle đưa axit béo tới tế bào; trong tế bào chúng được ráp lại thành hạt chylomicron, quá to để vào mao mạch nên đi vào mạch bạch huyết ở giữa', thuc_te: 'khoảng 95% chất béo được hấp thu ở ruột non; bạch huyết đổ về tĩnh mạch dưới đòn qua ống ngực' },
    { t: 0, cuoi: true, bo_phan: 'tinh-mach-cua', mo_ta: 'Máu chở đường và axit amin rời nhung mao, theo tĩnh mạch cửa về gan để được xử lý trước khi đi khắp cơ thể', thuc_te: 'toàn bộ máu từ ống tiêu hóa đều đi qua gan' }
  ],
  chu_giai: [
    { mau: '#ffb36b', ten: 'Đường đơn' }, { mau: '#5be38a', ten: 'Axit amin' }, { mau: '#e8d27a', ten: 'Mỡ (micelle, chylomicron)' },
    { mau: '#ff4d6a', ten: 'Mao mạch' }, { mau: '#f3f0d8', ten: 'Mạch bạch huyết' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: một nhung mao phóng to rất nhiều; các chất thật được hấp thu cùng lúc, mô phỏng tách lần lượt cho dễ theo dõi; bỏ qua vitamin, khoáng chất và nước.',

  get xong() { return !!S?.xong; },

  khoi_tao() { S = { t: 0, xong: false, h: [] }; },

  cap_nhat(dt) {
    const W = this.W, H = this.H, L = boCuc(W, H); S.t += dt; const t = S.t;
    const sinh = loai => { const ben = Math.random() < .5 ? -1 : 1; S.h.push({ loai, st: 'long', x: ben < 0 ? rnd(8, L.trai - 14) : rnd(L.phai + 14, W - 8), y: rnd(L.dinh, L.day - 10), ben }); };
    if (t >= T_DUONG && t < T_HET && Math.random() < dt * 4) sinh('duong');
    if (t >= T_DAM && t < T_HET && Math.random() < dt * 4) sinh('dam');
    if (t >= T_MO && t < T_HET && Math.random() < dt * 4) sinh('mo');
    for (const p of S.h) {
      const dinh = { mm: L.mm, bh: L.bh }[LOAI[p.loai].dich];
      if (p.st === 'long') {                         // trôi trong lòng ruột tới bề mặt nhung mao
        const muc = p.ben < 0 ? L.trai : L.phai;
        p.x += (muc - p.x) * dt * 1.2 + rnd(-8, 8) * dt; p.y += rnd(-14, 14) * dt;
        p.y = Math.max(L.dinh + 8, Math.min(L.day - 8, p.y));
        if (Math.abs(p.x - muc) < 3) p.st = 'te';
      } else if (p.st === 'te') {                    // qua tế bào phủ, sang mạch
        p.x += (dinh - p.x) * dt * 2.2;
        if (Math.abs(p.x - dinh) < 2) { p.st = 'mach'; if (p.loai === 'mo') p.chylo = true; }
      } else { p.x = dinh; p.y += 45 * dt; }         // theo dòng đi xuống, ra khỏi nhung mao
    }
    S.h = S.h.filter(p => p.y < H + 6);
    if (t >= T_HET && !S.h.length) S.xong = true;
    if (t >= T_HET + 6) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H);
    const dot = (x, y, r, f, s) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); if (s) { ctx.strokeStyle = s; ctx.lineWidth = 1; ctx.stroke(); } };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // lòng ruột
    ctx.fillStyle = 'rgba(255,179,107,.06)'; ctx.fillRect(0, 0, W, L.day);
    // nhung mao: hình ngón tay, viền tế bào phủ có vi nhung mao
    const r = L.rong / 2;
    ctx.beginPath(); ctx.moveTo(L.trai, L.day); ctx.lineTo(L.trai, L.dinh + r); ctx.arc(L.cx, L.dinh + r, r, Math.PI, 0); ctx.lineTo(L.phai, L.day);
    ctx.fillStyle = 'rgba(255,179,107,.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,179,107,.7)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,179,107,.45)'; ctx.lineWidth = 1;
    for (let y = L.dinh + r; y < L.day; y += 5) { ctx.beginPath(); ctx.moveTo(L.trai, y); ctx.lineTo(L.trai - 4, y); ctx.moveTo(L.phai, y); ctx.lineTo(L.phai + 4, y); ctx.stroke(); }
    // mao mạch: động mạch nhỏ đi lên (trái), tĩnh mạch nhỏ đi xuống (phải), nối vòng ở đỉnh
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,77,106,.6)'; ctx.beginPath(); ctx.moveTo(L.dm, L.day); ctx.lineTo(L.dm, L.dinh + r); ctx.quadraticCurveTo(L.cx, L.dinh + 2, L.mm, L.dinh + r); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,77,106,.85)'; ctx.beginPath(); ctx.moveTo(L.mm, L.dinh + r); ctx.lineTo(L.mm, L.day + 20); ctx.stroke();
    // mạch bạch huyết trung tâm
    ctx.strokeStyle = 'rgba(243,240,216,.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(L.bh, L.dinh + r + 6); ctx.lineTo(L.bh, L.day + 20); ctx.stroke();
    for (const p of S.h) {
      const k = LOAI[p.loai];
      dot(p.x, p.y, p.chylo ? 4.6 : k.r, k.mau, p.loai === 'mo' && !p.chylo ? 'rgba(255,255,255,.5)' : null);
    }
    ctx.font = '11px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd';
    ctx.fillText('lòng ruột', 8, 14); ctx.textAlign = 'right'; ctx.fillText('lòng ruột', W - 8, 14);
    ctx.fillStyle = '#ff8fa3'; ctx.fillText('máu → tĩnh mạch cửa → gan', W - 6, H - 6);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f3f0d8'; ctx.fillText('bạch huyết', 6, H - 6);
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 140, H / 2 - 18, 280, 32);
      ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 140, H / 2 - 18, 280, 32);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Đã hấp thu xong — bấm lại để xem lần nữa', W / 2, H / 2 + 3); ctx.textAlign = 'left';
    }
  }
};
