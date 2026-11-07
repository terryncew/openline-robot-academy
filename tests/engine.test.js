'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../web/engine.js'),missions=require('../web/missions.js');
const m=missions[0].map, move={op:'move'};
test('first success needs three deliberate commands',()=>{const s=E.run(m,[move,move,move]);assert.equal(s.status,'success');assert.equal(s.moves,3);});
test('replay has identical states and traces',()=>{assert.deepEqual(E.run(m,[move]),E.run(m,[move]));});
test('boundary refuses movement',()=>{const s=E.run(m,[{op:'left'},{op:'left'},move]);assert.equal(s.status,'blocked');assert.equal(s.x,0);});
test('emergency stop latches across further step calls',()=>{const s=E.create(m,[move,move,move]);E.step(s);E.stop(s);const before=JSON.stringify(s);for(let i=0;i<10;i++)E.step(s);assert.equal(JSON.stringify(s),before);});
test('empty until loop is bounded',()=>{assert.equal(E.run(m,[{op:'until'},{op:'end'}]).status,'budget');});
test('syntax rejects unmatched groups and unknown commands',()=>{for(const t of [[{op:'end'}],[{op:'repeat',n:3}],[{op:'else'}],[{op:'fly'}]])assert.throws(()=>E.compile(t));});
test('counted loop moves three times',()=>{assert.equal(E.run(m,[{op:'repeat',n:3},move,{op:'end'}]).status,'success');});
test('sensor failure prevents third movement',()=>{const s=E.run(m,[move,move,move],'sensor-fault');assert.equal(s.status,'sensor-fault');assert.equal(s.moves,2);});
for(const mission of missions)for(const [i,map] of (mission.maps||[mission.map]).entries()){
  test(mission.id+' route '+i+' has a reproducible solution',()=>{const a=E.run(map,mission.solution);assert.equal(a.status,'success');assert.ok(a.ticks<160);assert.deepEqual(a,E.run(map,mission.solution));});
}
test('no movement into planters',()=>{const map=missions[3].map;const s=E.run(map,missions[3].starter);assert.equal(s.status,'blocked');assert.equal(s.moves,0);});
test('unexpected crate stops exactly before tile three',()=>{const s=E.run(missions[3].map,missions[3].solution,'new-crate');assert.equal(s.status,'blocked');assert.equal(s.moves,2);assert.equal(s.x,2);assert.equal(s.y,2);});
test('unknown sensor cannot be treated as an else branch',()=>{const p=[move,move,{op:'if'},move,{op:'else'},{op:'left'},{op:'end'}];const s=E.run(missions[3].map,p,'sensor-fault');assert.equal(s.status,'sensor-fault');assert.equal(s.turns,0);assert.equal(s.moves,2);});
test('stop block prevents later commands',()=>{const s=E.run(m,[{op:'stop'},move]);assert.equal(s.status,'stopped');assert.equal(s.moves,0);});
test('empty and unfinished programs give feedback',()=>{assert.equal(E.run(m,[]).status,'finished');assert.equal(E.run(m,[move]).status,'finished');});
test('nested repeats have independent counters',()=>{const p=[{op:'repeat',n:2},{op:'repeat',n:3},{op:'wait'},{op:'end'},{op:'end'}];const s=E.run(m,p);assert.equal(s.trace.filter(t=>t.kind==='wait').length,6);});
test('false if without else skips commands',()=>{const p=[{op:'left'},{op:'left'},{op:'if'},move,{op:'end'}];const s=E.run(m,p);assert.equal(s.moves,0);assert.equal(s.status,'finished');});
test('true if skips else',()=>{const p=[{op:'if'},move,{op:'else'},{op:'stop'},{op:'end'}];const s=E.run(m,p);assert.equal(s.moves,1);assert.equal(s.status,'finished');});
test('program and repeat limits reject hostile input',()=>{for(const x of [-1,0,21,1.5,NaN,Infinity,'3'])assert.throws(()=>E.compile([{op:'repeat',n:x},{op:'end'}]));assert.throws(()=>E.compile(Array(61).fill(move)));assert.throws(()=>E.compile([...Array(7).fill({op:'until'}),...Array(7).fill({op:'end'})]));});
test('code round-trips every mission',()=>{for(const mission of missions)assert.deepEqual(E.fromCode(E.toCode(mission.solution)),mission.solution);});
test('parser rejects arbitrary JavaScript without evaluation',()=>{for(const code of ['alert(1);','window.location="https://example.com";','while(true) {}','eval("move()");','repeat(0) { move(); }','if (clearAhead()) { move();','} else {'])assert.throws(()=>E.fromCode(code));});
test('code accepts comments and whitespace',()=>{assert.deepEqual(E.fromCode('// test\n move();\nrepeat(2) {\n left(); }'),[{op:'move'},{op:'repeat',n:2},{op:'left'},{op:'end'}]);});
test('local progress allowlists fields',()=>{const p=E.cleanProgress({version:1,mission:'unknown',drafts:{delivery:[move],unknown:[{op:'fly'}]},completed:['delivery','unknown'],checks:['garden'],lab:['sensor','invented'],secret:'x'},missions.map(m=>m.id));assert.equal(p.mission,'delivery');assert.deepEqual(p.completed,['delivery']);assert.deepEqual(p.lab,['sensor']);assert.equal(p.secret,undefined);});
test('bad progress and bad maps rejected',()=>{assert.throws(()=>E.cleanProgress({version:2},['delivery']));assert.throws(()=>E.cleanProgress({version:1,drafts:{delivery:[{op:'inject'}]}},['delivery']));assert.throws(()=>E.create({...m,start:{x:-1,y:2,dir:1}},[]));});
test('seeded 1500 hostile programs stay bounded and inside walkable tiles',()=>{
  let seed=4281;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed;};
  const choices=['move','left','right','wait','stop'];
  for(let n=0;n<1500;n++){
    const p=Array.from({length:rnd()%30},()=>({op:choices[rnd()%choices.length]}));
    if(n%3===0)p.unshift({op:'repeat',n:20}),p.push({op:'end'});
    const s=E.run(m,p,n%2?'normal':'sensor-fault');assert.ok(s.ticks<=160);assert.ok(!E.occupied(s.map,s.x,s.y));assert.ok(s.trace.length<=162);assert.ok(!['running','ready'].includes(s.status));
  }
});
