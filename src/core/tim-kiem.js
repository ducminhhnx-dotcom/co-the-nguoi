// Tìm bộ phận và bệnh theo tên; gõ có dấu hay không dấu đều được ("dong mach" tìm ra "Động mạch…").
import { boDau } from './du-lieu.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function taoTimKiem({ o, ds, db, khiChonBoPhan, khiMoBenh }) {
  // Chỉ mục: mỗi mục có tên chính (điểm cao) và tên phụ (Latin/Anh, id, tên hệ)
  const muc = [
    ...db.dsBoPhan.map(b => ({ loai: 'bo-phan', id: b.id, ten: b.ten, phu: b.ten_khac, mau: db.he[b.he]?.mau, nhan: db.he[b.he]?.ten_day_du || '',
      chinh: boDau(b.ten), them: boDau(`${b.ten_khac} ${b.id} ${db.he[b.he]?.ten_day_du || ''}`) })),
    ...db.dsBenh.map(b => ({ loai: 'benh', id: b.id, ten: b.ten, phu: b.ten_khac || '', mau: '#ff4d6a', nhan: 'Bệnh',
      chinh: boDau(b.ten), them: boDau(`${b.ten_khac || ''} ${b.id}`) }))
  ];

  function diem(m, q) {
    const tu = q.split(' ');
    if (!tu.every(t => m.chinh.includes(t) || m.them.includes(t))) return 0;
    if (m.chinh === q) return 100;
    if (m.chinh.startsWith(q)) return 80;
    if (m.chinh.split(' ').some(w => w.startsWith(tu[0]))) return 60;
    if (m.chinh.includes(q)) return 50;
    return 20;
  }

  let ketQua = [], chon = -1;
  function ve() {
    const q = boDau(o.value);
    if (!q) { ds.hidden = true; o.setAttribute('aria-expanded', 'false'); return; }
    ketQua = muc.map(m => ({ m, d: diem(m, q) })).filter(x => x.d > 0)
      .sort((a, b) => b.d - a.d || a.m.ten.localeCompare(b.m.ten, 'vi')).slice(0, 8).map(x => x.m);
    chon = ketQua.length ? 0 : -1;
    ds.innerHTML = ketQua.length
      ? ketQua.map((m, i) => `<li role="option" id="tk-${i}" aria-selected="${i === chon}" data-i="${i}">
          <span class="tk-cham" style="background:${esc(m.mau)}"></span>
          <span class="tk-ten">${esc(m.ten)} <small>${esc(m.phu)}</small></span>
          <span class="tk-nhan">${esc(m.nhan)}</span></li>`).join('')
      : `<li class="tk-rong">Không tìm thấy "${esc(o.value.trim())}".</li>`;
    ds.hidden = false; o.setAttribute('aria-expanded', 'true');
    o.setAttribute('aria-activedescendant', chon >= 0 ? `tk-${chon}` : '');
  }
  function danhDau() {
    ds.querySelectorAll('[role=option]').forEach((li, i) => li.setAttribute('aria-selected', i === chon));
    o.setAttribute('aria-activedescendant', chon >= 0 ? `tk-${chon}` : '');
    ds.querySelector(`#tk-${chon}`)?.scrollIntoView({ block: 'nearest' });
  }
  function moi(i) {
    const m = ketQua[i]; if (!m) return;
    o.value = ''; ds.hidden = true; o.setAttribute('aria-expanded', 'false'); o.blur();
    m.loai === 'bo-phan' ? khiChonBoPhan(m.id) : khiMoBenh(m.id);
  }

  o.addEventListener('input', ve);
  o.addEventListener('focus', () => { if (o.value) ve(); });
  o.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && ketQua.length) { e.preventDefault(); chon = (chon + 1) % ketQua.length; danhDau(); }
    else if (e.key === 'ArrowUp' && ketQua.length) { e.preventDefault(); chon = (chon - 1 + ketQua.length) % ketQua.length; danhDau(); }
    else if (e.key === 'Enter') { e.preventDefault(); moi(chon); }
    else if (e.key === 'Escape') { o.value = ''; ve(); }
  });
  // pointerdown để chọn trước khi ô nhập mất tiêu điểm
  ds.addEventListener('pointerdown', e => { const li = e.target.closest('[data-i]'); if (li) { e.preventDefault(); moi(+li.dataset.i); } });
  o.addEventListener('blur', () => setTimeout(() => { ds.hidden = true; o.setAttribute('aria-expanded', 'false'); }, 120));

  return { tim: q => { o.value = q; ve(); return ketQua.map(m => `${m.loai}:${m.id}`); } };
}
