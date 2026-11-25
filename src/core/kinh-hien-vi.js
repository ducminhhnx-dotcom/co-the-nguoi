// Khung "Kính hiển vi": chạy các mô-đun trong src/sims/, chia hai nhóm nút theo trường "nhom":
// "van-hanh" (Cơ thể vận hành), "benh" (Bệnh diễn tiến) hoặc "nhiem-trung" (Chống nhiễm trùng, mặc định).
// Giao ước mô-đun: { id, ten, nut, nhom, vi_tri, diem, giai_doan:[{t, mo_ta, thuc_te, bo_phan?, cuoi?}], chu_giai:[{mau, ten}],
//   don_gian_hoa, khoi_tao(canvas), cap_nhat(dt), ve(ctx), xong }.
// Trước khoi_tao, lõi gán sim.W, sim.H (kích thước khung, px CSS); ctx đã được nhân tỷ lệ màn hình.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const NHOM = [['van-hanh', 'Cơ thể vận hành'], ['benh', 'Bệnh diễn tiến'], ['nhiem-trung', 'Chống nhiễm trùng']];

export function taoKinhHienVi({ khung, db, khiBatDau, khiDung, khiDoiGiaiDoan = () => {} }) {
  khung.innerHTML = `
    <div class="khv-dau">
      <h3>Kính hiển vi</h3>
      <button class="khv-dung" data-dung hidden>Dừng</button>
    </div>
    <div class="khv-nut">${NHOM.map(([k, ten]) => {
      const ds = db.dsMoPhong.filter(s => (s.nhom || 'nhiem-trung') === k);
      return ds.length ? `<div class="khv-nhom" role="group" aria-label="${ten}"><span>${ten}</span>${ds.map(s => `<button data-sim="${esc(s.id)}" aria-pressed="false">${esc(s.nut || s.ten)}</button>`).join('')}</div>` : '';
    }).join('')}</div>
    <div class="khv-man"><canvas aria-label="Khung kính hiển vi mô phỏng"></canvas>
      <div class="khv-goi-y">Chọn một mục ở trên để xem cơ thể vận hành, hoặc chống mầm bệnh, ở mức tế bào.</div></div>
    <div class="khv-chu-giai"></div>
    <ol class="khv-buoc"></ol>
    <p class="khv-ghi-chu"></p>`;
  const cv = khung.querySelector('canvas'), ctx = cv.getContext('2d'), man = khung.querySelector('.khv-man');
  const goiY = khung.querySelector('.khv-goi-y'), buoc = khung.querySelector('.khv-buoc');
  const chuGiai = khung.querySelector('.khv-chu-giai'), ghiChu = khung.querySelector('.khv-ghi-chu');
  const nutDung = khung.querySelector('[data-dung]');
  let sim = null, t = 0, giaiDoan = -1, W = 300, H = 220;

  function vua() {
    const dpr = devicePixelRatio || 1; W = man.clientWidth; H = man.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (sim) { sim.W = W; sim.H = H; }
  }
  new ResizeObserver(vua).observe(man);

  function veBuoc() {
    const L = sim.giai_doan, cuoi = L.findIndex(g => g.cuoi);
    let k = 0;
    L.forEach((g, i) => { if (!g.cuoi && t >= g.t) k = i; });
    if (sim.xong && cuoi >= 0) k = cuoi;
    if (k === giaiDoan) return;
    giaiDoan = k;
    // giai đoạn có ghi bo_phan thì lõi làm sáng bộ phận đó trên hình 3D
    if (L[k].bo_phan) khiDoiGiaiDoan(L[k].bo_phan);
    buoc.innerHTML = L.map((g, i) => `<li class="${i === k ? 'dang' : i < k ? 'qua' : ''}"${i === k ? ' aria-current="step"' : ''}>${esc(g.mo_ta)}${i === k && g.thuc_te ? `<div class="thuc-te">Thực tế: ${esc(g.thuc_te)}</div>` : ''}</li>`).join('');
  }

  function batDau(id) {
    const s = db.moPhong[id]; if (!s) return;
    vua(); sim = s; t = 0; giaiDoan = -1;
    sim.W = W; sim.H = H; sim.khoi_tao(cv);
    goiY.hidden = true; nutDung.hidden = false;
    khung.querySelectorAll('[data-sim]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sim === id));
    chuGiai.innerHTML = sim.chu_giai.map(c => `<span><i style="background:${esc(c.mau)}"></i>${esc(c.ten)}</span>`).join('');
    const benh = db.benhCuaMoPhong(id);
    ghiChu.innerHTML = `${esc(sim.don_gian_hoa || '')}${benh ? ` <button class="lien-ket-chu" data-benh="${esc(benh.id)}">Đọc về bệnh: ${esc(benh.ten)}</button>` : ''}`;
    veBuoc();
    khiBatDau(sim);
  }
  function dung() {
    sim = null; ctx.clearRect(0, 0, W, H); goiY.hidden = false; nutDung.hidden = true;
    buoc.innerHTML = ''; chuGiai.innerHTML = ''; ghiChu.innerHTML = '';
    khung.querySelectorAll('[data-sim]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    khiDung();
  }
  khung.addEventListener('click', e => {
    const b = e.target.closest('[data-sim],[data-dung]'); if (!b) return;
    b.dataset.sim ? batDau(b.dataset.sim) : dung();
  });

  return {
    batDau, dung,
    capNhat(dt) {
      if (!sim) return;
      if (!sim.xong) { t += dt; sim.cap_nhat(dt); }
      sim.ve(ctx);
      veBuoc();
    }
  };
}
