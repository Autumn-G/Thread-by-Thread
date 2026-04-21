/*
 * Autumn Gilmore
 * gilmore.au@northeastern.edu
 * ARTG-2262: Prototyping with Code
 * Lab #06 | Final Project — Home Page
 * Thread by Thread
 */

// card carousel
const weaves = [
  {
    name: 'Plain',
    img: null,           // replace with loadImage('images/plain.jpg')
    color: [180, 160, 130],
    characteristics: 'The most fundamental weave structure, formed by each weft thread passing alternately over and under each warp thread. The tight, consistent interlacing creates a stable, balanced fabric with a matte finish.',
    derivatives: 'Basket weave, rib weave, and hopsack',
    applications: 'Because of its lightweight and breathable structure, plain weave is well suited for dresses, blouses, shirting, and bed linens.',
  },
  {
    name: 'Twill',
    img: null,
    color: [100, 85, 65],
    characteristics: 'Formed by passing the weft thread over two or more warp threads before going under, with each row offset by one, creating the signature diagonal rib. The reduced interlacing points give twill fabrics better drape and flexibility.',
    derivatives: 'Herringbone, denim twill, and gabardine',
    applications: 'The durability and drape make it a go-to for casual pants, tailored suits, and outerwear.',
  },
  {
    name: 'Satin',
    img: null,
    color: [140, 120, 100],
    characteristics: 'Warp threads float over multiple weft threads before interlacing, spacing out the crossing points and leaving a largely uninterrupted surface. This produces a smooth, soft fabric with a natural sheen and fluid drape.',
    derivatives: '8-end satin, barathea, and charmeuse',
    applications: 'Silk satin is commonly used for eveningwear and linings, cotton sateen for bedding, and acetate satin for formal and bridal wear.',
  }
];

// general info text
const generalInfo1 = 'At the foundation of every woven fabric are three weave structures: plain, twill, and satin. Every other weave is a variation of one of these three, achieved through different color arrangements, changes in yarn density or fiber type, or structural derivatives like hopsack, which is simply a double plain weave.';

const generalInfo2 = 'Every woven fabric is built from two sets of threads: warp threads, which run vertically, and weft threads, which run horizontally. The pattern in which these threads pass over and under each other determines the weave structure, and that structure is what gives a fabric its character. Different weaves produce fabrics with distinct properties, shaping everything from how a garment drapes and breathes to how durable and textured it feels.';

// carousel state
let centerIndex = 1;   // center card
let expanded = false;  // card expanded
let expandedIndex = -1;

// card dimensions
let CARD_W, CARD_H;
let CENTER_X, CENTER_Y;
let CARD_GAP;

// expanded panel
let panelW = 0;        // animates from 0 to target
let panelTargetW = 0;

// arrow button positions
let leftArrowX, rightArrowX, arrowY;

// card x positions (animated with lerp)
let cardX = [];
let cardTargetX = [];

// images (loaded in preload)
let imgs = [];

// font
let myFont;

function preload() {
myFont = loadFont("CormorantGaramond-VariableFont_wght.ttf");
imgs[0] = loadImage('Plain Weave.png');
imgs[1] = loadImage('Twill Weave.png');
imgs[2] = loadImage('Satin Weave.png');
}

function setup() {
  createCanvas(windowWidth, 950);
  textFont(myFont);
  calcLayout();
  initCardPositions();
}

function windowResized() {
  resizeCanvas(windowWidth, 950);
  calcLayout();
  initCardPositions();
}

function calcLayout() {
  CARD_W   = floor(windowWidth * 0.18);
  CARD_H   = floor(CARD_W * 1.3);
  CARD_GAP = floor(windowWidth * 0.04);
  CENTER_X = windowWidth / 2;
  CENTER_Y = 950 * 0.12 + CARD_H / 2 + 60;

  leftArrowX  = CENTER_X - CARD_W * 1.5 - CARD_GAP - 40;
  rightArrowX = CENTER_X + CARD_W * 1.5 + CARD_GAP + 40;
  arrowY      = CENTER_Y;

  panelTargetW = windowWidth * 0.62;
}

function initCardPositions() {
  // set initial x targets for each card relative to center
  for (let i = 0; i < 3; i++) {
    let offset = (i - centerIndex) * (CARD_W + CARD_GAP);
    cardTargetX[i] = CENTER_X + offset;
    cardX[i] = cardTargetX[i];
  }
}

function updateCardTargets() {
  for (let i = 0; i < 3; i++) {
    let offset = (i - centerIndex) * (CARD_W + CARD_GAP);
    cardTargetX[i] = CENTER_X + offset;
  }
}

function draw() {
  background(245, 242, 238);

  // title
  fill(58, 46, 36);
  noStroke();
  textSize(floor(windowWidth * 0.018));
  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  text('THREAD BY THREAD', CENTER_X, 950 * 0.07);

  textSize(floor(windowWidth * 0.011));
  fill(120, 108, 96);
  text('select a weave family to explore', CENTER_X, 950 * 0.07 + floor(windowWidth * 0.022));

  // animate card positions
  for (let i = 0; i < 3; i++) {
    cardX[i] = lerp(cardX[i], cardTargetX[i], 0.12);
  }

  // animate panel width
  panelW = lerp(panelW, expanded ? panelTargetW : 0, 0.14);

  // draw cards (back to front so center is on top)
  let drawOrder = [0, 2, 1]; // draw side cards first, center last
  // reorder so centerIndex draws last
  drawOrder = [];
  for (let i = 0; i < 3; i++) {
    if (i !== centerIndex) drawOrder.push(i);
  }
  drawOrder.push(centerIndex);

  for (let di = 0; di < drawOrder.length; di++) {
    let i = drawOrder[di];
    let isCenter = (i === centerIndex);
    let cardScale    = isCenter ? 1.0 : 0.78;
    let cw       = CARD_W * cardScale;
    let ch       = CARD_H * cardScale;
    let cx       = cardX[i];
    let cy       = CENTER_Y;
    let alpha    = isCenter ? 255 : 160;

    // card background (image or color placeholder)
      fill(weaves[i].color[0], weaves[i].color[1], weaves[i].color[2], alpha);
      noStroke();
      rect(cx - cw / 2, cy - ch / 2, cw, ch, 6);

    // dark overlay so text is readable
    fill(0, 0, 0, isCenter ? 90 : 120);
    noStroke();
    rect(cx - cw / 2, cy - ch / 2, cw, ch, 6);

    // weave name on card
    fill(255, 255, 255, alpha);
    textAlign(CENTER, CENTER);
    textSize(floor(cw * 0.18));
    textStyle(BOLD);
    text(weaves[i].name.toUpperCase(), cx, cy);
    textStyle(NORMAL);
  }

  // draw expanded panel if open
  if (panelW > 10) {
    drawExpandedPanel();
  }

  // draw arrows (on top of everything)
  if (!expanded) {
    drawArrow(leftArrowX, arrowY, '←');
    drawArrow(rightArrowX, arrowY, '→');
  }

  // general info section
  drawGeneralInfo();
}

function drawGeneralInfo() {
  let sectionY = CENTER_Y + CARD_H / 2 + 50;
  let sectionW = windowWidth * 0.52;
  let sectionX = CENTER_X - sectionW / 2;

  // section heading
  fill(120, 108, 96);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(15);
  textStyle(BOLD);
  text('ABOUT WEAVING', sectionX, sectionY);
  textStyle(NORMAL);

  // divider
  stroke(210, 200, 190);
  strokeWeight(0.5);
  line(sectionX, sectionY + 25, sectionX + sectionW, sectionY + 25);
  noStroke();

  // general info text
  fill(80, 65, 50);
  textSize(14);
  textAlign(LEFT, TOP);
  textLeading(20);
  text(generalInfo1, sectionX, sectionY + 33, sectionW, 80);
  text(generalInfo2, sectionX, sectionY + 110, sectionW, 80);

  // experiment button
  let btnW = 160;
  let btnH = 42;
  let btnX = CENTER_X - btnW / 2;
  let btnY = sectionY + 250;

  // hover effect
  let hovering = mouseX > btnX && mouseX < btnX + btnW &&
                 mouseY > btnY && mouseY < btnY + btnH;

  fill(hovering ? color(80, 58, 38) : color(58, 46, 36));
  noStroke();
  rect(btnX, btnY, btnW, btnH, 4);

  fill(245, 242, 238);
  textAlign(CENTER, CENTER);
  textSize(17);
  textStyle(BOLD);
  text('EXPERIMENT →', btnX + btnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  // store button bounds for click detection
  _btnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
}

// store button bounds so mousePressed can access them
let _btnBounds = null;

function drawArrow(x, y, label) {
  fill(80, 65, 50, 180);
  noStroke();
  ellipse(x, y, 44, 44);
  fill(245, 242, 238);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(label, x, y - 3);
}

function drawExpandedPanel() {
  let w = panelTargetW;
  let i = expandedIndex;
  let px = CENTER_X - w / 2;
  let py = CENTER_Y - CARD_H / 2 - 20;
  let ph = CARD_H + 40;

  // clip to animated width
  let drawW = panelW;

  // panel background
  fill(58, 46, 36, 240);
  noStroke();
  rect(px, py, drawW, ph, 10);

  // only draw content once panel is mostly open
  if (panelW < panelTargetW * 0.5) return;
  let alpha = map(panelW, panelTargetW * 0.5, panelTargetW, 0, 255);

  // left side — weave diagram (card expanded)
let imgW = drawW * 0.42;
let imgH = ph - 48;
if (imgs[i]) {
  // fit image inside box while keeping proportions
  let imgRatio = imgs[i].width / imgs[i].height;
  let boxRatio = imgW / imgH;
  let drawW, drawH, drawX, drawY;

  if (imgRatio > boxRatio) {
    // image is wider than box — fit to width
    drawW = imgW;
    drawH = imgW / imgRatio;
    drawX = px + 20;
    drawY = py + 24 + (imgH - drawH) / 2;
  } else {
    // image is taller than box — fit to height
    drawH = imgH;
    drawW = imgH * imgRatio;
    drawX = px + 20 + (imgW - drawW) / 2;
    drawY = py + 24;
  }
  image(imgs[i], drawX, drawY, drawW, drawH);
}

  // right side — text info
  let tx = px + imgW + 40;
  let ty = py + 30;
  let tw = drawW - imgW - 60;

  // weave name
  fill(245, 242, 238, alpha);
  textAlign(LEFT, TOP);
  textSize(floor(ph * 0.1));
  textStyle(BOLD);
  text(weaves[i].name.toUpperCase(), tx, ty);
  textStyle(NORMAL);

  // divider
  stroke(180, 160, 130, alpha * 0.5);
  strokeWeight(0.5);
  line(tx, ty + floor(ph * 0.12) + 6, tx + tw, ty + floor(ph * 0.12) + 6);
  noStroke();

  let infoY = ty + floor(ph * 0.12) + 18;
  let lineH  = floor(ph * 0.065);

  fill(180, 165, 148, alpha);
  textSize(16);
  textAlign(LEFT, TOP);
  text('STRUCTURAL CHARACTERISTICS', tx, infoY);
  fill(230, 222, 210, alpha);
  textSize(15);
  infoY += 25;
  text(weaves[i].characteristics, tx, infoY, tw, lineH * 2.5);

  infoY += lineH * 3.5;
  fill(180, 165, 148, alpha);
  textSize(16);
  text('KEY DERIVATIVES', tx, infoY);
  fill(230, 222, 210, alpha);
  textSize(15);
  infoY += 25;
  text(weaves[i].derivatives, tx, infoY, tw, lineH);

  infoY += lineH * 1.9;
  fill(180, 165, 148, alpha);
  textSize(16);
  text('APPAREL APPLICATIONS', tx, infoY);
  fill(230, 222, 210, alpha);
  textSize(15);
  infoY += 25;
  text(weaves[i].applications, tx, infoY, tw, lineH * 4);
  
}

function mousePressed() {
  // experiment button
  if (_btnBounds) {
    let b = _btnBounds;
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      window.location.href = 'https://autumn-g.github.io/Thread-by-Thread/Lab/index.html';
      return;
    }
  }

  // if panel is open and click is outside it — close
  if (expanded) {
    let px = CENTER_X - panelTargetW / 2;
    let py = CENTER_Y - CARD_H / 2 - 20;
    let ph = CARD_H + 40;
    if (mouseX < px || mouseX > px + panelTargetW || mouseY < py || mouseY > py + ph) {
      expanded = false;
      return;
    }

    return;
  }

  // left arrow
  if (dist(mouseX, mouseY, leftArrowX, arrowY) < 26) {
    centerIndex = (centerIndex - 1 + 3) % 3;
    updateCardTargets();
    return;
  }

  // right arrow
  if (dist(mouseX, mouseY, rightArrowX, arrowY) < 26) {
    centerIndex = (centerIndex + 1) % 3;
    updateCardTargets();
    return;
  }

  // click center card to expand
  let cx = cardX[centerIndex];
  let cy = CENTER_Y;
  if (mouseX > cx - CARD_W / 2 && mouseX < cx + CARD_W / 2 &&
      mouseY > cy - CARD_H / 2 && mouseY < cy + CARD_H / 2) {
    expanded      = true;
    expandedIndex = centerIndex;
  }
}
