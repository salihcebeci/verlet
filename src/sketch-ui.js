
function initSettingsUI() {

	let settingsCont = select('.settings-container');
	settingsCont.mousePressed(function() {
		mouseInsideSketch = false;
	});

	// Sliders and input
	// Gravity
	gravityXSlider = select('#wind-range').value(initGravityX);
	gravityXInput = select('#wind-input').value(initGravityX);

	gravityYSlider = select('#gravity-range').value(initGravityY);
	gravityYInput = select('#gravity-input').value(initGravityY);

	gravityXSlider.changed(function() {
		gravityXInput.value(gravityXSlider.value());
		gravity.x = gravityXSlider.value();
	});
	gravityXInput.changed(function() {
		gravityXSlider.value(gravityXInput.value());
		gravity.x = gravityXSlider.value();
	});

	gravityYSlider.changed(function() {
		gravityYInput.value(gravityYSlider.value());
		gravity.y = gravityYSlider.value();
	});
	gravityYInput.changed(function() {
		gravityYSlider.value(gravityYInput.value());
		gravity.y = gravityYSlider.value();
	});

	// Cloth Width
	let clothWidthSlider = select('#cloth-width-range').value(clothWidth);
	let clothWidthInput = select('#cloth-width-input').value(clothWidth);

	clothWidthSlider.changed(function() {
		clothWidthInput.value(clothWidthSlider.value());
		clothWidth = clothWidthSlider.value();
	});
	clothWidthInput.changed(function() {
		clothWidthSlider.value(clothWidthInput.value());
		clothWidth = clothWidthSlider.value();
	});

	// Cloth Height
	let clothHeightSlider = select('#cloth-height-range').value(clothHeight);
	let clothHeightInput = select('#cloth-height-input').value(clothHeight);

	clothHeightSlider.changed(function() {
		clothHeightInput.value(clothHeightSlider.value());
		clothHeight = clothHeightSlider.value();
	});
	clothHeightInput.changed(function() {
		clothHeightSlider.value(clothHeightInput.value());
		clothHeight = clothHeightSlider.value();
	});

	// Cloth Height
	let clothSpacingSlider = select('#cloth-spacing-range').value(clothSpacing);
	let clothSpacingInput = select('#cloth-spacing-input').value(clothSpacing);

	clothSpacingSlider.changed(function() {
		clothSpacingInput.value(clothSpacingSlider.value());
		clothSpacing = clothSpacingSlider.value();
	});
	clothSpacingInput.changed(function() {
		clothSpacingSlider.value(clothSpacingInput.value());
		clothSpacing = clothSpacingSlider.value();
	});

	// Attached points
	let attachedPointsSlider = select('#attached-points-range').value(clothAttachPoints);
	let attachedPointsInput = select('#attached-points-input').value(clothAttachPoints);

	attachedPointsSlider.changed(function() {
		attachedPointsInput.value(attachedPointsSlider.value());
		clothAttachPoints = attachedPointsSlider.value();
	});
	attachedPointsInput.changed(function() {
		attachedPointsSlider.value(attachedPointsInput.value());
		clothAttachPoints = attachedPointsSlider.value();
	});

	// Constraint Length
	let constLengthSlider = select('#constraint-length-range').value(clothConstraintLength);
	let constLengthInput = select('#constraint-length-input').value(clothConstraintLength);

	constLengthSlider.changed(function() {
		constLengthInput.value(constLengthSlider.value());
		clothConstraintLength = constLengthSlider.value();
	});
	constLengthInput.changed(function() {
		constLengthSlider.value(constLengthInput.value());
		clothConstraintLength = constLengthSlider.value();
	});

	// Tear Strength
	let tearStrSlider = select('#tear-str-range').value(tearStr);
	let tearStrInput = select('#tear-str-input').value(tearStr);

	tearStrSlider.changed(function() {
		tearStrInput.value(tearStrSlider.value());
		tearStr = tearStrSlider.value();
		tearStrSq = tearStr * tearStr;
	});
	tearStrInput.changed(function() {
		tearStrSlider.value(tearStrInput.value());
		tearStr = tearStrSlider.value();
		tearStrSq = tearStr * tearStr;
	});

	// Buttons
	let drawShapeFillBtn = select('#draw-shape-fill');
	if (!drawFill) drawShapeFillBtn.addClass('inactive');
	drawShapeFillBtn.mousePressed(function() {
		drawFill = !drawFill;
		drawShapeFillBtn.toggleClass('inactive');
	});

	let drawPointsBtn = select('#draw-points');
	if (!drawPoints) drawPointsBtn.addClass('inactive');
	drawPointsBtn.mousePressed(function() {
		drawPoints = !drawPoints;
		drawPointsBtn.toggleClass('inactive');
	});

	let showDebugBtn = select('#show-debug');
	if (!showDebugText) showDebugBtn.addClass('inactive');
	showDebugBtn.mousePressed(function() {
		showDebugText = !showDebugText;
		showDebugBtn.toggleClass('inactive');
	});

	let pauseBtn = select('#pause');
	pauseBtn.mousePressed(function(event) {
		console.log(event);
		if (isPaused)
			loop();
		else
			noLoop();
		isPaused = !isPaused;
	});

	let resetBtn = select('#reset');
	resetBtn.mousePressed(function() {
		init();
		if (isPaused) {
			redraw();
		}
	});

	let canTearBtn = select('#can-tear');
	if (!canTear) canTearBtn.addClass('inactive');
	canTearBtn.mousePressed(function() {
		canTear = !canTear;
		canTearBtn.toggleClass('inactive');
	});

	let containerHider = select('#container-hider');
	select('.inside').toggleClass('hidden');
	containerHider.toggleClass('active');
	containerHider.mousePressed(function() {
		select('.inside').toggleClass('hidden');
		containerHider.toggleClass('active');

		if (containerHider.hasClass('active'))
			containerHider.html('Show Controls');
		else
			containerHider.html('Hide');
	});

	let toolTypeButtons = selectAll('.tool-type-btn');
	toolTypeButtons.forEach(function(e, i) {
		if (i != toolType)
			e.addClass('inactive');
		e.mousePressed(function() {
			toolTypeButtons[toolType].addClass('inactive');
			e.removeClass('inactive');
			toolType = toolTypeButtons.indexOf(e);
		});
	});
}