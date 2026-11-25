// Kiểm cấu trúc dữ liệu và các liên kết chéo (phiên bản cấu trúc: 1).
// Chạy bằng Node:      node tools/kiem-du-lieu.js
// Chạy bằng trình duyệt: mở tests/kiem-du-lieu.html qua máy chủ tĩnh.
// Trả về { loi: [], canh_bao: [], thong_tin: [] }. Có lỗi thì Node thoát với mã 1.

import { LOAI_BENH } from '../src/core/loai-benh.js';

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PHIEN_BAN = 1;
const LIEU_THUOC = /\d+([.,]\d+)?\s*(mg|mcg|µg|ml\/kg|mg\/kg|viên|lần\/ngày)\b/i;

export async function kiemDuLieu(doc, coFile) {
  const loi = [], canhBao = [], thongTin = [];
  const L = (f, m) => loi.push(`${f}: ${m}`), C = (f, m) => canhBao.push(`${f}: ${m}`);
  const laChuoi = x => typeof x === 'string' && x.trim().length > 0;
  const dsChuoi = (f, ten, x, rongDuoc = true) => {
    if (!Array.isArray(x)) return L(f, `"${ten}" phải là mảng`);
    if (!rongDuoc && !x.length) L(f, `"${ten}" không được rỗng`);
    x.forEach((s, i) => { if (!laChuoi(s)) L(f, `"${ten}[${i}]" phải là chuỗi khác rỗng`); });
  };
  const kiemNguon = (f, n) => {
    if (!Array.isArray(n) || !n.length) return L(f, 'thiếu "nguon" (mọi thông tin y học phải có nguồn)');
    n.forEach((x, i) => { if (!laChuoi(x?.ten)) L(f, `nguon[${i}] thiếu "ten"`); if (x?.url && !/^https:\/\//.test(x.url)) C(f, `nguon[${i}].url không phải https`); });
  };

  let idx;
  try { idx = await doc('data/index.json'); } catch (e) { L('data/index.json', e.message); return { loi, canh_bao: canhBao, thong_tin: thongTin }; }
  if (idx.phien_ban_cau_truc !== PHIEN_BAN) L('data/index.json', `phien_ban_cau_truc phải là ${PHIEN_BAN}`);
  for (const k of ['bo_phan', 'benh', 'mo_phong']) {
    if (!Array.isArray(idx[k])) { L('data/index.json', `thiếu mảng "${k}"`); idx[k] = []; }
    const trung = idx[k].filter((x, i) => idx[k].indexOf(x) !== i);
    if (trung.length) L('data/index.json', `"${k}" có id trùng: ${trung.join(', ')}`);
    idx[k].forEach(id => { if (!ID.test(id)) L('data/index.json', `id "${id}" sai quy ước (chữ thường, không dấu, nối bằng gạch ngang)`); });
  }

  const nap = async (f) => { try { return await doc(f); } catch (e) { L(f, e.message); return null; } };
  const heF = await nap('data/he.json');
  const he = new Set((heF?.he || []).map(h => h.id));
  (heF?.he || []).forEach(h => { if (!ID.test(h.id)) L('data/he.json', `id "${h.id}" sai quy ước`); if (!/^#[0-9a-f]{6}$/i.test(h.mau || '')) L('data/he.json', `hệ "${h.id}" thiếu màu dạng #rrggbb`); });

  const boPhan = {}, benh = {};
  for (const id of idx.bo_phan) { const d = await nap(`data/bo-phan/${id}.json`); if (d) boPhan[id] = d; }
  for (const id of idx.benh) { const d = await nap(`data/benh/${id}.json`); if (d) benh[id] = d; }
  const moHinh = idx.mo_hinh ? await nap(idx.mo_hinh) : (L('data/index.json', 'thiếu "mo_hinh"'), null);
  (moHinh?.doi_tuong || []).forEach(o => { if (o.mau !== undefined && !/^#[0-9a-f]{6}$/i.test(o.mau)) L(idx.mo_hinh, `màu của "${o.id}" phải dạng #rrggbb`); });
  const idMoHinh = new Set([...(moHinh?.doi_tuong || []).map(x => x.id), ...(moHinh?.mach || []).map(x => x.id)]);

  // ---- bộ phận ----
  for (const [id, d] of Object.entries(boPhan)) {
    const f = `data/bo-phan/${id}.json`;
    if (d.id !== id) L(f, `"id" (${d.id}) không khớp tên file`);
    for (const k of ['ten', 'ten_khac', 'he', 'mo_hinh', 'them_tu_ban']) if (!laChuoi(d[k])) L(f, `thiếu "${k}"`);
    if (d.he && !he.has(d.he)) L(f, `hệ "${d.he}" không có trong data/he.json`);
    if (!d.co_ban || !laChuoi(d.co_ban.vi_tri)) L(f, 'thiếu "co_ban.vi_tri"');
    else dsChuoi(f, 'co_ban.so_lieu', d.co_ban.so_lieu, false);
    dsChuoi(f, 'chuc_nang', d.chuc_nang, false);
    if (!d.tuong_tac || !Array.isArray(d.tuong_tac.bo_phan)) L(f, 'thiếu "tuong_tac.bo_phan"');
    else d.tuong_tac.bo_phan.forEach((x, i) => {
      if (!boPhan[x?.id] && !idx.bo_phan.includes(x?.id)) L(f, `tuong_tac.bo_phan[${i}]: id "${x?.id}" không tồn tại`);
      if (x?.id === id) C(f, 'tương tác với chính nó');
      if (!laChuoi(x?.mo_ta)) L(f, `tuong_tac.bo_phan[${i}] thiếu "mo_ta"`);
    });
    if (d.tuong_tac) dsChuoi(f, 'tuong_tac.toan_than', d.tuong_tac.toan_than);
    if (!Array.isArray(d.benh)) L(f, '"benh" phải là mảng');
    else d.benh.forEach(b => { if (!idx.benh.includes(b)) L(f, `bệnh "${b}" không tồn tại`); });
    kiemNguon(f, d.nguon);
    if (typeof d.da_kiem !== 'boolean') L(f, '"da_kiem" phải là true hoặc false');
    if (d.mo_hinh && moHinh && !idMoHinh.has(d.mo_hinh)) C(f, `mô hình chưa có đối tượng "${d.mo_hinh}" (bộ phận sẽ không bấm được trên hình 3D)`);
  }

  // ---- bệnh ----
  for (const [id, d] of Object.entries(benh)) {
    const f = `data/benh/${id}.json`;
    if (d.id !== id) L(f, `"id" (${d.id}) không khớp tên file`);
    for (const k of ['ten', 'loai', 'nguyen_nhan']) if (!laChuoi(d[k])) L(f, `thiếu "${k}"`);
    if (laChuoi(d.loai) && !(d.loai in LOAI_BENH)) C(f, `loại bệnh "${d.loai}" chưa có nhãn trong src/core/loai-benh.js`);
    if (!Array.isArray(d.bo_phan)) L(f, '"bo_phan" phải là mảng');
    else d.bo_phan.forEach(b => { if (!idx.bo_phan.includes(b)) L(f, `bộ phận "${b}" không tồn tại`); });
    for (const k of ['trieu_chung', 'khi_nao_di_kham', 'phong_ngua']) dsChuoi(f, k, d[k], false);
    if (d.mo_phong != null && !idx.mo_phong.includes(d.mo_phong)) L(f, `mô phỏng "${d.mo_phong}" không có trong data/index.json`);
    kiemNguon(f, d.nguon);
    if (typeof d.da_kiem !== 'boolean') L(f, '"da_kiem" phải là true hoặc false');
    const chu = JSON.stringify([d.nguyen_nhan, d.trieu_chung, d.khi_nao_di_kham, d.phong_ngua]);
    if (LIEU_THUOC.test(chu)) L(f, 'có vẻ ghi liều thuốc — phần bệnh không được ghi liều hay phác đồ (CLAUDE.md mục 3.5)');
    for (const k of ['phac_do', 'dieu_tri', 'thuoc', 'lieu']) if (k in d) L(f, `không được có trường "${k}"`);
  }

  // ---- mô hình ----
  if (moHinh) {
    for (const m of idMoHinh) if (!Object.values(boPhan).some(b => b.mo_hinh === m)) L(idx.mo_hinh, `đối tượng "${m}" không có bộ phận nào trỏ tới`);
    if (!moHinh.diem) C(idx.mo_hinh, 'thiếu "diem"');
  }

  // ---- mô phỏng ----
  for (const id of idx.mo_phong) {
    if (coFile && !(await coFile(`src/sims/${id}.js`))) L('data/index.json', `không thấy file src/sims/${id}.js`);
    // nội dung mô-đun: bộ phận được nhắc tới phải tồn tại
    let m = null;
    try { m = (await import(`../src/sims/${id}.js`)).default; } catch (e) { L(`src/sims/${id}.js`, `không nạp được: ${e.message}`); continue; }
    const f = `src/sims/${id}.js`;
    if (m.id !== id) L(f, `"id" (${m.id}) không khớp tên file`);
    if (m.nhom && !['van-hanh', 'nhiem-trung'].includes(m.nhom)) L(f, `"nhom" phải là "van-hanh" hoặc "nhiem-trung"`);
    if (m.vi_tri && !idx.bo_phan.includes(m.vi_tri)) L(f, `vi_tri "${m.vi_tri}" không phải bộ phận có trong data/index.json`);
    if (m.diem && moHinh?.diem && !(m.diem in moHinh.diem)) L(f, `điểm "${m.diem}" không có trong ${idx.mo_hinh}`);
    if (!Array.isArray(m.giai_doan) || !m.giai_doan.length) L(f, 'thiếu "giai_doan"');
    else m.giai_doan.forEach((g, i) => {
      if (!laChuoi(g.mo_ta)) L(f, `giai_doan[${i}] thiếu "mo_ta"`);
      if (g.bo_phan && !idx.bo_phan.includes(g.bo_phan)) L(f, `giai_doan[${i}].bo_phan "${g.bo_phan}" không tồn tại`);
    });
  }

  // Liên kết một chiều: không phải lỗi (lõi tự suy ra chiều ngược), chỉ báo để biết
  const motChieu = [];
  for (const [id, d] of Object.entries(boPhan)) for (const x of d.tuong_tac?.bo_phan || [])
    if (boPhan[x.id] && !boPhan[x.id].tuong_tac?.bo_phan?.some(y => y.id === id)) motChieu.push(`${id} → ${x.id}`);
  if (motChieu.length) thongTin.push(`Liên kết một chiều, giao diện tự suy ra chiều ngược (${motChieu.length}): ${motChieu.join(', ')}`);

  const chua = [...Object.values(boPhan), ...Object.values(benh)].filter(d => d.da_kiem === false).map(d => d.id);
  thongTin.push(`${Object.keys(boPhan).length} bộ phận, ${Object.keys(benh).length} bệnh, ${idx.mo_phong.length} mô phỏng, ${idMoHinh.size} đối tượng 3D`);
  if (chua.length) thongTin.push(`Chưa kiểm chứng (${chua.length}): ${chua.join(', ')}`);
  return { loi, canh_bao: canhBao, thong_tin: thongTin };
}

// ---- chạy trực tiếp bằng Node ----
if (typeof process !== 'undefined' && process.argv?.[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const goc = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
  const doc = async f => JSON.parse(await fs.readFile(path.join(goc, f), 'utf8'));
  const coFile = async f => fs.access(path.join(goc, f)).then(() => true, () => false);
  const kq = await kiemDuLieu(doc, coFile);
  kq.thong_tin.forEach(x => console.log('•', x));
  kq.canh_bao.forEach(x => console.log('CẢNH BÁO', x));
  kq.loi.forEach(x => console.log('LỖI', x));
  console.log(kq.loi.length ? `\n${kq.loi.length} lỗi.` : '\nKhông có lỗi.');
  process.exit(kq.loi.length ? 1 : 0);
}
