import fs from 'fs';
import path from 'path';

// Read the WebAssembly file and encode it as Base64
const wasmPath = path.join(process.cwd(), 'node_modules', 'tiktoken', 'tiktoken_bg.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);
export const tiktokenWasmBase64 = wasmBuffer.toString('base64');