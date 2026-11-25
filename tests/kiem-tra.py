"""Kiểm thử tự động bằng Chrome chạy ngầm (headless).

Cách chạy (trong thư mục dự án):   py tests/kiem-tra.py
Việc làm:
  1. Mở máy chủ tĩnh tạm thời.
  2. Chạy tools/kiem-du-lieu.js qua tests/kiem-du-lieu.html.
  3. Mở index.html, bắt lỗi console, kiểm trang đã dựng xong.
  4. Chụp màn hình khổ máy tính (1280×900) và điện thoại (390×844) vào tests/anh/.
Thoát với mã 1 nếu có lỗi.
"""
import functools, http.server, os, re, subprocess, sys, tempfile, threading, html

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = next((p for p in [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium"] if os.path.exists(p)), None)

XONG = threading.Event()   # trang báo dựng xong qua /__xong

class Im(http.server.SimpleHTTPRequestHandler):
    """Ở chế độ ?chup, trang giữ ảnh /__cho đang tải để Chrome chưa chụp/đọc DOM;
    máy chủ chỉ trả ảnh đó sau khi trang gọi /__xong (hoặc quá 60 giây)."""
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path.startswith('/__xong'):
            XONG.set(); return self._tra(b'', 'text/plain')
        if self.path.startswith('/__cho'):
            XONG.wait(60); XONG.clear()
            return self._tra(b'<svg xmlns="http://www.w3.org/2000/svg"/>', 'image/svg+xml')
        return super().do_GET()
    def _tra(self, b, loai):
        self.send_response(200); self.send_header('Content-Type', loai); self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(b)

def may_chu():
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Im, directory=GOC))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, f"http://127.0.0.1:{s.server_address[1]}"

def chrome(*args, cho=8000):
    ho_so = tempfile.mkdtemp(prefix="chrome-kiem-")
    lenh = [CHROME, "--headless=new", "--disable-gpu-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
            "--hide-scrollbars", "--no-first-run", f"--user-data-dir={ho_so}", "--enable-logging=stderr", "--v=0",
            *([f"--virtual-time-budget={cho}"] if cho else []), *args]
    r = subprocess.run(lenh, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120)
    return r.stdout, r.stderr

def loi_console(stderr):
    ds = []
    for d in stderr.splitlines():
        if "CONSOLE" in d or "Uncaught" in d:
            if re.search(r"error|uncaught|failed|lỗi|warning", d, re.I):
                ds.append(d.strip())
    return ds

def main():
    if not CHROME:
        print("Không tìm thấy Chrome/Edge."); return 1
    s, url = may_chu()
    so_loi = 0
    # 1. kiểm dữ liệu
    out, _ = chrome("--dump-dom", f"{url}/tests/kiem-du-lieu.html", cho=5000)
    m = re.search(r'<pre id="kq" data-trang-thai="([^"]+)">(.*?)</pre>', out, re.S)
    print("== Kiểm dữ liệu ==")
    if not m: print("Không đọc được kết quả."); so_loi += 1
    else:
        print(html.unescape(m.group(2)))
        if m.group(1) != "dat": so_loi += 1
    # 2. trang chính
    print("\n== Trang chính ==")
    # Đợi theo thời gian thật: "thời gian ảo" quá chậm khi Chrome ngầm vẽ mô hình lớn bằng CPU (SwiftShader).
    out, err = chrome("--dump-dom", "--timeout=90000", f"{url}/index.html?chup", cho=0)
    lc = loi_console(err)
    for d in lc: print("CONSOLE:", d)
    if lc: so_loi += len(lc)
    if 'id="loi" class="loi" hidden' not in out: print("Khung báo lỗi đang hiện."); so_loi += 1
    if 'data-san-sang="co"' not in out: print("Trang chưa dựng xong (chưa có cờ sẵn sàng)."); so_loi += 1
    for can in ["Bắt đầu từ đâu?", "Kính hiển vi", "Cơ thể vận hành", "Chống nhiễm trùng", "Bệnh diễn tiến", "id=\"song-tho\"", "Tự kiểm tra", "data-he=\"tuan-hoan\"", "<canvas"]:
        if can not in out: print("Thiếu:", can); so_loi += 1
    if not lc: print("Không có lỗi console.")
    # 3. chụp màn hình (?chup: vòng lặp chạy bằng hẹn giờ vì Chrome ngầm không gọi requestAnimationFrame khi chụp).
    # Cửa sổ Chrome trên Windows không hẹp được dưới ~500 px, nên khổ điện thoại dùng trang bọc iframe 390 px rồi cắt.
    os.makedirs(os.path.join(GOC, "tests", "anh"), exist_ok=True)
    for ten, w, h, trang, cat in [("may-tinh", 1280, 900, "index.html?chup", None),
                                  ("dien-thoai", 520, 844, "tests/khung-dien-thoai.html", 390),
                                  ("trang-benh", 1280, 900, "index.html?chup#benh/cum", None),
                                  ("benh-tang-huyet-ap", 1280, 900, "index.html?chup#benh/tang-huyet-ap", None),
                                  ("mo-phong-pho-cau", 1280, 900, "index.html?chup&tua=9#mo-phong/pho-cau-phe-nang", None),
                                  ("mo-phong-trao-doi-khi", 1280, 900, "index.html?chup&tua=8#mo-phong/trao-doi-khi", None),
                                  ("dien-thoai-kinh-hien-vi", 520, 844, "tests/khung-dien-thoai.html?chup&tua=12#mo-phong/trao-doi-khi", 390),
                                  ("mo-phong-tieu-hoa", 1280, 900, "index.html?chup&tua=14#mo-phong/hanh-trinh-thuc-an", None),
                                  ("mo-phong-hap-thu", 1280, 900, "index.html?chup&tua=12#mo-phong/hap-thu-ruot-non", None),
                                  ("dien-thoai-tieu-hoa", 520, 844, "tests/khung-dien-thoai.html?chup&tua=7#mo-phong/hanh-trinh-thuc-an", 390),
                                  ("mo-phong-than", 1280, 900, "index.html?chup&tua=11#mo-phong/loc-mau-o-than", None),
                                  ("dien-thoai-than", 520, 844, "tests/khung-dien-thoai.html?chup&tua=14#mo-phong/loc-mau-o-than", 390),
                                  ("mo-phong-than-kinh", 1280, 900, "index.html?chup&tua=8#mo-phong/dan-truyen-than-kinh", None),
                                  ("dien-thoai-than-kinh", 520, 844, "tests/khung-dien-thoai.html?chup&tua=13#mo-phong/dan-truyen-than-kinh", 390),
                                  ("bo-phan-tui-mat", 1280, 900, "index.html?chup#bo-phan/tui-mat", None),
                                  ("bo-phan-tuyen-uc", 1280, 900, "index.html?chup#bo-phan/tuyen-uc", None),
                                  ("bo-phan-tuy-song", 1280, 900, "index.html?chup#bo-phan/tuy-song", None),
                                  ("benh-dai-thao-duong", 1280, 900, "index.html?chup#benh/dai-thao-duong", None),
                                  ("dien-thoai-benh-trao-nguoc", 520, 844, "tests/khung-dien-thoai.html?chup#benh/trao-nguoc-da-day-thuc-quan", 390),
                                  ("tu-kiem-tra", 1280, 900, "index.html?chup#tu-kiem-tra", None),
                                  ("dien-thoai-tu-kiem-tra", 520, 844, "tests/khung-dien-thoai.html?chup#tu-kiem-tra", 390),
                                  ("benh-dot-quy", 1280, 900, "index.html?chup#benh/dot-quy", None),
                                  ("mo-phong-insulin", 1280, 900, "index.html?chup&tua=13#mo-phong/insulin-duong-mau", None),
                                  ("mo-phong-xo-vua", 1280, 900, "index.html?chup&tua=15#mo-phong/xo-vua-cuc-mau-dong", None),
                                  ("dien-thoai-xo-vua", 520, 844, "tests/khung-dien-thoai.html?chup&tua=9#mo-phong/xo-vua-cuc-mau-dong", 390),
                                  ("mo-phong-loet-da-day", 1280, 900, "index.html?chup&tua=14#mo-phong/loet-da-day", None),
                                  ("dien-thoai-loet-da-day", 520, 844, "tests/khung-dien-thoai.html?chup&tua=18#mo-phong/loet-da-day", 390)]:
        p = os.path.join(GOC, "tests", "anh", f"{ten}.png")
        if os.path.exists(p): os.remove(p)
        chrome(f"--screenshot={p}", f"--window-size={w},{h}", "--timeout=90000", f"{url}/{trang}", cho=0)
        if cat and os.path.exists(p):
            try:
                from PIL import Image
                Image.open(p).crop((0, 0, cat, h)).save(p)
            except ImportError:
                pass
        print("Ảnh:", os.path.relpath(p, GOC), "OK" if os.path.exists(p) else "KHÔNG TẠO ĐƯỢC")
    s.shutdown()
    print("\nKẾT QUẢ:", "ĐẠT" if so_loi == 0 else f"{so_loi} vấn đề")
    return 1 if so_loi else 0

if __name__ == "__main__":
    sys.exit(main())
