  var xSize = 16;
  var ySize = 12; //not the actual values, see setCanvasSize();
  
  const tileSizeSteps = [20,30,40,50,60,70,80,90,100];
  const animeScaleSteps = {};
  
  var newtileSize = tileSize = tileSizeSteps[3];  // default 50
  
  setTileRadius();
  
  var tileRoundness = roundnessSteps[4] //if tilesize is 50, 25 will make a circle, default 10
  var animeScale, menuFadeRate, menufps; // 2.2 at 144hz also not actual value: see MeasureFps()
  
  const canvas = document.getElementById('gameField');
  const ctx = canvas.getContext('2d');
  
  const scoreCanvas = document.getElementById('scoreField');
  const scoreCtx = scoreCanvas.getContext('2d')
  
  const backCanvas = document.getElementById('garfield');
  const backCtx = backCanvas.getContext('2d')

  const nextGrid = [];
  const undoGrid = [];

  const pathGrid = [];

  var resizeId; //window size
  var undoValues = {};
  var nightmode = false;

// at 144 fps, 50 px tile size, anime scale: 2.2 looks okay. so in 1 second a tile moves 317 px, or 317 / 1000 = 0.317 px / ms

  makeGrid.colorLookup = [];
  makeGrid.colors = 6; //amount of colors by default, for max colors see line 930ish
  
  //these updated by nextMatrix only.
  makeGrid.loadTiles = 0;  //used to for load / unload animation
  makeGrid.colorTiles = 1;  //used for game over state // starts with 1 so gameover don't immediately tirggers
  makeGrid.whiteTiles = 0;  //also know as fixed tiles
  makeGrid.grayTiles = 0;  //also know as locked tiles

  // makeGrid.tilesLeft = 0; //total amount of tiles,  used for load / unload anim, basically: xSize * ySize
  
  makeGrid.loadAnimType;
  nextMatrix.validClusterCount = 0;
  highScore.totalScore = 0;
  writeScore.score = 0;
  
  difficulty.removal = { value:0,color:0 }
  difficulty.setting = 4; // 1: every 3 tile let you remove a single one. //2 same color as last 3 tiles //3 removes limited by number of colors //4 same, but also limited by color  last 3tile //5 no removes at all.
  difficulty.verticalMove = true;
  

  checkSettings.fixedTiles = 0; // unmovable tiles, fixed tiles, tiles that dont fall with a better name
  checkSettings.permanentTiles = 0; //tiles that cant be removed.
  checkSettings.paths = 1;
  checkSettings.percent = ["off","active","unlocked" ]

  moveSlider.called = 0;
 //menu stuff
  var gameoverBox, settingsBox, gameoverText, roundnessSteps, tileSizeSlider, roundnessSlider, colorSlider, difficultySlider, presetSlider, pathSlider, fixedTilesSlider, permanentTilesSlider;

  //the very first one here is the default color on score canvas remove background, tiles colors starts at index 1
  
  //ver 1 colors
  //const tileColors = ["#6BDCFF","#FFCA57","#B67E5C","#876047","#FFF570","#4ED06A","#42AE57","#7AFFF0","#6BDCFF","#4B80AF","#FF7A88","#EC5E7C","#804B79","#151515","#fafafa"]
  
  //ver 2 colors
  //const tileColors = ["#6BDCFF","#FFA754","#8F4D3C","#5F2A21","#FFE961","#4BA34B","#357430","#7BFFE1","#70C4FF","#3D4B74","#FF656F","#D94D5C","#591E3E","#151515","#fafafa"]
  
  //ver 3
  //const tileColors = ["#6BDCFF","#fcac50","#916046","#644534","#fee965","#42ae55","#358a43","#6afde0","#5ac0fb","#386189","#fb6570","#d54c62","#5e3657","#151515","#fafafa"]

  //ver 4 - final?
  //var tileColors = ["#6BDCFF","#ffaa65","#c78461","#845b4b","#fecc68","#36c272","#009359","#4acbd5","#169ebb","#2d6792","#ff6474","#d15261","#6a465d","#151515","#efebe8"]

  //ver 5 - final final...
  var tileColors = ["#165786","#ffa154","#c17750","#774937","#fec658","#20bb63","#008747","#36c5d0","#0093b4","#165686","#ff5365","#cc3f50","#5a324b","#474747","#efebe8","#919191"]

  //night mode 
  //const tileColors = ["#439b99","#c98356","#6a4132","#39251d","#caba7d","#2a885f","#1e5b3f","#4eceb3","#439b99","#243d42","#e4514c","#b6383a","#50333a","#343434","#f4f4dc"]
  
  //night mode v2 final?
  //const tileColors = ["#439b99","#c98356","#6a4132","#402a21","#caba7d","#2a885f","#1e5b3f","#4eceb3","#439b99","#243d42","#e4514c","#b6383a","#5f3741","#343434","#f4f4dc"]

  //const tileColors = ["#6BDCFF","#","#","#","#","#","#","#","#","#","#","#","#","#151515","#fafafa"]

  /* colors:
  orange = "#FFCA57"        hsl(41, 100%, 67%) 
  brown = "#B67E5C"         hsl(23, 38%, 54%)
  darkbrown = "#876047"     hsl(23, 31%, 40%) 
  yellow = "#FFF570"        hsl(56, 100%, 72%)
  green = "#4ED06A"         hsl(133, 58%, 56%)
  darkergreen = "#42AE57"   hsl(132, 45%, 47%)
  lightblue = "#7AFFF0"     hsl(173, 100%, 74%)
  blue = "#6BDCFF"          hsl(194, 100%, 71%)
  darkblue = "#4B80AF"      hsl(208, 40%, 49%)
  pink = "#FF7A88"         hsl(354, 100%, 74%)
  darkerpink = "#EC5E7C"   hsl(347, 79%, 65%)
  purple = "#804B79"       hsl(308, 26%, 40%)
  black = "#151515"        hsl(0, 0%, 8%)
  white = "#fafafa"        hsl(0, 0%, 98%)
   */

  // var temp = 0;

  setMenu.area = {state:0}; //blue box over a clicked button
  setMenu.level = {state:0}; //level indicator

  const gameOverSprite = new Image();
  gameOverSprite.src = 'allClear-next-v4.png';

  const settingsSprite = new Image();
  settingsSprite.src = 'settings-next-v7.png';

  const levelSprite = new Image();
  levelSprite.src = 'levels.png';

class tile {
  
  constructor(rx,ry,nx,ny,color,state) {
    this.rx = rx * tileSize; //rx = rendered X position, where the tile is shown.
    this.ry = ry * tileSize; //ry = rendered Y position
    this.nx = nx * tileSize; //nx = new X position of the tile, moveTile() will change rx until it reached
    this.ny = ny * tileSize; //ny = new Y position of the tile.
    this.color = color;
    this.cluster = 0;
    this.state = state; // 0: hidden, removed, 1: needs to fade out, 2: active, 3: load in anim at start, 4: load out anim, at end.
    this.size = 0;
    this.topleft = 0;  //roundness
    this.topright = 0;
    this.bottomleft = 0;
    this.bottomright = 0;
    this.despawn = 0; //store previous tile object
    this.block = 0; //a continous block of tiles based on state
    this.reload = false; //tiles that playing reolad animation
    this.acc = 0; //acceleration
    this.hacc = 0; //horizontal acceleration
    this.pathTile = false;
    }
  
  moveTile() {
  if (this.rx > this.nx) {this.rx = Math.max( this.rx - animeScale - this.hacc, this.nx); this.hacc += 0.028; } //right to left - default
  if (this.rx < this.nx) {this.rx = Math.min( this.rx + animeScale + this.hacc, this.nx); this.hacc += 0.028; } //left to right

  if (this.ry > this.ny) {this.ry = Math.max( this.ry - animeScale, this.ny); } //up
  if (this.ry < this.ny) {this.ry = Math.min( this.ry + animeScale + this.acc, this.ny); this.acc += 0.034; } //down

  if (this.ry == this.ny && this.rx == this.nx) { this.state = 3; this.hacc = 0; this.acc = 0 }

  //if (this.ry != this.ny) {this.ry = Math.min( this.ry + animeScale, this.ny); }
  //if (this.ry == this.ny && this.rx == this.nx) { this.state = 3 }
  }

  reoladTiles() {
  if (this.size != tileSize && Math.random() > 0.8 ) { this.size = Math.min(this.size + animeScale, tileSize) }
  if (this.size == tileSize) { this.reload = false; convertTiles.loadTiles--; }
  if (convertTiles.loadTiles == 0) { dropTiles(); }
  }

  loadTiles() {
  if (this.size != tileSize && Math.random() > 0.8 ) { this.size = Math.min(this.size + animeScale, tileSize) }
  if (this.size == tileSize) {this.state = 3; makeGrid.loadTiles++; }
  if ( makeGrid.loadTiles == xSize * ySize) { assingEventListener("game"); makeGrid.loadAnimType = 1;}
  }
  
  unLoadTiles() {
  if (this.size != tileSize / 10 && Math.random() > 0.8 ) { this.size = Math.max(this.size - animeScale, 0)}
  if (this.size <= 0) { this.state = 0; makeGrid.loadTiles--; }
  if ( makeGrid.loadTiles == 0 ) { resetTileCount(); newGame(); }
  }

  despawnWhiteTile() {
  if (this.size != tileSize / 10 && Math.random() > 0.8 ) { this.size = Math.max(this.size - animeScale, 0)}
  if (this.size <= 0) {this.state = 0; this.color = 0; this.cluster = 0;}
  }
  
  despawnTile() {

   if (this.despawn.size != this.despawn.tileSize / 5)  { this.despawn.size = Math.max(this.despawn.size - animeScale, 0) }
   if (this.despawn.size == 0)  { this.despawn = 0; return }
          
   //let offset = 0;
   /*if (this.despawn.size != tileSize) { */
   let offset = (tileSize - this.despawn.size) / 2; // } // used to be default

   ctx.beginPath(); 
   ctx.fillStyle = tileColors[this.despawn.color];
   ctx.roundRect(this.despawn.rx + offset, this.despawn.ry + offset, this.despawn.size, this.despawn.size, tileRoundness); //x,y, size x, size y //[this.topleft, this.topright, this.bottomright, this.bottomleft]
   ctx.fill();
   }

  show() {
          
          let offset = 0;
          
          if (this.size != tileSize) {

          switch ( makeGrid.loadAnimType ) {
          case 1: offset = (tileSize - this.size) / 2; break; // used to be default
          case 2: offset = (tileSize - this.size); break;
          default: break;
          }}

  ctx.beginPath(); 
  ctx.fillStyle = tileColors[this.color];

  let xmoveOffset = 0;
  let ymoveOffset = 0;
    
    if (this.rx != this.nx) {xmoveOffset = 1 } //add one pixel to moving tiles size so subpixel movments are smooth
    if (this.ry != this.ny) {ymoveOffset = 1 }
  
  ctx.roundRect(this.rx + offset, this.ry + offset, this.size + xmoveOffset, this.size + ymoveOffset, [this.topleft, this.topright, this.bottomright, this.bottomleft]); //x,y, size x, size y //[this.topleft, this.topright, this.bottomright, this.bottomleft]
  ctx.fill();


      if ( checkSettings.fixedTiles != 2 && this.color == 14 && this.ry <= bgFill.animPosition && this.ry + this.size > bgFill.animPosition ) {

          ctx.fillStyle = "rgba(0,0,0,0.25)"
          ctx.fillRect(this.rx + offset, bgFill.animPosition + offset, this.size + xmoveOffset, this.ry + this.size - bgFill.animPosition + ymoveOffset ) 
          }
          
      else if ( checkSettings.fixedTiles != 2 && this.color == 14 && this.ry > bgFill.animPosition ) {
          ctx.fillStyle = "rgba(0,0,0,0.25)"
          ctx.fillRect(this.rx + offset, this.ry + offset, this.size + xmoveOffset, this.size + ymoveOffset)
          }

      if ( checkSettings.permanentTiles != 2 && this.color == 15 && this.ry <= bgFill.animPosition && this.ry + this.size > bgFill.animPosition ) {

          ctx.fillStyle = "rgba(0,0,0,0.25)"
          ctx.fillRect(this.rx + offset, bgFill.animPosition + offset, this.size + xmoveOffset, this.ry + this.size - bgFill.animPosition + ymoveOffset ) 
          }
          
      else if ( checkSettings.permanentTiles != 2 && this.color == 15 && this.ry > bgFill.animPosition ) {
          ctx.fillStyle = "rgba(0,0,0,0.25)"
          ctx.fillRect(this.rx + offset, this.ry + offset, this.size + xmoveOffset, this.size + ymoveOffset)
          }

}

  pathTileCenter() {

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.25)"

  let offset = this.size / 3
  ctx.roundRect(this.rx + offset , this.ry + offset , offset , offset, tileRoundness);
  ctx.fill();
  }

  whiteTileCenter() {
  
  ctx.beginPath();
  ctx.fillStyle = nightmode ? "#d8d8cc" : "#d8d4d2"

  let offset = this.size / 3
  ctx.roundRect(this.rx + offset , this.ry + offset , offset , offset, [this.topleft, this.topright, this.bottomright, this.bottomleft]);
  ctx.fill();
  }

  grayTileCenter() {
  
  ctx.beginPath();
  ctx.fillStyle = nightmode ? "#676a6b" : "#7b8081"
  let sizeOfsett = Math.floor(this.size / 1.65)

  let offset = (tileSize - sizeOfsett) / 2
  ctx.roundRect(this.rx + offset , this.ry + offset ,sizeOfsett , sizeOfsett, [this.topleft, this.topright, this.bottomright, this.bottomleft]);
  ctx.fill();
  }
  
  debug(x,y) {

  ctx.fillStyle = "black";
  ctx.font = "12px arial";
  ctx.fillText(  /* yi + ':' + xi  's:' + this.state + 'c:' + ("x:" + x + " y:" + y ) */ this.rx, this.rx + 25, this.ry + 25) }
}

class visualPath {

  constructor(rx,ry,state,color,origin,cs) {
    this.rx = rx * tileSize; //rx = rendered X position, where the tile is shown.
    this.ry = ry * tileSize; //ry = rendered Y position
    this.color = color // ?? "#D9D9C3";
    this.state = state;
    this.size = 0;
    this.fullsize = tileSize / 4;
    this.x = rx;
    this.y = ry;
    this.origin = origin ?? 0; //marks which array this block is contained //1 = start color select 2 = end color select, 3 = path
    this.cs = cs ?? 0; // color selector
  }

  loadPath() {
  if (this.size != this.fullsize) { this.size = Math.min(this.size + animeScale / 6, this.fullsize) }
  if (this.size == this.fullsize) { this.state = 2; }
  }

  unloadPath() {
  if (this.size != this.fullsize / 10) { this.size = Math.max(this.size - animeScale / 6, 0) }
  if (this.size <= 0) { this.state = 0; }
  }

  show() {
  ctx.beginPath();
  ctx.fillStyle = tileColors[this.color]
  let offset = (tileSize - this.size) / 2
  let roundness = tileRoundness / 4
  ctx.roundRect(this.rx + offset , this.ry + offset , this.size, this.size, roundness);
  ctx.fill();
  }
}

class menu {

  constructor(x,y,width,height,frames,image,name,fps) {
    this.x = x - (width / 2)  ;
    this.y = y - (height / 2) ;
    this.width = width;
    this.height = height;
    this.image = image;
    this.frames = frames - 1; //amount of frames.
    this.frameIndex = 0;
    this.fps = fps;
    this.count = 0; //actual fps (usually 60)
    this.state = 0; //0 invisible, 1 play forward, 2 display last frame, 3. play backwards.
    this.name = name;
    }

  //play it once than pass it to show. (change state to 2)
  playForward() {

      this.count++;
      if (this.count == this.fps) {

      this.count = 0; 
      this.frameIndex++;

      if (this.frameIndex == this.frames) { this.state = 2; assingEventListener(this.name); } //animation ended, assign event listener to menu function.
      } 

      ctx.drawImage(this.image, this.frameIndex * this.width , 0 , this.width , this.height , this.x , this.y , this.width , this.height )
  }

  reset() {
    this.count = 0;
    this.frameIndex = 0;
    }

  //show last frame
  show() {
        this.reset()
        ctx.drawImage(this.image, this.frames * this.width , 0 , this.width , this.height , this.x , this.y , this.width, this.height)
  }

  //play it backwards and hide (set state to 0)
  playBackward(play) {

      this.count++
      if (this.count == this.fps) { 

      this.count = 0; 
      this.frameIndex++;
      } 

      ctx.drawImage(this.image, (this.frames - this.frameIndex) * this.width , 0 , this.width , this.height , this.x , this.y , this.width , this.height)
  
      if (this.frameIndex == this.frames) { play = 0; this.state = 0; this.reset(); }
    }
}

class menuText {

  constructor(text,x,y) {
  this.text = text;
  this.x = x;
  this.y = y;
  this.alpha = 0;
  }

  fadeIn() {
  if (this.alpha != 1) {this.alpha = Math.min(this.alpha + menuFadeRate, 1)}}

  fadeOut() {
  if (this.alpha != 0) {this.alpha = Math.max(this.alpha - menuFadeRate, 0)}}

  show(text) {
  ctx.fillStyle = "rgba(255,255,255," + this.alpha + ")";
  ctx.font = "16px inconsolata";
  ctx.fillText(  text || this.text , this.x , this.y);
  }
}

class slider {

  constructor(x,y,low,high,steps) {
  this.x = x;
  this.y = y;
  this.low = low;
  this.high = high;
  this.steps = steps;
  this.alpha = 0;
  this.range = 0;
  }

  fadeIn() {
  if (this.alpha != 1) {this.alpha = Math.min(this.alpha + menuFadeRate, 1)}}

  fadeOut() {
  if (this.alpha != 0) {this.alpha = Math.max(this.alpha - menuFadeRate, 0)}}

  show(value) {
 
  ctx.beginPath();
  ctx.roundRect(this.x, this.y, 120, 32, 16); //x,y, size x, size y, radius
  ctx.fillStyle =  nightmode ? "rgba(28,41,44," + this.alpha + ")" : "rgba(19,50,78," + this.alpha + ")";
  ctx.fill(); 

  ctx.fillStyle = nightmode ? "rgba(234,234,234," + this.alpha + ")" : "rgba(107,220,255," + this.alpha + ")";
  ctx.font = "18px inconsolata";
  ctx.fillText("«        »", this.x+60 ,this.y+20 )
  
  ctx.fillText(value, this.x+60 ,this.y+22 )
  }
}

function setCanvasSize() {

  xSize = Math.trunc (  window.innerWidth / tileSize ) // window.innerWidth > 1366 ? 27 :
  ySize = Math.trunc (  (window.innerHeight-25) / tileSize ) // (window.innerHeight-15) > 768 ? 15 :
  
  scoreCtx.canvas.width  = 400 // xSize * 50;
  scoreCtx.canvas.height = 25;
  
  ctx.canvas.width  = xSize * tileSize
  ctx.canvas.height = ySize * tileSize

  backCtx.canvas.width = window.innerWidth;
  backCtx.canvas.height = ySize * tileSize;

  ctx.textAlign = "center";

  scoreCtx.textAlign = "center";
  scoreCtx.font = "14px inconsolata";

 // ctx.imageSmoothingEnabled = false;
 // scoreCtx.imageSmoothingEnabled = false;

}

function setColorMode() { //really should call it night mode

if (!nightmode) {
  document.body.style.background = "black";
  tileColors = ["#243d42","#c98356","#6a4132","#402a21","#caba7d","#2a885f","#1e5b3f","#4eceb3","#439b99","#243d42","#e4514c","#b6383a","#5f3741","#343434","#f4f4dc","#808080"]   
  
  gameOverSprite.src = 'allClear-next-v4-night.png';
  settingsSprite.src = 'settings-next-v7-n.png';
  levelSprite.src = 'levels-n.png';
  
  nightmode = true; 
  window.parent.parentCallback();
  }

else {
  document.body.style.background = "#0e2c44";
  tileColors = ["#165786","#ffa154","#c17750","#774937","#fec658","#20bb63","#008747","#36c5d0","#0093b4","#165686","#ff5365","#cc3f50","#5a324b","#474747","#efebe8","#919191"]

  gameOverSprite.src = 'allClear-next-v4.png';
  settingsSprite.src = 'settings-next-v7.png';
    levelSprite.src = 'levels.png';
  
  nightmode = false; 
  window.parent.parentCallback();
  }
}

function setMenu() {

  function sliderArray(steps,high,low) { return Array.from( {length:steps}, (_, i) => low + ( Math.trunc((high - low) / steps)) * i ); }
   
  let midX = ctx.canvas.width / 2
  let midY = ctx.canvas.height / 2

  gameoverText = new menuText("Here we go!", midX , midY - 45 ) //text, x,y 
  highScoreText = new menuText("zero", midX , midY - 10 ) // text here is more of a palceholder.
  levelText = new menuText("01 02 03 04 05 06 07 08", midX , midY )

  //tile size slider
  tileSizeSlider = new slider(midX,midY-179,midX-55,midX+30,9) // x , y , start poin , end point , steps,
  tileSizeSlider.range = sliderArray(tileSizeSlider.steps,tileSizeSlider.high,tileSizeSlider.low); 
  tileSizeSlider.x = tileSizeSlider.range[ getIndex(tileSizeSteps, tileSize)] // need to find index of current tile size and match it to slider position cause mid game can call setmenu

  //roundness slider
  roundnessSlider = new slider(midX,midY-128,midX-55,midX+30,11)
  roundnessSlider.range = sliderArray(roundnessSlider.steps,roundnessSlider.high,roundnessSlider.low); 
  roundnessSlider.x =  roundnessSlider.range[ getIndex( roundnessSteps, tileRoundness) ] //starting position of the slider, in the range arrayí

  //color slider
  colorSlider = new slider(midX,midY+180,midX-80,midX+40,11) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  colorSlider.range = sliderArray(colorSlider.steps,colorSlider.high,colorSlider.low);
  colorSlider.x = colorSlider.range[makeGrid.colors-2] //-2 cause colors start at two, and array starts at 0.

  //difficulty slider also known as single tile remove behavior
  difficultySlider = new slider(midX,midY-75,midX-45,midX+35,5) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  difficultySlider.range = sliderArray(difficultySlider.steps,difficultySlider.high,difficultySlider.low);
  difficultySlider.x = difficultySlider.range[difficulty.setting-1]

  //path slider
  pathSlider = new slider(midX,midY-22,midX-45,midX+40,3) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  pathSlider.range = sliderArray(pathSlider.steps,pathSlider.high,pathSlider.low);
  pathSlider.x = pathSlider.range[checkSettings.paths]

  //fixed tiles, white tiles, floating tiles, really should use one name for that
  fixedTilesSlider = new slider(midX,midY+231,midX-12,midX+40,3) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  fixedTilesSlider.range = sliderArray(fixedTilesSlider.steps,fixedTilesSlider.high,fixedTilesSlider.low);
  fixedTilesSlider.x = fixedTilesSlider.range[ checkSettings.fixedTiles ]

  //gray tiles? CONSISTENT NAMING DAMN IT
  permanentTilesSlider = new slider(midX,midY+282,midX-30,midX+45,3) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  permanentTilesSlider.range = sliderArray(permanentTilesSlider.steps,permanentTilesSlider.high,permanentTilesSlider.low);
  permanentTilesSlider.x = permanentTilesSlider.range[ checkSettings.permanentTiles ]

  gameoverBox = new menu( midX , midY , 350,170,15,gameOverSprite,"gameOver",menufps); //x, y, frame width, frame height, number of frames, name of the frame sprite, fps = every n.th frame it should update
  settingsBox = new menu( midX , midY , 300,650,15,settingsSprite,"settings",menufps);

  setMenu.level.state = 0;
}

function setTileRadius() { roundnessSteps = Array.from({ length: 11 }, (_,i) => (tileSize / 2) / 10 * i); }

function makeGrid(res) {

    nextGrid.length = 0;
    undoGrid.length = 0;
    pathGrid.length = 0;

  if (!res) { makeGrid.colorLookup = makePalette(); } 
  makeGrid.loadAnimType = Math.floor(Math.random() * 3 )

 for (let x = 0; x < xSize; x++) {
    nextGrid[x] = [];
    undoGrid[x] = [];
    pathGrid[x] = []; // only do tis if white tiles are active
    for (let y = 0; y < ySize; y++) {
     nextGrid[x][y] = new tile(x,y,x,y,makeGrid.colorLookup[Math.floor(Math.random() * makeGrid.colors)],4) // rx,ry,nx,ny,color,state
     pathGrid[x][y] = { row: x, col: y, walkable: true, gCost: Infinity, hCost: Infinity, fCost: Infinity, parent: null }

     if ( checkSettings.fixedTiles && Math.random() < 0.15 ) {  nextGrid[x][y].color = 14; }
     if ( checkSettings.permanentTiles && Math.random() < 0.15 ) { nextGrid[x][y].color = 15; }
     }
   }
 mergeTiles();
}

function makePalette() { 

 //each set contains 3 colors in different shades, to generate nice looking palettes, first pick a color from a set
 //than one (or none) of its shades. Each color should be a primary color, or primary + shade, but never just a shade.

 // 2 colors -> 1 primary + 1 shade
 // 3 colors -> 1 primary + 2 shade
 // 4 colors -> 2 primary + 2 shade 
 // 5 colors -> 2 primary + 3 shade
 // 6 colors -> 3 primary + 3 shade
 // 7 colors -> 3 primary + 4 shade
 // 8 colors -> 4 primary + 4 shade
 // 9 colors -> 4 primary + 5 shade
 //10 colors -> 5 primary + 5 shade
 //11 colors -> 5 primary + 6 shade

  let colorset = [];
  let setID = shuffle([0,1,2,3])
  let sets =[[1,2,3],[4,5,6],[7,8,9],[10,11,12]] // orange = [1,2,3], green = [4,5,6], blue = [7,8,9], pink = [10,11,12];

  for (let j = 0; j < 4 ; j++) { colorset = colorset.concat( sets[ setID[j] ] ) }
/*
  while (sets[0].length + sets[1].length + sets[2].length + sets[3].length > makeGrid.colors) {
  sets[ Math.floor(Math.random() * 4) ].pop();
  }
    for (let j = 0; j < sets.length ; j++) { colorset = colorset.concat(sets[j]) }
*/
return colorset;
}

function mergeClusters() { //re assign colors based on clusters, recudes clusters since some will have the same color
  let clusterLookup = Array.from({length: nextMatrix.validClusterCount+1}, () => makeGrid.colorLookup[Math.floor(Math.random() * makeGrid.colors)]); //

    for (let x = 0; x < xSize; x++) {
     for (let y = 0; y < ySize; y++) {

      nextGrid[x][y].color = clusterLookup[nextGrid[x][y].cluster];
     //nextGrid[x][y].state = 3;
    }
  }
}

function mergeTiles() { //merge single clusters consist of single tile

  let tileColor; 
  let mergeTable = [0,0,1,0.75,0.45,0.4,0.39,0.37,0.36,0.34,0.34,0.34,0.34] //need to scale this with tile size

  function sameColor(c,s) { return c.some((arrVal) => s == arrVal); }
  
    for (let x = 0; x < xSize; x++) {
     for (let y = 0; y < ySize; y++) {

      if (Math.random() > mergeTable[makeGrid.colors]) { // 0.4
      tileColor = [];
    
         if (y) { tileColor.push(nextGrid[x][y-1].color); } //up 
         if (x) { tileColor.push(nextGrid[x-1][y].color); } //left 
         if (x < xSize-1) { tileColor.push(nextGrid[x+1][y].color) } //right
         if (y < ySize-1) { tileColor.push(nextGrid[x][y+1].color) } //down
            if (sameColor(tileColor, nextGrid[x][y].color) == false) { 
                nextGrid[x][y].color = tileColor[Math.floor(Math.random() * tileColor.length) ]
          }}
         }     
      }
//nextMatrix();
//roundCorners();
}

//an ...interesting solution to a flood fill.
function nextMatrix() {

  resetTileCount();
    function goBack(leftCluster,upCluster,cx) {

     for (let x = 0; x <= cx; x++) {
      for (let y = 0; y < ySize; y++) {

        if (nextGrid[x][y].cluster == leftCluster ) {
        nextGrid[x][y].cluster = upCluster;
    }}}}

  let cluster = 0;

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

     nextGrid[x][y].cluster = 0;

     if( nextGrid[x][y].state ) {

         let thisTile = nextGrid[x][y]
  
        let up = {}
        let left = {}
  
        if (y && nextGrid[x][y-1].state) { up = nextGrid[x][y-1] } //up 
        if (x && nextGrid[x-1][y].state) { left = nextGrid[x-1][y] } //left 
  
             if ( thisTile.color == up.color && thisTile.color == left.color) { thisTile.cluster = up.cluster; goBack(left.cluster,up.cluster,x); }
        else if ( thisTile.color == left.color ) { thisTile.cluster = left.cluster;  }
        else if ( thisTile.color == up.color ) { thisTile.cluster = up.cluster; }  
        
        else if ( thisTile.color < 13 ) { thisTile.cluster = ++cluster; nextMatrix.validClusterCount++ }
        else { thisTile.cluster = ++cluster }

   //    else { thisTile.cluster = ++cluster if (thisTile.color < 12) { validTileClusterCount++ } } 
        
        // this only counts tiles
             if (thisTile.color == 14) { makeGrid.whiteTiles++; }
        else if (thisTile.color == 15) { makeGrid.grayTiles++; }
        else  { makeGrid.colorTiles++; }
        }
        else {  nextGrid[x][y].rx = nextGrid[x][y].nx = x * tileSize  // resets state 0 tile pos, has nothing to do with actual matrix
                nextGrid[x][y].ry = nextGrid[x][y].ny = y * tileSize }
    } 
  }
//  console.log("color tiles:",makeGrid.colorTiles," white tiles:",makeGrid.whiteTiles, " black tiles:",makeGrid.grayTiles, "valid tile Cluster count:", nextMatrix.validClusterCount )
//  if ( makeGrid.colorTiles - nextMatrix.validClusterCount == 0 )
//  console.log( "game over?" )
}

function roundCorners() {

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
     
     // tileRoundness = Math.round(Math.random() * 25) funky

     let thisTile = nextGrid[x][y]
     if( thisTile.state ) {  

      let topcorner;
      let bottomcorner;
      let rightcorner;
      let leftcorner;
      
     if (x) { leftcorner = nextGrid[x-1][y].color }
     if (y) { topcorner = nextGrid[x][y-1].color; }
 
     if (x < xSize-1 ) { rightcorner = nextGrid[x+1][y].color; }
     if (y < ySize-1 ) { bottomcorner = nextGrid[x][y+1].color; }

          //[top left, top right, bottom left, bottom right]

          if (topcorner == thisTile.color || leftcorner == thisTile.color) { thisTile.topleft = 0 } else { thisTile.topleft = tileRoundness }  //top left corner
          if (topcorner == thisTile.color || rightcorner == thisTile.color) { thisTile.topright = 0 } else { thisTile.topright = tileRoundness }  //top right corner
          if (bottomcorner == thisTile.color || leftcorner == thisTile.color) { thisTile.bottomleft = 0 } else { thisTile.bottomleft = tileRoundness }
          if (bottomcorner == thisTile.color || rightcorner == thisTile.color) { thisTile.bottomright = 0 } else { thisTile.bottomright = tileRoundness }
      }
    //else { thisTile.topleft = tileRoundness; thisTile.topright = tileRoundness; thisTile.bottomleft = tileRoundness;  thisTile.bottomright = tileRoundness; } //set removed tiles to round, looks better, also no longer set here
    }
  }
}


var busy = true;

function renderTiles() {
  if (!busy) { requestAnimationFrame(renderTiles); return; }
  busy = false;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
  
      let thisTile = nextGrid[x][y];
      if (thisTile.despawn.state) { thisTile.despawnTile(); busy = true; }
      if (thisTile.reload) { thisTile.reoladTiles(); busy = true; }

      switch (thisTile.state) {
      case 5: thisTile.unLoadTiles();thisTile.show(); busy = true; break; //disappearing after reset
      case 4: thisTile.loadTiles();thisTile.show(); busy = true; break; //anim at game start
      case 3: thisTile.show(); break; //idle
      case 2: thisTile.moveTile();thisTile.show(); busy = true; break; //moving
  //  case 1: thisTile.scaleTile();thisTile.show(x,y); break; //disappearing after being clicked on
      }
  //    thisTile.debug(x,y);
      if (thisTile.color == 14) { thisTile.whiteTileCenter() }
      if (thisTile.color == 15) { thisTile.grayTileCenter() }
      if (thisTile.pathTile) { thisTile.pathTileCenter() }
      //console.log(thisTile.state)
      }}

      for (let i = 0; i < combinedVpath.length; i++) {
        
        switch (combinedVpath[i].state) {
        case 1: combinedVpath[i].loadPath(); combinedVpath[i].show(); busy = true; break;
        case 2: combinedVpath[i].show(); break;
        case 3: combinedVpath[i].unloadPath(); combinedVpath[i].show(); busy = true; break;
        }}

        switch (gameoverBox.state) {
        case 1: gameoverBox.playForward(); 
                gameoverText.fadeIn(); 
                gameoverText.show();
                busy = true
                break;
        
        case 2: gameoverBox.show(); 
                gameoverText.show(); 
                highScoreText.fadeIn(); 
                highScoreText.show("score:" + writeScore.score );
                busy = true
                break;
        
        case 3: gameoverBox.playBackward(); 
                gameoverText.fadeOut(); 
                highScoreText.fadeOut(); 
                gameoverText.show();
                busy = true
                break;       
        }

        switch (settingsBox.state) { //everything shown on settings screen is here
          case 1: settingsBox.playForward();
                  colorSlider.fadeIn(); colorSlider.show(makeGrid.colors);
                  difficultySlider.fadeIn(); difficultySlider.show( difficulty.setting );
                  roundnessSlider.fadeIn(); roundnessSlider.show(tileRoundness);
                  tileSizeSlider.fadeIn(); tileSizeSlider.show(newtileSize);
                  pathSlider.fadeIn(); pathSlider.show( checkSettings.percent[checkSettings.paths] );
                  permanentTilesSlider.fadeIn(); permanentTilesSlider.show( checkSettings.percent[ checkSettings.permanentTiles ] );
                  fixedTilesSlider.fadeIn(); fixedTilesSlider.show( checkSettings.percent[ checkSettings.fixedTiles ] );
                  busy = true
                  break;

          case 2: settingsBox.show(); //stays on
                  colorSlider.show(makeGrid.colors);
                  difficultySlider.show( difficulty.setting );
                  roundnessSlider.show(tileRoundness);
                  tileSizeSlider.show(newtileSize);
                  pathSlider.show( checkSettings.percent[checkSettings.paths] );
                  permanentTilesSlider.show( checkSettings.percent[  checkSettings.permanentTiles ] );
                  fixedTilesSlider.show( checkSettings.percent[ checkSettings.fixedTiles ] );
                  if (setMenu.level.state) { ctx.drawImage(levelSprite, setMenu.level.sx, setMenu.level.sy, 37, 32, setMenu.level.x, setMenu.level.y, 37, 32 )}                  
                  busy = true
                  break;

          case 3: settingsBox.playBackward(); //fades out
                  colorSlider.fadeOut(); colorSlider.show(makeGrid.colors);                
                  difficultySlider.fadeOut(); difficultySlider.show( difficulty.setting );
                  roundnessSlider.fadeOut(); roundnessSlider.show(tileRoundness);
                  tileSizeSlider.fadeOut(); tileSizeSlider.show(newtileSize);
                  pathSlider.fadeOut(); pathSlider.show( checkSettings.percent[checkSettings.paths] );
                  permanentTilesSlider.fadeOut(); permanentTilesSlider.show( checkSettings.percent[ checkSettings.permanentTiles ] );
                  fixedTilesSlider.fadeOut(); fixedTilesSlider.show( checkSettings.percent[ checkSettings.fixedTiles ] );
                  busy = true
                  break;
          }
               
    // clickBoxHelper();
    
    bgFill();
    writeScore();
    clickConfirm();

requestAnimationFrame(renderTiles);
}


function highScore(x) {

  let score = Math.pow((x-1),2) * makeGrid.colors
  //let score = Math.pow((x-1),(makeGrid.colors / 4)) * makeGrid.colors
  highScore.totalScore += x // score;
}

function tilePercent() { 
  if ( makeGrid.colorTiles > writeScore.totalTiles) { writeScore.totalTiles = makeGrid.colorTiles }
  return Math.round(makeGrid.colorTiles / writeScore.totalTiles * 100)
}


function writeScore() {
  
    if (highScore.totalScore - writeScore.score > 1000) {writeScore.score += 1000 }
      else if (highScore.totalScore - writeScore.score > 100) {writeScore.score += 100 }
      else if (highScore.totalScore - writeScore.score > 10) {writeScore.score += 10 }
      else if ( writeScore.score < highScore.totalScore ) { writeScore.score++ }

      scoreCtx.clearRect(0, 0, 350, 25);
      //scoreCtx.drawImage(scoreBack,0,5)

     if (difficulty.setting == 2 || difficulty.setting == 4) {
          
            scoreCtx.beginPath();  
            scoreCtx.fillStyle = tileColors[difficulty.removal.color];
            scoreCtx.roundRect(200,5,100,15,10); //x,y, size x, size y, roundness
            scoreCtx.fill();
    }

    scoreCtx.beginPath()
    scoreCtx.fillStyle = tileColors[ makeGrid.colorLookup[2] ]; // score box
    scoreCtx.roundRect(0,5,100,15,10); //score
    //scoreCtx.roundRect(300,5,50,15,10); // undo 
    scoreCtx.roundRect(350,5,50,15,10); // menu 
    scoreCtx.fill(); 

    scoreCtx.fillStyle = tileColors[ makeGrid.colorLookup[0] ] // score, tile count, undo color
    scoreCtx.font = "14px inconsolata";
    scoreCtx.fillText("score:" + writeScore.score,50,17);
    scoreCtx.fillText("tiles:" + tilePercent() + "%" ,150,17);
    
    scoreCtx.fillText("undo",325,17);
    scoreCtx.fillText("menu",375,17);
    
    scoreCtx.fillStyle = difficulty.setting == 2 || difficulty.setting == 4 ? (nightmode ? "black" : "#0e2c44") : tileColors[7] ; //removes text color
    scoreCtx.fillText(difficulty.removal.value,250,17); //text,x,y
}
     
function assingEventListener(call) {

      if (settingsBox.state == 2 && call === "game") { return } 
  
      canvas.addEventListener('contextmenu', rightClick);
      //canvas.addEventListener('mousemove', Highlight); //temporary color change function

      scoreCanvas.addEventListener('click', scoreClick); 
  
      canvas.removeEventListener('click', settingsClick)
      canvas.removeEventListener('click', gameOverClick)
      canvas.removeEventListener('click', gameClick)
  
      switch (call) { //tiles done loading, play ball!
      case "game":
      canvas.addEventListener('click', gameClick)
      break;
      case "gameOver": //game is over
      canvas.addEventListener('click', gameOverClick)
      break;
      case "settings": //settings is open
      canvas.addEventListener('click', settingsClick)
      canvas.addEventListener('pointerdown', SliderSettings)
      }
}
/*
var nxl,nyl

function Highlight(e) { //Highlight the current tile 

  nxl = Math.trunc((e.clientX - canvas.offsetLeft + window.pageXOffset) / tileSize)
  nyl = Math.trunc((e.clientY - canvas.offsetTop + window.pageYOffset) / tileSize)
}
*/

function despawnUnmovable() { //despawns white tiles when no valid tiles touching them

    let remove = [];
    var pass = [];
    var fail = [];

     for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      if (nextGrid[x][y].color == 14) {

        let cluster = nextGrid[x][y].cluster;
        
      if (x && 0 < nextGrid[x-1][y].color && nextGrid[x-1][y].color < 14) {  fail.push(cluster); continue }
      if (y && 0 < nextGrid[x][y-1].color && nextGrid[x][y-1].color < 14) {  fail.push(cluster); continue }
      if (x < xSize-1 && 0 < nextGrid[x+1][y].color && nextGrid[x+1][y].color < 14) { fail.push(cluster); continue }
      if (y < ySize-1 && 0 < nextGrid[x][y+1].color && nextGrid[x][y+1].color < 14) { fail.push(cluster); continue }
      
      pass.push( {c:cluster, x:x, y:y} );
    }}
  }

 remove = pass.filter(tile => !fail.some(cluster => cluster == tile.c));
//let remove = pass.filter( tile => !fail.includes(tile))

  if (remove.length) {  
 
      for (let i = 0; i < remove.length; i++) {

          nextGrid[remove[i].x][remove[i].y].despawn = structuredClone( nextGrid[remove[i].x][remove[i].y] )
          nextGrid[remove[i].x][remove[i].y].despawn.state = 2;

          nextGrid[remove[i].x][remove[i].y].state = 0;
          nextGrid[remove[i].x][remove[i].y].cluster = 0;
          nextGrid[remove[i].x][remove[i].y].color = 0;
      }
  }
}

function gameClick(e) {

  let x = Math.trunc((e.clientX - canvas.offsetLeft + window.pageXOffset) / tileSize) 
  let y = Math.trunc((e.clientY - canvas.offsetTop + window.pageYOffset) / tileSize)
  
  if ( checkSettings.paths && !nextGrid[x][y].state) { pathLogicSelect(x,y,false); return } //empty tile 
  if ( nextGrid[x][y].state && combinedVpath.some(e => e.x == x && e.y == y && e.state )) { pathLogicSelect(x,y,true); return; } // path color selector
  if ( nextGrid[x][y].state && nextGrid[x][y].color < 13) { nextClick(x,y); return; } //colored tiles clicked
  if ( nextGrid[x][y].color == 14 && (checkSettings(x,y) || checkSettings.fixedTiles == 2)) { convertTiles(x,y); return; } //while tiles clicked
  if ( nextGrid[x][y].color == 15 && (checkSettings(x,y) || checkSettings.permanentTiles == 2)) { convertTiles(x,y); return; } //gray tiles clicked
//  if ( vPath.length && vPath.some(e => e.x == x && e.y == y) ) { convertVpath(); return; } //this is actually called from path select logic
}

nextClick.left = 1
nextClick.right = 1

function nextClick(u,v) {

  var thisTile = nextGrid[u][v];
  var thisColor = thisTile.color;
  var thisCluster = thisTile.cluster;
  var score = 0;

        switch ( difficulty.setting ) {
    case 1:   
    case 3: if (difficulty.removal.value) { break; };
    case 2:
    case 4: if (difficulty.removal.value && difficulty.removal.color == thisTile.color ) { break; }
    case 5: if ( v && nextGrid[u][v-1].cluster == thisTile.cluster || 
                 u && nextGrid[u-1][v].cluster == thisTile.cluster || 
                 v < ySize-1 && nextGrid[u][v+1].cluster == thisTile.cluster || 
                 u < xSize-1 && nextGrid[u+1][v].cluster == thisTile.cluster ) { break; }
    case 6: return;
    }
    
    //check if click is valid by difficulty settings

    //undo values
    updateUndoValues(thisCluster);

   //vertical moving

   for (let x = 0; x < xSize; x++) {
    for (let y = 0, valid = 0; y < ySize; y++) {

      undoGrid[x][y] = structuredClone(nextGrid[x][y]); //store previous grid for undo.      
    
      if (nextGrid[x][y].state && nextGrid[x][y].cluster != thisCluster ) { valid++ }
      if (!nextGrid[x][y].state || nextGrid[x][y].color == 14) { valid = 0; } // inmovable tiles, set condition to something, state 6, color 20 etc

      if (nextGrid[x][y].cluster == thisCluster) {

          nextGrid[x][y].despawn = structuredClone(nextGrid[x][y])
          nextGrid[x][y].despawn.state = 2;
          if ( !nextGrid[x][y].pathTile ) { score++ }

          let to = y-valid
          let from = y;

            while (from > to) {
            
            //console.log("from:" + from + " valid:" + valid + " to:" + to)

            nextGrid[x][from].color = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].color;
            nextGrid[x][from].ry = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].ry //(from-1) * tileSize // needs to be amount traveled
            nextGrid[x][from].state = 2;
            nextGrid[x][from].size = tileSize;
            from--
            }
        
         nextGrid[x][y-valid].state = 0;
       //nextGrid[x][y-valid].cluster = 0;
         nextGrid[x][y-valid].color = 0;
         }
        }
       }

  //despawnUnmovable();

  if (difficulty.verticalMove) { findEmptyColl(); }

  function findEmptyColl() { //find the and empty column, used when no white tiles are present.
    
    let gap;
    let half = Math.floor(xSize / 2);

    for (let x = nextClick.left; x < xSize - nextClick.right; x++) {

         if (nextGrid[x].every( el => el.state == 0) ) { gap = x; break; }
        }
    
      if ( gap <= half ) { nextClick.left += 1; moveLeftSide(gap); }
      else if ( gap > half ) { nextClick.right += 1; moveRightSide(gap); }
  }


  function moveLeftSide(leftSide) { 

      for (let y = 0; y < ySize; y++) {
        for (let x = leftSide; x >= 0; x--) {

        if (x > 0) {
            //structuredClone still doesn't work with custom class
            nextGrid[x][y].color = nextGrid[ x-1 ][y].color
            nextGrid[x][y].state = nextGrid[ x-1 ][y].state == 0 ? 0 : 2;
            nextGrid[x][y].ry = nextGrid[ x-1 ][y].ry
            nextGrid[x][y].rx = nextGrid[ x-1 ][y].rx
         // nextGrid[x][y].size = nextGrid[ x-1 ][y].size //first version despawn white tiles needed this only

            }
         else {
         nextGrid[x][y].state = 0;
         nextGrid[x][y].color = 0;
         }
      }
    }
  findEmptyColl(); // test if there are more empty rows
  }

  function moveRightSide(rightSide) { //this also could be one function, but does it even matter at this point...

        for (let y = 0; y < ySize; y++) {
        for (let x = rightSide; x < xSize ; x++) {
    
            if (x+1 < xSize) {
                nextGrid[x][y].color = nextGrid[ x+1 ][y].color
                nextGrid[x][y].state = nextGrid[ x+1 ][y].state == 0 ? 0 : 2;
                nextGrid[x][y].ry = nextGrid[ x+1 ][y].ry
                nextGrid[x][y].rx = nextGrid[ x+1 ][y].rx
            //  nextGrid[x][y].size = nextGrid[ x+1 ][y].size
                }
             else {    
             nextGrid[x][y].state = 0;
             nextGrid[x][y].color = 0;
             }
          }
        }
  findEmptyColl();
  }

  //despawnUnmovable(); // setTimeout(despawnUnmovable, 1600)
    difficulty(score,thisColor); //calcualte removes
    if (convertVpath.checkFloatingTiles) { convertVpath.checkFloatingTiles = false; dropTiles(); }
    validatePath(); //if there is a path, check if its still valid
    nextMatrix();
    gameOver();
    roundCorners();
    if (score > 1) { highScore(score) } //calculate score

    bgFill.position = Math.min( bgFill.position + score * bgFill.offset, ctx.canvas.height)
    busy = true;
}


//const raiseTimer = setInterval(raiseTiles, 4000);
//clearInterval(raiseTimer); 

function raiseTiles() { //raises the last row for an endless mode.

     for (let x = 0; x < xSize; x++) {
      for (let y = 0; y < ySize; y++) {

      if (y < ySize-1) {
       nextGrid[x][y].color = nextGrid[x][ y+1 ].color
       nextGrid[x][y].state = nextGrid[x][ y+1 ].state == 0 ? 0 : 2;
       nextGrid[x][y].ry = nextGrid[x][ y+1 ].ry
       nextGrid[x][y].rx = nextGrid[x][ y+1 ].rx
       }
       else {
          nextGrid[x][y] = new tile(x,y,x,y,makeGrid.colorLookup[Math.floor(Math.random() * makeGrid.colors)],4) // rx,ry,nx,ny,color,state
          nextGrid[x][y].size = tileSize * 0.7
     if ( difficulty.fixedTiles  && Math.random() < 0.15 ) {  nextGrid[x][y].color = 14; }
     if ( difficulty.permanentTiles && Math.random() < 0.15 ) { nextGrid[x][y].color = 13; }
       }   
    }}

    nextMatrix();
    roundCorners();
    busy = true;
 }

function blockMatrix() { //a block consist of touching valid tiles.

    function goBack(leftBlock,upBlock,cx) {

     for (let x = 0; x <= cx; x++) {
      for (let y = 0; y < ySize; y++) {

        if (nextGrid[x][y].block == leftBlock ) {
        nextGrid[x][y].block = upBlock;
    }}}}

  let block = 0;

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

     nextGrid[x][y].block = 0;

     if( nextGrid[x][y].state == 0) {
  
        let up = 0;
        let left = 0;

         if (y && nextGrid[x][y-1].block) { nextGrid[x][y].block = up = nextGrid[x][y-1].block } //up 
         if (x && nextGrid[x-1][y].block) { nextGrid[x][y].block = left = nextGrid[x-1][y].block } //left 
         if (up && left && up != left ) { nextGrid[x][y].block = up; goBack(left,up,x); }
         if (!up && !left) { nextGrid[x][y].block = ++block; }
        }
      } 
    }
}

function findBlock() { //find a block that spans from top to bottom. currently incomplete

     let blockTop = [];
     let blockBottom = [];
     let block;

      for (let x = nextClick.left; x < xSize - nextClick.right; x++) {
      
      if (nextGrid[x][0].block && !blockCount.some((e) => e == nextGrid[x][0].block )) { blockTop.push( nextGrid[x][0].block ) }
      if (nextGrid[x][ySize-1].block && !blockCount.some((e) => e == nextGrid[x][ySize-1].block )) { blockBottom.push( nextGrid[x][0].block ) }
      }      
}

convertTiles.loadTiles = 0;
function convertTiles(u,v) { //converts a cluster to different colored tiles (used to recolor white tiles)

  function someRandomColor() { return makeGrid.colorLookup[ Math.floor(Math.random() * makeGrid.colors)] }
  let thisTile = nextGrid[u][v];
  let thisCluster = thisTile.cluster;
  let color = someRandomColor();
  let counter;
  convertTiles.loadTiles = 0;

  updateUndoValues(thisCluster);

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      undoGrid[x][y] = structuredClone(nextGrid[x][y]); //store previous grid for undo.
      if (nextGrid[x][y].cluster == thisCluster) {

          if ( Math.random() > 0.5 ) { color = someRandomColor(); }
          
          convertTiles.loadTiles++
          nextGrid[x][y] = new tile(x,y,x,y,color,3) //state,
          nextGrid[x][y].size = tileSize * 0.6
          nextGrid[x][y].reload = true;
          nextGrid[x][y].cluster = undefined; //this stops a despawn anim bug that flashes every cluster 0 tiles.
        }
   }}
  busy = true;
  roundCorners();
  validatePath();
//nextmatrix is called from drop tiles, which is called when tiles are done converting.
//its possible to click the tile before nextmatrix done runing, so it acts as a cluster zero tile, which makes a weird flashing animation

}

function removeWhiteTiles(u,v) {

  var thisTile = nextGrid[u][v];
  var thisCluster = thisTile.cluster;

   for (let x = 0; x < xSize; x++) {
    for (let y = 0, valid = 0; y < ySize; y++) {
    
      if (nextGrid[x][y].state && nextGrid[x][y].cluster != thisCluster ) { valid++ }
      if (nextGrid[x][y].color == 14 && nextGrid[x][y].cluster != thisCluster ) { valid = 0; } // inmovable tiles, set condition to something, state 6, color 20 etc

      if (nextGrid[x][y].cluster == thisCluster || nextGrid[x][y].state == 0) {

          let to = y-valid
          let from = y;

            while (from > to) {
            
            nextGrid[x][from].color = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].color;
            nextGrid[x][from].ry = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].ry
            nextGrid[x][from].state = 2;
            from--
            }
        
         nextGrid[x][y-valid].state = 0;
         nextGrid[x][y-valid].color = 0;
         }
        }
       }
  nextMatrix();
  roundCorners();
  busy = true;
}

function dropTiles() { //drops folating tiles

   for (let x = 0; x < xSize; x++) {
    for (let y = 0, valid = 0; y < ySize; y++) {
    
      nextGrid[x][y].pathTile = false;

      if (nextGrid[x][y].state) { valid++ }
      if (nextGrid[x][y].color == 14) { valid = 0; } // inmovable tiles, set condition to something, state 6, color 20 etc

      if (nextGrid[x][y].state == 0) {

          let to = y-valid
          let from = y;

            while (from > to) {
            
            nextGrid[x][from].color = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].color;
            nextGrid[x][from].ry = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].ry;
            nextGrid[x][from].state = 2;
            nextGrid[x][from].size = tileSize; //if converted tiles didn't have a time to "load" they can fall while arent full size, this prevents it.
            from--
            }
        
         nextGrid[x][y-valid].state = 0;
         nextGrid[x][y-valid].color = 0;
         }
        }
       }
  nextMatrix();
  roundCorners()
  busy = true;
}

/*
state 1: no start and no end selected yet -> selector opens at start position;
state 2: start cliked again (same pos) -> selector closes at start position, reset start;

state 3: start selected, no end selected yet -> selector opens at end position;
state 4: start selected, end clicked again -> selector closes at end position, reset end;

state 4: start selected, end selected -> close both selector, look for path.

path found -> display path,
path not found -> show start and end.
path being clicked -> remove tiles at both end, clear end and start
path not being clicked -> clear end and start

end locked -> reselect start
start locked -> reselect end

click empty tile -> start / end logic -> color select logic -> color check logic -> path logic 
                       set start           set start color          nothing          nothing
                        set end             set end color      check if there is a common color        
                                          lock first color
                                           lock end color

store the tiles, that picked up by startcolor select, and endcolor select, and check if they are still the same tiles.

*/

  var pStart = [];
  var pEnd = [];

  var startColorSelect = [];
  var endColorSelect = [];
  var vPath = []; //storing path's visual
  var combinedVpath = [];
  var commonColor = [];

function pathLogicSelect(x,y,colorSelectorClick) {

 let valid = false; //check if any tile around the clicked tile have a color
 commonColor.length = 0;

  if ((difficulty.removal.value || checkSettings.paths == 2) && vPath.length && vPath.some(e => e.x == x && e.y == y && e.state && e.color != 13)) { //path clicked // && vPath.every(f => f.color < 13)
      convertVpath(); console.log("path clicked");
      return;} 

   if (colorSelectorClick) { // color select clicked, neither start, or end was locked.
      lockColor();
      colorCheck();
      recolorPath();
      mergePath();
      return;}

  if ( y && nextGrid[x][y-1].color || x && nextGrid[x-1][y].color || y < ySize-1 && nextGrid[x][y+1].color || x < xSize-1 && nextGrid[x+1][y].color ) { valid = true }
  
  if (pStart.length && pStart[0] == x && pStart[1] == y) { //start clicked again, convert end if color select allows it.
      
      colorSelect(startColorSelect,1);
      pStart.lock = false;
      pEnd.lock = false;
      selectorDoubleClick(startColorSelect);
      mergePath();
      console.log("start clicked again");
      return;}

    if (pEnd.length && pEnd[0] == x && pEnd[1] == y) { //end clicked again, convert end if color select allows it.
      
      colorSelect(endColorSelect,1);
      pStart.lock = false;
      pEnd.lock = false;
      selectorDoubleClick(endColorSelect);
      mergePath();
      console.log("end clicked again");
      //check if start or end color selcet, have same color twice,
      return;}

  if (valid && pStart.lock) { //start is locked, set end again.
      
      pEnd = [x,y]
      colorSelect(endColorSelect,2);
      commonColor = endColorSelect.filter(endColor => (endColor.cs == startColorSelect[0].cs));
      if (commonColor.length) { endColorSelect[0].color = startColorSelect[0].color }
      calcualtePath();
      mergePath();
      console.log("start is locked, set end again"); 
      return;}

  if (valid && pEnd.lock) { //end is locked, set start again
      
      pStart = [x,y];
      colorSelect(startColorSelect,1);
      commonColor = startColorSelect.filter(startColor => (startColor.cs == endColorSelect[0].cs));
      if (commonColor.length) { startColorSelect[0].color = endColorSelect[0].color }
      calcualtePath();
      mergePath();
      console.log("end is locked, set start again");
      return;}

  if (valid && !pStart.length) { //no start, set start
      
      pStart = [x,y];
      colorSelect(startColorSelect,1);
      mergePath();
      console.log("set start");
      return;}

  if (valid && !pEnd.length ) {  //no end, set end.

      pEnd = [x,y]
      colorSelect(endColorSelect,2);
      colorCheck();
      calcualtePath();
      if ( vPath.length ) { disableColorsSelector(); }
      mergePath();
      console.log("set end");
      return;}
  
  if (!valid || pEnd.length || pStart.length) { //some other state 0 tile been clicked, remove path.
      
      resetVpath();
      busy = true;
      console.log("some other state 0 tile been clicked");
      return;}

    function colorSelect(target,origin) { //display color selector, collects the colors nearby valid tiles

     target[0] = new visualPath(x,y,1,13,origin); //x,y, state, color, original array, color select value
     target.length = 1;

     if (x && nextGrid[x-1][y].color && nextGrid[x-1][y].color != 13 )  { target.push( new visualPath(x-1,y,1, 14,origin, nextGrid[x-1][y].color ));} //left
     if (y && nextGrid[x][y-1].color && nextGrid[x][y-1].color != 13 )  { target.push( new visualPath(x,y-1,1, 14,origin, nextGrid[x][y-1].color ));} //bottom
 
     if (x < xSize-1 && nextGrid[x+1][y].color && nextGrid[x+1][y].color != 13 ) { target.push( new visualPath(x+1,y,1, 14,origin, nextGrid[x+1][y].color ));} //right
     if (y < ySize-1 && nextGrid[x][y+1].color && nextGrid[x][y+1].color != 13 ) { target.push( new visualPath(x,y+1,1, 14,origin, nextGrid[x][y+1].color ));} //top
     }
    
  function mergePath() { //merges path, and color selectors before displaying them
      
      combinedVpath.length = 0;
      combinedVpath = vPath.concat(startColorSelect,endColorSelect)
      busy = true;
  }

  function colorCheck() { //check if there is a common color between all possible valid tiles at start and end.
    commonColor = startColorSelect.filter(startColor => endColorSelect.some(endColor => endColor.cs == startColor.cs && endColor.cs)) //there is probably a less cursed way to do this
 }

  function calcualtePath() {

      let pathcolor = 13;
      vPath.length = 0;
      if ( commonColor.length ) { pathcolor = commonColor[0].cs }
      if ( pStart.length && pEnd.length ) { runPfind(pStart[0],pStart[1],pEnd[0],pEnd[1], pathcolor ); }
 }

  function selectorDoubleClick(target) {

      commonColor = target.filter((el, elIndex) => target.some((sameE, sameEIndex) => sameE.cs == el.cs && sameEIndex != elIndex));
       if (commonColor.length > 1) {

      vPath.forEach(e => e.state = 3 );
      target[0].color = target[0].cs = commonColor[0].cs;
      vPath.push( target[0] );
      console.log("common color found in ColorSelect for single tile") };
  }
 
  function disableColorsSelector() {
   if ( commonColor.length ) { let temp = (startColorSelect.concat(endColorSelect)).forEach(e => { if (!commonColor.some(color => color.cs == e.cs)) { e.state = 3 }}); }
  }

  function recolorPath() { 
         let pathcolor = 13;
         if (vPath.length && vPath.every(e => e.state) && commonColor.some(e => e.cs == nextGrid[x][y].color)) { pathcolor = startColorSelect[0].color = endColorSelect[0].color = nextGrid[x][y].color; console.log("recoloring path to a common color");} 
    else if (!pStart.lock && !pEnd.lock && commonColor.length) { pathcolor = startColorSelect[0].color = endColorSelect[0].color = commonColor[0].cs; console.log("path unlocked, common color found") }
    vPath.forEach(e => e.color = pathcolor);
  }

  function lockColor() {
  
  let colorSelector = startColorSelect.concat(endColorSelect);
  let thisSelector = colorSelector.find(e => e.x == x && e.y == y && e.state);

    function resetColor() {
      colorSelector.forEach(e => e.color = 14 )
      startColorSelect[0].color = 13;
      if (endColorSelect.length) { endColorSelect[0].color = 13; } 
    }

  if (thisSelector.color == 13) { 
      
      resetColor();      
      pStart.lock = false;
      pEnd.lock = false;
      console.log("start or end unlocked")
      }
  
    else if (thisSelector.color == 14 && thisSelector.origin == 1) {

            resetColor();
            thisSelector.color = 13;
            startColorSelect[0].color = startColorSelect[0].cs = nextGrid[x][y].color; 
            pStart.lock = true;
            pEnd.lock = false;
            console.log("start locked") }

    else if (thisSelector.color == 14 && thisSelector.origin == 2) { 

             resetColor();
             thisSelector.color = 13;
             endColorSelect[0].color = endColorSelect[0].cs = nextGrid[x][y].color; 
             pStart.lock = false;
             pEnd.lock = true;
             console.log("end locked") }
  }
}

function resetVpath() {

  pEnd.length = 0;
  pStart.length = 0;
  pStart.lock = false;
  pEnd.lock = false;
  combinedVpath.forEach(e => e.state = 3);

}


convertVpath.tiles = 0;
convertVpath.checkFloatingTiles = false;

function convertVpath() {

    updateUndoValues(null);

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      undoGrid[x][y] = structuredClone(nextGrid[x][y]); //store previous grid for undo.
      }}

  for (let i = 0, x,y; i < vPath.length; i++) {

    if (vPath[i].color != 13 && vPath[i].state) {
    x = vPath[i].x; y = vPath[i].y;
    nextGrid[x][y] = new tile(x,y,x,y,vPath[i].color,4)
    if (checkSettings.paths != 2 || nextGrid[x][y].color > 13 ) { nextGrid[x][y].pathTile = true; }
    convertVpath.tiles++
    }}

  pStart.length = 0;
  pStart.lock = false;
  pEnd.length = 0;
  pEnd.lock = false;
  startColorSelect.length = 0;
  endColorSelect.length = 0;
  vPath.length = 0;
  combinedVpath.length = 0;

  convertVpath.checkFloatingTiles = true;

  if (checkSettings.paths != 2) { difficulty.removal.value-- }

  nextMatrix();
  roundCorners();
  busy = true;
}

function validatePath() { //checks if path still connected to same colored elements as before

  let currentColorSelect = startColorSelect.slice(1).concat(endColorSelect.slice(1));

    if (currentColorSelect.length) {
         
         for (const e of currentColorSelect) {
          
            if ( !(e.cs == nextGrid[ e.x ][ e.y ].color)) {
            combinedVpath.forEach(e => e.state = 3);
            pStart.length = 0;
            pStart.lock = false;
            pEnd.length = 0;
            pEnd.lock = false;
            console.log("path is no longer valid");
            // busy = true; //being called from nextClick sets the busy
            return; }}} 
}

function runPfind(sx,sy,ex,ey,color) {

  for (let x = 0; x < xSize; x++) {
   for (let y = 0; y < ySize; y++) {

   if ( nextGrid[x][y].state ) { pathGrid[x][y].walkable = false }
   else { pathGrid[x][y].walkable = true }   
   }}

      const path = aStar(pathGrid, sx, sy, ex, ey);
      
      if (path) {
      vPath.length = 0;
      for (let i = 0; i < path.length; i++) {
           vPath[i] = new visualPath(path[i].row, path[i].col,1,color,3,0)} 
      }
}

function aStar(grid,startx,starty,endx,endy) {
  const startNode = grid[startx][starty];
  const endNode = grid[endx][endy];
  const openSet = [startNode];
  const closedSet = [];

  // Initialize start node's gCost (distance from start) and fCost (gCost + heuristic)
  startNode.gCost = 0;
  startNode.hCost = heuristic(startNode, endNode);
  startNode.fCost = startNode.gCost + startNode.hCost;
  startNode.parent = null; // Initially, the start node has no parent

  while (openSet.length > 0) {

    let currentNode = openSet[0];
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].fCost < currentNode.fCost) {
        currentNode = openSet[i];
        currentIndex = i;
      }
    }

    openSet.splice(currentIndex, 1);
    closedSet.push(currentNode);

    if (currentNode === endNode) {
      return reconstructPath(currentNode);
    }

    // Explore neighbors
    const neighbors = getNeighbors(grid, currentNode);

    for (const neighbor of neighbors) {
      if (closedSet.includes(neighbor) || !neighbor.walkable) {
        continue; // Ignore already evaluated or unwalkable neighbors
      }

      const newGCost = currentNode.gCost + 1; // Assuming each step has a cost of 1

      if (newGCost < neighbor.gCost || !openSet.includes(neighbor)) {
        neighbor.gCost = newGCost;
        neighbor.hCost = heuristic(neighbor, endNode);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
        neighbor.parent = currentNode; // Keep track of where we came from

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return null;
}

function heuristic(nodeA, nodeB) {
  // Manhattan distance 
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function getNeighbors(grid, node) {
  const neighbors = [];
  const row = node.row;
  const col = node.col;
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Define possible neighbor offsets (up, down, left, right)
  const neighborOffsets = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  for (const offset of neighborOffsets) {
    const newRow = row + offset[0];
    const newCol = col + offset[1];

    // Check if the new coordinates are within the grid boundaries
    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
      neighbors.push(grid[newRow][newCol]);
    }
  }

  return neighbors;
}

function reconstructPath(endNode) {
  const path = [];
  let currentNode = endNode;
  while (currentNode) {
    path.unshift(currentNode); // Add to the beginning to maintain order
    currentNode = currentNode.parent;
  }
  return path;
}

function updateUndoValues(cluster) {

    undoValues = structuredClone(difficulty.removal) //save last single remove value and color for undo
    undoValues.totalScore = structuredClone(highScore.totalScore);
    undoValues.writeScore = structuredClone(writeScore.score)
    undoValues.colorTiles = structuredClone(makeGrid.colorTiles)
    undoValues.left = structuredClone(nextClick.left);
    undoValues.right = structuredClone(nextClick.right);
    undoValues.undoCluster = cluster //store last cluster that's actually valid
    undoValues.valid = 1;
    undoValues.writeScoretotalTiles = writeScore.totalTiles;
    undoValues.makeGridcolorTiles = makeGrid.colorTiles;

}
 
function scoreClick(e) {

    let coords = { x: e.clientX - scoreCanvas.offsetLeft, y: e.clientY - scoreCanvas.offsetTop }

  if (coords.x > 300 && coords.y > 0 && coords.x < 345 && coords.y < 25 ) {  undo(); }
  if (coords.x > 355 && coords.y > 0 && coords.x < 400 && coords.y < 25 ) { rightClick(e); }   
}

function undo() { //needs to add paths to this

    if (!gameoverBox.state && undoValues.valid) {

    Object.assign(difficulty.removal, undoValues) //target, source
    highScore.totalScore = undoValues.totalScore;
    writeScore.score = undoValues.writeScore;
    makeGrid.colorTiles = undoValues.colorTiles;
    nextClick.left = undoValues.left
    nextClick.right = undoValues.right
    writeScore.totalTiles = undoValues.writeScoretotalTiles;
    makeGrid.colorTiles = undoValues.makeGridcolorTiles;
    undoValues.valid = 0;

  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {


          Object.assign(nextGrid[x][y], undoGrid[x][y]) 

          if (nextGrid[x][y].cluster == undoValues.undoCluster) {
              nextGrid[x][y].state = 4;
              nextGrid[x][y].size = tileSize * 0.7;
            }
          }
        }
      }
 // nextMatrix(); not much point calling it, since its the same.
busy = true;
}

function gameOver() {


  if ( makeGrid.colorTiles == 0)  { setOver(); console.log( "no more color tiles" ); return;  }
  if ( makeGrid.whiteTiles || makeGrid.grayTiles ) { console.log( "there are still white or gray tiles" ); return }
  if (!checkSettings.paths && difficulty.removal.value == 0 && nextMatrix.validClusterCount == makeGrid.colorTiles) { console.log( "no paths, no more removes, all tiles are single" ); setOver(); return; }

  function setOver() {

      gameoverBox.state = 1; 
      
      if (makeGrid.colorTiles == 0) { 
      gameoverText.text = "All clear!"; /* victory(); */ 
      //gameOverSprite.src = nightmode ? 'allClear-next-v4-nextlevel-night.png' : 'allClear-next-v4-nextlevel.png'; }
      }
      else { 
      gameoverText.text = "No more moves."; 
      //gameOverSprite.src = nightmode ? 'allClear-next-v4-night.png' : 'allClear-next-v4.png';
      }
      
      //gameoverText.text = makeGrid.colorTiles ? "No more moves." : "All clear!"
  }

  //nextGrid[0][0].state == 0 is fixing a bug where for a brief moment, while tiles are "loading in" makeGrid.colorTiles is zero, triggering game over and this is probably the worst way to fix it
  let collectColors = []

    switch (difficulty.setting) {
    case 2:
    case 4: if ( nextMatrix.validClusterCount == makeGrid.colorTiles ) {

        for (let x = xSize - 1; x >= 0; x--) {
          for (let y = ySize - 1; y >= 0; y--) {
             
            if (nextGrid[x][y].state && nextGrid[x][y].color == difficulty.removal.color ) {  console.log( "there are still valid removes" ); return }
            if (checkSettings.paths && nextGrid[x][y].state) { collectColors.push(nextGrid[x][y].color) }

            }} 
          if (collectColors.some((val, i) => collectColors.indexOf(val) !== i)) { console.log( "paths active, there is at least 2 of same color" ); return }
          setOver();  console.log( "paths active, remove colors arent matching, all tiles colored different" );
          } 
    } console.log( "there are still valid clusters" );
}

function victory() {
  //victory animation will be here, one day, maybe, who knows
}


function checkSettings(u,v) { //this could use some optimization not to run trough the end.

      for (let y = 0, lastY = 0; y < ySize; y++) {
     for (let x = 0; x < xSize; x++) {

    if ( nextGrid[u][v].cluster == nextGrid[x][y].cluster && nextGrid[x][y].ny + tileSize > bgFill.position ) { return false } 
    }}
    return true;
}

function difficulty(score,color) {

  if (difficulty.setting < 5) {
      if (score == 1) { difficulty.removal.value-- }
      if (score > 2) { difficulty.removal.value += Math.trunc(score/3); difficulty.removal.color = color; }
      if (difficulty.setting >= 3) { difficulty.removal.value = Math.min(difficulty.removal.value,makeGrid.colors) }  
      }
  else { difficulty.removal.value = 0; }
}

function rightClick(e) { //0 invisible, 1 opening anim, 2 open, 3 close anim
  
  e.preventDefault();
  assingEventListener("none");

  if (settingsBox.state == 0) { 
      
      settingsBox.state = 1; 
        if (gameoverBox.state == 2) {gameoverBox.state = 3;}
  } 
  else { 
    settingsBox.state = 3;
    assingEventListener("game");
    gameOver(); 
    }
    busy = true;
}


function gameOverClick(e) {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }

    if (gameoverBox.state == 2 && coords.x > x+5 && coords.y > y+35  && coords.x < x+165 && coords.y < y+75) {  //new game button on game over box

      setMenu.area = { x:x+5,y:y+35,sx:160,sy:40, state:1 } //new game button area
      gameoverBox.state = 3;
      newGame();
    }

    else if ( gameoverBox.state == 2 && coords.x > x-165 && coords.y > y+35  && coords.x < x-5 && coords.y < y+75  )  { //menu botton on game over box

      setMenu.area = { x:x-165,y:y+35,sx:160,sy:40, state:1 }

      settingsBox.state = 1; // 1 intro, 2 stay, 3 outro
      gameoverBox.state = 3; //gameover outro
    }
    busy = true;
}

var startOffset, activeSlider; 

const getClosestSliderPosition = (xPos, range) => 
    range.reduce((acc, el) => {
    if (Math.abs(xPos - el) < Math.abs(xPos - acc)) { acc = el; }
    return acc;
  });

const getIndex = (arr, val) => arr.findIndex((x) => x == val);

function moveSlider(e) {

  let update = tileRoundness
  let offset = e.clientX - canvas.offsetLeft + startOffset
  //the most overcomplicated code for a simple problem so far:

  switch (activeSlider) {

    case 1: tileSizeSlider.x = getClosestSliderPosition(offset, tileSizeSlider.range); 
            newtileSize = tileSizeSteps[ getIndex(tileSizeSlider.range, tileSizeSlider.x) ] ; break;

    case 2: roundnessSlider.x = getClosestSliderPosition(offset, roundnessSlider.range);
            tileRoundness = roundnessSteps[ getIndex(roundnessSlider.range, roundnessSlider.x) ] ; 
            if ( update != tileRoundness ) { //make sure to only update roundness when it actually changes
            roundCorners(); } break;

    case 3: colorSlider.x = getClosestSliderPosition(offset, colorSlider.range); 
            makeGrid.colors = getIndex(colorSlider.range, colorSlider.x) + 2 ; break;

    case 4: difficultySlider.x = getClosestSliderPosition(offset, difficultySlider.range );
            difficulty.setting = getIndex(difficultySlider.range, difficultySlider.x) + 1 ; break;

    case 5: pathSlider.x = getClosestSliderPosition(offset, pathSlider.range);
            checkSettings.paths = getIndex(pathSlider.range, pathSlider.x) ; break;

    case 6: fixedTilesSlider.x = getClosestSliderPosition(offset, fixedTilesSlider.range);
            checkSettings.fixedTiles = getIndex(fixedTilesSlider.range, fixedTilesSlider.x) ; break;

    case 7: permanentTilesSlider.x = getClosestSliderPosition(offset, permanentTilesSlider.range);
            checkSettings.permanentTiles = getIndex(permanentTilesSlider.range, permanentTilesSlider.x) ; break;           
    }

  let newSettings = [newtileSize, makeGrid.colors, checkSettings.paths, checkSettings.fixedTiles, checkSettings.permanentTiles]

  if ( newSettings.every((e, i) => e == moveSlider.prevSliderSettings[i])) { moveSlider.called = false; console.log("not called") }
  else { moveSlider.called = true; console.log("called") }
}

// 0 -> 1 - reload
// 0 -> 2 - reload
// 1 -> 2
// 2 -> 1
// 2 -> 0 - reload
// 1 -> 0 - reload

function sliderUp() {

 if (moveSlider.called) {

  switch (activeSlider) {

     case 1: 
             animeScale = animeScaleSteps[newtileSize]; //tilesize
             tileSize = newtileSize;
                        
             setCanvasSize();
             nextGrid.length = ySize;
             setMenu();
             setTileRadius();
             tileRoundness = roundnessSteps[ getIndex(roundnessSlider.range, roundnessSlider.x) ];
     case 3:
     case 5:
     case 6:  
             if ((moveSlider.prevSliderSettings[3] == 1 && checkSettings.fixedTiles == 2) || (moveSlider.prevSliderSettings[3] == 2 && checkSettings.fixedTiles == 1)) { break; } 
     case 7: 
             if ((checkSettings.permanentTiles == 2 && moveSlider.prevSliderSettings[4] == 1) || (checkSettings.permanentTiles == 1 && moveSlider.prevSliderSettings[4] == 2)) { break; }

             resetVpath(); if ( activeSlider == 5 ) { break; }
             
             undoValues.valid = 0
             difficulty.removal = { value:0,color:0 } 
             highScore.totalScore = 0;
             writeScore.score = 0;
             makeGrid.loadTiles = 0;

             bgFill.position = 0;
             bgFill.animPosition = 0;
             bgFill.state = 2;

             nextClick.left = 1
             nextClick.right = 1
            
            resetTileCount();
            makeGrid();
            nextMatrix();
            writeScore.totalTiles = makeGrid.colorTiles;
            bgFill.offset = ctx.canvas.height / makeGrid.colorTiles
            roundCorners(); 
     break;
     case 4: difficulty(0,difficulty.removal.color); break;
     }  
  }
  canvas.removeEventListener('pointermove', moveSlider);
  canvas.removeEventListener('pointerup', sliderUp);
  moveSlider.called = false;
}

function SliderSettings(e) {

  if(settingsBox.state != 2)  { return }

  moveSlider.prevSliderSettings = [newtileSize, makeGrid.colors, checkSettings.paths, checkSettings.fixedTiles, checkSettings.permanentTiles]

  function assignEvent() {
    canvas.addEventListener('pointermove', moveSlider)
    canvas.addEventListener('pointerup', sliderUp)
  }

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2
  let coords = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }

        if (coords.x > permanentTilesSlider.x && coords.y > permanentTilesSlider.y  && coords.x < permanentTilesSlider.x+120 && coords.y < permanentTilesSlider.y+32) {

            assignEvent();
            startOffset = permanentTilesSlider.x - coords.x        
            activeSlider = 7;
        }

        if (coords.x > fixedTilesSlider.x && coords.y > fixedTilesSlider.y  && coords.x < fixedTilesSlider.x+120 && coords.y < fixedTilesSlider.y+32) {

            assignEvent();
            startOffset = fixedTilesSlider.x - coords.x        
            activeSlider = 6;
        }


        if (coords.x > pathSlider.x && coords.y > pathSlider.y  && coords.x < pathSlider.x+120 && coords.y < pathSlider.y+32) {

            assignEvent();
            startOffset = pathSlider.x - coords.x        
            activeSlider = 5;
        }

        if (coords.x > difficultySlider.x && coords.y > difficultySlider.y  && coords.x < difficultySlider.x+120 && coords.y < difficultySlider.y+32) {

            assignEvent();
            startOffset = difficultySlider.x - coords.x        
            activeSlider = 4;
        }

        if (coords.x > colorSlider.x && coords.y > colorSlider.y  && coords.x < colorSlider.x+120 && coords.y < colorSlider.y+32) {  //colors slider
                 
            assignEvent();
            startOffset = colorSlider.x - coords.x // need to calcualte the offset of the cursor on the slider box, so its snaps to a correct location 
            activeSlider = 3;
        }

        if (coords.x > roundnessSlider.x && coords.y > roundnessSlider.y  && coords.x < roundnessSlider.x+120 && coords.y < roundnessSlider.y+32) { 

            assignEvent();
            startOffset = roundnessSlider.x - coords.x        
            activeSlider = 2;
        }

        if (coords.x > tileSizeSlider.x && coords.y > tileSizeSlider.y  && coords.x < tileSizeSlider.x+120 && coords.y < tileSizeSlider.y+32) { 

            assignEvent();
            startOffset = tileSizeSlider.x - coords.x        
            activeSlider = 1;
        }  
}

function clickBoxHelper() { //function to help visualize a button

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  //offsett from center
  let xo = 5
  let yo = 35

  // size of the button
  let sx = 160;
  let sy = 40;

  ctx.fillStyle = "hsla(181,100%,48%,0.5)";
  ctx.beginPath();
  ctx.roundRect(x+xo,y+yo,sx,sy,0) 
  //ctx.roundRect(tileSizeSlider.x+20,tileSizeSlider.y,20,32,0)
  ctx.fill();
}

function settingsClick(e) {

  if(settingsBox.state != 2)  { return }
  // this function is called on "click" which is mouse down and up, since SliderSettings() runs on mouse down, it sets activeSlider to correct one, also sets
  // moveSlider.prevSliderSettings, so neither of them needs to be called from here. However, sliderUp() triggers before this function since both are on "mouse up";
  // which kind of sucks cause moveSlider.called is false before this function finishes running so it will never trigger any change in slider up, a workaround
  // is to call sliderUp(); manually, but its kind of scoffed its runs first, fails, than runs again....

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }
  let roundnessnewPos;
  let tileSizeNewPos;

    function whywouldyouwanttoclickadamnslider() {

    let newSettings = [newtileSize, makeGrid.colors, checkSettings.paths, checkSettings.fixedTiles, checkSettings.permanentTiles]
    if ( !newSettings.every((e, i) => e == moveSlider.prevSliderSettings[i])) { moveSlider.called = true; sliderUp();  }
    }

  //moveSlider.prevSliderSettings = [newtileSize, makeGrid.colors, checkSettings.paths, checkSettings.fixedTiles, checkSettings.permanentTiles]


        // permanentTilesSlider left side arrow  
        if (coords.x > permanentTilesSlider.x && coords.y > permanentTilesSlider.y && coords.x < permanentTilesSlider.x+20 && coords.y < permanentTilesSlider.y+32) {

            checkSettings.permanentTiles = checkSettings.permanentTiles > 0 ? --checkSettings.permanentTiles : 0
            permanentTilesSlider.x = permanentTilesSlider.range[ checkSettings.permanentTiles ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 7;
          }

        // permanentTilesSlider right side arrow
        if (coords.x > permanentTilesSlider.x+100 && coords.y > permanentTilesSlider.y && coords.x < permanentTilesSlider.x+120 && coords.y < permanentTilesSlider.y+32) {

            checkSettings.permanentTiles = checkSettings.permanentTiles < 2 ? ++checkSettings.permanentTiles : 2
            permanentTilesSlider.x = permanentTilesSlider.range[ checkSettings.permanentTiles ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 7;
          }

        // fixedtilesslider left side arrow
        if (coords.x > fixedTilesSlider.x && coords.y > fixedTilesSlider.y && coords.x < fixedTilesSlider.x+20 && coords.y < fixedTilesSlider.y+32) {

            checkSettings.fixedTiles = checkSettings.fixedTiles > 0 ? --checkSettings.fixedTiles : 0
            fixedTilesSlider.x = fixedTilesSlider.range[ checkSettings.fixedTiles ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 6;
          }

        // fixedtilesslider right side arrow
        if (coords.x > fixedTilesSlider.x+100 && coords.y > fixedTilesSlider.y && coords.x < fixedTilesSlider.x+120 && coords.y < fixedTilesSlider.y+32) {

            checkSettings.fixedTiles = checkSettings.fixedTiles < 2 ? ++checkSettings.fixedTiles : 2
            fixedTilesSlider.x = fixedTilesSlider.range[ checkSettings.fixedTiles ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 6;
          }

        //path slider left side
        if (coords.x > pathSlider.x && coords.y > pathSlider.y && coords.x < pathSlider.x+20 && coords.y < pathSlider.y+32) {

            checkSettings.paths = checkSettings.paths > 0 ? --checkSettings.paths : 0
            pathSlider.x = pathSlider.range[ checkSettings.paths ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 5;
          }

        //path slider right side
        if (coords.x > pathSlider.x+100 && coords.y > pathSlider.y && coords.x < pathSlider.x+120 && coords.y < pathSlider.y+32) {

            checkSettings.paths = checkSettings.paths < 2 ? ++checkSettings.paths : 2
            pathSlider.x = pathSlider.range[ checkSettings.paths ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 5;
          } 

        //difficulty slider left side
        if (coords.x > difficultySlider.x && coords.y > difficultySlider.y && coords.x < difficultySlider.x+20 && coords.y < difficultySlider.y+32) {

            difficulty.setting = difficulty.setting > 1 ? --difficulty.setting : 1
            difficultySlider.x = difficultySlider.range[ difficulty.setting-1 ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 4;
          }

        //difficulty slider right side
        if (coords.x > difficultySlider.x+100 && coords.y > difficultySlider.y && coords.x < difficultySlider.x+120 && coords.y < difficultySlider.y+32) {

            difficulty.setting = difficulty.setting < 5 ? ++difficulty.setting : 5
            difficultySlider.x = difficultySlider.range[ difficulty.setting-1 ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 4;
          } 

          //color slider left side
        if (coords.x > colorSlider.x && coords.y > colorSlider.y && coords.x < colorSlider.x+20 && coords.y < colorSlider.y+32) {

            makeGrid.colors = makeGrid.colors > 2 ? --makeGrid.colors : 2
            colorSlider.x = colorSlider.range[ makeGrid.colors-2 ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 4;
          }

        //color slider right side
        if (coords.x > colorSlider.x+100 && coords.y > colorSlider.y && coords.x < colorSlider.x+120 && coords.y < colorSlider.y+32) {

            makeGrid.colors = makeGrid.colors < 12 ? ++makeGrid.colors : 12
            colorSlider.x = colorSlider.range[ makeGrid.colors-2 ]
            whywouldyouwanttoclickadamnslider();
            //activeSlider = 4;
          } 

        //roundness slider left side
        if (coords.x > roundnessSlider.x && coords.y > roundnessSlider.y && coords.x < roundnessSlider.x+20 && coords.y < roundnessSlider.y+32) {

            roundnessnewPos = getIndex(roundnessSlider.range, roundnessSlider.x)
            roundnessnewPos = roundnessnewPos > 0 ? --roundnessnewPos : 0
            roundnessSlider.x = roundnessSlider.range[ roundnessnewPos ]
            tileRoundness = roundnessSteps[ roundnessnewPos ]
            roundCorners();
            //activeSlider = 4;
          }

        //roundness slider right side
        if (coords.x > roundnessSlider.x+100 && coords.y > roundnessSlider.y && coords.x < roundnessSlider.x+120 && coords.y < roundnessSlider.y+32) {

            roundnessnewPos = getIndex(roundnessSlider.range, roundnessSlider.x)
            roundnessnewPos = roundnessnewPos < 10 ? ++roundnessnewPos : 10
            roundnessSlider.x = roundnessSlider.range[ roundnessnewPos ]
            tileRoundness = roundnessSteps[ roundnessnewPos ]
            roundCorners();
            //activeSlider = 4;
          }

        if (coords.x > tileSizeSlider.x && coords.y > tileSizeSlider.y && coords.x < tileSizeSlider.x+20 && coords.y < tileSizeSlider.y+32) {

            tileSizeNewPos = getIndex(tileSizeSlider.range, tileSizeSlider.x)
            tileSizeNewPos = tileSizeNewPos > 0 ? --tileSizeNewPos : 0
            tileSizeSlider.x = tileSizeSlider.range[ tileSizeNewPos ]
            newtileSize = tileSizeSteps[ tileSizeNewPos ]
            whywouldyouwanttoclickadamnslider();
          } 

        if (coords.x > tileSizeSlider.x+100 && coords.y > tileSizeSlider.y && coords.x < tileSizeSlider.x+120 && coords.y < tileSizeSlider.y+32) {

            tileSizeNewPos = getIndex(tileSizeSlider.range, tileSizeSlider.x)
            tileSizeNewPos = tileSizeNewPos < 8 ? ++tileSizeNewPos : 8
            tileSizeSlider.x = tileSizeSlider.range[ tileSizeNewPos ]
            newtileSize = tileSizeSteps[ tileSizeNewPos ]
            whywouldyouwanttoclickadamnslider();
          } 

        if (coords.x > x+110 && coords.y > y-325  && coords.x < x+150 && coords.y < y-285  )  { //close 

          setMenu.area = { x:x+110,y:y-325,sx:40,sy:40, state:1 }
          settingsBox.state = 3;
          assingEventListener("game");
          gameOver();
        }
        else if (coords.x > x-140 && coords.y > y-273  && coords.x < x-20 && coords.y < y-241  )  { //reset 

          setMenu.area = { x:x-140,y:y-273,sx:120,sy:32, state:1 }
          settingsBox.state = 3;
          //resetTiles();
          window.location.reload(); //Either this or reset all the vairables, but whats the difference really
        }

        else if (coords.x > x-140 && coords.y > y-315  && coords.x < x-20 && coords.y < y-283 )  { //new game 
        //first 2 coordinates are starting point, second 2 are ending so substract size from first 2
          setMenu.area = { x:x-140,y:y-315,sx:120,sy:32, state:1 }  
          settingsBox.state = 3;
          newGame();
          }

        else if (coords.x > x-140 && coords.y > y-231  && coords.x < x-20 && coords.y < y-199  )  { //how to play 
         setMenu.area = { x:x-140,y:y-231,sx:120,sy:32, state:1 }
          console.log("help!");
        }

        else if (coords.x > x+37 && coords.y > y-273  && coords.x < x+137 && coords.y < y-241  )  { //night mode
        setMenu.area = { x:x+37,y:y-273,sx:100,sy:32, state:1 }
        setColorMode();
        }

        else if (coords.x > x-150 && coords.y > y+39  && coords.x < x+150 && coords.y < y+169  )  { //levels area
        //setMenu.area = { x:x-150,y:y+39,sx:300,sy:130, state:1 }


        let levelx = Math.ceil((coords.x - x + 150) / 37.5)
        let levely = Math.ceil((coords.y - y - 39) / 37.5)
        let currentLevel = ( levely * 8 ) - ( 8 - levelx ) //thanks valo        
        let xstep = (levelx - 1) * 37
        let ystep = (levely - 1) * 32

         setMenu.level = { sx : xstep, sy : ystep, x:x-150 + xstep , y: y + 39 + ystep, state:1 }

       // let levels = [,{ colors:3,pt:0,ft:0 }, { colors:4,pt:0,ft:0 },{ colors:5,pt:1,ft:1 } ]

       // console.log("levelx:",levelx,"levely",levely,"level:",currentLevel)

          if (currentLevel < 11) { makeGrid.colors = currentLevel + 2 }
          else if (currentLevel > 10 && currentLevel < 22 ) { makeGrid.colors = currentLevel - 9 }
          else if (currentLevel > 21 ) { makeGrid.colors = currentLevel - 20 }

          colorSlider.x = colorSlider.range[ makeGrid.colors-2 ]

          checkSettings.fixedTiles = currentLevel > 10 ? 1 : 0
          fixedTilesSlider.x = fixedTilesSlider.range[ checkSettings.fixedTiles ]

          checkSettings.permanentTiles = currentLevel > 21 ? 1 : 0 // levels[currentLevel].pt
          permanentTilesSlider.x = permanentTilesSlider.range[ checkSettings.permanentTiles ]

          activeSlider = 3;
          moveSlider.called = true; 
          sliderUp();
          }
}

clickConfirm.alpha = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0]; //well this is dumb.
function clickConfirm() { //flashes a blue box over clicked button

        if (setMenu.area.state == 0) { return }
        
        ctx.fillStyle = "rgba(50,193,226," + clickConfirm.alpha[setMenu.area.state] + ")";
        ctx.beginPath();
        ctx.roundRect( setMenu.area.x,  setMenu.area.y,  setMenu.area.sx ,  setMenu.area.sy, 10)
        ctx.fill();
        setMenu.area.state++
        if (setMenu.area.state == 20) { setMenu.area.state = 0; }           
}

function newGame() { // formally known as reset tiles

    assingEventListener("none");

    resetVpath();
    
    undoValues.valid = 0
    difficulty.removal = { value:0,color:0 } 
    highScore.totalScore = 0;
    writeScore.score = 0;
    makeGrid.loadTiles = 0;

  //  bgFill.position = 0;
  //  bgFill.animPosition = 0;
    bgFill.state = 2;

    nextClick.left = 1
    nextClick.right = 1

   if ( makeGrid.colorTiles + makeGrid.grayTiles > 0 ) {

    
   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      if (nextGrid[x][y].state) { nextGrid[x][y].state = 5; makeGrid.loadTiles++ }
      }}
    }
    else if ( !makeGrid.loadTiles ) {
 
     resetTileCount();
     makeGrid();
     nextMatrix();
     writeScore.totalTiles = makeGrid.colorTiles;
     bgFill.offset = ctx.canvas.height / makeGrid.colorTiles
     roundCorners();
     }
     busy = true;
}


  function resetTileCount() {
    nextMatrix.validClusterCount = 0;
    makeGrid.loadTiles = 0;
    makeGrid.colorTiles = 0;
    makeGrid.whiteTiles = 0;
    makeGrid.grayTiles = 0;
  }

/*
function resetTiles() { // formally known as default, also replaced with a reolad, cause screw keeping track of this...

  assingEventListener("none");

  undoValues.valid = 0;
  difficulty.removal = { value:0,color:0 } 

  difficulty.setting = 4;
  makeGrid.colors = 6;
  
  highScore.totalScore = 0;
  writeScore.score = 0;

  vPath.length = 0;
  pStart.length = 0;
  pEnd.length = 0;
  combinedVpath.length = 0;

  newtileSize = tileSize = tileSizeSteps[3];  // default 50
  animeScale = animeScaleSteps[newtileSize]; //tilesize

  setCanvasSize();
  nextGrid.length = 0;
  setMenu();
  setTileRadius();
  tileRoundness = roundnessSteps[4];
  resetTileCount();
  makeGrid();
  nextMatrix();
  roundCorners();
  busy = true;
}


window.onresize = () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(doneResizing, 500);
}

function doneResizing() { //nvm, keeping track of this...
*/

window.childCallback = () => {
  // location.reload();
  assingEventListener("none");

  resetVpath();
    
  undoValues.valid = 0
  difficulty.removal = { value:0,color:0 } 
  highScore.totalScore = 0;
  writeScore.score = 0;
  makeGrid.loadTiles = 0;

  bgFill.state = 2;

  nextClick.left = 1
  nextClick.right = 1

  resetTileCount();
  setCanvasSize();
  setMenu();
  makeGrid(1); //dont generate new colors
  nextMatrix();
  writeScore.totalTiles = makeGrid.colorTiles;
  bgFill.offset = ctx.canvas.height / makeGrid.colorTiles
  roundCorners();
  busy = true;
}

//shuffles an array
function shuffle(a) {
  for(let j, s, i = a.length; i; j = parseInt(Math.random() * i), s = a[--i], a[i] = a[j], a[j] = s);
  return a;
}

//not finished
function demo() {

  let rndcord = {};

  rndcord.y = Math.round(Math.random() * nextGrid.length )
  rndcord.x = Math.round(Math.random() * nextGrid[0].length )

  nextClick(rndcord)
  }


bgFill.position = 0;
bgFill.animPosition = 0;
bgFill.opacity = 0;
bgFill.state = 1;

function bgFill() {

/*
  if (bgFill.state == 2) { 
      bgFill.opacity = Math.max(bgFill.opacity - 0.01, 0);  busy = true;
      if (bgFill.opacity == 0) { bgFill.state = 1;}          
      } 
  */
  switch ( bgFill.state ) {
  case 1: bgFill.opacity = Math.min(bgFill.opacity + 0.01, 1); busy = true;  //cant be put in loadtiles cause load tiles called for every tile, not for every frame
          if (bgFill.opacity == 1) { bgFill.state = 3; bgFill.animPosition = 0; bgFill.position = 0; } break; 
  case 2: bgFill.opacity = Math.max(bgFill.opacity - 0.01, 0);  busy = true;
          if (bgFill.opacity == 0) { bgFill.state = 1; } break;          
          }

//  if (bgFill.opacity < 0.25) { bgFill.opacity = Math.min(bgFill.opacity + 0.01, 0.25) }
//  if (bgFill.opacity > 0.25) { bgFill.opacity = Math.max(bgFill.opacity - 0.01, 0.25) }

  if (bgFill.position > bgFill.animPosition)  {  bgFill.animPosition +=  animeScale / 2; busy = true; } 

// let left = (nextClick.left-1) * tileSize
// let right = ctx.canvas.width - left - ((nextClick.right - 1)  * tileSize)

  
   backCtx.clearRect(0, 0, backCtx.canvas.width, backCtx.canvas.height);

   if (checkSettings.fixedTiles == 1 || checkSettings.permanentTiles == 1) {
   backCtx.beginPath();
   backCtx.moveTo(0, bgFill.animPosition);
   backCtx.lineTo(backCtx.canvas.width, bgFill.animPosition);
   backCtx.strokeStyle = nightmode ? "rgba(66,66,66," + bgFill.opacity + ")" : "rgba(90,50,75," + bgFill.opacity + ")"
   backCtx.lineWidth = 8;
   backCtx.stroke();
   }

   backCtx.fillStyle = nightmode ? "rgba(20,20,20," + bgFill.opacity + ")" : "rgba(47,18,36," + bgFill.opacity + ")"  // "rgba(10,33,51," + bgFill.opacity + ")" 
   backCtx.fillRect( 0, bgFill.animPosition, backCtx.canvas.width, backCtx.canvas.height - bgFill.animPosition)
}


var secondsPassed, oldTimeStamp, fpsCount = 0

function MeasureFps(timeStamp) {

//[0.21,0.21,0.253,0.317,0.38,0.443,0.507,0.57,0.485]

    const speedLookup = [0.21,0.249,0.279,0.317,0.348,0.385,0.417,0.455,0.485] //contains the speed for every tile size, since each size needs a bit of tweaking.

    secondsPassed = timeStamp - oldTimeStamp;
    oldTimeStamp = timeStamp;
    let fps = Math.round(1000 / secondsPassed);
    fpsCount++

    if ( fpsCount >= 10 ) { //measure 10 frame time than set anim scale

        for (let i = 2; i < 11; i++ ) {
        animeScaleSteps[i*10] = parseFloat((secondsPassed * speedLookup[i-2]).toFixed(2))
        }
        
        menufps = Math.round(fps / 30)
        menuFadeRate = parseFloat((secondsPassed * 0.01).toFixed(2)) // alpha anim speed of menu animation fade out
        animeScale = animeScaleSteps[tileSize];
        setMenu();
        renderTiles();  
    }
    else { window.requestAnimationFrame(MeasureFps); }
    }

setCanvasSize();
//setMenu(); //being called after fps is measured
makeGrid();
nextMatrix();
writeScore.totalTiles = makeGrid.colorTiles;
bgFill.offset = ctx.canvas.height / makeGrid.colorTiles // (xSize * ySize)
roundCorners();
MeasureFps();
