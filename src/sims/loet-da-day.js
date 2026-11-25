// Mô phỏng: lát cắt thành dạ dày — H. pylori làm mỏng lớp nhầy, axit ăn mòn thành trợt rồi ổ loét, ổ loét ăn vào mạch máu gây chảy máu, rồi lành.
// Nguồn: OpenStax A&P 2e mục 23.4 (pH 1,5–3,5; lớp nhầy giàu bicarbonate, mối nối khít, tế bào gốc; biểu mô thay mới sau 3–6 ngày;
// trợt nông thường tự lành); MSD Manual chuyên môn — Peptic Ulcer Disease, Helicobacter pylori Infection, Overview of Acid Secretion.
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = x => Math.max(0, Math.min(1, x));
const tron = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const T_HP = 4, T_TROT = 8, T_LOET = 12, T_MAU = 16, T_LANH = 21, T_HET = 27;
let S = null;

// Bố cục: các lớp thành dạ dày xếp từ trên (lòng dạ dày) xuống dưới (lớp cơ)
function boCuc(W, H) {
  const y1 = 58, y2 = 74, y3 = 86, y4 = 112, y5 = 124, y6 = 168;
  return { y1, y2, y3, y4, y5, y6, mach: 147, cx: W * 0.38, nhay: y2 - y1 };
}
// độ sâu và độ rộng ổ tổn thương theo thời gian (tính từ mặt biểu mô)
function oLoet(t, W, L) {
  const sau = t < T_TROT ? 0 : t < T_LOET ? 24 * tron((t - T_TROT) / 3)
    : t < T_MAU ? 24 + 38 * tron((t - T_LOET) / 3) : t < T_LANH ? 62 + 12 * tron((t - T_MAU) / 2) : 74 * (1 - tron((t - T_LANH) / 5));
  const rong = t < T_LOET ? W * 0.07 : t < T_LANH ? W * (0.07 + 0.05 * tron((t - T_LOET) / 3)) : W * 0.12;
  return { sau, rong };
}
const sauTai = (x, L, o) => { const a = (x - L.cx) / o.rong; return Math.abs(a) >= 1 ? 0 : o.sau * (1 - a * a); };

export default {
  id: 'loet-da-day',
  ten: 'Loét dạ dày – tá tràng',
  nut: 'Loét dạ dày',
  nhom: 'benh',
  vi_tri: null,
  diem: null,
  giai_doan: [
    { t: 0, bo_phan: 'da-day', mo_ta: 'Thành dạ dày khỏe: lớp nhầy giàu bicarbonate trung hòa axit trước khi chạm tới tế bào; các tế bào nối khít với nhau', thuc_te: 'dịch trong dạ dày rất chua, pH khoảng 1,5–3,5; lớp tế bào bề mặt được thay mới hoàn toàn sau mỗi 3–6 ngày' },
    { t: T_HP, mo_ta: 'Vi khuẩn H. pylori chui vào lớp nhầy; chúng tạo amoniac để sống được trong axit, và amoniac cùng men của vi khuẩn bào mòn lớp nhầy', thuc_te: 'thường nhiễm từ nhỏ, lây qua đường miệng – miệng hoặc phân – miệng; ở Bắc Mỹ khoảng 30–40% người mang vi khuẩn, phần lớn không có biểu hiện gì' },
    { t: T_TROT, mo_ta: 'Lớp nhầy mỏng đi, axit và pepsin chạm vào tế bào; niêm mạc viêm, bạch cầu kéo tới; mặt niêm mạc bị ăn mòn nông (trợt)', thuc_te: 'trợt nông chưa qua lớp cơ niêm, phần lớn tự lành; thuốc giảm đau chống viêm không steroid cũng làm yếu hàng rào này (giảm nhầy, bicarbonate và máu nuôi)' },
    { t: T_LOET, bo_phan: 'ruot-non', mo_ta: 'Ổ loét: chỗ bị ăn mòn khoét sâu xuyên qua lớp cơ niêm, xuống lớp dưới niêm mạc; hay gặp nhất ở tá tràng (đoạn đầu ruột non), sau đó là dạ dày', thuc_te: 'ổ loét rộng từ vài milimét tới vài centimét; khoảng 10% người nhiễm H. pylori bị loét, so với 1% người không nhiễm' },
    { t: T_MAU, bo_phan: 'da-day', mo_ta: 'Biến chứng: ổ loét ăn tới mạch máu gây chảy máu; nếu ăn thủng hết thành thì gây thủng dạ dày', thuc_te: 'chảy máu là biến chứng hay gặp nhất — nôn ra máu, phân đen như hắc ín, choáng ngất là phải đi cấp cứu ngay' },
    { t: T_LANH, mo_ta: 'Khi bỏ được nguyên nhân (diệt H. pylori theo chỉ định của bác sĩ, ngừng thuốc gây loét, bỏ thuốc lá): lớp nhầy hồi phục, tế bào mới lấp dần ổ loét, có thể để lại sẹo', thuc_te: 'diệt được H. pylori thì sau 3 năm chưa tới 10% người bị loét lại, so với hơn 50% nếu vẫn còn vi khuẩn' }
  ],
  chu_giai: [
    { mau: '#ffe066', ten: 'Axit (H+)' }, { mau: '#7fe8ff', ten: 'Lớp nhầy, bicarbonate' }, { mau: '#7be08a', ten: 'Vi khuẩn H. pylori' },
    { mau: '#4d8dff', ten: 'Bạch cầu' }, { mau: '#ff4d6a', ten: 'Máu' }
  ],
  don_gian_hoa: 'Đã đơn giản hóa: quá trình thật kéo dài nhiều tuần tới nhiều năm được nén vào vài chục giây; lát cắt không theo tỷ lệ; không vẽ pepsin; phần lớn người nhiễm H. pylori không bị loét, và ngày nay thuốc giảm đau chống viêm không steroid là nguyên nhân của hơn một nửa số ổ loét.',

  get xong() { return !!S?.xong; },

  khoi_tao() { S = { t: 0, xong: false, axit: [], hp: [], bc: [], mau: [], loe: [], hen: 0 }; },

  cap_nhat(dt) {
    const W = this.W, L = boCuc(W, this.H); S.t += dt; const t = S.t, o = oLoet(t, W, L);
    // lớp nhầy mỏng dần quanh ổ loét khi có H. pylori, hồi phục khi lành
    S.mong = t < T_HP ? 0 : t < T_LANH ? 0.92 * tron((t - T_HP) / 5) : 0.92 * (1 - tron((t - T_LANH) / 3));
    const nhayTai = x => L.nhay * (1 - S.mong * Math.exp(-(((x - L.cx) / (W * 0.16)) ** 2)));
    // axit trôi từ lòng dạ dày xuống
    if ((S.hen -= dt) <= 0) { S.hen = 0.07; S.axit.push({ x: rnd(4, W - 4), y: rnd(6, 20) }); }
    for (const a of S.axit) {
      a.x += rnd(-30, 30) * dt; a.y += 28 * dt;
      const day = L.y2 - nhayTai(a.x);
      if (!a.vao && a.y >= day) {
        if (L.y2 - day > 6) { a.het = true; S.loe.push({ x: a.x, y: day, s: 0.35 }); }   // bicarbonate trung hòa
        else a.vao = true;                                                                 // lọt qua chỗ nhầy mỏng
      }
      if (a.vao && a.y >= L.y2 + sauTai(a.x, L, o) - 1) a.het = true;                     // ăn mòn đáy ổ loét
    }
    S.axit = S.axit.filter(a => !a.het && a.y < this.H).slice(-70);
    for (const l of S.loe) l.s -= dt; S.loe = S.loe.filter(l => l.s > 0);
    // H. pylori bơi trong lớp nhầy quanh chỗ sẽ loét
    if (t >= T_HP && t < T_LANH && S.hp.length < 9 && Math.random() < dt * 3) S.hp.push({ x: L.cx + rnd(-W * 0.2, W * 0.2), y: rnd(L.y1 + 3, L.y2 - 3), g: rnd(0, 6), h: 1 });
    for (const b of S.hp) { b.g += dt * 3; b.x += Math.cos(b.g) * 8 * dt; if (t >= T_LANH) b.h = Math.max(0, b.h - dt * 0.6); }
    S.hp = S.hp.filter(b => b.h > 0);
    // bạch cầu kéo tới chỗ viêm
    if (t >= T_TROT && t < T_LANH + 2 && S.bc.length < 7 && Math.random() < dt * 1.5) S.bc.push({ x: L.cx + (Math.random() < 0.5 ? -1 : 1) * rnd(W * 0.1, W * 0.2), y: rnd(L.y3 + 6, L.y4 - 4), h: 1 });
    for (const b of S.bc) { const ben = Math.sign(b.x - L.cx) || 1; b.x = L.cx + ben * Math.max(W * 0.13, Math.abs(b.x - L.cx) - W * 0.02 * dt); if (t >= T_LANH + 2) b.h -= dt * 0.5; }
    S.bc = S.bc.filter(b => b.h > 0);
    // chảy máu từ mạch bị ăn thủng
    if (t >= T_MAU + 1 && t < T_LANH && Math.random() < dt * 12) S.mau.push({ x: L.cx + rnd(-4, 4), y: L.mach, v: rnd(25, 45) });
    for (const m of S.mau) { m.y -= m.v * dt; m.x += rnd(-12, 12) * dt; }
    S.mau = S.mau.filter(m => m.y > 4).slice(-60);
    if (t >= T_HET) S.xong = true;
  },

  ve(ctx) {
    const W = this.W, H = this.H, L = boCuc(W, H), t = S.t, o = oLoet(t, W, L);
    const dot = (x, y, r, f) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = f; ctx.fill(); };
    const mong = S.mong || 0, nhayTai = x => L.nhay * (1 - mong * Math.exp(-(((x - L.cx) / (W * 0.16)) ** 2)));
    ctx.fillStyle = '#0b1a2b'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,224,102,.05)'; ctx.fillRect(0, 0, W, L.y1);                  // lòng dạ dày chua
    // các lớp mô
    ctx.fillStyle = 'rgba(255,179,107,.16)'; ctx.fillRect(0, L.y3, W, L.y4 - L.y3);          // niêm mạc (tuyến)
    ctx.fillStyle = 'rgba(255,143,163,.35)'; ctx.fillRect(0, L.y4, W, L.y5 - L.y4);          // lớp cơ niêm
    ctx.fillStyle = 'rgba(255,210,190,.08)'; ctx.fillRect(0, L.y5, W, L.y6 - L.y5);          // dưới niêm mạc
    ctx.fillStyle = 'rgba(255,120,140,.20)'; ctx.fillRect(0, L.y6, W, H - L.y6);             // lớp cơ
    ctx.strokeStyle = 'rgba(255,150,160,.25)';
    for (let x = -20; x < W; x += 14) { ctx.beginPath(); ctx.moveTo(x, L.y6 + 6); ctx.lineTo(x + 20, H - 4); ctx.stroke(); }
    // tuyến dạ dày (khe dọc trong niêm mạc)
    ctx.strokeStyle = 'rgba(255,179,107,.35)';
    for (let x = 8; x < W; x += 18) { ctx.beginPath(); ctx.moveTo(x, L.y3 + 2); ctx.lineTo(x, L.y4 - 4); ctx.stroke(); }
    // mạch máu ở lớp dưới niêm mạc
    const ve = W * 0.72, thung = t >= T_MAU + 1 && t < T_LANH + 2;
    ctx.fillStyle = 'rgba(255,77,106,.55)';
    ctx.beginPath(); ctx.moveTo(0, L.mach - 6); ctx.lineTo(ve, L.mach - 6); ctx.arc(ve, L.mach, 6, -Math.PI / 2, Math.PI / 2); ctx.lineTo(0, L.mach + 6); ctx.fill();
    // lớp nhầy (mỏng đi quanh ổ loét)
    ctx.beginPath(); ctx.moveTo(0, L.y2);
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, L.y2 - nhayTai(x));
    ctx.lineTo(W, L.y2); ctx.closePath(); ctx.fillStyle = 'rgba(127,232,255,.18)'; ctx.fill();
    ctx.strokeStyle = 'rgba(127,232,255,.5)'; ctx.stroke();
    // hàng tế bào biểu mô; tế bào gần chỗ nhầy mỏng sẫm lại (tổn thương)
    for (let x = 0; x < W; x += 10) {
      const xc = x + 5; if (sauTai(xc, L, o) > 2) continue;
      const hong = clamp((mong - 0.4) * 2) * Math.exp(-(((xc - L.cx) / (W * 0.12)) ** 2));
      ctx.fillStyle = `rgba(${255 - 90 * hong},${179 - 100 * hong},${107 - 50 * hong},.55)`;
      ctx.fillRect(x + 0.5, L.y2, 9, L.y3 - L.y2);
      dot(xc, (L.y2 + L.y3) / 2, 1.6, 'rgba(60,30,20,.6)');
    }
    // ổ trợt / ổ loét: hố khoét từ mặt niêm mạc xuống, đáy phủ lớp hoại tử
    if (o.sau > 1) {
      ctx.beginPath(); ctx.moveTo(L.cx - o.rong, L.y2 - 1);
      for (let i = 0; i <= 30; i++) { const x = L.cx - o.rong + 2 * o.rong * i / 30; ctx.lineTo(x, L.y2 + sauTai(x, L, o)); }
      ctx.lineTo(L.cx + o.rong, L.y2 - 1); ctx.closePath();
      ctx.fillStyle = '#0b1a2b'; ctx.fill(); ctx.fillStyle = 'rgba(255,224,102,.05)'; ctx.fill();
      ctx.strokeStyle = t >= T_LANH ? 'rgba(255,210,190,.7)' : 'rgba(214,140,90,.9)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.lineWidth = 1;
      if (thung) dot(L.cx, L.mach, 4, '#ff4d6a');                                             // chỗ mạch bị thủng
    }
    if (t >= T_LANH + 4) { ctx.fillStyle = 'rgba(255,230,220,.14)'; ctx.fillRect(L.cx - W * 0.1, L.y2, W * 0.2, L.y5 - L.y2); }   // sẹo
    for (const l of S.loe) dot(l.x, l.y, 3 * (1 - l.s / 0.35) + 1, `rgba(127,232,255,${l.s * 2})`);
    for (const a of S.axit) dot(a.x, a.y, 1.8, '#ffe066');
    for (const b of S.hp) {
      ctx.globalAlpha = b.h; dot(b.x, b.y, 6, 'rgba(123,224,138,.12)');                       // quầng amoniac
      ctx.strokeStyle = '#7be08a'; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 8; k++) { const x = b.x - 6 + k * 1.5; ctx.lineTo(x, b.y + Math.sin(k * 1.4 + b.g) * 1.6); }
      ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = 1;
    }
    for (const b of S.bc) { ctx.globalAlpha = clamp(b.h); dot(b.x, b.y, 4.5, 'rgba(77,141,255,.8)'); dot(b.x - 1, b.y - 1, 1.6, '#c9dcff'); ctx.globalAlpha = 1; }
    for (const m of S.mau) dot(m.x, m.y, 2.2, '#ff4d6a');
    // nhãn lớp, căn phải, cách xa ổ loét
    ctx.font = '10px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#8fa8bd';
    ctx.fillText('lòng dạ dày', W - 4, 14); ctx.fillText('lớp nhầy', W - 4, L.y1 + 11);
    ctx.fillText('niêm mạc', W - 4, L.y3 + 14); ctx.fillText('lớp cơ niêm', W - 4, L.y5 - 2);
    ctx.fillText('dưới niêm mạc', W - 4, L.y5 + 12); ctx.fillText('lớp cơ', W - 4, H - 8);
    ctx.textAlign = 'left'; ctx.fillText('mạch máu', ve + 9, L.mach + 4);
    ctx.fillStyle = '#ffe066'; ctx.fillText('axit dạ dày ↓', 6, 14);
    // nhãn ổ tổn thương
    if (!S.xong) {
      const nhan = t >= T_LANH ? 'đang lành' : thung ? 'chảy máu' : t >= T_LOET + 1 ? 'ổ loét' : t >= T_TROT + 1 ? 'trợt nông' : t >= T_HP ? 'H. pylori' : '';
      ctx.font = '600 11px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = thung ? '#ff8fa3' : t >= T_LANH ? '#7fe8ff' : '#ffffff';
      if (nhan) ctx.fillText(nhan, L.cx, 32);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = 'rgba(6,11,22,.85)'; ctx.fillRect(W / 2 - 130, 6, 260, 30);
      ctx.strokeStyle = '#7fe8ff'; ctx.strokeRect(W / 2 - 130, 6, 260, 30);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 14px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Ổ loét đã lành — bấm lại để xem lần nữa', W / 2, 26); ctx.textAlign = 'left';
    }
  }
};
