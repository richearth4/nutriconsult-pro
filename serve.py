import http.server
import socketserver
import os

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Allow Cross-Origin Requests for local testing
class MyHTTPRequestHandler(Handler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

print(f"Serving NutriConsult Pro at http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
