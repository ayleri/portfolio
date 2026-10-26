import type { Shark } from './world';

interface Body {
  shark: Shark;
  samples: { index: number; radius: number }[];
  length: number;
}

const bodies = new WeakMap<Shark, Body>();

/** Overlapping discs cover the body, banked fins, and animated tail sweep. */
function body(shark: Shark): Body {
  const cached = bodies.get(shark);
  if (cached?.length === shark.length) return cached;
  const samples: Body['samples'] = [];
  const last = shark.nodes.length / 2 - 1;
  for (let i = 0; i <= last; i += 2) {
    const along = i / last;
    const torso = 0.03 + 0.11 * (1 - along);
    const fins = 0.38 * Math.max(0, 1 - Math.abs(along - 0.52) / 0.3);
    const head = along < 0.12 && (shark.kind === 'hammerhead' || shark.kind === 'greathammer') ? 0.24 : 0;
    const tail = along > 0.8 ? 0.13 : 0;
    const wave = 0.008 + 0.077 * along ** 1.8;
    samples.push({ index: i * 2, radius: shark.length * (Math.max(torso, fins, head, tail) + wave) });
  }
  if (last % 2) samples.push({ index: last * 2, radius: shark.length * 0.215 });
  const result = { shark, samples, length: shark.length };
  bodies.set(shark, result);
  return result;
}

/** Find the deepest current or predicted contact between two full bodies. */
function contact(a: Body, b: Body, lead = 0, clearance = 0) {
  const ax = Math.cos(a.shark.heading) * a.shark.speed * lead;
  const ay = Math.sin(a.shark.heading) * a.shark.speed * lead;
  const bx = Math.cos(b.shark.heading) * b.shark.speed * lead;
  const by = Math.sin(b.shark.heading) * b.shark.speed * lead;
  let overlap = 0;
  let x = 0;
  let y = 0;
  for (const p of a.samples) {
    for (const q of b.samples) {
      const dx = a.shark.nodes[p.index] + ax - b.shark.nodes[q.index] - bx;
      const dy = a.shark.nodes[p.index + 1] + ay - b.shark.nodes[q.index + 1] - by;
      const radius = p.radius + q.radius + clearance;
      const squared = dx * dx + dy * dy;
      if (squared >= radius * radius) continue;
      const distance = Math.sqrt(squared);
      const penetration = radius - distance;
      if (penetration <= overlap) continue;
      overlap = penetration;
      if (distance > 0.001) {
        x = dx / distance;
        y = dy / distance;
      } else {
        // Coincident sharks still need a stable, opposite direction to separate.
        const first = a.shark.id < b.shark.id ? a.shark : b.shark;
        const sign = first === a.shark ? 1 : -1;
        x = -Math.sin(first.heading) * sign;
        y = Math.cos(first.heading) * sign;
      }
    }
  }
  return { x, y, overlap };
}

export function sharkAvoidance(shark: Shark, sharks: Shark[]) {
  let x = 0;
  let y = 0;
  let urgency = 0;
  const own = body(shark);
  for (const other of sharks) {
    if (other === shark) continue;
    const neighbor = body(other);
    const clearance = 4 + (shark.length + other.length) * 0.04;
    const current = contact(own, neighbor, 0, clearance);
    const future = contact(own, neighbor, 1, clearance);
    const nearest = future.overlap > current.overlap ? future : current;
    if (nearest.overlap <= 0) continue;
    const pressure = Math.min(1, nearest.overlap / ((shark.length + other.length) * 0.25));
    const front = nearest.x * Math.cos(shark.heading) + nearest.y * Math.sin(shark.heading);
    // Head-on encounters turn aside instead of both trying to reverse.
    const sidestep = front < -0.6 ? 1.2 : 0;
    x += (nearest.x - Math.sin(shark.heading) * sidestep) * pressure * 10;
    y += (nearest.y + Math.cos(shark.heading) * sidestep) * pressure * 10;
    urgency = Math.max(urgency, pressure);
  }
  return { x, y, urgency };
}

function translate(shark: Shark, x: number, y: number) {
  for (let i = 0; i < shark.nodes.length; i += 2) {
    shark.nodes[i] += x;
    shark.nodes[i + 1] += y;
  }
}

/** Resolve residual overlaps without bending spines or confining the viewport. */
export function separateSharks(sharks: Shark[], arrival?: Shark) {
  const shapes = sharks.map(body);
  for (let iteration = 0; iteration < 24; iteration++) {
    let corrected = false;
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const a = shapes[i];
        const b = shapes[j];
        if (arrival && a.shark !== arrival && b.shark !== arrival) continue;
        const hit = contact(a, b);
        if (hit.overlap <= 0) continue;
        const push = hit.overlap + 0.5;
        const share = arrival ? Number(a.shark === arrival) :
          b.length ** 2 / (a.length ** 2 + b.length ** 2);
        translate(a.shark, hit.x * push * share, hit.y * push * share);
        translate(b.shark, -hit.x * push * (1 - share), -hit.y * push * (1 - share));
        corrected = true;
      }
    }
    if (!corrected) break;
  }
}
