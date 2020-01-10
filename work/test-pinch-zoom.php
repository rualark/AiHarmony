<!DOCTYPE HTML>
<html>
<head>
  <meta charset='utf-8'>
  <meta http-equiv="content-type" content="text/html" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Harmony</title>
  <script src="plugin/abcjs-5.10.3/abcjs_basic_5.10.3-min.js" type="text/javascript"></script>
  <meta name="viewport" content="width=device-width">
</head>
<div style='border:1px solid black; display: inline-block'>Some menu will be placed here: currently there is just the replacement text.<br>Actually, menu can be quite big and even scrollable.</div><br>
<!-- <script defer src="plugin/pinch-zoom-1.1.1/dist/pinch-zoom.js"></script> -->
<script defer src="plugin/pinch-zoom-repo/pinch-zoom/dist/pinch-zoom.js"></script>
<pinch-zoom>
  <div style='border:1px solid black; display: inline-block' id='notation'></div>
</pinch-zoom>
<script src=js/harmony.js></script>
<script>
  let chorus = `
%%sysstaffsep 30
X: 1
V: T1 clef=treble name="Soprano"
V: T2 clef=treble name="Alto"
V: B1 clef=bass name="Tenor"
V: B2 clef=bass name="Bass"
L:1/8
K:G
[V: T1]eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf| eded cdgf|
[V: T2]GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB| GGAA- A2BB|
[V: B1]C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3| C3D- DF,3|
[V: B2]C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2| C,2A,,2 F,,2G,,2|
  `;
  let parserParams = {staffwidth: 1200, wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }};
  let engraverParams = {scale: 1};
  ABCJS.renderAbc('notation', chorus, parserParams, engraverParams);
</script>
