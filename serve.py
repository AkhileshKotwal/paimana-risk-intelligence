"""
PAIMANA Prototype — Standalone Zero-Dependency Local Web Server
Runs without npx, Node.js, or external API dependencies.
"""
import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST_DIR = ROOT / "frontend" / "dist"
PORT = 3000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        # Fallback to index.html for Single Page Application routing if file not found
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not self.path.startswith("/api"):
            self.path = "/index.html"
        return super().do_GET()

def run_server():
    if not DIST_DIR.exists() or not (DIST_DIR / "index.html").exists():
        print(f"Error: Build directory '{DIST_DIR}' not found.", file=sys.stderr)
        print("Please ensure the production build has been generated.", file=sys.stderr)
        sys.exit(1)

    # Enable port address reuse so restarts are immediate
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 70, flush=True)
            print("  PAIMANA — Predictive Infrastructure Monitoring & Early Warning System", flush=True)
            print("  Smart India Hackathon (SIH 2026) · Problem Statement 26103", flush=True)
            print("=" * 70, flush=True)
            print(f"\n>>> Web Application running at: {url}", flush=True)
            print(">>> Serving pre-built production prototype (Zero-Dependency)", flush=True)
            print(">>> No npx or external APIs required", flush=True)
            print(">>> Press Ctrl+C to stop the server\n", flush=True)
            
            # Automatically open browser if interactive
            try:
                webbrowser.open(url)
            except Exception:
                pass

            httpd.serve_forever()
    except OSError as e:
        if e.errno == 10048 or "Address already in use" in str(e):
            print(f"\nPort {PORT} is already active and serving the application.", flush=True)
            print(f"You can open the prototype directly in your browser at: http://localhost:{PORT}", flush=True)
        else:
            raise

if __name__ == "__main__":
    run_server()
