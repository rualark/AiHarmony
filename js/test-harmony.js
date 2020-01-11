let chorus = `
%%sysstaffsep 30
X: 1
V: T1 clef=treble name="Soprano"
V: T2 clef=treble name="Alto"
V: B1 clef=bass name="Tenor"
V: B2 clef=bass name="Bass"
L:1/8
K:G
[V: T1]eded ^cdg^f| _e=ded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf|
[V: T2]GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB|
[V: B1]C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3|
[V: B2]C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2|
  `;

function update_button(par, vals, id) {
  if (vals.includes(par)) {
    $('#' + id).removeClass("btn-outline-white").addClass("btn-lblue");
  } else {
    $('#' + id).removeClass("btn-lblue").addClass("btn-outline-white");
  }
}

function noteclick(abcElem, tuneNumber, classes) {
  console.log(abcElem, tuneNumber, classes);
  if (abcElem.pitches != null) {
    update_button(abcElem.duration, [0.125], 'len3');
    update_button(abcElem.duration, [0.25, 0.375], 'len4');
    update_button(abcElem.duration, [0.5, 0.75], 'len5');
    update_button(abcElem.duration, [1, 1.5], 'len6');
    update_button(abcElem.duration, [0.375, 0.75, 1.5], 'dot');
    let pclass = (77 + abcElem.pitches[0].pitch) % 7;
    update_button(pclass, [6], 'note_b');
    update_button(pclass, [5], 'note_a');
    update_button(pclass, [4], 'note_g');
    update_button(pclass, [3], 'note_f');
    update_button(pclass, [2], 'note_e');
    update_button(pclass, [1], 'note_d');
    update_button(pclass, [0], 'note_c');
    update_button(abcElem.pitches[0].accidental, ['sharp'], 'sharp');
    update_button(abcElem.pitches[0].accidental, ['flat'], 'flat');
    update_button(abcElem.pitches[0].accidental, ['natural'], 'natural');
    update_button(abcElem.abselem.startTie, [true], 'tie');
  }
}

function notation_redraw() {
  parserParams.staffwidth = window.innerWidth - 60;
  ABCJS.renderAbc('notation', chorus, parserParams, engraverParams);
}

function notation_zoom(zoom) {
  engraverParams.scale *= zoom;
  if (engraverParams.scale > 3) engraverParams.scale = 3;
  if (engraverParams.scale < 0.5) engraverParams.scale = 0.5;
  notation_redraw();
}

let parserParams = {
  clickListener: noteclick,
  add_classes: true,
  staffwidth: window.innerWidth - 60,
  wrap: { minSpacing: 1.4, maxSpacing: 2.4, preferredMeasuresPerLine: 16 }
};

let engraverParams = { scale: 1 };

ABCJS.renderAbc('notation', chorus, parserParams, engraverParams);

window.onresize = function(event) {
  notation_redraw();
};
