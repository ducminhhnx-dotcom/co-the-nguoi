# Mô hình cơ thể người tương tác — Bản thiết kế tổng

> **Claude Code: đọc hết file này trước khi làm bất cứ việc gì trong dự án.**
> Việc nào trái với file này thì phải hỏi Minh trước khi làm.
> Chủ dự án: Minh. Bản thiết kế: 0.6 (25/11/2026) — mục 2b.3b: chế độ tự kiểm tra.

---

## 1. Mục đích

1. Học giải phẫu, sinh lý và bệnh học một cách trực quan: nhìn, xoay, bấm, xem cơ thể vận hành.
2. Học cách dựng một sản phẩm hoàn chỉnh bằng AI (Claude Code), tức là luyện năng lực AI.
3. **Không phải** công cụ chẩn đoán, kê đơn hay thay bác sĩ.

---

## 2. Yêu cầu sản phẩm

1. **Xoay mô hình 3D 360°.** Kéo để xoay, cuộn để phóng to hoặc thu nhỏ, kéo hai ngón (hoặc chuột phải) để di chuyển. Có các nút góc nhìn nhanh (trước, sau, trái, phải, trên) và nút "Đặt lại".
2. **Bấm vào bộ phận hoặc mạch máu** thì mở bảng thông tin gồm đúng 4 mục, giữ nguyên thứ tự:
   - (1) **Thông tin cơ bản:** tên, hệ cơ quan, vị trí, kích thước và số liệu.
   - (2) **Chức năng.**
   - (3) **Tương tác:**
     - với các bộ phận khác, mỗi bộ phận là một liên kết bấm sang được;
     - với toàn cơ thể (ví dụ thận ↔ huyết áp, gan ↔ đông máu).
   - (4) **Bệnh hay gặp:** danh sách bệnh, bấm vào để mở trang chi tiết của bệnh.
   - Cuối bảng luôn ghi nguồn.
3. **Mô phỏng sống:**
   - Máu chảy theo nhịp tim, đủ cả vòng tuần hoàn lớn và nhỏ. Màu đỏ là máu giàu oxy, màu xanh là máu nghèo oxy.
   - Khung kính hiển vi mô phỏng mầm bệnh (vi khuẩn, virus…) xâm nhập và cách cơ thể phản ứng. Mỗi mô phỏng chia theo giai đoạn và ghi kèm thời gian thực tế.
4. **Ẩn hoặc hiện từng hệ** (xương, cơ, tuần hoàn, hô hấp, tiêu hóa, thần kinh…) và chỉnh độ trong suốt của lớp ngoài.
5. **Tìm kiếm** bộ phận và bệnh theo tên, gõ có dấu hay không dấu đều tìm được.
6. **Ngôn ngữ:** toàn bộ bằng tiếng Việt. Tên Latin hoặc tiếng Anh chỉ ghi phụ trong ngoặc để tiện tra cứu.
7. **Chạy trên máy tính và điện thoại:** mở bằng trình duyệt, không cần cài đặt.
8. **Mở rộng theo phiên bản:** thêm bộ phận, bệnh hoặc mô phỏng chỉ bằng cách thêm file, không phải sửa phần lõi (xem mục 4).

---

## 2b. Phong cách giao diện (đã chốt 24/11/2026)

Bản mẫu: phương án D trên canvas "3 phong cách cho mô hình cơ thể người" (https://claude.ai/artifact/Q2HYfdQQ7PVZ7epA3YQ1S2#artboard-Chot).

1. **Khung chung — kiểu hologram tối:**
   - Nền `#060b16` có lưới mờ 40 px.
   - Cơ thể trong suốt, viền xanh lơ `#5fd6ff` phát sáng nhẹ. Cơ quan tô bán trong suốt.
   - Mỗi cơ quan một màu riêng để dễ phân biệt (Minh duyệt 24/11/2026). Màu ghi ở trường `mau` của từng đối tượng trong `models/co-the.json` (bảng `MAU` trong `tools/tao-mo-hinh.py`). Mạch máu luôn đỏ/xanh theo oxy; xương, cơ và cơ quan chưa có màu riêng dùng màu hệ.
   - Màu theo hệ (dùng cho nút bật/tắt hệ, tên hệ trong bảng thông tin):
     - Tuần hoàn: động mạch `#ff4d6a`, tĩnh mạch `#4d8dff`
     - Hô hấp `#7fe8ff`
     - Tiêu hóa `#ffb36b`
     - Tiết niệu, thần kinh, miễn dịch `#c58bff`
     - Nội tiết `#ffe066` (thêm ở bản 0.11)
   - Vòng đế dưới chân gợi ý mô hình xoay được; nút góc nhìn đặt ở đáy.
   - Cột trái là các nút bật/tắt hệ (viền theo màu hệ), ô nhịp tim có đường điện tim, và ô nhịp thở có đường sóng thể tích phổi (phổi trên hình 3D phồng xẹp theo nhịp).
2. **Bảng thông tin — bố cục kiểu atlas y khoa,** đổi sang màu tối:
   - Thứ tự từ trên xuống: tên hệ → tên bộ phận (kèm tên Latin) → 4 tab (Cơ bản · Chức năng · Tương tác · Bệnh).
   - Tab Cơ bản: các ô số liệu xếp lưới 2 cột, một đoạn mô tả, các nút "Liên quan" dạng viên thuốc bấm sang bộ phận hoặc bệnh khác.
   - Dòng nguồn và trạng thái kiểm chứng luôn ở cuối bảng.
3. **Khung "Kính hiển vi"** nằm dưới bảng thông tin (đổi từ "Cơ thể chống nhiễm trùng", Minh duyệt 25/11/2026):
   - Các hàng nút theo trường `nhom` của mô-đun: "Cơ thể vận hành" (`van-hanh`, ví dụ Trao đổi khí), "Bệnh diễn tiến" (`benh`, thêm ở bản 0.18, ví dụ Xơ vữa, cục máu đông) và "Chống nhiễm trùng" (`nhiem-trung`, mặc định: Vi khuẩn / Virus cúm / Phế cầu, sau này thêm loại khác).
   - Hình kính hiển vi chạy mô phỏng.
   - Danh sách các bước: bước đang diễn ra in đậm, kèm một dòng "Thực tế: …" về thời gian thật.
3b. **Chế độ tự kiểm tra** (Minh duyệt 25/11/2026):
   - Nút "Tự kiểm tra" ở đầu trang; câu hỏi thay chỗ bảng thông tin ở cột phải, hình 3D vẫn bấm được để trả lời.
   - 4 dạng câu, tạo tự động từ dữ liệu đã có nguồn: bấm đúng cơ quan trên hình 3D, đoán cơ quan từ chức năng, bệnh ảnh hưởng cơ quan nào, cơ quan thuộc hệ nào. Không viết câu hỏi tay có nội dung y học mới.
   - Mỗi lượt 10 câu; kết quả không lưu lại.
4. **Chữ:** font Be Vietnam Pro. Tiêu đề 32 px, nội dung 14–15 px, nhãn 12–13 px.
5. Không dùng emoji. Biểu tượng vẽ bằng nét SVG.

---

## 3. Quy định về độ chính xác (bắt buộc)

1. Mọi thông tin y học đều phải có nguồn ghi trong trường `nguon`. Không có nguồn thì không đưa vào.
2. Danh sách nguồn được dùng:
   - Giáo trình *OpenStax Anatomy and Physiology 2e*
   - StatPearls (NCBI Bookshelf)
   - MSD Manual
   - WHO, CDC
   - Bộ Y tế Việt Nam

   Không dùng blog, diễn đàn hay nội dung quảng cáo.
3. Số liệu ghi dạng khoảng và nêu rõ điều kiện, ví dụ "người trưởng thành, lúc nghỉ: 60–100 lần/phút".
4. Thông tin chưa kiểm được với nguồn thì ghi `"da_kiem": false`. Giao diện sẽ hiện nhãn "chưa kiểm chứng".
5. Phần bệnh chỉ gồm: nguyên nhân, triệu chứng, khi nào cần đi khám, cách phòng ngừa. **Không ghi liều thuốc, không ghi phác đồ điều trị.**
6. Mô phỏng chỉ để minh họa. Chỗ nào đã đơn giản hóa so với thực tế phải ghi ra.
7. Trang luôn có dòng: "Mô hình phục vụ học tập, không thay thế chẩn đoán hay tư vấn của bác sĩ."
8. Khi dùng dữ liệu của người khác phải ghi công đúng giấy phép. OpenStax dùng giấy phép CC BY 4.0. BodyParts3D dùng giấy phép CC BY 4.0 theo trang giấy phép cập nhật 27/02/2025 (https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html); phần đầu các file OBJ tải về vẫn ghi giấy phép cũ CC BY-SA 2.1 Japan. Z-Anatomy dùng giấy phép CC BY-SA 4.0. Cần kiểm lại điều khoản trước khi dùng.

---

## 4. Kiến trúc

**Nguyên tắc cốt lõi: tách dữ liệu khỏi mã.** Nội dung nằm trong file JSON, mô phỏng là các mô-đun độc lập. Phần lõi chỉ nạp và hiển thị.

- **Công nghệ:**
  - Web tĩnh (HTML + JavaScript), không cần máy chủ.
  - Thư viện 3D Three.js, cố định một phiên bản, có thêm OrbitControls để xoay mô hình.
- **Mô hình 3D:**
  - Bản 0.2–0.3: khối cách điệu dựng bằng code.
  - Từ bản 0.4: thay bằng file `.glb` lấy từ BodyParts3D hoặc Z-Anatomy.
  - Mỗi bộ phận là một đối tượng 3D riêng, tên đối tượng trùng với `id` của bộ phận.
- **Xuất bản:** trang tĩnh, đưa lên Claude artifact hoặc GitHub Pages. Tổng dung lượng mô hình không quá 50 MB.

```
/CLAUDE.md            bản thiết kế này
/ROADMAP.md           các phiên bản và việc còn lại
/CHANGELOG.md         nhật ký: phiên bản, ngày, đã làm, còn dở
/index.html
/src/core/            cảnh 3D, camera, chọn đối tượng, bảng thông tin, tìm kiếm, vòng lặp
/src/sims/            mỗi mô phỏng một file .js
/data/index.json      danh sách file cần nạp
/data/he.json         danh sách hệ cơ quan (id, tên, màu)
/data/bo-phan/        mỗi bộ phận một file .json
/data/benh/           mỗi bệnh một file .json
/models/              file 3D .glb
/tools/kiem-du-lieu.js  kiểm cấu trúc dữ liệu và các liên kết chéo
/tests/               kiểm thử tự động bằng trình duyệt chạy ngầm
```

---

## 5. Cấu trúc dữ liệu (phiên bản cấu trúc: 1)

**Bộ phận** — `data/bo-phan/tim.json`
```json
{
  "id": "tim",
  "ten": "Tim",
  "ten_khac": "Cor / Heart",
  "he": "tuan-hoan",
  "mo_hinh": "tim",
  "them_tu_ban": "0.1",
  "co_ban": { "vi_tri": "…", "so_lieu": ["Nặng khoảng 250–350 g"] },
  "chuc_nang": ["…"],
  "tuong_tac": {
    "bo_phan": [{ "id": "phoi", "mo_ta": "Tim phải bơm máu lên phổi nhận oxy" }],
    "toan_than": ["…"]
  },
  "benh": ["tang-huyet-ap", "nhoi-mau-co-tim"],
  "nguon": [{ "ten": "OpenStax A&P 2e, chương 19", "url": "…" }],
  "da_kiem": true
}
```

**Bệnh** — `data/benh/cum.json`
```json
{
  "id": "cum", "ten": "Cúm mùa", "loai": "virus",
  "bo_phan": ["kq", "phoi"],
  "nguyen_nhan": "…", "trieu_chung": ["…"],
  "khi_nao_di_kham": ["…"], "phong_ngua": ["…"],
  "mo_phong": "virus-ho-hap",
  "nguon": [{ "ten": "…", "url": "…" }], "da_kiem": true
}
```

**Mô phỏng** — `src/sims/virus-ho-hap.js`
```js
export default {
  id: "virus-ho-hap", ten: "Virus cúm qua đường hô hấp", vi_tri: "kq",
  giai_doan: [{ t: 0, mo_ta: "…", thuc_te: "…" }],
  chu_giai: [{ mau: "#d23d8a", ten: "Virus cúm" }],
  khoi_tao(canvas) {}, cap_nhat(dt) {}, ve(ctx) {}
};
```

**Quy ước:**
- `id` viết chữ thường, không dấu, nối các từ bằng gạch ngang.
- Mọi tham chiếu chéo đều dùng `id`. Nếu một `id` được nhắc tới mà không tồn tại thì `tools/kiem-du-lieu.js` phải báo lỗi.
- Liên kết hai chiều tự suy ra: bệnh ghi `bo_phan` gồm tim thì bảng của tim tự hiện bệnh đó.

---

## 6. Lộ trình

| Bản | Nội dung | Trạng thái |
|---|---|---|
| 0.1 | Bản 2D: 11 bộ phận, 9 nhóm mạch, máu chảy theo nhịp tim, 2 mô phỏng (vi khuẩn qua vết thương, virus cúm) | Xong 24/11/2026 |
| 0.2 | 3D xoay được (khối cách điệu); nội dung bản 0.1 tách ra JSON; bảng thông tin 4 mục; 2 mô phỏng thành mô-đun | Xong 24/11/2026 |
| 0.3 | Tìm kiếm (có dấu/không dấu); chỉnh độ trong suốt lớp ngoài; trang chi tiết bệnh đầy đủ; rà lại liên kết chéo bộ phận ↔ bệnh; đường dẫn `#bo-phan/…`, `#benh/…` | Xong 24/11/2026 |
| 0.4 | Mô hình 3D thật từ BodyParts3D (CC BY 4.0); lớp da thật; thêm Da, 6 nhóm xương, 4 nhóm cơ; máu chảy theo trục mạch thật | Xong 24/11/2026 |
| 0.5 | Thêm 5 bệnh thường gặp: tăng huyết áp, nhồi máu cơ tim, viêm phổi, xơ gan, sỏi tiết niệu | Xong 25/11/2026 |
| 0.6 | Mô phỏng phế cầu gây viêm phổi ở phế nang (4 giai đoạn viêm phổi thùy), gắn với bệnh viêm phổi | Xong 25/11/2026 |
| 0.7 | Cơ thể vận hành, bước 1 — hô hấp: phổi 3D phồng xẹp theo nhịp thở, ô nhịp thở; mô phỏng trao đổi khí ở phế nang; khung "Kính hiển vi" chia hai nhóm | Xong 25/11/2026 |
| 0.8 | Cơ thể vận hành, bước 2 — tiêu hóa: mô phỏng hành trình thức ăn và hấp thu ở nhung mao; giai đoạn mô phỏng tự làm sáng cơ quan trên hình 3D | Xong 25/11/2026 |
| 0.9 | Cơ thể vận hành, bước 3 — thận lọc máu: mô phỏng một nephron (lọc, tái hấp thu theo từng đoạn, ADH, aldosterone) | Xong 25/11/2026 |
| 0.10 | Cơ thể vận hành, bước 4 — dẫn truyền thần kinh: điện thế hoạt động, dẫn truyền nhảy cóc, khớp thần kinh, đồ thị điện thế màng | Xong 25/11/2026 |
| 0.11 | Thêm hệ còn thiếu, bước 1 — hệ nội tiết: tuyến yên, tuyến giáp (cách điệu), tuyến thượng thận, tụy | Xong 25/11/2026 |
| 0.12 | Bước 2 — tiêu hóa phụ: thực quản, túi mật; mô phỏng tiêu hóa làm sáng hai bộ phận này | Xong 25/11/2026 |
| 0.13 | Bước 3 — bạch huyết, miễn dịch: tuyến ức (bộ dữ liệu không có hạch, ống ngực, amidan) | Xong 25/11/2026 |
| 0.14 | Bước 4 — thần kinh: tủy sống (cách điệu, dựng theo lỗ ống sống từng đốt); dây thần kinh ngoại biên chưa có | Xong 25/11/2026 |
| 0.15 | Bệnh cho bộ phận mới: đái tháo đường, suy giáp, cường giáp, trào ngược dạ dày – thực quản, sỏi mật, đau thần kinh tọa | Xong 25/11/2026 |
| 0.16 | Chế độ tự kiểm tra: 4 dạng câu tạo tự động từ dữ liệu, bấm trên hình 3D để trả lời | Xong 25/11/2026 |
| — | Đưa lên GitHub: kho mã `ducminhhnx-dotcom/co-the-nguoi` (công khai) và GitHub Pages | Xong 25/11/2026 |
| 0.17 | Bệnh đợt 3: đột quỵ, xơ vữa động mạch, loãng xương, loét dạ dày – tá tràng, ung thư đại trực tràng | Xong 25/11/2026 |
| 0.18 | Mô phỏng bệnh: insulin và đường máu (bình thường, týp 1, týp 2); xơ vữa và cục máu đông; nhóm nút "Bệnh diễn tiến" | Xong 25/11/2026 |
| 0.19 | Mô phỏng loét dạ dày – tá tràng: H. pylori làm mỏng lớp nhầy, axit ăn mòn thành trợt rồi ổ loét, chảy máu, lành | Xong 25/11/2026 |
| Sau đó | Mô phỏng cho các bệnh còn lại (tăng huyết áp, sỏi thận, vòng điều hòa tuyến giáp…); thêm bệnh (lách, cơ, thượng thận, tuyến ức…), dây thần kinh ngoại biên | **Làm tiếp theo** (Minh chọn) |

---

## 7. Quy tắc làm việc cho Claude Code

1. **Đầu phiên:** đọc `CLAUDE.md`, `ROADMAP.md` và 20 dòng cuối của `CHANGELOG.md`, rồi nói một câu về việc sẽ làm trong phiên.
2. **Mỗi phiên một mục tiêu nhỏ.** Kết thúc phiên thì trang phải chạy được, không để dở dang.
3. **Thêm nội dung bằng cách thêm file dữ liệu.** Chỉ sửa `src/core/` khi bắt buộc, và ghi lý do vào CHANGELOG.
4. **Khi đổi cấu trúc dữ liệu:** tăng số phiên bản cấu trúc và viết script chuyển dữ liệu cũ sang. Không được làm hỏng file cũ.
5. **Trước khi báo xong:**
   - chạy `tools/kiem-du-lieu.js`;
   - mở trang bằng trình duyệt chạy ngầm, bảo đảm không có lỗi console;
   - chụp màn hình ở khổ máy tính và khổ điện thoại 390 px để tự kiểm tra.
6. **Cuối phiên:** cập nhật CHANGELOG (ngày, bản, việc đã làm, việc còn dở) và ROADMAP.
7. **Thư viện ngoài:** không tự ý thêm. Thư viện nào dùng cũng phải cố định phiên bản.
8. **Nội dung y học mới:** làm theo mục 3. Không truy cập được nguồn thì ghi `da_kiem: false` và báo Minh.
9. **Hiệu năng:** chạy mượt, từ 30 khung hình/giây trở lên trên laptop phổ thông.

---

## 8. Ngoài phạm vi

- Chẩn đoán từ triệu chứng người dùng nhập vào, tư vấn dùng thuốc.
- Đăng nhập, lưu dữ liệu cá nhân, máy chủ.
