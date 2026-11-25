# Cơ thể người tương tác

Mô hình cơ thể người 3D để học giải phẫu, sinh lý và bệnh học bằng tiếng Việt: xoay, bấm vào từng bộ phận, xem máu chảy theo nhịp tim, phổi thở, các mô phỏng ở mức tế bào, và tự kiểm tra kiến thức.

**Xem trực tuyến:** https://ducminhhnx-dotcom.github.io/co-the-nguoi/

> Mô hình phục vụ học tập, không thay thế chẩn đoán hay tư vấn của bác sĩ.

## Có gì

- Mô hình 3D thật từ BodyParts3D: 39 bộ phận thuộc các hệ tuần hoàn, hô hấp, tiêu hóa, tiết niệu, thần kinh, nội tiết, bạch huyết – miễn dịch, xương, cơ, da.
- Bảng thông tin 4 mục cho mỗi bộ phận (cơ bản, chức năng, tương tác, bệnh), luôn ghi nguồn.
- 13 bệnh thường gặp: nguyên nhân, triệu chứng, khi nào cần đi khám, phòng ngừa — không ghi thuốc hay phác đồ.
- Kính hiển vi: 5 mô phỏng "cơ thể vận hành" (trao đổi khí, tiêu hóa, hấp thu, thận lọc máu, xung thần kinh) và 3 mô phỏng chống nhiễm trùng.
- Tìm kiếm có dấu hoặc không dấu; chế độ tự kiểm tra.

## Chạy trên máy

Trang tĩnh, không cần cài đặt. Cần một máy chủ tĩnh vì trình duyệt không cho nạp mô-đun từ `file://`:

```
py -m http.server 8000
```

rồi mở http://localhost:8000. Kiểm thử tự động: `py tests/kiem-tra.py` (cần Chrome).

## Cấu trúc

Bản thiết kế, quy ước dữ liệu và lộ trình nằm ở [CLAUDE.md](CLAUDE.md), [ROADMAP.md](ROADMAP.md), nhật ký thay đổi ở [CHANGELOG.md](CHANGELOG.md). Nội dung nằm trong `data/` (JSON), mô phỏng trong `src/sims/`, phần lõi trong `src/core/`.

## Nguồn và giấy phép của dữ liệu bên ngoài

- Mô hình 3D: [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), © The Database Center for Life Science, giấy phép CC BY 4.0. Đã chọn lọc, gộp theo bộ phận, giảm lưới, đổi đơn vị; phổi, tuyến giáp và tủy sống là khối cách điệu tự dựng vì bộ dữ liệu không có lưới các bộ phận này.
- Nội dung giải phẫu, sinh lý: [OpenStax Anatomy and Physiology 2e](https://openstax.org/details/books/anatomy-and-physiology-2e), giấy phép CC BY 4.0.
- Nội dung bệnh: MSD Manual, WHO, CDC, StatPearls — trích dẫn ở cuối từng trang, viết lại bằng tiếng Việt.
- Thư viện 3D: [Three.js](https://threejs.org) r160, giấy phép MIT.
