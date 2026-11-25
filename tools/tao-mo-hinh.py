"""Tạo mô hình 3D của dự án từ BodyParts3D (bản 4.0, lưới giảm 99%).

Cách chạy:
    py tools/tao-mo-hinh.py <đường dẫn isa_BP3D_4.0_obj_99.zip>

Đầu ra:
    models/co-the.glb   — mỗi bộ phận một đối tượng 3D, tên đối tượng = id bộ phận
    models/co-the.json  — mô tả: danh sách đối tượng, đường máu chảy, điểm đánh dấu, ghi công

Chỉ dùng thư viện chuẩn của Python. Việc làm:
  1. Chọn các file OBJ theo tên tiếng Anh (bảng CHON bên dưới) và gom thành nhóm theo id bộ phận.
  2. Giảm lưới bằng cách gom đỉnh theo ô lưới (vertex clustering), cỡ ô tùy nhóm.
  3. Phổi: BodyParts3D 4.0 không có lưới nhu mô phổi, nên dựng khối elip theo khung bao của cây phế quản thật.
  4. Mạch máu: tính trục giữa từng đoạn mạch (cắt lát theo trục chính) để làm đường cho hạt máu chảy.
  5. Đổi đơn vị: mm → đơn vị cảnh (1 đơn vị = 190 mm), trục y hướng lên, z hướng ra phía trước.

Dữ liệu gốc: BodyParts3D, © The Database Center for Life Science, CC BY 4.0
(https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html). Phần đầu file OBJ còn ghi giấy phép cũ CC BY-SA 2.1 JP.
"""
import base64, json, math, os, re, struct, sys, zipfile

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = 190.0                     # mm mỗi đơn vị cảnh
TAM_Z, TAM_Y = 786.0, -100.0   # tâm cơ thể theo chiều cao và chiều trước–sau (mm)

def doi(p):                    # mm (x trái+, y sau+, z lên) → cảnh (x, y lên, z trước+)
    return (p[0] / TL, (p[2] - TAM_Z) / TL, -(p[1] - TAM_Y) / TL)

LOAI_TRU = r'artery|arteri|vein|venous|nerve|plexus|ganglion|duct|tributary|branch|ligament|tendon|valve|cusp|leaflet|cavity|papillary|lymph|mesentery|mesocolon|mesoappendix|taenia|fascia|retinaculum'
XUONG_TAY = (r'^(clavicle|scapula|humerus|radius|ulna|scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate)$'
             r'|metacarpal bone$|^(proximal |middle |distal )?phalanx of (thumb|index finger|middle finger|ring finger|little finger)$')
XUONG_CHAN = (r'^(femur|patella|tibia|fibula|calcaneus|talus|navicular bone of foot|cuboid bone|(medial|intermediate|lateral) cuneiform bone)$'
              r'|metatarsal bone$|phalanx of .*toe$|^sesamoid bone of foot$')
CO = (r'muscle|ceps|oblique|rectus|gluteus|deltoid|trapezius|pectoralis|latissimus|sartorius|soleus|gastrocnemius|diaphragm|flexor|extensor|'
      r'abductor|adductor|levator|rotator|longus|longissimus|iliocostalis|spinalis|interosse|lumbrical|brachialis|brachioradialis|anconeus|'
      r'coracobrachialis|teres|supraspinatus|infraspinatus|subscapularis|serratus|rhomboid|splenius|scalen|sternocleidomastoid|platysma|masseter|'
      r'temporalis|pterygoid|buccinator|orbicularis|zygomaticus|digastric|mylohyoid|geniohyoid|omohyoid|sternohyoid|sternothyroid|thyrohyoid|'
      r'psoas|iliacus|quadratus|transversus|pyramidalis|piriformis|gemellus|obturator|tensor|vastus|gracilis|pectineus|semitendinosus|'
      r'semimembranosus|popliteus|plantaris|tibialis|fibularis|opponens|palmaris|pronator|supinator|constrictor|intercostal|intertransversari|'
      r'interspinal|multifidus|semispinalis|capitis|\bcolli\b|sphincter|coccygeus|hyoglossus|genioglossus|styloglossus|stylohyoid|cricothyroid|'
      r'arytenoid|aryepiglott|uvul|palat|risorius|mentalis|nasalis|procerus|depressor|corrugator|occipitofrontalis|auricular|subclavius|'
      r'quadriceps|biceps|triceps|minimi|pollicis|hallucis|digitorum|indicis|levatores|rotatores|subcostal|cremaster|bulbospongiosus|ischiocavernosus')
CO_CHI_DUOI = r'gluteus|piriformis|gemellus|obturator|tensor fasciae|iliacus|psoas|vastus|rectus femoris|sartorius|gracilis|pectineus|adductor|biceps femoris|semitendinosus|semimembranosus|popliteus|plantaris|gastrocnemius|soleus|tibialis|fibularis|of foot|hallucis|digitorum longus|digitorum brevis|quadratus femoris|quadratus plantae|flexor accessorius'
# Nhóm theo OpenStax 11.3 (đầu, cổ), 11.4 (thân, sàn chậu), 11.5 (đai vai, chi trên), 11.6 (đai chậu, chi dưới)
CO_DAU_CO = (r'arytenoid|cricothyroid|constrictor|aryepiglott|longus colli|capitis|splenius|scalen|hyoid|sternothyroid|platysma|glossus|palat|uvul|'
             r'^(superior|inferior|medial|lateral) rectus$|^(superior|inferior) oblique$|levator palpebrae|masseter|temporalis|pterygoid|buccinator|orbicularis|sternocleidomastoid')
CO_SAN_CHAU = r'sphincter|levator ani|coccygeus|iliococcygeus|pubococcygeus|puborectalis'
CO_CHI_TREN = r'trapezius|pectoralis|serratus anterior|rhomboid|subclavius|levator scapulae|latissimus|deltoid|supraspinatus|infraspinatus|teres|subscapularis|biceps brachii|triceps|brachialis|brachioradialis|anconeus|coracobrachialis|pronator|supinator|carpi|digitorum superficialis|digitorum profundus|extensor digitorum$|pollicis|indicis|of hand|palmaris'

# id → (bộ lọc tên, cỡ ô giảm lưới mm). Tên đã bỏ "Right/Left" và viết thường.
CHON = {
    'da':                 (r'^skin$', 9.0),
    'nao':                (r'gyrus|occipital lobe|^cerebellum$|^pons$|^midbrain$|medulla oblongata|white matter of cerebral hemisphere|corpus callosum|^insula$|hippocampus|thalamus|amygdala|globus pallidus|putamen|caudate nucleus', 4.0),
    'khi-quan':           (r'^trachea$|^main bronchus( proper)?$', 2.0),
    'tim':                (r'^wall of (left |right )?(atrium|ventricle)$', 2.5),
    'gan':                (r'hepatovenous segment|^caudate lobe of liver$', 4.0),
    'da-day':             (r'^stomach$', 2.5),
    'lach':               (r'^spleen$', 2.5),
    'than':               (r'^kidney$', 2.5),
    'ruot-non':           (r'^duodenum$|part of jejunum|part of ileum', 2.5),
    'ruot-gia':           (r'^(ascending|transverse|descending|sigmoid) colon$|^cecum$|^rectum$|^appendix$', 3.0),
    'bang-quang':         (r'^urinary bladder$', 2.0),
    'tuyen-yen':          (r'^pituitary gland$', 1.0),
    'tuyen-thuong-than':  (r'^adrenal gland$', 1.5),
    'tuy':                (r'^pancreas$', 2.0),
    'thuc-quan':          (r'^esophagus$', 2.0),
    'tui-mat':            (r'^gallbladder$', 1.5),
    'tuyen-uc':           (r'^lobe of thymus$', 1.5),
    'dong-mach-chu':      (r'^(ascending aorta|arch of aorta|descending aorta|descending thoracic aorta|abdominal aorta)$', 1.6),
    'dong-mach-canh':     (r'^(common|internal|external) carotid artery$', 1.4),
    'dong-mach-duoi-don': (r'^(subclavian|axillary|brachial) artery$', 1.4),
    'dong-mach-than':     (r'^(trunk of )?renal artery$', 1.2),
    'tinh-mach-chu-duoi': (r'^inferior vena cava$', 1.8),
    'tinh-mach-chu-tren': (r'^superior vena cava$', 1.8),
    'tinh-mach-cua':      (r'^(hepatic portal vein|pre-hepatic portal vein)$', 1.6),
    'dong-mach-phoi':     (r'^pulmonary trunk$|^pulmonary artery$', 1.6),
    'tinh-mach-phoi':     (r'pulmonary vein$', 1.4),
    'xuong-so':           (r'^(frontal bone|parietal bone|temporal bone|occipital bone|sphenoid bone|ethmoid|maxilla|mandible|zygomatic bone|nasal bone|lacrimal bone|palatine bone|vomer|inferior nasal concha)$', 3.0),
    'cot-song':           (r'vertebra$|^atlas$|^axis$|^sacrum$|^coccyx$|^intervertebral disk', 3.6),
    'long-nguc':          (r'\brib$|costal cartilage|^manubrium$|^body of sternum$|^xiphoid process$', 4.0),
    'xuong-chau':         (r'^hip bone$', 3.0),
    'xuong-chi-tren':     (XUONG_TAY, 2.5),
    'xuong-chi-duoi':     (XUONG_CHAN, 3.0),
}
NHOM_CO = ['co-dau-co', 'co-than', 'co-chi-tren', 'co-chi-duoi']
CO_O = 6.0
CO_O_RIENG = {'co-than': 8.0}
VO = 'da'
# Màu riêng từng cơ quan để dễ phân biệt (mạch máu giữ đỏ/xanh theo oxy; xương, cơ theo màu hệ)
MAU = {'nao': '#c58bff', 'khi-quan': '#e6f7ff', 'phoi': '#5fd0ff', 'tim': '#ff5fd2', 'gan': '#ff7043',
       'da-day': '#ffd84d', 'lach': '#7f8cff', 'than': '#4dffb0', 'ruot-non': '#ffad5c',
       'ruot-gia': '#a6e35a', 'bang-quang': '#f2b8ff',
       'tuyen-yen': '#ffe066', 'tuyen-giap': '#ffc94d', 'tuyen-thuong-than': '#ff6e9e', 'tuy': '#ff9ecb',
       'thuc-quan': '#ffcf9e', 'tui-mat': '#2fd08a', 'tuyen-uc': '#b9a0ff', 'tuy-song': '#e0b8ff'}

# Mạch: hướng chảy so với tim ("ra" = rời tim, "ve" = về tim), máu giàu oxy hay không, chảy theo nhịp
MACH = {
    'dong-mach-chu':      ('ra', True, True),
    'dong-mach-canh':     ('ra', True, True),
    'dong-mach-duoi-don': ('ra', True, True),
    'dong-mach-than':     ('ra', True, True),
    'tinh-mach-chu-duoi': ('ve', False, False),
    'tinh-mach-chu-tren': ('ve', False, False),
    'tinh-mach-cua':      ('ve', False, False),   # máu từ ruột về gan rồi về tim
    'dong-mach-phoi':     ('ra', False, True),
    'tinh-mach-phoi':     ('ve', True, False),
}
# Nhóm không áp bộ loại trừ tên (mạch có chữ artery/vein; gan có "hepatovenous"; da)
KHONG_LOAI_TRU = set(MACH) | {'da', 'gan'}

def ten_chuan(t):
    return re.sub(r'\b(right|left)\s+', '', t.strip().lower())

def doc_obj(txt):
    v, f = [], []
    for l in txt.splitlines():
        if l.startswith('v '):
            a = l.split(); v.append((float(a[1]), float(a[2]), float(a[3])))
        elif l.startswith('f '):
            idx = [int(x.split('/')[0]) - 1 for x in l.split()[1:]]
            for k in range(1, len(idx) - 1): f.append((idx[0], idx[k], idx[k + 1]))
    return v, f

def gom_dinh(v, f, o):
    """Giảm lưới: gom các đỉnh cùng ô lưới cỡ o (mm) thành một đỉnh trung bình."""
    o_cua, tong, moi = {}, [], []
    for p in v:
        k = (math.floor(p[0] / o), math.floor(p[1] / o), math.floor(p[2] / o))
        i = o_cua.get(k)
        if i is None:
            i = len(tong); o_cua[k] = i; tong.append([0.0, 0.0, 0.0, 0])
        t = tong[i]; t[0] += p[0]; t[1] += p[1]; t[2] += p[2]; t[3] += 1
        moi.append(i)
    dinh = [(t[0] / t[3], t[1] / t[3], t[2] / t[3]) for t in tong]
    da, tg = set(), []
    for a, b, c in f:
        a, b, c = moi[a], moi[b], moi[c]
        if a == b or b == c or a == c: continue
        k = tuple(sorted((a, b, c)))
        if k in da: continue
        da.add(k); tg.append((a, b, c))
    return dinh, tg

def elip(tam, bk, n=28, m=18):
    v, f = [], []
    for i in range(m + 1):
        th = math.pi * i / m
        for j in range(n):
            ph = 2 * math.pi * j / n
            v.append((tam[0] + bk[0] * math.sin(th) * math.cos(ph), tam[1] + bk[1] * math.sin(th) * math.sin(ph), tam[2] + bk[2] * math.cos(th)))
    for i in range(m):
        for j in range(n):
            a, b = i * n + j, i * n + (j + 1) % n
            c, d = a + n, b + n
            f += [(a, c, b), (b, c, d)]
    return v, f

def truc_giua(v, buoc=6.0):
    """Trục giữa xấp xỉ của một đoạn mạch: chiếu đỉnh lên trục chính, cắt lát, lấy trọng tâm mỗi lát."""
    n = len(v); c = [sum(p[i] for p in v) / n for i in range(3)]
    q = [(p[0] - c[0], p[1] - c[1], p[2] - c[2]) for p in v]
    C = [[sum(a[i] * a[j] for a in q) / n for j in range(3)] for i in range(3)]
    u = [1.0, 1.0, 1.0]
    for _ in range(40):
        w = [sum(C[i][j] * u[j] for j in range(3)) for i in range(3)]
        d = math.sqrt(sum(x * x for x in w)) or 1; u = [x / d for x in w]
    t = [a[0] * u[0] + a[1] * u[1] + a[2] * u[2] for a in q]
    lo, hi = min(t), max(t); so = max(2, int((hi - lo) / buoc))
    lat = [[0.0, 0.0, 0.0, 0] for _ in range(so)]
    for p, s in zip(v, t):
        k = min(so - 1, int((s - lo) / (hi - lo + 1e-9) * so)); L = lat[k]
        L[0] += p[0]; L[1] += p[1]; L[2] += p[2]; L[3] += 1
    return [(L[0] / L[3], L[1] / L[3], L[2] / L[3]) for L in lat if L[3]], hi - lo

def khung(v):
    return [min(p[i] for p in v) for i in range(3)], [max(p[i] for p in v) for i in range(3)]

def ghi_glb(duong, luoi):
    """luoi: danh sách (tên, đỉnh cảnh, tam giác). Ghi glTF 2.0 nhị phân, chỉ có POSITION + chỉ số."""
    bin_, views, acc, meshes, nodes = bytearray(), [], [], [], []
    def them(b, target):
        while len(bin_) % 4: bin_.append(0)
        views.append({'buffer': 0, 'byteOffset': len(bin_), 'byteLength': len(b), 'target': target}); bin_.extend(b)
        return len(views) - 1
    for ten, v, f in luoi:
        vp = them(struct.pack(f'<{len(v) * 3}f', *[x for p in v for x in p]), 34962)
        lo, hi = khung(v)
        acc.append({'bufferView': vp, 'componentType': 5126, 'count': len(v), 'type': 'VEC3', 'min': lo, 'max': hi})
        ap = len(acc) - 1
        lon = len(v) > 65535
        ip = them(struct.pack(f'<{len(f) * 3}{"I" if lon else "H"}', *[i for t in f for i in t]), 34963)
        acc.append({'bufferView': ip, 'componentType': 5125 if lon else 5123, 'count': len(f) * 3, 'type': 'SCALAR'})
        meshes.append({'name': ten, 'primitives': [{'attributes': {'POSITION': ap}, 'indices': len(acc) - 1, 'mode': 4}]})
        nodes.append({'name': ten, 'mesh': len(meshes) - 1})
    while len(bin_) % 4: bin_.append(0)
    gltf = {'asset': {'version': '2.0', 'generator': 'tools/tao-mo-hinh.py',
                      'copyright': 'BodyParts3D, (c) The Database Center for Life Science, CC BY 4.0'},
            'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}], 'nodes': nodes, 'meshes': meshes,
            'accessors': acc, 'bufferViews': views, 'buffers': [{'byteLength': len(bin_)}]}
    j = json.dumps(gltf, separators=(',', ':')).encode()
    j += b' ' * ((4 - len(j) % 4) % 4)
    with open(duong, 'wb') as o:
        o.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(j) + 8 + len(bin_)))
        o.write(struct.pack('<II', len(j), 0x4E4F534A)); o.write(j)
        o.write(struct.pack('<II', len(bin_), 0x004E4942)); o.write(bin_)
    # Bản glTF dạng JSON nhúng dữ liệu (base64), đuôi .json: chạy được cả nơi không phục vụ .glb (Claude artifact)
    gltf['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(bytes(bin_)).decode()
    with open(duong[:-4] + '.gltf.json', 'w', encoding='ascii') as o:
        json.dump(gltf, o, separators=(',', ':'))

def main():
    z = zipfile.ZipFile(sys.argv[1])
    tep = []
    da_co = set()
    for n in sorted(z.namelist()):
        if not n.endswith('.obj'): continue
        txt = z.read(n).decode('utf-8', 'replace')
        m = re.search(r'# English name : (.*)', txt); ten = (m[1] if m else '').strip()
        if not ten: continue
        v, f = doc_obj(txt)
        if not f: continue
        lo, hi = khung(v)
        khoa = (ten, len(f), tuple(round(x) for x in lo))      # bỏ bản trùng hình
        if khoa in da_co: continue
        da_co.add(khoa)
        tep.append({'f': n.split('/')[-1][:-4], 'ten': ten, 'tc': ten_chuan(ten), 'v': v, 'tg': f, 'lo': lo, 'hi': hi})
    print(len(tep), 'file OBJ có tên')

    nhom = {k: [] for k in list(CHON) + NHOM_CO}
    for t in tep:
        tc = t['tc']
        id_ = next((k for k, (rx, _) in CHON.items() if re.search(rx, tc) and not (k not in KHONG_LOAI_TRU and re.search(LOAI_TRU, tc))), None)
        if id_ is None and re.search(CO, tc) and not re.search(LOAI_TRU + r'|bone|vertebra|cartilage|disk|membrane|trochlea|colliculus', tc):
            c = [(t['lo'][i] + t['hi'][i]) / 2 for i in range(3)]
            # thứ tự: theo tên trước (chính xác hơn), rồi mới theo vị trí
            if re.search(CO_DAU_CO, tc): id_ = 'co-dau-co'
            elif re.search(CO_SAN_CHAU, tc): id_ = 'co-than'
            elif re.search(CO_CHI_DUOI, tc): id_ = 'co-chi-duoi'
            elif re.search(CO_CHI_TREN, tc) or abs(c[0]) > 165: id_ = 'co-chi-tren'
            elif c[2] < 860: id_ = 'co-chi-duoi'
            elif c[2] > 1400: id_ = 'co-dau-co'
            else: id_ = 'co-than'
        if id_: nhom[id_].append(t)

    luoi, mo_ta = [], []
    for id_, ds in nhom.items():
        if not ds: print('THIẾU', id_); continue
        o = CO_O_RIENG.get(id_, CO_O) if id_ in NHOM_CO else CHON[id_][1]
        V, F = [], []
        for t in ds:
            b = len(V); V += t['v']; F += [(a + b, c + b, d + b) for a, c, d in t['tg']]
        v2, f2 = gom_dinh(V, F, o)
        luoi.append((id_, [doi(p) for p in v2], f2))
        mo_ta.append({'id': id_, 'so_file': len(ds), 'tam_giac': len(f2), 'file': sorted(t['f'] for t in ds)})
        print(f'{id_:20s} {len(ds):4d} file  {len(F):7d} → {len(f2):6d} tam giác')

    # Phổi: khối elip theo khung bao cây phế quản phải/trái (BodyParts3D 4.0 không có lưới nhu mô phổi)
    V, F = [], []
    pq = [t for t in tep if re.search(r'bronchial tree', t['tc'])]
    for ben in (-1, 1):
        ds = [t for t in pq if (t['lo'][0] + t['hi'][0]) / 2 * ben > 0]
        lo = [min(t['lo'][i] for t in ds) for i in range(3)]; hi = [max(t['hi'][i] for t in ds) for i in range(3)]
        tam = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2 + 12]
        bk = [(hi[0] - lo[0]) / 2 + 14, (hi[1] - lo[1]) / 2 + 16, (hi[2] - lo[2]) / 2 + 22]
        v, f = elip(tam, bk); b = len(V); V += v; F += [(a + b, c + b, d + b) for a, c, d in f]
        if ben < 0: tam_phoi_phai = tam   # phổi phải (x âm): chỗ đặt điểm cho mô phỏng phế cầu
    luoi.append(('phoi', [doi(p) for p in V], F))
    mo_ta.append({'id': 'phoi', 'so_file': 0, 'tam_giac': len(F), 'file': [], 'cach_dieu': True,
                  'ghi_chu': 'Khối elip dựng theo khung bao cây phế quản thật; BodyParts3D 4.0 không có lưới nhu mô phổi.'})

    # Tuyến giáp: BodyParts3D 4.0 không có lưới tuyến giáp. Dựng hình con bướm cách điệu: hai thùy elip hai bên khí quản,
    # ngay dưới sụn giáp, nối bằng eo giáp phía trước (OpenStax 17.4: trước khí quản, ngay dưới thanh quản). Kích thước ước lượng.
    sg = [t for t in tep if t['tc'] == 'thyroid cartilage']; kq = [t for t in tep if t['tc'] == 'trachea']
    if sg and kq:
        zs = min(t['lo'][2] for t in sg)
        kx = (min(t['lo'][0] for t in kq) + max(t['hi'][0] for t in kq)) / 2
        nua = (max(t['hi'][0] for t in kq) - min(t['lo'][0] for t in kq)) / 2
        ytr = min(t['lo'][1] for t in kq)                      # mặt trước khí quản (y nhỏ = phía trước)
        V, F = [], []
        for tam, bk in [((kx - nua - 4, ytr + 6, zs - 24), (8, 9, 21)), ((kx + nua + 4, ytr + 6, zs - 24), (8, 9, 21)),
                        ((kx, ytr - 3, zs - 34), (11, 4, 6))]:
            v, f = elip(tam, bk, 20, 12); b = len(V); V += v; F += [(a + b, c + b, d + b) for a, c, d in f]
        luoi.append(('tuyen-giap', [doi(p) for p in V], F))
        mo_ta.append({'id': 'tuyen-giap', 'so_file': 0, 'tam_giac': len(F), 'file': [], 'cach_dieu': True,
                      'ghi_chu': 'Hình con bướm dựng quanh khí quản, ngay dưới sụn giáp; BodyParts3D 4.0 không có lưới tuyến giáp, kích thước chỉ ước lượng.'})
    else:
        print('THIẾU sụn giáp hoặc khí quản: không dựng được tuyến giáp')

    # Tủy sống: BodyParts3D 4.0 chỉ có một đoạn ngắn ống trung tâm (~3,5 cm ở cổ), không có lưới tủy sống.
    # Dựng ống tròn cách điệu đi qua lỗ ống sống của từng đốt, từ đốt đội (C1) tới giữa đốt thắt lưng 2
    # (OpenStax 13.2: phần tủy cùng nằm ngang các đốt thắt lưng trên). Lỗ ống sống của mỗi đốt = khoảng trống
    # lớn nhất theo chiều trước–sau giữa các đỉnh nằm sát đường giữa, ở lát giữa thân đốt.
    THU_TU = ['atlas', 'axis'] + [f'{t} cervical vertebra' for t in ('third', 'fourth', 'fifth', 'sixth', 'seventh')] +              [f'{t} thoracic vertebra' for t in ('first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
                                                 'ninth', 'tenth', 'eleventh', 'twelfth')] + ['first lumbar vertebra', 'second lumbar vertebra']
    # Lưới chỉ có bề mặt nên ruột thân đốt cũng là một khoảng trống: chọn khoảng trống (rộng ≥ 5 mm) nằm gần
    # đường đi của đốt phía trên nhất, xuất phát từ ống trung tâm có thật ở cổ.
    ot = [t for t in tep if t['tc'] == 'central canal of spinal cord']
    y_truoc = (ot[0]['lo'][1] + ot[0]['hi'][1]) / 2 if ot else None
    tam_dot = []
    for ten in THU_TU:
        ds = [t for t in tep if t['tc'] == ten]
        if not ds: print('THIẾU đốt', ten); continue
        t = ds[0]; zg = (t['lo'][2] + t['hi'][2]) / 2; cao = t['hi'][2] - t['lo'][2]
        cx = (t['lo'][0] + t['hi'][0]) / 2
        ys = sorted(p[1] for p in t['v'] if abs(p[0] - cx) < 6 and abs(p[2] - zg) < cao * 0.3)
        kv = [((ys[i] + ys[i + 1]) / 2, ys[i + 1] - ys[i]) for i in range(len(ys) - 1) if ys[i + 1] - ys[i] >= 5]
        if not kv: print('Không tìm được lỗ ống sống ở', ten); continue
        yc, w = min(kv, key=lambda c: abs(c[0] - y_truoc)) if y_truoc is not None else max(kv, key=lambda c: c[1])
        y_truoc = yc
        tam_dot.append((ten, [cx, yc, zg], w))
    if len(tam_dot) >= 10:
        P = [c for _, c, _ in tam_dot]
        ten_cuoi, c2, _ = tam_dot[-1]
        if ten_cuoi == 'second lumbar vertebra': P[-1] = c2           # kết thúc ở giữa đốt thắt lưng 2
        # làm trơn theo chiều trước–sau (trung bình 3 điểm) để bớt gấp khúc do sai số dò lỗ ống sống
        P = [P[0]] + [[P[i][0], (P[i - 1][1] + P[i][1] + P[i + 1][1]) / 3, P[i][2]] for i in range(1, len(P) - 1)] + [P[-1]]
        P.insert(0, [P[0][0], P[0][1], P[0][2] + 14])                 # nối lên hành não
        # bán kính ước lượng: 5 mm, phình 6,5 mm ở đoạn cổ (C4–T1) và thắt lưng (T10–L1)
        phinh = {'fourth cervical vertebra', 'fifth cervical vertebra', 'sixth cervical vertebra', 'seventh cervical vertebra',
                 'first thoracic vertebra', 'tenth thoracic vertebra', 'eleventh thoracic vertebra', 'twelfth thoracic vertebra', 'first lumbar vertebra'}
        R = [5.0] + [6.5 if ten in phinh else 5.0 for ten, _, _ in tam_dot]
        R[-1] = 2.5                                                    # đầu dưới thon lại
        n = 14; V, F = [], []
        for i, (p, r) in enumerate(zip(P, R)):
            for j in range(n):
                g = 2 * math.pi * j / n
                V.append((p[0] + r * math.cos(g), p[1] + r * math.sin(g), p[2]))
        for i in range(len(P) - 1):
            for j in range(n):
                a0, b0 = i * n + j, i * n + (j + 1) % n
                F += [(a0, b0, a0 + n), (b0, b0 + n, a0 + n)]
        luoi.append(('tuy-song', [doi(p) for p in V], F))
        mo_ta.append({'id': 'tuy-song', 'so_file': 0, 'tam_giac': len(F), 'file': [], 'cach_dieu': True,
                      'ghi_chu': 'Ống tròn dựng qua lỗ ống sống của từng đốt (C1 tới giữa L2); BodyParts3D 4.0 không có lưới tủy sống, độ dày chỉ ước lượng.'})
        print('tuy-song', len(tam_dot), 'đốt; bề rộng lỗ ống sống (mm):', ', '.join(f'{w:.0f}' for _, _, w in tam_dot))
    else:
        print('THIẾU đốt sống: không dựng được tủy sống')

    # Đường máu chảy: trục giữa từng đoạn mạch, xếp chiều theo hướng chảy so với tim
    tim = nhom['tim']; ttim = [sum((t['lo'][i] + t['hi'][i]) / 2 for t in tim) / len(tim) for i in range(3)]
    mach = []
    for id_, (huong, oxy, nhip) in MACH.items():
        duong = []
        for t in nhom[id_]:
            pts, dai = truc_giua(t['v'])
            if dai < 18 or len(pts) < 2: continue
            d0 = math.dist(pts[0], ttim); d1 = math.dist(pts[-1], ttim)
            if (huong == 'ra') != (d0 < d1): pts = pts[::-1]
            duong.append([[round(x, 4) for x in doi(p)] for p in pts])
        mach.append({'id': id_, 'oxy': oxy, 'nhip': nhip, 'duong': duong})

    def tam_cua(rx, dich=(0, 0, 0)):
        ds = [t for t in tep if re.search(rx, t['ten'], re.I)]
        c = [sum((t['lo'][i] + t['hi'][i]) / 2 for t in ds) / len(ds) + dich[i] for i in range(3)]
        return [round(x, 4) for x in doi(c)]
    diem = {'vet-thuong-tay': tam_cua(r'^Left radius$', (0, -35, 0)), 'khi-quan': tam_cua(r'^Trachea$', (0, -40, 30))}
    diem['phoi'] = [round(x, 4) for x in doi((tam_phoi_phai[0], tam_phoi_phai[1] - 40, tam_phoi_phai[2]))]

    for o in mo_ta:
        if o['id'] in MAU: o['mau'] = MAU[o['id']]
    os.makedirs(os.path.join(GOC, 'models'), exist_ok=True)
    ghi_glb(os.path.join(GOC, 'models', 'co-the.glb'), luoi)
    tong = sum(len(f) for _, _, f in luoi)
    with open(os.path.join(GOC, 'models', 'co-the.json'), 'w', encoding='utf-8') as o:
        json.dump({'phien_ban_cau_truc': 1, 'tep': 'models/co-the.gltf.json', 'glb': 'models/co-the.glb', 'vo': VO, 'don_vi': f'1 đơn vị = {TL:g} mm',
                   'doi_tuong': mo_ta, 'mach': mach, 'diem': diem, 'tong_tam_giac': tong,
                   'ghi_cong': {'ten': 'BodyParts3D, © The Database Center for Life Science, CC BY 4.0',
                                'url': 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html',
                                'du_lieu_goc': 'isa_BP3D_4.0_obj_99.zip',
                                'thay_doi': 'Chọn lọc và gộp theo bộ phận, giảm lưới, đổi đơn vị; phổi là khối elip tự dựng.'}},
                  o, ensure_ascii=False, indent=1)
    kb = os.path.getsize(os.path.join(GOC, 'models', 'co-the.glb')) / 1024
    print(f'Tổng {tong} tam giác, co-the.glb {kb:.0f} KB')

if __name__ == '__main__':
    main()
