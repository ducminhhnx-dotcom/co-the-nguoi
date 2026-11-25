// Chế độ tự kiểm tra: câu hỏi tạo tự động từ dữ liệu đã có nguồn (data/bo-phan, data/benh, data/he),
// không thêm nội dung y học mới. Kết quả chỉ giữ trong lúc làm bài, không lưu lại (CLAUDE.md mục 8).
// 4 dạng câu: bấm đúng cơ quan trên hình 3D, đoán cơ quan từ chức năng, bệnh ảnh hưởng cơ quan nào, cơ quan thuộc hệ nào.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SO_CAU = 10;
// Bộ phận thuộc hai hệ (tụy: nội tiết và tiêu hóa) thì không hỏi "thuộc hệ nào" để tránh câu có hai đáp án đúng
const KHONG_HOI_HE = new Set(['tuy']);
const tron = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; };
const lay = a => a[Math.random() * a.length | 0];

export function taoTuKiemTra({ khung, db, canh, khiXemBoPhan, khiThoat, khiTrangThai = () => {} }) {
  let dang = false, so = 0, dung = 0, cau = null, daTraLoi = false;
  const coHinh = new Set((db.moHinh.doi_tuong || []).map(o => o.id));
  // câu "bấm" chỉ hỏi bộ phận có hình và thuộc hệ hiện sẵn khi mở trang (xương, cơ ẩn mặc định nên bỏ qua)
  const boPhanCoHinh = db.dsBoPhan.filter(b => coHinh.has(b.mo_hinh) && b.mo_hinh !== db.moHinh.vo && !db.he[b.he]?.an_mac_dinh);

  function cauBam() {
    const b = lay(boPhanCoHinh);
    return { loai: 'bam', dung: b.id, ten: b.ten, hoi: `Bấm vào <strong>${esc(b.ten)}</strong> trên hình 3D`, goiY: 'Xoay, phóng to hoặc bật, tắt hệ ở cột trái nếu cần. Bấm thẳng vào cơ quan trên hình.' };
  }
  function cauChucNang() {
    const b = lay(db.dsBoPhan.filter(x => x.chuc_nang?.length));
    let cn = lay(b.chuc_nang);
    // che tên cơ quan trong câu để không lộ đáp án
    for (const t of [b.ten, b.ten.toLowerCase()]) cn = cn.split(t).join('___');
    const khac = tron(db.dsBoPhan.filter(x => x.id !== b.id)).slice(0, 3);
    return { loai: 'chon', dung: b.id, hoi: 'Cơ quan nào có chức năng này?', trich: cn, lua: tron([b, ...khac]).map(x => ({ id: x.id, ten: x.ten })), giaiThich: `Đây là chức năng của <strong>${esc(b.ten)}</strong>.`, xem: b.id };
  }
  function cauBenh() {
    const d = lay(db.dsBenh.filter(x => x.bo_phan?.length));
    const dungId = lay(d.bo_phan);
    const khac = tron(db.dsBoPhan.filter(x => !d.bo_phan.includes(x.id) && x.he !== 'co' && x.he !== 'xuong')).slice(0, 3);
    const tenCa = d.bo_phan.map(id => db.boPhan[id]?.ten).filter(Boolean).join(', ');
    return { loai: 'chon', dung: dungId, hoi: `Bệnh <strong>${esc(d.ten)}</strong> ảnh hưởng trực tiếp tới cơ quan nào?`, lua: tron([db.boPhan[dungId], ...khac]).map(x => ({ id: x.id, ten: x.ten })), giaiThich: `${esc(d.ten)} ảnh hưởng tới: ${esc(tenCa)}.`, xem: dungId, benh: d.id };
  }
  function cauHe() {
    const b = lay(db.dsBoPhan.filter(x => !KHONG_HOI_HE.has(x.id) && db.he[x.he]));
    const khac = tron(db.dsHe.filter(h => h.id !== b.he && !h.chua_co)).slice(0, 3);
    return { loai: 'chon', dung: b.he, hoi: `<strong>${esc(b.ten)}</strong> thuộc hệ cơ quan nào?`, lua: tron([db.he[b.he], ...khac]).map(h => ({ id: h.id, ten: h.ten_day_du || h.ten })), giaiThich: `${esc(b.ten)} thuộc ${esc(db.he[b.he].ten_day_du || db.he[b.he].ten)}.`, xem: b.id };
  }
  const TAO = [cauBam, cauChucNang, cauBenh, cauHe];

  function ve() {
    if (so >= SO_CAU) {
      khiTrangThai(null);
      khung.innerHTML = `
        <div class="ten-he">Tự kiểm tra</div>
        <h2 class="ten">Kết quả: ${dung}/${SO_CAU}</h2>
        <p class="doan">${dung >= 8 ? 'Rất tốt!' : dung >= 5 ? 'Khá rồi, làm thêm lượt nữa để nhớ chắc hơn.' : 'Xem lại các bộ phận rồi thử lại nhé.'} Kết quả không được lưu lại.</p>
        <div class="tkt-nut"><button class="nut-chinh" data-lam-lai>Làm lượt mới</button><button class="tkt-phu" data-thoat>Thoát</button></div>`;
      khung.querySelector('[data-lam-lai]').focus();
      return;
    }
    const daDung = daTraLoi && cau.ketQua;
    khung.innerHTML = `
      <div class="ten-he">Tự kiểm tra · câu ${so + 1}/${SO_CAU} · đúng ${dung}</div>
      <h2 class="tkt-hoi">${cau.hoi}</h2>
      ${cau.trich ? `<blockquote class="tkt-trich">${esc(cau.trich)}</blockquote>` : ''}
      ${cau.loai === 'bam' ? `<p class="mo">${cau.goiY}</p>` : `<div class="tkt-lua" role="group" aria-label="Các lựa chọn">${cau.lua.map(l => {
        const lop = !daTraLoi ? '' : l.id === cau.dung ? 'dung' : l.id === cau.chon ? 'sai' : '';
        return `<button class="tkt-chon ${lop}" data-chon="${esc(l.id)}" ${daTraLoi ? 'disabled' : ''}>${esc(l.ten)}</button>`;
      }).join('')}</div>`}
      ${daTraLoi ? `<div class="tkt-ket ${daDung ? 'dung' : 'sai'}" role="status">
          <strong>${daDung ? 'Đúng rồi.' : 'Chưa đúng.'}</strong> ${cau.giaiThich || ''}
        </div>
        <div class="tkt-nut"><button class="nut-chinh" data-tiep>${so + 1 >= SO_CAU ? 'Xem kết quả' : 'Câu tiếp'}</button>
          ${cau.xem ? `<button class="tkt-phu" data-xem="${esc(cau.xem)}">Đọc về ${esc(db.boPhan[cau.xem]?.ten || '')}</button>` : ''}</div>` : ''}
      <div class="tkt-chan"><button class="tkt-phu" data-thoat>Thoát tự kiểm tra</button></div>`;
    if (daTraLoi) khung.querySelector('[data-tiep]').focus();
  }

  function cauMoi() {
    cau = lay(TAO)(); daTraLoi = false;
    canh.chon(null);                                   // không để sẵn cơ quan đang sáng làm lộ đáp án
    ve();
    khiTrangThai({ loai: cau.loai, ten: cau.ten, daTraLoi: false });
  }
  function traLoi(id) {
    if (!dang || daTraLoi || !cau) return;
    daTraLoi = true; cau.chon = id; cau.ketQua = id === cau.dung;
    if (cau.ketQua) dung++;
    if (cau.loai === 'bam') {
      const ten = db.boPhan[cau.dung]?.ten, tenChon = db.boPhan[id]?.ten;
      cau.giaiThich = cau.ketQua ? `Đó là ${esc(ten)}.` : `Bạn bấm vào ${esc(tenChon || 'chỗ khác')}. ${esc(ten)} đang được làm sáng trên hình.`;
      cau.xem = cau.dung;
    }
    const bp = db.boPhan[cau.loai === 'chon' && db.he[cau.dung] ? cau.xem : cau.dung];
    if (bp) canh.chon(bp.mo_hinh);                     // làm sáng đáp án đúng
    ve();
    khiTrangThai({ loai: cau.loai, ten: cau.ten, daTraLoi: true, ketQua: cau.ketQua });
  }

  khung.addEventListener('click', e => {
    if (!dang) return;
    const t = e.target.closest('[data-chon],[data-tiep],[data-xem],[data-thoat],[data-lam-lai]'); if (!t) return;
    e.stopPropagation();
    if (t.dataset.chon) traLoi(t.dataset.chon);
    else if ('tiep' in t.dataset) { so++; so >= SO_CAU ? ve() : cauMoi(); }
    else if (t.dataset.xem) { const id = t.dataset.xem; thoat(); khiXemBoPhan(id); }
    else if ('lamLai' in t.dataset) batDau();
    else if ('thoat' in t.dataset) thoat();
  }, true);

  function batDau() { dang = true; so = 0; dung = 0; cauMoi(); }
  function thoat() { if (!dang) return; dang = false; cau = null; khiTrangThai(null); khiThoat(); }

  return {
    batDau, thoat,
    dang: () => dang,
    // bấm trên hình 3D khi đang làm bài: chỉ tính cho câu "bấm đúng cơ quan"
    bamTren3D(idBoPhan) { if (dang && cau?.loai === 'bam' && !daTraLoi) traLoi(idBoPhan); },
    _cau: () => cau                                     // để kiểm thử tự động
  };
}
