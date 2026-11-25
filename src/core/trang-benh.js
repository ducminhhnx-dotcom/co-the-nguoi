// Trang chi tiết bệnh: mở toàn trang (thẻ <dialog>), gồm nguyên nhân, triệu chứng,
import { dongNguon } from './nguon.js';
// khi nào cần đi khám, phòng ngừa, bộ phận liên quan, mô phỏng, nguồn. Không ghi thuốc hay phác đồ.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
import { LOAI_BENH as LOAI } from './loai-benh.js';
const ICON = {
  nguyen_nhan: '<circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>',
  trieu_chung: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  khi_nao_di_kham: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  phong_ngua: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'
};
const bieuTuong = k => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

export function taoTrangBenh({ db, khiChonBoPhan, khiChayMoPhong, khiDong }) {
  const hop = document.createElement('dialog');
  hop.className = 'trang-benh';
  hop.setAttribute('aria-labelledby', 'tb-ten');
  document.body.appendChild(hop);
  let dangMo = null;

  function ve(b) {
    const sim = db.moPhongCuaBenh(b.id);
    const ds = arr => `<ul class="ds">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const phan = (k, tieuDe, noiDung, lop = '') =>
      `<section class="tb-phan ${lop}"><h3>${bieuTuong(k)}${tieuDe}</h3>${noiDung}</section>`;
    hop.innerHTML = `
      <div class="tb-khung">
        <header class="tb-dau">
          <div>
            <div class="ten-he" style="color:#ff8fa3">${esc(LOAI[b.loai] || 'Bệnh')}</div>
            <h2 class="ten" id="tb-ten">${esc(b.ten)} ${b.ten_khac ? `<span class="latin">(${esc(b.ten_khac)})</span>` : ''}</h2>
          </div>
          <button class="tb-dong" data-dong aria-label="Đóng trang bệnh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </header>
        ${b.bo_phan.length ? `<div class="tb-anh-huong"><span>Ảnh hưởng tới</span>
          <div class="hang-thuoc">${b.bo_phan.map(id => db.boPhan[id] ? `<button class="vien-thuoc" data-bo-phan="${esc(id)}" style="--m:${esc(db.he[db.boPhan[id].he]?.mau)}">${esc(db.boPhan[id].ten)} <span aria-hidden="true">→</span></button>` : '').join('')}</div></div>` : ''}
        <div class="tb-luoi">
          ${phan('nguyen_nhan', 'Nguyên nhân', `<p class="doan">${esc(b.nguyen_nhan)}</p>`)}
          ${phan('trieu_chung', 'Triệu chứng', ds(b.trieu_chung))}
          ${phan('khi_nao_di_kham', 'Khi nào cần đi khám', ds(b.khi_nao_di_kham), 'canh-bao')}
          ${phan('phong_ngua', 'Phòng ngừa', ds(b.phong_ngua))}
        </div>
        ${sim ? `<section class="tb-mo-phong"><div><div class="tieu-de-nho">Mô phỏng liên quan</div>
            <p class="doan">${esc(sim.ten)}: xem cơ thể phản ứng ở mức tế bào, chia theo giai đoạn.</p></div>
            <button class="nut-chinh" data-mo-phong="${esc(sim.id)}">Chạy mô phỏng</button></section>` : ''}
        <p class="tb-luu-y">Trang này chỉ để học. Không ghi thuốc, liều hay cách điều trị. Có triệu chứng thì hỏi bác sĩ hoặc nhân viên y tế.</p>
        ${dongNguon(b.nguon, b.da_kiem)}
      </div>`;
  }

  function mo(id) {
    const b = db.benh[id]; if (!b) return false;
    dangMo = id; ve(b);
    if (!hop.open) hop.showModal();
    hop.scrollTop = 0;
    hop.querySelector('[data-dong]').focus();
    return true;
  }
  function dong() { if (hop.open) hop.close(); }

  hop.addEventListener('close', () => { const id = dangMo; dangMo = null; khiDong(id); });
  hop.addEventListener('click', e => {
    if (e.target === hop) return dong();                 // bấm ra nền mờ
    const t = e.target.closest('[data-dong],[data-bo-phan],[data-mo-phong]'); if (!t) return;
    if (t.dataset.boPhan) { dong(); khiChonBoPhan(t.dataset.boPhan); }
    else if (t.dataset.moPhong) { dong(); khiChayMoPhong(t.dataset.moPhong); }
    else dong();
  });

  return { mo, dong, dangMo: () => dangMo };
}
