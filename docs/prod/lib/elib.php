<?php

function show_elock($private) {
  GLOBAL $bheight, $vtypes;
  if ($private == 1) echo "<img data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='Access allowed to all authenticated users' src=img/lock3.png height=$bheight> ";
  if ($private == 2) echo "<img data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='Access allowed to author and administrators only' src=img/lock.png height=$bheight> ";
  if ($private >= 3) echo "<img data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='Access allowed to author only' src=img/lock2.png height=$bheight> ";
}
