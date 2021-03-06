﻿/*	=============================================================================
	Pentomino Puzzle
	archivo: pentomino-puzzle-pixi-01.js
	23/11/2018
	Trato de reemplazar las funciones de kinetics con pixi


	06/10/2018
	#### version     = "0.3.5"	-	8/10/2018

	include files: polyomino5.js, polySolution.js, animate.js, polyDemo.js

	=============================================================================

	OBSERVACIONES

	Se utilizan dos tipos de coordenadas:
		a/ unidades de pantalla: las coordenadas de la pantalla o canvas y
		b/ unidades de tablero: donde cada cuadrado unitario que compone un poliomino es una particula unitaria.

*/

//=========
// define
//=========
var versionString="1.3"

//-------------------------------------
//	https://www.w3schools.com/colors/colors_picker.asp
//	http://www.colorhexa.com/
//-------------------------------------
//=====================
//	Constantes
//=====================
var	RENDERER_W = 1000,			//	ancho pantalla
	RENDERER_H = 600			//	alto pantalla

var BACKGROUND_COLOR = "#ddff99";
var BACKGROUND_BOARD_COLOR = "white";

var BORDER_COLOR = "#666600";
var BORDER_STROKE_COLOR = "#ffff66";			//	"yellow";

var BOARD_COLOR = "#B7F7DE"; //light green
var FIXED_BLOCK_COLOR = "#666666";  //light gray
var FIXED_BORDER_COLOR = BOARD_COLOR;

var FOCUS_BORDER_COLOR = "red";
var BLOCK_BORDER_COLOR = "yellow";

var OPERATOR_COLOR = "#3344FF";  //blue
var OPERATOR_CIRCLE_COLOR = "white";

var FLASH_BORDER_COLOR = "red";

var TEXT_FINISH_COLOR = "#FF88EE";
var NEXT_BUTTON_TEXT_COLOR = "#FF8800";
var NEXT_BUTTON_FILL_COLOR = "white";
var NEXT_BUTTON_BORDER_COLOR = "green";

//-------------------------------------------------------------------------
// block colors:
// from : http://en.wikipedia.org/wiki/File:Pentomino_Puzzle_Solutions.svg
//-------------------------------------------------------------------------
//	BLOCK_COLOR vector contiene los colores asignados a cada pentomino

var BLOCK_COLOR = [ "#FF0000", "#660000", "#FFFF00", "#666600",
					"#00FF00", "#006600", "#00FFFF", "#006666",
					"#0000FF", "#000044", "#FF00FF", "#660066" ];


var	COLOR_BLOCK_FIJO	= '#112233';	//	gris bastante oscuro

//===========================
// values based on screen size
//===========================
var BLOCK_CELL_SIZE;	//	medida de las cldas en px
var STAGE_X;			//	ancho adoptado para area de juego (stage o canvas)
var STAGE_Y;			//	alto adoptado para area de juego (stage o canvas)
var STAGE_OFFSET_X;		//	vertice izquierdo de la pantalla
var STAGE_OFFSET_Y;		//	vertice superior de la pantalla
var SCREEN_X;			//	ancho de pantalla en px
var SCREEN_Y;			//	alto de pantalla en px

//==================
// global variable
//==================
var SCREEN_BOARD_X;		//	ancho del tablero en celdas. En nuestro caso: 8
var SCREEN_BOARD_Y;		//	alto del tablero en celdas. En nuestro caso: 8 (igual al anterior
var BOARD_WIDTH;		//	ancho del tablero en unidades de pantalla. Este es el que vamos a calcular para usar de base de calculo.
var BOARD_HIGH;			//	alto del tablero en unidades de pantalla
var boardStartX;		//	coordenadas para ubicar tablero.
var boardStartY;

var gBoardSizeId = 0;	//board size. Identifica la opcion elegida para tamaño de tablero
						//	nuestro tablero es siempre el único, de 8 X 8
var gLevelId = 1;		//	play level. Nivel de dificultad; seleccionable con levelButton
						//	en nuestro caso va a ser unico.

//	var gStage;			antes kinetic stage, ahora app = PIXI.application
var applicationOptions = {
	width: RENDERER_W,
	height:	RENDERER_H,
	transparent: true,		//	boolean	false	optional. If the render view is transparent, default false
	antialias: true,		//	boolean	false	optional. sets antialias (only applicable in chrome at the moment)
	backgroundColor: BACKGROUND_COLOR	//	number	0x000000	optional. The background color of the rendered area (shown if not transparent).
}

var app = new PIXI.Application( applicationOptions );

var gBackgroundLayer;  //	PIXI.container, antes	kinetic layer
var gBoardLayer;       //	PIXI.container, antes	kinetic layer
var gMessageLayer;     //	PIXI.container, antes	kinetic layer

var gBlockGroup;		//este array contiene datos de los poliominos / poligonos a tratar (pentominos)
var gPolyGroup;			//for output on screen

//	------------------------------------------------
//	Preparacion de cuadromino a posicion fija
//	------------------------------------------------
var wCuadromGroup;		//	vector con datos de cuadrominos. Uno va en posición fija
var	wPolyCuadrom;		//	datos para colocacion en pantalla
var	nCuadromId	= 3;	//	identificador del cuadromino fijo a colocar en el tablero

//	var wCuadromino;		//	datos de cuadromino a colocar en posición fija
var wCuadromPos = {x:2,y:2};	//	posicion del cuadromino fijo
var gCeldasOcupadas;


//---------------------------
// For calculate board state
//---------------------------
var gBoardState;		//	current board status, ([1..SCREEN_BOARD_X] , [1..SCREEN_BOARD_Y])
var gTotalBlockCell;	//	total block cells
var gBlockCellUsed = 0; //	how many block cell used. Leva la cuenta de las celditas de tablero ocupadas
						//	Este velor se emplea para verificar si el problema ha sido resuelto.
var gBlockUsed = 0;		//	how many block used


//	var	DEBUG = false;
var	DEBUG = true;
var	DEBUG2 = false;


//==================
// BEGIN
//==================
window.onload = function(){
	init();
};

//--------------------
// Initial
//--------------------
function init()
{

document.body.appendChild(app.view);

// create a new Sprite from an image path
var bunny = PIXI.Sprite.fromImage('required/assets/basics/bunny.png')

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;

app.stage.addChild(bunny);




	//just for fixed: chrome sets cursor to text while dragging, why?
	//http://stackoverflow.com/questions/2745028/chrome-sets-cursor-to-text-while-dragging-why
	//This will disable any text selection on the page and it seems that browser starts to show custom cursors.
	document.onselectstart = function(){ return false; } ;

	//initial input
	document.getElementById('checkButton').checked=false;
	document.getElementById('levelButton').options[gLevelId-1].selected  = true;

	initLanguage();					//	adaptación a diferentes idiomas
	initScreenVariable();
	initScreenPosColor();

	gBlockGroup = polyomino5.blockGroup;
	createBlockStyle(gBlockGroup);			//external function. creacion de todos los estilos de bloque a partir del block inicial
	bindBlockColor(gBlockGroup);

	//	---------------------------------------------
	//	Preparacion de el/los cuadrominos
	//------------------------------
	//	wCuadromino = polyomino4.blockGroup[nCuadromId];	//	esta linea o la que sigue, vuelan
	wCuadromGroup = polyomino4.blockGroup;
	gCeldasOcupadas = CalcCeldasOcupadas();
	if (DEBUG2)
	{
		for (var j=0; j < gCeldasOcupadas.length ; j++)
		{
			console.log('gCeldasOcupadas['+ j + '] : ' + gCeldasOcupadas[j].x + ' : ' + gCeldasOcupadas[j].y );
		}
	}

	createBlockStyle(wCuadromGroup);			//external function. creacion de todos los estilos de bloque a partir del block inicial
	//	asignamos color a los cuadrominos
	for(var id=0; id < wCuadromGroup.length; id++) {
		wCuadromGroup[id].color = '#000000';
	}
	//	wCuadromino.color = COLOR_BLOCK_FIJO;
	//	------------------------------------------

	createStageLayer();

	if (DEBUG2) {
		console.log('linea 201, gPolyGroup: ' + gPolyGroup);
	};

	playPuzzle(1); //new puzzle for play

	//debug
	//	writeMessage("cell " +BLOCK_CELL_SIZE + " X,Y " + STAGE_X + "," + STAGE_Y + " offX: " + STAGE_OFFSET_X + " offY: " + STAGE_OFFSET_Y);
	//	writeMessage( 'SCREEN_X: ' + SCREEN_X + ' SCREEN_Y: ' + SCREEN_Y );


}


//-----------------------------------------------------
// start a play puzzle
// newPuzzle: 1: create new puzzle, 0: back from demo
//-----------------------------------------------------
function playPuzzle()
{
	//	waitIdleDemo();

	hiddenStartButton();

	initBoardSize(gBoardSizeId, gLevelId); //back from demo

	if (DEBUG2) { console.log('linea 223, playPuzzle, gPolyGroup: ' + gPolyGroup);	};

	createPuzzle(1, true);
	enableAllButton();
	visibleAllButton();
}



function initBoardSize(boardSize, level)
{
	gBoardSizeId=boardSize;
	gLevelId = level;

}


//-------------------------------------------------------------------
// initial button language to traditional chinese if system support
//-------------------------------------------------------------------
var levelText = "Nivel";
var noSolutionText = " Sin solución ";
var nextText = "OTRO";
var finishText = "Felicitaciones";
var checkSolutionShift = 130;

function initLanguage()		//	para adaptar a diferentes idiomas
{
	var sysLang = getSystemLanguage();

	if(sysLang == "en" || sysLang == "en") { //	ingles
		noSolutionText = "No solution ";
		nextText = "NEXT";
		finishText = "Congratulation";
		levelText = "Level";

		document.getElementById('hintsButton').value = "Hint";
		document.getElementById('resetButton').value = "Reset";
		document.getElementById('startButton').value = "Start";

		checkSolutionShift = 90;
		document.getElementById('checkboxtext').innerHTML = "CHECK";

	}
}



//----------------------------------------------
//	asignacion de valores a variables basados en medidas de pantalla
//----------------------------------------------
function initScreenVariable()
{
	var screenWidth = 0, screenHeight = 0;	// ancho y alto de pantallla

	//	reemplazo para agrandar tablero
	//	var maxStageX = 1000;
	//	var maxStageY = 800;
	//	var maxCellSize = 40;

	var maxStageX = 1000;
	var maxStageY = 800;
	var maxCellSize = 64;

	var midStageX = 800;
	var midStageY = 600;
	var midCellSize = 50;		//	var midCellSize = 32;

	var miniStageX = 600;
	var miniStageY = 400;
	var miniCellSize = 36;	// 24;

	var microStageX = 400;
	var microStageY = 300;
	var microCellSize = 32;	// 20;

	//----------------------------------------------------------------------
	// Window size and scrolling:
	// URL: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
	//----------------------------------------------------------------------
	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
	} else if((document.documentElement) &&
		      (document.documentElement.clientWidth || document.documentElement.clientHeight ) )
	{
		//IE 6+ in 'standards compliant mode'
		screenWidth = document.documentElement.clientWidth;
		screenHeight = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		screenWidth = document.body.clientWidth;
		screenHeight = document.body.clientHeight;
	}

	SCREEN_X = screenWidth;
	SCREEN_Y = screenHeight;

	//	STAGE_X = ((screenWidth%2)? (screenWidth-1):screenWidth) - microCellSize*2;
	STAGE_X = Math.floor(screenWidth*0.95);


	//	if(STAGE_X > maxStageX) STAGE_X = maxStageX;
	//	if(STAGE_X < microStageX) STAGE_X = microStageX;
	STAGE_OFFSET_X = Math.floor((screenWidth - STAGE_X)/2);
	if(STAGE_OFFSET_X < microCellSize) STAGE_OFFSET_X = microCellSize;

	//	STAGE_Y = ((screenHeight%2)?(screenHeight-1):screenHeight) - microCellSize*2;
	STAGE_Y = Math.floor(screenHeight*0.90);

	if(STAGE_Y > maxStageY) STAGE_Y = maxStageY;
	if(STAGE_Y < microStageY) STAGE_Y = microStageY;
	STAGE_OFFSET_Y = Math.floor((screenHeight - STAGE_Y)/2);
	if(STAGE_OFFSET_Y < microCellSize) STAGE_OFFSET_Y = microCellSize;


	//	if (DEBUG)	{	writeMessage("cell " +BLOCK_CELL_SIZE + " X,Y " + STAGE_X + "," + STAGE_Y + " offX: " + STAGE_OFFSET_X + " offY: " + STAGE_OFFSET_Y);	}
	if (DEBUG)	{	console.log("SCREEN_X: " + SCREEN_X + ' SCREEN_Y: ' + SCREEN_Y ); }


	//	BLOCK_CELL_SIZE = maxCellSize;
	//	switch(true) {
	//	case (STAGE_X <= microStageX || STAGE_Y <= microStageY):
	//		BLOCK_CELL_SIZE = microCellSize;
	//		break;
	//	case (STAGE_X <= miniStageX || STAGE_Y <= miniStageY):
	//		BLOCK_CELL_SIZE = miniCellSize;
	//		break;
	//	case (STAGE_X <= midStageX || STAGE_Y <= midStageY):
	//		BLOCK_CELL_SIZE = midCellSize;
	//		break;
	//	}

	console.log( 'Parametros de pantalla'	);
	console.log( 'SCREEN_X: ' +		SCREEN_X       );
	console.log( 'SCREEN_Y: ' + 		SCREEN_Y       );
	console.log( 'STAGE_X: ' + 		STAGE_X        );
	console.log( 'STAGE_OFFSET_X: ' + 	STAGE_OFFSET_X );
	console.log( 'STAGE_Y: ' + 		STAGE_Y        );
	console.log( 'STAGE_OFFSET_Y: ' +  	STAGE_OFFSET_Y );
	console.log( 'BLOCK_CELL_SIZE: ' +  BLOCK_CELL_SIZE );

}

//----------------------------------------------
// initial screen position and background color
//----------------------------------------------
function initScreenPosColor()
{
	//	var Y_Offset = Math.round(BLOCK_CELL_SIZE/6);	//	todavia no se conoce BLOCK_CELL_SIZE
	//	if (DEBUG)	{ console.log('BLOCK_CELL_SIZE, Y_Offset, Y_Offset + 200: ' + BLOCK_CELL_SIZE + ', ' +(Y_Offset) + ', ' +	Y_Offset + 200 );	}

	document.getElementById('level').style.cssText = "top:" + (25) + "px; left:" + (50) + "px; position: absolute;";

	//	document.getElementById('problema').style.cssText = "top:" + (SCREEN_Y-070) + "px; left:" + (500) + "px; position: absolute;";
	//	document.getElementById('seleccion').style.cssText = "top:" + (SCREEN_Y-070) + "px; left:" + (600) + "px; position: absolute;";

	//	document.getElementById('new').style.cssText = "top:" + (Math.floor(SCREEN_Y/2) - 20) + "px; left:" + (SCREEN_X - 70) + "px; position: absolute;";

	//	document.getElementById('numero').style.cssText = "top:10px; left:120px; position: absolute;";

	document.getElementById('reset').style.cssText = "top:" + (SCREEN_Y-080) + "px; left:" + (50) + "px; position: absolute;";

	document.getElementById('giro').style.cssText = "top:" + (SCREEN_Y-080) + "px; left:" + (200) + "px; position: absolute;";

	document.getElementById('voltea').style.cssText = "top:" + (SCREEN_Y-080) + "px; left:" + (350) + "px; position: absolute;";

	document.getElementById('hints').style.cssText = "top:" + (SCREEN_Y-080) + "px; left:" + (500) + "px; position: absolute;";

	document.getElementById('check').style.cssText = "top:" + (SCREEN_Y-080) + "px; left:" + (650) + "px; position: absolute;";

	//	document.getElementById('start').style.cssText = "top:" + (Math.floor(SCREEN_Y/2) - 20) + "px; left:" + (SCREEN_X - 120) + "px; position: absolute;";

	document.body.style.background = BACKGROUND_COLOR; //body background color
}

//------------------------------
// bind block with fixed color
//------------------------------
function bindBlockColor(blockGroup)
{
	for(var id=0; id < blockGroup.length; id++) {
		blockGroup[id].color = BLOCK_COLOR[id];
	}
}

//----------------------------------
// create stage & layer (KineticJS)
//----------------------------------
function createStageLayer()				//	crea capas que van al Stage
{
	//create layer object
	//	Escenario menu inicial
	gBackgroundLayer = new PIXI.Container();
	//	app.stage.addChild(gBackgroundLayer);
	
	gBoardLayer = new PIXI.Container();
	gBackgroundLayer.addChild(gBoardLayer);

	gMessageLayer = new PIXI.Container();
	gBackgroundLayer.addChild(gMessageLayer);

}

//------------------------------------------------
// Remove child node of stage & layer (KineticJS)
//------------------------------------------------
function clearStageLayer()
{
	gBackgroundLayer.removeChildren();
	gBoardLayer.removeChildren();
	gMessageLayer.removeChildren();

	app.stage.removeChildren();
}

//----------------------------------------------
// create a puzzle
//
// newPuzzle= 0: restore info from demo back
//            1: create new puzzle
// activePoly: active block draggiable or not
//----------------------------------------------
function createPuzzle(newPuzzle, activePoly)
{
	//	var fixedBlock = boardSizeInfo[gBoardSizeId].x * boardSizeInfo[gBoardSizeId].y / 5 - 1; //for debug only
	var fixedBlock = 0;	//	(boardSizeInfo[gBoardSizeId].numOfLevel - gLevelId)* 2;

	//	entre otras cosas initBoardState genera el polygroup
	//	initBoardState(boardSizeInfo[gBoardSizeId].x,boardSizeInfo[gBoardSizeId].y, fixedBlock, NewPuzzle);
	initBoardState( 8, 8, fixedBlock, 1);

	if (DEBUG2) {
		console.log('linea 439, gPolyGroup: ' + gPolyGroup);
	};

	//	if(activePoly) activePolygon();		//	original pero siempre verdadero
	activePolygon();

	//writeFinishMsg(); //for test only
}


//---------------------
// initial board state
//---------------------
function initBoardState(boardX, boardY, numOfFixedBlocks, newPuzzle)
{
	//initial global variable
	SCREEN_BOARD_X = boardX;
	SCREEN_BOARD_Y = boardY;

	//	BOARD_WIDTH = (SCREEN_BOARD_X * BLOCK_CELL_SIZE);
	//	BOARD_HIGH  = (SCREEN_BOARD_Y * BLOCK_CELL_SIZE);
	BOARD_WIDTH = ( Math.floor( 0.45 * SCREEN_X / SCREEN_BOARD_X ) * SCREEN_BOARD_X );
	BOARD_HIGH  = ( Math.floor( 0.70 * SCREEN_Y / SCREEN_BOARD_Y ) * SCREEN_BOARD_Y );

	if ( BOARD_WIDTH > BOARD_HIGH )	{ BOARD_WIDTH = BOARD_HIGH;	} else { BOARD_HIGH = BOARD_WIDTH };

	BLOCK_CELL_SIZE = BOARD_WIDTH / SCREEN_BOARD_X;

	console.log( 'BOARD_WIDTH, BOARD_HIGH, BLOCK_CELL_SIZE: ' + BOARD_WIDTH + ', ' + BOARD_HIGH + ', ' + BLOCK_CELL_SIZE);
	console.log('STAGE_X, STAGE_Y: ' + STAGE_X + ', ' + STAGE_Y);

	//	boardStartX = (STAGE_X-BOARD_WIDTH)/2;
	boardStartX = BLOCK_CELL_SIZE;
	boardStartY = Math.floor((SCREEN_Y-BOARD_HIGH)/2);

	console.log( 'boardStartX, boardStartY: ' + boardStartX + ', ' + boardStartY );

	gTotalBlockCell = (SCREEN_BOARD_X * SCREEN_BOARD_Y);
	gBlockUsed = 0
	gBlockCellUsed = 0;

	//clear stage & create layer
	clearStageLayer();

	// intento agregar un contorno al area de juego
	// addContorno2Layer();

	addBackgroundLayer();
	addBoard2Layer();

	createOperatorObject();
	addOperator2Layer();


	gBoardState = createBoard(SCREEN_BOARD_X, SCREEN_BOARD_Y); //external function
	clearPolyInsertOrder(); //for hints
	randomBlock(gBlockGroup); //external function; random the block order
	randomBlockStyle(gBlockGroup); //external function; //	reordena aleatoriamente los estilos de bloque

	// Random the initial position of polygon
	randomPolyInitPos(gBlockGroup.length - numOfFixedBlocks);

	clearFixedBlock();

	//	-------------------------------------------------------------------------------------
	//	Atencion: antes de buscar una solución y colocar bloques fijos se debería colocar el cuadrómino.
	//	Intento incorporar el cuadromino como fijo
	//	procedimiento deberia ser similar a addFixedBlock2Layer(result.op, numOfFixedBlocks);
	wAgregaCuadrominoFijo( wCuadromPos );

	//	Atencion elimino para no agregar pentominos fijos (?)
	//	if(numOfFixedBlocks) {
	//		//random assign fixed block to board from solved board
	//	result = findAnswer(gBoardState, 0);		//	busca (al menos) una solucion

	//	addFixedCuad2Layer();		//	result.op, 1);					//	numOfFixedBlocks);

	//	};

	//	la que sigue genera el gPolyGroup
	addBlock2Layer(0);		//	numOfFixedBlocks == 0;

	//	wAddCuadrom2Layer();


/*

	//	linea 400, aqui debiera agregar el cuadrómino
	var bloque = wCuadromGroup[nCuadromId].blockStyle[0];

	//	anulo esta seccion porque antes inserto el cuadromino con wAgregaCuadromino()
	if (DEBUG)	{ console.log('linea 468, llamamos a insertBlockToBoard()'); }

	if(!insertBlockToBoard(gBoardState, SCREEN_BOARD_X, SCREEN_BOARD_Y, bloque, {x:1,y:1}, 99)) {
				dumpBoard(gBoardState);
				throw new Error("Error de diseño");
			}
*/

	if (DEBUG) { dumpBoard(gBoardState); };
	//	boardX	:	dimension X del tablero en celdillas
	//	boardy	:	dimension y del tablero en celdillas
	//	block	:	el bloque-poliomino a insertar
	//	curPos	:	posicion en coordenadas de tablero de la pieza a insertar
	//	value	:	valor a asignar a la celdilla ocupada. 99 para diferenciar con los pentominos

	//	no empleo pentominos como bloques fijos por eso anulo sector que sigue
	//	if(numOfFixedBlocks) {
	//		//random assign fixed block to board from solved board
	//		result = findAnswer(gBoardState, 0);
	//		addFixedBlock2Layer(result.op, numOfFixedBlocks);
	//	}

	//	addBlock2Layer(0);				//	numOfFixedBlocks);
	//	wAddCuadrom2Layer();

	app.stage.add(gBackgroundLayer);
	app.stage.add(gBoardLayer);
	app.stage.add(gMessageLayer);

	if(!newPuzzle && checkSolution)checkButton(1); //restore check solution message
}

//-----------------------------------------
// Random the initial position of polygon
//-----------------------------------------
var polyInitPos;
function randomPolyInitPos(availablePoly)
{
	//	midId: vendria a ser la cantidad de piezas a colocar en una linea
	//	en nuestro caso siempre seran 12
	//	var midId = (availablePoly > 5)?Math.floor((availablePoly+1)/2): availablePoly;
	var ppl = 3;	//	Piezas Por Linea; primera prueba: 4 filas de 3 piezas c/u

	//	distance: distancia horizontal entre las piezas
	//	reparto el espacio desde el tablero al borde derecho
	//	var distance =  Math.floor((STAGE_X - BLOCK_CELL_SIZE*2) / ppl);
	var distance_X =  Math.floor((STAGE_X - BLOCK_CELL_SIZE - BOARD_WIDTH) / (ppl + 1));
	var distance_Y =  Math.floor(0.8 * (STAGE_Y - BLOCK_CELL_SIZE) / ((availablePoly/ppl) + 1));

	polyInitPos=[];
	for(var id=0; id < availablePoly; id++) {
		polyInitPos[id] = id;
	}

	//random position of id
	for(var id=0; id < availablePoly; id++) {
		var swapId =  Math.floor(Math.random()*(availablePoly));
		var tmpId = polyInitPos[id];

		polyInitPos[id] = polyInitPos[swapId];
		polyInitPos[swapId] = tmpId;
	}

	//----------------------------------
	// set the position by random index
	//----------------------------------
	for(var id=0; id < availablePoly; id++) {
		var index = polyInitPos[id];

		polyInitPos[id] = {
			x:( STAGE_OFFSET_X + boardStartX + BOARD_WIDTH ) + (distance_X * (0.7 + (index % ppl))),
			y:Math.floor( distance_Y  * (1.2 + (index % (( availablePoly / ppl ) + 1 ))))
		};


		if (DEBUG)	{
			console.log( 'id: ' + id + ', x,y: ' + Object.values(polyInitPos[id]) );
			;
		}
	}
	console.log( 'distance_X, distance_Y: ' + distance_X + ', ' +  distance_Y );

}

//-----------------------------------
// get polygon position by index id
//-----------------------------------
function getPolyInitPos(id)
{
	return polyInitPos[id];
}

//-------------------------
// clear fixed block group
//-------------------------
var gFixedPolyGroup= [];
function clearFixedBlock()
{
	gFixedPolyGroup= [];
}



//--------------------------------------------
// restore fixed block (from demo saved info)
//--------------------------------------------
function restoreFixedBlock2Layer()
{
	for(var id=0; id < gFixedPolyGroup.length; id++) {
		gBoardLayer.add(gFixedPolyGroup[id].poly);

		//	lo que sigue debieran agregarse cuatro celdillas porque el bloque fijo es un cuadromino

		if (DEBUG)
		{
			throw new Error("Error forzado para detectar los llamados!");
		}

		gBlockCellUsed += gFixedPolyGroup[id].block.length;

		gBlockUsed++;
	}
}

//--------------------------------------------
// duplicate a block base on operator method
// normalize: block need normalize or not
//--------------------------------------------
function dupOpBlock(srcBlock, op, normalize)
{
	var dstBlock;

	//duplicate block
	dstBlock = [];
	for(var i = 0; i < srcBlock.length; i++) {
		dstBlock[i] = {};
		dstBlock[i].x = srcBlock[i].x;
		dstBlock[i].y = srcBlock[i].y;
	}

	if(op.leftRightFlip) {
		//(X, Y) ==> (-X, Y)
		for(var i = 0 ; i < dstBlock.length; i++) {
			dstBlock[i].x = -dstBlock[i].x;
		}
	}

	if(op.upDownFlip) {
		//(X, Y) ==> (X, -Y)
		for(var i = 0 ; i < dstBlock.length; i++) {
			dstBlock[i].y = -dstBlock[i].y;
		}
	}

	if(op.rotate) {
		//(X, Y) ==> (Y, X)
		for(var i = 0 ; i < dstBlock.length; i++) {
			var tmpX = dstBlock[i].x;
			dstBlock[i].x = dstBlock[i].y;
			dstBlock[i].y = tmpX;
		}
	}

	if(normalize) blockNormalization(dstBlock);

	return dstBlock
}

//--------------------------------------------------------
// convert solved board position to board state position
// for (gBoardState)
//--------------------------------------------------------
function SolvedPos2BoardPos(op, pos)
{
	var boardPos = { x:pos.x, y:pos.y };

	if(op.leftRightFlip) {
		boardPos.x = SCREEN_BOARD_X - boardPos.x - 1;
	}
	if(op.upDownFlip) {
		boardPos.y = SCREEN_BOARD_Y - boardPos.y - 1;
	}
	if(op.rotate) {
		var tmpX = boardPos.x;
		boardPos.x = boardPos.y;
		boardPos.y = tmpX;
	}

	return boardPos;
}

//--------------------------
// add background to layer
//--------------------------
function addBackgroundLayer()
{
	var borderWidth = Math.round(BLOCK_CELL_SIZE/4);
	var textOffset = Math.round(BLOCK_CELL_SIZE/6);
	var titleFontSize = Math.round(BLOCK_CELL_SIZE*0.70);	//	1.32

	let versionText = new PIXI.Text(versionString,{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});

	/*
	var versionText = new Kinetic.Text({
		x: 0,
		y: STAGE_Y-titleFontSize/3.5,
		text: versionString,
		fill: BACKGROUND_COLOR,
		fontSize: titleFontSize/4,
		fontStyle:"bold",
		shadowColor: 'black',
		shadowBlur: 9,
		shadowOffset: [2, 2],
		shadowOpacity:0.3
	});
	*/

	var background = new PIXI.Rectangle (0, 0, STAGE_X, STAGE_Y);
	/*	
	new Kinetic.Rect({
		x: 0,
		y: 0,
		width: STAGE_X,
		height: STAGE_Y,
		fill: BACKGROUND_COLOR
	});
	*/

	var boardBackground = new PIXI.Graphics();
		boardBackground.lineStyle(borderWidth, BORDER_COLOR, 1);
		boardBackground.beginFill(BACKGROUND_BOARD_COLOR, 1);
		boardBackground.drawRect( boardStartX, boardStartY, SCREEN_BOARD_X*BLOCK_CELL_SIZE, SCREEN_BOARD_Y*BLOCK_CELL_SIZE);
		boardBackground.endFill();
	/*
		x: boardStartX,
		y: boardStartY,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE,
		fill: BACKGROUND_BOARD_COLOR
	});
	

	var borderUp = new PIXI.Sprite(PIXI.Texture.WHITE);
		borderUp.width = boardStartX-borderWidth;
		borderUp.height = boardStartY-borderWidth;
		borderUp.tint = BORDER_COLOR;	
	
	new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY-borderWidth,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE+borderWidth*2,
		height: borderWidth,
		fill: BORDER_COLOR
	});
	

	var borderLeft = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY,
		width: borderWidth,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE+borderWidth,
		fill:  BORDER_COLOR
	});

	var borderRight = new Kinetic.Rect({
		x: boardStartX+SCREEN_BOARD_X*BLOCK_CELL_SIZE,
		y: boardStartY,
		width: borderWidth,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE+borderWidth,
		fill: BORDER_COLOR
	});

	var borderDown = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY+SCREEN_BOARD_Y*BLOCK_CELL_SIZE,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE+borderWidth*2,
		height: borderWidth,
		fill: BORDER_COLOR
	});

	var borderborder = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY-borderWidth,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE+borderWidth*2,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE+borderWidth*2,
		stroke: BORDER_STROKE_COLOR,
		strokeWidth: 2
	});
	*/

	gBoardLayer.addChild(background);
	//	gBackgroundLayer.add(titleText1);
	//	gBackgroundLayer.add(titleText2);
	gBoardLayer.addChild(versionText);
	gBoardLayer.addChild(boardBackground);
	//	gBackgroundLayer.add(borderUp);
	//	gBackgroundLayer.add(borderLeft);
	//	gBackgroundLayer.add(borderRight);
	//	gBackgroundLayer.add(borderDown);
	//	gBackgroundLayer.add(borderborder);
}

//--------------------------------
// Draw a board and add to layer
//--------------------------------
function addBoard2Layer()
{
	var board = new Kinetic.Shape({
		x: boardStartX,
		y: boardStartY,

		drawFunc: function(canvas) {
			//draw vertical line
			var context = canvas.getContext();
			for(var x = 0; x <= SCREEN_BOARD_X ; x++) {
				context.beginPath();
				context.moveTo(x*BLOCK_CELL_SIZE, 0);
				context.lineTo(x*BLOCK_CELL_SIZE, BLOCK_CELL_SIZE*SCREEN_BOARD_Y);
				context.closePath();
				canvas.fillStroke(this);
			}

			//draw horizontal line
			for(var y = 0; y <= SCREEN_BOARD_Y ; y++) {
				context.beginPath();
				context.moveTo(0, y*BLOCK_CELL_SIZE);
				context.lineTo(BLOCK_CELL_SIZE*SCREEN_BOARD_X,  y*BLOCK_CELL_SIZE);
				context.closePath();
				canvas.fillStroke(this);
			}
		},
		stroke: BOARD_COLOR,
		strokeWidth: 1
	});
	gBoardLayer.add(board);
}

//-----------------------------------------
// create polygon blocks and add to layer
//-----------------------------------------
function addBlock2Layer(fixedBlock)
{
	createPolygon(gBlockGroup, 0);					//	fixedBlock);

	for(var g = 0; g < gPolyGroup.length; g++) {
		gBoardLayer.add(gPolyGroup[g].poly);
	}
}



//----------------------------------
// restore polygon blocks to layer
//----------------------------------
function restoreBlock2Layer(fixedBlock)
{
	//-------------------------------------------------------------------
	// if restore from backup it can not drag again with kineticJS 4.4.0
	// so re-create object and copy attr from backup - 04/04/2013
	//-------------------------------------------------------------------
	clonePolygon(saveInfo.gPolyGroup, 0);			//	fixedBlock);

	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		gBoardLayer.add(poly);

		//restore already inserted poly
		if(poly.pos.x > 0) {
			poly.setZIndex(gBlockUsed+1);//after (board + blockUsed)
			clearShadow(poly);
			setColor(poly, 1); //set normal color
			gBlockCellUsed += gPolyGroup[g].block.length;
			gBlockUsed++;
		}

	}
}

//======================================
// BEGIN for create polygon
//======================================

//-----------------------------------------------------------------------------
// sort point for draw Polygon:
// Each point connect to two point, one on horizontal the other on vertical.
//
// (1) Set begin point as current point
//
// (2) from current point to find next horizontal point:
//     (2.1) find nearest right point; if not found, find the nearest left point
//     (2.2) set this point as current point and find next vertical point
//
// (3) from current point to find the next vertical point:
//     (3.1) find nearest down point; if not found, find the nearest up point
//     (3.2) set this point as current point and find next horizontal point
//
// (4) repeat (2) ~ (3) until all point found
//-----------------------------------------------------------------------------
function polyRegular(poly)
{
	var size = poly.length;
	var tmpIndex;
	var mode= 0; hMode = 0, vMode = 2;

	//console.log(poly);

	for(var i = 0; i < size-1; i++) {
		tmpIndex = -1;
		do {
			for(var j = i+1; j < size; j++) {
				switch(mode) {
				case 0: //right point (H - right)
					if(poly[i].y == poly[j].y && poly[i].x < poly[j].x) {
						if (tmpIndex < 0 || poly[tmpIndex].x > poly[j].x) {
							tmpIndex = j;
						}
					}
					break;
				case 1: //left point (H - left)
					if(poly[i].y == poly[j].y && poly[i].x > poly[j].x) {
						if (tmpIndex < 0 || poly[tmpIndex].x < poly[j].x) {
							tmpIndex = j;
						}
					}
					break;
				case 2: //up point (V - up)
					if(poly[i].x == poly[j].x && poly[i].y > poly[j].y) {
						if (tmpIndex < 0 || poly[tmpIndex].y < poly[j].y) {
							tmpIndex = j;
						}
					}
					break;
				case 3: //down point (V - down)
					if(poly[i].x == poly[j].x && poly[i].y < poly[j].y) {
						if (tmpIndex < 0 || poly[tmpIndex].y > poly[j].y) {
							tmpIndex = j;
						}
					}
					break;
				}
			}
			if(tmpIndex < 0) { //not found
				switch(mode) {
				case 0:
					hMode = ++mode;
					break;
				case 1:
					hMode = --mode;
					break;
				case 2:
					vMode = ++mode;
					break;
				case 3:
					vMode = --mode;
					break;
				}
			}
		} while( tmpIndex < 0);

		if(tmpIndex != i+1) {
			//swap
			var tmp = poly[tmpIndex];
			poly[tmpIndex] = poly[i+1];
			poly[i+1] = tmp;
		}
		//next search mode
		switch(mode) {
		case 0:
		case 1:
			mode=vMode;
			break;
		case 2:
		case 3:
			mode=hMode;
			break;
		}
	}
	//console.log(poly);
}

//-------------------------------------------------------------------
// extend one block cell as a rectangle point,
// and insert to poly-point, if this point already exit, remove it
//-------------------------------------------------------------------
function insert2Poly(polyPoint, blockCell)
{
	var pointExtend = [ {x:blockCell.x,   y:blockCell.y},
	                    {x:blockCell.x+1, y:blockCell.y},
						{x:blockCell.x,   y:blockCell.y+1},
						{x:blockCell.x+1, y:blockCell.y+1}
					  ];
	outerloop:
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < polyPoint.length; j++) {
			if(pointExtend[i].x == polyPoint[j].x && pointExtend[i].y == polyPoint[j].y) {
				polyPoint.splice(j, 1); //remove it, if exist
				continue outerloop;
			}
		}
		polyPoint.push({x:pointExtend[i].x, y:pointExtend[i].y}); //insert it, if without exist
	}
}

//-----------------------------------------------------------------
// convert block coordinate system to polygon coordinate (kinetic)
//-----------------------------------------------------------------
function block2Polygon(block)
{
	var polyPoint = [];
	var poly = [];

	for(var i = 0; i < block.length; i++) {
		insert2Poly(polyPoint, block[i]);
	}
	polyRegular(polyPoint);
	for(var i = 0; i < polyPoint.length; i++) {
		poly.push(polyPoint[i].x * BLOCK_CELL_SIZE);
		poly.push(polyPoint[i].y * BLOCK_CELL_SIZE);
	}

	return poly;
}



var lastFocusPolyId = -1; //focus polygon block

function getLastFocusPoly()
{

	if (DEBUG)
	{
		console.log('lastFocusPolyId: ' + lastFocusPolyId );
	}
	if(lastFocusPolyId < 0) return; //return "undefined"

	return gPolyGroup[lastFocusPolyId].poly;
}

//-------------------------
// Set focus polygon style
//-------------------------
function setFocusPoly(poly)
{
	if(typeof poly == "undefined") return;

	poly.setStroke(FOCUS_BORDER_COLOR);
	poly.setStrokeWidth(2);
	poly.moveToTop();
	lastFocusPolyId = poly.polyId;
}

//----------------------------
// Set un-focus polygon style
//----------------------------
function clearFocusPoly(poly)
{
	if(typeof poly == "undefined") return;

	poly.setStroke(BLOCK_BORDER_COLOR);
	poly.setStrokeWidth(2);
	lastFocusPolyId = -1;
}

//----------------------------
// Set shadow
//----------------------------
function setShadow(poly)
{
	//poly.enableShadow();
	poly.setShadowColor('black');
	poly.setShadowBlur(5);
	poly.setShadowOffset([4, 4]);
	poly.setShadowOpacity(0.8);
}

//----------------------------
// clear shadow
//----------------------------
function clearShadow(poly)
{
	//poly.disableShadow();
	poly.setShadowColor('white');
	poly.setShadowBlur(0);
	poly.setShadowOffset([0, 0]);
	poly.setShadowOpacity(0);
}

//----------------------------------
// convert a block to outline shape
//----------------------------------
function block2OutlineShape(block, x, y, color, lineWidth)
{
	var poly = block2Polygon(block);

	var outlineShape = new Kinetic.Shape({
		x: x,
		y: y,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//draw vertical line
			context.beginPath();
			context.moveTo(poly[0], poly[1]);
			for(var x = 2; x < poly.length; x+=2) {
				context.lineTo(poly[x], poly[x+1]);
			}
			context.lineTo(poly[0], poly[1]);
			context.closePath();
			//context.stroke(context);
			canvas.fillStroke(this);
		},
		stroke: color,
		strokeWidth: lineWidth
	});

	return outlineShape;
}

//------------------------------------------------------------
// convert polygon position (left-up cell) to board (X, Y)
//
// input:
// (polyX, polyY) = polygen (0,0) position on screen
// (offsetX, offsetY) = from (0,0) to center position
//
// output:
// (x, y) = block (0,0) position for try put into gBoardState
// (boardX, boardY) = center position of polygen on screen
//
// x= -1 : position out of board or over precision
// notes: (x,y) range = [1..SCREEN_BOARD_X], [1..SCREEN_BOARD_Y]
//------------------------------------------------------------
function getPositionOfPoly(polyX, polyY, offsetX, offsetY)
{
	var boardX, boardY;
	var precision = 10;		//	(Precision)
	var rx = ry = -1;

	for(var x = 0; x < SCREEN_BOARD_X; x++) {
		boardX = boardStartX + x * BLOCK_CELL_SIZE;
		if(polyX < boardX-precision || polyX > boardX+precision) continue;
		break;
	}
	if(x >= SCREEN_BOARD_X) return {x:-1, y:-1};

	for(var y = 0; y < SCREEN_BOARD_Y; y++) {
		boardY = boardStartY + y * BLOCK_CELL_SIZE;
		if(polyY < boardY-precision || polyY > boardY+precision) continue;

		return {x:x+1, y:y+1, boardX:boardX+offsetX, boardY:boardY+offsetY};
	}

	return { x:-1, y:-1};
}

//----------------
// Remove Block
//----------------
function removeBlock(board, poly)
{
	//this poly must in the board;
	//remove block from board
	removeBlockFromBoard(board, gPolyGroup[poly.polyId].block, poly.pos); //external function
	setShadow(poly);
	//clearOutline(poly.outline); //clear the outline from screen
	setColor(poly, 0.8); //set softer color

	poly.pos.x = -1; //means not in the board
	gBlockCellUsed -= gPolyGroup[poly.polyId].block.length;
	gBlockUsed--;
}

//--------------------------------
// remove polygon from gBoardState
//--------------------------------
function removeFromBoard(poly)
{
	if(poly.pos.x > 0) {
		removeBlock(gBoardState, poly);
		removePolyIdFromInsertOrder(poly.polyId); //for hints button
		removeCheck(); //check board state has solution or not
		return (1);
	}
	return (0);
}

//-------------------------------
// get block center point
// return: {x:width/2, y:high/2}
//-------------------------------
function getCenterPos(block)
{
	var leftUpX, leftUpY, rightDnX, rightDnY;

	leftUpX = rightDnX = block[0].x;
	leftUpY = rightDnY = block[0].y;

	for(var i =1; i < block.length; i++) {
		if(block[i].x < leftUpX) leftUpX = block[i].x;
		if(block[i].y < leftUpY) leftUpY = block[i].y;

		if(block[i].x > rightDnX) rightDnX = block[i].x;
		if(block[i].y > rightDnY) rightDnY = block[i].y;
	}

	return { x:(1+rightDnX-leftUpX)/2, y:(1+rightDnY-leftUpY)/2 };
}

//--------------------------------
// get left-top position of block
//--------------------------------
function getLeftUpPos(block)
{
	var left = block[0].x; up = block[0].y;

	for(var i =1; i < block.length; i++) {
		if(left > block[i].x) left = block[i].x;
		if(up > block[i].y) up = block[i].y;
	}
	return {x:left, y:up };
}

//--------------------------------
// try insert block to gBoardState
//--------------------------------
//
//       (0,0)  (0,1)
//   (x)   +-----+
// (-1,1)  |     |
//    +----+     |
//    |      (+) |
//    +----+     +-----+ (2,2)
// (-1,2)  |           |
//         +-----------+ (2,3)
//    |<-1.5->|
//
//  leftUpPos (x) = (-1, 0)
//  centerPos (+) = (1.5, 1.5)  <== (width/2, high/2)
// (unit: block cell)
//
// goal: want to get screen position of (0,0)
//
// assume:
// (1) block cell size = 40
// (2) rotate degree = 0
// (3) screen center pos = (100, 200)
//
//  offsetPos = (centerPos + leftUpPos) = (1.5,1.5) + (-1,0) = (0.5, 1.5)
//
// screen position of (0,0)
// = screenCenterPos - offsetPos X blockCellSize
// = (100, 200) - (0.5, 1.5) X 40
// = (100, 200) - (20, 40)
// = ( 80, 160)
//
// ----------------------------------------------------------------------------
//
// why center Point of block need swap ?
//
//   0, 180 degree                       90, 270 degree
//   +---+
//   |   |                             +---------+
//   | + |   center point = (0.5, 1)   |    +    |  center point = (1, 0.5)
//   |   |                             +---------+
//   +---+
//

function tryInsert2Board(poly)
{
	var polyX, polyY;
	var offsetX, offsetY; //offset of (0,0) to center point

	var centerPointSwap = (poly.getRotationDeg() / 90) & 1; //0, 90, 180, 270  ==> 0, 1, 0, 1
	var curLeftUpPos = getLeftUpPos(gPolyGroup[poly.polyId].block);

	var polyPos;

	//offset = from (0,0) to center position
	if(centerPointSwap) { //swap if rotate 90 or 270 degree
		offsetX = (poly.centerPos.y + curLeftUpPos.x) * BLOCK_CELL_SIZE;
		offsetY = (poly.centerPos.x + curLeftUpPos.y) * BLOCK_CELL_SIZE;
	} else {
		offsetX = (poly.centerPos.x + curLeftUpPos.x) * BLOCK_CELL_SIZE;
		offsetY = (poly.centerPos.y + curLeftUpPos.y) * BLOCK_CELL_SIZE;
	}

	//(poly.getPosition().x ,poly.getPosition()y ) = center position of the polygon on screen,
	//polygon position of (0,0) = centerPos - offset
	polyX = poly.getPosition().x - offsetX;
	polyY = poly.getPosition().y - offsetY;

	polyPos = getPositionOfPoly(polyX, polyY, offsetX, offsetY);

	if(polyPos.x > 0) { //poly in board
		//try insert to board
		if (!DEBUG)	{ console.log('linea 1356, llamamos a insertBlockToBoard() desde tryInsert2Board'); };

		if(insertBlockToBoard(gBoardState, SCREEN_BOARD_X, SCREEN_BOARD_Y, gPolyGroup[poly.polyId].block, polyPos, poly.blockId+1)) {
			//insert success
			poly.pos = polyPos;
			gBlockCellUsed += gPolyGroup[poly.polyId].block.length;
			gBlockUsed++;
			addPolyId2InsertOrder(poly.polyId); //block order for hints button
			return (1);
		}
	}
	return (0);
}

//----------------------------------------
// create polygon group from block group
//----------------------------------------
function createPolygon(blockGroup, fixedBlock)
{
	var id, i, polyId=0;
	var firstStyle;
	var poly, centerPos, leftUpPos;
	var pos;
	var poly;

	gPolyGroup = [];
	for(id = 0 ; id < blockGroup.length; id++) {
		if(blockGroup[id].order >= 0 && blockGroup[id].order < fixedBlock) {
			gBlockCellUsed += blockGroup[id].blockStyle[0].length;
			gBlockUsed++;

		//remarked, polyId < 0 for fixed block
		////blockGroup[id].polyId = -1; //fixed block without polygen
			continue; //fixed block
		} else {
			blockGroup[id].polyId = polyId; //blockGroup link to polyGroup
		}

		firstBlock = blockGroup[id].blockStyle[0]; //get the first block

		//conver block to polygon
		poly = block2Polygon(firstBlock);

		gPolyGroup[polyId] = {};

		//duplicate first block
		gPolyGroup[polyId].block = [];
		for(i = 0; i < firstBlock.length; i++) {
			gPolyGroup[polyId].block[i] = {};
			gPolyGroup[polyId].block[i].x = firstBlock[i].x;
			gPolyGroup[polyId].block[i].y = firstBlock[i].y;
		}

		leftUpPos = getLeftUpPos(gPolyGroup[polyId].block);
		centerPos = getCenterPos(gPolyGroup[polyId].block);

		pos = getPolyInitPos(polyId);

		gPolyGroup[polyId].poly = new Kinetic.Polygon({
			x: pos.x,
			y: pos.y,
			points: poly,
			fill: colorSofter(blockGroup[id].color, 0.8),
			stroke: BLOCK_BORDER_COLOR,
			strokeWidth: 2,
			//offset = center position of polygon (relative to left-up position)
			offset: [ (centerPos.x+leftUpPos.x) * BLOCK_CELL_SIZE, (centerPos.y+leftUpPos.y) *  BLOCK_CELL_SIZE ],
			dragBoundFunc: function(pos) {
				return checkPolyBound(this, pos);
			}
		});

		poly = gPolyGroup[polyId].poly;
		poly.blockId = id; //index for reference to gBlockGroup
		poly.polyId = polyId; //index for reference to gPolyGroup
		poly.pos = { x:-1, y:-1 }; //current polygen position in board
		poly.centerPos = centerPos;

		setShadow(poly);

		//hasRotate and hasFlip for display filp & rotate operator
		//	poly.hasRotate = (blockGroup[id].blockStyle.length != 1);
		//	poly.hasFlip   = blockGroup[id].hasFlip;

		polyId++;
	}
}

function checkPolyBound(poly, pos)
{
	var x = pos.x;
	var y = pos.y;
	var degree = poly.getRotationDeg();
	var centerX = poly.centerPos.x * BLOCK_CELL_SIZE;
	var centerY = poly.centerPos.y * BLOCK_CELL_SIZE;

	if(degree%180 == 0) {
		if(pos.x < centerX+1) x = centerX+1;
		if(pos.x > STAGE_X - centerX-5) x = STAGE_X - centerX-5;

		if(pos.y < centerY+1) y = centerY+1;
		if(pos.y > STAGE_Y - centerY-5) y = STAGE_Y - centerY-5;
	} else {
		//X Y swap
		if(pos.x < centerY+1) x = centerY+1;
		if(pos.x > STAGE_X - centerY-5) x = STAGE_X - centerY-5;

		if(pos.y < centerX+1) y = centerX+1;
		if(pos.y > STAGE_Y - centerX-5) y = STAGE_Y - centerX-5;
	}

	return {x:x,y:y};
}

//-------------------------------------------------------------------
// clone polygon group from backup polygon
//
// if restore from backup it can not drag again with kineticJS 4.4.0
// so re-create object and copy attr from backup - 04/04/2013
//-------------------------------------------------------------------
function clonePolygon(savePolyGroup, fixedBlock)
{
	var id, i;
	var firstStyle;
	var poly;
	var pos;
	var poly;

	gPolyGroup = [];
	for(id = 0 ; id < savePolyGroup.length; id++) {

		gPolyGroup[id] = {};
		gPolyGroup[id].block = [];

		for(i = 0; i < savePolyGroup[id].block.length; i++) {
			gPolyGroup[id].block[i] = {};
			gPolyGroup[id].block[i].x = savePolyGroup[id].block[i].x;
			gPolyGroup[id].block[i].y = savePolyGroup[id].block[i].y;
		}

		gPolyGroup[id].poly = new Kinetic.Polygon({
			x: savePolyGroup[id].poly.getX(),
			y: savePolyGroup[id].poly.getY(),
			points: savePolyGroup[id].poly.getPoints(),
			fill: savePolyGroup[id].poly.getFill(),
			stroke: savePolyGroup[id].poly.getStroke(),
			strokeWidth: savePolyGroup[id].poly.getStrokeWidth(),
			offset: savePolyGroup[id].poly.getOffset(),
			dragBoundFunc: function(pos) {
				return checkPolyBound(this, pos);
			}

		});

		poly = gPolyGroup[id].poly;
		poly.blockId = savePolyGroup[id].poly.blockId; //index for reference to gBlockGroup
		poly.polyId = id; //index for reference to gPolyGroup
		poly.pos = savePolyGroup[id].poly.pos; //current polygen position in board
		poly.centerPos = savePolyGroup[id].poly.centerPos;

		var scale = savePolyGroup[id].poly.getScale();
		poly.setScale(scale.x, scale.y);
		poly.setRotationDeg(savePolyGroup[id].poly.getRotationDeg());

		setShadow(poly);
		//setPolyBound(poly);

		//hasRotate and hasFlip for display filp & rotate operator
		poly.hasRotate = savePolyGroup[id].poly.hasRotate;
		poly.hasFlip   = savePolyGroup[id].poly.hasFlip;

	}
}


function activePolygon()
{
	if (DEBUG2)
	{
		console.log('linea 1499, gPolyGroup: ' + gPolyGroup);
		console.log('linea 1500, gPolyGroup.length: ' + gPolyGroup.length);
	}
	//inactivePolygon();
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;

		poly.setDraggable(true);

		// add cursor style
		poly.on('pointerover', function() {
			document.body.style.cursor = 'move';
		});

		poly.on('pointerout', function() {
			document.body.style.cursor = 'default';
			//	console.log( "inicio Dragstart ----------------------------" );
		});

		poly.on('dragstart', function() {

			removeFromBoard(this);
			clearFocusPoly(getLastFocusPoly());
			//	hideOperatorObject(); //disable operator before drag

			//	boton operador
			//	ocultaBotonOperador();

			setFocusPoly(this);
			setShadow(this);
			gBoardLayer.draw();
		});

		poly.on('dragend', function() {
			//	console.log( "inicio Dragend ----------------------------" );
			if(tryInsert2Board(this)) {
				//insert success

				//set to precise location
				this.setX(this.pos.boardX);
				this.setY(this.pos.boardY);

				//this.moveToBottom(); //move to bottom of board
				this.setZIndex(gBlockUsed+1); //after (board + blockUsed)

				clearFocusPoly(this);
				hideOperatorObject();

				//	boton operador
				//	ocultaBotonOperador();

				clearShadow(this);
				//drawOutline(this);
				setColor(this, 1); //set normal color
				gBoardLayer.draw();
				insertCheck();
			} else {
				//	showOperatorObject(this); //enable operator if insert failed
				//	y habilito el boton equivalente
				muestraBotonOperador(this);		//	para vincular al boton operador
			}

			//dumpBoard(gBoardState); //for debug only
		});

		poly.on('click', function() {

			//	console.log( "inicio click, this: " + Object.values(this));

			clearFocusPoly(getLastFocusPoly());
			hideOperatorObject(); //remove operator from old position

			//	boton operador
			//	ocultaBotonOperador();

			removeFromBoard(this);
			setFocusPoly(this);
			setShadow(this);
			showOperatorObject(this); //enable operator at new position

			//	y habilito el boton equivalente
			muestraBotonOperador(this);

			//dumpBoard(gBoardState); //for debug only
		});
/*
		poly.on('dragmove click', function() {
			// for debug only
			//writeMessage("(x,y) = (" + this.getPosition().x + "," + this.getPosition().y + '), offset(x,y)=(' + this.getOffset().x + ", " + this.getOffset().y  + "), scale = (" + this.getScale().x + ", " + this.getScale().y + "), RotationDeg = " + this.getRotationDeg() );
		});
*/
	}
}

function inactivePolygon()
{
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		poly.setDraggable(false);
		poly.off('pointerover pointerout dragstart dragend click');
	}
	document.body.style.cursor = 'default';
}

//===========================================
// BEGIN for rotate & flip polygon block
//===========================================

//-------------------------------------
// 90 degree clockwise a polygon block
//-------------------------------------
var animateRotate90Object = new animateRotate90();
function rotate90(poly, time)
{
	var block = gPolyGroup[poly.polyId].block;


	if(animateRotate90Object.isRunning()) return;
	//console.log(poly.getRotationDeg());
	if(typeof time == "undefined") time = 150;
	animateRotate90Object.init(poly, time);
	animateRotate90Object.start();

	//block rotate 90 degree clockwise, (X, Y) ==> (-Y, X)
	for(var i = 0 ; i < block.length; i++) {
		var tmpX = block[i].x;
		block[i].x = -block[i].y;
		block[i].y = tmpX;
	}
	blockNormalization(block); //external function
}

function rotate90Running()
{
	return animateRotate90Object.isRunning();
}

//---------------------------------
// left-right flip a polygon block
//---------------------------------
var animateFlipObject = new animateLeftRightFlip();
function leftRightFlip(poly, time)
{
	if (DEBUG)	{	console.log('gPolyGroup[poly.polyId]: ' + Object.values(gPolyGroup[poly.polyId]) );	};

	var block = gPolyGroup[poly.polyId].block;

	if(animateFlipObject.isRunning()) return;
	if(typeof time == "undefined") time = 150;
	animateFlipObject.init(poly, time);
	animateFlipObject.start();

	//block left right flip, (X , Y) ==> (-X , Y)
	for(var i = 0 ; i < block.length; i++) {
		block[i].x = -block[i].x
	}
	blockNormalization(block); //external function
}

function leftRightFlipRunning()
{
	return animateFlipObject.isRunning();
}

//---------------------------------------
// 90 degree clockwise the focus polygon
//---------------------------------------
function rotateFocusPoly()
{
	//----------------------------------------------------------------------------------------
	// For (kineticJS 4.4.0)
	// previous version will reset degree to 0 if degree >= 360 in animateRotate90 function
	// but it can not work for kineticJS 4.4.0, so set here
	//----------------------------------------------------------------------------------------
	if(getLastFocusPoly().getRotationDeg() >= 360) { // >= 360 degree
		getLastFocusPoly().setRotation(0);
	}
	rotate90(getLastFocusPoly());

	//gBoardLayer.draw();
}

//-----------------------------------
// left-right flip the focus polygon
//-----------------------------------
function flipFocusPoly()
{
	leftRightFlip(getLastFocusPoly());
	////gBoardLayer.draw();
}

var rotateObject; //a rotate object, display on the focus polygon
var flipObject;   //a flip object, display on the focus polygon

//--------------------------------
// create flip & rotate operator
//--------------------------------
function createOperatorObject()
{
	var radius = (BLOCK_CELL_SIZE)/4;

	rotateObject = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//create a circle, opacity = 0.3
			context.beginPath();
			context.arc(0, 0, radius, 0, 2.0 * Math.PI, false);
			context.fillStyle =OPERATOR_CIRCLE_COLOR;
			context.fill();
			canvas.fill(this); //for pointer selection


			//create a rotate arrow, opacity = 1.0
			context.beginPath();
			context.globalAlpha=1.0
			context.arc(0, 0, radius, 1.3 * Math.PI, 2.1 * Math.PI, false);
			context.lineTo(2*radius/3,-radius/3);
			context.lineTo(radius+radius/10,-radius/2.5);
			context.arc(0, 0, radius, 2.1 * Math.PI, 2.1 * Math.PI, true);
			context.arc(0, 0, radius, 2.1 * Math.PI, 1.3 * Math.PI, true);
			context.stroke();
			canvas.fillStroke(this);

			//create a rotate arrow, opacity = 1.0
			context.beginPath();
			context.arc(0, 0, radius, 2.3 * Math.PI, 1.1 * Math.PI, false);
			context.lineTo(-2*radius/3,radius/3);
			context.lineTo(-radius-radius/10,+radius/2.5);
			context.lineTo(-radius,0);
			context.arc(0, 0, radius, 1.1 * Math.PI, 1.1 * Math.PI, true);
			context.arc(0, 0, radius, 1.1 * Math.PI, 2.3 * Math.PI, true);
			context.stroke();
			canvas.fillStroke(this);

		},
		opacity: 0.3,
//		fill: OPERATOR_CIRCLE_COLOR,
		stroke: OPERATOR_COLOR, //blue
		strokeWidth: 2
	});


	// add cursor style
	rotateObject.on('pointerover', function() {
		document.body.style.cursor = 'pointer';
	});

	rotateObject.on('pointerout', function() {
		document.body.style.cursor = 'default';
	});

	rotateObject.on('click', function() {
		rotateFocusPoly();
	});

	//---------------------------------------------------------------

	flipObject = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//create a circle, opacity = 0.3
			context.beginPath();
			context.arc(0, 0, radius, 0, 2.0 * Math.PI, false);
			context.fillStyle =OPERATOR_CIRCLE_COLOR;
			context.fill();
			canvas.fill(this); //for pointer selection


			//create a left arrow, opacity = 1.0
			context.beginPath();
			context.globalAlpha=1.0

			context.lineTo(radius/10,0);
			context.lineTo(4*radius/5,0);
			context.lineTo(4*radius/5,-radius/5);
			context.lineTo(radius+radius/5,0);
			context.lineTo(4*radius/5,radius/5);
			context.lineTo(4*radius/5,0);
			context.lineTo(radius/10,0);
			context.fill();
			canvas.fill(this);
			//context.stroke(context);
			canvas.fillStroke(this);

			//create a right arrow, opacity = 1.0
			context.beginPath();
			context.lineTo(-radius/10,0);
			context.lineTo(-4*radius/5,0);
			context.lineTo(-4*radius/5,-radius/5);
			context.lineTo(-radius-radius/5,0);
			context.lineTo(-4*radius/5,+radius/5);
			context.lineTo(-4*radius/5,0);
			context.lineTo(-radius/10,0);
			context.fill();
			canvas.fill(this);
			//context.stroke(context);
			canvas.fillStroke(this);
		},
		opacity: 0.3,
//		fill: OPERATOR_CIRCLE_COLOR,
		stroke: OPERATOR_COLOR, //blue
		strokeWidth: 2
	});

	// add cursor style
	flipObject.on('pointerover', function() {
		document.body.style.cursor = 'pointer';
	});

	flipObject.on('pointerout', function() {
		document.body.style.cursor = 'default';
	});

	flipObject.on('click', function() {
		flipFocusPoly();
	});
}

var rotateOperatorStatus = 0; //0: remove, 1:add
var flipOperatorStatus = 0; //0: remove, 1:add

//---------------------------------------------
// Add flip & rotate object to layer (kinetic)
//---------------------------------------------
function addOperator2Layer()
{
	gBoardLayer.add(rotateObject);
	gBoardLayer.add(flipObject);
	rotateObject.hide();
	flipObject.hide();
	rotateOperatorStatus = 0;
	flipOperatorStatus = 0;
}

function showOperatorObject(poly)
{
	console.log('----	function showOperatorObject(poly)	')
	var cx = poly.getPosition().x;
	var cy = poly.getPosition().y;

	if(poly.hasRotate) {
		rotateObject.show();
		rotateObject.setX(cx);
		rotateObject.setY(cy);
		rotateObject.moveToTop();
		rotateOperatorStatus = 1;
	}

	if(poly.hasFlip) {
		flipObject.show();
		flipObject.setX(cx);
		flipObject.setY(cy -(BLOCK_CELL_SIZE)*2/3);
		flipObject.moveToTop();
		flipOperatorStatus = 1;
	}
	gBoardLayer.draw();

}

//--------------------------------------------------
// Remove flip & rotate object from layer (kinetic)
//--------------------------------------------------
function hideOperatorObject()
{
	if(rotateOperatorStatus) {
		//gBoardLayer.remove(rotateObject);
		rotateObject.hide();
	}
	if(flipOperatorStatus) {
		//gBoardLayer.remove(flipObject);
		flipObject.hide();
	}
	rotateOperatorStatus = 0;
	flipOperatorStatus = 0;
}

//==========================
// BEGIN for search answer
//==========================

//---------------------------------------------
// find board answer
// inUsedFromPoly: need set used block or not
//---------------------------------------------
function findAnswer(board, inUsedFromPoly)
{
	var op = { rotate:0, leftRightFlip:0, upDownFlip:0 };
	var answerBoard = screenBoard2AnswerBoard(board, op);
	var answer = new polySolution(); //external function
	var result;
	var boardX, boardY;

	if(inUsedFromPoly) setBlockInUsed();
	else clearBlockInUsed();

	if(op.rotate) {
		boardX = SCREEN_BOARD_Y;
		boardY = SCREEN_BOARD_X;
	} else {
		boardX = SCREEN_BOARD_X;
		boardY = SCREEN_BOARD_Y;
	}
	answer.init(answerBoard, boardX, boardY, 1, gBlockGroup, 1);
	result = answer.find();

	if(result.totalAnswer > 0) {
		//notes: copy back to solvedBoard not solvedBoard[0]
		result.solvedBoard = dupAnswerBoard2ScreenBoard(result.solvedBoard[0], op);
		result.op = op;
	}
	return result;
}

//-----------------------------------------------
// duplicate screen board state to answer board
// for speed up search answer,
// (1) let boardX <= boardY
// (2) let up cell count >= down cell count
// (3) let left cell count >= right cell count
//-----------------------------------------------
function screenBoard2AnswerBoard(srcBoard, op)
{
	var dstBoard;
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var leftCellCount = rightCellCount = upCellCount = downCellCount = 0;

	//(1) let boardX <= boardY
	if(boardX > boardY) {
		op.rotate = 1;
		dstBoard = rotateBoard(srcBoard);
		boardX = dstBoard.length;
		boardY = dstBoard[0].length;
	} else {
		dstBoard = dupBoard(srcBoard);
	}
	//dumpBoard(dstBoard);

	var halfX = boardX/2;
	var halfY = boardY/2;

	//(2) let up cell count >= down cell count
	for(var x=1; x < boardX; x++) {
		for(var y=1; y <= boardY; y++) {
			if(!dstBoard[x][y]) continue;

			if(x < halfX) leftCellCount++;
			else rightCellCount++;

			if(y < halfY) upCellCount++;
			else downCellCount++;
		}
	}

	if(upCellCount < downCellCount) {
		op.upDownFlip = 1;
		dstBoard = upDownFlipBoard(dstBoard);
	}
	//dumpBoard(dstBoard);

	//(3) let left cell count >= right cell count
	if(leftCellCount < rightCellCount) {
		op.leftRightFlip = 1;
		dstBoard = leftRightFlipBoard(dstBoard);
	}
	//dumpBoard(dstBoard);

	return dstBoard;
}

//---------------------
// create a new board
//---------------------
function dupBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];

	for(var x = 0; x < boardX ; x++) {
		dstBoard[x] = [];
		for(var y = 0; y < boardY ; y++) {
			dstBoard[x][y] = srcBoard[x][y];
		}
	}
	return dstBoard;
}

//-----------------------------
// create a rotate board
// (x, y) ==> (y, x)
//-----------------------------
function rotateBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];

	for(var y = 0; y < boardY ; y++) {
		dstBoard[y] = [];
		for(var x = 0; x < boardX ; x++) {
			dstBoard[y][x] = srcBoard[x][y];
		}
	}
	return dstBoard;
}

//-----------------------------
// create a up down flip board
//-----------------------------
function upDownFlipBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];

	for(var x=0; x < boardX; x++) {
		dstBoard[x] = [];
		for(var y=0; y < boardY; y++) {
			dstBoard[x][y] = srcBoard[x][boardY-y-1];
		}
	}
	return dstBoard;
}

//--------------------------------
// create a left right flip board
//--------------------------------
function leftRightFlipBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];

	for(var x=0; x < boardX; x++) {
		dstBoard[x] = [];
		for(var y=0; y < boardY; y++) {
			dstBoard[x][y] = srcBoard[boardX-x-1][y];
		}
	}
	return dstBoard;
}

//-----------------------------------------------
// duplicate answer board to screen board
// base on screenBoard2AnswerBoard operator
// inverse the order to create screen board
// (1) left right flip
// (2) up down flip
// (3) rotate
//-----------------------------------------------
function dupAnswerBoard2ScreenBoard(srcBoard, op)
{
	if(op.leftRightFlip) srcBoard = leftRightFlipBoard(srcBoard);
	if(op.upDownFlip) srcBoard = upDownFlipBoard(srcBoard);
	if(op.rotate) srcBoard = rotateBoard(srcBoard);
	//dumpBoard(srcBoard);

	return (srcBoard);

}

//----------------------
// clear block in used
//----------------------
function clearBlockInUsed()
{
	for(var g = 0; g < gBlockGroup.length; g++) {
		gBlockGroup[g].blockUsed = 0;
	}
}

//--------------------
// set block in used
//--------------------
function setBlockInUsed()
{
	//(1) fixed block
	for(var g = 0; g < gBlockGroup.length; g++) {
		if(gBlockGroup[g].polyId <0) { //block without polygon means fixed
			gBlockGroup[g].blockUsed = 1;
		} else {
			gBlockGroup[g].blockUsed = 0;
		}
	}

	//(2) exist poly, insert by user
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;

		if(poly.pos.x > 0) {
			gBlockGroup[poly.blockId].blockUsed = 1;
		} else {
			gBlockGroup[poly.blockId].blockUsed = 0;
		}
	}
}

//==========================================
// BEGIN for check solution & checkbox
//==========================================

var checkSolution = false;
//--------------------------------------
// check solution after insert a block
//--------------------------------------
function insertCheck()
{
	if (DEBUG2)
	{
		console.log('linea 2129, gBlockCellUsed: ' + gBlockCellUsed );
		console.log('linea 2130, gTotalBlockCell: ' + gTotalBlockCell);
	};

	if(gBlockCellUsed >= gTotalBlockCell) {
		inactivePolygon();
		disableAllButton();
		setTimeout(function() {writeFinishMsg();}, 500); //wait 500 ms
		sloveState = 1;
		return;
	}

	if (DEBUG2)
	{
		console.log('linea 2143, checkSolution: ' + checkSolution);
	};


	if(checkSolution) check();
}

//--------------------------------------
// check solution after remove a block
//--------------------------------------
function removeCheck()
{
	writeMessage("");
	if(checkSolution) check();
}

//----------------
// check solution
//----------------
function check()
{
	var result = findAnswer(gBoardState, 1);

	if(result.totalAnswer <= 0) {
		writeMessage(noSolutionText);
		//console.log("No solution, " + "(" + result.elapsedTime + ")");
	} else {
		writeMessage("");
		//dumpBoard(result.solvedBoard[0]);
		//console.log("Elapsed Time : " + result.elapsedTime + "s");
	}
	return result.totalAnswer;
}

//--------------------------
// on checkbox changed
//--------------------------
function checkButton(checked)
{
	checkSolution = checked;

	writeMessage("");
	if(gBlockCellUsed >= gTotalBlockCell) return; //solved
	if(checkSolution) check();
}



//===============================================================
// BEGIN for Hints
//===============================================================

var polyIdOrder;		//	guarda el orden de insercion de poliominos / poligonos utilizado en las ayuditas
//----------------------------------
// clear polygon insert-order stack
//----------------------------------
function clearPolyInsertOrder()
{
	polyIdOrder = [];
}

//---------------------------------------
// add polygon id to insert-order stack
//---------------------------------------
function addPolyId2InsertOrder(id)
{
	polyIdOrder.push(id);
}

//-------------------------------------------------
// remove exist polygon id from insert-order stack
//-------------------------------------------------
function removePolyIdFromInsertOrder(id)
{
	for(var i=0; i< polyIdOrder.length; i++) {
		if(polyIdOrder[i] == id) {
			polyIdOrder.splice(i, 1);
			break;
		}
	}
}

//----------------------------------------
// get polygon id from insert-order stack
//----------------------------------------
function getPolyIdFromInsertOrder()
{
	return polyIdOrder.pop();
}

//---------------------
// Press hints button
//---------------------
function hintsButton()
{
	var result;
	var moveTime = 350;
	var flashObject;
	var poly, polyId;

	if(gBlockCellUsed >= gTotalBlockCell) return; //solved

	//dumpBoard(gBoardState);
	result = findAnswer(gBoardState, 1);
	while(result.totalAnswer <= 0) {
		//-------------------------------------------------------------
		// Current board state has no solution,
		// try remove one block (base on block order) step by step
		// until find the answer
		//-------------------------------------------------------------
		//get the last inserted block
		polyId = getPolyIdFromInsertOrder();	//	es la identificacion del ultimo poligono insertado

		if (DEBUG)
		{
			console.log('linea 2223, polyId: ' + polyId);
			console.log('gPolyGroup[polyId]: ' + gPolyGroup[polyId]);
			console.log('            result: ' + result);
			console.log('result.solvedBoard: ' + result.solvedBoard );
			console.log('	      result.op; ' + result.op );
		}

		//remove it from gBoardState
		poly = gPolyGroup[polyId].poly;
		removeBlock(gBoardState, poly)

		//try find answer
		result = findAnswer(gBoardState, 1);
	}
	writeMessage("");

	clearFocusPoly(getLastFocusPoly());
	hideOperatorObject();

	//	boton operador
	//	ocultaBotonOperador();

	disableAllButton();
	if(!animateBlockBack(moveTime)) moveTime = 0;
	flashObject = animateHintsBlock(result.solvedBoard, result.op, moveTime);

	enableButtonAfterStopRunning(flashObject);
}

//---------------------------
// disable all input button
//---------------------------
function disableAllButton()
{
	//select
	document.getElementById('levelButton').disabled=true;

	document.getElementById('hintsButton').disabled=true;
	document.getElementById('newButton').disabled=true;
	document.getElementById('resetButton').disabled=true;
	document.getElementById('giraPieza').disabled=true;
	document.getElementById('volteaPieza').disabled=true;


	//checkbox
	document.getElementById('checkButton').disabled=true;
}

//--------------------------
// enable start input button
//--------------------------
function visibleStartButton()
{
	document.getElementById('startButton').disabled=false;
	document.getElementById('startButton').style.visibility='visible';

	document.getElementById('myNumber').disabled=false;
	document.getElementById('myNumber').style.visibility='visible';

	
}

//--------------------------
// enable start input button
//--------------------------
function hiddenStartButton()
{
	document.getElementById('startButton').disabled=true;
	document.getElementById('startButton').style.visibility='hidden';
}

//--------------------------
// enable all input button
//--------------------------
function enableAllButton()
{
	document.getElementById('levelButton').disabled=false;

	document.getElementById('hintsButton').disabled=false;
	document.getElementById('newButton').disabled=false;
	document.getElementById('resetButton').disabled=false;
	document.getElementById('giraPieza').disabled=false;
	document.getElementById('volteaPieza').disabled=false;


	//checkbox
	document.getElementById('checkButton').disabled=false;
}

//--------------------
// visible all button
//--------------------
function visibleAllButton()
{

	document.getElementById('levelButton').style.visibility='visible';

	document.getElementById('hintsButton').style.visibility='visible';
	document.getElementById('newButton').style.visibility='visible';
	document.getElementById('resetButton').style.visibility='visible';
	document.getElementById('giraPieza').style.visibility='visible';
	document.getElementById('volteaPieza').style.visibility='visible';


	//checkbox
	document.getElementById('checkButton').style.visibility='visible';
	document.getElementById('checkboxtext').style.visibility='visible';
}

//--------------------
// hidden all button
//--------------------
function hiddenAllButton()
{

	document.getElementById('levelButton').style.visibility='hidden';

	document.getElementById('hintsButton').style.visibility='hidden';
	document.getElementById('newButton').style.visibility='hidden';
	document.getElementById('resetButton').style.visibility='hidden';
	document.getElementById('giraPieza').style.visibility='hidden';
	document.getElementById('volteaPieza').style.visibility='hidden';


	//checkbox
	document.getElementById('checkButton').style.visibility='hidden';
	document.getElementById('checkboxtext').style.visibility='hidden';
}

//-----------------------------------------------
// Move un-fixed block back to initial position
//-----------------------------------------------
function animateBlockBack(moveTime)
{
	var id;
	var poly;
	var endPos;
	var movedPoly;
	var count=0;

	for(var id = 0; id < gPolyGroup.length; id++) {
		poly = gPolyGroup[id].poly;
		if(poly.pos.x > 0) continue; //already in board (fixed)

		endPos = getPolyInitPos(id);

		//don't move the poly if the position same as initial position
		if(Math.round(poly.getX()) == endPos.x && Math.round(poly.getY()) == endPos.y) continue;

		//move poly back to initial position
		poly.moveToTop()
		poly.transitionTo({
			x: endPos.x,
			y: endPos.y,
			duration: moveTime/1000
		});

		count++;
	}
	return count;
}

//---------------------------------
// random flash a available block
//---------------------------------
function animateHintsBlock(solvedBoard, op, startFlashTime)
{
	var	flashOutline;

	if (DEBUG2)
	{
		for (var j=0; j < gBlockGroup.length ; j++)
		{
			console.log('gBlockGroup [' + j + '] polyId	 : ' + gBlockGroup[j].polyId );
		}
	}
	var result = findAvailableBlock(solvedBoard);

	var startX = boardStartX + result.x * BLOCK_CELL_SIZE;
	var startY = boardStartY + result.y * BLOCK_CELL_SIZE;
	var id = result.id;

	if (!DEBUG) {
		console.log('linea 2397, result.id: ' + result.id );
		console.log('linea 2398, result: x * y * id : ' + result.x + ' * ' + result.y + ' * ' + result.id );
	}

	//	faltarian definir los blockStyle para el cuadrómino. No es nesario
	var hintsBlock = dupOpBlock(gBlockGroup[id].blockStyle[gBlockGroup[id].usedStyle], op, 1);
	var outlineShape = block2OutlineShape(hintsBlock, startX, startY, FLASH_BORDER_COLOR, 4)

	flashOutline = new animateFlash();

	flashOutline.init(outlineShape, gBoardLayer, startFlashTime, 3);
	flashOutline.start();

	return flashOutline;

}

//-----------------------------------------------
// random find a available block
// (next to the exist one)
//------------------------------------------------
function findAvailableBlock(solvedBoard)			//	busca aleatoriamente un bloque proximo al existente
{
	var fromVertical = Math.floor(Math.random()*2); //0: search from horizon, 1: search from vertical
	var boardX = solvedBoard.length-1;
	var boardY = solvedBoard[0].length-1;
	var blockId, polyId;

	if (DEBUG2)
	{
		console.log('linea 2427, findAvailableBlock(solvedBoard)');
		//	dumpBoard(solvedBoard);
	}

	if(fromVertical) {
		//search available block from Y than X
		outloopV0:
		for(var x= 1; x < boardX; x++) {
			for(var y= 1; y < boardY; y++) {
				blockId = solvedBoard[x][y]-1;

				if (DEBUG2) { console.log('linea 2435, blockId : ' + blockId ) };

				//	solamente si no se trata de un cuadromino
				if (blockId < 90){

					polyId = gBlockGroup[blockId].polyId;		//convert block id to poly id
					if(polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
						//block is not in gBoardState, found it !
						break outloopV0;
					}
				}
			}
		}

		//find the (0,0) position from X than Y
		outloopV1:
		for(var y= 1; y < boardY; y++) {
			for(var x= 1; x < boardX; x++) {
				if (solvedBoard[x][y]-1 == blockId) {
					break outloopV1;
				}
			}
		}
	} else {
		//from horizon
		//search available block from X than Y
		outloopH:
		for(var y= 1; y < boardY; y++) {
			for(var x= 1; x < boardX; x++) {
				blockId = solvedBoard[x][y]-1;

				if (DEBUG2) {
					console.log('linea 2470, x, y : ' + x + ' - ' + y );
					console.log('linea 2471, blockId : ' + blockId );
				}

				//	solamente si no se trata de un cuadromino
				if (blockId < 90){

					polyId = gBlockGroup[blockId].polyId; //convert block id to poly id

					if(polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
						//ploy is not in gBoardState, found it !
						break outloopH;
					}
				}
			}
		}
	}

	if (!DEBUG)
	{
		console.log('linea 2491, x-1, y-1, blockId: ' + x-1 + ' - ' + y-1 + ' - ' + blockId );
	}

	return {x:x-1, y:y-1, id:blockId};
}

//------------------------------------------
// enable all button after stop flash block
//------------------------------------------
function enableButtonAfterStopRunning(object, button )
{
	if(object.isRunning()) {
		setTimeout(function() {
			enableButtonAfterStopRunning(object, button);
		}, 200)
	} else {
		delete object;
		enableAllButton();
	}
}

//=========================
// BEGIN for reset button
//=========================

//------------------------------------------------
// Press reset button
// ==> move all polygon back to initial position
//------------------------------------------------
function resetButton()
{
	var result;
	var moveTime = 350;
	var flashObject;

	var poly;
	var polyId;

	//remove all fixed poly from board
	while(polyIdOrder.length > 0) {
		//get the last inserted block
		polyId = polyIdOrder.pop();

		//remove it from gBoardState
		poly = gPolyGroup[polyId].poly;
		removeBlock(gBoardState, poly)
	}

	//now no one poly in board, so clear "no solution"  message if exist
	writeMessage("");

	clearFocusPoly(getLastFocusPoly());
	hideOperatorObject();

	//	boton operador
	//	ocultaBotonOperador();

	if(animateBlockBack(moveTime)) {
		disableAllButton();
		//enable all button after move back
		setTimeout("enableAllButton();", moveTime+10);
	}
}

//============================================
// BEGIN for board size and level selection
//============================================

//---------------------------
// Input Selection info
//---------------------------
var boardSizeInfo = [
	{x:6, y:5,  numOfLevel:3 },
	{x:8, y:5,  numOfLevel:3 },
	{x:10, y:5, numOfLevel:4 },
	{x:10, y:6, numOfLevel:4 }
];





//=============================
// BEGIN for finished message
//=============================

//-------------------------
// display finish message
//-------------------------
function writeFinishMsg()
{
	var textHigh=26;
	var textWidth = 12;
	var scaleX = Math.floor((STAGE_X -10) / (finishText.length * textWidth));
	var scaleY = Math.floor((STAGE_Y/3)/textHigh) ;

	var finishMsg = new Kinetic.Text({

		x: STAGE_X/2 - finishText.length * textWidth/2,
		y: STAGE_Y/2 - textHigh/2,
		text:  finishText,
		fontSize: textHigh,
		fontStyle:"bold",
		fill: TEXT_FINISH_COLOR,

		shadowColor: 'black',
		shadowBlur: 1,
		shadowOffset: [8, 8],
		shadowOpacity:0.5
	});

	gBoardLayer.add(finishMsg);

	finishMsg.transitionTo({
		x: STAGE_X/2 - finishText.length * textWidth*scaleX /2,
		y:  STAGE_Y/2 - textHigh* scaleY /2 ,
		scale: {x:scaleX, y:scaleY},
		duration: 1, // 1 sec
		easing: "elastic-ease-in-out"
	});
	setTimeout("nextButton();",600); //after 600ms, display next button
}

//----------------------
// display next button
//----------------------
function nextButton()
{
	var textHigh= 16;
	var textWidth = 16;
	var padSize =8;

	var textAllWidth = nextText.length * textWidth+ padSize*2;
	var textAllHigh  = textHigh+padSize*2;
	var scaleX = Math.floor(STAGE_X/textAllWidth/4);
	var scaleY = Math.floor(STAGE_Y/textHigh/8) ;

	var centerX = STAGE_X * 3/4;
	var centerY = STAGE_Y * 4/5;

	var nextMsg = new Kinetic.Text({
		x: centerX - textAllWidth/2,
		y: centerY - textAllHigh/2,
		text: nextText,
		fill: NEXT_BUTTON_TEXT_COLOR,
		fontSize: textHigh,
		//fontFamily: "sans-serif",
		//fontFamily:"微軟正黑體",
		//fontStyle:"bold",

		align: 'center',
		width: textAllWidth,
		padding: padSize,
		stroke: NEXT_BUTTON_TEXT_COLOR,
		strokeWidth: 1
	});

	var nextRect = new Kinetic.Rect({
		x: centerX - textAllWidth/2,
		y: centerY - textAllHigh/2,
		stroke: NEXT_BUTTON_BORDER_COLOR,
		strokeWidth: 7,
		fill: NEXT_BUTTON_FILL_COLOR,
		width: textAllWidth,
		height: nextMsg.getHeight(),
		shadowColor: 'black',
		shadowBlur: 10,
		shadowOffset: [30, 30],
		shadowOpacity: 0.5,
		cornerRadius: 5
	});

	var nextGroup = new Kinetic.Group();
	nextGroup.add(nextRect);
	nextGroup.add(nextMsg);
	gBoardLayer.add(nextGroup);

	nextRect.transitionTo({
		x: centerX-textAllWidth*scaleX/2,
		y: centerY-textAllHigh*scaleY/2 ,

		scale: {x:scaleX, y:scaleY},
        duration: 1.5,
		easing: "elastic-ease-out"
	});

	nextMsg.transitionTo({
		x: centerX-textAllWidth*scaleX/2,
		y: centerY-textAllHigh*scaleY/2 ,

		scale: {x:scaleX, y:scaleY},
        duration: 1.5,
		easing: "elastic-ease-out"
	});

	nextGroup.on('pointerover', function() {
		document.body.style.cursor = 'pointer';
	});

	nextGroup.on('pointerout', function() {
			document.body.style.cursor = 'default';
	});

	nextGroup.on('click', function() {
		setNextLevel();
		//	waitIdleDemo();
		createPuzzle(1, true);
		enableAllButton();
	});
}

//-----------------------
// change level to next
//-----------------------
function setNextLevel()
{
	if(++gLevelId > boardSizeInfo[gBoardSizeId].numOfLevel) {
		//reset level id and change board size
		gLevelId = 1;
		if(++gBoardSizeId >= boardSizeInfo.length) {
			//reset board size
			gBoardSizeId = 0;
		}
	}
	saveBoardSize(gBoardSizeId, gLevelId);
}



//=================================
// BEGIN for change polygen color
//=================================

//----------------------------
// color = "#RRGGBB"
// softerValue = [0.1 .. 2.0]
//----------------------------
function colorSofter(color, softerValue)
{
	var whiteValue = 255 * (1-softerValue);

	var colorR = ("0"+Math.round(parseInt(color.substr(1,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	var colorG = ("0"+Math.round(parseInt(color.substr(3,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	var colorB = ("0"+Math.round(parseInt(color.substr(5,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);

	return ("#" + colorR + colorG + colorB);
}
//-----------------------------
// softerValue = [0.1 .. 2.0]
//-----------------------------
function setColor(poly, softerValue)
{
	var color = colorSofter(gBlockGroup[poly.blockId].color, softerValue);
	poly.setFill(color);
}

//==========================================================
// BEGIN for Save|Restore boardSize & Level (localstorage)
//==========================================================





//----------------------------------
// save board size to localstorage
//----------------------------------
function saveBoardSize(boardSize, level)
{
	setStorage("polyBoardSize", boardSize);
	setStorage("polyLevel", level);
}

//-------------------------------------------
// get board size & level from localstorage
//-------------------------------------------
function restoreBoardSize()
{
	var boardSize=parseInt(getStorage("polyBoardSize"));
	var level=parseInt(getStorage("polyLevel"));

	if(isNaN(boardSize) || isNaN(level) ||
	   boardSize < 0 || boardSize >= boardSizeInfo.length ||
	   level < 0 || level > boardSizeInfo[boardSize].numOfLevel )
	{
		boardSize = 0;
		level = 1;
	}

	initBoardSize(boardSize, level); //minimum board
}

//=======================================
// BEGIN for set|get|clear localstorage
//=======================================
function setStorage(key, value)
{
	if(typeof(window.localStorage) != 'undefined'){
		window.localStorage.setItem(key,value);
	}
}

function getStorage(key)
{
	var value = null;
	if(typeof(window.localStorage) != 'undefined'){
		value = window.localStorage.getItem(key);
	}
	return value;
}

function clearStorage(key)
{
	if(typeof(window.localStorage) != 'undefined'){
		window.localStorage.removeItem(key);
	}
}

//======================
// get system language
//======================
function getSystemLanguage()
{
	var lang = window.navigator.userLanguage || window.navigator.language;
	return lang.toLowerCase();
}

//===============================================
// Text message to screen (for debug only)
//===============================================
function writeMessage(message) {
	var context = gMessageLayer.getContext();

	gMessageLayer.clear();
	context.font = '28pt arial';
	context.fillStyle = 'maroon';
	context.fillText(message, STAGE_X/2-message.length*9.5, STAGE_Y/2+BLOCK_CELL_SIZE * (SCREEN_BOARD_Y/2));
	gBoardLayer.draw(); //FOR: firefox first time will not display 10/21/2012
}

//==============================================
// dump board value to console (for debug only)
//==============================================
function dumpBoard(board)
{
	var buf = "";
	var boardX = board.length;
	var boardY = board[0].length;

	for(var y = 0; y < boardY; y++) {
		buf = "";
		for(var x = 0; x < boardX; x++) {
			if(board[x][y] > 9) {
				buf += board[x][y] + " ";
			} else {
				buf += "0" + board[x][y] + " ";
			}
		}
		//	console.log(buf);
	}
	//	console.log("");
}


//=======================================================================
//	funciones w
//=======================================================================
function wAgregaCuadrominoFijo(pos)	// coloca cuadromino fijo
//	id: identifica el cuadromino fijo. No es necesario porque cargo un único cuadromino
//	pos: posición del cuadromino en el tablero.
//	esta funcion debe tomar cuadrómino de una tabla que vincule
//	nro de problema con cuadrómino a colocar y posición
{
	if (DEBUG2)
	{
		console.log("linea 2849, Ingresando a wAgregaCuadrominoFijo(pos)");
		console.log("linea 2850, pos.x: " + pos.x );
		console.log("linea 2851, pos.y: " + pos.y );
		console.log("linea 2852, wCuadromGroup[nCuadromId].blockStyle[0]: " + wCuadromGroup[nCuadromId].blockStyle[0][0] );
	}

	var fixedPoly;
	var polyId =0;

		//	block recibirá la posición relativa de cada cuadradito
		//	usamos blockStyle[0] porque es el único definido. Diferencia con pentominos
		var block = dupOpBlock(wCuadromGroup[nCuadromId].blockStyle[0], 0, 0);

		var poly = block2Polygon(block);	//	convierte sistema de coordenadas de bloque a coordenadas de poligono

		if (DEBUG2) { console.log('linea 2865, wAgregaCuadromino fijo, poly: ' + poly ); };

		//	pos viene como parametro
		//	var pos = solvedPos2BoardPos(op, gBlockGroup[id].pos)

		var leftUpPos = getLeftUpPos(block);
		var centerPos = getCenterPos(block);

		var offsetX = centerPos.x+leftUpPos.x;
		var offsetY = centerPos.y+leftUpPos.y;

		var startX = boardStartX + (pos.x-1 + offsetX) * BLOCK_CELL_SIZE;
		var startY = boardStartY + (pos.y-1 + offsetY) * BLOCK_CELL_SIZE;

		/*
			el tramo que sigue no debiera ser necesario por no tomo elementos del grupo de pentominos

		gBlockGroup[id].polyId = -polyId - 1; //for link to fixed poly (fixed polyId  = -polyId+1)
		*/

		gFixedPolyGroup[polyId] = {};
		gFixedPolyGroup[polyId].block = block;


		fixedPoly = new Kinetic.Polygon({
			x: startX,
			y: startY,
			offset: [ offsetX * BLOCK_CELL_SIZE, offsetY *  BLOCK_CELL_SIZE ],
			points: poly,
			fill: FIXED_BLOCK_COLOR,
			stroke: FIXED_BORDER_COLOR,
			strokeWidth: 2
		});

		gFixedPolyGroup[polyId].poly = fixedPoly;

		//	fixedPoly.blockId = id; //index for reference to gBlockGroup
		//	fixedPoly.polyId = polyId; //index for reference to gFixedPolyGroup
		//	fixedPoly.centerPos = centerPos;

		//
		//	gBlockCellUsed += wCuadromGroup[nCuadromId].block.length;
		gBlockCellUsed += gFixedPolyGroup[polyId].block.length;
		gBlockUsed++;


		gBoardLayer.add(fixedPoly);

		//	veamos cuales son los parametros que se van a pasar
		if (DEBUG2)
		{
			console.log('gBoardState---->');
			dumpBoard(gBoardState);
			//	console.log( 'linea 3109, SCREEN_BOARD_X: ' + SCREEN_BOARD_X );
			//	console.log( 'linea 3110, SCREEN_BOARD_Y: ' + SCREEN_BOARD_Y );
			//	console.log( 'linea 3111, block         : ' + block          );
			console.log( 'linea 2909, pos           : ' + pos.x + ' , ' + pos.y            );
			//	console.log( 'linea 3113, id+1          : ' + id+1           );
		}


		//	hasta tanto encuentre el error
		if (DEBUG2)	{ console.log('linea 2916, llamamos a insertBlockToBoard() desde wAgregaCuadrominoFijo(pos)	'); }

		if(!insertBlockToBoard(gBoardState, SCREEN_BOARD_X, SCREEN_BOARD_Y, block, pos, 99)) {
			dumpBoard(gBoardState);
			throw new Error("Design error");
		}

		polyId++;


	//dumpBoard(gBoardState);
}





//----------------------------------------
// create polygon group from block group
//----------------------------------------
function wCreateCuadrado(blockGroup, fixedBlock)
{
	var i, polyId=0;
	var firstStyle;
	var poly, centerPos, leftUpPos;
	var pos;
	var poly;


	gBlockCellUsed += blockGroup[id].blockStyle[0].length;
	gBlockUsed++;
 	if (DEBUG)
	{
		console.log('linea 2888, blockGroup    : ' + blockGroup);
		console.log('linea 2889, blockGroup[0]: ' + blockGroup[0]);
		console.log('linea 2830, blockGroup[0].blockStyle.x: ' + blockGroup[0].blockStyle.x );
		//	console.log('linea 3184, blockGroup[0].blockStyle: ' + blockGroup[0].blockStyle);
	}

	var BlockFijo = blockGroup[0].blockStyle; //get the first block

	//conver block to polygon
	poly = block2Polygon(BlockFijo);

	leftUpPos = getLeftUpPos(gPolyGroup[polyId].block);
	centerPos = getCenterPos(gPolyGroup[polyId].block);

	pos = getPolyInitPos(polyId);

	gPolyGroup[polyId].poly = new Kinetic.Polygon({
		x: pos.x,
		y: pos.y,
		points: poly,
		fill: colorSofter(blockGroup.color, 0.8),
		stroke: BLOCK_BORDER_COLOR,
		strokeWidth: 2,
		//offset = center position of polygon (relative to left-up position)
		offset: [ (centerPos.x+leftUpPos.x) * BLOCK_CELL_SIZE, (centerPos.y+leftUpPos.y) *  BLOCK_CELL_SIZE ],
		dragBoundFunc: function(pos) {
			return checkPolyBound(this, pos);
		}
	});

	poly = gPolyGroup[polyId].poly;
	poly.blockId = 0; //index for reference to gBlockGroup
	poly.polyId = polyId; //index for reference to gPolyGroup
	poly.pos = { x:-1, y:-1 }; //current polygen position in board
	poly.centerPos = centerPos;

	setShadow(poly);

	//hasRotate and hasFlip for display filp & rotate operator
	poly.hasRotate = (blockGroup.blockStyle.length != 1);
	poly.hasFlip   = blockGroup.hasFlip;

	polyId++;

}



//	--------------------------------
function CalcCeldasOcupadas()		//	arma un vector con los datos de las celdas ocupadas en el tablero
{
	var aCeldas = [];

	if (DEBUG2)
	{
		console.log('linea 3025, wCuadromPos: ' + wCuadromPos );
		console.log('linea 3026, wCuadromGroup[nCuadromId].blockStyle ' + wCuadromGroup[nCuadromId].blockStyle );
		console.log('linea 3027, wCuadromGroup[nCuadromId].blockStyle[0] ' + wCuadromGroup[nCuadromId].blockStyle[0] );
		console.log('linea 3027, wCuadromGroup[nCuadromId].blockStyle[0][0] ' + wCuadromGroup[nCuadromId].blockStyle[0][0] );
		console.log('linea 3027, wCuadromGroup[nCuadromId].blockStyle[0][0].x ' + wCuadromGroup[nCuadromId].blockStyle[0][0].x );
		console.log('linea 3029, wCuadromPos[0].x ' + wCuadromPos.x );
		console.log('linea 3030, wCuadromGroup[nCuadromId].blockStyle[0][0].y ' + wCuadromGroup[nCuadromId].blockStyle[0][0].y );
		console.log('linea 3031, wCuadromPos[0].y ' + wCuadromPos.y );

	}

	for (var i = 0; i < wCuadromGroup[nCuadromId].blockStyle[0].length; i++ )
	{
		aCeldas[i] = {};
		aCeldas[i].x = wCuadromGroup[nCuadromId].blockStyle[0][i].x + wCuadromPos.x;
		aCeldas[i].y = wCuadromGroup[nCuadromId].blockStyle[0][i].y + wCuadromPos.y;
	};

	return aCeldas;

}


function muestraBotonOperador(poly) {
	//	console.log('----	function muestraBotonOperador(poly)	')
	var cx = poly.getPosition().x;
	var cy = poly.getPosition().y;

	if(poly.hasRotate) {
		document.getElementById('giraPieza').disabled=false;
		document.getElementById('giraPieza').style.visibility='visible';
	}

	//	rotateObject.show();
	//	rotateObject.setX(cx);
	//	rotateObject.setY(cy);
	//	rotateObject.moveToTop();
	//	rotateOperatorStatus = 1;


	if(poly.hasFlip) {
		document.getElementById('volteaPieza').disabled=false;
		document.getElementById('volteaPieza').style.visibility='visible';

		//	flipObject.show();
		//	flipObject.setX(cx);
		//	flipObject.setY(cy -(BLOCK_CELL_SIZE)*2/3);
		//	flipObject.moveToTop();
		//	flipOperatorStatus = 1;
	}
	gBoardLayer.draw();

};


//--------------------------------------------------
// Remove botones de giro y volteo del layer
//--------------------------------------------------
function ocultaBotonOperador()
{
	/*
	if(rotateOperatorStatus) {
		//gBoardLayer.remove(rotateObject);
		document.getElementById('giraPieza').disabled=true;
		document.getElementById('giraPieza').style.visibility='hidden';
	}
	if(flipOperatorStatus) {
		//gBoardLayer.remove(flipObject);
		document.getElementById('volteaPieza').disabled=true;
		document.getElementById('volteaPieza').style.visibility='hidden';

	}
	*/
}



//---------------------------------------
//	con el boton
// 90 degree clockwise the focus polygon
//---------------------------------------
function giraPieza()
{
	//	por las dudas no haya pieza seleccionada
	if (DEBUG)	{	console.log('lastFocusPolyId: ' + lastFocusPolyId );	};
	if(lastFocusPolyId < 0) return; //return "undefined"

	//----------------------------------------------------------------------------------------
	// For (kineticJS 4.4.0)
	// previous version will reset degree to 0 if degree >= 360 in animateRotate90 function
	// but it can not work for kineticJS 4.4.0, so set here
	//----------------------------------------------------------------------------------------
	if(getLastFocusPoly().getRotationDeg() >= 360) { // >= 360 degree
		getLastFocusPoly().setRotation(0);
	}
	rotate90(getLastFocusPoly());

	//gBoardLayer.draw();
}


//-----------------------------------
//	con el boton
// left-right flip the focus polygon
//-----------------------------------
function volteaPieza()
{
	//	por las dudas no haya pieza seleccionada
	if (DEBUG)	{	console.log('lastFocusPolyId: ' + lastFocusPolyId );	};
	if(lastFocusPolyId < 0) return; //return "undefined"


	leftRightFlip(getLastFocusPoly());
	////gBoardLayer.draw();
}

//	var rotateObject; //a rotate object, display on the focus polygon
//	var flipObject;   //a flip object, display on the focus polygon



//------------------------------------------
//rectangulo para visualizar area de trabajo
//------------------------------------------
function addContorno2Layer()
{
	var context = canvas.getContext();
	context.fillStyle = "#FF0000";
	context.fillRect( STAGE_X, STAGE_Y, STAGE_OFFSET_X, STAGE_OFFSET_Y );

}


//------------------------------------------
//	funciones para seleccionar problema
//------------------------------------------
var CANTPROBLEMAS = 103;

	function PresentaOpciones() {
		var txt = '<select id="mySelect">'
		for (var i = 1; i <= CANTPROBLEMAS ; i++ ) {
			txt += '<option>' + i + '</option>'
		}
		txt += '</select>'

        document.getElementById("problema").innerHTML = txt;

	};

	function myFunction() {
		//	obtener y mostrar el valor elegido	
		var x = document.getElementById("mySelect").selectedIndex;
		alert(document.getElementsByTagName("option")[x].value + ", " + x);
	};



/*
function initProblema() {
	document.getElementById("myNumber").value = NroProblema();
	console.log( document.getElementById("myNumber").value );
};




function myFunction() {
	if (myNumber.value > CANTPROBLEMAS || myNumber.value < 1 ) {
		console.log(" numero muy grande! ( ... o muy chico )" );
		document.getElementById("myNumber").value = NroProblema();
	}
}


function NroProblema() {
	return Math.ceil(Math.random() * CANTPROBLEMAS );
};

*/

//-----------------
// on level change
//-----------------
function levelButton(id)
{
	gLevelId = parseInt(id);
	createPuzzle(1, true);
}

