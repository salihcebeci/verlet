
const NUM_PARTICLES = 0;
const SIZE = 5;
const SIZE_D2 = SIZE / 2.0;
const STEPS = 4;

const TTYPE_DRAG = 0;
const TTYPE_TRIANGLE = 1;
const TTYPE_SQUARE = 2;

const GRID_SIZE = 40;

var grid_w, grid_h;
var grid = null;

var particles = null;
var constraints = null;
var bodies = null;
var physics = null;

var initGravityX = 0;
var initGravityY = 0.1;
var gravity = null;

var pointDragging = false;
var dragDist = 150;
var currP = null;
var delta = null;

var drawFill = true;
var drawPoints = false;
var showDebugText = true;
var mouseInsideSketch = true;
var demoType = 'CLOTH';
var isPaused = false;
var toolType = TTYPE_DRAG;

let clothWidth = 25;
let clothHeight = 20;
let clothSpacing = 16;
let clothConstraintLength = 20;
let clothAttachPoints = 2;

let clothXMargin = null;

let webPoints = 40;
let webRings = 12;
let webSize = 200;
let webSpacing = 12;
let angleStep = 0.5;

let canTear = false;
let tearMult = 5;
let tearStr = clothConstraintLength * tearMult;
let tearStrSq = tearStr * tearStr;

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("#sketch");
	canvas.attribute('oncontextmenu', 'return false;');
	init();
	initSettingsUI();
}

function init() {
	grid = []
	particles = [];
	constraints = [];
	bodies = [];
	physics = new Physics();

	gravity = createVector(initGravityX, initGravityY);
	
	clothXMargin = (width - (clothWidth * clothSpacing)) / 2;
	
	// createSpiderWebSim();
	createClothSim();
	
	// Random particles
	for (let i = 0; i < NUM_PARTICLES; i++) {
		let p = new Particle(random() * width, random() * height);
		p.px += random() * 2 - 1;
		p.py += random() * 2 - 1;
		particles.push(p);
	}

	constrainPoints();

}

function draw() {
	
	background(125);
	
	updateParticles();
	for (let i = 0; i < STEPS; i++) {
		updateConstraints();

		for (let body1 of bodies) {
			body1.calculateBBox();

			for (let body2 of bodies) {
				if (body1 === body2)
					continue;

				if (physics.detectCollision(body1, body2))
					physics.processCollision();
			}
		}

		constrainPoints();
	}
	
	buildGrid();
	
	if (pointDragging) {
		if (currP) {
			currP.x = mouseX;
			currP.y = mouseY;
		} else {
			currP = getParticleAt(mouseX, mouseY);
		}
	} else {
		currP = null;
	}

	stroke(100);
	for (let x = 0; x < grid_w; x++) {
		line(x * GRID_SIZE, 0, x * GRID_SIZE, height);
	}
	for (let y = 0; y < grid_h; y++) {
		line(0, y * GRID_SIZE, width, y * GRID_SIZE);
	}
	
	if (drawFill) {
		for (let i = 0; i < bodies.length; i++) {
			let body = bodies[i];
			fill((i * 10) % 255, (i * 5) % 255, (254 - i * 5) % 255);
			beginShape();
			for (let point of body.vertices) {
				vertex(point.x, point.y);
			}
			endShape();
		}
	}
	
	// Draw the constraints
	stroke(0);
	for (let i = 0; i < constraints.length; i++) {
		let c = constraints[i];
		line(c.p1.x, c.p1.y, c.p2.x, c.p2.y);
	}
	noStroke();

	// Draw the points
	if (drawPoints) {
		fill(255, 255, 0);
		for (let i = 0; i < particles.length; i++) {
			rect(particles[i].x - SIZE_D2, particles[i].y - SIZE_D2,  SIZE, SIZE);
		}
	}

	if (showDebugText) {
		fill(255);
		text('Particles: ' + particles.length + ' | Constraints: ' + constraints.length, 12, 12);
		text('Gravity: ' + gravity.x + ', ' + gravity.y, 12, 24);
		text('FPS: ' + frameRate(), 12, 38);
		text('Delta: ' + deltaTime, 12, 50);
		text('Dragging: ' + pointDragging, 12, 64);
	}
}

function mousePressed() {
	if (!mouseInsideSketch ||
		mouseX < 0 || mouseX >= width ||
		mouseY < 0 || mouseY >= height)
		return;
	
	if (toolType == TTYPE_DRAG) {
		pointDragging = true;
	} else if (toolType == TTYPE_TRIANGLE) {
		createTriangle(mouseX, mouseY, 25 + random(100));
	} else if (toolType == TTYPE_SQUARE) {
		createBox(mouseX, mouseY, 25 + random(100));
	}

	if (isPaused)
		redraw();
	// let p = new Particle(mouseX, mouseY);
	// p.px += random() * 2 - 1;
	// p.py += random() * 2 - 1;
	// constraints.push(new Constraint(particles[particles.length - 1], p, random() * 10 + 10));
	// particles.push(p);
}

function mouseDragged() {
	if (!mouseInsideSketch ||
		mouseX < 0 || mouseX >= width ||
		mouseY < 0 || mouseY >= height)
		return;

	if (toolType == TTYPE_DRAG) {
		pointDragging = true;
	}
}

function mouseReleased() {
	mouseInsideSketch = true;
	pointDragging = false;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	buildGrid();
}

function buildGrid() {
	grid = [];
	grid_w = Math.ceil(width / GRID_SIZE);
	grid_h = Math.ceil(height / GRID_SIZE);
	
	for (let i = 0; i < grid_w * grid_h; i++)
		grid.push([]);
	
	for (let i = 0; i < particles.length; i++) {
		let cx = floor(particles[i].x / GRID_SIZE);
		let cy = floor(particles[i].y / GRID_SIZE);
		if (cx < 0 || cx >= grid_w || cy < 0 || cy >= grid_h)
			continue;
		grid[cx + cy * grid_w].push(particles[i]);
	}
}

function getParticleAt(x, y) {
	let cx = floor(x / GRID_SIZE);
	let cy = floor(y / GRID_SIZE);
	
	for (let x0 = cx - 1; x0 < cx + 1; x0++) {
		for (let y0 = cy - 1; y0 < cy + 1; y0++) {
			if (x0 < 0 || x0 >= grid_w || y0 < 0 || y0 >= grid_h)
				continue;

			let cell = grid[x0 + y0 * grid_w];
			for (let i = 0; i < cell.length; i++) {
				let pDistX = (cell[i].x - x);
				let pDistY = (cell[i].y - y);
				if (pDistX * pDistX + pDistY * pDistY < dragDist)
					return cell[i];
			}
		}
	}
	return null;
}

function updateParticles() {
	for (let i = 0; i < particles.length; i++) {
		let p = particles[i];
		let old_x = p.x;
		let old_y = p.y;
		
		if (p.invmass > 0) {
			p.x += gravity.x;
			p.y += gravity.y;
		
			p.x += (p.x - p.px);
			p.y += (p.y - p.py);
		}
		p.px = old_x;
		p.py = old_y;
	}
}

function updateConstraints() {
	let constToBeRemoved = [];
	for (let i = 0; i < constraints.length; i++) {
		let c = constraints[i];
		if (!c.p1 || !c.p2)
			continue;
		
		let dx = c.p1.x - c.p2.x;
		let dy = c.p1.y - c.p2.y;
		if (dx == 0 && dy == 0) {
			dx += Math.random() * 0.1;
			dy += Math.random() * 0.1;
		}
		
		// let d = Math.sqrt((dx * dx) + (dy * dy));
		// if (!c.pushing && d < c.l)
		// 	continue;
		// if (canTear) {
			// let tearStr = c.l * tearMult;
			// if (d > tearStr) {
			// 	constraints[i] = constraints[constraints.length - 1];
			// 	i--;
			// 	constraints.pop();
			// 	continue;
			// }
		// }
		// let percent = ((d - c.l) *
		//                (c.p1.invmass + c.p2.invmass)) /
		//                d;
		
		// Squared dist for optimization
		let dSq = (dx * dx) + (dy * dy);
		if (!c.pushing && dSq < c.lSq)
			continue;
		if (canTear && c.canTear) {
			// let tearStrSq = c.lSq * tearMult;
			if (dSq > tearStrSq) {
				constraints[i] = constraints[constraints.length - 1];
				i--;
				constraints.pop();
				continue;
			}
		}
		
		let percent = ((dSq - c.lSq) *
						 (c.p1.invmass + c.p2.invmass)) /
						 dSq;

		dx *= percent;
		dy *= percent;
		
		c.p1.x -= dx * c.p1.invmass;;
		c.p1.y -= dy * c.p1.invmass;;
		c.p2.x += dx * c.p2.invmass;;
		c.p2.y += dy * c.p2.invmass;;
		
	}
}

function constrainPoints() {
	for (let i = 0; i < particles.length; i++) {
		let p = particles[i];
		if (p.x < SIZE) {
			p.x = SIZE;
		} else if (p.x >= width - SIZE) {
			p.x = width - SIZE;
		}
		
		if (p.y < SIZE) {
			p.y = SIZE;
		} else if (p.y >= height - SIZE) {
			p.x -= (p.y - height + SIZE) * (p.x - p.px) * this.physics.friction;
			p.y = height - SIZE;
		}
	}
}

function Particle(x, y) {
	this.x = x;
	this.y = y;
	this.px = x;
	this.py = y;
	this.invmass = 0.3;
}

function Constraint(p1, p2, l, pushing = true, canTear = false, tearMult = 1) {
	this.p1 = p1;
	this.p2 = p2;
	this.l = l;
	this.lSq = l * l;
	this.pushing = pushing;
	this.canTear = canTear;
	this.tearStr = l * tearMult;
	this.tearStrSq = this.lSq * tearMult;
}

function createTriangle(x, y, size) {
	let body = new Body();
	let a = 0;
	let l = 3;
	let astep = TWO_PI / l;
	for (let i = 0; i < l; i++) {
		p = new Particle(x + Math.sin(a) * size,
						 y + Math.cos(a) * size);
		a += astep;
		if (i > 0) {
			let c = new Constraint(
				particles[particles.length - 1], p, size, true, false);
			constraints.push(c);
			body.constraints.push(c);
		}
		particles.push(p);
		body.vertices.push(p);
	}

	// Join ends of polygon
	let end = new Constraint(
		particles[particles.length - 1],
		particles[particles.length - l],
		size, true, false);

	constraints.push(end);
	body.constraints.push(end);

	body.vertexCount = body.vertices.length;
	body.constraintCount = body.constraints.length;

	bodies.push(body);
}

function createBox(x, y, size) {
	let body = new Body();
	let hsize = size * 0.5;

	let vertices = [];
	vertices.push(new Particle(x - hsize, y - hsize));
	vertices.push(new Particle(x + hsize, y - hsize));
	vertices.push(new Particle(x + hsize, y + hsize));
	vertices.push(new Particle(x - hsize, y + hsize));

	particles.push(...vertices);
	body.vertices.push(...vertices);

	for (let i = 0; i < vertices.length; i++) {
		let c = new Constraint(
			vertices[(i + 1) % vertices.length],
			vertices[i],
			size);

		constraints.push(c);
		body.constraints.push(c);

		if (i > 1) {
			let d = new Constraint(vertices[(i + 2) % vertices.length],
				vertices[i],
				size * sqrt(2.0));

			constraints.push(d);
			body.constraints.push(d);
		}
	}

	body.vertexCount = body.vertices.length;
	body.constraintCount = body.constraints.length;

	bodies.push(body);
}


function createClothSim() {
	for (let y = 0; y < clothHeight; y += 1) {
		for (let x = 0; x < clothWidth; x += 1) {
			let p = new Particle(x * clothSpacing + clothXMargin,
								y + 50);
			p.px += random() * 5 - 2.5;
			
			if (x > 0) {
				constraints.push(new Constraint(
					particles[x - 1 + y * clothWidth],
					p,
					clothConstraintLength, false, true, tearMult));
			}
			if (y > 0) {
				constraints.push(new Constraint(
					particles[x + (y - 1) * clothWidth],
					p,
					clothConstraintLength, false, true, tearMult));
			} else {
				if (y == 0 && x % clothAttachPoints == 0)
					p.invmass = 0;
			}
			particles.push(p);
		}
	}
}


function createSpiderWebSim() {
	let angleStep = TWO_PI / webPoints;
	for (let i = 0; i < webPoints; i++) {
		for (let j = 0; j < webRings; j++) {
			let a = i * angleStep;
			let s = ((webRings - j) / webRings) * webSize;
			let p = new Particle(width/2 + s * sin(a),
								 height/2 + s * cos(a));
			let spacing = webSpacing;

			if (particles.length > 0) {
				if (j > 0) {
					constraints.push(new Constraint(
						particles[particles.length - 1],
						p,
						spacing));
				}
				if (i > 0) {
					constraints.push(new Constraint(
					particles[particles.length - webRings],
					p,
					spacing));
				}
				if (i == webPoints - 1) {
					constraints.push(new Constraint(
					particles[j],
					p,
					spacing));
				}
			}
			if (j == 0)
				p.invmass = 0;
			particles.push(p);
		}
	}
}