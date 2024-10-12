const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname === '/tiktoken_bg.wasm') {
      const wasmPath = path.join(__dirname, 'public', 'tiktoken_bg.wasm');
      const wasmFile = fs.readFileSync(wasmPath);
      res.setHeader('Content-Type', 'application/wasm');
      res.setHeader('Content-Length', wasmFile.length);
      res.end(wasmFile);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});