// The diagrams show an ideal reversible cycle in a single reference frame.
export function drawPhysics(ctx,{mode,progress,time,width:w,height:h}){
 ctx.clearRect(0,0,w,h);if(w<10||h<10)return;
 ctx.save();
 const C={gold:'#e4c58e',cyan:'#79e0e5',white:'#edf0e9',muted:'#9db1bd'},t=time/1000;
 const font='"Microsoft YaHei","PingFang SC",sans-serif';
 const clamp=x=>Math.max(0,Math.min(1,x));
 const text=(s,x,y,size=16,color=C.muted,align='left')=>{ctx.font=`400 ${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);};
 const line=(x1,y1,x2,y2,color,alpha=1,width=1)=>{ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalAlpha=1;};
 const glow=(x,y,color,r=3)=>{ctx.save();ctx.shadowColor=color;ctx.shadowBlur=18;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();};
 if(mode==='energy'){
  const fs=Math.max(12,Math.min(22,w/28)),left=w*.06,right=w*.94,span=right-left;
  text('K = ½mv²',left,h*.17,Math.min(74,w*.13),C.white);
  text('同一千吨货物 · 同一参考系',left,h*.25,fs*.75);
  const rows=[{y:.43,v:'10 km/s',e:'1389 万度电',k:.01,c:C.cyan},{y:.68,v:'100 km/s',e:'13.9 亿度电',k:1,c:C.gold}];
  const reveal=1-(1-clamp(progress*2))**3;
  for(const row of rows){
   const y=h*row.y; text(row.v,left,y-25,fs,row.c);text(row.e,right,y-25,fs,row.c,'right');
   line(left,y,right,y,'#91b2bd',.18,1);
   const end=left+span*row.k*reveal;
   ctx.save();ctx.shadowColor=row.c;ctx.shadowBlur=14;line(left,y,end,y,row.c,.9,3);ctx.restore();
   glow(end,y,row.c,3.2);
   for(let i=0;i<6;i++){const q=(t*.35+i/6)%1;if(q<reveal&&row.k>.1)glow(left+span*q,y,row.c,1.3);}
  }
  text('v × 10',left,h*.89,fs,C.white);text('K × 100',right,h*.89,fs*1.2,C.gold,'right');
 }else{
  const fs=Math.max(11,Math.min(20,w/35)),ax=w*.13,bx=w*.87,cy=h*.45,r=Math.max(17,Math.min(48,w*.055));
  const bezier=(q,reverse=false)=>{
   const x0=reverse?bx:ax,x3=reverse?ax:bx,x1=reverse?w*.7:w*.3,x2=reverse?w*.3:w*.7,y=reverse?h*.82:h*.08,u=1-q;
   return{x:u*u*u*x0+3*u*u*q*x1+3*u*q*q*x2+q*q*q*x3,y:u*u*u*cy+3*u*u*q*y+3*u*q*q*y+q*q*q*cy};
  };
  for(const [reverse,color] of [[false,C.cyan],[true,C.gold]]){
   ctx.beginPath();for(let i=0;i<=100;i++){const p=bezier(i/100,reverse);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}
   ctx.strokeStyle=color;ctx.lineWidth=1.25;ctx.globalAlpha=.46;ctx.stroke();ctx.globalAlpha=1;
   const q=((t/11+(reverse?.5:0))%1+1)%1;
   for(let k=7;k>=0;k--){const point=bezier(((q-k*.008)%1+1)%1,reverse);ctx.globalAlpha=(1-k/8)*.75;glow(point.x,point.y,color,k?1.3:3.2);}
   ctx.globalAlpha=1;
   const arrow=bezier(.55,reverse),ahead=bezier(.56,reverse),angle=Math.atan2(ahead.y-arrow.y,ahead.x-arrow.x);
   ctx.save();ctx.translate(arrow.x,arrow.y);ctx.rotate(angle);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(0,0);ctx.lineTo(-7,4);ctx.stroke();ctx.restore();
  }
  for(const [x,label] of [[ax,'A'],[bx,'B']]){
   const halo=ctx.createRadialGradient(x,cy,r*.2,x,cy,r*1.8);halo.addColorStop(0,'#77d7e51f');halo.addColorStop(1,'#77d7e500');ctx.fillStyle=halo;ctx.fillRect(x-r*2,cy-r*2,r*4,r*4);
   ctx.strokeStyle='#b1cdd655';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,cy,r,0,Math.PI*2);ctx.stroke();
   text(label,x,cy+fs*.35,fs*1.2,C.white,'center');
  }
  text('A → B',w*.5,h*.14,fs*.9,C.cyan,'center');
  text('B → A',w*.5,h*.83,fs*.9,C.gold,'center');
  text('0',w*.5,h*.5,Math.max(48,Math.min(114,w*.14)),C.white,'center');
  text('理想外部净补能',w*.5,h*.59,fs*.76,C.gold,'center');
  text('出发 −K',ax,h*.65,fs*.78,C.cyan,'center');text('返回 +K',ax,h*.71,fs*.78,C.gold,'center');
  text('抵达 +K',bx,h*.65,fs*.78,C.gold,'center');text('返程 −K',bx,h*.71,fs*.78,C.cyan,'center');
  text('ΔK + ΔU = 0',w*.5,h*.96,fs,C.muted,'center');
 }
 ctx.restore();
}
