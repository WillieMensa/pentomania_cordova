/*	=============================================================================
	Pentomino Puzzle
	archivo: ajustes.js
	6/7/2019

*/

//-------------------------------------------------------------------
function HaceConfigLayer(){
	//	if (DEBUG){console.log(' en HaceConfigLayer() ');}

	var simpleText = new Konva.Text({
		x: (gStage.getWidth() * 0.3),
		y: (gStage.getHeight() * 0.2),
		text: '  AJUSTES DE \nPENTOMANIA',
		fontSize: 1.5 * BLOCK_CELL_SIZE,			//	130,
		fontFamily: FONT_NIVEL1,	//	'Calibri',
		fill: TITLE_COLOR,
		shadowColor: 'black',
		shadowBlur: 5,
		shadowOffset: [6,6],			//	2, 2],
		shadowOpacity:0.7

	});

	// to align text in the middle of the screen, we can set the
	// shape offset to the center of the text shape after instantiating it
	//	simpleText.setOffset({
	//		x: simpleText.getWidth() / 2
	//	});

	var labelBtn = new Konva.Text({
		x: 7 * BLOCK_CELL_SIZE,
		y: 7.1 * BLOCK_CELL_SIZE,
		text: 'Problema numero (1-103):',
		fontSize: 0.4 * BLOCK_CELL_SIZE,
		fontFamily: FONT_NIVEL3,//'Calibri',
		fill: 'white',
	});


	gConfigLayer.add(simpleText);
	gConfigLayer.add(labelBtn);


	gStage.add(gConfigLayer);

};



function haceAjustes() {
//-----------------------------------------------------
//menu de status
//-----------------------------------------------------

//	console.clear();
console.log('--------- haciendo Ajustes ------------');


hiddenAllButton();	//	oculta todos los botones

//	gStage
gBoardLayer.destroy();
gBackgroundLayer.destroy();
gMessageLayer.destroy();
gInitLayer.destroy();
gHelpLayer.destroy();
gAboutLayer.destroy();
//	gStatusLayer.destroy();

if (DEBUG){console.log(' haciendo ConfigLayer ')}

HaceConfigLayer();

console.log(' despues de ConfigLayer ');
//	visibleStatusBtn()
//	menuBtn.disabled=false;
//	helpBtn.disabled=false;
//	aboutBtn.disabled=false;

//	document.getElementById('ProblemSelect').style.cssText = 
//		"top:" + (STAGE_OFFSET_Y + 0.6 * STAGE_Y) + "px; left:" + 
//		(STAGE_OFFSET_X + 0.33 * STAGE_X) + "px; position: absolute; font:" + (16) + "px roboto white";
//	document.getElementById('ProblemSelect').style.visibility='visible';
//	document.getElementById('ProblemSelect').style.disabled=false;


//	if (DEBUG) {	console.log('ProblemSelect.style.cssText: ' + document.getElementById('ProblemSelect').style.cssText)}

//	document.getElementById('nroProblema').style.cssText = "font: bold 20px roboto grey";
nroProblema.value = nProblema;
//	document.getElementById('nroProblema').style.value = parseInt(nProblema);
//	document.getElementById('nroProblema').style.defaultValue = nProblema;
//	document.getElementById('nroProblema').style.color = "red";
nroProblema.disabled=false;
nroProbBtn.disabled=false;
//	nroProblema.visibility='visible';
//	labelBtn.visibility='visible';
//	nroProbBtn.visibility='visible';

if (DEBUG) { console.log('nProblema: ' + nProblema +
	'\nnroProblema.Value: ' + nroProblema.value ); };

//	nroProblema.value = nProblema;
//	document.getElementById('nroProblema').value = nProblema;
menuBtn.style.visibility='visible';			//	menu ppal
nroProbBtn.style.visibility='visible';
//	labelBtn.style.visibility='visible';
nroProblema.style.visibility='visible';
//	nroProblema.disabled=false;


}




//----------------------------------
// save nro problema to localstorage
//----------------------------------
function setNroProbl() {

var n = nroProblema.value;

	console.log('en setNroProbl()\nnro de problema antes: ' + nProblema + ', ' + n );	
	nProblema = parseInt( nroProblema.value);	
	console.log('nro de problema fijado: ' + nProblema);

	setStorage("nroProblemaStored", nProblema);
	console.log('nro de problema fijado: ' + nProblema);
}

//-------------------------------------------
// get nro problema from localstorage
//-------------------------------------------
function getNroProbl()
{
	//	let nCual = parseInt(getStorage("nroProblemaStored"));
	let nCual = getStorage("nroProblemaStored");

	if(isNaN(nCual) || nCual < 1 || nCual > CANTPROBLEMAS )
	{
		nCual = 1;
	}

	//	if (DEBUG) { 	console.log('nCual: ' + nCual ); 	};

	return nCual

}



