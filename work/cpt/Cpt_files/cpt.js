// counterpoint exercise module

(function($) {
"use strict"

var BTAS = [[40, 60], [50, 69], [55, 72], [60, 79]]; // voice ranges midi pitch
// simplistic representation of the song: only the midi pitches of upper+lower
var bar = [[60, 60], [62, 0], [64, 0], [67, 0], [69, 0], [65, 0], [64, 0],
		[62, 0], [60, 0]];
// for flat over sharp, this array will have 1 in that bar and position
var barflat = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
		[0, 0], [0, 0]];
var cfpos = 0; // position of cantus firmus in the bar (0 = on top, 1 = bottom)
var melodypos = 1; // position of melody to write in the bar (opposite of cfpos)
var melodyreg = 0; // melogy register: 0=bass, 1=tenor, 2=alto, 3=soprano
// convert midi note to abc notation using sharp or flat
var M2AS = ["x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"E,,","F,,","^F,,","G,,","^G,,","A,,","^A,,","B,,","C,","^C,",
	"D,","^D,","E,","F,","^F,","G,","^G,","A,","^A,","B,",
	"C","^C","D","^D","E","F","^F","G","^G","A",
	"^A","B","c","^c","d","^d","e","f","^f","g",
	"^g","a","^a","b","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x"]

var M2AF = ["x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"E,,","F,,","_G,,","G,,","_A,,","A,,","_B,,","B,,","C,","_D,",
	"D,","_E,","E,","F,","_G,","G,","_A,","A,","_B,","B,",
	"C","_D","D","_E","E","F","_G","G","_A","A",
	"_B","B","c","_d","d","_e","e","f","_g","g",
	"_a","a","_b","b","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x",
	"x","x","x","x","x","x","x","x","x","x"]
var curbar = 1; // currently selected bar


var abc_head = `
%%score(1)|(2)
X: 1
T: "Cantus Firmus in Alto"
V: 1 clef=treble name="Alto"
V: 2 clef=bass name="Bass"
L:1
K:C
`;

var abc = `

%%score(1)|(2)
X: 1
T: "Cantus Firmus in Alto"
V: 1 clef=treble name="Alto"
V: 2 clef=bass name="Bass"
L:1
K:C
P:First Part
[V: 1]C | D | E | G | A | F | E | D | C |]
[V: 2]C | x | x | x | x | x | x | x | x |]


`;

var abc1;

var tune;
var tune2;

// get abc notation for a note given bar number and pos or 'x'
function getnotename(barnum, barpos, nox = false) {
	var res = barflat[barnum][barpos]? M2AF[bar[barnum][barpos]]:
		M2AS[bar[barnum][barpos]];
	if(nox && res == 'x') {
		res = '';
	}
	return res;
}

function updateabc() {
	abc = abc_head + "[V:1]";
	for(var i = 0; i < bar.length; ++i) {
		abc += getnotename(i, 0) + " |";
	}
	abc += "]\n[V:2]";
	for(var i = 0; i < bar.length; ++i) {
		abc += getnotename(i, 1) + " |";
	}
	abc += "]\n";

	abc1 = abc_head + "[V:1]";
	for(var i = 0; i < bar.length; ++i) {
		var note0 = getnotename(i, 0, true);
		var note1 = getnotename(i, 1, true);
		var note = note0 == note1? note0: note0 + '' + note1;
		note = note == ''? 'x': note;
		abc1 += "[" + note + "] |";
	}
	abc1 += "]\n";
}

function noteclick(abcElem, tuneNumber, classes) {
	ABCJS.startAnimation($("#paper")[0],
		tune[0], { showCursor: true,
				bpm: 320 });
	console.log(abcElem, tuneNumber, classes);
}

function onpaperclick() {
	console.log("paper clicked");
}

function onresize() {
//	var bbox = 
//	console.log($("#paper").width(), $("#paper").height());
}

function setcurbar(barnum) {
	if(barnum < 0 || barnum >= (bar.length)) return; // no such bar
	$(".abcjs-note.abcjs-v1.abcjs-m" + curbar).removeClass("selected");
	// check if the new bar does not have a note in it, place same note
	if(!bar[barnum][melodypos]) {
		bar[barnum][melodypos] = bar[curbar][melodypos];
		barflat[barnum][melodypos] = barflat[curbar][melodypos];
		updateabc();
		redrawall();
	}
	curbar = barnum;
	$(".abcjs-note.abcjs-v1.abcjs-m" + curbar).addClass("selected");
}

function onmidi(abcjsElement, currentEvent, context) {
	return;
	console.log(JSON.stringify(abcjsElement,
		function( key, value) {
			if( key == 'parent') { return value.id;}
			else {return value;}
		}));
}

function onkeydown(e) {
	switch(e.keyCode) {
		case 13: // Enter = check the exercise
			runchecks();
			break;
		case 32: // Space = play the song
			ABCJS.midi.startPlaying(document.querySelector(
				".abcjs-inline-midi"));
			break;
		case 37: // Left
			setcurbar(curbar - 1);
			break;
		case 39: // Right
			setcurbar(curbar + 1);
			break;
		case 38: // Up
			++bar[curbar][melodypos];
			barflat[curbar][melodypos] = 0;
			updateabc();
			redrawall();
			setcurbar(curbar);
			break;
		case 40: // Down
			--bar[curbar][melodypos];
			barflat[curbar][melodypos] = 1;
			updateabc();
			redrawall();
			setcurbar(curbar);
			break;
	}
}

function redrawall() {
	tune = ABCJS.renderAbc("paper", abc,
			{
				clickListener: noteclick,
				add_classes: true,
				responsive: "resize",
			});

//	console.log("Tune: ", tune);

	tune2 = ABCJS.renderAbc("paper2", abc1);
	ABCJS.renderMidi("midi1", abc1,
			{
				animate: {
					target: tune[0],
					listener: onmidi,
					qpm: 320
				},
				qpm: 320,
				program: 52,
			});
}

function runchecks() {
	$("#out").empty();
	check_melody();
	check_intervals();
	check_parallels();
}

function check_melody() {
	for(var i = 1; i < bar.length; ++i) {
		if(!bar[i][0] || !bar[i][1]) break; // no more filled bars
		var note0 = bar[i - 1][melodypos];
		var note1 = bar[i][melodypos];
		if(note0 == note1) {
			$("#out").append(
			"&#8226; Static melody from bar " + i + "<br />\n");
		}
	}
}

function check_intervals() {
	for(var i = 0; i < bar.length; ++i) {
		if(!bar[i][0] || !bar[i][1]) break; // no more filled bars
		var int0 = Math.abs(bar[i][0] - bar[i][1]);
		console.log(int0);
		if([0, 3, 4, 7, 8, 9, 12].indexOf(int0 % 12) < 0) {
			$("#out").append(
			"&#8226; Dissonant interval in bar " + (i + 1)
					+ "<br />\n");
		}
	}
}

function check_parallels() {
	for(var i = 1; i < bar.length; ++i) {
		if(!bar[i][0] || !bar[i][1]) break; // no more filled bars
		var int0 = Math.abs(bar[i - 1][0] - bar[i - 1][1]);
		var int1 = Math.abs(bar[i][0] - bar[i][1]);
		if(int0 == 7 && int1 == 7) {
			$("#out").append(
			"&#8226; Parallel Fifts from bar " + i + "<br />\n");
		} else if(int0 == 12 && int1 == 12) {
			$("#out").append(
			"&#8226; Parallel Octaves from bar " + i + " <br />\n");
		} else if(int0 == 0 && int1 == 0) {
			$("#out").append(
			"&#8226; Parallel Unisons from bar " + i + " <br />\n");
		}
	}
}

$(function() {
//	var tune = new ABCJS.TuneBook(abc);

	updateabc();
//	console.log(abc1);

	redrawall();

	ABCJS.midi.startPlaying(document.querySelector(
				".abcjs-inline-midi"));

	setcurbar(0);
	$("#paper").click(onpaperclick);
	$(window).resize(onresize);
	window.addEventListener("keydown", function(e) {
			// space and arrow keys
			if([13, 32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
				onkeydown(e);
				e.preventDefault();
			}
		}, false);
});


})(jQuery);

