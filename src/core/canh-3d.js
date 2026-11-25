// Cảnh 3D: nạp mô hình .glb (BodyParts3D, tạo bằng tools/tao-mo-hinh.py), camera xoay, chọn đối tượng, máu chảy.
// Mô tả mô hình (models/co-the.json): đối tượng (tên = id bộ phận), lớp vỏ, đường máu chảy, điểm đánh dấu, ghi công.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MAU_VO = '#5fd6ff';
const DO_CAO = 11.2;         // chiều cao khung cần thấy (đơn vị 3D), chừa chỗ cho hàng nút ở đáy
const TAM_Y = -0.75;
const DAY = -4.62;           // mặt sàn dưới bàn chân (đơn vị 3D)

// ---------- vật liệu hologram (viền sáng theo góc nhìn) ----------
function vatLieuHolo(mau, nen = 0.12, vien = 0.8) {
  return new THREE.ShaderMaterial({
    uniforms: { uMau: { value: new THREE.Color(mau) }, uNen: { value: nen }, uVien: { value: vien }, uMo: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uMau; uniform float uNen; uniform float uVien; uniform float uMo; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        gl_FragColor = vec4(uMau, clamp((uNen + f * uVien) * uMo, 0.0, 1.0)); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
}

function hoaVanTron() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function hoaVanVong() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); g.strokeStyle = '#ff4d6a'; g.lineWidth = 8;
  g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
  return new THREE.CanvasTexture(c);
}

// Nạp mô hình. mh.tep là glTF dạng JSON nhúng dữ liệu base64 (đuôi .json, chạy được cả trong Claude artifact,
// nơi không phục vụ .glb và chặn tải "data:"). Tự giải mã base64 rồi ghép thành GLB trong bộ nhớ cho GLTFLoader.
async function napMoHinh(mh) {
  const loader = new GLTFLoader();
  if (!mh.tep) return loader.loadAsync(mh.glb);
  const r = await fetch(mh.tep);
  if (!r.ok) throw new Error(`Không đọc được ${mh.tep} (mã ${r.status})`);
  const gltf = await r.json();
  const uri = gltf.buffers[0].uri, i = uri.indexOf('base64,');
  const s = atob(uri.slice(i + 7)), bin = new Uint8Array(s.length);
  for (let k = 0; k < s.length; k++) bin[k] = s.charCodeAt(k);
  delete gltf.buffers[0].uri;
  let json = new TextEncoder().encode(JSON.stringify(gltf));
  const dem = (4 - json.length % 4) % 4;
  if (dem) { const j2 = new Uint8Array(json.length + dem).fill(0x20); j2.set(json); json = j2; }
  const binDem = (4 - bin.length % 4) % 4, binLen = bin.length + binDem;
  const glb = new ArrayBuffer(12 + 8 + json.length + 8 + binLen), dv = new DataView(glb);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, glb.byteLength, true);
  dv.setUint32(12, json.length, true); dv.setUint32(16, 0x4E4F534A, true);
  new Uint8Array(glb, 20, json.length).set(json);
  dv.setUint32(20 + json.length, binLen, true); dv.setUint32(24 + json.length, 0x004E4942, true);
  new Uint8Array(glb, 28 + json.length, bin.length).set(bin);
  return loader.parseAsync(glb, '');
}

// Độ sáng nền/viền theo loại đối tượng, để lớp lớn (da, cơ, xương) không lấn cơ quan
const DO_SANG = { vo: [0.02, 0.45], 'co': [0.035, 0.32], 'xuong': [0.05, 0.42], mach: [0.3, 0.6], khac: [0.13, 0.8] };

// ---------- cảnh ----------
export async function taoCanh({ khung, db, khiChon, khiDiQua, giuKhung = false }) {
  const mh = db.moHinh;
  const gltf = await napMoHinh(mh);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: giuKhung });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  khung.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.target.set(0, TAM_Y, 0);
  controls.autoRotateSpeed = 1.2;

  const goc = new THREE.Group(); scene.add(goc);

  // Vòng đế dưới chân
  const de = new THREE.Group(); de.position.y = DAY;
  for (const [r, a] of [[1.55, 0.55], [1.2, 0.28]]) {
    const pts = new THREE.EllipseCurve(0, 0, r, r).getPoints(96).map(p => new THREE.Vector3(p.x, 0, p.y));
    de.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: MAU_VO, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false })));
  }
  const vach = [];
  for (let k = 0; k < 24; k++) { const g = k / 24 * Math.PI * 2; vach.push(new THREE.Vector3(Math.cos(g) * 1.55, 0, Math.sin(g) * 1.55), new THREE.Vector3(Math.cos(g) * 1.68, 0, Math.sin(g) * 1.68)); }
  de.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(vach),
    new THREE.LineBasicMaterial({ color: MAU_VO, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })));
  scene.add(de);

  // Đối tượng: tên đối tượng 3D = id bộ phận (trường mo_hinh)
  const doiTuong = {};          // id -> { nhom, vl, nen, vien, he }
  const chonDuoc = [];          // mesh để bắn tia
  const laMach = new Set(mh.mach.map(m => m.id));
  let vo = null, vatLieuVo = null;
  const cacLuoi = [];
  gltf.scene.traverse(o => { if (o.isMesh) cacLuoi.push(o); });
  for (const m of cacLuoi) {
    const id = m.name || m.parent?.name;
    const bp = db.boPhanTheoMoHinh[id];
    const he = bp?.he;
    const loai = id === mh.vo ? 'vo' : laMach.has(id) ? 'mach' : he === 'xuong' ? 'xuong' : he === 'co' ? 'co' : 'khac';
    const [nen, vien] = DO_SANG[loai];
    const mau = loai === 'vo' ? MAU_VO : loai === 'mach' ? (mh.mach.find(x => x.id === id).oxy ? '#ff4d6a' : '#4d8dff') : (mh.doi_tuong.find(x => x.id === id)?.mau || db.he[he]?.mau || MAU_VO);
    const vl = vatLieuHolo(mau, nen, vien);
    m.geometry.computeVertexNormals();
    m.material = vl;
    m.userData.id = id;
    // nhóm riêng để tim đập quanh tâm của chính nó
    const nhom = new THREE.Group(); nhom.name = id;
    const tam = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
    m.geometry.translate(-tam.x, -tam.y, -tam.z);
    m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1);
    nhom.position.copy(tam); nhom.add(m); goc.add(nhom);
    if (loai === 'vo') { vo = nhom; vatLieuVo = vl; m.renderOrder = -1; }
    chonDuoc.push(m);
    doiTuong[id] = { nhom, vl, nen, vien, he, dap: id === 'tim' };
  }

  // Đường máu chảy (trục giữa mạch thật) + vùng bấm vô hình dọc theo mạch
  const vlAn = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  const hat = [], mauHat = [];
  for (const m of mh.mach) {
    const nhom = doiTuong[m.id]?.nhom; if (!nhom) continue;
    for (const pts of m.duong) {
      const cong = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
      const vung = new THREE.Mesh(new THREE.TubeGeometry(cong, Math.max(8, pts.length * 2), 0.035, 6, false), vlAn);
      vung.position.sub(nhom.position);              // đường tính trong hệ toạ độ cảnh
      vung.userData.id = m.id; nhom.add(vung); chonDuoc.push(vung);
      const dai = cong.getLength() * 100;            // tốc độ hạt tính theo "px" như bản 0.1–0.3
      const lut = cong.getSpacedPoints(255);
      const n = Math.max(3, Math.round(dai / 8));
      for (let i = 0; i < n; i++) { hat.push({ lut, dai, off: i / n, nhip: m.nhip, id: m.id }); mauHat.push(new THREE.Color(m.oxy ? '#ff6b82' : '#6f9dff')); }
    }
  }
  const hg = new THREE.BufferGeometry();
  const viTri = new Float32Array(hat.length * 3), mauMang = new Float32Array(hat.length * 3);
  mauHat.forEach((c, i) => c.toArray(mauMang, i * 3));
  hg.setAttribute('position', new THREE.BufferAttribute(viTri, 3));
  hg.setAttribute('color', new THREE.BufferAttribute(mauMang, 3));
  const diemMau = new THREE.Points(hg, new THREE.PointsMaterial({ size: 0.06, map: hoaVanTron(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  diemMau.frustumCulled = false;
  goc.add(diemMau);

  // Dấu vị trí mô phỏng
  const dau = new THREE.Sprite(new THREE.SpriteMaterial({ map: hoaVanVong(), transparent: true, depthTest: false, blending: THREE.AdditiveBlending }));
  dau.visible = false; dau.renderOrder = 10; goc.add(dau);

  // ---------- trạng thái chọn / đi qua ----------
  let dangChon = null, dangQua = null;
  function toMau() {
    for (const [id, o] of Object.entries(doiTuong)) {
      const c = id === dangChon, q = id === dangQua;
      o.vl.uniforms.uNen.value = c ? o.nen * 2.6 + 0.1 : q ? o.nen * 1.7 + 0.04 : o.nen;
      o.vl.uniforms.uVien.value = c ? o.vien * 1.6 : o.vien;
    }
  }

  // ---------- bắn tia chọn đối tượng ----------
  const ray = new THREE.Raycaster(), chuot = new THREE.Vector2();
  const hien = o => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
  function trungVao(e) {
    const r = renderer.domElement.getBoundingClientRect();
    chuot.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(chuot, camera);
    const ds = ray.intersectObjects(chonDuoc, false).filter(h => hien(h.object));
    if (!ds.length) return null;
    // Lớp da bao ngoài chỉ được chọn khi không trúng gì khác bên trong
    const trong = ds.filter(h => h.object.userData.id !== mh.vo);
    if (!trong.length) return mh.vo;
    // Ưu tiên cơ quan đặc hơn mạch khi chồng lên nhau ở gần cùng độ sâu
    const gan = trong[0].distance;
    const coQuan = trong.find(h => h.distance - gan < 0.12 && !laMach.has(h.object.userData.id));
    return (coQuan || trong[0]).object.userData.id;
  }
  let batDau = null;
  renderer.domElement.addEventListener('pointerdown', e => { batDau = [e.clientX, e.clientY]; dungChuyenCanh(); });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!batDau || Math.hypot(e.clientX - batDau[0], e.clientY - batDau[1]) > 6) return;
    const id = trungVao(e); if (id) khiChon(id);
  });
  renderer.domElement.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const id = trungVao(e);
    if (id !== dangQua) { dangQua = id; toMau(); }
    renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
    khiDiQua(id, e);
  });
  renderer.domElement.addEventListener('pointerleave', () => { dangQua = null; toMau(); khiDiQua(null); });

  // ---------- camera ----------
  let khoangChuan = 18;
  function vuaKhung() {
    const w = khung.clientWidth || 1, h = khung.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const cu = khoangChuan;
    khoangChuan = Math.max((DO_CAO / 2) / t, (3.8 / 2) / (t * camera.aspect));
    // giữ nguyên mức thu phóng tương đối khi khung đổi kích thước
    camera.position.sub(controls.target).multiplyScalar(khoangChuan / cu).add(controls.target);
    controls.minDistance = khoangChuan * 0.15; controls.maxDistance = khoangChuan * 2.2;
  }
  new ResizeObserver(vuaKhung).observe(khung);
  vuaKhung();
  camera.position.set(0, TAM_Y, khoangChuan);

  const HUONG = { truoc: [0, 0, 1], sau: [0, 0, -1], trai: [1, 0, 0], phai: [-1, 0, 0], tren: [0, 1, 0.0001] };
  let chuyen = null;
  function dungChuyenCanh() { chuyen = null; }
  function nhin(huong) {
    const d = new THREE.Vector3(...(HUONG[huong] || HUONG.truoc)).normalize();
    const dich = new THREE.Vector3(0, TAM_Y, 0);
    chuyen = { tu: camera.position.clone(), tuT: controls.target.clone(), den: dich.clone().addScaledVector(d, khoangChuan), denT: dich, t: 0 };
  }
  function datLai() { controls.autoRotate = false; nhin('truoc'); }

  function anHienHe(he, hien) {
    for (const o of Object.values(doiTuong)) if (o.he === he) o.nhom.visible = hien;
    if (he === 'tuan-hoan') diemMau.visible = hien;
  }

  // ---------- vòng lặp ----------
  let pha = 0, dA = 0, dV = 0, nhip = 72, tDau = 0;
  const tim = Object.values(doiTuong).find(o => o.dap);
  // Thở: phổi phồng khi hít vào (cơ hoành hạ xuống nên đáy phổi đi xuống, đỉnh phổi giữ nguyên), xẹp khi thở ra.
  const phoi = doiTuong.phoi;
  const phoiY = phoi?.nhom.position.y ?? 0;
  const phoiCao = phoi ? new THREE.Box3().setFromObject(phoi.nhom).getSize(new THREE.Vector3()).y : 0;
  let phaTho = 0, nhipTho = 15, theTich = 0;
  function capNhat(dt) {
    pha += dt * nhip / 60;
    const dap = Math.pow(Math.max(0, Math.sin(pha * Math.PI * 2)), 3);
    if (tim) tim.nhom.scale.setScalar(1 + dap * 0.06);
    phaTho += dt * nhipTho / 60;
    theTich = 0.5 - 0.5 * Math.cos(phaTho * Math.PI * 2);      // 0 = cuối thở ra, 1 = cuối hít vào
    if (phoi) {
      phoi.nhom.scale.set(1 + theTich * 0.05, 1 + theTich * 0.08, 1 + theTich * 0.05);
      phoi.nhom.position.y = phoiY - phoiCao / 2 * theTich * 0.08;
    }
    const f = nhip / 72;
    dA += dt * f * (25 + 95 * dap); dV += dt * f * 32;
    for (let i = 0; i < hat.length; i++) {
      const q = hat[i], s = ((((q.off * q.dai + (q.nhip ? dA : dV)) % q.dai) + q.dai) % q.dai) / q.dai * 255;
      const a = Math.floor(s), b = Math.min(255, a + 1), k = s - a;
      viTri[i * 3] = q.lut[a].x + (q.lut[b].x - q.lut[a].x) * k;
      viTri[i * 3 + 1] = q.lut[a].y + (q.lut[b].y - q.lut[a].y) * k;
      viTri[i * 3 + 2] = q.lut[a].z + (q.lut[b].z - q.lut[a].z) * k;
    }
    hg.attributes.position.needsUpdate = true;
    de.rotation.y += dt * 0.15;
    if (dau.visible) { tDau += dt; const s = 0.34 + 0.2 * (0.5 + 0.5 * Math.sin(tDau * 4.5)); dau.scale.set(s, s, 1); dau.material.opacity = 0.55 + 0.45 * Math.sin(tDau * 4.5 + 1); }
    if (chuyen) {
      chuyen.t = Math.min(1, chuyen.t + dt / 0.7);
      const e = 1 - Math.pow(1 - chuyen.t, 3);
      camera.position.lerpVectors(chuyen.tu, chuyen.den, e);
      controls.target.lerpVectors(chuyen.tuT, chuyen.denT, e);
      if (chuyen.t >= 1) chuyen = null;
    }
    controls.update();
    renderer.render(scene, camera);
    return dap;
  }

  return {
    capNhat,
    chon(id) { dangChon = id; toMau(); },
    datNhip(n) { nhip = n; },
    datNhipTho(n) { nhipTho = n; },
    // trạng thái thở cho ô Nhịp thở: thể tích 0–1 và đang hít vào hay thở ra
    tho: () => ({ theTich, hitVao: (phaTho % 1) < 0.5 }),
    nhin, datLai,
    tuXoay(b) { controls.autoRotate = b; },
    datDoVo(v) { if (vatLieuVo) { vatLieuVo.uniforms.uMo.value = v; vo.children[0].visible = v > 0.001; } },
    dangTuXoay: () => controls.autoRotate,
    anHienHe,
    danhDau(diem) {
      const p = diem && mh.diem[diem];
      dau.visible = !!p; if (p) dau.position.set(p[0], p[1], p[2]);
    },
    trangThai() {
      const az = THREE.MathUtils.radToDeg(controls.getAzimuthalAngle());
      const kc = camera.position.distanceTo(controls.target);
      return { goc: Math.round((az + 360) % 360), thuPhong: Math.round(khoangChuan / kc * 100) };
    },
    soHat: hat.length,
    doiTuong: () => Object.keys(doiTuong)
  };
}
