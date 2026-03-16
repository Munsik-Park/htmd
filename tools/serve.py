#!/usr/bin/env python3
"""Local server for previewing .htmd files with correct Content-Type."""

import http.server
import os
import sys


class HTMDHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.endswith(".htmd"):
            return "text/html; charset=utf-8"
        return super().guess_type(path)

    def log_message(self, format, *args):
        print(f"  {self.address_string()} - {format % args}")


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(root)

    with http.server.HTTPServer(("", port), HTMDHandler) as server:
        print(f"HTMD server running at http://localhost:{port}")
        print(f"Serving files from: {root}")
        print("Press Ctrl+C to stop.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
