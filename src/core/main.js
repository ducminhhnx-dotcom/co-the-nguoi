// Điểm vào: nạp dữ liệu, dựng cảnh 3D, bảng thông tin, kính hiển vi; chạy vòng lặp chung.
import { napDuLieu } from './du-lieu.js';
import { taoCanh } from './canh-3d.js';
import { taoBangThongTin } from './bang-thong-tin.js';
import { taoKinhHienVi } from './kinh-hien-vi.js';
import { taoTimKiem } from './tim-kiem.js';
import { taoTrangBenh } from './trang-benh.js';
import { taoTuKiemTra } from './tu-kiem-tra.js';

const $ = s => document.querySelector(s);
// ?chup: chế độ cho kiểm thử chạy ngầm — Chrome headless khi chụp ảnh không gọi requestAnimationFrame.
const CHE_DO_CHUP = new URLSearchParams(location.search).has('chup');
const hen = CHE_DO_CHUP ? f => setTimeout(() => f(performance.now()), 16) : requestAnimationFrame.bind(window);
// Kiểm thử: giữ một ảnh đang tải để sự kiện load (lúc Chrome ngầm đọc DOM/chụp) chờ tới khi dựng xong.
const baoXong = CHE_DO_CHUP ? (() => { const a = new Image(); a.src = '/__cho'; a.alt = ''; a.hidden = true; document.body.appendChild(a); return () => fetch('/__xong').catch(() => {}); })() : () => {};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function baoLoi(e) {
  console.error(e);
  baoXong();
  const o = $('#loi'); if (!o.hidden) return; o.hidden = false;
  o.innerHTML = `<strong>Không mở được mô hình.</strong> ${esc(String(e.message).slice(0, 160))}<br>
    Nếu mở trực tiếp file trên máy, hãy chạy máy chủ tĩnh trong thư mục dự án (ví dụ <code>py -m http.server 8000</code>) rồi mở <code>http://localhost:8000</code>.`;
}

async function khoiDong() {
  const db = await napDuLieu();
  $('#ban').textContent = `bản ${db.phienBan}`;

  let canh, bang, khv, trangBenh, tuKiemTra;

  // Đường dẫn: #bo-phan/<id> hoặc #benh/<id> — để chia sẻ hay đánh dấu đúng chỗ đang xem.
  const datHash = h => { if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search); };
  const chon = id => {
    if (!db.boPhan[id]) return;
    if (tuKiemTra?.dang()) tuKiemTra.thoat();          // chọn bộ phận từ chỗ khác thì thoát tự kiểm tra
    canh.chon(db.boPhan[id].mo_hinh);
    bang.moBoPhan(id);
    datHash(`#bo-phan/${id}`);
  };
  const moBenh = id => { if (trangBenh.mo(id)) datHash(`#benh/${id}`); };

  // Bảng thông tin
  bang = taoBangThongTin({ khung: $('#bang'), db, khiChonBoPhan: chon, khiMoBenh: moBenh });

  // Trang chi tiết bệnh
  trangBenh = taoTrangBenh({
    db, khiChonBoPhan: chon, khiChayMoPhong: id => khv.batDau(id),
    khiDong: id => { if (location.hash === `#benh/${id}`) { const h = bang.hienTai(); datHash(h ? `#bo-phan/${h.id}` : ''); } }
  });

  // Tìm kiếm
  const timKiem = taoTimKiem({ o: $('#tim'), ds: $('#ket-qua-tim'), db, khiChonBoPhan: chon, khiMoBenh: moBenh });

  // Cảnh 3D
  const nhan = $('#nhan-qua');
  canh = await taoCanh({
    khung: $('#canh'), db, giuKhung: CHE_DO_CHUP,
    khiChon: idMoHinh => {
      const bp = db.boPhanTheoMoHinh[idMoHinh];
      if (tuKiemTra?.dang()) { if (bp) tuKiemTra.bamTren3D(bp.id); return; }   // đang làm bài: bấm 3D là trả lời
      if (bp) chon(bp.id);
    },
    khiDiQua: (idMoHinh, e) => {
      const bp = idMoHinh && db.boPhanTheoMoHinh[idMoHinh];
      if (!bp || tuKiemTra?.dang()) { nhan.hidden = true; return; }   // đang làm bài thì không hiện tên khi rê chuột
      const r = $('#canh').getBoundingClientRect();
      nhan.textContent = bp.ten; nhan.hidden = false;
      nhan.style.left = `${e.clientX - r.left + 14}px`; nhan.style.top = `${e.clientY - r.top - 30}px`;
    }
  });

  // Kính hiển vi
  khv = taoKinhHienVi({
    khung: $('#khv'), db,
    khiBatDau: sim => { canh.danhDau(sim.diem); if (sim.vi_tri) chon(sim.vi_tri); datHash(`#mo-phong/${sim.id}`); },
    // làm sáng bộ phận của giai đoạn đang diễn ra, giữ nguyên đường dẫn #mo-phong/…
    khiDoiGiaiDoan: id => { if (db.boPhan[id] && !tuKiemTra?.dang()) { canh.chon(db.boPhan[id].mo_hinh); bang.moBoPhan(id); } },
    khiDung: () => {
      canh.danhDau(null);
      if (location.hash.startsWith('#mo-phong/')) { const h = bang.hienTai(); datHash(h ? `#bo-phan/${h.id}` : ''); }
    }
  });
  $('#khv').addEventListener('click', e => { const b = e.target.closest('[data-benh]'); if (b) moBenh(b.dataset.benh); });

  // Tự kiểm tra: câu hỏi thay chỗ bảng thông tin ở cột phải; hình 3D vẫn bấm được để trả lời
  const nutKt = $('#nut-kt');
  tuKiemTra = taoTuKiemTra({
    khung: $('#bang'), db, canh,
    khiXemBoPhan: id => chon(id),
    // dải nhắc trên hình 3D cho câu "bấm đúng cơ quan"; trên điện thoại tự cuộn tới chỗ cần thao tác
    khiTrangThai: tt => {
      const o = $('#kt-noi');
      if (!tt || tt.loai !== 'bam') o.hidden = true;
      else {
        o.hidden = false;
        o.className = 'kt-noi' + (tt.daTraLoi ? (tt.ketQua ? ' dung' : ' sai') : '');
        o.textContent = !tt.daTraLoi ? `Bấm vào ${tt.ten}` : tt.ketQua ? 'Đúng rồi!' : `Chưa đúng — ${tt.ten} đang sáng`;
      }
      if (tt && matchMedia('(max-width: 860px)').matches)
        (tt.loai === 'bam' && !tt.daTraLoi ? $('.san-khau') : $('#bang')).scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    khiThoat: () => {
      nutKt.setAttribute('aria-pressed', 'false');
      if (location.hash === '#tu-kiem-tra') { const h = bang.hienTai(); datHash(h ? `#bo-phan/${h.id}` : ''); }
      bang.veLai();
    }
  });
  const moKiemTra = () => {
    trangBenh.dong(); nutKt.setAttribute('aria-pressed', 'true'); datHash('#tu-kiem-tra'); tuKiemTra.batDau();
  };
  nutKt.addEventListener('click', () => tuKiemTra.dang() ? tuKiemTra.thoat() : moKiemTra());

  // Lớp vỏ ngoài: độ hiện rõ 0–100%
  $('#do-vo').addEventListener('input', e => { const v = +e.target.value; $('#do-vo-so').textContent = `${v}%`; canh.datDoVo(v / 100); });

  // Cột trái: bật/tắt hệ
  $('#ds-he').innerHTML = db.dsHe.map(h => h.chua_co
    ? `<button class="nut-he chua-co" disabled title="Chưa có trong mô hình (dự kiến bản 0.4)">${esc(h.ten)}<small>chưa có</small></button>`
    : `<button class="nut-he" data-he="${esc(h.id)}" aria-pressed="${!h.an_mac_dinh}" style="--m:${esc(h.mau)}">${esc(h.ten)}</button>`).join('');
  db.dsHe.filter(h => h.an_mac_dinh).forEach(h => canh.anHienHe(h.id, false));
  $('#ds-he').addEventListener('click', e => {
    const b = e.target.closest('[data-he]'); if (!b) return;
    const bat = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', bat);
    canh.anHienHe(b.dataset.he, bat);
  });

  const dpr0 = devicePixelRatio || 1;
  // Nhịp tim
  let nhip = 72;
  $('#nhip').addEventListener('input', e => { nhip = +e.target.value; $('#so-nhip').textContent = nhip; canh.datNhip(nhip); });

  // Nhịp thở: phổi trên hình 3D phồng xẹp theo nhịp; đường sóng là thể tích phổi
  $('#nhip-tho').addEventListener('input', e => { const n = +e.target.value; $('#so-tho').textContent = n; canh.datNhipTho(n); });
  const stCv = $('#song-tho'), stCtx = stCv.getContext('2d');
  stCv.width = 160 * dpr0; stCv.height = 36 * dpr0; stCtx.scale(dpr0, dpr0);
  const vetTho = new Float32Array(160); let tichTho = 0, phaCu = null;
  function veSongTho(dt) {
    const s = canh.tho();
    tichTho += dt * 40;
    while (tichTho >= 1) { tichTho -= 1; vetTho.copyWithin(0, 1); vetTho[159] = s.theTich; }
    stCtx.clearRect(0, 0, 160, 36);
    stCtx.beginPath();
    for (let i = 0; i < 160; i++) stCtx[i ? 'lineTo' : 'moveTo'](i, 31 - vetTho[i] * 26);
    stCtx.strokeStyle = '#7fe8ff'; stCtx.lineWidth = 1.6; stCtx.stroke();
    const chu = s.hitVao ? 'Hít vào' : 'Thở ra';
    if (chu !== phaCu) { $('#pha-tho').textContent = chu; phaCu = chu; }
  }

  // Góc nhìn
  const nutGoc = [...document.querySelectorAll('[data-nhin]')];
  const danhDauGoc = h => nutGoc.forEach(b => b.setAttribute('aria-pressed', b.dataset.nhin === h));
  nutGoc.forEach(b => b.addEventListener('click', () => { canh.nhin(b.dataset.nhin); danhDauGoc(b.dataset.nhin); }));
  $('#canh').addEventListener('pointerdown', () => danhDauGoc(null));
  $('#tu-xoay').addEventListener('click', e => { const b = !canh.dangTuXoay(); canh.tuXoay(b); e.currentTarget.setAttribute('aria-pressed', b); });
  $('#dat-lai').addEventListener('click', () => { canh.datLai(); danhDauGoc('truoc'); $('#tu-xoay').setAttribute('aria-pressed', 'false'); });

  // Điện tim
  const dtCv = $('#dien-tim'), dtCtx = dtCv.getContext('2d'), dpr = devicePixelRatio || 1;
  dtCv.width = 160 * dpr; dtCv.height = 36 * dpr; dtCtx.scale(dpr, dpr);
  const vet = new Float32Array(160); let phaDt = 0, tichLuy = 0;
  const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
  const dang = p => 0.12 * g(p, .1, .025) - 0.12 * g(p, .2, .008) + 1 * g(p, .23, .01) - 0.25 * g(p, .26, .01) + 0.28 * g(p, .45, .04);
  function veDienTim(dt) {
    tichLuy += dt * 80;
    while (tichLuy >= 1) { tichLuy -= 1; phaDt += (1 / 80) * nhip / 60; vet.copyWithin(0, 1); vet[159] = dang(phaDt % 1); }
    dtCtx.clearRect(0, 0, 160, 36);
    dtCtx.beginPath();
    for (let i = 0; i < 160; i++) dtCtx[i ? 'lineTo' : 'moveTo'](i, 26 - vet[i] * 20);
    dtCtx.strokeStyle = '#ff4d6a'; dtCtx.lineWidth = 1.6; dtCtx.stroke();
  }

  // Vòng lặp chung
  const trangThai = $('#trang-thai');
  let truoc = performance.now(), dem = 0, chuCu = '';
  function vong(bay) {
    // mốc thời gian của khung đầu có thể sớm hơn lúc khởi động: không để dt âm
    const dt = Math.min(0.05, Math.max(0, (bay - truoc) / 1000)); truoc = Math.max(truoc, bay);
    try {
      canh.capNhat(dt);
      khv.capNhat(dt);
      veDienTim(dt);
      veSongTho(dt);
    } catch (e) { baoLoi(e); return; }
    if ((dem += dt) > 0.2) {
      dem = 0; const s = canh.trangThai(), chu = `Góc: ${s.goc}° · Thu phóng: ${s.thuPhong}%`;
      if (chu !== chuCu) { trangThai.textContent = chu; chuCu = chu; }
    }
    hen(vong);
  }
  hen(vong);

  // Mở đúng chỗ theo đường dẫn (#bo-phan/tim, #benh/cum, #mo-phong/pho-cau-phe-nang),
  // cả khi mở trang lẫn khi đường dẫn đổi.
  // Kiểm thử: ?chup&tua=<giây> tua mô phỏng tới mốc đó để chụp đúng giai đoạn.
  function diTheoHash() {
    const [loai, id] = decodeURIComponent(location.hash.slice(1)).split('/');
    if (loai === 'bo-phan' && db.boPhan[id]) { trangBenh.dong(); chon(id); }
    else if (loai === 'benh' && db.benh[id] && trangBenh.dangMo() !== id) moBenh(id);
    else if (loai === 'tu-kiem-tra' && !tuKiemTra.dang()) moKiemTra();
    else if (loai === 'mo-phong' && db.moPhong[id]) {
      trangBenh.dong(); khv.batDau(id);
      const tua = CHE_DO_CHUP ? +new URLSearchParams(location.search).get('tua') || 0 : 0;
      for (let i = 0; i < tua * 20; i++) khv.capNhat(0.05);
      $('#khv').scrollIntoView({ block: 'center' });
    }
  }
  window.addEventListener('hashchange', diTheoHash);
  diTheoHash();

  window.__coThe = { db, canh, bang, khv, timKiem, trangBenh, tuKiemTra };   // để kiểm thử tự động
  document.body.dataset.sanSang = 'co';                            // kiểm thử chờ cờ này
  baoXong();
}

khoiDong().catch(baoLoi);
