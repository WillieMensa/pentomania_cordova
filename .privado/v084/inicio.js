/*	=============================================================================
	Pentomino Puzzle
	archivo: inicio.js
	Pantala/menu inicial
	7/7/2019

*/

//-------------------------------------------------------------------
function HaceInitLayer()  {//pantalla de inicio

	if (DEBUG){console.log(' en HaceInitLayer()');}

	var simpleText = new Kinetic.Text({
		x: gStage.getWidth() / 2,
		y: (gStage.getHeight() * 0.3),
		text: 'PENTO\nMANÍA',
		fontSize: SCREEN_X/10,//130,
		fontFamily: FONT_NIVEL1,//'Calibri',
		fill: '#334D00'
	});

	// to align text in the middle of the screen, we can set the
	// shape offset to the center of the text shape after instantiating it
	simpleText.setOffset({
		x: simpleText.getWidth() / 2
	});


	// 1. Create the button in javascript code
	playBtn = document.createElement("button");
	playBtn.innerHTML = "Jugar";
	// 2. Append <button> to <body>
	document.body.appendChild(playBtn);
	// 3. Add event handler
	playBtn.addEventListener ("click", function() {
		playPuzzle(1); //new puzzle for play
	});
	// 4. Position in screen
	playBtn.style.cssText = "top:" + (050) + "px; left:" + (050) + "px; position: absolute;";


	// Help button in javascript code
	helpBtn = document.createElement("button");
	helpBtn.innerHTML = "Help";
	document.body.appendChild(helpBtn);               // Append <button> to <body>
	helpBtn.addEventListener ("click", function() {  alert("pico en helpBtn") } );// 3. Add event handler
	helpBtn.style.cssText = "top:" + (150) + "px; left:" + (050) + "px; position: absolute;";// 4. Position in screen

	// About button in javascript code
	aboutBtn = document.createElement("button");
	aboutBtn.innerHTML = "About";
	document.body.appendChild(aboutBtn);               // Append <button> to <body>
	aboutBtn.addEventListener ("click", function() {  alert("picoen About button") } );// 3. Add event handler
	aboutBtn.style.cssText = "top:" + (250) + "px; left:" + (050) + "px; position: absolute;";// 4. Position in screen

	// Status button in javascript code
	statusBtn = document.createElement("button");
	statusBtn.innerHTML = "Status";
	document.body.appendChild(statusBtn);
	statusBtn.addEventListener ("click", function() {  pantallaStatus() } );// 3. Add event handler
	statusBtn.style.cssText = "top:" + (350) + "px; left:" + (050) + "px; position: absolute;";// 4. Position in screen

	// Config button in javascript code
	configBtn = document.createElement("button");
	configBtn.innerHTML = "Ajustes";
	document.body.appendChild(configBtn);
	configBtn.addEventListener ("click", function() {  pantallaAjustes() } );// 3. Add event handler
	configBtn.style.cssText = "top:" + (450) + "px; left:" + (050) + "px; position: absolute;";// 4. Position in screen



	// add the shapes to the layer
	gInitLayer.add(simpleText);
	console.log('simpleText, agregado');

	selectIdioma();

	gStage.add(gInitLayer);

};


