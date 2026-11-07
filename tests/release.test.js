'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const E=require('../web/engine'),missions=require('../web/missions');
const root=path.join(__dirname,'..');
test('every published solution completes every route',()=>{
  let count=0;
  for(const m of missions)for(const map of m.maps||[m.map]){
    const s=E.run(map,m.solution,'normal');
    assert.equal(s.status,'success',`${m.id} route ${count}: ${s.message}`);
    assert.ok(s.ticks<=E.LIMITS.ticks);count++;
  }
  assert.ok(count>=6);
});
test('code mode roundtrips every published solution',()=>{
 for(const m of missions)assert.deepEqual(E.fromCode(E.toCode(m.solution)),m.solution,m.id);
});
test('unknown sensor and newly appearing crate fail closed',()=>{
 const m=missions.find(m=>m.id==='safety');
 for(const scenario of ['sensor-fault','new-crate']){
  const s=E.run(m.map,m.solution,scenario);
  assert.equal(s.status,scenario==='sensor-fault'?'sensor-fault':'blocked');
  assert.equal(s.moves,2);
  const before=[s.x,s.y,s.ticks];E.step(s);assert.deepEqual([s.x,s.y,s.ticks],before);
 }
});
test('emergency stop latches until a new state is explicitly created',()=>{
 const m=missions[0],s=E.create(m.map,m.solution);E.step(s);E.stop(s);
 const before=[s.x,s.y,s.ticks];for(let i=0;i<10;i++)E.step(s);
 assert.deepEqual([s.x,s.y,s.ticks],before);assert.equal(s.status,'estop');
});
test('invalid maps reject out-of-bounds walls',()=>{
 const map=structuredClone(missions[0].map);map.walls.push([99,1]);assert.throws(()=>E.create(map,[]),/Invalid walls/);
});
test('standalone distribution contains embedded application and no external script or CSS dependency',()=>{
 const html=fs.readFileSync(path.join(root,'dist','OpenLine-Robot-Academy.html'),'utf8');
 assert.match(html,/AcademyMissions/);assert.match(html,/Emergency stop/);
 assert.doesNotMatch(html,/<script[^>]+src=/i);assert.doesNotMatch(html,/<link[^>]+rel="stylesheet"/i);
});
