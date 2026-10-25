import { calculateFinance } from './finance.js';

const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n, digits = 0) => Number(n).toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
document.documentElement.classList.add('js');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: .06 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const chapters = [...document.querySelectorAll('main > .chapter')];
const chapterNames = ['序 / 出发', '01 / 文明逻辑', '02 / 行星工程', '原理 / 能量周转', '演示 / 地火发车', '03 / 通向群星', '04 / 商业与投资', '终 / 下一次出发'];
let currentChapter = 0, presentationMode = false;
let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress i').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  let index = 0;
  chapters.forEach((el, i) => { if (el.getBoundingClientRect().top <= innerHeight * .4) index = i; });
  currentChapter = index;
  $('chapter-label').textContent = chapterNames[index];
  const id = chapters[index].id;
  const activeNav = ['principle', 'simulation'].includes(id) ? 'engineering' : id === 'departure' ? 'business' : id;
  document.querySelectorAll('.nav nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${activeNav}`));
}
addEventListener('scroll', () => { if (!scrollQueued) { requestAnimationFrame(updateScroll); scrollQueued = true; } }, { passive: true });
updateScroll();

function rangeFill(el) { el.style.setProperty('--range-fill', `${(el.value - el.min) / (el.max - el.min) * 100}%`); }
document.querySelectorAll('input[type=range]').forEach(el => { rangeFill(el); el.addEventListener('input', () => rangeFill(el)); });

// A lightweight, deterministic star field, suspended when the hero is offscreen.
const canvas = $('starfield'), context = canvas.getContext('2d');
let starWidth = 0, starHeight = 0, starsVisible = true;
const points = Array.from({ length: 78 }, (_, i) => ({ x: ((i * 73 + 29) % 997) / 997, y: ((i * 137 + 11) % 991) / 991, r: i % 4 === 0 ? 1.3 : .65, phase: i * 2.4 }));
function sizeStars() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  starWidth = canvas.clientWidth; starHeight = canvas.clientHeight;
  canvas.width = starWidth * dpr; canvas.height = starHeight * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeStars(); addEventListener('resize', sizeStars);
new IntersectionObserver(entries => { starsVisible = entries[0].isIntersecting; }).observe($('home'));
let lastStarFrame = 0;
function paintStars(time = 0) {
  if (starsVisible && !document.hidden && time - lastStarFrame > 45) {
    lastStarFrame = time;
    context.clearRect(0, 0, starWidth, starHeight);
    for (const p of points) { context.globalAlpha = reduceMotion ? .6 : .35 + .3 * Math.sin(time / 1800 + p.phase); context.fillStyle = '#e8f2ef'; context.beginPath(); context.arc(p.x * starWidth, p.y * starHeight, p.r, 0, Math.PI * 2); context.fill(); }
  }
  requestAnimationFrame(paintStars);
}
requestAnimationFrame(paintStars);

const deltaK = .5 * 1000 * (10100 ** 2 - 10000 ** 2) / 3.6e6;
function updateEnergy() {
  const rate = +$('recovery').value / 100;
  const recovered = deltaK * rate, net = deltaK - recovered;
  $('recovery-value').textContent = `${fmt(rate * 100)}%`;
  $('out-energy').textContent = `＋${fmt(deltaK, 1)} kWh / 吨`;
  $('in-energy').textContent = `回收 ${fmt(recovered, 1)} kWh / 吨`;
  $('net-energy').textContent = fmt(net, 1);
  $('energy-caption').textContent = rate === 1 ? '理想可逆、机械能配平：这一速度段的净补能为零。' : `把${fmt(deltaK, 1)} kWh的加速需求，压到${fmt(net, 1)} kWh的补能。`;
}
$('recovery').addEventListener('input', updateEnergy); updateEnergy();

// The animation follows six process stages, with a deliberately compressed clock.
const phases = [
  { title: '升轨接驳', sub: '地表货物，进入真空作业区。', desc: '升轨设施把地表货物送入真空环轨，完成交接。' },
  { title: '分段加速', sub: '一圈又一圈，把电能变成速度。', desc: '货舱反复经过分段导轨。每段只负责指定速度区间，加速设施留在车站。' },
  { title: '转向离港', sub: '对准窗口，驶入转移轨道。', desc: '转向站按行星相位与载荷条件调整方向，让货舱进入通往火星的日心航路。' },
  { title: '深空巡航', sub: '一批货物，跨越两个世界。', desc: '货舱沿设计航路巡航；太阳引力参与塑造轨道，导航与修正持续工作。' },
  { title: '捕获与回收', sub: '速度回到车站，成为下一班的电。', desc: '目的端按速度分段制动，回收电能进入火星本站储能与母线，支持本地下一次出发。' },
  { title: '抵达交付', sub: '货物进站，城市继续生长。', desc: '货舱经升降与港务系统交付。机床进入工厂，材料进入工地，下一班货运准备出发。' },
];
const cargo = $('sim-cargo'), route = $('flight-path'), routeLength = route.getTotalLength();
let simTime = 0, simPlaying = false, simLastTime = 0, simPhase = -1, simRequest = 0;
const phaseDuration = 3600, totalTime = phaseDuration * 6;
function lerp(a, b, t) { return a + (b - a) * t; }
function setCargo(x, y, angle = 0) { cargo.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})`); }
function routePoint(p) { return route.getPointAtLength(Math.max(0, Math.min(1, p)) * routeLength); }
function renderSimulation() {
  const phase = Math.min(5, Math.floor(simTime / phaseDuration));
  const u = Math.min(1, (simTime - phase * phaseDuration) / phaseDuration);
  if (phase !== simPhase) {
    simPhase = phase;
    document.querySelectorAll('[data-phase]').forEach(el => el.classList.toggle('active', +el.dataset.phase === phase));
    $('sim-description').textContent = phases[phase].desc;
    $('sim-large-stage').textContent = phases[phase].title;
    $('sim-large-sub').textContent = phases[phase].sub;
    $('sim-status').textContent = `${String(phase + 1).padStart(2, '0')} / ${phases[phase].title}`;
  }
  if (phase === 0) setCargo(lerp(265, 327, u), lerp(299, 232, u), -42);
  if (phase === 1) { const angle = -.65 - u * Math.PI * 6; const x = Math.cos(angle) * 143, y = Math.sin(angle) * 42; const r = -25 * Math.PI / 180; setCargo(270 + x * Math.cos(r) - y * Math.sin(r), 277 + x * Math.sin(r) + y * Math.cos(r), -25 + angle * 180 / Math.PI); }
  if (phase === 2) { const p = routePoint(u * .08); setCargo(p.x, p.y, -35); }
  if (phase === 3) { const p = routePoint(.08 + u * .84); const next = routePoint(.081 + u * .84); setCargo(p.x, p.y, Math.atan2(next.y - p.y, next.x - p.x) * 180 / Math.PI); }
  if (phase === 4) { const angle = -2.2 + u * Math.PI * 2; const x = Math.cos(angle) * 121, y = Math.sin(angle) * 37; const r = -25 * Math.PI / 180; setCargo(930 + x * Math.cos(r) - y * Math.sin(r), 277 + x * Math.sin(r) + y * Math.cos(r), -25 + angle * 180 / Math.PI); }
  if (phase === 5) setCargo(lerp(1014, 934, u), lerp(239, 274, u), -25);
  $('sim-arrival').setAttribute('opacity', phase === 4 ? String(.4 + Math.sin(u * Math.PI * 6) * .4) : '0');
  $('sim-progress-path').setAttribute('d', `M480 349H${480 + Math.min(1, simTime / totalTime) * 240}`);
  if (simTime >= totalTime) { $('sim-status').textContent = '交付完成 / DELIVERED'; $('sim-large-stage').textContent = '第一班，已抵达。'; }
}
function setPlayLabel() { $('sim-play').innerHTML = simPlaying ? '暂停演示 <span>Ⅱ</span>' : simTime >= totalTime ? '再发一班 <span>↻</span>' : simTime > 0 ? '继续发车 <span>▶</span>' : '启动发车 <span>▶</span>'; }
function frame(time) {
  if (!simPlaying) return;
  if (simLastTime) simTime = Math.min(totalTime, simTime + Math.min(80, time - simLastTime));
  simLastTime = time; renderSimulation();
  if (simTime >= totalTime) { simPlaying = false; setPlayLabel(); return; }
  simRequest = requestAnimationFrame(frame);
}
$('sim-play').addEventListener('click', () => { simPlaying = !simPlaying; if (simTime >= totalTime) simTime = 0; simLastTime = 0; setPlayLabel(); if (simPlaying) simRequest = requestAnimationFrame(frame); else cancelAnimationFrame(simRequest); });
$('sim-reset').addEventListener('click', () => { simPlaying = false; simTime = 0; simLastTime = 0; simPhase = -1; cancelAnimationFrame(simRequest); renderSimulation(); $('sim-status').textContent = '货舱待命 / READY'; setPlayLabel(); });
document.querySelectorAll('[data-phase]').forEach(el => el.addEventListener('click', () => { simPlaying = false; cancelAnimationFrame(simRequest); simTime = +el.dataset.phase * phaseDuration + 200; simPhase = -1; renderSimulation(); setPlayLabel(); }));
document.addEventListener('visibilitychange', () => { simLastTime = 0; });
renderSimulation(); $('sim-status').textContent = '货舱待命 / READY';

const story = {
  2300: { date: '2300 / 太阳系母港', title: '我们送出去的，<br>是一座未来的车站。', copy: '1000吨级种子工程船，携带能源、机器人、加工设备与设计档案出发。它必须自主减速，因为目的地还没有人替它刹车。', number: '52.1年后，抵达。' },
  2352: { date: '2352 / 比邻星系统', title: '第一张出发清单，<br>终于得到回执。', copy: '首船减速抵达。机器人开始勘探、加工、建立能源设施。一座新工业节点从船上的图纸变成眼前的机器。', number: '再用12年，造出接收港。' },
  2364: { date: '2364 / 第一座恒星际接收港', title: '一颗陌生恒星旁，<br>出现了人类的站台。', copy: '本地工业与接收设施开始运转。导航、通信和分布式制动支援逐步接入，车站将开港消息发送回太阳系。', number: '电波向故乡出发，还需4.24年。' },
  2368: { date: '2368 / 太阳系母港', title: '“本站已就绪。<br>可以接收下一班。”', copy: '这条消息越过4.24光年，抵达母港。如果收到回执即启航，第二班货运将在约2420年抵达。它的目的地，已经有一座车站。', number: '第一艘船抵达以后，下一次出发有了车站。' },
};
const yearButtons = [...document.querySelectorAll('[data-year]')];
function selectYear(year) { const data = story[year]; yearButtons.forEach(btn => { const active = btn.dataset.year === String(year); btn.classList.toggle('active', active); btn.setAttribute('aria-selected', String(active)); btn.tabIndex = active ? 0 : -1; }); $('star-story-panel').setAttribute('aria-labelledby', `year-tab-${year}`); $('story-date').textContent = data.date; $('story-title').innerHTML = data.title; $('story-copy').textContent = data.copy; $('story-number').textContent = data.number; }
yearButtons.forEach((btn, i) => { btn.addEventListener('click', () => selectYear(btn.dataset.year)); btn.addEventListener('keydown', e => { let target = i; if (e.key === 'ArrowRight') target = (i + 1) % 4; else if (e.key === 'ArrowLeft') target = (i + 3) % 4; else if (e.key === 'Home') target = 0; else if (e.key === 'End') target = 3; else return; e.preventDefault(); yearButtons[target].focus(); selectYear(yearButtons[target].dataset.year); }); }); selectYear(2300);

function updateNetwork() {
  const n = +$('generations').value;
  $('generation-value').textContent = `第${n}轮`;
  $('network-count').textContent = String(2 ** (n + 1) - 1);
  $('network-years').textContent = String(n * 64);
  $('network-years').parentElement.lastChild.textContent = ` 年 / ${n}轮接力`;
  const positions = new Map(); let lines = '', nodes = '';
  for (let level = 0; level <= n; level++) {
    const count = 2 ** level;
    for (let i = 0; i < count; i++) {
      const x = n === 0 ? 320 : 20 + level * (600 / n), y = 15 + (i + .5) * (300 / count);
      positions.set(`${level}-${i}`, { x, y });
      if (level) { const p = positions.get(`${level - 1}-${Math.floor(i / 2)}`); lines += `<path d="M${p.x},${p.y}L${x},${y}" stroke="${level === n ? '#dfb86d70' : '#70dce540'}" stroke-width="${level < 3 ? 1.2 : .8}"/>`; }
      nodes += `<circle cx="${x}" cy="${y}" r="${level === 0 ? 5 : Math.max(1.7, 4 - level * .4)}" fill="${level === n ? '#dfb86d' : '#70dce5'}"/>`;
    }
  }
  $('network-graph').innerHTML = `<title>${n}轮建港，累计${2 ** (n + 1) - 1}座成熟港</title>${lines}${nodes}`;
}
$('generations').addEventListener('input', updateNetwork); updateNetwork();

let financialInputs, currentFinance;
function updateFinance() {
  financialInputs = { volumeMt: +$('volume').value, fee: +$('fee').value, capexTrillion: +$('capex').value };
  currentFinance = calculateFinance(financialInputs);
  const f = currentFinance;
  $('volume-label').textContent = `${fmt(financialInputs.volumeMt / 100, 2)} 亿吨`;
  $('fee-label').textContent = `${fmt(financialInputs.fee)} 信用点`;
  $('capex-label').textContent = `${fmt(financialInputs.capexTrillion, 2)} 万亿信用点`;
  $('cash-result').innerHTML = `${fmt(f.annualCashBillion * 10)}<small>亿信用点</small>`;
  $('irr-result').innerHTML = f.irr === null ? '—<small>无正现金回报</small>' : `${fmt(f.irr * 100, 2)}<small>%</small>`;
  const payback = f.staticOperatingPaybackYears;
  $('payback-result').innerHTML = payback === null || payback > 60 ? '—<small>经营期内未回收</small>' : `${fmt(payback, 1)}<small>年</small>`;
  $('npv-result').innerHTML = `${f.npvBillion >= 0 ? '＋' : '−'}${fmt(Math.abs(f.npvBillion) / 1000, 2)}<small>万亿信用点</small>`;
  $('npv-result').style.color = f.npvBillion < 0 ? '#b9c5cc' : '';
  $('finance-insight').textContent = `年运量约${fmt(f.operatingBreakEvenMt * 100)}万吨可覆盖运营与更新；约${fmt(f.breakEvenMt / 100, 2)}亿吨可达到5%折现回本门槛。`;
  drawFinanceChart(f);
}
function drawFinanceChart(f) {
  const series = f.cumulativeCash.map(v => v / 1000);
  const w = 760, h = 250, pad = { left: 45, right: 15, top: 17, bottom: 32 };
  const min = Math.min(-.5, Math.min(...series) * 1.15), max = Math.max(.5, Math.max(...series) * 1.08);
  const x = i => pad.left + i / (series.length - 1) * (w - pad.left - pad.right);
  const y = val => pad.top + (max - val) / (max - min) * (h - pad.top - pad.bottom);
  let grid = '';
  for (let i = 0; i < 5; i++) { const value = min + (max - min) * i / 4, yy = y(value); grid += `<path d="M${pad.left} ${yy}H${w - pad.right}" stroke="#243b49" stroke-width=".7"/><text x="${pad.left - 10}" y="${yy + 4}" text-anchor="end" fill="#8196a6" font-size="10">${fmt(value, 1)}</text>`; }
  const line = series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(' ');
  const area = `${line} L${x(series.length - 1)} ${y(0)} L${x(0)} ${y(0)}Z`;
  let labels = '';
  for (const t of [0, 8, 28, 48, 68]) labels += `<text x="${x(t)}" y="${h - 7}" fill="#8196a6" font-size="10" text-anchor="middle">${t === 0 ? '开工' : t === 8 ? '开通' : 2221 + t}</text>`;
  $('finance-chart').innerHTML = `<title>项目累计现金流，终期${fmt(series.at(-1), 2)}万亿信用点</title><defs><linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dfb86d" stop-opacity=".18"/><stop offset="1" stop-color="#dfb86d" stop-opacity="0"/></linearGradient></defs>${grid}<path d="M${pad.left} ${y(0)}H${w - pad.right}" stroke="#8297a7" stroke-width="1" stroke-dasharray="3 4"/><path d="${area}" fill="url(#cashFill)"/><path d="${line}" fill="none" stroke="#dfb86d" stroke-width="2.5"/><circle cx="${x(8)}" cy="${y(series[8])}" r="3" fill="#70dce5"/>${labels}`;
}
['volume', 'fee', 'capex'].forEach(id => $(id).addEventListener('input', updateFinance));
$('finance-reset').addEventListener('click', () => { $('volume').value = 100; $('fee').value = 4000; $('capex').value = 2.4; ['volume', 'fee', 'capex'].forEach(id => rangeFill($(id))); updateFinance(); });
updateFinance();

function togglePresentation(force) { presentationMode = force ?? !presentationMode; document.body.classList.toggle('presentation-mode', presentationMode); $('mode-toggle').setAttribute('aria-pressed', String(presentationMode)); document.querySelector('.presentation-controls').hidden = !presentationMode; }
function moveChapter(direction) { const next = Math.max(0, Math.min(chapters.length - 1, currentChapter + direction)); chapters[next].scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' }); }
$('mode-toggle').addEventListener('click', () => togglePresentation());
$('exit-mode').addEventListener('click', () => togglePresentation(false));
$('prev-chapter').addEventListener('click', () => moveChapter(-1)); $('next-chapter').addEventListener('click', () => moveChapter(1));
document.addEventListener('keydown', e => { if (!presentationMode || $('invest-dialog').open || /INPUT|TEXTAREA|BUTTON|SUMMARY/.test(e.target.tagName)) return; if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); moveChapter(1); } else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); moveChapter(-1); } else if (e.key === 'Escape') togglePresentation(false); });

const dialog = $('invest-dialog');
$('invest-open').addEventListener('click', () => { dialog.showModal(); updateShare(); });
$('invest-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
function updateShare() { const amount = +$('investment-amount').value, budget = financialInputs.capexTrillion * 10000; $('investment-amount').max = String(Math.round(budget)); $('investment-share').textContent = `相当于当前首期建设投资的${fmt(amount / budget * 100, 2)}%（建设出资比例）`; }
$('investment-amount').addEventListener('input', updateShare);
let toastTimeout;
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('toast').classList.remove('visible'), 4000); }
$('invest-form').addEventListener('submit', e => {
  e.preventDefault(); if (!e.target.reportValidity()) return;
  const name = $('investor-name').value.trim(); if (!name) return;
  const amount = +$('investment-amount').value, f = currentFinance;
  const proposal = ['星穹铁道计划 · 2222', '地球—火星货运干线 / 投资参与提案', '', `投资方：${name}`, `拟参与建设金额：${fmt(amount)} 亿信用点`, `占当前首期建设投资比例：${fmt(amount / (financialInputs.capexTrillion * 10000) * 100, 2)}%`, '', '当前商业测算参数', `首期建设投资：${fmt(financialInputs.capexTrillion, 2)} 万亿信用点`, `成熟年双向货量：${fmt(financialInputs.volumeMt / 100, 2)} 亿吨`, `每吨综合运价：${fmt(financialInputs.fee)} 信用点`, '每吨变动成本：600 信用点', '固定运营与更新：200 亿信用点/年', '建设期：8 年；经营期：60 年；折现率：5%', '', '当前测算结果', `成熟年净现金流：${fmt(f.annualCashBillion * 10)} 亿信用点`, `项目内部收益率：${f.irr === null ? '无' : fmt(f.irr * 100, 2) + '%'}`, `5%折现净现值：${fmt(f.npvBillion / 1000, 2)} 万亿信用点`, `经营期静态回收：${f.staticOperatingPaybackYears === null || f.staticOperatingPaybackYears > 60 ? '经营期内未回收' : fmt(f.staticOperatingPaybackYears, 1) + '年'}`, '', '拟议资金用途', '33.3% 电磁环轨与主动支撑', '16.7% 捕获与转向港站', '16.7% 能源、储能与母线', '8.3% 货舱与装卸接驳', '25% 工程验证与建设预备', '', '讨论事项：建设出资与回报安排、货运长约、工程里程碑、港站运营权益。', '本提案用于讨论，具体出资比例与权益由后续协议约定。', '', '让星球成为车站。让群星成为沿途。'].join('\r\n');
  const blob = new Blob(['\ufeff', proposal], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = '星穹铁道_投资参与提案.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  $('proposal-status').textContent = '投资提案已生成，已发起下载。'; toast('投资提案已生成，下一次出发，从这份提案开始。');
});
