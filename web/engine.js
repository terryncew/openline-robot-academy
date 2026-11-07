/* OpenLine Robot Academy. MIT. Pure, bounded, deterministic simulation. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Academy = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const LIMITS = Object.freeze({blocks:60, depth:6, ticks:160, repeat:20});
  const OPS = ['move','left','right','wait','stop','repeat','until','if','else','end'];
  const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
  const DIRECTIONS = ['north','east','south','west'];
  function validateTokens(input) {
    if (!Array.isArray(input) || input.length > LIMITS.blocks) throw Error('Use 60 blocks or fewer.');
    return input.map((t,i) => {
      if (!t || typeof t !== 'object' || !OPS.includes(t.op)) throw Error('Unknown block at '+(i+1)+'.');
      const out={op:t.op};
      if(t.op==='repeat') {
        if(!Number.isInteger(t.n)||t.n<1||t.n>LIMITS.repeat) throw Error('Repeat needs a whole number from 1 to 20.');
        out.n=t.n;
      }
      return out;
    });
  }
  function compile(input) {
    const tokens=validateTokens(input), stack=[], jump={}, other={};
    tokens.forEach((t,i)=>{
      if(['repeat','until','if'].includes(t.op)) {
        stack.push({op:t.op,i,otherwise:null});
        if(stack.length>LIMITS.depth) throw Error('Use at most 6 groups inside each other.');
      } else if(t.op==='else') {
        const top=stack[stack.length-1];
        if(!top||top.op!=='if'||top.otherwise!==null) throw Error('Block '+(i+1)+': Else belongs inside one If clear group.');
        top.otherwise=i; other[top.i]=i;
      } else if(t.op==='end') {
        const top=stack.pop();
        if(!top) throw Error('Block '+(i+1)+': this End needs a Repeat, Until or If above it.');
        jump[top.i]=i; jump[i]=top.i;
        if(top.otherwise!==null) jump[top.otherwise]=i;
      }
    });
    if(stack.length)throw Error('Add End for block '+(stack[stack.length-1].i+1)+'.');
    return {tokens,jump,other};
  }
  function atGoal(state) {return state.x===state.map.goal.x&&state.y===state.map.goal.y;}
  function occupied(map,x,y) {return x<0||y<0||x>=map.w||y>=map.h||map.walls.some(p=>p[0]===x&&p[1]===y);}
  function sensor(state) {
    if(state.scenario==='sensor-fault'&&state.moves>=2)return 'unknown';
    const [dx,dy]=DIRS[state.dir];
    if(state.scenario==='new-crate'&&state.moves>=2&&state.x+dx===3&&state.y+dy===2)return 'blocked';
    return occupied(state.map,state.x+dx,state.y+dy)?'blocked':'clear';
  }
  function validateMap(map) {
    if(!map||!Number.isInteger(map.w)||!Number.isInteger(map.h)||map.w<2||map.h<2||map.w>12||map.h>12)throw Error('Invalid map.');
    if(!Array.isArray(map.walls)||map.walls.length>map.w*map.h||map.walls.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isInteger)||p[0]<0||p[1]<0||p[0]>=map.w||p[1]>=map.h))throw Error('Invalid walls.');
    for(const p of [map.start,map.goal])if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||occupied(map,p.x,p.y))throw Error('Invalid start or goal.');
    if(!Number.isInteger(map.start.dir)||map.start.dir<0||map.start.dir>3)throw Error('Invalid direction.');
  }
  function create(map,input,scenario='normal') {
    validateMap(map); const program=compile(input);
    if(!['normal','sensor-fault','new-crate'].includes(scenario))throw Error('Unknown scenario.');
    return {map:JSON.parse(JSON.stringify(map)),...program,x:map.start.x,y:map.start.y,dir:map.start.dir,
      scenario,pc:0,active:-1,ticks:0,moves:0,turns:0,loops:{},status:'ready',trace:[],message:'Ready when you are.',visited:[[map.start.x,map.start.y]]};
  }
  function record(s,kind,message,index=s.active) {
    s.message=message;s.trace.push({tick:s.ticks,block:index+1,kind,message,x:s.x,y:s.y,facing:DIRECTIONS[s.dir],sensor:sensor(s)});
    return s;
  }
  function goalHint(s) {
    const dx=s.map.goal.x-s.x, dy=s.map.goal.y-s.y, parts=[];
    if(dy!==0)parts.push(Math.abs(dy)+' tile'+(Math.abs(dy)>1?'s':'')+' '+(dy<0?'north (↑)':'south (↓)'));
    if(dx!==0)parts.push(Math.abs(dx)+' tile'+(Math.abs(dx)>1?'s':'')+' '+(dx>0?'east (→)':'west (←)'));
    return parts.length?'Pad is '+parts.join(' and ')+' from Pip.':'Pip is on the pad.';
  }
  function stop(s) {s.status='estop';return record(s,'estop','Emergency stop. Pip stays here until you reset.');}
  function step(s) {
    if(!['ready','running'].includes(s.status))return s;
    if(atGoal(s)){s.status='success';return record(s,'success','Delivery complete! Your program reached the charging pad.');}
    if(s.ticks>=LIMITS.ticks){s.status='budget';return record(s,'budget','160 steps used. Look for a loop that never reaches the pad. '+goalHint(s));}
    if(s.pc>=s.tokens.length){
      s.status='finished';
      if(!s.tokens.length)return record(s,'finished','Your program has no blocks yet. Tap Forward to add your first step.');
      const hasIf=s.tokens.some(t=>t.op==='if'), hasLoop=s.tokens.some(t=>t.op==='until'||t.op==='repeat');
      const tip=hasIf&&!hasLoop?'Tip: An If block checks only once — wrap it inside Until pad to keep checking!':'Check the path and add or change a block.';
      return record(s,'finished','Program ended before the pad. '+goalHint(s)+' '+tip);
    }
    s.status='running';s.active=s.pc;s.ticks++;
    const i=s.pc,t=s.tokens[i];s.pc++;
    if(t.op==='move') {
      const reading=sensor(s);
      if(reading!=='clear') {
        s.status=reading==='unknown'?'sensor-fault':'blocked';
        if(reading==='unknown')return record(s,'unknown','Sensor unavailable at Block '+(i+1)+'. Pip stopped safely before moving. Reset to try again.');
        const [dx,dy]=DIRS[s.dir], nx=s.x+dx, ny=s.y+dy;
        const outOfBounds=nx<0||ny<0||nx>=s.map.w||ny>=s.map.h;
        const isCrate=s.scenario==='new-crate'&&s.moves>=2&&nx===3&&ny===2;
        const obstacle=outOfBounds?'the garden edge':isCrate?'an unexpected crate at Row '+(ny+1)+', Col '+(nx+1):'a planter at Row '+(ny+1)+', Col '+(nx+1);
        return record(s,'blocked','Path blocked at Block '+(i+1)+' by '+obstacle+'. Pip stayed put. Turn first, or check the sensor.');
      }
      const [dx,dy]=DIRS[s.dir];s.x+=dx;s.y+=dy;s.moves++;s.visited.push([s.x,s.y]);
      record(s,'move','Moved one tile '+DIRECTIONS[s.dir]+' to Row '+(s.y+1)+', Col '+(s.x+1)+'.');
    } else if(t.op==='left'||t.op==='right') {
      s.dir=(s.dir+(t.op==='left'?3:1))%4;s.turns++;record(s,'turn','Turned '+t.op+'. Now facing '+DIRECTIONS[s.dir]+'.');
    } else if(t.op==='wait')record(s,'wait','Waited one step. Position stays the same.');
    else if(t.op==='stop'){s.status='stopped';record(s,'stop','Stop block at Block '+(i+1)+': Pip is safely parked.');}
    else if(t.op==='repeat') {
      if(s.loops[i]===undefined)s.loops[i]=t.n;
      record(s,'repeat','Repeat group: '+s.loops[i]+' trip(s) left.');
    } else if(t.op==='until') {
      if(atGoal(s))s.pc=s.jump[i]+1;
      record(s,'until','At the pad? '+(atGoal(s)?'Yes.':'No — try the group again.'));
    } else if(t.op==='if') {
      const reading=sensor(s);
      if(reading==='unknown'){s.status='sensor-fault';return record(s,'unknown','Sensor unavailable at Block '+(i+1)+'. Pip cannot choose safely, so it stopped.');}
      if(reading==='blocked')s.pc=s.other[i]!==undefined?s.other[i]+1:s.jump[i]+1;
      record(s,'sensor','Ahead is '+reading+'. '+(reading==='clear'?'Use the If group.':'Use Else, or skip this group.'));
    } else if(t.op==='else') {s.pc=s.jump[i]+1;record(s,'else','Skip Else: the clear path was chosen.');}
    else if(t.op==='end') {
      const start=s.jump[i],op=s.tokens[start].op;
      if(op==='repeat') {s.loops[start]--;if(s.loops[start]>0)s.pc=start;else delete s.loops[start];}
      if(op==='until')s.pc=start;
      record(s,'end','End of group.');
    }
    if(atGoal(s)&&s.status==='running'){s.status='success';record(s,'success','Delivery complete! Your program reached the charging pad.');}
    return s;
  }
  function run(map,tokens,scenario) {
    const s=create(map,tokens,scenario);
    while(['ready','running'].includes(s.status))step(s);
    return s;
  }
  function toCode(input,language='js') {
    const tokens=validateTokens(input);let depth=0;const lines=[];
    tokens.forEach(t=>{
      if(t.op==='end'||t.op==='else')depth=Math.max(0,depth-1);
      let line;
      if(language==='python') {
        line={move:'robot.move()',left:'robot.left()',right:'robot.right()',wait:'robot.wait()',stop:'robot.stop()',until:'while not robot.at_goal():',if:'if robot.clear_ahead():',else:'else:',end:'# end'}[t.op];
        if(t.op==='repeat')line='for step in range('+t.n+'):';
      } else {
        line={move:'move();',left:'left();',right:'right();',wait:'wait();',stop:'stop();',until:'while (!atGoal()) {',if:'if (clearAhead()) {',else:'} else {',end:'}'}[t.op];
        if(t.op==='repeat')line='repeat('+t.n+') {';
      }
      lines.push('  '.repeat(depth)+line);
      if(['repeat','until','if','else'].includes(t.op))depth++;
    });return lines.join('\n');
  }
  function fromCode(text) {
    if(typeof text!=='string'||text.length>12000)throw Error('Code is too long. Keep it under 12,000 characters.');
    const lex=text.replace(/\/\/[^\n]*/g,'').replace(/\s+/g,'');let pos=0;const out=[];
    while(pos<lex.length){
      const rest=lex.slice(pos);let match;
      if((match=rest.match(/^(move|left|right|wait|stop)\(\);/))){out.push({op:match[1]});pos+=match[0].length;}
      else if((match=rest.match(/^repeat\((\d+)\)\{/))){out.push({op:'repeat',n:Number(match[1])});pos+=match[0].length;}
      else if(rest.startsWith('while(!atGoal()){')){out.push({op:'until'});pos+=17;}
      else if(rest.startsWith('if(clearAhead()){')){out.push({op:'if'});pos+=17;}
      else if(rest.startsWith('}else{')){out.push({op:'else'});pos+=6;}
      else if(rest.startsWith('}')){out.push({op:'end'});pos++;}
      else throw Error('Check your syntax near “'+rest.slice(0,24)+'”. Use the robot commands in the example.');
      if(out.length>LIMITS.blocks)throw Error('Use 60 blocks or fewer.');
    }
    compile(out);return out;
  }
  function cleanProgress(value,ids) {
    if(!value||typeof value!=='object'||value.version!==1)throw Error('This is not an Academy progress file (version 1).');
    const p={version:1,mission:ids.includes(value.mission)?value.mission:ids[0],drafts:{},completed:[],checks:[],safety:false,lab:[],sandboxMap:null};
    for(const id of ids){
      if(value.drafts&&Object.prototype.hasOwnProperty.call(value.drafts,id))p.drafts[id]=validateTokens(value.drafts[id]);
      if(Array.isArray(value.completed)&&value.completed.includes(id))p.completed.push(id);
      if(Array.isArray(value.checks)&&value.checks.includes(id))p.checks.push(id);
    }
    if(value.sandboxMap&&typeof value.sandboxMap==='object'){
      try{validateMap(value.sandboxMap);p.sandboxMap=JSON.parse(JSON.stringify(value.sandboxMap));}catch(e){p.sandboxMap=null;}
    }
    p.safety=value.safety===true;p.lab=['delivery','crate','sensor','stop'].filter(k=>Array.isArray(value.lab)&&value.lab.includes(k));return p;
  }
  return {LIMITS,OPS,DIRECTIONS,compile,create,step,run,stop,sensor,atGoal,occupied,validateMap,validateTokens,toCode,fromCode,cleanProgress,goalHint};
});
