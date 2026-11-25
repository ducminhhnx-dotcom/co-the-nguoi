// Bảng thông tin: tên hệ → tên bộ phận (Latin) → 4 tab Cơ bản · Chức năng · Tương tác · Bệnh.
import { dongNguon } from './nguon.js';
// Dòng nguồn và trạng thái kiểm chứng luôn ở cuối bảng.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TAB = [['co-ban', 'Cơ bản'], ['chuc-nang', 'Chức năng'], ['tuong-tac', 'Tương tác'], ['benh', 'Bệnh']];
import { LOAI_BENH } from './loai-benh.js';

export function taoBangThongTin({ khung, db, khiChonBoPhan, khiMoBenh }) {
  let tab = 'co-ban', hienTai = null;

  const nutBoPhan = (id, mota) => {
    const b = db.boPhan[id]; if (!b) return '';
    return `<button class="vien-thuoc" data-bo-phan="${esc(id)}" style="--m:${esc(db.moHinh.doi_tuong?.find(x => x.id === b.mo_hinh)?.mau || db.he[b.he]?.mau || '#7fe8ff')}">${esc(b.ten)} <span aria-hidden="true">→</span></button>${mota ? `<span class="mo-ta-lk">${esc(mota)}</span>` : ''}`;
  };
  const nutBenh = id => {
    const b = db.benh[id]; if (!b) return '';
    return `<button class="vien-thuoc benh" data-benh="${esc(id)}">${esc(b.ten)} <span aria-hidden="true">→</span></button>`;
  };
  const chanTrang = dongNguon;

  // Hình 3D tự dựng (không lấy từ bộ dữ liệu giải phẫu) thì nói rõ
  function ghiChuMoHinh(b) {
    const o = db.moHinh.doi_tuong?.find(x => x.id === b.mo_hinh);
    if (!o) return '<p class="ghi-chu-mh">Bộ phận này chưa có hình trên mô hình 3D.</p>';
    return o.cach_dieu ? `<p class="ghi-chu-mh">Hình 3D là khối cách điệu: ${esc(o.ghi_chu || '')}</p>` : '';
  }

  function oSoLieu(s) {
    const i = s.indexOf(': ');
    if (!(i > 0 && i < 40)) return `<div class="o-so rong"><div class="gia-tri nho">${esc(s)}</div></div>`;
    // "Nhãn: giá trị (điều kiện)" → điều kiện in thành dòng phụ
    const m = s.slice(i + 2).match(/^(.*?)\s*\(([^()]*)\)$/);
    return `<div class="o-so"><div class="nhan">${esc(s.slice(0, i))}</div><div class="gia-tri">${esc(m ? m[1] : s.slice(i + 2))}</div>${m ? `<div class="dieu-kien">${esc(m[2])}</div>` : ''}</div>`;
  }

  function noiDungTab(b) {
    const nguoc = db.tuongTacNguoc(b.id);
    if (tab === 'co-ban') {
      const lienQuan = [...b.tuong_tac.bo_phan, ...nguoc].map(x => nutBoPhan(x.id)).concat(db.benhCua(b.id).map(nutBenh)).join('');
      return `<div class="luoi-so">${b.co_ban.so_lieu.map(oSoLieu).join('')}</div>
        <p class="doan">${esc(b.co_ban.vi_tri)}${b.co_ban.mo_ta ? ' ' + esc(b.co_ban.mo_ta) : ''}</p>
        ${lienQuan ? `<div class="tieu-de-nho">Liên quan</div><div class="hang-thuoc">${lienQuan}</div>` : ''}`;
    }
    if (tab === 'chuc-nang') return `<ul class="ds">${b.chuc_nang.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (tab === 'tuong-tac') {
      return `<div class="tieu-de-nho">Với bộ phận khác</div>
        ${b.tuong_tac.bo_phan.length ? `<ul class="ds lien-ket">${b.tuong_tac.bo_phan.map(x => `<li>${nutBoPhan(x.id, x.mo_ta)}</li>`).join('')}</ul>` : '<p class="mo">Chưa có dữ liệu.</p>'}
        ${nguoc.length ? `<div class="tieu-de-nho">Được nhắc tới ở</div>
          <ul class="ds lien-ket">${nguoc.map(x => `<li>${nutBoPhan(x.id, x.mo_ta)}</li>`).join('')}</ul>` : ''}
        <div class="tieu-de-nho">Với toàn cơ thể</div>
        ${b.tuong_tac.toan_than.length ? `<ul class="ds">${b.tuong_tac.toan_than.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="mo">Chưa có dữ liệu.</p>'}`;
    }
    const ds = db.benhCua(b.id);
    return ds.length
      ? `<ul class="ds lien-ket">${ds.map(id => `<li>${nutBenh(id)}<span class="mo-ta-lk">${esc(LOAI_BENH[db.benh[id].loai] || '')}</span></li>`).join('')}</ul>`
      : '<p class="mo">Dữ liệu chưa có bệnh nào gắn với bộ phận này. Bệnh sẽ được thêm dần ở các bản sau.</p>';
  }

  function veBoPhan(b) {
    const he = db.he[b.he];
    khung.innerHTML = `
      <div class="ten-he" style="color:${esc(he?.mau)}">${esc(he?.ten_day_du || b.he)}</div>
      <h2 class="ten">${esc(b.ten)} <span class="latin">(${esc(b.ten_khac)})</span></h2>
      <div class="tabs" role="tablist" aria-label="Thông tin ${esc(b.ten)}">
        ${TAB.map(([id, t]) => `<button role="tab" id="tab-${id}" aria-selected="${id === tab}" aria-controls="noi-dung-tab" data-tab="${id}">${t}</button>`).join('')}
      </div>
      <div id="noi-dung-tab" role="tabpanel" aria-labelledby="tab-${tab}">${noiDungTab(b)}</div>
      ${ghiChuMoHinh(b)}
      ${chanTrang(b.nguon, b.da_kiem)}`;
  }

  function veHuongDan() {
    khung.innerHTML = `
      <div class="ten-he">Hướng dẫn</div>
      <h2 class="ten">Bắt đầu từ đâu?</h2>
      <ul class="ds">
        <li>Kéo để xoay mô hình, cuộn để phóng to hoặc thu nhỏ, kéo hai ngón hoặc chuột phải để di chuyển.</li>
        <li>Bấm vào một cơ quan hoặc mạch máu để đọc thông tin.</li>
        <li>Mạch đỏ là máu giàu oxy, mạch xanh là máu nghèo oxy.</li>
        <li>Bật, tắt từng hệ ở cột trái; chỉnh nhịp tim để thấy máu chảy nhanh, chậm theo.</li>
        <li>Gõ tên bộ phận hoặc bệnh vào ô tìm kiếm, có dấu hay không dấu đều được.</li>
        <li>Chỉnh nhịp thở ở cột trái để thấy phổi phồng xẹp theo. Chạy mô phỏng ở khung "Kính hiển vi" để xem trao đổi khí và hệ miễn dịch làm việc.</li>
      </ul>
      <div class="tieu-de-nho">Thử bấm</div>
      <div class="hang-thuoc">${['tim', 'phoi', 'than', 'dong-mach-chu'].map(id => nutBoPhan(id)).join('')}</div>`;
  }

  khung.addEventListener('click', e => {
    const t = e.target.closest('[data-tab],[data-bo-phan],[data-benh]');
    if (!t) return;
    if (t.dataset.tab) { tab = t.dataset.tab; veBoPhan(db.boPhan[hienTai.id]); khung.querySelector(`#tab-${tab}`).focus(); }
    else if (t.dataset.boPhan) khiChonBoPhan(t.dataset.boPhan);
    else if (t.dataset.benh) khiMoBenh(t.dataset.benh);
  });
  khung.addEventListener('keydown', e => {
    const t = e.target.closest('[role=tab]'); if (!t || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = TAB.findIndex(x => x[0] === t.dataset.tab), j = (i + (e.key === 'ArrowRight' ? 1 : TAB.length - 1)) % TAB.length;
    tab = TAB[j][0]; veBoPhan(db.boPhan[hienTai.id]); khung.querySelector(`#tab-${tab}`).focus();
  });

  function moBoPhan(id) {
    const b = db.boPhan[id]; if (!b) return;
    if (hienTai?.id !== id) tab = 'co-ban';
    hienTai = { loai: 'bo-phan', id };
    veBoPhan(b);
  }
  veHuongDan();
  // vẽ lại nội dung đang xem (dùng khi thoát chế độ tự kiểm tra)
  const veLai = () => hienTai ? veBoPhan(db.boPhan[hienTai.id]) : veHuongDan();
  return { moBoPhan, veLai, hienTai: () => hienTai };
}
