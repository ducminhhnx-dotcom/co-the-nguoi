# Nhật ký thay đổi

## Bản 0.1 — 24/11/2026

- Bản 2D dạng artifact "Cơ thể người tương tác" (https://claude.ai/artifact/7rkfd2yiGA15pVtYnZgjyU): 11 bộ phận, các nhóm mạch máu, máu chảy theo nhịp tim, 2 mô phỏng (vi khuẩn qua vết thương, virus cúm).
- Mã và nội dung nằm chung trong một file HTML; chưa có trong thư mục dự án.

## Bản 0.2 — 24/11/2026

**Đã làm**
- Dựng cảnh 3D xoay được bằng Three.js r160 (cố định phiên bản qua import map, CDN jsdelivr) + OrbitControls: kéo xoay, cuộn phóng to/thu nhỏ, chuột phải hoặc hai ngón để di chuyển; nút góc nhìn Trước, Sau, Trái, Phải, Trên, Tự xoay, Đặt lại; dòng "Góc · Thu phóng".
- Mô hình khối cách điệu mô tả bằng dữ liệu trong `models/cach-dieu.json` (vỏ cơ thể, 11 cơ quan, 9 nhóm mạch máu). Mỗi bộ phận là một nhóm đối tượng 3D, tên trùng `id`. Bản 0.4 chỉ cần thay file này bằng `.glb`.
- Phong cách hologram tối theo CLAUDE.md mục 2b: nền lưới 40 px, vỏ viền `#5fd6ff` phát sáng, cơ quan tô theo màu hệ, vòng đế xoay, font Be Vietnam Pro, biểu tượng nét SVG.
- Tách toàn bộ nội dung bản 0.1 ra JSON: `data/bo-phan/` (20 file: 11 cơ quan + 9 nhóm mạch), `data/he.json`, `data/index.json`.
- Thêm 2 bệnh mới gắn với 2 mô phỏng: `data/benh/cum.json` (theo CDC, WHO) và `data/benh/viem-mo-te-bao.json` (theo MSD Manual). Đã đối chiếu với nguồn trong phiên này nên ghi `da_kiem: true`. Không ghi thuốc, liều hay phác đồ.
- Bảng thông tin 4 tab Cơ bản · Chức năng · Tương tác · Bệnh; ô số liệu lưới 2 cột; nút "Liên quan" dạng viên thuốc bấm sang bộ phận hoặc bệnh; dòng nguồn và nhãn "Đã kiểm chứng / Chưa kiểm chứng" ở cuối. Liên kết bệnh ↔ bộ phận tự suy ra hai chiều.
- Bấm vào bệnh mở trang tóm tắt bệnh ngay trong bảng (nguyên nhân, triệu chứng, khi nào cần đi khám, phòng ngừa, nút xem mô phỏng).
- Máu chảy theo nhịp tim trên cả vòng lớn và vòng nhỏ (414 hạt; đỏ = giàu oxy, xanh = nghèo oxy); tim đập; ô nhịp tim có đường điện tim và thanh chỉnh 50–140 lần/phút.
- Cột trái bật/tắt từng hệ (Tuần hoàn, Hô hấp, Tiêu hóa, Tiết niệu, Thần kinh, Miễn dịch); Xương và Cơ hiện mờ "chưa có".
- Hai mô phỏng thành mô-đun độc lập `src/sims/vi-khuan-vet-thuong.js`, `src/sims/virus-ho-hap.js`, chạy trong khung "Cơ thể chống nhiễm trùng" dưới bảng thông tin; danh sách bước in đậm bước đang chạy kèm dòng "Thực tế: …"; mỗi mô phỏng ghi rõ chỗ đã đơn giản hóa; dấu nhấp nháy trên hình 3D chỉ vị trí xâm nhập.
- `tools/kiem-du-lieu.js`: kiểm cấu trúc, quy ước `id`, liên kết chéo, nguồn, `da_kiem`, cấm ghi liều thuốc trong phần bệnh. Chạy được bằng Node hoặc qua `tests/kiem-du-lieu.html`.
- `tests/kiem-tra.py`: chạy Chrome ngầm — kiểm dữ liệu, bắt lỗi console, chụp `tests/anh/may-tinh.png` (1280×900) và `tests/anh/dien-thoai.png` (390 px).
- `tools/may-chu.py`: máy chủ tĩnh chạy thử, tắt bộ nhớ đệm.

**Quyết định cần Minh biết**
- `id` viết đầy đủ cho dễ đọc (`khi-quan`, `da-day`, `ruot-non`, `ruot-gia`, `bang-quang`, `dong-mach-chu`…) thay cho tên viết tắt `kq`, `dd`… của bản 0.1 và ví dụ trong CLAUDE.md mục 5.
- Cấu trúc dữ liệu giữ đúng phiên bản 1. Thêm hai quy ước không phá cấu trúc: (1) mỗi dòng `so_lieu` viết dạng "Nhãn: giá trị (điều kiện)" để hiện thành ô số liệu; (2) trường tùy chọn `co_ban.mo_ta` cho đoạn mô tả ngắn.
- Bản 0.1 ghi "10 nhóm mạch" nhưng mã chỉ có 9 nhóm; bản 0.2 giữ đủ 9 nhóm đó.
- Bỏ các số liệu chung ở màn hình hướng dẫn của bản 0.1 (5 lít máu, 1 phút một vòng) vì không gắn với bộ phận nào để ghi nguồn.
- Trang dùng `fetch` để nạp JSON nên phải mở qua máy chủ (GitHub Pages, artifact, hoặc `py tools/may-chu.py`), không mở thẳng file được. Trang có báo lỗi hướng dẫn nếu mở sai cách.
- Có chế độ `?chup` chỉ để kiểm thử chạy ngầm (vòng lặp dùng hẹn giờ thay vì `requestAnimationFrame`).

**Còn dở**
- 20 file bộ phận chuyển từ bản 0.1 đang ghi `da_kiem: false`: phiên này chưa đối chiếu lại từng số liệu với OpenStax. Cần một phiên riêng để kiểm.
- Máy chưa cài Node nên `node tools/kiem-du-lieu.js` chưa chạy thử trực tiếp; đã chạy cùng mã đó trong Chrome ngầm và đạt.
- Ô tìm kiếm, thanh chỉnh độ trong suốt lớp ngoài và trang chi tiết bệnh đầy đủ để sang bản 0.3.
- Chưa đưa bản 0.2 lên artifact hoặc GitHub Pages.

## Bản 0.2.1 — 24/11/2026 — Kiểm chứng 20 file bộ phận với OpenStax

**Đã làm**
- Đối chiếu từng số liệu, chức năng và tương tác của 20 file `data/bo-phan/*.json` với OpenStax Anatomy and Physiology 2e (các mục 12.1, 13.2, 13.3, 15.3, 18.1, 18.3, 18.5, 19.1, 19.4, 20.1, 20.2, 20.4, 20.5, 21.1, 21.2, 22.1–22.3, 23.4–23.6, 24.2, 24.6, 25.1–25.5, 25.10). Cả 20 file đổi `da_kiem` sang `true`.
- Trường `nguon` giờ trỏ tới mục cụ thể (tên mục + URL trang, ví dụ `.../pages/19-1-heart-anatomy`) thay cho trang giới thiệu chương.
- Chỉ sửa file dữ liệu, không đụng `src/core/`.

**Số liệu đã sửa theo nguồn**
- Tim: khối lượng tách theo giới (nữ 250–300 g, nam 300–350 g); cung lượng tim ghi khoảng 4–8 L/phút, trung bình khoảng 5; thêm kích thước 12 × 8 × 6 cm.
- Phổi: diện tích trao đổi khí 50–75 m² → khoảng 70 m²; nhịp thở 12–20 → 12–18 lần/phút; thêm nhịp thở trẻ dưới 1 tuổi.
- Dạ dày: sức chứa "1–1,5 lít" → rỗng cỡ nắm tay, giãn tới khoảng 4 lít.
- Gan: 1,5 kg → khoảng 1,4 kg (3 pound); mật 0,5–1 → khoảng 1 lít/ngày; "tạng đặc lớn nhất" → "tuyến lớn nhất".
- Thận: 1 triệu → khoảng 1,3 triệu nephron mỗi quả; dịch lọc ghi 180 L/ngày (nam), 150 L/ngày (nữ); thêm chức năng hoạt hóa vitamin D.
- Bàng quang: sức chứa 400–600 mL → thể tích từ gần 0 tới 500–600 mL; buồn tiểu ở khoảng 150 mL.
- Huyết áp (động mạch dưới đòn): "dưới 120/80" → "khoảng 120/80 mmHg là bình thường", đúng cách OpenStax viết.
- Mô tả quan hệ động mạch cảnh và dưới đòn với quai động mạch chủ ghi rõ bên phải tách từ thân cánh tay đầu.

**Ý đã xóa vì không tìm thấy trong OpenStax (Minh cân nhắc thêm lại kèm nguồn khác)**
- Não: khối lượng 1,3–1,4 kg, 86 tỷ nơ-ron, 2% cân nặng, 20% năng lượng; "ngừng cấp máu vài giây có thể ngất"; vùng dưới đồi điều hòa đói và giấc ngủ; cytokine nâng "điểm đặt" thân nhiệt gây sốt. Thay bằng số liệu có trong nguồn: lưu lượng máu não khoảng 750 mL/phút, tiểu não khoảng 10% khối lượng não.
- Động mạch chủ: đường kính gốc 2,5–3 cm (thay bằng đoạn lên dài khoảng 5 cm).
- Khí quản: chiều dài 10–12 cm, đường kính 2–2,5 cm; ý virus cúm làm hỏng lớp lông chuyển gây bội nhiễm (nên lấy từ CDC/StatPearls nếu muốn giữ, vì gắn với mô phỏng virus cúm).
- Phổi: "hàng trăm triệu phế nang".
- Gan và tĩnh mạch cửa: tỷ lệ 75% / 25% máu tới gan; "khả năng tái tạo rất mạnh"; "không dùng thuốc quá liều ghi trên nhãn" (cũng là lời khuyên dùng thuốc, nằm ngoài phạm vi).
- Lách: khối lượng 150 g; người cắt lách nên tiêm thêm vắc-xin.
- Ruột già: "kháng sinh làm xáo trộn hệ vi sinh, gây tiêu chảy".
- Thận: "khi sốt mất nước nhiều, uống đủ nước giúp thận".
- Tĩnh mạch chủ dưới: "tĩnh mạch lớn nhất cơ thể"; "máu tĩnh mạch chảy chậm hơn động mạch" (viết lại theo nguồn: áp lực tĩnh mạch thấp, bơm cơ xương và van một chiều đẩy máu về tim).

**Còn dở**
- Các ý đã xóa ở trên chưa có nguồn thay thế (StatPearls, MSD Manual…).
- 2 file bệnh (`cum`, `viem-mo-te-bao`) không thuộc đợt kiểm này.

## Bản 0.2.2 — 24/11/2026 (xuất bản)

**Đã làm**
- Đưa bản 0.2 (gồm dữ liệu đã kiểm chứng của 0.2.1) lên artifact cũ, giữ nguyên link: https://claude.ai/artifact/7rkfd2yiGA15pVtYnZgjyU (phiên bản 3). Gồm `index.html`, `src/`, `data/`, `models/`; không đưa `tests/`, `tools/`.
- Sửa lỗi trong `src/core/` (bắt buộc): trên artifact, khung hình đầu mang mốc thời gian sớm hơn lúc khởi động làm `dt` âm, hạt máu đọc ra ngoài mảng và vòng lặp dừng, nên khung 3D và điện tim trống. Đã chặn `dt` âm (`main.js`), lấy phần dư dương cho vị trí hạt (`canh-3d.js`), và cho trang tự hiện khung báo lỗi nếu vòng lặp gặp sự cố.
- Đã mở artifact trong Chrome: mô hình 3D, máu chảy, điện tim, chọn bộ phận, bảng 4 tab và nhãn "Đã kiểm chứng" đều chạy. `py tests/kiem-tra.py` vẫn ĐẠT.

**Còn dở**
- Artifact đang ở chế độ riêng tư; muốn chia sẻ thì bật trong menu Share của trang.
- Mức "Thu phóng" hiển thị có thể lệch vài phần trăm khỏi 100% sau khi khung trang đổi cỡ lúc mở; chỉ là con số hiển thị.

## Bản 0.3 — 24/11/2026

**Đã làm**
- Ô tìm kiếm ở đầu trang (`src/core/tim-kiem.js`): tìm bộ phận và bệnh theo tên tiếng Việt, tên Latin/Anh, `id` hoặc tên hệ; gõ có dấu hay không dấu, hoa hay thường đều được ("dong mach", "PHỔI", "cum"). Xếp hạng: trùng tên > đầu tên > đầu từ > chứa. Dùng được bằng bàn phím (mũi tên, Enter, Esc); trên điện thoại ô tìm kiếm chiếm trọn một hàng.
- Thanh "Lớp vỏ ngoài" 0–100% ở cột trái để làm mờ hoặc ẩn lớp vỏ cơ thể.
- Trang chi tiết bệnh (`src/core/trang-benh.js`): mở toàn trang, gồm Nguyên nhân, Triệu chứng, Khi nào cần đi khám (viền cam nổi bật), Phòng ngừa, các bộ phận bị ảnh hưởng (bấm sang được), nút chạy mô phỏng liên quan, lưu ý không ghi thuốc/điều trị, nguồn và trạng thái kiểm chứng. Trên điện thoại hiện toàn màn hình. Bản tóm tắt bệnh trong bảng thông tin (bản 0.2) được thay bằng trang này.
- Đường dẫn chia sẻ được: `#bo-phan/<id>` và `#benh/<id>` mở đúng bộ phận hoặc trang bệnh; đường dẫn tự đổi theo chỗ đang xem.
- Rà liên kết chéo: có 4 liên kết bộ phận một chiều. Thêm 3 chiều ngược vào dữ liệu, dùng nguồn file đó đã trích (tim → động mạch phổi, tim → tĩnh mạch phổi theo OpenStax 19.1; ruột non → gan theo 23.6). Lõi tự suy ra chiều ngược cho phần còn lại và hiện ở mục "Được nhắc tới ở" trong tab Tương tác (hiện còn não → tim). `tools/kiem-du-lieu.js` báo danh sách liên kết một chiều.
- Đã xuất bản lên artifact (phiên bản 4), mở thử trong Chrome: tìm "cum" mở đúng trang bệnh.
- Sửa `src/core/` (bắt buộc vì là tính năng lõi của bản 0.3): thêm `tim-kiem.js`, `trang-benh.js`; `du-lieu.js` thêm hàm bỏ dấu và suy ra tương tác ngược; `bang-thong-tin.js` bỏ phần tóm tắt bệnh; `canh-3d.js` thêm chỉnh độ hiện lớp vỏ; `main.js` nối các phần và xử lý đường dẫn.
- `tests/kiem-tra.py` chụp thêm `tests/anh/trang-benh.png`. Kiểm thử ĐẠT, không lỗi console; đã thử trong trình duyệt: tìm kiếm bằng chuột và bàn phím, thanh lớp vỏ, mở/đóng trang bệnh bằng nút ×, nút bộ phận, nút mô phỏng, đường dẫn.

**Còn dở**
- Bệnh `viem-mo-te-bao` chưa gắn bộ phận (chưa có "Da" trong mô hình).
- Tìm kiếm chưa tìm theo triệu chứng hay nội dung bên trong (chỉ theo tên); chẩn đoán từ triệu chứng nằm ngoài phạm vi.

## Bản 0.4 — 24/11/2026

**Đã làm**
- Thay mô hình khối cách điệu bằng mô hình thật từ **BodyParts3D 4.0** (lưới giảm 99%, bộ "is-a"). Minh duyệt: chọn BodyParts3D, cho tải `partof_BP3D_4.0_obj_99.zip` (62 MB), `partof_parts_list_e.txt` (58 KB) và sau đó `isa_BP3D_4.0_obj_99.zip` (136 MB). File gốc để ở thư mục tạm ngoài dự án; chỉ file đã xử lý vào `models/`.
- `tools/tao-mo-hinh.py` (chỉ dùng thư viện chuẩn Python): chọn file OBJ theo tên tiếng Anh, gộp theo id bộ phận, giảm lưới bằng gom đỉnh theo ô (cỡ ô 1,2–9 mm tùy nhóm), dựng khối phổi, tính trục giữa mạch máu, đổi mm sang đơn vị cảnh (1 đơn vị = 190 mm), ghi `models/co-the.glb` (khoảng 6,5 MB, khoảng 615 nghìn tam giác, 31 đối tượng) và `models/co-the.json` (danh sách đối tượng kèm file nguồn, đường máu chảy, điểm đánh dấu, ghi công).
- Lớp vỏ ngoài giờ là lưới da thật. Thêm bộ phận **Da** (hệ da) — bấm vào chỗ chỉ có da thì mở Da; bệnh viêm mô tế bào giờ gắn với Da.
- Thêm **6 nhóm xương** (hộp sọ, cột sống, lồng ngực, xương chậu, xương đai vai và chi trên, xương chi dưới) và **4 nhóm cơ** (đầu cổ, thân mình, đai vai và chi trên, đai chậu và chi dưới), chia theo OpenStax chương 7, 8, 11. Hệ Xương và Cơ ẩn sẵn, bật ở cột trái.
- 11 file dữ liệu mới (`da`, 6 nhóm xương, 4 nhóm cơ) viết từ nội dung OpenStax mục 5.1, 5.3, 6.1, 7.1–7.4, 8.1–8.4, 11.1, 11.3–11.6 đọc trong phiên này, mỗi file ghi URL từng mục, `da_kiem: true`.
- Máu chảy theo trục giữa tính từ lưới mạch thật; mỗi mạch có vùng bấm vô hình dọc trục để dễ chọn.
- Bảng thông tin hiện ghi chú khi hình 3D là khối cách điệu (phổi). Chân trang ghi công BodyParts3D (CC BY 4.0).
- Sửa CLAUDE.md mục 3.8 theo trang giấy phép mới (Minh duyệt): BodyParts3D CC BY 4.0 (trang cập nhật 27/02/2025; phần đầu file OBJ còn ghi CC BY-SA 2.1 JP), Z-Anatomy CC BY-SA 4.0.
- Sửa `src/core/` (bắt buộc vì đổi cách nạp mô hình): `canh-3d.js` nạp `.glb` bằng GLTFLoader của Three.js r160 (cùng gói đã cố định, không thêm thư viện); `main.js` chờ mô hình nạp xong, ẩn sẵn các hệ có `an_mac_dinh`, đặt cờ `data-san-sang`; `bang-thong-tin.js` thêm ghi chú mô hình.
- `tests/kiem-tra.py` đợi theo thời gian thật và kiểm cờ sẵn sàng (Chrome ngầm vẽ mô hình lớn bằng CPU nên chế độ thời gian ảo quá chậm). Kiểm thử ĐẠT, không lỗi console. Đo trong trình duyệt: khoảng 0,3 ms mỗi khung (mặc định), 0,8 ms khi bật cả xương và cơ.
- Xóa `models/cach-dieu.json` (không còn dùng).
- Claude artifact không phục vụ đuôi `.glb` và chặn tải `data:`, nên công cụ xuất thêm `models/co-the.gltf.json` (cùng nội dung glTF 2.0, dữ liệu nhúng base64, 8,9 MB). Trang nạp file này, tự giải mã rồi ghép thành GLB trong bộ nhớ cho GLTFLoader; `models/co-the.glb` (6,5 MB) giữ để mở bằng công cụ khác. Tổng `models/` khoảng 15,6 MB (giới hạn 50 MB).
- Đã xuất bản lên artifact (phiên bản 6) và mở thử trong Chrome: mô hình hiện đúng.

**Còn dở**
- BodyParts3D 4.0 không có lưới nhu mô phổi: phổi là khối elip dựng theo khung bao cây phế quản thật.
- Bộ dữ liệu thiếu lưới một số cơ (cơ thẳng bụng, chéo bụng trong, ngang bụng, cơ nhai, cơ mặt); bảng thông tin vẫn nhắc tới chúng theo OpenStax.
- Phân nhóm cơ dựa vào tên và vị trí, đã soát danh sách tên từng nhóm nhưng chưa đối chiếu từng cơ với bảng của OpenStax.

## Bản 0.4.1 — 24/11/2026

- Dòng nguồn ở cuối bảng thông tin và trang bệnh gọn trong một dòng (theo yêu cầu của Minh): các mục OpenStax gộp thành "OpenStax §19.1, 19.4…", nguồn khác ghi tên ngắn và gộp theo nơi ("CDC 1, 2 · WHO"). Mỗi số mục vẫn là liên kết; rê chuột hiện tên đầy đủ. Quá dài thì cắt bằng "…" (khổ điện thoại có thể cắt đuôi với bộ phận nhiều nguồn như gan, tim).
- Thêm `src/core/nguon.js`, dùng chung cho `bang-thong-tin.js` và `trang-benh.js`.

## Bản 0.4.2 — 24/11/2026

**Đã làm**
- Mỗi cơ quan có màu riêng để dễ phân biệt (theo yêu cầu của Minh):
  - Màu nằm ở trường `mau` của đối tượng trong `models/co-the.json`, sinh từ bảng `MAU` trong `tools/tao-mo-hinh.py`.
  - Bảng màu: não tím, khí quản trắng xanh, phổi xanh lơ, tim hồng tím, gan đỏ cam, dạ dày vàng, lách chàm, thận xanh ngọc, ruột non cam, ruột già xanh lá, bàng quang tím nhạt.
  - Mạch máu giữ đỏ/xanh theo oxy. Xương và cơ giữ màu hệ.
  - Nút "Liên quan" trong bảng thông tin dùng cùng màu với cơ quan.
  - CLAUDE.md mục 2b ghi lại thay đổi này.
- Sửa `src/core/` (bắt buộc):
  - `canh-3d.js` đọc màu riêng của đối tượng.
  - `bang-thong-tin.js` tô nút theo màu đó.
  - `main.js` ở chế độ `?chup` giữ ảnh `/__cho` đang tải tới khi dựng xong, rồi gọi `/__xong`.
- `tests/kiem-tra.py`: máy chủ kiểm thử giữ `/__cho` tới khi trang gọi `/__xong`.
  - Lý do: Chrome chạy ngầm đọc DOM ngay khi có sự kiện `load`, lúc mô hình 9 MB chưa tải xong, nên kiểm thử lúc đạt lúc trượt.
  - Giờ `load` chờ tới khi trang dựng xong thật.
- `tools/kiem-du-lieu.js` kiểm trường `mau` có đúng dạng `#rrggbb`.
- Kiểm thử ĐẠT.

## Bản 0.5 — 25/11/2026 — Thêm 5 bệnh thường gặp

**Đã làm**
- Thêm 5 file bệnh trong `data/benh/` (Minh chọn nhóm "bệnh thường gặp"):
  - `tang-huyet-ap` (tim, động mạch chủ, thận, não) — WHO fact sheet 25/09/2025, MSD Manual.
  - `nhoi-mau-co-tim` (tim) — MSD Manual, CDC.
  - `viem-phoi` (phổi) — MSD Manual, WHO "Pneumonia in children".
  - `xo-gan` (gan, tĩnh mạch cửa) — MSD Manual.
  - `soi-than` (thận, bàng quang) — MSD Manual.
  - Tất cả `da_kiem: true`, đọc trực tiếp các trang nguồn ngày 25/11/2026. Không ghi thuốc, liều hay phác đồ.
  - Bộ phận tự hiện bệnh qua liên kết hai chiều, không phải sửa file bộ phận.
- Sửa `src/core/` (bắt buộc): bảng thông tin và trang bệnh chỉ có nhãn cho loại "virus", "vi-khuan", nên bệnh mới sẽ hiện nhãn rỗng.
  - Thêm `src/core/loai-benh.js`: một bảng nhãn chung (thêm "nhiem-trung", "tim-mach", "gan", "tiet-nieu").
  - `bang-thong-tin.js` và `trang-benh.js` dùng bảng này thay cho hai bản sao riêng.
- `tools/kiem-du-lieu.js` cảnh báo khi `loai` chưa có nhãn.
- `tests/kiem-tra.py` chụp thêm ảnh trang bệnh tăng huyết áp.
- `data/index.json`: `phien_ban` = "0.5" (đổi luôn chữ "bản 0.4" ghi sẵn trong `index.html`). Sửa câu "Bệnh sẽ được thêm dần từ bản 0.5" ở tab Bệnh trống. Kiểm thử ĐẠT.
- Đã đưa lên artifact https://claude.ai/artifact/7rkfd2yiGA15pVtYnZgjyU (bản 9).

**Còn dở**
- Chưa có mô phỏng cho 5 bệnh mới (`mo_phong: null`). Có thể làm mô phỏng phế cầu cho viêm phổi ở bản sau.

## Bản 0.6 — 25/11/2026 — Mô phỏng phế cầu gây viêm phổi

**Đã làm**
- Thêm `src/sims/pho-cau-phe-nang.js` (nút "Phế cầu" trong khung "Cơ thể chống nhiễm trùng"):
  - Một hàng phế nang và dải mao mạch. Phế cầu là cặp song cầu có vỏ bao; có đại thực bào, bạch cầu trung tính, hồng cầu, dịch và fibrin, bổ thể và kháng thể.
  - 5 giai đoạn của viêm phổi thùy, kèm dòng "Thực tế": hít phế cầu từ mũi họng → sung huyết (24 giờ đầu) → gan hóa đỏ (bắt đầu 2–3 ngày sau, kéo dài 2–4 ngày) → gan hóa xám (2–3 ngày sau đó, kéo dài 4–8 ngày) → hồi phục (từ khoảng ngày thứ 8).
  - Vỏ bao làm tế bào thực bào khó bắt vi khuẩn. Khi vi khuẩn đã bị bổ thể và kháng thể đánh dấu (viền tím), tế bào thực bào bắt được dễ.
  - Có ghi những chỗ đã đơn giản hóa.
- `viem-phoi.json`: `mo_phong` = "pho-cau-phe-nang"; thêm nguồn StatPearls (Typical Bacterial Pneumonia, Pneumococcal Pneumonia) và OpenStax A&P 2e mục 21.2.
  - StatPearls trên NCBI chặn công cụ tải tự động, nên mình đọc bằng trình duyệt.
- `data/index.json`: thêm mô phỏng, `phien_ban` = "0.6". Chữ bản trong `index.html` cũng đổi thành 0.6.
- Không sửa `src/core/`. Kiểm thử ĐẠT.
- Đã chạy thử trong trình duyệt: đủ 5 giai đoạn, tự kết thúc sau khoảng 20 giây.

## Bản 0.6.1 — 25/11/2026 — Làm nốt việc dở của bản 0.6

**Đã làm**
- Điểm đánh dấu ở phổi phải cho mô phỏng phế cầu (`diem: 'phoi'`):
  - `tools/tao-mo-hinh.py` sinh `diem.phoi`: tâm khối elip phổi phải, dời ra trước 40 mm (giống điểm khí quản).
  - Máy không có file zip BodyParts3D nên chưa chạy lại công cụ. Mình tính đúng điểm đó từ lưới phổi trong `models/co-the.gltf.json` rồi ghi vào `models/co-the.json` (chỉ thêm `diem.phoi`, giữ nguyên định dạng file).
- Sửa `src/core/main.js` (bắt buộc, để kiểm thử chụp được mô phỏng và để chia sẻ đường dẫn):
  - Đường dẫn `#mo-phong/<id>` mở thẳng mô phỏng. Đang chạy mô phỏng thì đường dẫn đổi theo; bấm Dừng thì trở về `#bo-phan/…`.
  - Ở chế độ `?chup`, tham số `tua=<giây>` tua mô phỏng tới mốc đó.
- `tests/kiem-tra.py` chụp thêm `mo-phong-pho-cau.png` (`?chup&tua=9#mo-phong/pho-cau-phe-nang`, giai đoạn gan hóa đỏ). Bỏ 2 ảnh chụp tay cũ.
- Kiểm thử ĐẠT.
- CLAUDE.md (Minh đồng ý 25/11/2026): bảng lộ trình mục 6 chép theo ROADMAP.md (bản 0.1–0.6 đã xong, 0.7 trở đi làm tiếp theo); bản thiết kế đổi thành 0.4.

## Bản 0.7 — 25/11/2026 — Cơ thể vận hành, bước 1: hô hấp

**Đã làm**
- Phổi trên hình 3D phồng khi hít vào, xẹp khi thở ra. Đỉnh phổi giữ nguyên, đáy phổi hạ xuống như khi cơ hoành co.
- Ô "Nhịp thở" ở cột trái có:
  - số lần/phút và thanh chỉnh 8–40, mặc định 15;
  - đường sóng thể tích phổi và nhãn "Hít vào / Thở ra";
  - ghi chú "Người lớn lúc nghỉ: 12–18 lần/phút" (OpenStax A&P 2e mục 22.3).
- Mô phỏng mới `src/sims/trao-doi-khi.js` (nhóm "Cơ thể vận hành"), gồm 6 bước:
  1. Hít vào.
  2. Hồng cầu nghèo oxy tới mao mạch.
  3. O₂ khuếch tán sang máu, hồng cầu đỏ dần (mỗi hemoglobin mang tối đa 4 O₂).
  4. CO₂ đi theo chiều ngược lại.
  5. Thở ra thụ động.
  6. Máu giàu oxy về tim trái.
  - Số liệu phân áp và tỷ lệ vận chuyển khí lấy từ OpenStax mục 22.3–22.5.
  - Có ghi những chỗ đã đơn giản hóa.
- Khung "Cơ thể chống nhiễm trùng" đổi thành "Kính hiển vi", chia hai hàng nút theo trường `nhom` của mô-đun: "Cơ thể vận hành" và "Chống nhiễm trùng" (mặc định). Minh duyệt; CLAUDE.md mục 2b cập nhật, bản thiết kế 0.5.
- Sửa `src/core/` (bắt buộc, vì tính năng mới nằm ở cảnh 3D và giao diện chung):
  - `canh-3d.js`: chuyển động thở của phổi, thêm `datNhipTho()` và `tho()`.
  - `main.js`: ô nhịp thở.
  - `kinh-hien-vi.js`: hai nhóm nút.
  - `bang-thong-tin.js`: thêm một dòng hướng dẫn.
  - `giao-dien.css`: kiểu cho ô nhịp thở và nhóm nút.
  - Sửa luôn lỗi cũ: thanh trượt "Lớp vỏ ngoài" lấn ra 2 px làm cột trái có thanh cuộn ngang ở khổ điện thoại.
- `tests/khung-dien-thoai.html` chuyển tiếp tham số và đường dẫn # cho trang bên trong.
- `tests/kiem-tra.py`:
  - chụp thêm `mo-phong-trao-doi-khi.png` và `dien-thoai-kinh-hien-vi.png` (khổ 390 px);
  - kiểm có chữ "Kính hiển vi", "Cơ thể vận hành", "Chống nhiễm trùng" và ô nhịp thở.
- `data/index.json`: `phien_ban` = "0.7". Kiểm thử ĐẠT.

**Còn dở**
- Các bước tiếp theo của phần cơ thể vận hành: tiêu hóa, thận lọc máu, dẫn truyền thần kinh.

## Bản 0.8 — 25/11/2026 — Cơ thể vận hành, bước 2: tiêu hóa

**Đã làm**
- Mô phỏng `src/sims/hanh-trinh-thuc-an.js` (nút "Tiêu hóa"): sơ đồ ống tiêu hóa duỗi thẳng, gồm 7 bước:
  1. Miệng.
  2. Nuốt, thực quản.
  3. Dạ dày.
  4. Tá tràng, có mật và dịch tụy.
  5. Ruột non hấp thu.
  6. Ruột già.
  7. Thải phân.
  - Mỗi bước kèm thời gian thật: nuốt 4–8 giây, dạ dày rỗng sau 2–4 giờ, ruột non 3–5 giờ, ruột già 12–24 giờ, cả quá trình 24–72 giờ.
  - Nguồn: OpenStax A&P 2e mục 23.3–23.7.
- Mô phỏng `src/sims/hap-thu-ruot-non.js` (nút "Hấp thu ở ruột non"): một nhung mao có mao mạch và mạch bạch huyết ở giữa.
  - Đường đơn và axit amin vào mao mạch. Mỡ được ráp thành chylomicron rồi vào mạch bạch huyết.
  - Máu theo tĩnh mạch cửa về gan.
  - Nguồn: OpenStax mục 23.5–23.7.
- Sửa `src/core/` (bắt buộc, để mô phỏng chỉ được cơ quan trên hình 3D; dùng chung cho các bước thận và thần kinh sau này):
  - Mỗi giai đoạn của mô-đun có thể ghi `bo_phan`. `kinh-hien-vi.js` báo lên, `main.js` làm sáng bộ phận đó trên hình 3D và mở bảng thông tin của nó, đường dẫn vẫn giữ `#mo-phong/…`.
  - Đã thử trong trình duyệt: dạ dày → gan → ruột non → ruột già đổi đúng lúc.
- `tools/kiem-du-lieu.js` nạp từng mô-đun mô phỏng và kiểm:
  - `id` khớp tên file;
  - `nhom` hợp lệ;
  - `vi_tri` và `giai_doan[].bo_phan` là bộ phận có thật;
  - `diem` có trong mô hình;
  - mỗi giai đoạn có `mo_ta`.
- `tests/kiem-tra.py` chụp thêm 3 ảnh: `mo-phong-tieu-hoa.png`, `mo-phong-hap-thu.png`, `dien-thoai-tieu-hoa.png` (390 px).
- `data/index.json`: `phien_ban` = "0.8". Kiểm thử ĐẠT.

**Còn dở**
- Mô hình 3D chưa có thực quản, tụy, túi mật, nên bước "miệng, thực quản" không có cơ quan để làm sáng, và bước mật, dịch tụy làm sáng gan.
- Bước tiếp theo của phần cơ thể vận hành: thận lọc máu (0.9), dẫn truyền thần kinh (0.10).

## Bản 0.9 — 25/11/2026 — Cơ thể vận hành, bước 3: thận lọc máu

**Đã làm**
- Mô phỏng `src/sims/loc-mau-o-than.js` (nút "Thận lọc máu"): một nephron vẽ phẳng, gồm cầu thận và nang Bowman, ống lượn gần, quai Henle, ống lượn xa, ống góp, cùng mao mạch quanh ống.
- 6 bước, kèm số liệu thật:
  1. Máu vào cầu thận.
  2. Lọc: 125 ml/phút ở nam, 105 ml/phút ở nữ, tức 180 và 150 lít/ngày; tế bào máu và protein lớn ở lại trong máu.
  3. Ống lượn gần lấy lại gần hết đường, khoảng 2/3 nước và muối, khoảng một nửa ure.
  4. Quai Henle tạo vùng tủy mặn.
  5. Ống lượn xa và ống góp: ADH, aldosterone, tiết H⁺.
  6. Nước tiểu xuống bàng quang: khoảng 99% dịch lọc được trả lại máu, còn 1–2 lít/ngày.
- Mỗi chấm dịch lọc được gán sẵn đoạn ống nơi nó được lấy lại, theo tỷ lệ ở bảng 25.5 của OpenStax. Vì vậy phần lớn chấm quay về máu, chỉ ít chấm đi tới ống góp.
- Trên hình 3D, các bước lần lượt làm sáng động mạch thận → thận → bàng quang.
- Nguồn: OpenStax A&P 2e mục 25.4, 25.5, 25.6, 25.8.
- Không sửa `src/core/`.
- `tests/kiem-tra.py` chụp thêm `mo-phong-than.png` và `dien-thoai-than.png`.
- `data/index.json`: `phien_ban` = "0.9". Kiểm thử ĐẠT.

**Còn dở**
- Bước cuối của phần cơ thể vận hành: dẫn truyền thần kinh (0.10).

## Bản 0.10 — 25/11/2026 — Cơ thể vận hành, bước 4: dẫn truyền thần kinh

**Đã làm**
- Mô phỏng `src/sims/dan-truyen-than-kinh.js` (nút "Xung thần kinh"), gồm hai nửa:
  - Nửa trên: tế bào thần kinh có thân, sợi trục bọc myelin với 7 eo Ranvier, cúc tận cùng, khe synapse và tế bào sau.
  - Nửa dưới: đồ thị điện thế màng ở gò sợi trục: −70 mV → ngưỡng −55 mV → đỉnh +30 mV → hơi âm quá mức nghỉ → trở về.
- 7 bước:
  1. Điện thế nghỉ, bơm Na⁺/K⁺.
  2. Kích thích tới ngưỡng, luật "tất cả hoặc không".
  3. Điện thế hoạt động (Na⁺ vào, K⁺ ra), dài khoảng 2 mili giây.
  4. Dẫn truyền nhảy cóc qua eo Ranvier, giai đoạn trơ.
  5. Khớp hóa học: Ca²⁺ vào, túi đổ chất dẫn truyền, chất này gắn thụ thể.
  6. Dọn khe: men phân giải hoặc tế bào hút lại.
  7. Mạng lưới thần kinh, khớp điện.
- Bước 1 và bước 7 làm sáng Não trên hình 3D.
- Nguồn: OpenStax A&P 2e mục 12.4, 12.5. Nguồn không ghi tốc độ dẫn truyền (m/s), nên mô phỏng chỉ so sánh định tính, không đưa số.
- Không sửa `src/core/`.
- `tests/kiem-tra.py` chụp thêm `mo-phong-than-kinh.png` và `dien-thoai-than-kinh.png`.
- `data/index.json`: `phien_ban` = "0.10". Kiểm thử ĐẠT.
- Xong phần "cơ thể vận hành": tuần hoàn (có từ trước), hô hấp, tiêu hóa, thận, thần kinh.

**Còn dở**
- Hệ thần kinh trên mô hình 3D mới có não, chưa có tủy sống và dây thần kinh.

## Bản 0.11 — 25/11/2026 — Thêm hệ còn thiếu, bước 1: hệ nội tiết

**Đã làm**
- Hệ mới "Nội tiết" (`noi-tiet`, màu `#ffe066`) trong `data/he.json`; nút bật/tắt hệ tự hiện ở cột trái.
- 4 bộ phận mới, đều có nguồn OpenStax A&P 2e và `da_kiem: true`:
  - `tuyen-yen`: hormone thùy trước và thùy sau (mục 17.3).
  - `tuyen-giap`: T3, T4, điều hòa ngược, iốt và bướu cổ (mục 17.4).
  - `tuyen-thuong-than`: vỏ 3 lớp, tủy tiết adrenaline (mục 17.6).
  - `tuy`: ngoại tiết và đảo tụy, insulin, glucagon, đái tháo đường týp 1 và 2 (mục 17.9, 23.6).
  - Nguồn không ghi kích thước tuyến giáp và thượng thận nên không đưa số đó vào.
- Mô hình 3D dựng lại từ BodyParts3D 4.0:
  - File `isa_BP3D_4.0_obj_99.zip` tải lại vào `D:\AI\Sức khỏe\_du-lieu-goc` (ngoài dự án), Minh đồng ý.
  - `tools/tao-mo-hinh.py` thêm vào bảng `CHON`: tuyến yên (`pituitary gland`), tuyến thượng thận (`adrenal gland`), tụy (`pancreas`); thêm màu riêng vào bảng `MAU`.
  - Tuyến giáp: BodyParts3D 4.0 không có lưới tuyến giáp (chỉ có sụn giáp). Công cụ dựng khối cách điệu hình con bướm gồm hai thùy elip hai bên khí quản, ngay dưới sụn giáp, nối bằng eo giáp. Kích thước chỉ ước lượng; bảng thông tin ghi rõ là hình cách điệu.
  - Các bộ phận cũ giữ nguyên số tam giác, mạch máu không đổi. Điểm `diem.phoi` giờ do công cụ tính (x −0,330, trước là −0,345 tính tay ở bản 0.6.1).
  - Đã kiểm vị trí: tuyến giáp trước khí quản; tuyến yên ở nền não; thượng thận trên đỉnh thận; tụy sau dạ dày, đuôi hướng về lách.
- Không sửa `src/core/`.
- `data/index.json`: `phien_ban` = "0.11". Kiểm thử ĐẠT: 35 bộ phận, 35 đối tượng 3D.

**Còn dở**
- BodyParts3D 4.0 cũng không có tủy sống (chỉ có ống trung tâm) và hầu như không có dây thần kinh ngoại biên (chỉ dây thần kinh quanh hốc mắt). Bước "thần kinh" sẽ phải dựng cách điệu hoặc dùng nguồn khác (Z-Anatomy).
- Bộ dữ liệu có thực quản, túi mật, tuyến ức, dùng được cho các bước sau.

## Bản 0.12 — 25/11/2026 — Thêm hệ còn thiếu, bước 2: thực quản, túi mật

**Đã làm**
- 2 bộ phận mới của hệ tiêu hóa, nguồn OpenStax A&P 2e, `da_kiem: true`:
  - `thuc-quan` (mục 23.3): dài khoảng 25 cm, sau khí quản, qua cơ hoành; hai cơ thắt; cơ vân và cơ trơn theo từng phần ba; trào ngược.
  - `tui-mat` (mục 23.6): dài 8–10 cm, ở mặt sau thùy phải của gan; cô đặc mật tới khoảng 10 lần; ống mật chủ; chu trình gan – ruột; bilirubin.
- Mô hình 3D dựng lại: `tools/tao-mo-hinh.py` thêm `esophagus` và `gallbladder` vào `CHON`, thêm màu vào `MAU`.
  - Các bộ phận cũ, điểm đánh dấu và mạch máu không đổi.
  - Đã kiểm vị trí: thực quản chạy từ cổ xuống tới dạ dày; túi mật bên phải, dưới gan.
- Mô phỏng "Tiêu hóa": bước nuốt giờ làm sáng Thực quản; bước tá tràng làm sáng Túi mật (trước là Gan) và câu mô tả ghi rõ túi mật co lại đẩy mật xuống.
- `tests/kiem-tra.py` chụp thêm `bo-phan-tui-mat.png`.
- Không sửa `src/core/`.
- `data/index.json`: `phien_ban` = "0.12". Kiểm thử ĐẠT: 37 bộ phận, 37 đối tượng 3D.

## Bản 0.13 — 25/11/2026 — Thêm hệ còn thiếu, bước 3: tuyến ức

**Đã làm**
- Bộ phận mới `tuyen-uc` (hệ bạch huyết – miễn dịch), nguồn OpenStax A&P 2e mục 21.1, `da_kiem: true`:
  - Vị trí: giữa xương ức và động mạch chủ, trên tim; hai thùy, vỏ và tủy.
  - Chức năng: nơi tế bào T trưởng thành; là cơ quan lympho nguyên phát cùng tủy xương.
  - Teo dần sau dậy thì: khoảng 3% mỗi năm tới 35–45 tuổi, sau đó khoảng 1% mỗi năm.
  - Mục "Toàn thân" nêu thêm: hệ bạch huyết đưa khoảng 3 lít dịch mỗi ngày trở về máu; khoảng 500–600 hạch; amidan.
- Mô hình 3D dựng lại: `tools/tao-mo-hinh.py` thêm `lobe of thymus` (thùy trái và phải) vào `CHON`, thêm màu vào `MAU`.
  - Các bộ phận cũ, điểm đánh dấu và mạch máu không đổi.
  - Đã kiểm vị trí: tuyến ức nằm trên và trước tim.
- BodyParts3D 4.0 không có hạch bạch huyết, ống ngực, amidan (đã lọc tên trong file gốc), nên chưa có hình 3D cho các phần này.
- `tests/kiem-tra.py` chụp thêm `bo-phan-tuyen-uc.png`.
- Không sửa `src/core/`.
- `data/index.json`: `phien_ban` = "0.13". Kiểm thử ĐẠT: 38 bộ phận.

## Bản 0.14 — 25/11/2026 — Thêm hệ còn thiếu, bước 4: tủy sống

**Đã làm**
- Bộ phận mới `tuy-song` (hệ thần kinh), nguồn OpenStax A&P 2e mục 13.2 và 13.4, `da_kiem: true`:
  - Các đoạn tủy; chất xám hình chữ H (sừng sau cảm giác, sừng trước vận động, sừng bên tự chủ); chất trắng.
  - 31 đôi dây thần kinh sống (8–12–5–5–1), rễ sau và rễ trước.
  - 4 đám rối, dây thần kinh hoành, dây thần kinh tọa; đuôi ngựa; hai chỗ phình đoạn cổ và thắt lưng.
  - Nguồn không ghi chiều dài, đường kính tủy nên không đưa số đó vào.
- Hình 3D cách điệu (Minh chọn cách 1), vì BodyParts3D 4.0 không có lưới tủy sống:
  - Ống trung tâm có thật trong dữ liệu chỉ dài khoảng 3,5 cm ở cổ, nên không dựng quanh nó được.
  - `tools/tao-mo-hinh.py` dò lỗ ống sống ở 21 đốt, từ C1 tới L2: là khoảng trống trước–sau giữa các đỉnh nằm sát đường giữa của lát giữa đốt.
  - Vì lưới chỉ có bề mặt, ruột thân đốt cũng là một khoảng trống. Công cụ chọn khoảng trống gần đường đi của đốt phía trên nhất, xuất phát từ ống trung tâm có thật ở cổ; sau đó làm trơn bằng trung bình 3 điểm.
  - Ống tròn bán kính ước lượng 5 mm, phình 6,5 mm ở đoạn cổ và thắt lưng, thon lại ở giữa đốt L2 (OpenStax: đoạn tủy cùng nằm ngang các đốt thắt lưng trên).
  - Đã kiểm trong trình duyệt: tủy đi từ nền não xuống, nằm trong cột sống, phía sau thân đốt, theo đúng đường cong ngực và thắt lưng.
  - Các bộ phận cũ, điểm đánh dấu và mạch máu không đổi.
- `tests/kiem-tra.py` chụp thêm `bo-phan-tuy-song.png`.
- Không sửa `src/core/`.
- `data/index.json`: `phien_ban` = "0.14". Kiểm thử ĐẠT: 39 bộ phận.

**Còn dở**
- Dây thần kinh ngoại biên (thần kinh tọa, đám rối…) chưa có hình 3D; BodyParts3D không có. Muốn có thì dựng cách điệu hoặc dùng Z-Anatomy.

## Bản 0.15 — 25/11/2026 — Bệnh cho các bộ phận mới

**Đã làm**
- 6 file bệnh mới, đều `da_kiem: true`, không ghi thuốc, liều hay phác đồ:
  - `dai-thao-duong` (tụy, thận, tim, não) — WHO 11/11/2026, MSD Manual (tổng quan; týp 1). Ngưỡng chẩn đoán chỉ ghi bằng mmol/L và HbA1c; nếu ghi "mg/dL", bộ kiểm sẽ nhầm là liều thuốc.
  - `suy-giap` (tuyến giáp, tuyến yên) — MSD Manual, OpenStax 17.4.
  - `cuong-giap` (tuyến giáp, tim) — MSD Manual, OpenStax 17.4.
  - `trao-nguoc-da-day-thuc-quan` (thực quản, dạ dày) — MSD Manual. Nguồn khuyên không ăn trong 4 giờ trước khi ngủ, kê cao đầu giường khoảng 15 cm.
  - `soi-mat` (túi mật, gan, tụy) — MSD Manual.
  - `dau-than-kinh-toa` (tủy sống, cột sống, cơ chi dưới) — MSD Manual, OpenStax 13.4.
- Các trang MSD không có mục "khi nào cần đi khám" riêng. Mục này được viết từ các biến chứng và dấu hiệu nặng mà chính trang đó nêu (cơn bão giáp, hôn mê phù niêm, nhiễm toan ceton, nhiễm trùng đường mật, chèn ép đuôi ngựa…).
- `src/core/loai-benh.js` thêm 3 nhãn: "Bệnh nội tiết", "Bệnh tiêu hóa", "Bệnh thần kinh – cột sống". Đây là bảng nhãn đã tách riêng từ bản 0.5 để thêm loại mới chỉ cần thêm một dòng.
- `tests/kiem-tra.py` chụp thêm `benh-dai-thao-duong.png` và `dien-thoai-benh-trao-nguoc.png`.
- `data/index.json`: `phien_ban` = "0.15". Kiểm thử ĐẠT: 39 bộ phận, 13 bệnh.

**Còn dở**
- Tuyến yên, tuyến thượng thận, tuyến ức chưa có bệnh gắn vào.

## Bản 0.16 — 25/11/2026 — Chế độ tự kiểm tra

**Đã làm**
- Mô-đun mới `src/core/tu-kiem-tra.js`. Minh chọn cả 4 dạng câu, đặt ở cột phải:
  - Bấm đúng cơ quan trên hình 3D: chỉ hỏi bộ phận có hình và thuộc hệ hiện sẵn khi mở trang (bỏ xương, cơ vì ẩn mặc định).
  - Đoán cơ quan từ một câu chức năng: tên cơ quan trong câu được che bằng "___".
  - Bệnh ảnh hưởng trực tiếp tới cơ quan nào.
  - Cơ quan thuộc hệ nào: bỏ tụy vì thuộc cả nội tiết và tiêu hóa.
- Câu hỏi tạo tự động từ `data/` đã có nguồn, không thêm nội dung y học mới.
- Mỗi lượt 10 câu. Sau mỗi câu: báo đúng/sai, giải thích, làm sáng đáp án trên hình 3D, có nút "Đọc về …". Cuối lượt có điểm. Kết quả không lưu lại (CLAUDE.md mục 8).
- Khi đang làm bài:
  - Bấm hình 3D là trả lời, không mở bảng thông tin.
  - Ẩn nhãn tên khi rê chuột (để không lộ đáp án).
  - Dải nhắc "Bấm vào …" hiện trên hình 3D.
  - Trên điện thoại, trang tự cuộn lên hình 3D với câu bấm, xuống bảng câu hỏi với câu chọn đáp án.
- Sửa `src/core/` (bắt buộc, vì đây là tính năng giao diện mới):
  - `main.js`: nút "Tự kiểm tra", đường dẫn `#tu-kiem-tra`, chuyển bấm 3D sang bài kiểm tra; chọn bộ phận từ chỗ khác thì thoát bài.
  - `bang-thong-tin.js`: thêm `veLai()` để trả lại nội dung cũ khi thoát.
  - `giao-dien.css`, `index.html`: nút ở đầu trang, dải nhắc trên hình 3D.
- CLAUDE.md thêm mục 2b.3b; bản thiết kế 0.6.
- Đã thử trong trình duyệt:
  - Làm trọn 10 câu, cả 4 dạng; chấm đúng, cho điểm 5/10; thoát thì trở lại bảng Gan và đường dẫn `#bo-phan/gan`.
  - Bấm chuột thật lên gan khi câu hỏi là Tĩnh mạch phổi → "Chưa đúng. Bạn bấm vào Gan…".
- `tests/kiem-tra.py` chụp thêm `tu-kiem-tra.png` và `dien-thoai-tu-kiem-tra.png`; kiểm có chữ "Tự kiểm tra".
- Sửa chữ "bản 0.10" ghi sẵn trong `index.html` bị bỏ sót từ bản 0.11 (trang vẫn hiện đúng vì `main.js` ghi đè).
- `data/index.json`: `phien_ban` = "0.16". Kiểm thử ĐẠT.

## 25/11/2026 — Đưa lên GitHub

**Đã làm**
- Bật git cho thư mục dự án, nhánh `main`.
  - Tác giả commit dùng email ẩn danh của GitHub (`…@users.noreply.github.com`), không lộ email cá nhân.
  - Đặt cấu hình riêng cho kho này, không đổi cấu hình chung của máy.
- Thêm `.gitignore` (tệp tạm Python, cài đặt riêng của Claude Code, file zip dữ liệu gốc), `.nojekyll` (để Pages phục vụ nguyên trạng các file), `README.md` (giới thiệu, cách chạy, nguồn và giấy phép dữ liệu bên ngoài).
- Trước khi đăng: quét toàn thư mục, không có email, token hay khóa nào.
- Tạo kho công khai https://github.com/ducminhhnx-dotcom/co-the-nguoi và đẩy mã lên.
- Bật GitHub Pages từ nhánh `main`, thư mục gốc: https://ducminhhnx-dotcom.github.io/co-the-nguoi/
- Từ nay mỗi bản: commit và đẩy lên `main` để Pages tự cập nhật; artifact vẫn cập nhật như cũ.

**Còn dở**
- `AGENTS.md` là bản sao cũ của bản thiết kế (bản 0.3, viết cho Codex), chưa đồng bộ với CLAUDE.md.

## Bản 0.17 — 25/11/2026 — Bệnh đợt 3

**Đã làm**
- 5 bệnh mới, đều `da_kiem: true`, không ghi thuốc, liều hay phác đồ:
  - `dot-quy` (não, động mạch cảnh) — MSD Manual, CDC. Có dấu hiệu B.E. F.A.S.T., ghi giờ khởi phát, không tự lái xe, mốc 3 giờ.
  - `xo-vua-dong-mach` (động mạch chủ, động mạch cảnh, động mạch thận, tim) — MSD Manual.
  - `loang-xuong` (cột sống, xương chậu, xương chi trên, xương chi dưới) — MSD Manual. Lượng canxi không ghi theo mg (bộ kiểm sẽ nhầm là liều thuốc); chỉ liệt kê thực phẩm giàu canxi.
  - `loet-da-day-ta-trang` (dạ dày, ruột non) — MSD Manual. Nhóm thuốc giảm đau chống viêm không steroid chỉ được nêu như một nguyên nhân, không nêu tên thuốc cụ thể.
  - `ung-thu-dai-truc-trang` (ruột già) — WHO 13/02/2026, MSD Manual. Trang MSD về tầm soát bị chặn khi tải, nên chỉ ghi "từ 45 tuổi hỏi bác sĩ về tầm soát" như trang MSD chính nêu, không có chu kỳ cụ thể.
- Bỏ một ý phòng ngừa đột quỵ ("khám sức khỏe định kỳ") vì ý này chỉ có trong bản tóm tắt tự động, không có trong nguyên văn trang.
- `src/core/loai-benh.js` thêm nhãn "Bệnh xương khớp", "Bệnh ung thư".
- `tests/kiem-tra.py` chụp thêm `benh-dot-quy.png`.
- `data/index.json`: `phien_ban` = "0.17". Kiểm thử ĐẠT: 18 bệnh.
- Bộ phận có bệnh gắn vào: từ 19 lên 26/39.
