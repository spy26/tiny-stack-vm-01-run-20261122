import {readdirSync, readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const IN = process.env.MAKEFUN_INPUT_DIR || '/input';
const OUT = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// One tiny-stack program: returns [stdout bytes, exit code].
function run(p: Uint8Array, inp: Uint8Array): [Buffer, number] {
  const s = new Int32Array(256); // data stack
  let sp = 0;
  const c = new Int32Array(64); // call stack
  let cp = 0;
  const m = new Int32Array(256); // memory
  const o: number[] = []; // output bytes
  const n = p.length;
  let pc = 0, steps = 0, ip = 0, code = 0;
  outer: while (true) {
    if (steps >= 1000000) { code = 10; break; }
    if (pc < 0 || pc >= n) { code = 9; break; }
    const op = p[pc];
    const ok = op <= 7 || (op >= 16 && op <= 30) || (op >= 32 && op <= 34) || (op >= 48 && op <= 52) || (op >= 64 && op <= 65) || (op >= 80 && op <= 83);
    if (!ok) { code = 5; break; }
    const il = op === 1 ? 1 : op === 2 ? 4 : op >= 48 && op <= 51 ? 2 : 0;
    if (pc + 1 + il > n) { code = 9; break; }
    steps++;
    let np = pc + 1 + il;
    let a: number, b: number;
    switch (op) {
      case 0: return [Buffer.from(o), 0];
      case 1:
        if (sp >= 256) { code = 3; break outer; }
        s[sp++] = (p[pc + 1] << 24) >> 24; break;
      case 2:
        if (sp >= 256) { code = 3; break outer; }
        s[sp++] = p[pc + 1] | (p[pc + 2] << 8) | (p[pc + 3] << 16) | (p[pc + 4] << 24); break;
      case 3:
        if (sp < 1) { code = 2; break outer; }
        sp--; break;
      case 4:
        if (sp < 1) { code = 2; break outer; }
        if (sp >= 256) { code = 3; break outer; }
        s[sp] = s[sp - 1]; sp++; break;
      case 5:
        if (sp < 2) { code = 2; break outer; }
        a = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = a; break;
      case 6:
        if (sp < 2) { code = 2; break outer; }
        if (sp >= 256) { code = 3; break outer; }
        s[sp] = s[sp - 2]; sp++; break;
      case 7:
        if (sp < 3) { code = 2; break outer; }
        a = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = a; break;
      case 16:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = (s[sp - 1] + b) | 0; break;
      case 17:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = (s[sp - 1] - b) | 0; break;
      case 18:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = Math.imul(s[sp - 1], b); break;
      case 19:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp];
        if (b === 0) { code = 4; break outer; }
        s[sp - 1] = (s[sp - 1] / b) | 0; break;
      case 20:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp];
        if (b === 0) { code = 4; break outer; }
        s[sp - 1] = (s[sp - 1] % b) | 0; break;
      case 21:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp];
        if (b === 0) { code = 4; break outer; }
        s[sp - 1] = ((s[sp - 1] >>> 0) / (b >>> 0)) | 0; break;
      case 22:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp];
        if (b === 0) { code = 4; break outer; }
        s[sp - 1] = ((s[sp - 1] >>> 0) % (b >>> 0)) | 0; break;
      case 23:
        if (sp < 1) { code = 2; break outer; }
        s[sp - 1] = (-s[sp - 1]) | 0; break;
      case 24:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] & b; break;
      case 25:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] | b; break;
      case 26:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] ^ b; break;
      case 27:
        if (sp < 1) { code = 2; break outer; }
        s[sp - 1] = ~s[sp - 1]; break;
      case 28:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] << (b & 31); break;
      case 29:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] >> (b & 31); break;
      case 30:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = (s[sp - 1] >>> (b & 31)) | 0; break;
      case 32:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] === b ? 1 : 0; break;
      case 33:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = s[sp - 1] < b ? 1 : 0; break;
      case 34:
        if (sp < 2) { code = 2; break outer; }
        b = s[--sp]; s[sp - 1] = (s[sp - 1] >>> 0) < (b >>> 0) ? 1 : 0; break;
      case 48: np += ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16; break;
      case 49:
        if (sp < 1) { code = 2; break outer; }
        if (s[--sp] === 0) np += ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16; break;
      case 50:
        if (sp < 1) { code = 2; break outer; }
        if (s[--sp] !== 0) np += ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16; break;
      case 51:
        if (cp >= 64) { code = 7; break outer; }
        c[cp++] = np; np = p[pc + 1] | (p[pc + 2] << 8); break;
      case 52:
        if (cp === 0) { code = 8; break outer; }
        np = c[--cp]; break;
      case 64:
        if (sp < 1) { code = 2; break outer; }
        a = s[sp - 1];
        if (a < 0 || a > 255) { code = 6; break outer; }
        s[sp - 1] = m[a]; break;
      case 65:
        if (sp < 2) { code = 2; break outer; }
        a = s[sp - 1]; b = s[sp - 2];
        if (a < 0 || a > 255) { code = 6; break outer; }
        m[a] = b; sp -= 2; break;
      case 80: {
        if (sp < 1) { code = 2; break outer; }
        const t = String(s[sp - 1]);
        if (o.length + t.length > 65536) { code = 11; break outer; }
        sp--;
        for (let i = 0; i < t.length; i++) o.push(t.charCodeAt(i));
        break;
      }
      case 81:
        if (sp < 1) { code = 2; break outer; }
        if (o.length + 1 > 65536) { code = 11; break outer; }
        o.push(s[--sp] & 255); break;
      case 82:
        if (sp >= 256) { code = 3; break outer; }
        s[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 83:
        if (sp < 1) { code = 2; break outer; }
        return [Buffer.from(o), s[--sp] & 255];
    }
    pc = np;
  }
  return [Buffer.from(o), code];
}

for (const id of readdirSync(IN)) {
  const d = join(IN, id);
  let prog: Buffer;
  try { prog = readFileSync(join(d, 'program.bin')); } catch { continue; }
  let inp: Buffer;
  try { inp = readFileSync(join(d, 'input.bin')); } catch { inp = Buffer.alloc(0); }
  const [out, code] = run(prog, inp);
  mkdirSync(join(OUT, id), {recursive: true});
  writeFileSync(join(OUT, id, 'stdout.bin'), out);
  writeFileSync(join(OUT, id, 'exit.txt'), String(code));
}
