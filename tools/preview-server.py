#!/usr/bin/env python3
"""Lokaler Preview-Server für Reina mit No-Cache-Headern."""
import http.server
import socketserver
import functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Ruhiger: nur Fehler
        if args and isinstance(args[1], str) and args[1].startswith(('4', '5')):
            super().log_message(format, *args)

if __name__ == '__main__':
    PORT = 8917
    Handler = functools.partial(NoCacheHandler, directory='/home/elioxx/DemoWeb/2026/Reina')
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Serving on 0.0.0.0:{PORT} (no-cache)')
        httpd.serve_forever()
