(function(root){
  'use strict';
  function corridor(turn){
    const walls=[];for(let y=0;y<6;y++)for(let x=0;x<7;x++)if(!((y===4&&x<=turn)||(x===turn&&y>=1&&y<=4)))walls.push([x,y]);
    return {w:7,h:6,start:{x:0,y:4,dir:1},goal:{x:turn,y:1},walls};
  }
  const missions=[{
    id:'delivery',title:'First delivery',tag:'SEQUENCES',icon:'01',time:'3 min',
    brief:'Help Pip reach the charging pad. Tap Forward three times, then press Run.',
    concept:'A sequence is a list of steps in order. Pip follows your blocks from top to bottom.',
    hint:'Pip starts facing East (right →). Each Forward block moves 1 tile right. Count the 3 spaces to the charging pad.',
    challenge:'Try adding one extra Forward after the third one. Why does Pip stop safely on the pad anyway?',
    map:{w:5,h:5,start:{x:0,y:3,dir:1},goal:{x:3,y:3},walls:[[1,1],[2,1],[4,0],[4,1],[4,4]]},
    allowed:['move','left','right'],starter:[],solution:[{op:'move'},{op:'move'},{op:'move'}],
    question:'Pip faces right. What does Forward, Turn left, Forward do?',
    answers:['Right one tile, then up one tile.','Right three tiles.','Up two tiles.'],correct:0,
    explain:'A turn changes the direction Pip faces without leaving the tile. The next Forward moves in that new direction.'
  },{
    id:'garden',title:'Garden path',tag:'LOOPS + TURNS',icon:'02',time:'8 min',
    brief:'Go 4 tiles right, turn left, then go 3 tiles up. Let two Repeat groups do the counting!',
    concept:'A loop repeats a group of instructions. Keep the turn outside the first loop: order still matters.',
    hint:'1) Tap Repeat (set to 4) and tap Forward. 2) Tap "After End ⤵" to step outside the loop. 3) Tap Turn left, then add Repeat (set to 3) with Forward inside.',
    challenge:'Move Turn left inside the first Repeat group. Predict what shape Pip will trace before pressing Run!',
    map:{w:6,h:6,start:{x:0,y:4,dir:1},goal:{x:4,y:1},walls:[[1,1],[2,1],[1,2],[2,2],[0,0],[5,5],[1,5],[2,5],[3,5]]},
    allowed:['move','left','right','repeat'],starter:[],
    solution:[{op:'repeat',n:4},{op:'move'},{op:'end'},{op:'left'},{op:'repeat',n:3},{op:'move'},{op:'end'}],
    question:'Repeat 4 { Forward; Turn left; } makes what shape on an empty floor?',
    answers:['A straight line of four tiles.','A small square, ending where it started.','Four left turns without moving.'],correct:1,
    explain:'Each trip moves one tile and turns left. Four trips trace a 4-sided square. A loop repeats every block inside it.'
  },{
    id:'scout',title:'Sensor scout',tag:'SENSE + DECIDE',icon:'03',time:'10 min',
    brief:'Let Pip sense the corner! Until pad: if ahead is clear, move forward; else, turn left. Test on routes A, B, and C.',
    concept:'Feedback means checking the world again after each move. One smart rule can solve routes of different lengths.',
    hint:'1) Tap Until pad. 2) Tap If clear, then tap Forward. 3) Tap the Else row, then tap Turn left. Now run the exact same program on routes A, B, and C!',
    challenge:'A left-turn rule solves these L-shaped routes. Would it solve a route that bends right? Try building one in Sandbox!',
    maps:[corridor(3),corridor(4),corridor(5)],
    allowed:['move','left','right','until','if','repeat'],starter:[],
    solution:[{op:'until'},{op:'if'},{op:'move'},{op:'else'},{op:'left'},{op:'end'},{op:'end'}],
    question:'Route B has the corner one tile farther away than Route A. Why does the exact same sensor program still work?',
    answers:['It memorizes the number of tiles.','It always turns after three moves.','It checks the path again before each move.'],correct:2,
    explain:'Each time through Until pad, Pip takes a fresh sensor reading. A different maze shape may need a different rule.'
  },{
    id:'safety',title:'Safety lab',tag:'DEBUG + PROTECT',icon:'04',time:'10 min',
    brief:'This starter has a bug! Use Step to find it. Then complete all 4 safety drills: Deliver, Crate, Sensor fault, and Emergency stop.',
    concept:'A safe robot needs both a plan and a stopping rule. Blocked paths and failed sensors require stopping safely.',
    hint:'1) Remove Block 01 (Turn left) and Run to complete Normal delivery. 2) Switch condition to "A crate appears" and Run. 3) Switch to "Sensor fails" and Run. 4) Press Run and hit the red Emergency stop button mid-run!',
    challenge:'Write a safety rule for a delivery robot in a crowded school hallway. What could its front sensor miss?',
    map:{w:7,h:5,start:{x:0,y:2,dir:1},goal:{x:5,y:2},walls:[[0,1],[1,0],[2,0],[4,0],[5,0],[6,1],[1,4],[2,4],[4,4],[5,4]]},
    allowed:['move','left','right','wait','stop','repeat','until','if'],
    starter:[{op:'left'},{op:'repeat',n:5},{op:'move'},{op:'end'}],
    solution:[{op:'repeat',n:5},{op:'move'},{op:'end'}],
    question:'Pip’s sensor says “unknown.” What is the safest next action?',
    answers:['Keep moving because it was clear before.','Stop and check before moving again.','Treat unknown as an empty path.'],correct:1,
    explain:'Old evidence cannot prove the path is still clear. When a sensor fails, stop immediately and wait for human inspection.'
  },{
    id:'sandbox',title:'Creative sandbox',tag:'BUILD + INVENT',icon:'05',time:'Open',
    brief:'Design your own garden challenge or choose a preset below! Tap map tiles in Builder mode to place planters, Pip, or the pad.',
    concept:'Engineers test their ideas by designing new worlds, comparing loop vs. sensor strategies, and sharing challenges with partners.',
    hint:'To solve the default Zigzag course: try Repeat 2 { Forward; Forward; Turn left; Forward; Turn right; } — or pick Spiral or Open Garden in the Map Builder!',
    challenge:'Build a custom maze on your screen, check that your program solves it, then Clear your program and hand the device to a partner to solve!',
    sandbox:true,
    map:{w:6,h:6,start:{x:0,y:4,dir:1},goal:{x:4,y:2},walls:[[1,1],[1,2],[1,3],[3,1],[3,4],[3,5],[5,0],[5,1]]},
    presets:[
      {name:'Zigzag course',map:{w:6,h:6,start:{x:0,y:4,dir:1},goal:{x:4,y:2},walls:[[1,1],[1,2],[1,3],[3,1],[3,4],[3,5],[5,0],[5,1]]}},
      {name:'Left-turn spiral',map:{w:6,h:6,start:{x:0,y:5,dir:1},goal:{x:2,y:3},walls:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[3,2]]}},
      {name:'Open garden (blank)',map:{w:6,h:6,start:{x:0,y:5,dir:1},goal:{x:5,y:0},walls:[]}}
    ],
    allowed:['move','left','right','wait','stop','repeat','until','if'],
    starter:[],
    solution:[{op:'repeat',n:2},{op:'move'},{op:'move'},{op:'left'},{op:'move'},{op:'right'},{op:'end'}],
    question:'You build a custom maze for a friend. How can you prove your maze is actually solvable before handing it over?',
    answers:['Guess that it looks easy enough.','Write and run a working solution on the map yourself first.','Add as many planters as possible.'],correct:1,
    explain:'Testing your own level with a working program proves a valid path exists from Pip to the charging pad.'
  }];
  if(typeof module==='object'&&module.exports)module.exports=missions;else root.AcademyMissions=missions;
})(typeof globalThis!=='undefined'?globalThis:this);
