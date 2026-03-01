/**
 * Amsilati App Server
 * - Serves static files
 * - Proxies Google Drive PDF (bypasses CORS)
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DRIVE_FILE_ID = '1N4v_-rJgCGFJ9Ldj9IjEZsoQfzhu8DC0';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

/**
 * Follow redirects and fetch from HTTPS URL.
 * Google Drive uses multiple redirects for download URLs.
 */
function fetchWithRedirects(url, callback, maxRedirects = 5) {
    if (maxRedirects <= 0) {
        callback(new Error('Too many redirects'));
        return;
    }

    https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            // Follow redirect
            fetchWithRedirects(res.headers.location, callback, maxRedirects - 1);
            res.resume(); // Consume response to free memory
        } else if (res.statusCode === 200) {
            callback(null, res);
        } else {
            callback(new Error(`HTTP ${res.statusCode}`));
            res.resume();
        }
    }).on('error', callback);
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // ─── API: Proxy Google Drive PDF ───────────
    // The app fetches from this endpoint to get the latest PDF.
    // Server-side fetch = no CORS issues.
    if (pathname === '/api/hafalan.pdf') {
        const driveUrl = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;

        fetchWithRedirects(driveUrl, (err, driveRes) => {
            if (err) {
                console.error('Drive proxy error:', err.message);
                // Fallback: serve local file
                const localPath = path.join(__dirname, 'assets', 'hafalan.pdf');
                if (fs.existsSync(localPath)) {
                    res.writeHead(200, { 'Content-Type': 'application/pdf' });
                    fs.createReadStream(localPath).pipe(res);
                } else {
                    res.writeHead(502, { 'Content-Type': 'text/plain' });
                    res.end('Failed to fetch PDF');
                }
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Cache-Control': 'no-cache',
            });
            driveRes.pipe(res);
        });
        return;
    }

    // ─── Static File Serving ──────────────────
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, decodeURIComponent(filePath));

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // SPA fallback: serve index.html for non-file routes
            const indexPath = path.join(__dirname, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                fs.createReadStream(indexPath).pipe(res);
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n  Amsilati App Server running at:\n`);
    console.log(`  > Local:   http://localhost:${PORT}`);
    console.log(`  > PDF API: http://localhost:${PORT}/api/hafalan.pdf`);
    console.log(`\n  Drive File ID: ${DRIVE_FILE_ID}\n`);
});
