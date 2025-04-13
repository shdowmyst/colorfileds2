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
  const nextGrid = [];
  const undoGrid = [];
  var resizeId; //window size
  var undoValues = {};

// at 144 fps, 50 px tile size, anime scale: 2.2 is ideal. so in 1 second a tile moves 317 px, or 317 / 1000 = 0.317 px / ms

  makeGrid.colorLookup = [];
  makeGrid.colors = 6; //amount of colors by default, for max colors see line 930ish
  
  //these updated by nextMatrix only.
  makeGrid.loadTiles = 0;  //used to for load / unload animation
  makeGrid.colorTiles = 0;  //used for game over state
  makeGrid.whiteTiles = 0;  //currently have no actual use
  makeGrid.blackTiles = 0;  //same

  // makeGrid.tilesLeft = 0; //total amount of tiles,  used for load / unload anim, basically: xSize * ySize
  
  makeGrid.loadAnimType;
  nextMatrix.validClusterCount = 0;
  highScore.totalScore = 0;
  writeScore.score = 0;
  difficulty.removal = { value:0,color:0 }
  difficulty.setting = 4; // 1: every 3 tile let you remove a single one. //2 same color as last 3 tiles //3 removes limited by number of colors //4 same, but also limited by color  last 3tile //5 no removes at all.
  difficulty.unmove = 1; // unmovable tiles
  moveSlider.called = 0;
 //menu stuff
  var gameoverBox, settingsBox, gameoverText, roundnessSteps, tileSizeSlider, roundnessSlider, colorSlider, difficultySlider;

  var temp = 0;

  setMenu.area = {state:0}; //blue box over a clicked button

  const gameOverSprite = new Image();
  gameOverSprite.src = 'allClear-next.png';

  const settingsSprite = new Image();
  settingsSprite.src = 'settings-next-v2.png';

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
    this.despawn = 0; //store previous color for despawn anim
    }
  
  moveTile() {
  if (this.rx > this.nx) {this.rx = Math.max( this.rx - animeScale, this.nx); } //right to left - default
  if (this.rx < this.nx) {this.rx = Math.min( this.rx + animeScale, this.nx); } //left to right

  if (this.ry != this.ny) {this.ry = Math.min( this.ry + animeScale, this.ny); }
  if (this.ry == this.ny && this.rx == this.nx) { this.state = 3 }
  }

  loadTiles() {
  if (this.size != tileSize && Math.random() > 0.8 ) { this.size = Math.min(this.size + animeScale, tileSize) }
  if (this.size == tileSize) {this.state = 3; makeGrid.loadTiles++; }
  if ( makeGrid.loadTiles == xSize * ySize) { assingEventListener("game"); makeGrid.loadAnimType = 1; }
  }
  
  unLoadTiles() {
  if (this.size != tileSize / 10 && Math.random() > 0.8 ) { this.size = Math.max(this.size - animeScale, 0)}
  if (this.size <= 0) { this.state = 0; makeGrid.loadTiles-- }
  if ( makeGrid.loadTiles == 0 ) { resetTileCount(); newGame(); }
  }

  despawnWhiteTile() {
  if (this.size != tileSize / 10 && Math.random() > 0.8 ) { this.size = Math.max(this.size - animeScale, 0)}
  if (this.size <= 0) {this.state = 0; this.color = 0; this.cluster = 0;}
  }
  
  despawnTile(x,y) {

   if (this.despawn.size != this.despawn.tileSize / 5)  { this.despawn.size = Math.max(this.despawn.size - animeScale, 0) }
   if (this.despawn.size == 0)  { this.despawn.state = 0; return }
          
   //let offset = 0;
   /*if (this.despawn.size != tileSize) { */
   let offset = (tileSize - this.despawn.size) / 2; // } // used to be default

   ctx.beginPath(); 
   ctx.fillStyle = setColor(this.despawn.color);
   ctx.roundRect(this.despawn.rx + offset, this.despawn.ry + offset, this.despawn.size, this.despawn.size, [tileRoundness, tileRoundness, tileRoundness, tileRoundness]); //x,y, size x, size y //[this.topleft, this.topright, this.bottomright, this.bottomleft]
   ctx.fill();
}

  show(x,y) {
          
          let offset = 0;
          
          if (this.size != tileSize) {

          switch ( makeGrid.loadAnimType ) {
          case 1: offset = (tileSize - this.size) / 2; break; // used to be default
          case 2: offset = (tileSize - this.size); break;
          default: break;
          }}

  ctx.beginPath(); 
  ctx.fillStyle = setColor(this.color);
  // ctx.fillStyle = "hsl(" + hue + ")"; why on earth did I used hsl here

  let xmoveOffset = 0;
  let ymoveOffset = 0;
    
    if (this.rx != this.nx) {xmoveOffset = 1 } //add one pixel to moving tiles size so subpixel movments are smooth
    if (this.ry != this.ny) {ymoveOffset = 1 }
  
  ctx.roundRect(this.rx + offset, this.ry + offset, this.size + xmoveOffset, this.size + ymoveOffset, [this.topleft, this.topright, this.bottomright, this.bottomleft]); //x,y, size x, size y //[this.topleft, this.topright, this.bottomright, this.bottomleft]
  //debug
  //ctx.roundRect(x * tileSize + offset, y * tileSize + offset, this.size + xmoveOffset, this.size + ymoveOffset, [this.topleft, this.topright, this.bottomright, this.bottomleft]); //x,y, size x, size y //[this.topleft, this.topright, this.bottomright, this.bottomleft]

  ctx.fill();

  //debug    
  //ctx.fillStyle = "black";
  //ctx.font = "12px Arial";
  //ctx.fillText(  /* yi + ':' + xi  's:' + this.state + 'c:' + ("x:" + x + " y:" + y ) */ "c:" + this.cluster , this.rx + 25, this.ry + 25)
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
        ctx.drawImage(this.image, this.frames * this.width , 0 , this.width , this.height , this.x , this.y , this.width , this.height )
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
  ctx.fillStyle = "rgba(107,220,255," + this.alpha + ")";
  ctx.font = "16px fixedSysEx";
  ctx.fillText(  text || this.text , this.x , this.y)
  }
}

class slider {

  constructor(x,y,low,high,steps,range) {
  this.x = x;
  this.y = y;
  this.low = low;
  this.high = high;
  this.steps = steps;
  this.alpha = 0;
  this.range = range;
  }

  fadeIn() {
  if (this.alpha != 1) {this.alpha = Math.min(this.alpha + menuFadeRate, 1)}}

  fadeOut() {
  if (this.alpha != 0) {this.alpha = Math.max(this.alpha - menuFadeRate, 0)}}

  show(value) {
 
  ctx.beginPath();
  ctx.roundRect(this.x, this.y, 100, 25, 10); //x,y, size x, size y 
  ctx.fillStyle = "rgba(19,50,78," + this.alpha + ")";
  ctx.fill(); 

  ctx.fillStyle = "rgba(107,220,255," + this.alpha + ")";
  ctx.font = "16px fixedSysEx";
  ctx.fillText("<        >", this.x+50 ,this.y+17 )
  
  ctx.fillText(value, this.x+50 ,this.y+17 )
  }
}

function setColor(color) { //tile colors defined here

        switch (color) {
        case 1: return "#FFCA57"; //orange
        case 2: return "#B67E5C"; //brown
        case 3: return "#876047"; //dark brown
        case 4: return "#FFF570"; //yellow
        case 5: return "#4ED06A"; //green
        case 6: return "#42AE57"; //darker green
        case 7: return "#7AFFF0"; //light blue
        case 8: return "#6BDCFF"; //blue
        case 9: return "#4B80AF"; //darkblue
        case 10: return "#FF7A88"; //pink
        case 11: return "#EC5E7C"; //darker pink
        case 12: return "#804B79"; //purple
        case 13: return "#151515"; //black 
        case 14: return "#fafafa"; //white  
        default: return "red";
        }
  }

function setCanvasSize() {

  xSize = Math.trunc (  window.innerWidth / tileSize ) // window.innerWidth > 1366 ? 27 :
  ySize = Math.trunc (  (window.innerHeight-25) / tileSize ) // (window.innerHeight-15) > 768 ? 15 :
  
  scoreCtx.canvas.width  = 350 // xSize * 50;
  scoreCtx.canvas.height = 25;
  
  ctx.canvas.width  = xSize * tileSize
  ctx.canvas.height = ySize * tileSize

  ctx.textAlign = "center";

  scoreCtx.textAlign = "center";
  scoreCtx.font = "16px fixedSysEx";

  ctx.imageSmoothingEnabled = false;
//  scoreCtx.imageSmoothingEnabled = false;

}

function setMenu() {

  function sliderArray(steps,high,low) { return Array.from( {length:steps}, (_, i) => low + ( Math.trunc((high - low) / steps)) * i ); }
   
  let midX = ctx.canvas.width / 2
  let midY = ctx.canvas.height / 2

  gameoverText = new menuText("Here we go!", midX , midY - 45 ) //text, x,y 
  highScoreText = new menuText("zero", midX , midY - 10 ) // text here is more of a palceholder.
  
  //tile size slider
  tileSizeSlider = new slider(midX,midY-86,midX-41,midX+35,9)
  tileSizeSlider.range = sliderArray(tileSizeSlider.steps,tileSizeSlider.high,tileSizeSlider.low); 
  tileSizeSlider.x = tileSizeSlider.range[ getIndex(tileSizeSteps, tileSize)] // need to find index of current tile size and match it to slider position cause mid game can call setmenu
  // tileSizeSlider.x = tileSizeSlider.range[ (tileSize / 10) -2 ] // the simple way

  //roundness slider
  roundnessSlider = new slider(midX,midY-50,midX-41,midX+35,11)
  roundnessSlider.range = sliderArray(roundnessSlider.steps,roundnessSlider.high,roundnessSlider.low); 
  roundnessSlider.x =  roundnessSlider.range[ getIndex( roundnessSteps, tileRoundness) ]

  //color slider
  colorSlider = new slider(midX,midY-14,midX-65,midX+33,11) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  colorSlider.range = sliderArray(colorSlider.steps,colorSlider.high,colorSlider.low);
  colorSlider.x = colorSlider.range[makeGrid.colors-2] //-2 cause colors start at two, and array starts at 0.

  //difficulty slider
  difficultySlider = new slider(midX,midY+22,midX-33,midX+35,5) //x,y,lower limit in pixels from center of canvas ,higher limit, steps
  difficultySlider.range = sliderArray(difficultySlider.steps,difficultySlider.high,difficultySlider.low);
  difficultySlider.x = difficultySlider.range[difficulty.setting-1] //cause array starts at 0

   gameoverBox = new menu( midX , midY , 300,200,10,gameOverSprite,"gameOver",menufps); //x, y, frame width, frame height, number of frames, name of the frame sprite, fps = every n.th frame it should update
   settingsBox = new menu( midX , midY , 300,450,16,settingsSprite,"settings",menufps);
}


function setTileRadius() { roundnessSteps = Array.from({ length: 11 }, (_,i) => (tileSize / 2) / 10 * i); }

function makeGrid(res) {

  let unmoveMinHeight = ySize // Math.floor(ySize * 0.8)

  if (!res) { makeGrid.colorLookup = makePalette(); } 
  makeGrid.loadAnimType = Math.floor(Math.random() * 3 )

 for (let x = 0; x < xSize; x++) {
    nextGrid[x] = [];
    undoGrid[x] = [];
    for (let y = 0; y < ySize; y++) {
     nextGrid[x][y] = new tile(x,y,x,y,makeGrid.colorLookup[Math.floor(Math.random() * makeGrid.colors)],4) // rx,ry,nx,ny,color,state
     if ( difficulty.unmove && Math.random() < 0.15 ) {  nextGrid[x][y].color = 14; }
     }
   }

  mergeTiles();
 //setUnmove();
}

function makePalette() { 

 //each set contains 3 colors in different shades, to generate nice looking palettes, first pick a color from a set
 //than one (or none) of its shades. Each color should be a primary color, or primary + shade, but never just a shade.

  let colorset = [];
   let sets =[[1,2,3],[4,5,6],[7,8,9],[10,11,12]] // orange = [1,2,3], green = [4,5,6], blue = [7,8,9], pink = [10,11,12];

  while (sets[0].length + sets[1].length + sets[2].length + sets[3].length > makeGrid.colors) {
  sets[ Math.floor(Math.random() * 4) ].pop();
  }
    for (let j = 0; j < sets.length ; j++) { colorset = colorset.concat(sets[j]) }

return colorset;}


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
    function goBack(leftCluster,upCluster) {

     for (let x = 0; x < xSize; x++) {
      for (let y = 0; y < ySize; y++) {

        if (nextGrid[x][y].cluster == leftCluster && nextGrid[x][y].state >= 2) {
        nextGrid[x][y].cluster = upCluster;
    }}}}

  let cluster = 0;

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      let thisTile = nextGrid[x][y];

     if( thisTile.state ) {
  
        let up = {}
        let down = {}
        let left = {}
  
        if (y && nextGrid[x][y-1].state) { up = nextGrid[x][y-1] } //up 
        if (x && nextGrid[x-1][y].state) { left = nextGrid[x-1][y] } //left 
  
             if ( thisTile.color == up.color && thisTile.color == left.color) { thisTile.cluster = up.cluster; goBack(left.cluster,up.cluster) }
        else if ( thisTile.color == left.color ) { thisTile.cluster = left.cluster;  }
        else if ( thisTile.color == up.color ) { thisTile.cluster = up.cluster; }  
        
        else if ( thisTile.color < 13 ) { thisTile.cluster = ++cluster;  nextMatrix.validClusterCount++ }
        else { thisTile.cluster = ++cluster }

   //    else { thisTile.cluster = ++cluster if (thisTile.color < 12) { validTileClusterCount++ } } 
        
        // this only counts tiles
             if (thisTile.color == 14) { makeGrid.whiteTiles++; }
        else if (thisTile.color == 13) { makeGrid.blackTiles++; }
        else  { makeGrid.colorTiles++; }
        }
    } 
  //nextMatrix.validClusterCount = validTileClusterCount;
  }
  //nextMatrix.validClusterCount = cluster;  
  console.log("color tiles:",makeGrid.colorTiles," white tiles:",makeGrid.whiteTiles, " black tiles:",makeGrid.blackTiles, "valid tile Cluster count:", nextMatrix.validClusterCount )

  if ( makeGrid.colorTiles - nextMatrix.validClusterCount == 0 )
  console.log( "game over?" )
}

function roundCorners() {

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
     
     // tileRoundness = Math.round(Math.random() * 25) funky

     let thisTile = nextGrid[x][y]
     if(thisTile.state >= 2) {  

      let topcorner;
      let bottomcorner;
      let rightcorner;
      let leftcorner;
      
     if (x) { leftcorner = nextGrid[x-1][y].cluster }
     if (y) { topcorner = nextGrid[x][y-1].cluster; }
 
     if (x < xSize-1 ) { rightcorner = nextGrid[x+1][y].cluster; }
     if (y < ySize-1 ) { bottomcorner = nextGrid[x][y+1].cluster; }

          //[top left, top right, bottom left, bottom right]

          if (topcorner == thisTile.cluster || leftcorner == thisTile.cluster) { thisTile.topleft = 0 } else { thisTile.topleft = tileRoundness }  //top left corner
          if (topcorner == thisTile.cluster || rightcorner == thisTile.cluster) { thisTile.topright = 0 } else { thisTile.topright = tileRoundness }  //top right corner
          if (bottomcorner == thisTile.cluster || leftcorner == thisTile.cluster) { thisTile.bottomleft = 0 } else { thisTile.bottomleft = tileRoundness }
          if (bottomcorner == thisTile.cluster || rightcorner == thisTile.cluster) { thisTile.bottomright = 0 } else { thisTile.bottomright = tileRoundness }
      }
    else { thisTile.topleft = tileRoundness; thisTile.topright = tileRoundness; thisTile.bottomleft = tileRoundness;  thisTile.bottomright = tileRoundness; } //set removed tiles to round, looks better
    }
  }
}


function renderTiles() {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      
      let thisTile = nextGrid[x][y];
      if (thisTile.despawn.state) { thisTile.despawnTile(x,y) }

      switch (thisTile.state) {
      case 6: thisTile.despawnWhiteTile();thisTile.show(); break;
      case 5: thisTile.unLoadTiles();thisTile.show(x,y); break; //disappearing after reset
      case 4: thisTile.loadTiles();thisTile.show(x,y); break; //anim at game start
      case 6:
      case 3: thisTile.show(x,y); break; //idle or unmovable
      case 2: thisTile.moveTile();thisTile.show(x,y); break; //moving      
      case 1: thisTile.scaleTile();thisTile.show(x,y); break; //disappearing after being clicked on
      }
      }}


        switch (gameoverBox.state) {
        case 1: gameoverBox.playForward(); 
                gameoverText.fadeIn(); 
                gameoverText.show(); 
                break;
        
        case 2: gameoverBox.show(); 
                gameoverText.show(); 
                highScoreText.fadeIn(); 
                highScoreText.show("score:" + writeScore.score ); 
                break;
        
        case 3: gameoverBox.playBackward(); 
                gameoverText.fadeOut(); 
                highScoreText.fadeOut(); 
                gameoverText.show(); 
                break;
        }

        switch (settingsBox.state) { //everything shown on settings screen is here
          case 1: settingsBox.playForward();
                  colorSlider.fadeIn(); colorSlider.show(makeGrid.colors);
                  difficultySlider.fadeIn(); difficultySlider.show(difficulty.setting);
                  roundnessSlider.fadeIn(); roundnessSlider.show(tileRoundness);
                  tileSizeSlider.fadeIn(); tileSizeSlider.show(newtileSize);
                  break;

          case 2: settingsBox.show(); //stays on
                    colorSlider.show(makeGrid.colors);
                    difficultySlider.show(difficulty.setting);
                     roundnessSlider.show(tileRoundness);
                     tileSizeSlider.show(newtileSize)
                  break;

          case 3: settingsBox.playBackward(); //fades out
                  colorSlider.fadeOut(); colorSlider.show(makeGrid.colors);                
                  difficultySlider.fadeOut(); difficultySlider.show(difficulty.setting);
                  roundnessSlider.fadeOut(); roundnessSlider.show(tileRoundness);
                  tileSizeSlider.fadeOut(); tileSizeSlider.show(newtileSize);
                  break;
            
          }
               
     //  clickBoxHelper();

       clickConfirm();

     writeScore();

  requestAnimationFrame(renderTiles) 
}


function highScore(x) {

  let score = Math.pow((x-1),2) * makeGrid.colors
  //let score = Math.pow((x-1),(makeGrid.colors / 4)) * makeGrid.colors
  highScore.totalScore += score;
}

function writeScore() {

    let hue;
  
    if (highScore.totalScore - writeScore.score > 1000) {writeScore.score += 1000 }
      else if (highScore.totalScore - writeScore.score > 100) {writeScore.score += 100 }
      else if (highScore.totalScore - writeScore.score > 10) {writeScore.score += 10 }
      else if ( writeScore.score < highScore.totalScore ) { writeScore.score++ }

      scoreCtx.clearRect(0, 0, 350, 25);
      //scoreCtx.drawImage(scoreBack,0,5)

     if (difficulty.setting == 2 || difficulty.setting == 4) {
          
          switch (difficulty.removal.color) {
        case 1:
          hue = "#FFCA57"; 
          break; //orange
        case 2:
          hue = "#B67E5C"; 
          break; //brown
        case 3:
          hue = "#876047"; 
          break; //dark brown
        case 4:
          hue = "#FFF570"; 
          break; //yellow
        case 5:
          hue = "#4ED06A"; 
          break; //green
        case 6:
          hue = "#42AE57"; 
          break; //darker green
        case 7:
          hue = "#7AFFF0"; 
          break; //light blue
        case 8:
          hue = "#6BDCFF"; 
          break; //blue
        case 9:
          hue = "#4B80AF";
          break; //darkblue
        case 10:
          hue = "#FF7A88";
          break; //pink
        case 11:
          hue = "#EC5E7C";
          break; //darker pink
        case 12:
          hue = "#804B79";
          break; //purple
        default: hue = "#6bdcff"; //  return 0;
         }
            scoreCtx.beginPath();  
            scoreCtx.fillStyle = hue;
            scoreCtx.roundRect(200,5,100,15,10); //x,y, size x, size y, roundness
            scoreCtx.fill();
    }

    scoreCtx.beginPath()
    scoreCtx.fillStyle = "#386389";
    scoreCtx.roundRect(0,5,100,15,10); //score
    scoreCtx.roundRect(300,5,50,15,10); //undo 
    scoreCtx.fill(); 

    scoreCtx.fillStyle = "#6bdcff" // "#244b6e"; 
    scoreCtx.fillText("score:" + writeScore.score,50,17)
    scoreCtx.fillText("tiles:" + makeGrid.loadTiles,150,17)
    
    scoreCtx.fillText("undo",325,17)
    
    scoreCtx.fillStyle = hue ? "#244b6e" : "#6bdcff";
    scoreCtx.fillText("removes:" + difficulty.removal.value,250,17) //text,x,y
}
     
function assingEventListener(call) {

      if (settingsBox.state == 2 && call === "game") { return } 
  
      canvas.addEventListener('contextmenu', rightClick);
      scoreCanvas.addEventListener('click', undo);      
      //document.getElementById('scoreField').addEventListener('click', rightClick) ;
  
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


var nxl,xl = 0;
var nyl,yl = 0;
var currentColor

function Highlight(e) { //Highlight the current tile 

  nxl = Math.trunc((e.clientX - canvas.offsetLeft + window.pageXOffset) / tileSize)
  nyl = Math.trunc((e.clientY - canvas.offsetTop + window.pageYOffset) / tileSize)

  nextGrid[nxl][nyl].state = 0

/*
  if (xl != nxl || yl != nyl ) { 
  nextGrid[nyl][nxl].size = tileSize - 10;
  nextGrid[yl][xl].size = tileSize;
  xl = nxl;
  yl = nyl;
*/
}


function setUnmove() { //

      for (let x = 0; x < xSize; x++) {
     for (let y = 0; y < ySize; y++) {
     
     if ( nextGrid[x][y].color == 14 ) {
          makeGrid.whiteTiles++          
          
     } 
}}
}

function despawnUnmovable() {

    let remove = [];
    var pass = [];
    var fail = [];
    function flout(cluster) { pass = pass.filter(x => x != cluster) }

     for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      if (nextGrid[x][y].color == 14) {

        let cluster = nextGrid[x][y].cluster;
        
      if (x && 0 < nextGrid[x-1][y].color && nextGrid[x-1][y].color < 14) {  fail.push(cluster); continue }
      if (y && 0 < nextGrid[x][y-1].color && nextGrid[x][y-1].color < 14) {  fail.push(cluster);  continue }
      if (x < xSize-1 && 0 < nextGrid[x+1][y].color && nextGrid[x+1][y].color < 14) { fail.push(cluster); continue }
      if (y < ySize-1 && 0 < nextGrid[x][y+1].color && nextGrid[x][y+1].color < 14) { fail.push(cluster); continue }
      
      pass.push( {c:cluster, x:x, y:y} );
    }}
  }

 remove = pass.filter(tile => !fail.some(cluster => cluster == tile.c));
//let remove = pass.filter( tile => !fail.includes(tile))

  if (remove.length) {  
 
      for (let i = 0; i < remove.length; i++) {
      nextGrid[remove[i].x][remove[i].y].state = 6
      }
  }
}

//function despawnTimer() { setTimeout(despawnUnmovable, 1600); }

function gameClick(e) {

  let x = Math.trunc((e.clientX - canvas.offsetLeft + window.pageXOffset) / tileSize) //, 
  let y = Math.trunc((e.clientY - canvas.offsetTop + window.pageYOffset) / tileSize) //}
  if (nextGrid[x][y].state && nextGrid[x][y].color != 14 ) { thisClick(x,y) }
}

function thisClick(u,v) {

  var thisTile = nextGrid[u][v];
  var thisColor = thisTile.color;
  var thisCluster = thisTile.cluster;
  var score = 0;
    
    //check if click is valid by difficulty settings

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

    //undo values

    undoValues = structuredClone(difficulty.removal) //save last single remove value and color for undo
    undoValues.totalScore = structuredClone(highScore.totalScore);
    undoValues.writeScore = structuredClone(writeScore.score)
    undoValues.valid = 1;

   //vertical moving

   for (let x = 0; x < xSize; x++) {
    for (let y = 0, valid = 0; y < ySize; y++) {

      undoGrid[x][y] = structuredClone(nextGrid[x][y]); //store previous grid for undo.
      undoValues.undoCluster = thisCluster //store last cluster that's actually valid
    
      if (nextGrid[x][y].state && nextGrid[x][y].cluster != thisCluster ) { valid++ }
      if (nextGrid[x][y].color == 14) { valid = 0; } // inmovable tiles, set condition to something, state 6, color 20 etc

      if (nextGrid[x][y].cluster == thisCluster) {

          nextGrid[x][y].despawn = structuredClone(nextGrid[x][y])
          nextGrid[x][y].despawn.state = 2;
          score++

          let to = y-valid
          let from = y;

            while (from > to) {
            
            //console.log("from:" + from + " valid:" + valid + " to:" + to)

            nextGrid[x][from].color = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].color;
            nextGrid[x][from].ry = nextGrid[x][ from-1 <= 0 ? 0 : from-1 ].ry //(from-1) * tileSize // needs to be amount traveled
            nextGrid[x][from].state = 2;
            from--
            }
        
         nextGrid[x][y-valid].state = 0;
         nextGrid[x][y-valid].cluster = 0;
         nextGrid[x][y-valid].color = 0;
         }
        }
       }

lastRowEmptyTile();

  function lastRowEmptyTile() { //find the last empty tile in the last row
    
    let leftSide;
    let rightMostEdge;
    let leftTop;
    let half = Math.floor(xSize / 2);

    for (let x = 0; x < xSize; x++) {

         if (x < half && nextGrid[x][ySize-1].state >= 2 && nextGrid[x+1][ySize-1].state == 0) { leftSide = x+1; } 
         if (x > half && nextGrid[x][ySize-1].state >= 2 && nextGrid[x-1][ySize-1].state == 0) { rightMostEdge = x-1; }        
        }

        //this currently both true if the line is in the center, which is, not ideal, also doesn't deal with the fact if ther is an inmovable tile in the middle.

//    if (leftSide) { findEmptyTilesL(leftSide) }
//  if (rightMostEdge) { findEmptyTilesR(rightMostEdge) }
  }

  function findEmptyTilesL(leftMostEdge) { //make an array with every empty tile on the left side

          let leftEdge = [] // Array.from({length:ySize},() => 0)

          for (let x = 0; x <= leftMostEdge; x++) {
           for (let y = 0; y < ySize; y++) {

            if (nextGrid[x][y].state && nextGrid[x+1][y].state == 0) { leftEdge[y] = x+1; }
           }}
        
        leftEdge = leftEdge.filter(n => true) //filter out all the empty slots
        console.log("left edge: "); console.log(leftEdge)
        moveLeftSide(leftEdge)
  }

    function findEmptyTilesR(rightMostEdge) { // this probably could be one function, but its cleaner this why;

          let rightEdge = []

          for (let x = xSize-1; x >= rightMostEdge; x--) { 
           for (let y = 0; y < ySize; y++) {

            if (nextGrid[x][y].state >= 2 && nextGrid[x-1][y].state == 0) { rightEdge[y] = x-1; }
          }}

        rightEdge = rightEdge.filter(n => true)    
        console.log("right edge: " + rightEdge)
        moveRightSide(rightEdge)
  }

  function moveLeftSide(leftEdge) { 

  let offset = ySize - leftEdge.length

  for (let y = offset; y < ySize; y++) {
   for (let x = leftEdge[y - offset]; x >= 0; x--) {

        if (x > 0) {
            //structuredClone still doesn't work with custom class
            nextGrid[x][y].color = nextGrid[ x-1 ][y].color
            nextGrid[x][y].state = nextGrid[ x-1 ][y].state == 0 ? 0 : 2;
            nextGrid[x][y].cluster = nextGrid[ x-1 ][y].cluster; 
            nextGrid[x][y].ry = nextGrid[ x-1 ][y].ry
            nextGrid[x][y].rx = nextGrid[ x-1 ][y].rx

            nextGrid[x][y].despawn = structuredClone(nextGrid[ x-1 ][y].despawn)
            }
         else {
         nextGrid[x][y].state = 0;
         nextGrid[x][y].cluster = 0;
         nextGrid[x][y].color = 0;

         }
      }
    }
  lastRowEmptyTile(); // test if there are more empty rows
  }

  function moveRightSide(rightEdge) { //this also could be one function, but does it even matter at this point...

      let offset = ySize - rightEdge.length
    
      for (let y = offset; y < ySize; y++) {
       for (let x = rightEdge[y - offset]; x < xSize; x++) {
    
            if (x+1 < xSize) {
    
                nextGrid[x][y].color = nextGrid[ x+1 ][y].color
                nextGrid[x][y].state = nextGrid[ x+1 ][y].state == 0 ? 0 : 2;
                nextGrid[x][y].cluster = nextGrid[ x+1 ][y].cluster; 
                nextGrid[x][y].ry = nextGrid[ x+1 ][y].ry
                nextGrid[x][y].rx = nextGrid[ x+1 ][y].rx
                nextGrid[x][y].despawn = structuredClone(nextGrid[ x+1 ][y].despawn)
                }
             else {    
             nextGrid[x][y].state = 0;
             nextGrid[x][y].cluster = 0;
             nextGrid[x][y].color = 0;
             }
          }
        }
      lastRowEmptyTile();
  }


    setTimeout(despawnUnmovable, 1600)
    difficulty(score,thisColor); //calcualte removes
    nextMatrix();
    gameOver();
    roundCorners();
    // gameOver(); //check  if its end of the game.
    if (score > 1) { highScore(score) } //calculate score
}  
   
function undo() {

    if (!gameoverBox.state && undoValues.valid) {

    Object.assign(difficulty.removal, undoValues) //target, source
    highScore.totalScore = undoValues.totalScore;
    writeScore.score = undoValues.writeScore;
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
}

function gameOver() {

  function setOver() {
      gameoverBox.state = 1; 
      
      if (makeGrid.colorTiles == 0) { gameoverText.text = "All clear!"; victory(); }
      else { gameoverText.text = "No more moves."; }
      //  gameoverText.text = makeGrid.colorTiles ? "No more moves." : "All clear!"
      }
  //nextGrid[0][0].state == 0 is fixing a bug where for a brief moment, while tiles are "loading in" makeGrid.colorTiles is zero, triggering game over and this is probably the worst way to fix it
  if ( (makeGrid.colorTiles == 0 && nextGrid[0][0].state == 0) || (difficulty.removal.value == 0 && nextMatrix.validClusterCount == makeGrid.colorTiles) ) { setOver(); return; }

    switch (difficulty.setting) {
    case 2:
    case 4: if ( nextMatrix.validClusterCount == makeGrid.colorTiles ) {

        for (let x = xSize - 1; x >= 0; x--) {
          for (let y = ySize - 1; y >= 0; y--) {

              
            if ((nextGrid[x][y].state == 2 || nextGrid[x][y].state == 3) && nextGrid[x][y].color == difficulty.removal.color ) { return }
            }} setOver(); break;
          } 
    }


}

function victory() {
/*
   function rnd(limit){ return Math.round(Math.random() * limit) }
 
   let rndtileX = 0//rnd(xSize-8) 
   let rndtileY = rnd(ySize-1)
 
   for (let r = 0 ; r < xSize; r++) { 
 
       nextGrid[rndtileY][rndtileX+r].size = tileSize;
       nextGrid[rndtileY][rndtileX+r].state = 5;
       }
 
   nextGrid[rndtileY][rndtileX].size = tileSize
   nextGrid[rndtileY][rndtileX].state = 6
 
  // console.log(nextGrid[randomtileY][randomtileX].state)
   nextGrid[randomtileY][randomtileX].size = tileSize;
   nextGrid[randomtileY][randomtileX].state = 6;
 
 //if (randomtileX+2 < xSize) { 
   nextGrid[randomtileY][randomtileX+1].size = tileSize-5; 
   nextGrid[randomtileY][randomtileX+1].state = 5;
   
   nextGrid[randomtileY][randomtileX+2].size = tileSize-10; 
   nextGrid[randomtileY][randomtileX+2].state = 5;
 
   nextGrid[randomtileY][randomtileX+3].size = tileSize-15; 
   nextGrid[randomtileY][randomtileX+3].state = 5;
 
 //if (randomtileY+2 < ySize) { 
  */
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
}


function gameOverClick(e) {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }

    if (gameoverBox.state == 2 && coords.x > x+38 && coords.y > y+16  && coords.x < x+118 && coords.y < y+57) {  //reset button on game over box

      setMenu.area = { x:x+38,y:y+16,sx:80,sy:41, state:1 } //reset button area
      
      gameoverBox.state = 3;
      newGame();
    
    }
    else if ( gameoverBox.state == 2 && coords.x > x-118 && coords.y > y+16  && coords.x < x-38 && coords.y < y+57  )  { //menu botton on game over box

      setMenu.area = { x:x-118,y:y+16,sx:80,sy:41, state:1 }

      settingsBox.state = 1; // 1 intro, 2 stay, 3 outro
      gameoverBox.state = 3; //gameover outro
    }
}

function clickBoxHelper() {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  //offsett
  let xo = -65
  let yo = -14

   //colorSlider = new slider(midX,midY-14)
   //difficultySlider = new slider(midX,midY+22)

  // size of the button
  let sx = 180;
  let sy = 25;

  ctx.fillStyle = "hsla(181,100%,48%,0.5)";
  ctx.fillRect( x+xo,  y+yo,  sx ,  sy ) // reset button
}

var startOffset, activeSlider; 

const getClosestSliderPosition = (xPos, range) => 
    range.reduce((acc, el) => {
    if (Math.abs(xPos - el) < Math.abs(xPos - acc)) { acc = el; }
    return acc;
  });

const getIndex = (arr, val) => arr.findIndex((x) => x == val);

function moveSlider(e) {

  let update = tileRoundness;
  let offset = e.clientX - canvas.offsetLeft + startOffset

//the most overcomplicated code for a simple problem so far:

  switch (activeSlider) {

    case 1: tileSizeSlider.x = getClosestSliderPosition(offset, tileSizeSlider.range); 
            newtileSize = tileSizeSteps[ getIndex(tileSizeSlider.range, tileSizeSlider.x) ] ; break;

    case 2: roundnessSlider.x = getClosestSliderPosition(offset, roundnessSlider.range);
            tileRoundness = roundnessSteps[ getIndex(roundnessSlider.range, roundnessSlider.x) ] ; 
            if (update != tileRoundness ) { //make sure to only update roundness when it actually changes
            roundCorners(); } break;

    case 3: colorSlider.x = getClosestSliderPosition(offset, colorSlider.range); 
           makeGrid.colors = getIndex(colorSlider.range, colorSlider.x) + 2 ; break;

    case 4: difficultySlider.x = getClosestSliderPosition(offset, difficultySlider.range );
            difficulty.setting = getIndex(difficultySlider.range, difficultySlider.x) + 1 ; break;
    }
  moveSlider.called = 1;
}

function sliderUp(e) {

if (moveSlider.called) {

  switch (activeSlider) {

     case 1: animeScale = animeScaleSteps[newtileSize];
             tileSize = newtileSize;
             setCanvasSize();
             nextGrid.length = ySize;
             setMenu();
             setTileRadius();
             tileRoundness = roundnessSteps[ getIndex(roundnessSlider.range, roundnessSlider.x) ];                 
     case 3: 
            undoValues.valid = 0;
            difficulty.removal = { value:0,color:0 } 
            highScore.totalScore = 0;
            writeScore.score = 0;
            resetTileCount();
            makeGrid();
            nextMatrix();
            roundCorners(); 
     break;
     case 4: difficulty(0,difficulty.removal.color); break;
     }  
  }
  canvas.removeEventListener('pointermove', moveSlider);
  canvas.removeEventListener('pointerup', sliderUp);
  moveSlider.called = 0;
}

function SliderSettings(e) {

  function assignEvent() {
    canvas.addEventListener('pointermove', moveSlider)
    canvas.addEventListener('pointerup', sliderUp)
  }

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }

     if(settingsBox.state == 2)  {

        if (coords.x > colorSlider.x && coords.y > colorSlider.y  && coords.x < colorSlider.x+100 && coords.y < colorSlider.y+25) {  //colors slider
                 
            assignEvent();
            startOffset = colorSlider.x - coords.x // need to calcualte the offset of the cursor on the slider box, so its snaps to a correct location 
            activeSlider = 3;
            }

        if (coords.x > difficultySlider.x && coords.y > difficultySlider.y  && coords.x < difficultySlider.x+100 && coords.y < difficultySlider.y+25) {

            assignEvent();
            startOffset = difficultySlider.x - coords.x        
            activeSlider = 4;
        }

        if (coords.x > roundnessSlider.x && coords.y > roundnessSlider.y  && coords.x < roundnessSlider.x+100 && coords.y < roundnessSlider.y+25) { 

            assignEvent();
            startOffset = roundnessSlider.x - coords.x        
            activeSlider = 2;
        }

        if (coords.x > tileSizeSlider.x && coords.y > tileSizeSlider.y  && coords.x < tileSizeSlider.x+100 && coords.y < tileSizeSlider.y+25) { 

            assignEvent();
            startOffset = tileSizeSlider.x - coords.x        
            activeSlider = 1;
        }  
  }
}

function settingsClick(e) {

  let x = ctx.canvas.width / 2
  let y = ctx.canvas.height / 2

  let coords = { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop }

     if(settingsBox.state == 2)  {

        if (coords.x > x-118 && coords.y > y+141  && coords.x < x-38 && coords.y < y+182  )  { //back button on settings box.

          setMenu.area = { x:x-118,y:y+141,sx:80,sy:41, state:1 }
          settingsBox.state = 3;
          assingEventListener("game");
          gameOver();
        }
        else if (coords.x > x+38 && coords.y > y+141  && coords.x < x+118 && coords.y < y+182  )  { //reset button on settings box.

          setMenu.area = { x:x+38,y:y+141,sx:80,sy:41, state:1 }

          settingsBox.state = 3;
          newGame();
        }
        else if (coords.x > x-98 && coords.y > y-38  && coords.x < x-57 && coords.y < y+3 )  { //difficulty setting down.

          if (difficulty.setting > 1) {
          setMenu.area = { x:x-98,y:y-38,sx:41,sy:41, state:1 }
          settings("difficulty",-1)
          }

        }
        else if (coords.x > x+57 && coords.y > y-38  && coords.x < x+98 && coords.y < y+3 )  { //difficulty setting up.

          if (difficulty.setting < 5) {
          setMenu.area = { x:x+57,y:y-38,sx:41,sy:41, state:1 }
          settings("difficulty",+1)
          }
        
        }
        else if (coords.x > x-98 && coords.y > y-140  && coords.x < x-57 && coords.y < y-99 )  { //color setting down.

          if (makeGrid.colors > 2) {
          setMenu.area = { x:x-98,y:y-140,sx:41,sy:41, state:1 }
          settings("colors",-1)
          }

        }
        else if (coords.x > x+57 && coords.y > y-140  && coords.x < x+98 && coords.y < y-99 )  { //color setting up.

          if (makeGrid.colors < 12) { //max amount of colors set here #maxcolors
          setMenu.area = { x:x+57,y:y-140,sx:41,sy:41, state:1 }
          settings("colors",+1)
          }
        
        }
        else if (coords.x > x-104 && coords.y > y+52  && coords.x < x+11 && coords.y < y+107 )  { //default button

          setMenu.area = { x:x-104,y:y+52,sx:115,sy:41, state:1 }  
          resetTiles(); //sigh
          }
    }
}

function clickConfirm() { //flashes a blue box over clicked button

        if (setMenu.area.state) {

        setMenu.area.state++

        ctx.fillStyle = "hsla(181,100%,48%,0.5)";
        ctx.fillRect( setMenu.area.x,  setMenu.area.y,  setMenu.area.sx ,  setMenu.area.sy ) // reset button
        
        if (setMenu.area.state > 5) { setMenu.area.state = 0; }
        
        }
}

function settings(id) {
  
    if (id === "difficulty") { difficulty(0,difficulty.removal.color); }
    if (id === "colors") {  

      undoValues.valid = 0  
      difficulty.removal = { value:0,color:0 } 
      highScore.totalScore = 0;
      writeScore.score = 0;
      resetTileCount();
      makeGrid();
      nextMatrix();
      roundCorners();
      }

    sessionStorage.setItem("difficulty", difficulty.setting);
    sessionStorage.setItem("colors", makeGrid.colors);
    sessionStorage.setItem("size", tileSize);
    sessionStorage.setItem("roundness", tileRoundness);
}

function checkSession() {

  if (sessionStorage.length) {

    difficulty.setting = parseInt(sessionStorage.getItem("difficulty"),10);
    makeGrid.colors = parseInt(sessionStorage.getItem("colors"),10);
    tileSize = parseInt(sessionStorage.getItem("size"),10);
    tileRoundness = parseInt(sessionStorage.getItem("roundness"),10);

    }
}

function newGame(done) { // formally known as reset tiles

    assingEventListener("none");
    undoValues.valid = 0
    difficulty.removal = { value:0,color:0 } 
    highScore.totalScore = 0;
    writeScore.score = 0;
    
   if ( makeGrid.colorTiles + makeGrid.whiteTiles + makeGrid.blackTiles > 0 ) {
    
   for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {

      if (nextGrid[x][y].state) { nextGrid[x][y].state = 5; }
      //else ( makeGrid.loadTiles-- )
      }}
    }
    else { done = 1 }
    
    if( done ) {
 
     resetTileCount();
     makeGrid();
     nextMatrix();
     roundCorners();
     }
}

  function resetTileCount() {
    nextMatrix.validClusterCount = 0;
//  makeGrid.totalTiles = 0;
    makeGrid.colorTiles = 0;
    makeGrid.whiteTiles = 0;
    makeGrid.blackTiles = 0;
  }

function resetTiles() { // formally known as default

  sessionStorage.clear();

  assingEventListener("none");

  undoValues.valid = 0;
  difficulty.removal = { value:0,color:0 } 

  difficulty.setting = 4;
  makeGrid.colors = 6;
  
  highScore.totalScore = 0;
  writeScore.score = 0;
  
  resetTileCount();
  makeGrid();
  nextMatrix();
  roundCorners();
}

window.onresize = function() {
    clearTimeout(resizeId);
    resizeId = setTimeout(doneResizing, 500);
}

function doneResizing() {

  // location.reload();
  assingEventListener("none");

  undoValues.valid = 0  
  difficulty.removal = { value:0,color:0 } 
  highScore.totalScore = 0;
  writeScore.score = 0;

  resetTileCount();
  setCanvasSize();
  setMenu();
  makeGrid(1); //dont generate new colors
  nextMatrix();
  roundCorners(); 
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

sessionStorage.clear(); //firefox mobile needs this.
setCanvasSize();
//setMenu(); //being called after fps is measured
makeGrid();
nextMatrix();
roundCorners();
MeasureFps();