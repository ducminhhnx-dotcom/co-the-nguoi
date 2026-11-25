# Lộ trình

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
| Sau đó | GitHub Pages, dây thần kinh ngoại biên, thêm bệnh | **Làm tiếp theo** (Minh chọn) |

## Việc còn lại (không theo bản)

- Phổi vẫn là khối cách điệu vì BodyParts3D 4.0 không có lưới nhu mô phổi. Muốn có phổi thật cần nguồn khác (ví dụ Z-Anatomy, CC BY-SA 4.0, phải cài Blender để chuyển đổi).
- Mô hình chưa có một số cơ mà bảng thông tin có nhắc (cơ thẳng bụng, cơ chéo bụng trong, cơ ngang bụng, cơ nhai, cơ mặt) vì bộ dữ liệu không có lưới các cơ này.
- Tìm nguồn (StatPearls, MSD Manual…) cho các ý đã xóa khi kiểm chứng 20 file bộ phận (danh sách ở CHANGELOG bản 0.2.1), rồi thêm lại nếu cần.
- Artifact: https://claude.ai/artifact/7rkfd2yiGA15pVtYnZgjyU. GitHub Pages: chưa.
- Liên kết một chiều (giao diện tự suy ra chiều ngược): xem dòng "Liên kết một chiều" khi chạy `py tests/kiem-tra.py`.

## Cách thêm nội dung

- **Bộ phận:** thêm `data/bo-phan/<id>.json`, ghi `id` vào `data/index.json`. Muốn bấm được trên hình 3D thì thêm một dòng vào bảng `CHON` trong `tools/tao-mo-hinh.py` (id → mẫu tên tiếng Anh của BodyParts3D, cỡ ô giảm lưới) rồi chạy lại công cụ.
- **Bệnh:** thêm `data/benh/<id>.json`, ghi `id` vào `data/index.json`. Bộ phận trong `bo_phan` tự hiện bệnh này. Trường `loai` phải có nhãn trong `src/core/loai-benh.js` (loại mới thì thêm một dòng ở đó).
- **Mô phỏng:** thêm `src/sims/<id>.js` theo giao ước ghi ở đầu `src/core/kinh-hien-vi.js`, ghi `id` vào `data/index.json`. Trường `nhom`: `van-hanh` (Cơ thể vận hành) hoặc `nhiem-trung` (Chống nhiễm trùng, mặc định). Giai đoạn nào ghi `bo_phan` thì lõi tự làm sáng bộ phận đó trên hình 3D.
- Mở thẳng một mô phỏng: `index.html#mo-phong/<id>`. Muốn kiểm thử chụp ảnh một giai đoạn thì thêm vào danh sách ảnh trong `tests/kiem-tra.py` đường dẫn `index.html?chup&tua=<giây>#mo-phong/<id>`. Muốn có điểm đánh dấu trên hình 3D thì thêm khóa vào `diem` trong `tools/tao-mo-hinh.py`.
- Sau đó chạy `py tests/kiem-tra.py` (kiểm dữ liệu, lỗi console, chụp màn hình).

## Dựng lại mô hình 3D

1. Tải `isa_BP3D_4.0_obj_99.zip` (136 MB) từ https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html vào một thư mục ngoài dự án (hiện có sẵn ở `D:\AI\Sức khỏe\_du-lieu-goc`).
2. `py tools/tao-mo-hinh.py <đường dẫn file zip>` → ghi `models/co-the.glb` và `models/co-the.json` (khoảng 15 giây).
