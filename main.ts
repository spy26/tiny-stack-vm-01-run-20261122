// Tiny stack VM, written fresh from the kit ISA spec. One run answers every
// instance in MAKEFUN_INPUT_DIR (default /input), writing answers to
// MAKEFUN_OUTPUT_DIR (default /output) as <id>/stdout.bin + <id>/exit.txt.
import{readdirSync as A,readFileSync as B,mkdirSync as C,writeFileSync as D}from'node:fs';
import{join as J}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR||'/input',O=process.env.MAKEFUN_OUTPUT_DIR||'/output';
const T={16:(a,b)=>(a+b)|0,17:(a,b)=>(a-b)|0,18:Math.imul,24:(a,b)=>a&b,25:(a,b)=>a|b,26:(a,b)=>a^b,32:(a,b)=>a===b?1:0,33:(a,b)=>a<b?1:0,34:(a,b)=>(a>>>0)<(b>>>0)?1:0};
function R(p,g){
const s=new Int32Array(256),c=new Int32Array(64),m=new Int32Array(256),o=Buffer.alloc(65536);
let sp=0,cp=0,pc=0,n=0,ip=0,ol=0;
const e=t=>({out:o.subarray(0,ol),exit:t});
for(;;){
if(n===1e6)return e(10);
if(pc<0||pc>=p.length)return e(9);
const q=p[pc];n++;
if(q===0)return e(0);
if(q===1){if(pc+2>p.length)return e(9);if(sp===256)return e(3);s[sp++]=(p[pc+1]<<24)>>24;pc+=2;continue;}
if(q===2){if(pc+5>p.length)return e(9);if(sp===256)return e(3);s[sp++]=p[pc+1]|p[pc+2]<<8|p[pc+3]<<16|p[pc+4]<<24;pc+=5;continue;}
if(q===3){if(sp<1)return e(2);sp--;pc++;continue;}
if(q===4){if(sp<1)return e(2);if(sp===256)return e(3);s[sp]=s[sp-1];sp++;pc++;continue;}
if(q===5){if(sp<2)return e(2);const t=s[sp-1];s[sp-1]=s[sp-2];s[sp-2]=t;pc++;continue;}
if(q===6){if(sp<2)return e(2);if(sp===256)return e(3);s[sp]=s[sp-2];sp++;pc++;continue;}
if(q===7){if(sp<3)return e(2);const t=s[sp-3];s[sp-3]=s[sp-2];s[sp-2]=s[sp-1];s[sp-1]=t;pc++;continue;}
if(q===0x17||q===0x1b){if(sp<1)return e(2);s[sp-1]=q===0x17?(-s[sp-1])|0:~s[sp-1];pc++;continue;}
if(q>=0x1c&&q<=0x1e){if(sp<2)return e(2);const b=s[--sp],a=s[sp-1];s[sp-1]=q===0x1c?a<<(b&31):q===0x1d?a>>(b&31):(a>>>(b&31))|0;pc++;continue;}
if(q===0x10||q===0x11||q===0x12||q===0x18||q===0x19||q===0x1a||q>=0x20&&q<=0x22){if(sp<2)return e(2);const b=s[sp-1],a=s[sp-2];sp--;s[sp-1]=T[q](a,b);pc++;continue;}
if(q>=0x13&&q<=0x16){if(sp<2)return e(2);const b=s[sp-1],a=s[sp-2];if(!b)return e(4);let r;if(q===0x13)r=Math.trunc(a/b)|0;else if(q===0x14)r=(a%b)|0;else if(q===0x15)r=Math.trunc((a>>>0)/(b>>>0))|0;else r=((a>>>0)%(b>>>0))|0;sp--;s[sp-1]=r;pc++;continue;}
if(q===0x30){if(pc+3>p.length)return e(9);let f=p[pc+1]|p[pc+2]<<8;if(f>=0x8000)f-=0x10000;pc=pc+3+f;continue;}
if(q===0x31||q===0x32){if(pc+3>p.length)return e(9);if(sp<1)return e(2);let f=p[pc+1]|p[pc+2]<<8;if(f>=0x8000)f-=0x10000;const v=s[--sp];if(q===0x31?v===0:v!==0)pc=pc+3+f;else pc+=3;continue;}
if(q===0x33){if(pc+3>p.length)return e(9);if(cp===64)return e(7);c[cp++]=pc+3;pc=p[pc+1]|p[pc+2]<<8;continue;}
if(q===0x34){if(!cp)return e(8);pc=c[--cp];continue;}
if(q===0x40){if(sp<1)return e(2);const a=s[sp-1];if(a<0||a>255)return e(6);s[sp-1]=m[a];pc++;continue;}
if(q===0x41){if(sp<2)return e(2);const a=s[sp-1],v=s[sp-2];if(a<0||a>255)return e(6);m[a]=v;sp-=2;pc++;continue;}
if(q===0x50){if(sp<1)return e(2);const t=String(s[--sp]);if(ol+t.length>65536)return e(11);for(let i=0;i<t.length;i++)o[ol++]=t.charCodeAt(i);pc++;continue;}
if(q===0x51){if(sp<1)return e(2);if(ol+1>65536)return e(11);o[ol++]=s[--sp]&255;pc++;continue;}
if(q===0x52){if(sp===256)return e(3);s[sp++]=ip<g.length?g[ip++]:-1;pc++;continue;}
if(q===0x53){if(sp<1)return e(2);return e(s[--sp]&255);}
return e(5);
}
}
for(const d of A(I,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort()){
const p=B(J(I,d,'program.bin'));let g;try{g=B(J(I,d,'input.bin'))}catch{g=Buffer.alloc(0)}
const r=R(p,g),o=J(O,d);C(o,{recursive:true});D(J(o,'stdout.bin'),r.out);D(J(o,'exit.txt'),String(r.exit));
}
