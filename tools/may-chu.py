"""Máy chủ tĩnh để chạy thử trên máy, tắt bộ nhớ đệm để sửa file là thấy ngay.
Cách chạy (trong thư mục dự án):  py tools/may-chu.py [cổng]   rồi mở http://localhost:8765
"""
import functools, http.server, os, sys

class KhongDem(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

cong = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
goc = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print(f"Mở http://localhost:{cong}  (Ctrl+C để dừng)")
http.server.ThreadingHTTPServer(("127.0.0.1", cong), functools.partial(KhongDem, directory=goc)).serve_forever()
