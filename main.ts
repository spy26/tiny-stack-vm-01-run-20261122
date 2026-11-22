// Tiny stack VM, golfed: same ISA as V1, minimal size. V2 winner — 37 opcodes.
// Table: opcodes in O (hex, in order); A/B/C give [imm, pops, pushes] per opcode.
// 37 entries — do not drop the last one (0x53 EXIT).
import{mkdirSync as M,readdirSync as R,readFileSync as F,writeFileSync as W}from"node:fs";
const O="0001020304050607101112131415161718191a1b1c1d1e2021223031323334404150515253",A="0140000000000000000000000022220000000",B="0001122322222221222122222201100121101",C="0110223311111111111111111100000100100",T=[];
for(let i=0;i<37;i++)T[parseInt(O.slice(i*2,i*2+2),16)]=[+A[i],+B[i],+C[i]];
function X(p,q){
let n=p.length,D=new Int32Array(256),s=0,G=new Int32Array(64),g=0,M=new Int32Array(256),o=new Uint8Array(65536),l=0,f=0,c=0,t=0;
const E=x=>({u:o.slice(0,l),e:x});
for(;;){
if(t==1e6)return E(10);
if(c<0||c>=n)return E(9);
let h=p[c],k=T[h];
if(!k)return E(5);
if(c+k[0]>=n)return E(9);
t++;
let y=c+1+k[0];
if(s<k[1])return E(2);
if(s-k[1]+k[2]>256)return E(3);
c=y;
if(h==0)return E(0);
else if(h==1)D[s++]=(p[y-1]<<24)>>24;
else if(h==2)D[s++]=p[y-4]|p[y-3]<<8|p[y-2]<<16|p[y-1]<<24;
else if(h==3)s--;
else if(h==4){D[s]=D[s-1];s++}
else if(h==5){let z=D[s-1];D[s-1]=D[s-2];D[s-2]=z}
else if(h==6){D[s]=D[s-2];s++}
else if(h==7){let z=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=z}
else if(h==23)D[s-1]=-D[s-1]|0;
else if(h==27)D[s-1]=~D[s-1];
else if(h>=16&&h<35){
let b=D[s-1],a=D[s-2],r;
if(h<19)r=h==16?a+b|0:h==17?a-b|0:Math.imul(a,b);
else if(h==19){if(!b)return E(4);r=a==-2147483648&&b==-1?a:a/b|0}
else if(h==20){if(!b)return E(4);r=b==-1?0:a%b|0}
else if(h==21){if(!b)return E(4);r=Math.floor((a>>>0)/(b>>>0))|0}
else if(h==22){if(!b)return E(4);r=(a>>>0)%(b>>>0)|0}
else if(h==24)r=a&b;
else if(h==25)r=a|b;
else if(h==26)r=a^b;
else if(h==28)r=a<<(b&31);
else if(h==29)r=a>>(b&31);
else if(h==30)r=a>>>(b&31)|0;
else if(h==32)r=a==b?1:0;
else if(h==33)r=a<b?1:0;
else r=(a>>>0)<(b>>>0)?1:0;
s-=2;D[s++]=r;
}
else if(h<53){
if(h<51){
let v=((p[y-2]|p[y-1]<<8)<<16)>>16,w=1;
if(h>48){let u=D[--s];w=h==49?u==0:u!=0}
if(w)c=y+v;
}else if(h==51){
if(g==64)return E(7);
G[g++]=y;c=p[y-2]|p[y-1]<<8;
}else{
if(!g)return E(8);
c=G[--g];
}
}
else if(h==64){let a=D[s-1];if(a<0||a>255)return E(6);D[s-1]=M[a]}
else if(h==65){let a=D[s-1];if(a<0||a>255)return E(6);M[a]=D[s-2];s-=2}
else if(h==80){let v=String(D[s-1]);if(l+v.length>65536)return E(11);s--;for(let i=0;i<v.length;)o[l++]=v.charCodeAt(i++)}
else if(h==81){if(l>=65536)return E(11);o[l++]=D[--s]&255}
else if(h==82)D[s++]=f<q.length?q[f++]:-1;
else return E(D[--s]&255);
}
}
let I=process.env.MAKEFUN_INPUT_DIR||"/input",Q=process.env.MAKEFUN_OUTPUT_DIR||"/output";
for(let d of R(I).sort()){let r=X(F(I+"/"+d+"/program.bin"),F(I+"/"+d+"/input.bin"));M(Q+"/"+d,{recursive:true});W(Q+"/"+d+"/stdout.bin",r.u);W(Q+"/"+d+"/exit.txt",r.e+"\n")}
