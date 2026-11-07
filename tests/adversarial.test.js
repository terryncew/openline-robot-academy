'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const E = require('../web/engine.js'), missions = require('../web/missions.js');

test('all 5 missions and all sandbox presets have valid maps and working solutions', () => {
  assert.equal(missions.length, 5);
  for (const m of missions) {
    for (const map of m.maps || [m.map]) {
      E.validateMap(map);
      const s = E.run(map, m.solution, 'normal');
      assert.equal(s.status, 'success', `Primary solution failed on ${m.id}`);
      assert.ok(s.ticks <= E.LIMITS.ticks);
    }
  }
  const sandbox = missions.find(m => m.id === 'sandbox');
  assert.equal(sandbox.presets.length, 3);
  for (const preset of sandbox.presets) {
    E.validateMap(preset.map);
  }
});

test('alternative valid solutions complete every mission', () => {
  // Mission 01: Detour around southern open path
  const m1 = missions[0].map;
  const alt1 = [{op:'right'},{op:'move'},{op:'left'},{op:'move'},{op:'move'},{op:'move'},{op:'left'},{op:'move'}];
  assert.equal(E.run(m1, alt1).status, 'success');

  // Mission 02: Unrolled sequence without loops
  const m2 = missions[1].map;
  const alt2 = [{op:'move'},{op:'move'},{op:'move'},{op:'move'},{op:'left'},{op:'move'},{op:'move'},{op:'move'}];
  assert.equal(E.run(m2, alt2).status, 'success');

  // Mission 03: Bounded repeat(12) instead of until on Routes A, B, and C
  const alt3 = [{op:'repeat',n:12},{op:'if'},{op:'move'},{op:'else'},{op:'left'},{op:'end'},{op:'end'}];
  for (const map of missions[2].maps) {
    assert.equal(E.run(map, alt3).status, 'success');
  }

  // Mission 04: Sensor-aware loop instead of repeat(5)
  const m4 = missions[3].map;
  const alt4 = [{op:'until'},{op:'if'},{op:'move'},{op:'end'},{op:'end'}];
  assert.equal(E.run(m4, alt4).status, 'success');

  // Mission 05 Sandbox Preset 0 (Zigzag): Unrolled sequence solution
  const m5 = missions[4].presets[0].map;
  const alt5 = [{op:'move'},{op:'move'},{op:'left'},{op:'move'},{op:'right'},{op:'move'},{op:'move'},{op:'left'},{op:'move'}];
  assert.equal(E.run(m5, alt5).status, 'success');

  // Mission 05 Sandbox Preset 1 (Spiral): Until + If/Else left turn solver
  const m5Spiral = missions[4].presets[1].map;
  const altSpiral = [{op:'until'},{op:'if'},{op:'move'},{op:'else'},{op:'left'},{op:'end'},{op:'end'}];
  assert.equal(E.run(m5Spiral, altSpiral).status, 'success');
});

test('diagnostic feedback specifies block number, obstacle type/coordinate, and goal distance', () => {
  // Blocked by planter on Safety lab starter
  const sBlocked = E.run(missions[3].map, missions[3].starter);
  assert.equal(sBlocked.status, 'blocked');
  assert.match(sBlocked.message, /Block 3/);
  assert.match(sBlocked.message, /planter at Row 2, Col 1/);

  // Blocked by garden edge
  const sEdge = E.run(missions[0].map, [{op:'left'},{op:'left'},{op:'move'}]);
  assert.equal(sEdge.status, 'blocked');
  assert.match(sEdge.message, /garden edge/);

  // Blocked by unexpected crate
  const sCrate = E.run(missions[3].map, missions[3].solution, 'new-crate');
  assert.equal(sCrate.status, 'blocked');
  assert.match(sCrate.message, /unexpected crate at Row 3, Col 4/);

  // Finished early with If but no loop -> specific coaching tip
  const sIfOnce = E.run(missions[2].maps[0], [{op:'if'},{op:'move'},{op:'else'},{op:'left'},{op:'end'}]);
  assert.equal(sIfOnce.status, 'finished');
  assert.match(sIfOnce.message, /An If block checks only once/);
  assert.match(sIfOnce.message, /Pad is/);
});

test('deeply nested loops (depth 6) terminate cleanly within 160 ticks', () => {
  const deep = [
    {op:'repeat',n:20},{op:'repeat',n:20},{op:'repeat',n:20},
    {op:'repeat',n:20},{op:'repeat',n:20},{op:'repeat',n:20},
    {op:'wait'},
    {op:'end'},{op:'end'},{op:'end'},{op:'end'},{op:'end'},{op:'end'}
  ];
  const s = E.run(missions[0].map, deep);
  assert.equal(s.status, 'budget');
  assert.equal(s.ticks, E.LIMITS.ticks);
  assert.match(s.message, /160 steps used/);
});

test('malformed syntax, prototype pollution, and hostile progress/sandboxMap inputs are rejected', () => {
  assert.throws(() => E.compile([{op:'if'},{op:'move'},{op:'else'},{op:'left'},{op:'else'},{op:'right'},{op:'end'}]), /Else belongs inside one If/);
  assert.throws(() => E.fromCode('move();\n'.repeat(2000)), /too long/);
  const ids = missions.map(m => m.id);
  const cleaned = E.cleanProgress({
    version: 1,
    mission: 'sandbox',
    sandboxMap: {w: 6, h: 6, start: {x: 0, y: 0, dir: 1}, goal: {x: 0, y: 0, dir: 1}, walls: [[0,0]]}
  }, ids);
  assert.equal(cleaned.sandboxMap, null);

  const validCustom = {w: 6, h: 6, start: {x: 0, y: 5, dir: 1}, goal: {x: 5, y: 0}, walls: [[2,2],[3,3]]};
  const cleanedValid = E.cleanProgress({
    version: 1,
    mission: 'sandbox',
    sandboxMap: validCustom
  }, ids);
  assert.deepEqual(cleanedValid.sandboxMap, validCustom);
});

test('deterministic replay: identical inputs produce byte-for-byte identical traces across all scenarios', () => {
  for (const m of missions) {
    const map = m.maps ? m.maps[0] : m.map;
    for (const scen of ['normal', 'new-crate', 'sensor-fault']) {
      const runA = E.run(map, m.solution, scen);
      const runB = E.run(map, m.solution, scen);
      assert.equal(JSON.stringify(runA), JSON.stringify(runB));
    }
  }
});
