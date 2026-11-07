/* UI and persistence only. Simulation decisions live in engine.js. */
(function(){
  'use strict';
  const E=window.Academy,M=window.AcademyMissions,$=id=>document.getElementById(id),KEY='openline.robot-academy.v1';
  const labels={move:['↑','Forward'],left:['↶','Turn left'],right:['↷','Turn right'],wait:['◷','Wait'],stop:['■','Stop'],repeat:['↻','Repeat'],until:['◎','Until pad'],if:['◇','If clear'],else:['↳','Else'],end:['⌟','End']};
  let progress={version:1,mission:M[0].id,drafts:{},completed:[],checks:[],safety:false,lab:[],sandboxMap:null},storageOK=true,mission,program=[],state,cursor=0,undo=[],timer=null,epoch=0,playing=false,variant=0,scenario='normal',codeMode=false,codeDirty=false,peekLang='js',sandboxTool='wall',installPrompt=null,stopLatched=false;
  let startupMessage='';
  try{
    const saved=localStorage.getItem(KEY);
    if(saved){
      try{progress=E.cleanProgress(JSON.parse(saved),M.map(m=>m.id));}
      catch(parseErr){startupMessage='Saved progress was reset because its format was invalid.';}
    }
  }catch(storageErr){storageOK=false;}

  function persist(){
    progress.mission=mission.id;
    progress.drafts[mission.id]=E.validateTokens(program);
    try{localStorage.setItem(KEY,JSON.stringify(progress));storageOK=true;}
    catch(e){storageOK=false;}
    updateSaveStatus();
  }
  function updateSaveStatus(){$('save-status').textContent=storageOK?'Autosave is on in this browser. No names, accounts, or data sent anywhere.':'Browser storage is unavailable in this mode. Use Save progress file to export your work.';}
  function map(){
    if(mission.sandbox&&progress.sandboxMap){
      try{E.validateMap(progress.sandboxMap);return progress.sandboxMap;}catch(e){progress.sandboxMap=null;}
    }
    return mission.maps?mission.maps[variant]:mission.map;
  }
  function cancel(){epoch++;if(timer!==null)clearTimeout(timer);timer=null;playing=false;}
  function fresh(){cancel();state=E.create(map(),[],scenario);state.message='Ready when you are.';if(stopLatched)E.stop(state);if(!(mission&&mission.id==='safety'&&(progress.lab||[]).length===4))$('reflection').hidden=true;renderState();}
  function switchMission(id){
    if(mission)persist();cancel();mission=M.find(m=>m.id===id)||M[0];variant=0;scenario='normal';$('variant').value='0';$('scenario').value='normal';
    program=JSON.parse(JSON.stringify(progress.drafts[mission.id]||mission.starter));cursor=program.length;undo=[];codeDirty=false;
    codeMode=false;$('blocks-view').hidden=false;$('code-view').hidden=true;$('blocks-tab').setAttribute('aria-pressed','true');$('code-tab').setAttribute('aria-pressed','false');
    $('mission-title').textContent=mission.title;$('mission-tag').textContent='MISSION '+mission.icon+' / '+mission.tag;$('mission-time').textContent=mission.time;$('brief').textContent=mission.brief;
    $('variant-label').hidden=!mission.maps;$('safety-panel').hidden=mission.id!=='safety';$('sandbox-toolbar').hidden=!mission.sandbox;$('hint-text').hidden=true;$('editor-status').textContent='';
    updateCodeViews();renderNav();renderPalette();renderProgram();fresh();persist();
  }
  function renderNav(){
    $('missions').replaceChildren();M.forEach(m=>{const b=document.createElement('button');b.className='mission';b.setAttribute('aria-current',m.id===mission.id?'step':'false');
      const num=document.createElement('span');num.className='mission-num';num.textContent=progress.checks.includes(m.id)?'✓':m.icon;
      const text=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=m.title;small.textContent=m.tag;text.append(strong,small);b.append(num,text);b.addEventListener('click',()=>switchMission(m.id));$('missions').append(b);});
  }
  function groupClass(op){return ['repeat','until','end'].includes(op)?'group':['if','else'].includes(op)?'sensor':op==='stop'?'stop':'';}
  function renderPalette(){
    $('palette').replaceChildren();mission.allowed.forEach(op=>{const b=document.createElement('button');b.className='command '+groupClass(op);b.dataset.op=op;
      const sym=document.createElement('span');sym.className='symbol';sym.textContent=labels[op][0];sym.setAttribute('aria-hidden','true');b.append(sym,document.createTextNode(labels[op][1]));b.setAttribute('aria-label','Add '+labels[op][1]+' block');b.addEventListener('click',()=>{
        const nodes=op==='repeat'?[{op,n:3},{op:'end'}]:op==='until'?[{op},{op:'end'}]:op==='if'?[{op},{op:'else'},{op:'end'}]:[{op}];
        if(program.length+nodes.length>E.LIMITS.blocks){notice('The program is full. Use loops or remove a block.');return;}
        edit(()=>{program.splice(cursor,0,...nodes);cursor++;});
      });$('palette').append(b);});
  }
  function notice(message){$('editor-status').textContent=message;}
  function updateCodeViews(){
    const jsCode=E.toCode(program), pyCode=E.toCode(program,'python');
    if(!codeDirty){$('source').value=jsCode;$('python').textContent=pyCode||'# Add blocks to see Python code';}
    const peekText=peekLang==='python'?(pyCode||'# Add blocks above to see Python code'):(jsCode||'// Add blocks above to see JavaScript code');
    if($('peek-source'))$('peek-source').textContent=peekText;
  }
  function edit(fn){
    if(state.status==='estop'){notice('Press Reset to release Emergency stop before editing.');return;}
    cancel();undo.push(JSON.stringify(program));if(undo.length>40)undo.shift();fn();cursor=Math.max(0,Math.min(cursor,program.length));
    codeDirty=false;fresh();renderProgram();persist();
  }
  function renderProgram(){
    const container=$('program');container.replaceChildren();$('block-count').textContent=program.length+' / 60';let depth=0;
    function marker(){const x=document.createElement('div');x.className='insertion';x.textContent='＋ NEXT BLOCK GOES HERE';container.append(x);}
    if(!program.length){const empty=document.createElement('div');empty.className='empty';const icon=document.createElement('span');icon.textContent='↑';empty.append(icon,document.createTextNode('Your first idea goes here.'),document.createElement('br'),document.createTextNode('Tap Forward above to begin.'));container.append(empty);}
    program.forEach((t,i)=>{
      if(i===cursor)marker();if(t.op==='end'||t.op==='else')depth=Math.max(0,depth-1);
      const row=document.createElement('div');row.className='block-row '+groupClass(t.op);row.style.setProperty('--depth',Math.min(depth,4));row.dataset.index=i;
      const isEnd=t.op==='end', isElse=t.op==='else';
      const label=document.createElement('button');label.className='block-label';
      const actionHint=isEnd?'Step outside group (add after End)':isElse?'Add inside Else branch':'Add blocks after this';
      label.setAttribute('aria-label','Block '+(i+1)+', '+labels[t.op][1]+'. '+actionHint+'.');
      const n=document.createElement('span');n.className='block-index';n.textContent=String(i+1).padStart(2,'0');
      const text=document.createElement('span');text.textContent=labels[t.op][0]+' '+labels[t.op][1];
      label.append(n,text);
      if(isEnd||isElse){
        const badge=document.createElement('span');badge.className='after-badge';
        badge.textContent=isEnd?'After End ⤵':'Inside Else ⤵';
        label.append(badge);
      }
      label.addEventListener('click',()=>{cursor=i+1;renderProgram();container.querySelectorAll('.block-label')[i]?.focus();});
      row.append(label);
      if(t.op==='repeat'){const count=document.createElement('input');count.type='number';count.min='1';count.max='20';count.value=t.n;count.setAttribute('aria-label','Repeat count for block '+(i+1));count.addEventListener('change',()=>{const v=Number(count.value);if(!Number.isInteger(v)||v<1||v>20){count.value=t.n;notice('Repeat needs a whole number from 1 to 20.');return;}edit(()=>{t.n=v;});});row.append(count);}
      for(const [symbol,title,action] of [['↑','Move up',()=>{[program[i-1],program[i]]=[program[i],program[i-1]];}],['↓','Move down',()=>{[program[i+1],program[i]]=[program[i],program[i+1]];}],['×','Remove',()=>{program.splice(i,1);cursor=Math.min(cursor,program.length);} ]]){
        const b=document.createElement('button');b.className='row-control';b.textContent=symbol;b.setAttribute('aria-label',title+' block '+(i+1));b.disabled=(title==='Move up'&&i===0)||(title==='Move down'&&i===program.length-1);b.addEventListener('click',()=>edit(action));row.append(b);
      }
      container.append(row);if(['repeat','until','if','else'].includes(t.op))depth++;
    });if(program.length&&cursor===program.length)marker();
    $('undo').disabled=!undo.length;$('clear').disabled=!program.length;
    updateCodeViews();
    try{E.compile(program);notice('');}catch(e){notice(e.message);}
  }
  function robot(){const p=document.createElement('div');p.className='pip';p.setAttribute('aria-hidden','true');p.innerHTML='<div class="pip-body"><div class="face"><i class="eye"></i><i class="eye"></i></div></div><span class="facing"></span>';p.querySelector('.facing').textContent=['↑','→','↓','←'][state.dir];return p;}
  function handleSandboxTileClick(x,y){
    if(!mission.sandbox||playing)return;
    if(state.status==='estop'){notice('Press Reset to release Emergency stop before editing the map.');return;}
    const current=JSON.parse(JSON.stringify(map()));
    if(sandboxTool==='wall'){
      if((current.start.x===x&&current.start.y===y)||(current.goal.x===x&&current.goal.y===y)){
        notice('Pip and the charging pad need open tiles! Move them first to place a planter here.');return;
      }
      const idx=current.walls.findIndex(w=>w[0]===x&&w[1]===y);
      if(idx>=0)current.walls.splice(idx,1);else current.walls.push([x,y]);
      notice(idx>=0?'Removed planter at Row '+(y+1)+', Col '+(x+1)+'.':'Added planter at Row '+(y+1)+', Col '+(x+1)+'.');
    } else if(sandboxTool==='pip'){
      if(current.goal.x===x&&current.goal.y===y){notice('Choose a tile different from the charging pad.');return;}
      current.walls=current.walls.filter(w=>!(w[0]===x&&w[1]===y));
      current.start.x=x;current.start.y=y;
      notice('Moved Pip start to Row '+(y+1)+', Col '+(x+1)+'.');
    } else if(sandboxTool==='pad'){
      if(current.start.x===x&&current.start.y===y){notice('Choose a tile different from Pip’s starting tile.');return;}
      current.walls=current.walls.filter(w=>!(w[0]===x&&w[1]===y));
      current.goal.x=x;current.goal.y=y;
      notice('Moved charging pad to Row '+(y+1)+', Col '+(x+1)+'.');
    }
    progress.sandboxMap=current;fresh();persist();$('board').querySelector(`.cell[data-x='${x}'][data-y='${y}']`)?.focus();
  }
  function renderBoard(){
    const b=$('board'),m=state.map;b.replaceChildren();b.style.setProperty('--cols',m.w);b.style.aspectRatio=m.w+'/'+m.h;
    b.classList.toggle('sandbox-editable',Boolean(mission.sandbox&&!playing));
    for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
      const c=document.createElement(mission.sandbox?'button':'div');
      if(mission.sandbox){
        c.type='button';
        const cellKind=x===state.x&&y===state.y?'Pip':x===m.goal.x&&y===m.goal.y?'Charging pad':E.occupied(m,x,y)?'Planter':'Open path';
        c.setAttribute('aria-label','Row '+(y+1)+', Column '+(x+1)+': '+cellKind+'. Activate to edit tile.');
        c.addEventListener('click',()=>handleSandboxTileClick(x,y));
      }
      c.className='cell';c.dataset.x=x;c.dataset.y=y;
      if(E.occupied(m,x,y)){c.classList.add('wall');const plant=document.createElement('span');plant.className='plant';c.append(plant);}
      if(state.visited.some(p=>p[0]===x&&p[1]===y))c.classList.add('visited');
      if(x===m.goal.x&&y===m.goal.y){c.classList.add('goal');const pad=document.createElement('span');pad.className='pad';pad.textContent='ϟ';c.append(pad);}
      if(state.scenario==='new-crate'&&state.moves>=2&&x===3&&y===2){c.classList.add('wall');c.textContent='▣';}
      if(x===state.x&&y===state.y)c.append(robot());b.append(c);
    }
    b.setAttribute('aria-label','Garden '+m.w+' columns by '+m.h+' rows. Pip at row '+(state.y+1)+', column '+(state.x+1)+', facing '+E.DIRECTIONS[state.dir]+'. Pad at row '+(m.goal.y+1)+', column '+(m.goal.x+1)+'. Text map available below.');
  }
  function renderSafetyDrills(){
    const wrap=$('stop-practice');if(!wrap)return;
    wrap.replaceChildren();
    if(mission.id!=='safety')return;
    const lab=progress.lab||[];
    const items=[
      ['delivery','1. Normal delivery','normal'],
      ['crate','2. Crate test','new-crate'],
      ['sensor','3. Sensor fault test','sensor-fault'],
      ['stop','4. Emergency stop','normal']
    ];
    items.forEach(([key,title,scen])=>{
      const done=lab.includes(key);
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='drill-badge'+(done?' done':'');
      btn.textContent=(done?'✓ ':'○ ')+title;
      btn.setAttribute('aria-label',title+(done?' (completed)':' (click to select scenario)'));
      btn.addEventListener('click',()=>{
        if(key==='stop'){
          notice('Drill 4: Press ▶ Run below, then quickly press the red ■ Emergency stop button while Pip is moving!');
        } else {
          scenario=scen;$('scenario').value=scen;fresh();
          notice('Selected '+title+'. Press ▶ Run to test how Pip responds!');
        }
      });
      wrap.append(btn);
    });
  }
  function renderState(){
    renderBoard();$('position').textContent='Row '+(state.y+1)+', column '+(state.x+1);$('direction').textContent=E.DIRECTIONS[state.dir][0].toUpperCase()+E.DIRECTIONS[state.dir].slice(1)+' '+['↑','→','↓','←'][state.dir];
    const sense=E.sensor(state);$('sensor').textContent={clear:'○ Clear',blocked:'■ Blocked',unknown:'? Unknown'}[sense];
    $('status').textContent=state.message;$('status').dataset.kind=state.status;$('tick-count').textContent=state.ticks+' / 160 steps';
    document.querySelectorAll('.block-row').forEach(r=>r.classList.toggle('active',Number(r.dataset.index)===state.active));
    $('trace').replaceChildren();state.trace.forEach(t=>{const row=document.createElement('li'),note=document.createElement('small');row.textContent=t.message;note.textContent='Step '+t.tick+' · Block '+t.block+' · Row '+(t.y+1)+', col '+(t.x+1)+' · Ahead: '+t.sensor;row.append(note);$('trace').append(row);});
    $('run').disabled=playing||state.status==='estop';$('step').disabled=playing||state.status==='estop';$('run').textContent=playing?'Running…':(state.status==='running'?'▶ Continue':'▶ Run');
    renderSafetyDrills();
  }
  function prepare(){
    if(state.status==='estop'){notice('Press Reset to release Emergency stop.');return false;}
    if(codeMode&&codeDirty&&!applyCode())return false;
    if(!program.length){notice('Add a Forward block to begin.');return false;}
    if(state.status==='ready'||!['running'].includes(state.status)){
      try{state=E.create(map(),program,scenario);if(!(mission&&mission.id==='safety'&&(progress.lab||[]).length===4))$('reflection').hidden=true;notice('');}catch(e){notice(e.message);return false;}
    }
    return true;
  }
  function finish(){
    playing=false;timer=null;renderState();
    if(mission.id==='safety'){
      const mark=state.status==='success'&&scenario==='normal'?'delivery':state.status==='sensor-fault'?'sensor':state.status==='blocked'&&scenario==='new-crate'&&state.moves===2?'crate':null;
      if(mark){progress.lab=progress.lab||[];if(!progress.lab.includes(mark))progress.lab.push(mark);persist();renderState();}
      if((progress.lab||[]).length<4){
        const remaining=4-(progress.lab||[]).length;
        if(mark)notice('✓ Drill recorded! '+remaining+' more safety drill'+(remaining>1?'s':'')+' left in the checklist to unlock the reflection.');
        return;
      }
    }
    if(state.status==='success'||(mission.id==='safety'&&(progress.lab||[]).length===4)){
      if(!progress.completed.includes(mission.id))progress.completed.push(mission.id);
      persist();renderNav();showReflection();
    }
  }
  function oneStep(){E.step(state);renderState();if(!['ready','running'].includes(state.status))finish();}
  function run(){
    if(playing||!prepare())return;playing=true;const token=++epoch;renderState();
    function tick(){if(token!==epoch||!playing)return;oneStep();if(playing)timer=setTimeout(tick,Number($('speed').value));}
    timer=setTimeout(tick,0);
  }
  function emergency(){
    const active=playing||state.status==='running';cancel();stopLatched=true;E.stop(state);if(active){progress.safety=true;if(mission.id==='safety'){progress.lab=progress.lab||[];if(!progress.lab.includes('stop'))progress.lab.push('stop');}persist();}renderState();notice('Emergency stop is latched. Press Reset when you are ready.');if(mission.id==='safety'&&(progress.lab||[]).length===4)finish();
  }
  function showReflection(){
    $('reflection').hidden=false;$('concept').textContent=mission.concept;$('question').textContent=mission.question;$('answer-feedback').textContent=progress.checks.includes(mission.id)?'✓ Learning check completed. Try explaining it to a partner.':'';$('answers').replaceChildren();
    mission.answers.forEach((answer,i)=>{const b=document.createElement('button');b.textContent=answer;b.addEventListener('click',()=>{
      if(i===mission.correct){if(!progress.checks.includes(mission.id))progress.checks.push(mission.id);$('answer-feedback').textContent='✓ '+mission.explain;persist();renderNav();}
      else $('answer-feedback').textContent='Try tracing it one step at a time. '+mission.explain;
    });$('answers').append(b);});
    $('next').textContent=M.indexOf(mission)===M.length-1?'Try another idea ↻':'Next mission →';
  }
  function applyCode(){
    try{const next=E.fromCode($('source').value);if(state.status==='estop'){notice('Press Reset before changing the program.');return false;}edit(()=>{program=next;cursor=program.length;});notice('Code loaded. Predict the path, then Run.');return true;}catch(e){notice(e.message);return false;}
  }
  function showCode(show){
    if(!show&&codeDirty){codeDirty=false;updateCodeViews();}
    codeMode=show;$('blocks-view').hidden=show;$('code-view').hidden=!show;$('blocks-tab').setAttribute('aria-pressed',!show);$('code-tab').setAttribute('aria-pressed',show);
    if(show&&!codeDirty)updateCodeViews();
  }
  function setSandboxTool(tool){
    sandboxTool=tool;
    [['wall','tool-wall'],['pip','tool-pip'],['pad','tool-pad']].forEach(([k,id])=>{const b=$(id);if(b)b.setAttribute('aria-pressed',k===tool?'true':'false');});
  }
  function download(filename,data,type='application/json'){
    const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function openDialog(id){cancel();if(state.status==='running'){state.message='Paused while this panel is open. Press Continue when ready.';renderState();}$(id).showModal();}
  function textMap(){
    const m=state.map;$('map-description').textContent='Pip is at row '+(state.y+1)+', column '+(state.x+1)+', facing '+E.DIRECTIONS[state.dir]+'. Forward moves in that direction. Turning changes direction without moving.';
    const table=$('text-map');table.querySelectorAll('thead,tbody').forEach(x=>x.remove());const thead=document.createElement('thead'),tr=document.createElement('tr');
    for(let x=0;x<=m.w;x++){const th=document.createElement('th');th.scope='col';th.textContent=x?'Col '+x:' ';tr.append(th);}thead.append(tr);table.append(thead);
    const tbody=document.createElement('tbody');for(let y=0;y<m.h;y++){const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent='Row '+(y+1);tr.append(th);for(let x=0;x<m.w;x++){const td=document.createElement('td');td.textContent=(x===state.x&&y===state.y?'Pip ': '')+(x===m.goal.x&&y===m.goal.y?'Pad':E.occupied(m,x,y)?'Planter':state.scenario==='new-crate'&&state.moves>=2&&x===3&&y===2?'Crate':'Path');tr.append(td);}tbody.append(tr);}table.append(tbody);openDialog('map-dialog');
  }
  async function offline(){
    if(location.protocol==='file:'){$('offline-status').textContent='This downloaded copy runs offline. Keep this file on your device.';$('cache-offline').hidden=true;return;}
    if(!('serviceWorker' in navigator)){$('offline-status').textContent='Offline installation is unavailable here. Use the self-contained HTML download.';$('cache-offline').hidden=true;return;}
    $('offline-status').textContent='Saving app files for offline use…';
    try{
      const reg=await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;
      const worker=reg.active||navigator.serviceWorker.controller;
      const ok=await new Promise(resolve=>{const ch=new MessageChannel();const timeout=setTimeout(()=>resolve(false),5000);ch.port1.onmessage=e=>{clearTimeout(timeout);resolve(e.data&&e.data.ready===true);};worker.postMessage({type:'CACHE_READY'},[ch.port2]);});
      $('offline-status').textContent=ok?'Offline files are ready. Test once with Wi-Fi off before the workshop. You can also use your browser’s Install or Add to Home Screen menu.':'Offline cache is not verified yet. Keep the downloaded HTML as your backup.';
    }catch(e){$('offline-status').textContent='Could not prepare offline storage. Use the self-contained HTML download; this browser may restrict installation.';}
  }
  $('run').addEventListener('click',run);$('step').addEventListener('click',()=>{if(!playing&&prepare())oneStep();});
  $('reset').addEventListener('click',()=>{stopLatched=false;fresh();notice('Robot reset. Your program is still here.');});$('estop').addEventListener('click',emergency);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){emergency();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){cancel();state.message='Paused when you left the page. Press Continue to resume.';renderState();}});
  $('undo').addEventListener('click',()=>{if(!undo.length)return;if(state.status==='estop'){notice('Press Reset first.');return;}cancel();program=JSON.parse(undo.pop());cursor=program.length;codeDirty=false;fresh();renderProgram();persist();});
  $('clear').addEventListener('click',()=>edit(()=>{program=[];cursor=0;}));$('starter').addEventListener('click',()=>edit(()=>{program=JSON.parse(JSON.stringify(mission.starter));cursor=program.length;}));
  $('hint').addEventListener('click',()=>{$('hint-text').hidden=!$('hint-text').hidden;$('hint-text').textContent=mission.hint;});
  $('next').addEventListener('click',()=>{const i=M.indexOf(mission);if(i<M.length-1)switchMission(M[i+1].id);else{fresh();notice(mission.challenge);} $('workspace').scrollIntoView({behavior:'auto',block:'start'});});
  $('variant').addEventListener('change',()=>{variant=Number($('variant').value);fresh();notice('New route, same program. Predict what will happen.');});
  $('scenario').addEventListener('change',()=>{scenario=$('scenario').value;fresh();notice('Test condition changed. Your program is unchanged.');});
  $('blocks-tab').addEventListener('click',()=>showCode(false));$('code-tab').addEventListener('click',()=>showCode(true));$('apply-code').addEventListener('click',applyCode);
  $('source').addEventListener('input',()=>{codeDirty=true;cancel();if(state.status==='running'){state.status='edited';state.message='Code changed. Run starts the edited program from the beginning.';renderState();}});
  $('peek-js')?.addEventListener('click',()=>{peekLang='js';$('peek-js').setAttribute('aria-pressed','true');$('peek-py').setAttribute('aria-pressed','false');updateCodeViews();});
  $('peek-py')?.addEventListener('click',()=>{peekLang='python';$('peek-js').setAttribute('aria-pressed','false');$('peek-py').setAttribute('aria-pressed','true');updateCodeViews();});
  [['wall','tool-wall'],['pip','tool-pip'],['pad','tool-pad']].forEach(([k,id])=>$(id)?.addEventListener('click',()=>setSandboxTool(k)));
  $('rotate-pip')?.addEventListener('click',()=>{
    if(!mission.sandbox||playing)return;
    if(state.status==='estop'){notice('Press Reset first.');return;}
    const current=JSON.parse(JSON.stringify(map()));
    current.start.dir=(current.start.dir+1)%4;
    progress.sandboxMap=current;fresh();persist();$('board').querySelector(`.cell[data-x='${current.start.x}'][data-y='${current.start.y}']`)?.focus();
    notice('Rotated Pip to face '+E.DIRECTIONS[current.start.dir]+'.');
  });
  $('sandbox-preset')?.addEventListener('change',()=>{
    if(!mission.sandbox||playing)return;
    if(state.status==='estop'){notice('Press Reset first.');return;}
    const idx=Number($('sandbox-preset').value)||0;
    const preset=mission.presets&&mission.presets[idx]?mission.presets[idx]:{name:'Zigzag course',map:mission.map};
    progress.sandboxMap=JSON.parse(JSON.stringify(preset.map));fresh();persist();
    notice('Loaded sandbox preset: '+preset.name+'.');
  });
  $('reset-map')?.addEventListener('click',()=>{
    if(!mission.sandbox||playing)return;
    if(state.status==='estop'){notice('Press Reset first.');return;}
    const idx=$('sandbox-preset')?Number($('sandbox-preset').value)||0:0;
    const preset=mission.presets&&mission.presets[idx]?mission.presets[idx]:{name:'Zigzag course',map:mission.map};
    progress.sandboxMap=JSON.parse(JSON.stringify(preset.map));fresh();persist();
    notice('Reset sandbox map to '+preset.name+'.');
  });
  $('print-guide')?.addEventListener('click',()=>window.print());
  $('trace-export').addEventListener('click',()=>download('pip-trace.json',JSON.stringify({format:'openline-academy-trace-v1',mission:mission.id,variant,scenario,map:state.map,program:state.tokens,status:state.status,trace:state.trace},null,2)));
  $('guide-open').addEventListener('click',()=>openDialog('guide-dialog'));$('settings-open').addEventListener('click',()=>{updateSaveStatus();openDialog('settings-dialog');});$('map-open').addEventListener('click',textMap);
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $('export-progress').addEventListener('click',()=>{persist();download('pip-progress.json',JSON.stringify(progress,null,2));});
  $('import-progress').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Choose a progress file smaller than 100 KB.');const loaded=E.cleanProgress(JSON.parse(await file.text()),M.map(m=>m.id));cancel();mission=null;progress=loaded;switchMission(loaded.mission);$('import-status').textContent='Progress loaded. Pip is parked and ready.';}catch(err){$('import-status').textContent='Could not load: '+err.message;}e.target.value='';});
  $('erase-progress').addEventListener('click',()=>{cancel();progress={version:1,mission:M[0].id,drafts:{},completed:[],checks:[],safety:false,lab:[],sandboxMap:null};try{localStorage.removeItem(KEY);}catch(e){}mission=null;switchMission(M[0].id);$('settings-dialog').close();notice('Local progress cleared. A fresh start.');});
  $('cache-offline').addEventListener('click',offline);
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install').hidden=false;});$('install').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('install').hidden=true;}});
  switchMission(progress.mission);if(startupMessage)notice(startupMessage);offline();
})();
