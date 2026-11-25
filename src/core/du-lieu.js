// Nạp toàn bộ dữ liệu theo danh sách trong data/index.json.
// Thêm bộ phận, bệnh hay mô phỏng: chỉ cần thêm file và ghi id vào data/index.json.

// Bỏ dấu tiếng Việt để tìm kiếm: "Động mạch" → "dong mach".
export const boDau = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function docJson(duong) {
  const r = await fetch(duong);
  if (!r.ok) throw new Error(`Không đọc được ${duong} (mã ${r.status})`);
  return r.json();
}

export async function napDuLieu() {
  const idx = await docJson('data/index.json');
  const [he, moHinh, boPhan, benh, moPhong] = await Promise.all([
    docJson('data/he.json'),
    docJson(idx.mo_hinh),
    Promise.all(idx.bo_phan.map(id => docJson(`data/bo-phan/${id}.json`))),
    Promise.all(idx.benh.map(id => docJson(`data/benh/${id}.json`))),
    Promise.all(idx.mo_phong.map(id => import(`../sims/${id}.js`).then(m => m.default)))
  ]);
  const theoId = arr => Object.fromEntries(arr.map(x => [x.id, x]));
  const db = {
    phienBan: idx.phien_ban,
    he: theoId(he.he), dsHe: he.he,
    boPhan: theoId(boPhan), dsBoPhan: boPhan,
    benh: theoId(benh), dsBenh: benh,
    moPhong: theoId(moPhong), dsMoPhong: moPhong,
    moHinh
  };
  // Liên kết hai chiều: bệnh ghi bo_phan gồm X thì X tự hiện bệnh đó.
  db.benhCua = id => {
    const bp = db.boPhan[id];
    const s = new Set(bp ? bp.benh : []);
    for (const b of benh) if (b.bo_phan.includes(id)) s.add(b.id);
    return [...s].filter(x => db.benh[x]);
  };
  // Tương tác bộ phận cũng tự suy ra hai chiều: B ghi tương tác với A mà A chưa ghi B
  // thì A hiện B trong mục "Được nhắc tới ở", kèm câu mô tả của B.
  db.tuongTacNguoc = id => boPhan
    .filter(b => b.id !== id && b.tuong_tac.bo_phan.some(x => x.id === id)
      && !db.boPhan[id]?.tuong_tac.bo_phan.some(x => x.id === b.id))
    .map(b => ({ id: b.id, mo_ta: b.tuong_tac.bo_phan.find(x => x.id === id).mo_ta }));
  db.moPhongCuaBenh = id => db.moPhong[db.benh[id]?.mo_phong];
  db.benhCuaMoPhong = id => benh.find(b => b.mo_phong === id);
  // Tra bộ phận theo tên đối tượng 3D (trường mo_hinh).
  db.boPhanTheoMoHinh = Object.fromEntries(boPhan.map(b => [b.mo_hinh, b]));
  return db;
}
