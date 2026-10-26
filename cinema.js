import { drawDiagram } from './cinema-diagrams.js?v=20261026';
import { calculateFinance } from './finance.js?v=20261026';
import { createCinemaScore } from './cinema-audio.js?v=20261026';
import { drawPhysics } from './cinema-physics.js?v=20261026';

const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const f = calculateFinance();
const nf = (n, digits = 0) => Number(n).toLocaleString('zh-CN', {minimumFractionDigits:digits,maximumFractionDigits:digits});
const metric = (value, unit, label, counter = '') => `<div class="metric"><strong ${counter ? `data-counter="${counter}"` : ''}>${value}<small>${unit}</small></strong><span>${label}</span></div>`;
const flow = (...labels) => `<div class="flow-line">${labels.map((s,i) => `${i?'<i>→</i>':''}<span>${s}</span>`).join('')}</div>`;
const fleet = `<div class="fleet" aria-hidden="true">${[0,1,2,3,4].map(n=>`<i style="--row:${n}"></i>`).join('')}</div>`;
const SCENES = [

 {name:'十秒，推到不得不修的路',chapter:'01 / 必然与代价',duration:13,class:'logic-story hook-story',coordinate:'2222 / THE NEXT DEPARTURE',title:['人类必将','<em>走出地球。</em>'],copy:'',story:[
  {image:'orbit-hero',duration:2.5,kind:'opening',title:['人类必将','<em>走出地球。</em>'],line:''},
  {image:'orbit-marsport',duration:2.5,kind:'opening',title:['开发一旦开始，','<em>货运就不会停止。</em>'],line:''},
  {image:'independent-freighter',duration:2.5,kind:'opening',title:['货运成为日常，','<em>成本就必须降下来。</em>'],line:''},
  {image:'independent-freighter',duration:5.5,kind:'bill',title:['一千吨货物。','<em><b class="hook-number">13.9</b> 亿度电。</em>'],line:'加速至100 km/s，仅货物增加的动能就相当于这些电能。'}
 ]},
 {name:'速度十倍，动能百倍',chapter:'01 / 必然与代价',duration:10,bg:'independent-freighter',class:'technical energy-focus',mode:'energy',coordinate:'KINETIC ENERGY / 1000 TONNES',title:['速度提高十倍，','<em>动能增加百倍。</em>'],copy:'火箭还要推进发动机、燃料和反作用工质。抵达时，又必须消掉这份速度。',caption:'K＝½mv²；图中只计同一参考系内1000吨货物的动能。'},
 {name:'理想闭环的净功为零',chapter:'02 / 物理的答案',duration:12,class:'technical physics-cycle',mode:'cycle',coordinate:'A ⇄ B / REVERSIBLE CYCLE',title:['完整往返，','<em>理论净功为零。</em>'],copy:'同一系统完成A—B—A往返，回到原来的位置与运动状态。势能变化抵消，动能完整回收，理想外部净补能就是零。',extra:'<p class="physics-condition">完整闭环 · 同一参考系 · 理想可逆</p>',caption:'∮ F保守 · ds＝0；可逆驱动回收动能。'},
 {name:'把速度变回电，再送给下一班',chapter:'02 / 物理的答案',duration:10,class:'technical physics-cycle',mode:'cycle',coordinate:'ENERGY / KEEP IT IN THE SYSTEM',title:['把速度变回电，','<em>再交给下一班。</em>'],copy:'加速时，电能变成货舱的动能；抵达时，制动将动能送回储能系统。外部电源补足损耗，班次继续往返。',extra:'<p class="physics-condition">加速：电 → 速度　　制动：速度 → 电</p>',caption:'设备承担功率，储能消化班次时间差。'},
 {name:'把推进能力留在行星车站',chapter:'03 / 原理与工程',duration:12,class:'technical',mode:'orbit',coordinate:'PLANETARY STATION / THE SYSTEM',title:['把推进能力，','<em>留在行星车站。</em>'],copy:'升轨设施连接地表，分段环轨为货舱加速，转向站将它送入航路。目的地用同一套逻辑捕获、回收、交付。',caption:'导轨不必密铺。货舱多次通过加速段，逐级积累速度。'},
 {name:'同一段导轨，服务两个方向',chapter:'03 / 原理与工程',duration:10,bg:'orbit-engineering',class:'bands technical',coordinate:'SPEED BANDS / SHARED HARDWARE',title:['同一段导轨，','<em>服务两个方向。</em>'],copy:'每段只负责一个速度区间。出发舱加速，到达舱减速，共用电磁设备与本站母线。',outside:'<div class="speed-bands"><div class="speed-band">10.0 → 10.1 km/s<small>出发加速 ↔ 到达回收</small><i></i><i class="return-pulse"></i></div><div class="speed-band">10.1 → 10.2 km/s<small>逐段提速 · 共用设备</small><i></i><i class="return-pulse"></i></div><div class="speed-band">10.2 → 10.3 km/s<small>多次绕行 · 送入转向站</small><i></i><i class="return-pulse"></i></div></div>',caption:'轨道半径与转向半径决定载荷可承受的加速度。'},
 {name:'看清一段导轨的能量循环',chapter:'03 / 原理与工程',duration:32,class:'principle-embedded',embed:'principle.html?embed=1',coordinate:'LOCAL STATION / ENERGY LOOP'},
 {name:'看完地球到火星的完整一班',chapter:'03 / 原理与工程',duration:22,class:'transport',mode:'transport',coordinate:'EARTH → MARS / A COMPLETE DELIVERY',title:['货物从地球启程，','<em>在火星完成交付。</em>'],copy:'升轨、加速、转向、巡航、捕获、交付。抵达货舱回收的电能，留给本站下一班出发。',caption:'流程压缩演示。各站独立回收和调度能量。'},
 {name:'货物走了，运输能力留下',chapter:'03 / 原理与工程',duration:8,bg:'orbit-marsport',coordinate:'DELIVERY COMPLETE / NEXT DEPARTURE',title:['货物走了，','<em>运输能力留下。</em>'],copy:'升轨、加速、捕获和储能设施继续服务下一班。后来的一亿次交付，共用今天建成的这套能力。'},
 {name:'从马队到铁路，从飞船到星穹铁道',chapter:'04 / 铁路的必然',duration:36,class:'logic-story history-story',coordinate:'HISTORY / THE SAME TURNING POINT',title:['远征让人抵达。','<em>铁路让文明留下。</em>'],copy:'',story:[
  {image:'orbit-marsport',duration:3,kind:'bridge',title:['我们已经，','<em>走过这条路。</em>'],line:'再看一段历史。'},
  {image:'west-rider',duration:5,kind:'past',title:['第一次抵达，','<em>骑马。</em>'],line:'远方还没有路。先行者带上给养，翻过山口。'},
  {image:'west-settlement',duration:5,kind:'past',title:['人们留下来，','<em>荒野长成了小镇。</em>'],line:'粮食、木材和机器必须每天运进来。运费也进入每件商品的价格。'},
  {image:'west-railway',duration:6,kind:'past',title:['小镇要长大，','<em>运费就必须降下来。</em>'],line:'人们修起铁路，用长期货流分摊铺轨和建站的投入。更低的运费，让更多生意成为可能。'},
  {image:'independent-freighter',duration:5,kind:'ship',title:['今天的飞船，','<em>就是那匹马。</em>'],line:'飞船把第一批人送到远方。此后的每一次补给，仍在重复付出远征的代价。'},
  {image:'orbit-marsport',duration:5,kind:'settlement',title:['今天的火星，','<em>就是那座小镇。</em>'],line:'基地要长成工业城市，原料和产品就要不断往返。昂贵的远征，必须变成负担得起的日常。'},
  {image:'orbit-engineering',duration:7,kind:'rail',title:['远征让人抵达。','<em>铁路让文明留下。</em>'],line:'既然人类要长期生活在外星，我们就必须建设能长期负担的通路。这就是星穹铁道。'}
 ]},
 {name:'这条路很难，但它迟早要修',chapter:'04 / 铁路的必然',duration:9,bg:'orbit-engineering',coordinate:'CIVILIZATION / INFRASTRUCTURE',title:['这条路很难。','<em>但它迟早要修。</em>'],copy:'探索能承担昂贵的第一次。城市不能依靠昂贵的第一万次。持续的开发，必然要求一条低成本的通路。'},
 {name:'第一艘船建港，后来的船进站',chapter:'05 / 通向群星',duration:9,bg:'stellar-network',coordinate:'SOL / 2300',title:['第一艘船先建港，','<em>后来的船就能进站。</em>'],copy:'一千吨的工程船带上机床、能源和机器人，先去另一颗恒星建设车站。同一条发展逻辑，开始向群星延伸。'},
 {name:'2300年出发，2352年抵达',chapter:'05 / 通向群星',duration:10,bg:'stellar-network',coordinate:'SOL → PROXIMA / 4.24 LY',title:['2300年出发。','<em>2352年抵达。</em>'],copy:'4.24光年，0.1c巡航，两端0.01g加减速，全程52.1年。一代人把船送出去，下一代人等它抵达。',extra:'<div class="travel-profile"><div><b>9.7</b><span>年 · 加速</span></div><div><b>32.7</b><span>年 · 巡航</span></div><div><b>9.7</b><span>年 · 减速</span></div><div><b>52.1</b><span>年 · 全程</span></div></div>'},
 {name:'再建设十二年，星际港正式投运',chapter:'05 / 通向群星',duration:8,bg:'first-starport',coordinate:'PROXIMA / 2364',title:['再建设十二年，','<em>星际港正式投运。</em>'],copy:'采掘、制造与能源系统开始运转。第一座星际港有了接收后续货物、继续建设新船的能力。'},
 {name:'本站已就绪，可以接收下一班',chapter:'05 / 通向群星',duration:8,bg:'first-starport',class:'message',coordinate:'SOL / 2368 / MESSAGE RECEIVED',title:['“本站已就绪。','<em>可以接收下一班。”</em>'],copy:'2368年，太阳系收到这封飞行了4.24年的回信。第二班货运将于约2420年抵达。',outside:'<div class="signal-indicator" aria-hidden="true"><i></i><i></i><i></i><span>SIGNAL RECEIVED</span></div>'},
 {name:'每建成一座港，就向两颗恒星出发',chapter:'05 / 通向群星',duration:12,class:'technical network',mode:'network',coordinate:'THE NETWORK / GENERATION 06',title:['每建成一座港，','<em>就向两颗恒星出发。</em>'],copy:'先抵达，再建港，再接通货流。每代新港再派出两支建港船队，六轮接力，384年建成127座港。',extra:`<div class="metrics">${metric('1','座','累计成熟港','network')}${metric('384','年','六轮建港接力')}</div>`},

{name:'每次抵达都形成收入',chapter:'06 / 商业与投资',duration:10,bg:'orbit-marsport',coordinate:'EARTH—MARS / THE FIRST LINE',eyebrow:'先赚地火干线的钱，再把路向外延伸',title:['先建地火干线，','<em>再把路修向群星。</em>'],copy:'小镇需要铁路，火星需要干线。一亿吨年货量共用一套设施，每次交付都形成收入。',extra:`<div class="metrics">${metric('4,000','信用点/吨','综合交付运价')}${metric('600','信用点/吨','可变成本')}${metric('1','亿吨/年','双向基准货量')}</div>`,caption:'城市买设备。工厂买原料。贸易支付运费。<strong>未来的日常，就是我们的业务。</strong>'},
{name:'长期通行产生资本回报',chapter:'06 / 商业与投资',duration:12,bg:'first-starport',class:'financial',coordinate:'CASH FLOW / 2222—2289',eyebrow:'把八年建设与六十年经营，放进同一张时间表',title:['货流达到规模，','<em>铁路就能回收投资。</em>'],copy:'按双向年货量1亿吨测算，扣除运营与更新储备后，每年净现金流为3200亿信用点。',extra:`<div class="metrics">${metric(nf(f.annualCashBillion*10),'亿信用点/年','成熟年净现金流')}${metric(nf(f.irr*100,2),'%','全项目内部收益率')}${metric('＋'+nf(f.npvBillion/1000,2),'万亿信用点','5%折现净现值')}</div>`,outside:'<div class="cash-chart" id="cash-chart"></div>',caption:'基准：1亿吨/年，4,000信用点/吨，600信用点/吨可变成本，固定运营与更新200亿信用点/年。'},
{name:'一次建设长期往返',chapter:'06 / 商业与投资',duration:9,bg:'orbit-engineering',class:'capital',coordinate:'CAPITAL / INFRASTRUCTURE',eyebrow:'让每一笔信用点，落到一项工程',title:['用八年建成铁路，','<em>用六十年服务货流。</em>'],copy:'环轨、捕获、能源、货舱与调度共同建成。<br>从2230年开始，让货流兑现这项投资。',extra:`<div class="metrics">${metric('2.4','万亿信用点','首期全线建设')}${metric('8','年','2222—2229建设')}${metric('60','年','经营期')}</div>`,outside:'<div class="funding-bars">'+[['电磁环轨与主动支撑',33.3],['捕获与转向港站',16.7],['能源、储能与母线',16.7],['货舱与装卸接驳',8.3],['验证与建设预备',25]].map(([s,n])=>`<div class="funding-row"><span>${s}</span><b>${n}%</b><i style="--allocation:${n}%"></i></div>`).join('')+'</div>',caption:'首期增量建设口径，接入既有升轨主干。恒星际工程另行建设。'},
{name:'参与第一条行星际铁路',chapter:'06 / 商业与投资',duration:14,bg:'orbit-hero',class:'investment',coordinate:'EARTH—MARS / NEXT DEPARTURE',eyebrow:'首期联合建设 · 资本招募',title:['这条路很难。','<em>但人类必须修。</em>'],copy:'物理允许能量循环，历史要求运输降本。今天，我们把第一条地火干线修起来。',extra:`<div class="metrics">${metric('1,200','亿信用点','首轮建设资金')}${metric('5','%','占全线建设预算')}${metric('2230','年','首期商业运营')}</div><button class="gold-button" id="invest-open">一起修建第一条干线 <span>↗</span></button><a class="secondary-link" href="explore.html#business">打开收益模型，亲手算这笔账 →</a>`,caption:'人类走向群星的第一步，<strong>是让第二次出发，比第一次更容易。</strong>'}
];
const total = SCENES.reduce((sum,s)=>sum+s.duration,0);
const offsets = SCENES.map((_,i)=>SCENES.slice(0,i).reduce((sum,s)=>sum+s.duration,0));
const elements = SCENES.map((s,i)=>{
 const el=document.createElement('section');el.className=`scene ${s.class||''}`;el.dataset.scene=String(i);el.setAttribute('aria-hidden','true');el.setAttribute('aria-label',s.name);
 el.innerHTML=s.embed?`<div class="principle-embed"><iframe id="principle-frame" src="${s.embed}" title="星穹铁道原理拆解：分段加速、再生制动与能量回收" tabindex="-1"></iframe></div>`:`${s.bg?`<img class="scene-bg" src="assets/${s.bg}.webp" alt="" aria-hidden="true">`:''}<div class="scene-shade"></div><div class="scene-large-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</div><div class="scene-content"><p class="eyebrow">${s.eyebrow||''}</p><h1>${s.title.map((line,j)=>`<span class="line" style="--i:${j}">${line}</span>`).join('')}</h1><p class="body-copy">${s.copy}</p>${s.extra||''}</div>${s.outside||''}<p class="scene-caption">${s.caption||''}</p>`;
 if(s.story){el.insertAdjacentHTML('beforeend',`<div class="story-visuals" aria-hidden="true">${s.story.map((shot,j)=>`<div class="story-visual ${shot.kind}" data-shot="${j}"><img class="story-bg" src="assets/${shot.image}.webp" alt=""><div class="story-shade"></div></div>`).join('')}</div><div class="story-titles">${s.story.map((shot,j)=>`<div class="story-copy ${shot.kind}" data-shot="${j}" aria-hidden="true"><h2>${shot.title.map(line=>`<span>${line}</span>`).join('')}</h2>${shot.line?`<p>${shot.line}</p>`:''}</div>`).join('')}</div>`);s.visuals=[...el.querySelectorAll('.story-visual')];s.titles=[...el.querySelectorAll('.story-copy')];}
 $('scenes').append(el);return el;
});
const buttons = SCENES.map((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`第${i+1}幕：${s.name}`);b.title=`${String(i+1).padStart(2,'0')} · ${s.name}`;b.innerHTML='<i></i>';b.addEventListener('click',()=>go(i));$('film-timeline').append(b);return b;});
SCENES.forEach((s,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${s.name}`;b.addEventListener('click',()=>{$('chapters-dialog').close();go(i);setPlaying(true);});$('chapter-grid').append(b);});
const space=$('space'),sc=space.getContext('2d'),diagram=$('diagram'),dc=diagram.getContext('2d');
let screenWidth=innerWidth,screenHeight=innerHeight,diagramWidth=1,diagramHeight=1;
function sizeCanvases(){const dpr=Math.min(devicePixelRatio||1,2);screenWidth=innerWidth;screenHeight=innerHeight;space.width=screenWidth*dpr;space.height=screenHeight*dpr;sc.setTransform(dpr,0,0,dpr,0,0);const r=diagram.getBoundingClientRect();diagramWidth=r.width;diagramHeight=r.height;diagram.width=r.width*dpr;diagram.height=r.height*dpr;dc.setTransform(dpr,0,0,dpr,0,0);document.documentElement.style.setProperty('--principle-top',`${document.querySelector('.film-header').getBoundingClientRect().bottom}px`);document.documentElement.style.setProperty('--principle-bottom',`${Math.max(0,screenHeight-document.querySelector('.player').getBoundingClientRect().top)}px`);}
addEventListener('resize',sizeCanvases);new ResizeObserver(sizeCanvases).observe($('diagram-stage'));
const starPoints=Array.from({length:110},(_,i)=>({x:((i*73+29)%997)/997,y:((i*137+11)%991)/991,z:(i%9+1)/10,phase:i*2.3}));
let index=0,elapsed=0,playing=true,speed=1,lastTime=0,filmTime=0,finished=false,changeTimer,soundOn=false;
const score=createCinemaScore('assets/astral-rail-score.mp3?v=20261026',total,()=>{soundOn=false;updateMusicControl();$('music-start').hidden=false;toast('配乐暂未开启，请再点一次“配乐”。');});
function syncAudio(){score.sync(offsets[index]+elapsed,playing&&!finished&&!document.querySelector('dialog[open]'),speed,!document.hidden);}
function updateMusicControl(){const b=$('sound-toggle');b.setAttribute('aria-pressed',String(soundOn));b.setAttribute('aria-label',soundOn?'关闭配乐':'开启配乐');b.querySelector('span').textContent=soundOn?'开':'关';if(soundOn)$('music-start').hidden=true;}
async function setMusicEnabled(value){soundOn=value;updateMusicControl();syncAudio();try{await score.setEnabled(value);}catch{soundOn=false;updateMusicControl();}}
const principleIndex=SCENES.findIndex(s=>s.embed),principleFrame=$('principle-frame'),principleOrigin=location.protocol==='file:'?'*':location.origin;
let principleProgress=0;
function syncPrinciple(active=index===principleIndex){if(active)principleProgress=Math.min(1,Math.max(0,elapsed/SCENES[principleIndex].duration));principleFrame?.contentWindow?.postMessage({type:'astral-principle',action:'sync',progress:principleProgress,playing:active&&playing&&!finished&&!document.hidden&&!document.querySelector('dialog[open]')},principleOrigin);}
principleFrame?.addEventListener('load',()=>syncPrinciple());
const chromeObserver=new ResizeObserver(sizeCanvases);chromeObserver.observe(document.querySelector('.film-header'));chromeObserver.observe(document.querySelector('.player'));
const speeds=[1,1.25,1.5,.75];
const timecode=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
$('total-time').textContent=timecode(total);
function go(next,{resume=false}={}){
 next=Math.max(0,Math.min(SCENES.length-1,next));
 if(index===principleIndex&&next!==index)syncPrinciple(false);
 if(elements[index].classList.contains('active')){const prev=elements[index];prev.classList.remove('active');prev.classList.add('leaving');setTimeout(()=>prev.classList.remove('leaving'),1200);}
 index=next;elapsed=0;finished=false;const s=SCENES[index],el=elements[index];el.classList.remove('leaving');el.classList.add('active');el.style.setProperty('--p','0');
 elements.forEach((e,i)=>{e.setAttribute('aria-hidden',String(i!==index));e.inert=i!==index;});
 $('chapter-section').textContent=s.chapter;$('scene-counter').textContent=`${String(index+1).padStart(2,'0')} / ${SCENES.length}`;$('scene-name').textContent=s.name;$('scene-coordinate').textContent=s.coordinate;
 document.body.classList.toggle('principle-active',Boolean(s.embed));
 $('diagram-stage').className=`diagram-stage ${s.mode?'visible':''} ${s.mode==='transport'?'transport-stage':''} ${s.mode==='network'?'network-stage':''} ${['energy','cycle'].includes(s.mode)?'physics-stage':''}`;
 $('previous').disabled=index===0;$('next').disabled=index===SCENES.length-1;
 buttons.forEach((b,i)=>{b.setAttribute('aria-current',String(i===index));b.style.setProperty('--fill',i<index?'100%':'0%');});
 [...$('chapter-grid').children].forEach((b,i)=>b.classList.toggle('active',i===index));
 $('transition-flash').classList.remove('flash');void $('transition-flash').offsetWidth;
 if(resume)setPlaying(true);sizeCanvases();
 history.replaceState(null,'',`#${index}`);updateFrame();
}
function setPlaying(value){playing=value;lastTime=0;document.body.classList.toggle('paused',!playing);$('play-pause').setAttribute('aria-label',playing?'暂停':'继续播放');$('play-pause').title=playing?'暂停（空格）':'继续播放（空格）';$('play-pause').innerHTML=playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5L19 12L8 19Z" fill="currentColor" stroke="none"/></svg>';$('player-state').textContent=finished?'本次路演已结束':playing?'自动播放':'已暂停';syncAudio();if(index===principleIndex)syncPrinciple();}
const smooth=(from,to,t)=>{const x=Math.max(0,Math.min(1,(t-from)/(to-from)));return x*x*(3-2*x);};
function updateStory(s,t){
 let start=0,activeShot=0;
 s.story.forEach((shot,i)=>{
  const end=start+shot.duration;
  // Pictures overlap for 1.5 seconds; titles exchange in the quiet part of the dissolve.
  const fast=s.class?.includes('hook-story');const imageAlpha=i?smooth(start-(fast?.3:.6),start+(fast?.5:.9),t):1;
  const enter=i?smooth(start+.02,start+(fast?.28:.75),t):1;
  const leave=i===s.story.length-1?1:1-smooth(end-(fast?.24:.7),end-.02,t);
  const alpha=Math.min(enter,leave),local=Math.max(0,Math.min(1,(t-start)/shot.duration));
  s.visuals[i].style.setProperty('--shot-alpha',imageAlpha);
  s.visuals[i].style.setProperty('--shot-p',reducedMotion?0:local);
  s.titles[i].style.setProperty('--copy-alpha',alpha);
  s.titles[i].setAttribute('aria-hidden',String(alpha<.5));
  if(t>=start)activeShot=i;
  start=end;
 });
 elements[index].dataset.storyShot=String(activeShot);const number=elements[index].querySelector('.hook-number');if(number){const k=Math.max(0,Math.min(1,(t-7.5)/.85));number.textContent=(13.9*(1-(1-k)**3)).toFixed(1);}
}
function updateFrame(){syncAudio();const s=SCENES[index],p=Math.min(1,elapsed/s.duration),el=elements[index];el.style.setProperty('--p',reducedMotion?0:p);if(s.story)updateStory(s,elapsed);el.style.setProperty('--chart-p',Math.min(1,Math.max(0,(p-.1)/.6)));el.style.setProperty('--bar-p',Math.min(1,Math.max(0,(p-.1)/.7)));buttons[index].style.setProperty('--fill',`${p*100}%`);$('elapsed-time').textContent=timecode(offsets[index]+elapsed);el.querySelectorAll('.speed-band').forEach((b,i)=>b.classList.toggle('active',Math.floor(elapsed/2.1)%3===i));const count=el.querySelector('[data-counter="network"]');if(count){const gen=Math.min(6,Math.floor(Math.min(1,p/.85)*6+1e-8));count.innerHTML=`${2**(gen+1)-1}<small>座</small>`;}if(['energy','cycle'].includes(s.mode))drawPhysics(dc,{mode:s.mode,progress:p,time:filmTime*1000,width:diagramWidth,height:diagramHeight});else if(s.mode)drawDiagram(dc,{mode:s.mode,progress:s.mode==='network'?Math.min(1,p/.85):s.mode==='transport'?Math.min(1,p/.93):p,time:filmTime*1000,width:diagramWidth,height:diagramHeight});else dc.clearRect(0,0,diagramWidth,diagramHeight);if(s.embed)syncPrinciple();}
function paintSpace(){sc.clearRect(0,0,screenWidth,screenHeight);const g=sc.createRadialGradient(screenWidth*.7,screenHeight*.5,0,screenWidth*.6,screenHeight*.5,screenWidth*.7);g.addColorStop(0,'#102637');g.addColorStop(1,'#03090f');sc.fillStyle=g;sc.fillRect(0,0,screenWidth,screenHeight);for(const p of starPoints){const drift=reducedMotion?0:filmTime*(.5+p.z);const x=(p.x*screenWidth+drift)%(screenWidth+30);sc.globalAlpha=.25+p.z*.5+Math.sin(filmTime*.4+p.phase)*.08;sc.fillStyle=p.z>.7?'#decba5':'#acc7df';sc.beginPath();sc.arc(x,p.y*screenHeight,.35+p.z,0,Math.PI*2);sc.fill();}sc.globalAlpha=1;}
let lastPaint=0;
function tick(time){const delta=lastTime?Math.min(.1,(time-lastTime)/1000):0;lastTime=time;if(playing&&!document.hidden&&!document.querySelector('dialog[open]')){elapsed+=delta*speed;filmTime+=delta*speed;if(elapsed>=SCENES[index].duration){if(index<SCENES.length-1){const carry=elapsed-SCENES[index].duration;go(index+1);elapsed=carry;}else{elapsed=SCENES[index].duration;finished=true;setPlaying(false);}}}if(time-lastPaint>30){paintSpace();updateFrame();lastPaint=time;}requestAnimationFrame(tick);}
$('play-pause').addEventListener('click',()=>{if(finished)go(0);setPlaying(!playing);});$('previous').addEventListener('click',()=>go(index-1));$('next').addEventListener('click',()=>go(index+1));$('replay').addEventListener('click',()=>{go(0);setPlaying(true);});document.querySelector('.film-brand').addEventListener('click',e=>{e.preventDefault();go(0);setPlaying(true);});
$('speed-toggle').addEventListener('click',()=>{speed=speeds[(speeds.indexOf(speed)+1)%speeds.length];$('speed-toggle').textContent=`${speed}×`;toast(`播放速度 ${speed}×`);});
let resumeAfterDialog=false;
function openDialog(id){resumeAfterDialog=playing;setPlaying(false);$(id).showModal();}
$('chapters-open').addEventListener('click',()=>openDialog('chapters-dialog'));$('invest-open').addEventListener('click',()=>openDialog('invest-dialog'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{if(resumeAfterDialog&&!finished)setPlaying(true);resumeAfterDialog=false;});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('可使用浏览器全屏键继续播放。');}});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.code==='Space'&&!/BUTTON|A/.test(e.target.tagName)){e.preventDefault();if(finished)go(0);setPlaying(!playing);}else if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(index+1);}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(index-1);}else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(SCENES.length-1);}});
let touchX=0,touchY=0;
$('film').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});$('film').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.2)go(index+(dx<0?1:-1));},{passive:true});
document.addEventListener('visibilitychange',()=>{lastTime=0;syncAudio();if(index===principleIndex)syncPrinciple();});
let toastTimer;function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3000);}
$('sound-toggle').addEventListener('click',()=>setMusicEnabled(!soundOn));
$('music-start').addEventListener('click',()=>{go(0);setPlaying(true);void setMusicEnabled(true);});
function updateShare(){const amount=+$('investment-amount').value;$('investment-share').textContent=`占首轮融资目标${nf(amount/1200*100,2)}% · 占全线建设预算${nf(amount/24000*100,2)}%`;}updateShare();$('investment-amount').addEventListener('input',updateShare);
$('invest-form').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;const name=$('investor-name').value.trim(),amount=+$('investment-amount').value;if(!name)return;const text=['星穹铁道计划 · 2222','地球—火星货运干线 / 首轮联合建设提案','',`投资方：${name}`,`拟参与金额：${nf(amount)} 亿信用点`,`占首轮1,200亿融资目标：${nf(amount/1200*100,2)}%`,`占全线2.4万亿建设预算：${nf(amount/24000*100,2)}%`,'','首轮用途：能量循环验证、可靠捕获试验、首段工程。','全线建设：2.4万亿信用点，2222—2229建设，2230年首期运营。','成熟年货量：1亿吨，双向合计净载荷。','综合运价：4,000信用点/吨；可变成本：600信用点/吨。','固定运营与更新：200亿信用点/年。',`成熟年净现金流：${nf(f.annualCashBillion*10)}亿信用点。`,`完整项目IRR：${nf(f.irr*100,2)}%；5%折现NPV：＋${nf(f.npvBillion/1000,2)}万亿信用点。`,'建设8年、经营60年，年末现金流。','全线预算分配：环轨33.3%、捕获16.7%、能源16.7%、货舱8.3%、验证及预备25%。','建设权益、货运长约与回报安排，由后续协议商定。','','在行星之间修建通路，在群星之间建设车站。'].join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff',text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='星穹铁道_首轮联合建设提案.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('proposal-status').textContent='投资提案已生成，已发起下载。';toast('提案已生成。第一条干线，等你一起建设。');});
const chart=elements.find(e=>e.classList.contains('financial')).querySelector('#cash-chart');const vals=f.cumulativeCash.map(v=>v/1000),min=-2.8,max=17,x=i=>i/(vals.length-1)*1200,y=v=>180-(v-min)/(max-min)*170;const d=vals.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');chart.innerHTML=`<svg viewBox="0 0 1200 205" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cash-area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e6bd70" stop-opacity=".14"/><stop offset="1" stop-color="#e6bd70" stop-opacity="0"/></linearGradient></defs><path d="M0 ${y(0)}H1200" stroke="#66818b55" stroke-dasharray="4 6"/><path d="${d}L1200 185H0Z" fill="url(#cash-area)"/><path class="cash-trace" d="${d}" fill="none" stroke="#e6bd70" stroke-width="2.3" pathLength="2000"/><text x="0" y="202" fill="#7e97a7" font-size="10">2222 / 开工</text><text x="${x(8)}" y="202" fill="#7e97a7" font-size="10">2230 / 开通</text><text x="1200" y="202" text-anchor="end" fill="#7e97a7" font-size="10">2289 / 累计净现金流</text></svg>`;
const initial=Number(location.hash.slice(1));go(Number.isInteger(initial)&&initial>=0&&initial<SCENES.length?initial:0);setPlaying(true);sizeCanvases();requestAnimationFrame(tick);setTimeout(()=>$('playback-hint').classList.add('hide'),8500);
let controlsTimer;
function revealControls(){document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>{if(!document.querySelector('.player:focus-within'))document.body.classList.remove('controls-visible');},2400);}
document.addEventListener('pointermove',revealControls,{passive:true});
document.addEventListener('pointerdown',revealControls,{passive:true});
document.addEventListener('keydown',revealControls);
document.querySelector('.player').addEventListener('focusout',()=>{clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2400);});
revealControls();
// Compact public playback state supports deterministic scene validation and local playback.
window.astralCinema={scenes:SCENES.map((s,i)=>({index:i,name:s.name,start:offsets[i],duration:s.duration,story:s.story?.map(x=>({duration:x.duration,title:x.title}))})),go:(i,p=0)=>{go(i);elapsed=Math.max(0,Math.min(1,p))*SCENES[index].duration;updateFrame();},pause:()=>setPlaying(false),play:()=>setPlaying(true),get state(){return{index,elapsed,time:offsets[index]+elapsed,playing,speed,total,finished};}};
window.astralSoundtrack=score;


