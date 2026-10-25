(()=>{'use strict';
const $=id=>document.getElementById(id),clamp=n=>Math.max(0,Math.min(1,n)),lerp=(a,b,p)=>a+(b-a)*p;
const embedded=new URLSearchParams(location.search).get('embed')==='1';document.body.classList.toggle('embedded',embedded);
const K=0.5*1000*(10100**2-10000**2)/3600000,DURATION=28;
let t=0,playing=!embedded,mode='sync',eta=1,mass=1,last=0,lastPhase=-1,g,svg;
const fmt=(n,d=1)=>n.toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
const texts=[['两班货舱从相反方向进入同一速度段。','两舱含载荷的移动总质量各{m}吨。出发舱以10.0 km/s进入，到达舱从相反方向以10.1 km/s进入。'],['回收抵达时的动能，为出发货舱加速。','到达舱减速发电，电能经过本站母线，驱动电磁设备为出发货舱加速。'],['货舱继续前进，回收的能量已经用于下一班。','出发舱已加速至10.1 km/s，到达舱已减速至10.0 km/s。两班货舱通过同一个速度段，动能一增一减。'],['长期往返运输，必然要把能量回收再用。','等质量、同速度段、理想回收100%：加速需要{e} kWh，减速回收{e} kWh，净外补为0。']];
function state(){const startOut=mode==='sync'?4:11,dur=mode==='sync'?14:7,qi=clamp((t-4)/dur),qo=clamp((t-startOut)/dur),need=K*mass*qo,recovered=K*mass*eta*qi,grid=Math.max(0,need-recovered),stored=Math.max(0,recovered-need);return{time:t,playing,mode,eta,mass,incomingProgress:qi,outgoingProgress:qo,incomingSpeed:Math.sqrt(10100**2-(10100**2-10000**2)*qi)/1000,outgoingSpeed:Math.sqrt(10000**2+(10100**2-10000**2)*qo)/1000,need,recovered,grid,stored,loss:K*mass*qi*(1-eta),fullEnergy:K*mass};}
function renderSvg(){
const narrow=$('rail-diagram').clientWidth<650,compact=narrow&&embedded&&innerHeight<560,w=narrow?640:1100,h=compact?430:narrow?600:430,top=compact?104:narrow?136:112,bot=compact?306:narrow?446:318,mid=(top+bot)/2,x0=narrow?177:330,x1=narrow?463:770,c=w/2,bw=narrow?282:312,bh=compact?72:narrow?102:84,fs=compact?25:narrow?20:19;
const count=narrow?7:9,cyan='#79e9ed',gold='#f1c77e';
g={narrow,compact,w,h,top,bot,mid,x0,x1,c,bw,bh,count};
const beam=(y)=>{
 const ties=Array.from({length:narrow?12:23},(_,i)=>{const x=31+i*(w-67)/(narrow?11:22);return `<path d="M${x} ${y-13}l12-6v36l-12 6Z" fill="url(#belt-tie)" stroke="#79909d" stroke-opacity=".28" stroke-width=".6"/><path d="M${x+1} ${y+21}h12" stroke="#9ab0ba" stroke-opacity=".24"/>`;}).join('');
 return `<g><path d="M25 ${y-15}H${w-41}l15 8H40Z" fill="url(#belt-rail-top)"/><path d="M25 ${y-15}l15 8v7L25 ${y-7}Z" fill="#263d4c"/><path d="M40 ${y-7}H${w-26}v7H40Z" fill="url(#belt-rail)"/>${ties}<path d="M25 ${y+11}H${w-41}l15 8H40Z" fill="url(#belt-rail-top)" stroke="#869aa6" stroke-opacity=".35" stroke-width=".65"/><path d="M40 ${y+19}H${w-26}v9H40Z" fill="url(#belt-rail)"/><path d="M25 ${y+11}l15 8v9L25 ${y+20}Z" fill="#263c4b"/><path d="M40 ${y+20}H${w-27}" stroke="#b3c4cc" stroke-opacity=".32" stroke-width=".8"/><path d="M41 ${y-6}H${w-29}" stroke="#658b9f" stroke-opacity=".55" stroke-width=".9"/></g>`;
};
// Every coil has a rear and a near-facing half. The cargo travels between
// these two SVG layers, so it passes through the aperture instead of across it.
const coils=(id,y,col,front=false)=>Array.from({length:count},(_,i)=>{
 const x=x0+(x1-x0)*i/(count-1);
 const arc=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}A${rx} ${ry} 0 0 ${front?0:1} ${cx+rx} ${cy}`;
 return `<g id="${id}-coil-${i}${front?'-front':''}" data-coil="${id}" data-x="${x}" class="${front?'coil-front':'coil-rear'}">
 ${front?'':`<path d="M${x-16} ${y+28}l10-7h27l9 7v13h-46Z" fill="url(#belt-pedestal)" stroke="#617887" stroke-opacity=".5" stroke-width=".8"/><path d="M${x-16} ${y+33}h46v8h-46Z" fill="#0c1d2a"/><path d="M${x-13} ${y+34}h40" stroke="#8499a4" stroke-opacity=".26"/>`}
 <path d="${arc(x+6,y-5,13,31)}" fill="none" stroke="#132937" stroke-width="10"/>
 <path d="${arc(x,y,13,31)}" fill="none" stroke="url(#belt-coil-metal)" stroke-width="8"/>
 <path d="${arc(x,y,15.8,33.8)}" fill="none" stroke="#b8cbd4" stroke-opacity="${front?'.32':'.6'}" stroke-width=".85"/>
 <path class="coil-lamp" d="${arc(x,y,9.5,26.5)}" fill="none" stroke="${col}" stroke-width="1.5" opacity=".13"/>
 <path class="coil-aura" d="${arc(x,y,10,27)}" fill="none" stroke="${col}" stroke-width="3" filter="url(#belt-glow)" opacity="0"/>
 <path d="M${x-3} ${front?y+34:y-34}h7" stroke="#c8d7dd" stroke-opacity=".65" stroke-width="1.5"/>
 ${front?`<circle cx="${x+17}" cy="${y+34}" r="1.7" fill="${col}" opacity=".4"/>`:''}
 </g>`;
}).join('');
const car=(id,col)=>`<g id="${id}-car"><g id="${id}-hull"${id==='in'?' transform="scale(-1,1)"':''}>
 <g id="${id}-trail" opacity=".3"><ellipse cx="0" cy="19" rx="43" ry="2.5" fill="${col}" opacity=".3" filter="url(#belt-glow)"/><path d="M-39 18H27" stroke="${col}" stroke-width=".7" opacity=".42"/></g>
 <ellipse cx="1" cy="19" rx="53" ry="5" fill="#01070c" opacity=".6"/>
 <path d="M-46 10H28L47 0 49 8 31 20H-44Z" fill="#142a38" stroke="#4b6577" stroke-width=".75"/>
 <path d="M-46-10L-34-19H36L55-8 46 0 28-10Z" fill="url(#belt-cargo-top)" stroke="#d1dce0" stroke-opacity=".75" stroke-width=".8"/>
 <path d="M-46-10H28L46 0 28 12H-46Z" fill="url(#belt-cargo-side)" stroke="#90a8b6" stroke-width="1"/>
 <path d="M28-10L46 0 55-8 36-19Z" fill="url(#belt-nose)" stroke="#9db2bd" stroke-opacity=".6" stroke-width=".7"/>
 <path d="M-38-10v22m12-22v22m13-22v22m13-22v22m13-22v22" stroke="#132b3b" stroke-opacity=".55" stroke-width="1.2"/>
 <path d="M-34-17H33M-42-8H25L40 0M-41 14H26" stroke="#eff8fa" stroke-opacity=".38" stroke-width=".75" fill="none"/>
 <path d="M-39 8H26L37 1" fill="none" stroke="${col}" stroke-width="2"/>
 <path d="M-39 8H26L37 1" fill="none" stroke="${col}" stroke-width="5" opacity=".36" filter="url(#belt-glow)"/>
 <path d="M-46-7v15" stroke="#d5e4e9" stroke-width="2" opacity=".75"/>
 <path d="M40-3l6 3-6 3" fill="${col}" opacity=".9"/>
 ${[-29,-11,7,25].map(x=>`<circle cx="${x}" cy="-15" r="1.1" fill="#e2ecef" opacity=".7"/>`).join('')}
 </g><text y="${id==='in'?58:-43}" text-anchor="middle" fill="${col}" font-size="${fs+1}" class="svg-number" id="${id}-speed" stroke="#030c13" stroke-width="3" paint-order="stroke">10.000 km/s</text><text x="-3" y="5" text-anchor="middle" fill="#ecf4f6" font-size="${narrow?17:16}" id="${id}-mass" stroke="#163040" stroke-width="2" paint-order="stroke">${mass}吨</text></g>`;
const nearRail=y=>`<g class="near-rail"><path d="M25 ${y+11}H${w-41}l15 8H40Z" fill="url(#belt-rail-top)" stroke="#869aa6" stroke-opacity=".35" stroke-width=".65"/><path d="M40 ${y+19}H${w-26}v9H40Z" fill="url(#belt-rail)"/><path d="M40 ${y+20}H${w-27}" stroke="#b3c4cc" stroke-opacity=".32" stroke-width=".8"/></g>`;
const left=c-bw/2,right=c+bw/2,faceTop=mid-bh/2,faceBottom=mid+bh/2,outEnd=top+31,inStart=bot-34;
const body=`M${left+8} ${faceTop}H${right-8}l8 8V${faceBottom-8}l-8 8H${left+8}l-8-8V${faceTop+8}Z`;
const pulse=(id,col)=>`<g id="${id}" opacity="0"><circle r="9" fill="${col}" opacity=".18" filter="url(#belt-glow)"/><circle r="3.3" fill="${col}"/><circle r="1.2" fill="#f9ffff"/></g>`;
svg=$('rail-diagram');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
svg.innerHTML=`<defs>
 <linearGradient id="belt-rail-top" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a2b3bd"/><stop offset=".27" stop-color="#4a6475"/><stop offset=".62" stop-color="#203849"/><stop offset="1" stop-color="#7b94a1"/></linearGradient>
 <linearGradient id="belt-rail" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3e5869"/><stop offset=".4" stop-color="#122837"/><stop offset="1" stop-color="#071824"/></linearGradient>
 <linearGradient id="belt-tie" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#142d3c"/><stop offset=".45" stop-color="#5d7584"/><stop offset=".7" stop-color="#203b4d"/><stop offset="1" stop-color="#102532"/></linearGradient>
 <linearGradient id="belt-pedestal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#718692"/><stop offset=".35" stop-color="#324d60"/><stop offset="1" stop-color="#102532"/></linearGradient>
 <linearGradient id="belt-coil-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d3dde1"/><stop offset=".22" stop-color="#637d8e"/><stop offset=".48" stop-color="#243d4f"/><stop offset=".72" stop-color="#8198a5"/><stop offset="1" stop-color="#183041"/></linearGradient>
 <linearGradient id="belt-cargo-top" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#cbd9de"/><stop offset=".4" stop-color="#8aa3b0"/><stop offset="1" stop-color="#425f72"/></linearGradient>
 <linearGradient id="belt-cargo-side" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7b9baa"/><stop offset=".4" stop-color="#3b5c72"/><stop offset="1" stop-color="#192f41"/></linearGradient>
 <linearGradient id="belt-nose"><stop stop-color="#819ba9"/><stop offset="1" stop-color="#d4e1e6"/></linearGradient>
 <linearGradient id="belt-trail-out" x1="1" y1="0" x2="0" y2="0"><stop stop-color="${cyan}" stop-opacity=".65"/><stop offset="1" stop-color="${cyan}" stop-opacity="0"/></linearGradient>
 <linearGradient id="belt-trail-in" x1="1" y1="0" x2="0" y2="0"><stop stop-color="${gold}" stop-opacity=".65"/><stop offset="1" stop-color="${gold}" stop-opacity="0"/></linearGradient>
 <linearGradient id="belt-power-face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#294354"/><stop offset=".38" stop-color="#0c202e"/><stop offset="1" stop-color="#132f40"/></linearGradient>
 <linearGradient id="belt-storage"><stop stop-color="#a6e2e3"/><stop offset="1" stop-color="${gold}"/></linearGradient>
 <filter id="belt-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="belt-soft" x="-40%" y="-150%" width="180%" height="400%"><feGaussianBlur stdDeviation="5"/></filter>
 <clipPath id="belt-stage-clip"><rect width="${w}" height="${h}"/></clipPath>
 <marker id="energy-gold" markerWidth="6" markerHeight="6" refX="4.7" refY="3" orient="auto"><path d="M0 0L6 3 0 6Z" fill="${gold}"/></marker>
 <marker id="energy-cyan" markerWidth="6" markerHeight="6" refX="4.7" refY="3" orient="auto"><path d="M0 0L6 3 0 6Z" fill="${cyan}"/></marker>
 </defs>
 <g clip-path="url(#belt-stage-clip)">
 <g opacity=".5"><path d="M${x0-30} ${top+44}H${x1+35}M${x0-30} ${bot+44}H${x1+35}" stroke="#4b6577" stroke-width="6"/><path d="M${x0-30} ${top+47}H${x1+35}M${x0-30} ${bot+47}H${x1+35}" stroke="#0b1e2b" stroke-width="5"/></g>
 ${beam(top)}${beam(bot)}${coils('out',top,cyan)}${coils('in',bot,gold)}
 <path d="M${c} ${inStart}V${faceBottom+12}" stroke="#0c1b26" stroke-width="13" fill="none"/><path d="M${c} ${inStart}V${faceBottom+12}" stroke="#76828a" stroke-opacity=".35" stroke-width="9" fill="none"/>
 <path d="M${c} ${faceTop-12}V${outEnd}" stroke="#0c1b26" stroke-width="13" fill="none"/><path d="M${c} ${faceTop-12}V${outEnd}" stroke="#5e899d" stroke-opacity=".38" stroke-width="9" fill="none"/>
 <path id="incoming-flow" d="M${c} ${inStart}V${faceBottom+12}" stroke="${gold}" stroke-width="2.6" fill="none" marker-end="url(#energy-gold)" opacity=".8"/>
 <path id="outgoing-flow" d="M${c} ${faceTop-12}V${outEnd}" stroke="${cyan}" stroke-width="2.6" fill="none" marker-end="url(#energy-cyan)" opacity=".8"/>
 <path d="M${left+8} ${faceTop}l12-12H${right-2}l10 12Z" fill="url(#belt-rail-top)" stroke="#8ea7b5" stroke-opacity=".5" stroke-width=".7"/>
 <path d="M${right} ${faceTop+6}l10 10V${faceBottom+6}l-10-6Z" fill="#172e3d" stroke="#5e7787" stroke-opacity=".55" stroke-width=".7"/>
 ${Array.from({length:narrow?11:13},(_,i)=>`<path d="M${left+16+i*(bw-32)/(narrow?10:12)} ${faceBottom+1}v11h5V${faceBottom+1}" stroke="#4c6678" stroke-opacity=".7" fill="#172e3d" stroke-width="1"/>`).join('')}
 <path id="bus-halo" d="${body}" fill="none" stroke="${cyan}" stroke-width="5" filter="url(#belt-glow)" opacity=".05"/>
 <path d="${body}" fill="url(#belt-power-face)" stroke="#97adba" stroke-width="1.1"/>
 <path d="M${left+10} ${faceTop+6}H${right-10}" stroke="#d1e0e5" stroke-opacity=".25" stroke-width=".8"/>
 ${[left+9,right-9].map(x=>`<circle cx="${x}" cy="${faceTop+11}" r="2" fill="#9bb0bd"/><circle cx="${x}" cy="${faceBottom-11}" r="2" fill="#9bb0bd"/>`).join('')}
 ${[left+11,right-15].map(x=>Array.from({length:4},(_,i)=>`<rect x="${x}" y="${mid-14+i*7}" width="4" height="3" rx="1" fill="#738fa1" opacity=".45"/>`).join('')).join('')}
 <circle cx="${c}" cy="${faceTop-10}" r="6" fill="#0f2635" stroke="#748d9c"/><circle cx="${c}" cy="${faceBottom+10}" r="6" fill="#0f2635" stroke="#748d9c"/>
 <circle id="out-port-light" cx="${c}" cy="${faceTop-10}" r="2.7" fill="${cyan}" opacity=".15"/><circle id="in-port-light" cx="${c}" cy="${faceBottom+10}" r="2.7" fill="${gold}" opacity=".15"/>
 <text x="${c}" y="${mid-10}" text-anchor="middle" fill="#eff2e9" font-size="${fs+2}">本站母线 + 储能</text>
 <text id="bus-status" x="${c}" y="${mid+15}" text-anchor="middle" fill="#aec8d5" font-size="${compact?18:fs-4}">等待进站</text>
 <rect x="${left+23}" y="${faceBottom-14}" width="${bw-46}" height="4" rx="2" fill="#040e16" stroke="#4c6878" stroke-width=".6"/>
 <rect id="storage-fill" x="${left+23}" y="${faceBottom-14}" width="0" height="4" rx="2" fill="url(#belt-storage)"/>
 <path d="M${left-(narrow?42:95)} ${mid}H${left-5}" stroke="#2e3f4a" stroke-width="6" fill="none"/>
 <path id="grid-flow" d="M${left-(narrow?42:95)} ${mid}H${left-5}" stroke="#e4b4a5" stroke-width="2" fill="none"/>
 <text id="grid-label" x="${left-(narrow?48:105)}" y="${mid-10}" text-anchor="end" fill="#d6a292" font-size="${fs-4}">外补</text>
 ${pulse('incoming-pulse',gold)}${pulse('outgoing-pulse',cyan)}${pulse('grid-pulse','#e4b4a5')}
 <g id="out-force"><path d="M${x0-106} ${top+72}h49m-9-5 9 5-9 5" stroke="${cyan}" fill="none" stroke-width="1.7"/><text x="${x0-50}" y="${top+77}" fill="${cyan}" font-size="${fs-4}">受力 →</text></g>
 <g id="in-force"><path d="M${x0-106} ${bot+79}h49m-9-5 9 5-9 5" stroke="${gold}" fill="none" stroke-width="1.7"/><text x="${x0-50}" y="${bot+84}" fill="${gold}" font-size="${fs-4}">制动力</text></g>
 <text x="${compact?right+15:c+22}" y="${(outEnd+faceTop-12)/2+4}" fill="${cyan}" font-size="${fs-4}" stroke="#040e16" stroke-width="3" paint-order="stroke">供电 → 加速</text>
 <text x="${compact?right+15:c+22}" y="${(inStart+faceBottom+12)/2+5}" fill="${gold}" font-size="${fs-4}" stroke="#040e16" stroke-width="3" paint-order="stroke">制动 → 发电</text>
 ${car('out',cyan)}${car('in',gold)}
 <g id="near-rails">${nearRail(top)}${nearRail(bot)}</g>
 <g id="near-coils">${coils('out',top,cyan,true)}${coils('in',bot,gold,true)}</g>
 <text class="diagram-detail" opacity="${compact?0:1}" x="${c}" y="${top-83}" text-anchor="middle" fill="#abc2cd" font-size="${fs-2}" letter-spacing="1.4">同一段电磁设备 · 两向通道展开</text>
 <text x="${narrow?18:29}" y="${top-72}" fill="${cyan}" font-size="${fs+1}">出发 →</text><text x="${w-(narrow?18:29)}" y="${bot+88}" text-anchor="end" fill="${gold}" font-size="${fs+1}">← 到达</text>
 <text opacity="${compact?0:1}" x="${narrow?24:36}" y="${top+57}" fill="#8fa9ba" font-size="${fs-3}">10.0</text><text opacity="${compact?0:1}" x="${w-(narrow?24:36)}" y="${top+57}" text-anchor="end" fill="${cyan}" font-size="${fs-3}">10.1 km/s</text>
 <text opacity="${compact?0:1}" x="${narrow?24:36}" y="${bot-47}" fill="${gold}" font-size="${fs-3}">10.0</text><text opacity="${compact?0:1}" x="${w-(narrow?24:36)}" y="${bot-47}" text-anchor="end" fill="#8fa9ba" font-size="${fs-3}">10.1 km/s</text>
 <text id="bottom-hint" x="${c}" y="${h-10}" text-anchor="middle" fill="#8fa9ba" font-size="${fs-4}">同质量、同速度段，一减一增，动能差额配平。</text>
 </g>`;
svg.classList.toggle('compact-scene',compact);g.coils=Array.from(svg.querySelectorAll('[data-coil]')).map(el=>({el,id:el.dataset.coil,x:+el.dataset.x,lamp:el.querySelector('.coil-lamp'),aura:el.querySelector('.coil-aura')}));
g.flowPaths={incoming:$('incoming-flow'),outgoing:$('outgoing-flow'),grid:$('grid-flow')};
g.pathLengths=Object.fromEntries(Object.entries(g.flowPaths).map(([id,path])=>[id,path.getTotalLength()]));paint();}
function position(q,start,reverse){const{w,x0,x1}=g,dur=mode==='sync'?14:7;let x;if(t<start)x=lerp(80,x0,clamp((t-(start-4))/4));else if(q<1)x=lerp(x0,x1,q);else x=lerp(x1,w-80,clamp((t-start-dur)/5));return reverse?w-x:x;}
function paint(){if(!g)return;const s=state(),outStart=mode==='sync'?4:11;
document.documentElement.style.setProperty('--scene-progress',String(t/DURATION));
const exteriorOpacity=t<1.6?1:t<4?1-clamp((t-1.6)/2.4):t<23?0:clamp((t-23)/2);
document.documentElement.style.setProperty('--exterior-opacity',String(exteriorOpacity));
$('rail-diagram').style.opacity=String(1-exteriorOpacity);
$('exterior-title').textContent=t<4?'货舱进入环轨车站。':'本站完成能量回收，货舱继续前进。';
$('exterior-label').textContent=t<4?'环轨车站外景':'本站能量循环完成';
$('out-car').setAttribute('transform',`translate(${position(s.outgoingProgress,outStart,false)},${g.top})`);$('in-car').setAttribute('transform',`translate(${position(s.incomingProgress,4,true)},${g.bot})`);
const dur=mode==='sync'?14:7;for(const[id,start]of[['out',outStart],['in',4]])$(id+'-car').style.opacity=t<start-4?0:Math.min(1,clamp(start+dur+5-t));
$('out-speed').textContent=`${s.outgoingSpeed.toFixed(3)} km/s`;$('in-speed').textContent=`${s.incomingSpeed.toFixed(3)} km/s`;$('out-mass').textContent=$('in-mass').textContent=`${fmt(mass,0)} 吨`;
const inActive=s.incomingProgress>0&&s.incomingProgress<1,outActive=s.outgoingProgress>0&&s.outgoingProgress<1;
const recovering=inActive&&eta>0,gridActive=s.grid>.00001&&outActive;
$('incoming-flow').classList.toggle('flow-off',!recovering);$('outgoing-flow').classList.toggle('flow-off',!outActive);$('out-force').style.opacity=outActive?1:.1;$('in-force').style.opacity=inActive?1:.1;$('grid-flow').style.opacity=$('grid-label').style.opacity=gridActive?1:.1;
// Every moving highlight is positioned from the shared timeline. Pausing freezes it.
const pulse=(id,pathName,active,offset=0)=>{const el=$(id),phase=((t*.52+offset)%1+1)%1,point=g.flowPaths[pathName].getPointAtLength(g.pathLengths[pathName]*phase);el.setAttribute('transform',`translate(${point.x},${point.y})`);el.style.opacity=active?1:0;};
pulse('incoming-pulse','incoming',recovering);pulse('outgoing-pulse','outgoing',outActive,.38);pulse('grid-pulse','grid',gridActive,.7);
for(const coil of g.coils){const active=coil.id==='out'?outActive:inActive,x=position(coil.id==='out'?s.outgoingProgress:s.incomingProgress,coil.id==='out'?outStart:4,coil.id==='in'),near=active?clamp(1-Math.abs(x-coil.x)/(g.narrow?90:112)):0;coil.lamp.style.opacity=.13+.87*near;coil.aura.style.opacity=near*.78;}
for(const[id,active]of[['out',outActive],['in',inActive]])$(id+'-trail').style.opacity=active?.72:.18;
const storedFraction=clamp(s.stored/s.fullEnergy);$('storage-fill').setAttribute('width',(g.bw-46)*storedFraction);
const supplyingStore=outActive&&s.stored>.05,haloColor=outActive?(recovering||supplyingStore?'#79e9ed':'#e4b4a5'):recovering||storedFraction>.001?'#f1c77e':'#627f91';
$('bus-halo').setAttribute('stroke',haloColor);$('bus-halo').style.opacity=recovering||outActive?.4:storedFraction>.001?.24:.025;$('out-port-light').style.opacity=outActive?1:.15;$('in-port-light').style.opacity=recovering?1:.15;
$('bus-status').textContent=t<4?'等待货舱进站':mode==='buffer'&&s.stored>.05?`已储存 ${fmt(s.stored)} kWh`:recovering&&outActive?(gridActive?'回收电能与外补共同供电':'回收电能正在为出发舱加速'):outActive?(gridActive?'外部补能正在供电':'储能正在为出发舱供电'):t>=18?'本轮能量交换完成':'等待下一班';
const n=(id,val)=>$(id).textContent=fmt(Math.abs(val)<.00001?0:val);n('draw-energy',s.need);n('return-energy',s.recovered);n('grid-energy',s.grid);n('stored-energy',s.stored);n('lost-energy',s.loss);
// The compact relationship describes the complete paired cycle; the folded ledger follows the current frame.
n('summary-need',s.fullEnergy);n('summary-recovered',s.fullEnergy*eta);n('summary-grid',s.fullEnergy*(1-eta));
$('mass-ledger').textContent=`两舱各 ${fmt(mass,0)} 吨`;document.body.classList.toggle('large-mass',mass>=10);$('grid-note').textContent=eta===1?'理想回收 100% · 同质量、同速度段':'回收90% · 驱动与储能取理想';$('mode-heading').textContent=mode==='sync'?'同步对开':'错峰发车';
const phase=t<4?0:t<18?1:t<23?2:3;const text=texts[phase].slice();if(mode==='buffer'&&phase===1){text[0]=t<11?'到达货舱先减速，回收电能先存入本站。':'出发货舱随后加速，使用本站储存的电能。';text[1]=t<11?'到达舱减速发电，电能经过母线存入储能设备。出发舱尚未进入本段。':'储能设备通过母线为出发货舱供电。两班货舱即使错峰进站，回收的能量也能继续使用。';}if(phase===3&&eta<1){text[1]=`加速需要${fmt(K*mass)} kWh，减速回收${fmt(K*mass*eta)} kWh，外补${fmt(K*mass*(1-eta))} kWh。长期往返运输，回收率决定每一班的补能需求。`;}
if(mode==='buffer'&&phase===1&&outActive&&s.stored<=.05&&s.grid>.00001){text[0]='回收电能用完后，由外部补齐差额。';text[1]='储能设备已释放本轮回收的电能。外部补能接续供电，补上回收损耗。';}
$('phase-title').textContent=text[0];$('phase-copy').textContent=text[1].replaceAll('{m}',fmt(mass,0)).replaceAll('{e}',fmt(K*mass));$('phase-number').textContent=String(phase+1).padStart(2,'0');if(phase!==lastPhase){document.querySelectorAll('[data-step]').forEach((b,i)=>{b.classList.toggle('active',i===phase);if(i===phase)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});lastPhase=phase;}
$('scrubber').value=t;$('timecode').textContent=`00:${String(Math.floor(t)).padStart(2,'0')} / 00:28`;document.body.classList.toggle('stopped',!playing);$('play-toggle').innerHTML=playing?'Ⅱ <span>暂停</span>':'▶ <span>播放</span>';$('play-toggle').setAttribute('aria-label',playing?'暂停演示':'播放演示');}
function seek(value){t=Math.max(0,Math.min(DURATION,Number(value)||0));last=0;paint();}function setPlaying(value){playing=!!value;last=0;paint();}
$('play-toggle').addEventListener('click',()=>{if(t>=DURATION)seek(0);setPlaying(!playing);});$('restart').addEventListener('click',()=>{seek(0);setPlaying(true);});$('scrubber').addEventListener('input',e=>{const value=e.target.value;setPlaying(false);seek(value);});
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{setPlaying(false);seek([0,10,20,26][+b.dataset.step]);}));
function setMode(next){mode=next==='buffer'?'buffer':'sync';document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));seek(0);setPlaying(!embedded);}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));$('efficiency').addEventListener('change',e=>{eta=+e.target.value;paint();});$('mass').addEventListener('change',e=>{mass=+e.target.value;paint();});
$('full-screen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('scope-line').textContent='请使用浏览器的全屏功能观看。';}});
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|BUTTON|A/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();if(t>=DURATION)seek(0);setPlaying(!playing);}if(e.key==='ArrowRight'){e.preventDefault();setPlaying(false);seek(t+2);}if(e.key==='ArrowLeft'){e.preventDefault();setPlaying(false);seek(t-2);}});
addEventListener('message',e=>{if(!embedded||e.source!==parent||(location.protocol!=='file:'&&e.origin!==location.origin)||e.data?.type!=='astral-principle')return;const d=e.data;if(d.action==='sync'){t=clamp(Number(d.progress)||0)*DURATION;playing=!!d.playing;paint();}});
function frame(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(!embedded&&playing&&!document.hidden){t+=dt;if(t>=DURATION){t=DURATION;playing=false;}paint();}requestAnimationFrame(frame);}document.addEventListener('visibilitychange',()=>{last=0;});
new ResizeObserver(renderSvg).observe($('rail-diagram'));renderSvg();requestAnimationFrame(frame);
window.astralPrinciple={seek,pause:()=>setPlaying(false),play:()=>setPlaying(true),setMode,setEfficiency:v=>{eta=Math.max(0,Math.min(1,+v));$('efficiency').value=eta;paint();},setMass:v=>{mass=Math.max(1,+v);$('mass').value=mass;paint();},get state(){return state();}};
})();
