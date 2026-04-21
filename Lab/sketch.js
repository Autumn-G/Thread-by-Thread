/*
 * Autumn Gilmore
 * gilmore.au@northeastern.edu
 * ARTG-2262: Prototyping with Code
 * Lab #06 | Final Project — Prototype
 * Thread by Thread
 * UP arrow = warp over, DOWN arrow = weft over
 * R to reset
 */

// grid size + spacing
let CELL;
const COLS = 8;
const ROWS = 8;

// padding so labels don't get cut off plus space for the panel (key + photo + close-up diagram)
let PAD_L;
let PAD_T;
let PAD_X;
let PANEL_W;
let PANEL_X;
const GAP = 40;

let curRow = 0;
let curCol = 0;
let grid = [];
let woven = [];

let selectedWeave = "plain";
let sel;

//font
let myFont;

//diagram + texture images
let imgPlainTexture, imgPlainDiagram;
let imgBasketTexture, imgBasketDiagram;
let img2x2TwillTexture, img2x2TwillDiagram;
let imgHerringTexture, imgHerringDiagram;
let img5SatinTexture, img5SatinDiagram;
let img8SatinTexture, img8SatinDiagram;

// for the red flash on wrong guess
let flashCol = -1;
let flashColor = null;
let flashTimer = 0;

function preload(){
  myFont = loadFont("CormorantGaramond-VariableFont_wght.ttf");
  imgPlainTexture  = loadImage('Plain Texture.webp');
  imgPlainDiagram  = loadImage('Plain.png');
  
  imgBasketTexture  = loadImage('Basketweave Texture.jpg');
  imgBasketDiagram  = loadImage('Basketweave.png');
  
  img2x2TwillTexture  = loadImage('Twill Texture.webp');
  img2x2TwillDiagram  = loadImage('2x2 Twill.png');
  
  imgHerringTexture  = loadImage('Herringbone Texture.jpg');
  imgHerringDiagram  = loadImage('Herringbone.png');
  
  img5SatinTexture  = loadImage('5 Satin Texture.jpg');
  img5SatinDiagram  = loadImage('5-End Satin.png');
  
  img8SatinTexture  = loadImage('8 Satin Texture.jpg');
  img8SatinDiagram  = loadImage('8-End Satin.png');

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(myFont);
  calcLayout();
  
  sel = createSelect();
  sel.position(PAD_L, PAD_T - 50);
  sel.option('— Plain —', 'header_plain');
  sel.option('Plain (1x1)', 'plain');
  sel.option('Basket (2x2)', 'basket');
  sel.option('— Twill —', 'header_twill');
  sel.option('2x2 Twill', 'twill');
  sel.option('Herringbone', 'herring');
  sel.option('— Satin —', 'header_satin');
  sel.option('5-End Satin', 'satin5');
  sel.option('8-End Satin', 'satin8');
  
  
  sel.changed(() => {
    let val = sel.value();
    if (val.startsWith('header')) return;
    selectedWeave = val;
    resetGrid();
  });

  resetGrid();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcLayout();
  if (sel) sel.position(PAD_L, PAD_T - 50);
}

function calcLayout() {
  CELL = floor(min(windowWidth*0.055, windowHeight*0.09))
  PANEL_W = floor(windowWidth*0.18);
  let totalW = COLS * CELL + GAP + PANEL_W;
  PAD_L = (windowWidth - totalW) / 2;
  PAD_T = (windowHeight - ROWS * CELL) / 2;
  PANEL_X = PAD_L + COLS * CELL + GAP;
}

// clears everything and starts over
function resetGrid() {
  grid = [];
  woven = [];
  for (let r = 0; r < ROWS; r++) {
    grid.push(new Array(COLS).fill(null));
    woven.push(false);
  }
  curRow = 0;
  curCol = 0;
  flashCol = -1;
}

// returns true if warp goes over, false if weft goes over
function weaveRule(r, c) {
  if (selectedWeave === "plain") {
    return (r + c) % 2 === 0;
  }
  if (selectedWeave === "basket") {
    return (floor(r / 2) + floor(c / 2)) % 2 === 0;
  }
  if (selectedWeave === 'twill') {
    return (c + r) % 4 < 2;
  }
  if (selectedWeave === 'herring') {
    let half = floor(COLS / 2);
    let mirrorC = c < half ? c : COLS - 1 - c;
    return (mirrorC + r) % 4 < 2;
  }
  if (selectedWeave === 'satin5') {
    return (c + r * 2) % 5 !== 0;
  }
  if (selectedWeave === 'satin8') {
    return (c + r * 3) % 8 !== 0;
  }
}

function draw() {
  background(245, 242, 238);

  // draw warp threads going down through unwoven rows
  stroke(80, 58, 38);
  strokeWeight(3.5);
  for (let c = 0; c < COLS; c++) {
    let x = PAD_L + c * CELL + CELL / 2;
    let yTop = PAD_T + curRow * CELL;
    let yBot = PAD_T + ROWS * CELL;
    if (yTop < yBot) {
      line(x, yTop, x, yBot);
    }
  }
  noStroke();

  // fill in completed rows
  for (let r = 0; r < ROWS; r++) {
    if (!woven[r]) continue;
    for (let c = 0; c < COLS; c++) {
      let x = PAD_L + c * CELL;
      let y = PAD_T + r * CELL;
      // dark = warp over, light = weft over
      if (grid[r][c]) {
        fill(80, 58, 38);
      } else {
        fill(205, 178, 140);
      }
      rect(x + 1, y + 1, CELL - 2, CELL - 2, 2);
    }
  }

  // draw the row currently being woven
  if (!isComplete()) {
    let y = PAD_T + curRow * CELL + CELL / 2;

    // horizontal weft thread
    stroke(170, 110, 50);
    strokeWeight(4);
    if (curCol > 0) {
      line(PAD_L, y, PAD_L + curCol * CELL + CELL / 2, y);
    }
    noStroke();

    // fill in cells already decided in this row
    for (let c = 0; c < curCol; c++) {
      let x = PAD_L + c * CELL;
      let warpOver = grid[curRow][c];

      if (flashTimer > 0 && flashCol === c) {
        fill(flashColor);
      } else if (warpOver) {
        fill(80, 58, 38);
      } else {
        fill(205, 178, 140);
      }
      rect(x + 1, PAD_T + curRow * CELL + 1, CELL - 2, CELL - 2, 2);

      // redraw warp thread on top if it's supposed to be over
      if (warpOver) {
        stroke(80, 58, 38);
        strokeWeight(4);
        let cx = x + CELL / 2;
        line(
          cx,
          PAD_T + curRow * CELL + 2,
          cx,
          PAD_T + curRow * CELL + CELL - 2
        );
        noStroke();
      }
    }

    // current intersection — flash red if wrong, otherwise gold box
    let bx = PAD_L + curCol * CELL;
    let by = PAD_T + curRow * CELL;
    if (flashTimer > 0 && flashCol === curCol) {
      fill(flashColor);
      rect(bx + 1, by + 1, CELL - 2, CELL - 2, 2);
    } else {
      stroke(220, 160, 60);
      strokeWeight(2);
      noFill();
      rect(bx + 2, by + 2, CELL - 4, CELL - 4, 2);
      noStroke();
    }
  }

  // grid lines
  stroke(190, 178, 165);
  strokeWeight(0.5);
  for (let r = 0; r <= ROWS; r++) {
    line(PAD_L, PAD_T + r * CELL, PAD_L + COLS * CELL, PAD_T + r * CELL);
  }
  for (let c = 0; c <= COLS; c++) {
    line(PAD_L + c * CELL, PAD_T, PAD_L + c * CELL, PAD_T + ROWS * CELL);
  }
  noStroke();

  // column numbers along top
  textSize(16);
  fill(100, 88, 78);
  textAlign(CENTER, CENTER);
  for (let c = 0; c < COLS; c++) {
    text(c + 1, PAD_L + c * CELL + CELL / 2, PAD_T - 16);
  }

  // row numbers + arrow for current row
  textAlign(RIGHT, CENTER);
  for (let r = 0; r < ROWS; r++) {
    let y = PAD_T + r * CELL + CELL / 2;
    text(r + 1, PAD_L - 28, y);
    if (r === curRow && !isComplete()) {
      fill(170, 110, 50);
      textStyle(BOLD);
      text("→", PAD_L - 10, y);
      textStyle(NORMAL);
      fill(100, 88, 78);
    }
  }

  // instructions at bottom
  textSize(16);
  textAlign(LEFT);
  if (isComplete()) {
    fill(80, 150, 90);
    text("Weave complete! Press R to reset.", PAD_L, PAD_T + ROWS * CELL + 30);
  } else {
    fill(100);
    text(
      "↑ warp over   ↓ weft over   R = reset",
      PAD_L,
      PAD_T + ROWS * CELL + 30
    );
  }

  drawPanel();
  if (flashTimer > 0) flashTimer--;
}

function keyPressed() {
  if (key === "r" || key === "R") {
    resetGrid();
    return;
  }

  if (isComplete()) return;

  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    let guessWarpOver = keyCode === UP_ARROW;
    let correct = weaveRule(curRow, curCol);

    if (guessWarpOver === correct) {
      // correct — save and move on
      grid[curRow][curCol] = correct;
      curCol++;
      if (curCol >= COLS) {
        woven[curRow] = true;
        curRow++;
        curCol = 0;
      }
    } else {
      // wrong — flash red, stay here
      flashCol = curCol;
      flashColor = color(210, 70, 60);
      flashTimer = 18;
    }
  }
  return false; //stops the browser from scrolling
}

function isComplete() {
  return curRow >= ROWS;
}

function getImages() {
  if (selectedWeave === 'plain') {
    return { texture: imgPlainTexture, diagram: imgPlainDiagram };
  }
  if (selectedWeave === 'basket') {
    return { texture: imgBasketTexture, diagram: imgBasketDiagram };
  }
  if (selectedWeave === 'twill') {
    return { texture: img2x2TwillTexture, diagram: img2x2TwillDiagram };
  }
  if (selectedWeave === 'herring') {
    return { texture: imgHerringTexture, diagram: imgHerringDiagram };
  }
  if (selectedWeave === 'satin5') {
    return { texture: img5SatinTexture, diagram: img5SatinDiagram };
  }
  return { texture: img8SatinTexture, diagram: img8SatinDiagram };
}

function drawPanel() {
  let x = PANEL_X;
  let y = PAD_T;

  // key section
  textSize(15);
  fill(100, 88, 78);
  textAlign(LEFT, TOP);
  text("KEY", x, y - 5);

  fill(80, 58, 38);
  noStroke();
  rect(x, y + 16, 16, 16, 2);
  fill(100, 88, 78);
  textSize(15);
  text("warp over  ↑", x + 22, y + 14);

  fill(205, 178, 140);
  stroke(190, 178, 165);
  strokeWeight(0.5);
  rect(x, y + 40, 16, 16, 2);
  noStroke();
  fill(100, 88, 78);
  text("weft over  ↓", x + 22, y + 38);

  // divider
  stroke(210, 200, 190);
  strokeWeight(0.5);
  line(x, y + 70, x + PANEL_W, y + 70);
  noStroke();

  // photo placeholder
  fill(100, 88, 78);
  textSize(13);
  textAlign(LEFT, TOP);
  text("REAL LIFE TEXTURE", x, y + 82);

  let imgs = getImages();
  if (imgs.texture) {
    image(imgs.texture, x, y + 102, PANEL_W, PANEL_W * 0.72);
  } else {
    fill(232, 226, 218);
    noStroke();
    rect(x, y + 102, PANEL_W, PANEL_W * 0.72, 4);
}

  // divider
  stroke(210, 200, 190);
  strokeWeight(0.5);
  line(
    x,
    y + 102 + PANEL_W * 0.72 + 14,
    x + PANEL_W,
    y + 102 + PANEL_W * 0.72 + 14
  );
  noStroke();

  // diagram placeholder
  let diagY = y + 102 + PANEL_W * 0.72 + 26;
  fill(100, 88, 78);
  textSize(13);
  textAlign(LEFT, TOP);
  text("DIAGRAM CLOSEUP", x, diagY);

if (imgs.diagram) {
  image(imgs.diagram, x, diagY + 20, PANEL_W, PANEL_W * 0.72);
} else {
  fill(232, 226, 218);
  noStroke();
  rect(x, diagY + 20, PANEL_W, PANEL_W * 0.72, 4);
  }
} 