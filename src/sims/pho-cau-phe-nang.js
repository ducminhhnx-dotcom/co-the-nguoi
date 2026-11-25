// Mô phỏng: phế cầu (Streptococcus pneumoniae) gây viêm phổi thùy ở phế nang và phản ứng của cơ thể.
// Nguồn: StatPearls "Typical Bacterial Pneumonia" (4 giai đoạn và thời gian), "Pneumococcal Pneumonia"
// (vỏ bao, pneumolysin, mang khuẩn ở mũi họng); OpenStax A&P 2e mục 21.2 (bổ thể, opsonin hóa, bạch cầu trung tính).
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = x => Math.max(0, Math.min(1, x));
const T_SUNG = 2, T_DO = 6, T_XAM = 11;   // mốc giai đoạn (giây mô phỏng)
let S = null;

// Bố cục: một hàng phế nang tròn, dải mao mạch ở đáy khung.
function boCuc(W, H) {
  const n = W > 420 ? 4 : 3, mm = H - 24;
  const r = Math.min(W / (n * 2.35), (mm - 34) / 2.2);
  const cy = 18 + (mm - 18) / 2;
  return { n, r, mm, ds: Array.from({ length: n }, (_, i) => ({ x: W * (i + .5) / n, y: cy })) };
}
const viTri = (L, o) => ({ x: L.ds[o.pn].x + o.dx * L.r, y: L.ds[o.pn].y + o.dy * L.r });
// Đi lang thang trong phế nang (tọa độ tương đối với bán kính)
function langThang(o, sp, dt) {
  o.vx += rnd(-1, 1) * dt * 2; o.vy += rnd(-1, 1) * dt * 2;
  const v = Math.hypot(o.vx, o.vy) || 1; o.vx = o.vx / v * sp; o.vy = o.vy / v * sp;
  o.dx += o.vx * dt; o.dy += o.vy * dt;
  const d = Math.hypot(o.dx, o.dy);
  if (d > .78) { o.dx *= .78 / d; o.dy *= .78 / d; o.vx = -o.vx; o.vy = -o.vy; }
}
function huong(o, dich, sp, dt) {
  const ddx = dich.dx - o.dx, ddy = dich.dy - o.dy, d = Math.hypot(ddx, ddy) || 1;
  o.dx += ddx / d * sp * dt; o.dy += ddy / d * sp * dt; return d;
}

export default {
  id: 'pho-cau-phe-nang',
  ten: 'Phế cầu gây viêm phổi ở phế nang',
  nut: 'Phế cầu',
  vi_tri: 'phoi',
  diem: 'phoi',
  giai_doan: [
    { t: 0, mo_ta: 'Phế cầu vốn sống ở mũi họng bị hít xuống phế nang (túi khí nhỏ nhất của phổi)', thuc_te: 'khoảng 40–55% trẻ khỏe và 6–10% người lớn khỏe mang phế cầu ở mũi họng; bệnh thường xảy ra khi sức đề kháng giảm, hít phải nhiều vi khuẩn hoặc gặp chủng độc' },
    { t: T_SUNG, mo_ta: 'Sung huyết: vỏ bao đường (polysaccharide) cản bổ thể bám lên vi khuẩn, đại thực bào phế nang khó bắt; vi khuẩn sinh sôi, dịch tràn vào phế nang', thuc_te: 'khoảng 24 giờ đầu; phế nang có nhiều vi khuẩn nhưng ít bạch cầu' },
    { t: T_DO, mo_ta: 'Gan hóa đỏ: đại thực bào tiết cytokine gọi bạch cầu trung tính từ mao mạch sang; hồng cầu và sợi fibrin cũng tràn vào, phổi đặc lại như gan', thuc_te: 'bắt đầu 2–3 ngày sau, kéo dài 2–4 ngày; độc tố pneumolysin làm hỏng thành phế nang – mao mạch và làm yếu bạch cầu trung tính' },
    { t: T_XAM, mo_ta: 'Gan hóa xám: vi khuẩn bị bổ thể, kháng thể "đánh dấu" (opsonin hóa) nên bạch cầu nuốt được dễ; hồng cầu vỡ, dịch chuyển màu xám', thuc_te: '2–3 ngày sau gan hóa đỏ, kéo dài 4–8 ngày; vắc-xin phế cầu tạo sẵn kháng thể chống vỏ bao' },
    { t: 0, cuoi: true, mo_ta: 'Hồi phục: đại thực bào dọn xác vi khuẩn và bạch cầu, phế nang có khí trở lại', thuc_te: 'bắt đầu từ khoảng ngày thứ 8; có thể để lại sẹo hoặc không' }
  ],
  chu_giai: [
    { mau: '#b6ff5f', ten: 'Phế cầu (có vỏ bao)' }, { mau: '#4d8dff', ten: 'Đại thực bào' }, { mau: '#ffb36b', ten: 'Bạch cầu trung tính' },
    { mau: '#ff4d6a', ten: 'Hồng cầu' }, { mau: '#e8d27a', ten: 'Dịch, fibrin' }, { mau: '#c58bff', ten: 'Bổ thể, kháng thể' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: thời gian nén từ khoảng 8 ngày xuống vài giây; các giai đoạn thật chồng lên nhau và chỉ diễn ra rõ như vậy khi không được điều trị; phế nang thật nhỏ hơn nhiều (khoảng 0,2 mm) và có hàng trăm triệu cái.',

  get xong() { return !!S?.xong; },

  khoi_tao() {
    const L = boCuc(this.W, this.H);
    S = { t: 0, xong: false, hoiPhuc: 0, vk: [], dtb: [], bc: [], hc: [], op: [] };
    for (let i = 0; i < 5; i++) S.vk.push({ pn: i % L.n, dx: rnd(-.2, .2), dy: -.9, vx: rnd(-.1, .1), vy: .3, tc: rnd(.6, 1.4), op: false });
    for (let i = 0; i < L.n; i++) S.dtb.push({ pn: i, dx: rnd(-.3, .3), dy: rnd(.1, .4), vx: 0, vy: 0, an: 0 });
  },

  cap_nhat(dt) {
    const L = boCuc(this.W, this.H); S.t += dt;
    for (const o of [...S.vk, ...S.dtb]) if (o.pn >= L.n) o.pn = L.n - 1;
    // vi khuẩn sinh sôi tới gan hóa xám
    for (const v of S.vk) {
      langThang(v, .22, dt);
      v.tc -= dt;
      if (v.tc <= 0 && S.t < T_XAM && S.vk.length < 70) { v.tc = rnd(.9, 1.5); S.vk.push({ ...v, dx: v.dx + rnd(-.08, .08), dy: v.dy + rnd(-.08, .08), vx: rnd(-.2, .2), vy: rnd(-.2, .2) }); }
      if (S.t >= T_XAM && !v.op && Math.random() < dt * 1.5) v.op = true;   // bị opsonin hóa
    }
    // bổ thể, kháng thể (chấm tím) bay tới vi khuẩn từ gan hóa xám
    if (S.t >= T_XAM - .5 && S.op.length < 40 && Math.random() < dt * 10) {
      const i = Math.random() * L.n | 0; S.op.push({ pn: i, dx: rnd(-.6, .6), dy: .78, vx: 0, vy: -.3, song: 1.2 });
    }
    for (const a of S.op) { langThang(a, .35, dt); a.song -= dt; }
    S.op = S.op.filter(a => a.song > 0);
    // tế bào thực bào: xác suất bắt được tùy vi khuẩn đã bị đánh dấu hay chưa
    const bat = (te, sp, pVo, pOp, dt) => {
      if (te.an > 0) { te.an -= dt; return; }
      let gan = null, gd = 9;
      for (const v of S.vk) if (v.pn === te.pn) { const d = Math.hypot(v.dx - te.dx, v.dy - te.dy); if (d < gd) { gd = d; gan = v; } }
      if (!gan) { langThang(te, sp * .4, dt); return; }
      if (huong(te, gan, sp, dt) < .1) {
        if (Math.random() < (gan.op ? pOp : pVo)) { S.vk.splice(S.vk.indexOf(gan), 1); te.an = .35; }
        else { te.dx += rnd(-.15, .15); te.dy += rnd(-.15, .15); te.an = .5; }   // trượt khỏi vỏ bao
      }
    };
    for (const m of S.dtb) bat(m, .3, .06, .9, dt);
    // bạch cầu trung tính từ mao mạch sang, từ gan hóa đỏ
    if (S.t >= T_DO && !S.hoiPhuc && S.bc.length < 6 * L.n && Math.random() < dt * 4) {
      const i = Math.random() * L.n | 0; S.bc.push({ pn: i, dx: rnd(-.4, .4), dy: .78, vx: 0, vy: -.3, an: 0, mo: 1 });
    }
    for (const b of S.bc) { if (b.pn >= L.n) b.pn = L.n - 1; bat(b, .4, .2, .9, dt); }
    // hồng cầu rò sang trong gan hóa đỏ
    if (S.t >= T_DO && S.t < T_XAM && S.hc.length < 8 * L.n && Math.random() < dt * 5) {
      const i = Math.random() * L.n | 0; S.hc.push({ pn: i, dx: rnd(-.6, .6), dy: rnd(-.3, .7), vx: 0, vy: 0, g: rnd(0, 6) });
    }
    for (const h of S.hc) if (h.pn >= L.n) h.pn = L.n - 1;
    // hết vi khuẩn → hồi phục: dịch rút dần, đại thực bào dọn bạch cầu
    if (S.t > T_XAM && !S.vk.length && !S.hoiPhuc) S.hoiPhuc = S.t;
    if (S.hoiPhuc) {
      for (const b of S.bc) b.mo -= dt * .5;
      S.bc = S.bc.filter(b => b.mo > 0);
      if (S.t - S.hoiPhuc > 3.5) S.xong = true;
    }
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t;
    const dot = (x, y, r, f, s, lw = 1) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = lw; ctx.stroke(); } };
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    // mức dịch và màu theo giai đoạn
    const rut = S.hoiPhuc ? clamp((t - S.hoiPhuc) / 3) : 0;
    const dich = clamp((t - T_SUNG) / 3) * (1 - rut);
    const xam = clamp((t - T_XAM) / 2);
    // mao mạch ở đáy, nối lên từng phế nang
    ctx.fillStyle = 'rgba(255,77,106,.22)'; ctx.fillRect(0, L.mm, W, 12);
    ctx.strokeStyle = 'rgba(255,77,106,.55)'; ctx.lineWidth = 1; ctx.strokeRect(-1, L.mm, W + 2, 12);
    for (const p of L.ds) { ctx.strokeStyle = 'rgba(255,77,106,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x, p.y + L.r); ctx.lineTo(p.x, L.mm); ctx.stroke(); }
    // đường dẫn khí phía trên
    ctx.strokeStyle = 'rgba(127,232,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L.ds[0].x, 10); ctx.lineTo(L.ds[L.n - 1].x, 10); ctx.stroke();
    L.ds.forEach((p, i) => {
      ctx.beginPath(); ctx.moveTo(p.x, 10); ctx.lineTo(p.x, p.y - L.r); ctx.stroke();
      // phế nang: lòng chứa khí hoặc dịch
      ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, L.r, 0, 7); ctx.clip();
      ctx.fillStyle = 'rgba(127,232,255,.06)'; ctx.fillRect(p.x - L.r, p.y - L.r, 2 * L.r, 2 * L.r);
      if (dich > 0) {
        const mat = p.y + L.r - dich * 2 * L.r * .92;
        const r0 = 232 - xam * 80, g0 = 210 - xam * 60, b0 = 122 + xam * 40;
        ctx.fillStyle = `rgba(${r0 | 0},${g0 | 0},${b0 | 0},${.22 + .1 * clamp((t - T_DO) / 2) * (1 - rut)})`;
        ctx.fillRect(p.x - L.r, mat, 2 * L.r, p.y + L.r - mat);
        // sợi fibrin từ gan hóa đỏ
        const fb = clamp((t - T_DO) / 2) * (1 - rut);
        if (fb > 0) {
          ctx.strokeStyle = `rgba(232,210,122,${.45 * fb})`; ctx.lineWidth = 1;
          for (let k = 0; k < 5; k++) { const a = k * 1.3 + i; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * L.r * .7, p.y + Math.sin(a) * L.r * .7); ctx.lineTo(p.x + Math.cos(a + 2.2) * L.r * .6, p.y + Math.sin(a + 2.2) * L.r * .6); ctx.stroke(); }
        }
      }
      ctx.restore();
      dot(p.x, p.y, L.r, null, 'rgba(127,232,255,.6)', 1.5);
    });
    // hồng cầu: đỏ rồi xám dần khi vỡ
    for (const h of S.hc) {
      const q = viTri(L, h), a = (1 - xam * .7) * (1 - rut);
      if (a <= .02) continue;
      ctx.globalAlpha = a; dot(q.x, q.y, 3.2, xam > .5 ? '#8c6b72' : '#ff4d6a'); dot(q.x, q.y, 1.2, 'rgba(0,0,0,.35)'); ctx.globalAlpha = 1;
    }
    // vi khuẩn: cặp song cầu có vỏ bao
    for (const v of S.vk) {
      const q = viTri(L, v);
      dot(q.x, q.y, 5.5, 'rgba(182,255,95,.12)', v.op ? '#c58bff' : 'rgba(182,255,95,.45)', v.op ? 1.6 : 1);
      dot(q.x - 2, q.y, 2.1, '#b6ff5f'); dot(q.x + 2, q.y, 2.1, '#b6ff5f');
    }
    for (const a of S.op) { const q = viTri(L, a); dot(q.x, q.y, 1.6, '#c58bff'); }
    // bạch cầu trung tính: nhân nhiều thùy
    for (const b of S.bc) {
      const q = viTri(L, b); ctx.globalAlpha = clamp(b.mo);
      dot(q.x, q.y, 6, 'rgba(255,179,107,.3)', '#ffb36b');
      for (let k = 0; k < 3; k++) dot(q.x - 2.5 + k * 2.5, q.y + (k % 2 ? 1.5 : -1), 1.4, '#ffb36b');
      ctx.globalAlpha = 1;
    }
    // đại thực bào
    for (const m of S.dtb) { const q = viTri(L, m); dot(q.x, q.y, 9, 'rgba(77,141,255,.3)', '#4d8dff'); dot(q.x + 2, q.y - 1, 3, '#4d8dff'); }
    ctx.font = '12px "Be Vietnam Pro",sans-serif'; ctx.fillStyle = '#8fa8bd';
    ctx.fillText('mao mạch', 8, H - 2);
    ctx.textAlign = 'right'; ctx.fillText(t < T_SUNG ? 'phế nang chứa khí' : S.hoiPhuc ? 'dịch đang rút' : 'phế nang đầy dịch', W - 8, H - 2); ctx.textAlign = 'left';
    if (S.xong) {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 140, H / 2 - 22, 280, 36);
      ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 140, H / 2 - 22, 280, 36);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Phế nang đã thông — bấm lại để chạy lần nữa', W / 2, H / 2 + 1); ctx.textAlign = 'left';
    }
  }
};
