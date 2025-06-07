var resizeHandle = document.getElementById('handle');
var box = document.getElementById('box');
var gameFrame = document.getElementById('gameFrame');
var bg = document.getElementById('bg')
var start, scaleunit, percent = 19;

if (window.innerWidth >= 1400) { startResizing.xs = 1350 }
else if ( window.innerWidth < 351 ) { startResizing.xs = 350 }
else { startResizing.xs = (Math.trunc(window.innerWidth / 50) * 50) - 50 }

if (window.innerHeight >= 750) { startResizing.ys = 725 }
else if ( window.innerHeight < 506 ) { startResizing.ys = 505 }
else { startResizing.ys = (Math.trunc(window.innerHeight / 50) * 50) - 50}

gameFrame.width = startResizing.xs
gameFrame.height = startResizing.ys

box.style.width = startResizing.xs + 'px'
box.style.height = 25 + startResizing.ys + 'px'

box.style.left = (window.innerWidth / 2 - startResizing.xs / 2) + 'px' 
box.style.top = (window.innerHeight / 2 - (startResizing.ys + 25) / 2) + 'px' 

resizeHandle.addEventListener('pointerdown', initialiseResize);
bg.addEventListener('pointerdown', movebg);

function movebg(e) {

  start = e.clientY;
  scaleunit = Math.trunc(window.innerHeight / 100)

  window.addEventListener('pointermove', startDrag);
    window.addEventListener('pointerup', stopDrag);
}

function initialiseResize(e) {
  e.stopPropagation()
  window.addEventListener('pointermove', startResizing);
    window.addEventListener('pointerup', stopResizing);
}

function startDrag(e) { //make gradient dragable at Y axes

    let delta = start - e.clientY
    start = e.clientY;
    gameFrame.style.pointerEvents = 'none'
//  percent = 100 - (Math.trunc((e.clientY / window.innerHeight) * 100))

    percent += delta / scaleunit;
    percent = percent > 100 ? 100 : percent;  
    percent = percent <  -10 ? -10 : percent; 

    bg.style.background = 'linear-gradient(30deg, rgba(78,153,194,1) 0%, rgba(78,153,194,1)' + percent + '%, rgba(36,75,110,1) '+ (percent + 10) + '%, rgba(36,75,110,1) 100%)'
}

function stopDrag(e) {

    gameFrame.style.pointerEvents = 'auto'
    window.removeEventListener('pointermove', startDrag);
    window.removeEventListener('pointerup', stopDrag);
    
}

function startResizing(e) {

  gameFrame.style.pointerEvents='none';

  let xs = e.clientX - box.offsetLeft;
  let ys = e.clientY - box.offsetTop;
  
   startResizing.xs = (Math.trunc(xs / 50) * 50) + 50; 
   startResizing.ys = (Math.trunc(ys / 50) * 50) + 50; 

   //max size
   if  (startResizing.xs > window.innerWidth) { startResizing.xs = window.innerWidth }
   if  (startResizing.ys > window.innerHeight) { startResizing.ys = window.innerHeight }

   //min size
   if  (startResizing.xs < 351) { startResizing.xs = 350 }
   if  (startResizing.ys < 506) { startResizing.ys = 505 }

   box.style.width = startResizing.xs + 'px'
   box.style.height = startResizing.ys + 'px'
      
   box.style.left = (window.innerWidth / 2 - startResizing.xs / 2) + 'px'
   box.style.top = (window.innerHeight / 2 - startResizing.ys / 2) + 'px' 
  
  }

function stopResizing(e) {

    window.removeEventListener('pointermove', startResizing);
    window.removeEventListener('pointerup', stopResizing);

    gameFrame.width = startResizing.xs;
    gameFrame.height = startResizing.ys - 25;

    gameFrame.style.pointerEvents='auto';
    gameFrame.contentWindow.location.reload(true); //only works online cause of cross origin bs
}

window.onresize = function() {

  box.style.left = (window.innerWidth / 2 - startResizing.xs / 2) + 'px' 
  box.style.top = (window.innerHeight / 2 - (startResizing.ys + 25) / 2) + 'px' 
}
//make sure iframe only loads when html rendered.

gameFrame.src = 'gameField.html';