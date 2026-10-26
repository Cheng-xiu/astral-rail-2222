// Standalone canvas scenes. All coordinates are CSS pixels; `time` is in ms.
const TAU = Math.PI * 2;
const FONT = '"Microsoft YaHei","PingFang SC",sans-serif';
const C = {
  gold: '#e5bd78', cyan: '#79e0e5', white: '#ecf4f0', muted: '#8ca8ba',
  grid: '#87b4cb', dark: '#07141f', ocean: '#174859',
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const fract = x => x - Math.floor(x);

function line(ctx, points, color, width = 1, alpha = 1) {
  if (!points.length) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke(); ctx.restore();
}

function label(ctx, text, x, y, size = 18, color = C.muted, align = 'left', weight = 400) {
  ctx.save(); ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); ctx.restore();
}

function glow(ctx, x, y, radius, color, strength = .5) {
  ctx.save(); ctx.globalAlpha *= strength;
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color); g.addColorStop(.15, `${color}80`); g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill(); ctx.restore();
}

function scenery(ctx, w, h, t) {
  ctx.save();
  // The photograph belongs to the film. This transparent navigation overlay
  // deliberately has no second sky, landscape, or decorative HUD grid.
  for (let i = 0; i < 28; i++) {
    const x = fract(Math.sin(i * 37.71 + 3) * 43758.54) * w;
    const y = fract(Math.sin(i * 83.19 + 17) * 19417.21) * h;
    ctx.globalAlpha = .07 + .025 * Math.sin(i * 1.7 + t * .24);
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.arc(x, y, .6, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function planet(ctx, x, y, r, kind, t = 0) {
  const mars = kind === 'mars';
  const rim = mars ? '#d6a17a' : '#8ec8d4';
  glow(ctx, x, y, r * 1.17, rim, .05);
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
  // A scientific globe, rather than a low-detail imitation of the film's Earth.
  // Its opaque depth surface correctly masks the far half of the infrastructure.
  const volume = ctx.createRadialGradient(-r * .38, -r * .42, r * .02, r * .16, r * .12, r * 1.12);
  volume.addColorStop(0, mars ? '#3d3029' : '#213b48');
  volume.addColorStop(.48, mars ? '#241f1e' : '#10242f');
  volume.addColorStop(.83, '#071118'); volume.addColorStop(1, '#03090f');
  ctx.fillStyle = volume; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ctx.save(); ctx.rotate(-.18); ctx.strokeStyle = rim; ctx.lineWidth = .62;
  for (let lat = -60; lat <= 60; lat += 20) {
    const a = lat / 180 * Math.PI, yy = Math.sin(a) * r, rr = Math.cos(a) * r;
    ctx.globalAlpha = lat === 0 ? .22 : .105;
    ctx.beginPath(); ctx.ellipse(0, yy, rr, rr * .105, 0, 0, TAU); ctx.stroke();
  }
  for (let lon = -72; lon <= 72; lon += 24) {
    const a = lon / 180 * Math.PI;
    ctx.globalAlpha = .14; ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const lat = -Math.PI / 2 + i / 80 * Math.PI;
      const px = Math.sin(a) * Math.cos(lat) * r, py = Math.sin(lat) * r;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
  const shade = ctx.createLinearGradient(-r, 0, r, r * .5);
  shade.addColorStop(0, '#02080d00'); shade.addColorStop(.5, '#02080d00'); shade.addColorStop(1, '#02080db0');
  ctx.fillStyle = shade; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = rim; ctx.globalAlpha = .38; ctx.lineWidth = .9;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.globalAlpha = .55; ctx.strokeStyle = '#dfecea'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(x, y, r - .6, Math.PI * 1.02, Math.PI * 1.74); ctx.stroke(); ctx.restore();
}

function orbitPoint(o, a) {
  const x = Math.cos(a) * o.rx, y = Math.sin(a) * o.ry;
  return { x: o.x + x * Math.cos(o.tilt) - y * Math.sin(o.tilt), y: o.y + x * Math.sin(o.tilt) + y * Math.cos(o.tilt) };
}

function orbitAngle(o, a, direction = 1) {
  const p = orbitPoint(o, a), q = orbitPoint(o, a + .001 * direction);
  return Math.atan2(q.y - p.y, q.x - p.x);
}

function ringHalf(ctx, o, front, color, t, bright = .4, count = 30) {
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.tilt);
  const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
  count=18;
  // Hardware occupies only 24% of each angular cell; the remaining 76% is vacuum.
  for (let i = 0; i < count; i++) {
    const a = (i + .15) / count * TAU;
    if ((Math.sin(a) >= 0) !== front) continue;
    const pulse = Math.pow(Math.max(0, Math.cos(a - t * .5)), 14);
    ctx.globalAlpha = (front ? .43 : .24) + pulse * .3 * bright;
    const aa = a + TAU / count * .24;
    ctx.beginPath(); ctx.ellipse(0, 0, o.rx, o.ry, 0, a, aa);
    ctx.strokeStyle = '#92a1a5'; ctx.lineWidth = front ? 5.3 : 3.7; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, o.rx, o.ry, 0, a + .01, aa - .01);
    ctx.globalAlpha = front ? .46 + pulse * .35 : .22;
    ctx.strokeStyle = color; ctx.lineWidth = front ? 1.6 : 1; ctx.stroke();
  }
  ctx.restore();
}

function station(ctx, p, angle, color, scale = 1) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle); ctx.scale(scale, scale);
  glow(ctx, 0, 0, 30, color, .12);
  // Open centre: the cargo follows the guideway through a visible docking gate.
  ctx.strokeStyle = '#8d9da4'; ctx.lineWidth = .8;
  ctx.fillStyle = '#162832';
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.roundRect(-20, side * 12 - 3, 40, 6, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.globalAlpha = .65; ctx.fillRect(-12, side * 12 - .7, 24, 1.4);
    ctx.globalAlpha = 1; ctx.fillStyle = '#162832';
  }
  ctx.strokeStyle = '#718893'; ctx.beginPath();
  for (const xx of [-19,19]) {
    ctx.moveTo(xx, -11); ctx.lineTo(xx, -8);
    ctx.moveTo(xx, 11); ctx.lineTo(xx, 8);
  }
  ctx.stroke();
  ctx.restore();
}

function cargo(ctx, p, angle, color, size = 1, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(p.x, p.y); ctx.rotate(angle); ctx.scale(size, size);
  glow(ctx, -5, 0, 24, color, .1);
  const hull = ctx.createLinearGradient(0, -7, 0, 7);
  hull.addColorStop(0, '#edf0e9'); hull.addColorStop(.32, '#98a9ac');
  hull.addColorStop(.58, '#3e5862'); hull.addColorStop(1, '#10222d');
  ctx.beginPath(); ctx.moveTo(-15, -5); ctx.lineTo(9, -5); ctx.quadraticCurveTo(17, -4, 19, 0);
  ctx.quadraticCurveTo(17, 4, 9, 5); ctx.lineTo(-15, 5); ctx.quadraticCurveTo(-18, 0, -15, -5);
  ctx.fillStyle = hull; ctx.fill(); ctx.strokeStyle = '#c4d7d8'; ctx.lineWidth = .6; ctx.stroke();
  ctx.fillStyle = '#1e3742'; ctx.fillRect(6, -2.8, 6, 5.6);
  ctx.strokeStyle = '#172b35'; ctx.lineWidth = .65;
  for (const xx of [-8, -1]) {ctx.beginPath(); ctx.moveTo(xx, -4.5); ctx.lineTo(xx, 4.5); ctx.stroke();}
  ctx.strokeStyle = color; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-12, -4.1); ctx.lineTo(3, -4.1); ctx.stroke();
  ctx.fillStyle = color; ctx.fillRect(-17, -1.4, 2, 2.8); ctx.restore();
}

function surfacePoint(o, port) {
  return {x: o.x + (port.x - o.x) * o.r / o.rx, y: o.y + (port.y - o.y) * o.r / o.rx};
}

function coastPoint(o,a){
 const n=18,step=TAU/n,phase=fract(a/step-.15),duty=.24;
 let ratio=1;
 if(phase>duty){const alpha=(1-duty)*step/2,phi=(phase-(1+duty)/2)*step,beta=4;
  const e=((beta-2)*Math.cos(alpha)+Math.sqrt((beta-2)**2*Math.cos(alpha)**2+4*(beta-1)))/2;
  ratio=(1+e*Math.cos(alpha))/(1+e*Math.cos(phi));
 }
 return orbitPoint({...o,rx:o.rx*ratio,ry:o.ry*ratio},a);
}
function coastAngle(o,a,direction){const p=coastPoint(o,a),q=coastPoint(o,a+.0001*direction);return Math.atan2(q.y-p.y,q.x-p.x);}
function ringCargo(ctx, o, a, color, direction, front, size = 1) {
  const isFront = Math.sin(a) >= 0;
  if (front !== isFront) return;
  // Draw far-side cargo before the globe, not after it with a centre-point test.
  // The globe then masks the entire hull and wake, including their edges.
  for (let i = 20; i > 0; i--) {
    const aa = a - direction * i * .009;
    if ((Math.sin(aa) >= 0) !== front) continue;
    line(ctx, [coastPoint(o, aa), coastPoint(o, aa + direction * .007)], color, 1.5, (1 - i / 21) * .27);
  }
  cargo(ctx, coastPoint(o, a), coastAngle(o, a, direction), color, size);
}

function globeAndGuideway(ctx, o, kind, color, t, moving = null) {
  ringHalf(ctx, o, false, color, t, moving ? 1 : .2, 36);
  if (moving) ringCargo(ctx, o, moving.a, color, moving.direction, false, moving.size);
  planet(ctx, o.x, o.y, o.r, kind, t);
  ringHalf(ctx, o, true, color, t, moving ? 1 : .2, 36);
  if (moving) ringCargo(ctx, o, moving.a, color, moving.direction, true, moving.size);
}

function leader(ctx, start, end, text, color = C.muted, align = 'left') {
  const elbow = { x: end.x + (align === 'right' ? 16 : -16), y: end.y };
  line(ctx, [start, elbow, end], color, .8, .55);
  ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(start.x, start.y, 2.3, 0, TAU); ctx.fill(); ctx.restore();
  label(ctx, text, end.x, end.y - 13, 19, color, align);
}

function drawOrbit(ctx, w, h, p, t, mobile) {
  const o = mobile
    ? { x: 300, y: 353, rx: 264, ry: 95, tilt: -.29, r: 153 }
    : { x: 600, y: 327, rx: 367, ry: 128, tilt: -.26, r: 178 };
  const a = .45 - t * .45;
  globeAndGuideway(ctx, o, 'earth', C.gold, t, {a, direction:-1, size:mobile ? .85 : 1.05});
  const portAngle = .34, port = orbitPoint(o, portAngle), ground = surfacePoint(o, port);
  line(ctx, [ground, port], '#bad4d9', .9, .65);
  const lift = smooth(fract(t * .1 + .12));
  const liftAlpha = Math.min(1, lift * 12, (1 - lift) * 12);
  cargo(ctx, {x:mix(ground.x,port.x,lift),y:mix(ground.y,port.y,lift)}, Math.atan2(port.y-ground.y,port.x-ground.x), C.cyan, .54, liftAlpha);
  station(ctx, port, orbitAngle(o, portAngle), C.cyan, mobile ? .8 : .95);
  glow(ctx, ground.x, ground.y, 11, C.cyan, .14);
  const turnAngle = 2.65, turn = orbitPoint(o, turnAngle);
  station(ctx, turn, orbitAngle(o, turnAngle), C.gold, .8);
  if (mobile) {
    leader(ctx, port, { x: 548, y: 126 }, '升轨接驳', C.cyan, 'right');
    leader(ctx, turn, { x: 46, y: 563 }, '转向港', C.gold);
    label(ctx, '模块内受力，段间自由飞行', 300, 632, 19, C.muted, 'center');
  } else {
    leader(ctx, port, { x: 1065, y: 134 }, '升轨接驳', C.cyan, 'right');
    leader(ctx, turn, { x: 116, y: 481 }, '转向港', C.gold);
    label(ctx, '离散电磁站阵列', 600, 552, 21, C.white, 'center');
    label(ctx, '模块主动维持构型，货舱沿段间弹道交接', 600, 586, 15, C.muted, 'center');
  }
}

function pulses(ctx, points, color, t, speed = .25, count = 4) {
  for (let i = 0; i < count; i++) {
    const u = fract(t * speed + i / count), seg = u * (points.length - 1), n = Math.floor(seg), f = seg - n;
    const a = points[n], b = points[Math.min(n + 1, points.length - 1)];
    const x = mix(a.x, b.x, f), y = mix(a.y, b.y, f);
    glow(ctx, x, y, 13, color, .23);
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); ctx.restore();
  }
}

function energyRail(ctx, x0, x1, y, color, t, direction) {
  line(ctx, [{ x: x0, y: y - 4 }, { x: x1, y: y - 4 }], color, .8, .28);
  line(ctx, [{ x: x0, y: y + 4 }, { x: x1, y: y + 4 }], color, .8, .28);
  for (let i = 0; i < 14; i++) {
    const x = mix(x0, x1, (i + .5) / 14);
    ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha *= .35;
    ctx.strokeRect(x - 10, y - 10, 20, 20); ctx.restore();
  }
  const u = fract(t * .115 + (direction < 0 ? .48 : 0));
  const x = direction > 0 ? mix(x0, x1, u) : mix(x1, x0, u);
  for (let i = 1; i < 19; i++) {
    const xx = x - direction * i * 3;
    if (xx < x0 || xx > x1) continue;
    line(ctx, [{ x: xx - direction * 2, y }, { x: xx, y }], color, 2.5, (1 - i / 20) * .4);
  }
  cargo(ctx, { x, y }, direction < 0 ? Math.PI : 0, color, 1.05);
}

function drawEnergy(ctx, w, h, p, t, mobile) {
  const cx = w / 2, top = mobile ? 175 : 178, bottom = mobile ? 524 : 447;
  const cy = (top + bottom) / 2, left = mobile ? 45 : 145, right = w - left;
  energyRail(ctx, left, right, top, C.gold, t, 1);
  energyRail(ctx, left, right, bottom, C.cyan, t, -1);
  label(ctx, '10.0 → 10.1 km/s', cx, top - 47, mobile ? 27 : 31, C.white, 'center');
  label(ctx, '+279.2 kWh / 吨', cx, top - 83, 19, C.gold, 'center');
  label(ctx, '10.1 → 10.0 km/s', cx, bottom + 47, mobile ? 27 : 31, C.white, 'center');
  label(ctx, '−279.2 kWh / 吨', cx, bottom + 84, 19, C.cyan, 'center');
  const flow = [{ x: cx, y: bottom - 15 }, { x: cx, y: cy + 57 }, { x: cx, y: cy - 57 }, { x: cx, y: top + 15 }];
  line(ctx, flow, C.cyan, 1.6, .35);
  pulses(ctx, flow, C.cyan, t, .27, 4);
  glow(ctx, cx, cy, mobile ? 77 : 82, C.cyan, .18);
  ctx.save(); ctx.translate(cx, cy);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(0, 0, 47 + i * 7, t * (i % 2 ? -.3 : .23) + i, t * (i % 2 ? -.3 : .23) + i + Math.PI * 1.25);
    ctx.strokeStyle = i === 1 ? C.gold : C.cyan; ctx.globalAlpha = i === 1 ? .65 : .23; ctx.lineWidth = i === 1 ? 1.7 : .8; ctx.stroke();
  }
  ctx.restore();
  label(ctx, '本站母线', cx, cy - 3, 23, C.white, 'center', 500);
  if (!mobile) {
    label(ctx, '加速', left, top - 40, 19, C.gold);
    label(ctx, '再生制动', right, bottom + 42, 19, C.cyan, 'right');
    label(ctx, '同一参考系 · 等移动质量', cx, h - 20, 16, C.muted, 'center');
  } else {
    label(ctx, '回收  →  储能  →  下一次出发', cx, h - 43, 20, C.muted, 'center');
  }
}

function cubic(a, b, c, d, u) {
  const v = 1 - u;
  return { x: v * v * v * a.x + 3 * v * v * u * b.x + 3 * v * u * u * c.x + u * u * u * d.x,
    y: v * v * v * a.y + 3 * v * v * u * b.y + 3 * v * u * u * c.y + u * u * u * d.y };
}

function routePath(ctx, curve, end = 1) {
  ctx.beginPath(); const a = cubic(...curve, 0); ctx.moveTo(a.x, a.y);
  for (let i = 1; i <= 70; i++) { const q = cubic(...curve, end * i / 70); ctx.lineTo(q.x, q.y); }
}

function tangentVector(o, a, direction) {
  const angle = orbitAngle(o, a, direction);
  return {x:Math.cos(angle),y:Math.sin(angle)};
}

function drawTransport(ctx, w, h, p, t, mobile) {
  const earth = mobile
    ? { x: 158, y: 528, rx: 139, ry: 48, tilt: -.3, r: 76 }
    : { x: 210, y: 346, rx: 168, ry: 63, tilt: -.24, r: 88 };
  const mars = mobile
    ? { x: 428, y: 183, rx: 106, ry: 38, tilt: -.86, r: 56 }
    : { x: 990, y: 346, rx: 135, ry: 48, tilt: -.24, r: 70 };
  // Both transfer gates are on the visible hemisphere. The flight curve uses
  // exactly the orbital tangent at each gate, so there is no snap or crossing.
  const departureAngle = .55, arrivalAngle = 2.58, direction = -1;
  const start = orbitPoint(earth, departureAngle), end = orbitPoint(mars, arrivalAngle);
  const liftStart = surfacePoint(earth, start), lowerEnd = surfacePoint(mars, end);
  const st = tangentVector(earth, departureAngle, direction);
  const et = tangentVector(mars, arrivalAngle, direction);
  const handle = mobile ? 139 : 230;
  const curve = [start,
    {x:start.x+st.x*handle,y:start.y+st.y*handle},
    {x:end.x-et.x*handle,y:end.y-et.y*handle},end];
  const scaled = Math.min(5.999999, p * 6), phase = Math.floor(scaled), u = p >= 1 ? 1 : scaled - phase;
  const names = ['货舱升轨', '环轨加速', '转向离港', '深空巡航', '进站减速', '下降交付'];
  const transfer = phase < 2 ? 0 : phase > 3 ? 1 : (phase - 2 + u) / 2;
  ctx.save(); ctx.strokeStyle = '#a0bccb'; ctx.globalAlpha = .17; ctx.lineWidth = .9;
  routePath(ctx, curve); ctx.stroke(); ctx.restore();
  if (transfer > 0) {
    ctx.save(); const g = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    g.addColorStop(0, C.gold); g.addColorStop(1, C.cyan); ctx.strokeStyle = g; ctx.globalAlpha = .44; ctx.lineWidth = 1.2;
    routePath(ctx, curve, transfer); ctx.stroke(); ctx.restore();
  }
  // Lift, orbit, transfer, capture and descent share exact endpoint positions.
  // A quadratic angular law accelerates from rest, then brakes back to rest.
  const earthMotion = phase === 1 ? {a:departureAngle + direction * TAU * 2 * u * u,direction,size:mobile?.72:.8} : null;
  const marsMotion = phase === 4 ? {a:arrivalAngle + direction * TAU * 2 * (1-(1-u)*(1-u)),direction,size:mobile?.72:.8} : null;
  globeAndGuideway(ctx, earth, 'earth', C.gold, t, earthMotion);
  globeAndGuideway(ctx, mars, 'mars', C.cyan, t, marsMotion);
  line(ctx, [liftStart, start], '#c8dad9', .8, .47);
  line(ctx, [end, lowerEnd], '#c8dad9', .8, .47);
  station(ctx, start, orbitAngle(earth, departureAngle, direction), C.gold, .64);
  station(ctx, end, orbitAngle(mars, arrivalAngle, direction), C.cyan, .64);
  const color = phase < 4 ? C.gold : C.cyan;
  if (phase === 0 || phase === 5) {
    const from = phase === 0 ? liftStart : end, to = phase === 0 ? start : lowerEnd;
    const q = smooth(u), cp = {x:mix(from.x,to.x,q),y:mix(from.y,to.y,q)};
    const angle = Math.atan2(to.y-from.y,to.x-from.x);
    cargo(ctx, cp, angle, color, mobile?.68:.76);
    if (phase === 5 && u > .9) glow(ctx, lowerEnd.x, lowerEnd.y, 20, C.cyan, smooth((u-.9)*10)*.18);
  } else if (phase === 2 || phase === 3) {
    const cp = cubic(...curve, transfer), q1 = cubic(...curve, Math.min(1, transfer+.001));
    const q0 = cubic(...curve, Math.max(0, transfer-.001));
    const trail = [];
    for (let i=16;i>=0;i--) trail.push(cubic(...curve,Math.max(0,transfer-i*.002)));
    line(ctx,trail,C.gold,1.9,.36);
    cargo(ctx, cp, Math.atan2(q1.y-q0.y,q1.x-q0.x), C.gold, mobile?.72:.8);
  }
  if (phase === 4) {
    // Recovered energy stays at the receiving station, clear of the cargo path.
    const energyBus = {x:end.x+22,y:end.y+34};
    if (u>.08 && u<.94) {
      line(ctx,[end,energyBus],C.cyan,.8,.24);
      pulses(ctx,[end,energyBus],C.cyan,t,.35,2);
    }
  }
  label(ctx, '地球站', earth.x, earth.y + earth.r + (mobile ? 57 : 57), mobile ? 20 : 20, C.white, 'center');
  label(ctx, '火星站', mars.x+(mobile?24:0), mars.y + mars.r + (mobile ? 72 : 57), mobile ? 20 : 20, C.white, 'center');
  const statusY = mobile ? 697 : 561;
  label(ctx, names[phase], w / 2, statusY, mobile ? 23 : 24, color, 'center', 400);
  const gap = mobile ? 28 : 36, x0 = w / 2 - gap * 2.5;
  for (let i = 0; i < 6; i++) {
    const xx = x0 + i * gap;
    ctx.save(); ctx.fillStyle = i <= phase ? (i < 4 ? C.gold : C.cyan) : '#34515f';
    ctx.globalAlpha = i === phase ? .95 : .35;
    ctx.beginPath(); ctx.arc(xx, statusY + 31, i === phase ? 2.6 : 1.5, 0, TAU); ctx.fill(); ctx.restore();
  }
  if (!mobile) label(ctx, '地球—火星转移航路', 600, 160, 15, C.muted, 'center');
}

function nodePosition(level, index, mobile, w, h) {
  const count = 2 ** level;
  if (mobile) return { x: 34 + (index + .5) / count * (w - 68), y: 72 + level / 6 * 536 };
  return { x: 105 + level / 6 * (w - 210), y: 83 + (index + .5) / count * (h - 185) };
}

function drawNetwork(ctx, w, h, p, t, mobile) {
  const step = p * 6, complete = Math.min(6, Math.floor(step + 1e-8)), partial = step - complete;
  const lastLevel = Math.min(6, complete + (partial > 0 ? 1 : 0));
  for (let level = 1; level <= lastLevel; level++) {
    const alpha = level <= complete ? 1 : smooth(partial);
    const count = 2 ** level;
    for (let i = 0; i < count; i++) {
      const a = nodePosition(level - 1, Math.floor(i / 2), mobile, w, h);
      const b = nodePosition(level, i, mobile, w, h);
      const endpoint = level <= complete ? b : { x: mix(a.x, b.x, smooth(partial)), y: mix(a.y, b.y, smooth(partial)) };
      line(ctx, [a, endpoint], level === lastLevel ? C.gold : C.cyan, level < 3 ? 1.2 : .75, alpha * (level < 3 ? .46 : .25));
      if (level < 5 || i % 4 === 0) {
        const q = fract(t * .18 + i * .117 + level * .13) * (level <= complete ? 1 : smooth(partial));
        const x = mix(a.x, b.x, q), y = mix(a.y, b.y, q);
        glow(ctx, x, y, level < 3 ? 9 : 5, C.cyan, .14 * alpha);
        ctx.save(); ctx.globalAlpha *= .65 * alpha; ctx.fillStyle = C.cyan;
        ctx.beginPath(); ctx.arc(x, y, 1.15, 0, TAU); ctx.fill(); ctx.restore();
      }
    }
  }
  for (let level = 0; level <= lastLevel; level++) {
    const count = 2 ** level, alpha = level <= complete ? 1 : smooth(partial);
    for (let i = 0; i < count; i++) {
      const q = nodePosition(level, i, mobile, w, h), r = level === 0 ? 6 : Math.max(2, 5 - level * .48);
      const color = level === lastLevel ? C.gold : C.cyan;
      if (level < 4 || i % 3 === 0) glow(ctx, q.x, q.y, r * 3.7, color, alpha * .18);
      ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, TAU); ctx.fill();
      if (level < 3) {
        ctx.strokeStyle = color; ctx.lineWidth = .7; ctx.globalAlpha *= .3;
        ctx.beginPath(); ctx.arc(q.x, q.y, r + 5 + Math.sin(t + i) * 1.2, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }
  }
}

/**
 * Draw a single animated scene. No DOM access, image loads, or persistent state.
 * `width` and `height` are CSS-pixel drawing bounds (supports an existing DPR transform).
 * `progress` is clamped to 0..1; `time` is a requestAnimationFrame timestamp in ms.
 * The diagram clears its own bounds and restores all incoming canvas state.
 */
export function drawDiagram(ctx, { mode = 'orbit', progress = 0, time = 0, width, height } = {}) {
  if (!ctx || !ctx.canvas) return;
  const cssWidth = Number.isFinite(width) ? width : ctx.canvas.width;
  const cssHeight = Number.isFinite(height) ? height : ctx.canvas.height;
  if (cssWidth <= 0 || cssHeight <= 0) return;
  const p = clamp(Number.isFinite(progress) ? progress : 0);
  const t = (Number.isFinite(time) ? time : 0) / 1000;
  const mobile = cssWidth < 700;
  const sceneWidth = mobile ? 600 : 1200;
  const sceneHeight = mobile ? (mode === 'transport' ? 760 : 720) : (mode === 'energy' ? 620 : 650);
  const scale = Math.min(cssWidth / sceneWidth, cssHeight / sceneHeight);
  ctx.save();
  try {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.translate((cssWidth - sceneWidth * scale) / 2, (cssHeight - sceneHeight * scale) / 2);
    ctx.scale(scale, scale); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([]); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    scenery(ctx, sceneWidth, sceneHeight, t);
    if (mode === 'energy') drawEnergy(ctx, sceneWidth, sceneHeight, p, t, mobile);
    else if (mode === 'transport') drawTransport(ctx, sceneWidth, sceneHeight, p, t, mobile);
    else if (mode === 'network') drawNetwork(ctx, sceneWidth, sceneHeight, p, t, mobile);
    else drawOrbit(ctx, sceneWidth, sceneHeight, p, t, mobile);
  } finally {
    ctx.restore();
  }
}

export default drawDiagram;
