// Dòng nguồn gọn trong một dòng: gộp các mục OpenStax A&P 2e thành "OpenStax §19.1, 19.4",
// nguồn khác lấy tên ngắn (phần trước dấu "—"). Tên đầy đủ hiện khi rê chuột (title).

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lk = (n, chu) => n.url
  ? `<a href="${esc(n.url)}" target="_blank" rel="noopener" title="${esc(n.ten)}">${esc(chu)}</a>`
  : `<span title="${esc(n.ten)}">${esc(chu)}</span>`;

export function dongNguon(nguon, daKiem) {
  const os = [], noi = new Map();          // nguồn khác gộp theo nơi xuất bản: "CDC 1, 2 · WHO"
  for (const n of nguon) {
    const m = /^OpenStax Anatomy and Physiology 2e, (?:mục|chương) ([\d.]+)/.exec(n.ten);
    if (m) { os.push(lk(n, m[1])); continue; }
    const ten = n.ten.split(/\s+[—–-]\s+/)[0].replace(/\s*\([^)]*\)/g, '');
    noi.set(ten, [...(noi.get(ten) || []), n]);
  }
  const khac = [...noi].map(([ten, ds]) => ds.length === 1 ? lk(ds[0], ten) : `${esc(ten)} ${ds.map((n, i) => lk(n, String(i + 1))).join(', ')}`);
  const phan = [...(os.length ? [`<span title="OpenStax Anatomy and Physiology 2e">OpenStax</span> §${os.join(', ')}`] : []), ...khac];
  return `<footer class="nguon"><span class="nguon-chu">Nguồn: ${phan.join(' · ')}</span>
    <span class="kiem ${daKiem ? 'da' : 'chua'}">${daKiem ? 'Đã kiểm chứng' : 'Chưa kiểm chứng'}</span></footer>`;
}
