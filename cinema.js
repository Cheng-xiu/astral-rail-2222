import { drawDiagram } from './cinema-diagrams.js?v=20261026-epic3';
import { calculateFinance } from './finance.js?v=20261026-epic3';
import { createCinemaScore } from './cinema-audio.js?v=20261026-epic3';
import { drawPhysics } from './cinema-physics.js?v=20261026-epic3';

const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const f = calculateFinance();
const nf = (n, digits = 0) => Number(n).toLocaleString('zh-CN', {minimumFractionDigits:digits,maximumFractionDigits:digits});
const metric = (value, unit, label, counter = '') => `<div class="metric"><strong ${counter ? `data-counter="${counter}"` : ''}>${value}<small>${unit}</small></strong><span>${label}</span></div>`;
const flow = (...labels) => `<div class="flow-line">${labels.map((s,i) => `${i?'<i>→</i>':''}<span>${s}</span>`).join('')}</div>`;
const fleet = `<div class="fleet" aria-hidden="true">${[0,1,2,3,4].map(n=>`<i style="--row:${n}"></i>`).join('')}</div>`;
const SCENES = [
 {
  "name": "深空的代价",
  "duration": 13,
  "title": [
   "文明不会停在摇篮里。"
  ],
  "copy": "",
  "coordinate": "ASTRAL RAIL / 2222",
  "class": "logic-story hook-story",
  "story": [
   {
    "image": "orbit-hero",
    "duration": 4,
    "title": [
     "文明不会",
     "<em>停在摇篮里。</em>"
    ],
    "line": "TARGET: MARS CARGO LINE",
    "kind": "opening"
   },
   {
    "image": "orbit-marsport",
    "duration": 4,
    "title": [
     "但群星正在向我们",
     "<em>索要过路费。</em>"
    ],
    "line": "BASE LOAD: 1,000 t",
    "kind": "opening"
   },
   {
    "image": "independent-freighter",
    "duration": 5,
    "title": [
     "<em><b class=\"hook-number\">1,388,888,889</b></em>",
     "<span class=\"bill-unit\">kWh · 只为一船建材。</span>"
    ],
    "line": "一千吨货物，加速到100 km/s。<br>仅净动能就需13.9亿度电——相当于160 MW机组连续发电一年。",
    "kind": "bill"
   }
  ],
  "chapter": "01 / 动能的诅咒"
 },
 {
  "name": "齐奥尔科夫斯基的暴政",
  "duration": 10,
  "title": [
   "速度提高十倍，",
   "<em>能量惩罚百倍。</em>"
  ],
  "copy": "飞船是一座流动的焚化炉。<br>为了在终点停下来，你必须带着减速的燃料一起加速。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "independent-freighter",
  "mode": "energy",
  "class": "technical energy-focus",
  "beats": [
   {
    "at": 0,
    "title": [
     "速度提高十倍，",
     "<em>能量惩罚百倍。</em>"
    ],
    "copy": "飞船是一座流动的焚化炉。为了在终点停下来，你必须带着减速的燃料一起加速。"
   },
   {
    "at": 5,
    "title": [
     "你不仅要加速，",
     "<em>你还必须减速。</em>"
    ],
    "copy": "在100∶1质量比情景里，一吨末态质量背后，是九十九吨被抛出的推进剂。<br><strong>带着发动机上路的飞船，终究只是拓荒的孤舟。</strong>"
   }
  ],
  "chapter": "01 / 动能的诅咒"
 },
 {
  "name": "往返的零和",
  "duration": 12,
  "title": [
   "物理学从不",
   "封锁道路。",
   "<em>是我们的方式错了。</em>"
  ],
  "copy": "同一系统完成往返，回到原来的位置与运动状态。<br>势能变化抵消，动能完整回收。",
  "coordinate": "ASTRAL RAIL / 2222",
  "mode": "cycle",
  "class": "technical physics-cycle",
  "extra": "<p class=\"physics-condition\">闭合系统 · 同一参考系 · 理想可逆</p>",
  "beats": [
   {
    "at": 0,
    "title": [
     "物理学从不",
     "封锁道路。",
     "<em>是我们的方式错了。</em>"
    ],
    "copy": "去程把能量交给货物，返程把它收回来。<br>完整闭环，回到相同的机械状态。"
   },
   {
    "at": 6,
    "title": [
     "一个完备往返系统，",
     "<em>理论净功是零。</em>"
    ],
    "copy": "在这个理想可逆的闭环里，送去建材，再接回矿石。<br><strong>大自然允许外部净补能为零。</strong>"
   }
  ],
  "chapter": "02 / 守恒的破局"
 },
 {
  "name": "把发动机留给星体",
  "duration": 10,
  "title": [
   "不要把发动机",
   "装在车厢上。",
   "<em>把推力和刹车，留在车站。</em>"
  ],
  "copy": "让刹车变成发电，让到站化作充能。<br>能量没有消失，只是在相反的轨道间换了一班车。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-engineering",
  "class": "technical exchange-scene",
  "beats": [
   {
    "at": 0,
    "title": [
     "不要把发动机",
     "装在车厢上。",
     "<em>把推力和刹车，留在车站。</em>"
    ],
    "copy": "让刹车变成发电，让到站化作充能。"
   },
   {
    "at": 4.7,
    "title": [
     "抵达者的减速，",
     "<em>就是出发者的引擎。</em>"
    ],
    "copy": "进站货舱交出动能，经本站母线与储能调度，供给下一班。<br>能量没有消失，只是在相反的轨道间换了一班车。"
   }
  ],
  "chapter": "02 / 守恒的破局",
  "outside": "<iframe id=\"exchange-frame\" class=\"exchange-preview\" title=\"本站母线与双向货舱的动能交换\" tabindex=\"-1\"></iframe>"
 },
 {
  "name": "行星级传送带",
  "duration": 12,
  "title": [
   "它不是飞船，",
   "<em>它是行星级的传送带。</em>"
  ],
  "copy": "无需把导轨密铺成圆环。独立模块间，货舱自由飞行；<br>进入下一模块，再接受加速、减速与轨迹校正。",
  "coordinate": "ASTRAL RAIL / 2222",
  "mode": "orbit",
  "class": "technical orbital-system",
  "extra": "<ol class=\"engineering-list\"><li>升轨接驳 <span>地表 → 轨道港</span></li><li>离散电磁模块 <span>自由飞行 → 入段受力</span></li><li>离港转移 <span>校准速度矢量 → 深空航路</span></li></ol>",
  "caption": "分离模块主动维持构型，承担反作用力。高速绕行所需导向由模块提供，间隙中不凭空转弯。",
  "chapter": "03 / 轨道的动脉"
 },
 {
  "name": "对称速度段",
  "duration": 10,
  "title": [
   "每一段导轨，",
   "<em>都是一对能量天平。</em>"
  ],
  "copy": "同一组电磁设备，处理同一速度区间的出发与抵达。<br>本站母线回收制动电能，储能设备平衡班次与功率。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-engineering",
  "class": "bands technical",
  "outside": "<div class=\"speed-bands\"><div class=\"speed-band\">10.0 ⇄ 10.1 km/s<small>脉冲注入 ↔ 感应回馈</small><i></i><i class=\"return-pulse\"></i></div><div class=\"speed-band\">10.1 ⇄ 10.2 km/s<small>设备复用 · 动能转存</small><i></i><i class=\"return-pulse\"></i></div><div class=\"speed-band\">10.2 ⇄ 10.3 km/s<small>功率调度 · 外网补损</small><i></i><i class=\"return-pulse\"></i></div></div>",
  "chapter": "03 / 轨道的动脉"
 },
 {
  "name": "单段动能交换核心演示",
  "duration": 32,
  "chapter": "03 / 轨道的动脉",
  "class": "principle-embedded",
  "embed": "principle.html?embed=1&v=20261026-epic3",
  "coordinate": "1 t / 10.0 ⇄ 10.1 km/s"
 },
 {
  "name": "地火全周期交联",
  "duration": 22,
  "title": [
   "地球把货舱扔出去。",
   "<em>火星把货舱抓下来。</em>"
  ],
  "copy": "火星回收抵达货舱的动能，再送出另一班矿石。<br>一去一回，宇宙换了一批原子，能量留在运输系统里。",
  "coordinate": "ASTRAL RAIL / 2222",
  "mode": "transport",
  "class": "transport",
  "extra": "<p class=\"route-spec\">5500万公里近距航段示意 · 深空段无随舱工质推进 · 两端再生制动</p>",
  "caption": "设计转移航路随行星位置变化；理想闭环之外，外部能源补足损耗与轨道调整。",
  "chapter": "03 / 轨道的动脉"
 },
 {
  "name": "资产沉淀",
  "duration": 8,
  "title": [
   "货物终会消耗殆尽。",
   "<em>轨道，是留给未来的资产。</em>"
  ],
  "copy": "第一批建材被盖成工厂。<br>今天建成的加速模块、捕获站与储能母线，将继续吞吐两个世纪的日出日落。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-marsport",
  "chapter": "03 / 轨道的动脉"
 },
 {
  "name": "狂野西部与荒凉火星",
  "duration": 36,
  "title": [
   "马匹让人类抵达。",
   "<em>铁道让文明留下。</em>"
  ],
  "copy": "",
  "coordinate": "ASTRAL RAIL / 2222",
  "class": "logic-story history-story",
  "story": [
   {
    "image": "west-rider",
    "duration": 4,
    "title": [
     "我们曾经走过",
     "<em>完全相同的路。</em>"
    ],
    "line": "",
    "kind": "past"
   },
   {
    "image": "west-rider",
    "duration": 5,
    "title": [
     "第一次翻越内华达山脉，",
     "<em>拓荒者骑马。</em>"
    ],
    "line": "因为远方没有路，你只能自带干粮与马料。",
    "kind": "past"
   },
   {
    "image": "west-settlement",
    "duration": 5,
    "title": [
     "但荒野要长成城市，",
     "就不能让每一加仑牛奶，",
     "<em>都承担买一匹马的代价。</em>"
    ],
    "line": "",
    "kind": "past settlement"
   },
   {
    "image": "west-railway",
    "duration": 6,
    "title": [
     "于是文明",
     "<em>铺设了铁轨。</em>"
    ],
    "line": "把动力的成本，分摊给随后的一千万次往返。",
    "kind": "past rail"
   },
   {
    "image": "independent-freighter",
    "duration": 6,
    "title": [
     "今天的深空化学飞船，",
     "<em>就是当年那匹疲惫的马。</em>"
    ],
    "line": "每一次昂贵的单程补给，都在重复耗尽文明的积蓄。",
    "kind": "ship"
   },
   {
    "image": "mars-frontier",
    "duration": 5,
    "title": [
     "今天的火星，",
     "<em>就是那座等待长大的荒原小镇。</em>"
    ],
    "line": "",
    "kind": "settlement"
   },
   {
    "image": "orbit-hero",
    "duration": 5,
    "title": [
     "马匹让人类抵达。",
     "<em>铁道让文明留下。</em>"
    ],
    "line": "",
    "kind": "rail"
   }
  ],
  "chapter": "04 / 文明的必然"
 },
 {
  "name": "文明的收敛方向",
  "duration": 9,
  "title": [
   "探索可以不惜代价。",
   "<em>文明不能永远远征。</em>"
  ],
  "copy": "科学可以承担昂贵的“第一次”；<br>工业文明无法依靠昂贵的方式维持“第一万次”。<br><strong>不修铁路，火星就只能是科研的哨卡，无法成为工业的故乡。</strong>",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-engineering",
  "class": "inevitability",
  "chapter": "04 / 文明的必然"
 },
 {
  "name": "跨越代际的种子",
  "duration": 9,
  "title": [
   "派出第一艘船，",
   "不是去殖民，",
   "<em>而是去远方建一座车站。</em>"
  ],
  "copy": "一千吨工程船，带上机床、核能与机器人。<br>它带去的，是一座星际母港的受精卵。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "stellar-network",
  "class": "seedship",
  "extra": "<p class=\"route-spec\">2300 年 · 种子出发 / 首航自备减速系统</p>",
  "chapter": "05 / 群星的复利"
 },
 {
  "name": "两代人的航程",
  "duration": 10,
  "title": [
   "一代人负责发射。",
   "<em>一代人在等待中老去。</em>"
  ],
  "copy": "2300年出发，2352年抵达。4.24光年，0.1c巡航。<br>两端按0.01g加减速，52.1年，把远方变成一个可以抵达的地点。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "stellar-network",
  "mode": "voyage",
  "class": "voyage",
  "extra": "<div class=\"travel-profile\"><div><b>9.7</b><span>年 · 加速</span></div><div><b>32.7</b><span>年 · 巡航</span></div><div><b>9.7</b><span>年 · 减速</span></div><div><b>52.1</b><span>年 · 全程</span></div></div>",
  "chapter": "05 / 群星的复利"
 },
 {
  "name": "十二年，织出一座新港",
  "duration": 8,
  "title": [
   "十二年，",
   "<em>在陌生恒星下建成一座车站。</em>"
  ],
  "copy": "2352—2364。采掘、冶炼、制造，模块逐段就位。<br>当车站准备接车，深渊就退化成一段可以再次发车的区间。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "first-starport",
  "mode": "assembly",
  "class": "technical assembly-scene",
  "chapter": "05 / 群星的复利"
 },
 {
  "name": "来自群星的报文",
  "duration": 8,
  "title": [
   "“本站已就绪。",
   "<em>可以接收下一班。”</em>"
  ],
  "copy": "2368年，太阳系收到这封飞行了4.24年的回信。<br>第二班货运，将于约2420年抵达。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "first-starport",
  "class": "message",
  "outside": "<div class=\"signal-indicator\"><i></i><i></i><i></i></div><div class=\"terminal-report\"><span>SIGNAL RECEIVED // 2368 A.D.</span><p>PROXIMA TERMINAL READY.<br>CLEAR TO DISPATCH NEXT TRAIN.</p></div>",
  "chapter": "05 / 群星的复利"
 },
 {
  "name": "群星的复利",
  "duration": 12,
  "title": [
   "每一座新港落成，",
   "<em>就是两个新方向的起点。</em>"
  ],
  "copy": "这不是渐进式的探索，这是指数级的自我复制。<br>第六轮接力完成，一百二十七颗太阳，被连进同一张文明网络。",
  "coordinate": "ASTRAL RAIL / 2222",
  "mode": "network",
  "class": "technical network",
  "extra": "<div class=\"metrics\"><div class=\"metric\"><strong data-counter=\"network\">1<small>座</small></strong><span>累计成熟恒星港</span></div><div class=\"metric\"><strong >384<small>年</small></strong><span>六轮代际接力</span></div></div><p class=\"network-scale\">1 → 3 → 7 → 15 → 31 → 63 → 127<br>约20光年尺度 · 网络布局示意</p>",
  "chapter": "05 / 群星的复利"
 },
 {
  "name": "回到第一条干线",
  "duration": 10,
  "title": [
   "群星在未来。",
   "<em>但路，必须始于眼前的账本。</em>"
  ],
  "copy": "抛弃情怀的迷雾。<br>用长期货流摊薄初始重资产，让远征的开支，变成通行的收入。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-marsport",
  "class": "commercial",
  "extra": "<div class=\"metrics\"><div class=\"metric\"><strong >4,000<small>信用点 / 吨</small></strong><span>综合交付运价</span></div><div class=\"metric\"><strong >1<small>亿吨 / 年</small></strong><span>双向基准货流</span></div><div class=\"metric\"><strong >98.5<small>%</small></strong><span>较26.7万信用点/吨对照航价下降</span></div></div>",
  "chapter": "06 / 眼前的账本"
 },
 {
  "name": "冰冷的账本",
  "duration": 12,
  "title": [
   "六十年货流，",
   "<em>兑现今天铺下的路。</em>"
  ],
  "copy": "每一批通过模块的矿石与机床，都在兑现运输能力的价值。<br>按年货量1亿吨、运价4000信用点，年收入4000亿，净现金流3200亿。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-marsport",
  "class": "financial",
  "extra": "<div class=\"metrics\"><div class=\"metric\"><strong >3,200<small>亿信用点 / 年</small></strong><span>成熟年净现金流</span></div><div class=\"metric\"><strong >9.47<small>%</small></strong><span>全项目 IRR</span></div><div class=\"metric\"><strong >＋2.16<small>万亿信用点</small></strong><span>NPV · 5%折现</span></div></div>",
  "outside": "<div class=\"cash-chart\" id=\"cash-chart\"></div>",
  "caption": "可变成本600信用点/吨，固定运营与更新储备200亿信用点/年；建设8年，经营60年。",
  "chapter": "06 / 眼前的账本"
 },
 {
  "name": "破土之时",
  "duration": 9,
  "title": [
   "八年建设，",
   "<em>开启六十年货流红利。</em>"
  ],
  "copy": "接入既有太空电梯网络。<br>用模块化建设，把资本落到每一段加速站、每一处捕获港。",
  "coordinate": "ASTRAL RAIL / 2222",
  "bg": "orbit-engineering",
  "class": "capital",
  "extra": "<div class=\"metrics\"><div class=\"metric\"><strong >24,000<small>亿信用点</small></strong><span>首期全线总预算</span></div></div>",
  "outside": "<div class=\"funding-bars\"><div class=\"funding-row\"><span>电磁模块与主动构型维持</span><b>33.3%</b><i style=\"--allocation:33.3%\"></i></div><div class=\"funding-row\"><span>能源、超导储能与母线</span><b>16.7%</b><i style=\"--allocation:16.7%\"></i></div><div class=\"funding-row\"><span>捕获站与转向枢纽</span><b>16.7%</b><i style=\"--allocation:16.7%\"></i></div><div class=\"funding-row\"><span>智能货舱与接驳系统</span><b>8.3%</b><i style=\"--allocation:8.3%\"></i></div><div class=\"funding-row\"><span>工程验证与建设预备</span><b>25.0%</b><i style=\"--allocation:25.0%\"></i></div></div>",
  "chapter": "06 / 眼前的账本"
 },
 {
  "name": "参与建造文明的大动脉",
  "duration": 14,
  "title": [
   "星穹铁道 · 2222"
  ],
  "copy": "",
  "coordinate": "ASTRAL RAIL / 2222",
  "class": "investment logic-story finale-story",
  "story": [
   {
    "image": "orbit-hero",
    "duration": 3,
    "title": [
     "首轮开工资本金",
     "<em>1,200 亿信用点</em>"
    ],
    "line": "全线预算的5%。让第一段工程先运转。",
    "kind": "capital-call"
   },
   {
    "image": "orbit-hero",
    "duration": 4,
    "title": [
     "物理定律给出了答案。",
     "历史经验指明了方向。",
     "<em>商业模型完成了闭环。</em>"
    ],
    "line": "",
    "kind": "verdict"
   },
   {
    "image": "orbit-hero",
    "duration": 3,
    "title": [
     "这一代人，注定要铺下",
     "<em>群星间的第一根铁轨。</em>"
    ],
    "line": "",
    "kind": "generation"
   },
   {
    "image": "orbit-hero",
    "duration": 4,
    "title": [
     "<em>星穹铁道 · 2222</em>",
     "参与建造文明的大动脉。"
    ],
    "line": "",
    "kind": "film-title"
   }
  ],
  "outside": "<div class=\"finale-action\"><button class=\"gold-button\" id=\"invest-open\">参与首轮联合建设 ↗</button><a href=\"explore.html#business\">打开商业模型 →</a></div>",
  "chapter": "06 / 眼前的账本"
 }
];
const total = SCENES.reduce((sum,s)=>sum+s.duration,0);
const offsets = SCENES.map((_,i)=>SCENES.slice(0,i).reduce((sum,s)=>sum+s.duration,0));
const elements = SCENES.map((s,i)=>{
 const el=document.createElement('section');el.className=`scene ${s.class||''}`;el.dataset.scene=String(i);el.setAttribute('aria-hidden','true');el.setAttribute('aria-label',s.name);
 el.innerHTML=s.embed?`<div class="principle-embed"><iframe id="principle-frame" src="${s.embed}" title="星穹铁道原理拆解：分段加速、再生制动与能量回收" tabindex="-1"></iframe></div>`:`${s.bg?`<img class="scene-bg" src="assets/${s.bg}.webp?v=20261026-epic3" alt="" aria-hidden="true">`:''}<div class="scene-shade"></div><div class="scene-large-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</div><div class="scene-content"><p class="eyebrow">${s.eyebrow||''}</p><h1>${s.title.map((line,j)=>`<span class="line" style="--i:${j}">${line}</span>`).join('')}</h1><p class="body-copy">${s.copy}</p>${s.extra||''}</div>${s.outside||''}<p class="scene-caption">${s.caption||''}</p>`;
 if(s.story){el.insertAdjacentHTML('beforeend',`<div class="story-visuals" aria-hidden="true">${s.story.map((shot,j)=>`<div class="story-visual ${shot.kind}" data-shot="${j}"><img class="story-bg" src="assets/${shot.image}.webp?v=20261026-epic3" alt=""><div class="story-shade"></div></div>`).join('')}</div><div class="story-titles">${s.story.map((shot,j)=>`<div class="story-copy ${shot.kind}" data-shot="${j}" aria-hidden="true"><h2>${shot.title.map(line=>`<span>${line}</span>`).join('')}</h2>${shot.line?`<p>${shot.line}</p>`:''}</div>`).join('')}</div>`);s.visuals=[...el.querySelectorAll('.story-visual')];s.titles=[...el.querySelectorAll('.story-copy')];}
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
const score=createCinemaScore('assets/astral-rail-score.mp3?v=20261026-epic3',total,()=>{soundOn=false;updateMusicControl();$('music-start').hidden=false;toast('配乐暂未开启，请再点一次“配乐”。');});
function syncAudio(){score.sync(offsets[index]+elapsed,playing&&!finished&&!document.querySelector('dialog[open]'),speed,!document.hidden);}
function updateMusicControl(){const b=$('sound-toggle');b.setAttribute('aria-pressed',String(soundOn));b.setAttribute('aria-label',soundOn?'关闭配乐':'开启配乐');b.querySelector('span').textContent=soundOn?'开':'关';if(soundOn)$('music-start').hidden=true;}
async function setMusicEnabled(value){soundOn=value;updateMusicControl();syncAudio();try{await score.setEnabled(value);}catch{soundOn=false;updateMusicControl();}}
const principleIndex=SCENES.findIndex(s=>s.embed),principleFrame=$('principle-frame'),principleOrigin=location.protocol==='file:'?'*':location.origin;
let principleProgress=0;
function syncPrinciple(active=index===principleIndex){if(active)principleProgress=Math.min(1,Math.max(0,elapsed/SCENES[principleIndex].duration));principleFrame?.contentWindow?.postMessage({type:'astral-principle',action:'sync',progress:principleProgress,playing:active&&playing&&!finished&&!document.hidden&&!document.querySelector('dialog[open]')},principleOrigin);}
principleFrame?.addEventListener('load',()=>syncPrinciple());
const exchangeFrame=$('exchange-frame');exchangeFrame.src=SCENES[principleIndex].embed;
function syncExchange(){exchangeFrame.contentWindow?.postMessage({type:'astral-principle',action:'sync',preview:true,progress:index===3?.14+.64*(elapsed/10):.14,playing:index===3&&playing&&!finished},principleOrigin);}
exchangeFrame.addEventListener('load',syncExchange);

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
 $('diagram-stage').className=`diagram-stage ${s.mode?'visible':''} ${s.mode==='transport'?'transport-stage':''} ${s.mode==='network'?'network-stage':''} ${['energy','cycle','exchange','assembly','voyage'].includes(s.mode)?'physics-stage':''}`;
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
  const fast=s.class?.includes('hook-story');const imageAlpha=i?(fast?Number(t>=start):smooth(start-.6,start+.9,t)):1;
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
 elements[index].dataset.storyShot=String(activeShot);const number=elements[index].querySelector('.hook-number');if(number){const k=Math.max(0,Math.min(1,(t-8)/.85));number.textContent=Math.round(1388888889*(1-(1-k)**3)).toLocaleString('en-US');}
}
function updateBeats(s,el,t){
 const i=s.beats.findLastIndex(b=>b.at<=t),b=s.beats[Math.max(0,i)],end=s.beats[i+1]?.at??s.duration;
 if(el.dataset.beat!==String(i)){el.querySelector('h1').innerHTML=b.title.map(line=>`<span class="line">${line}</span>`).join('');el.querySelector('.body-copy').innerHTML=b.copy;el.dataset.beat=String(i);}
 const a=Math.min(smooth(b.at,b.at+.45,t),i===s.beats.length-1?1:1-smooth(end-.3,end,t));
 el.querySelector('h1').style.opacity=a;el.querySelector('.body-copy').style.opacity=a;
}
function updateFrame(){syncAudio();const s=SCENES[index],p=Math.min(1,elapsed/s.duration),el=elements[index];el.style.setProperty('--p',reducedMotion?0:p);if(s.story)updateStory(s,elapsed);if(s.beats)updateBeats(s,el,elapsed);el.style.setProperty('--chart-p',Math.min(1,Math.max(0,(p-.1)/.6)));el.style.setProperty('--bar-p',Math.min(1,Math.max(0,(p-.1)/.7)));buttons[index].style.setProperty('--fill',`${p*100}%`);$('elapsed-time').textContent=timecode(offsets[index]+elapsed);el.querySelectorAll('.speed-band').forEach((b,i)=>{b.classList.toggle('active',Math.floor(elapsed/3.1)%3===i);b.style.setProperty('--pulse-p',(elapsed%1.8)/1.8);b.style.setProperty('--pulse-alpha',Math.sin((elapsed%1.8)/1.8*Math.PI));});const count=el.querySelector('[data-counter="network"]');if(count){const gen=Math.min(6,Math.floor(Math.min(1,p/.85)*6+1e-8));count.innerHTML=`${2**(gen+1)-1}<small>座</small>`;}if(['energy','cycle','exchange','assembly','voyage'].includes(s.mode))drawPhysics(dc,{mode:s.mode,progress:p,time:filmTime*1000,width:diagramWidth,height:diagramHeight});else if(s.mode)drawDiagram(dc,{mode:s.mode,progress:s.mode==='network'?Math.min(1,p/.85):s.mode==='transport'?Math.min(1,p/.93):p,time:filmTime*1000,width:diagramWidth,height:diagramHeight});else dc.clearRect(0,0,diagramWidth,diagramHeight);if(s.embed)syncPrinciple();if(index===3)syncExchange();el.style.setProperty('--terminal-alpha',smooth(3.5,4.3,elapsed));el.style.setProperty('--final-action',smooth(10,11,elapsed));}
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


