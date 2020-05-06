<?php
class NoteInfo {
  public $etime;
  public $dstime;
  public $detime;
  public $artic;
  public $filter;
  public $comment_start;
  public $comment_end;
};

$nin = array(); // [tick][pitch]->

function get_noteinfo($tr, $sta) {
  GLOBAL $wj, $nin;
  $path = "share/$wj[j_folder]noteinfo/tr" . ($tr + 1) . "_sta{$sta}.csv";
  //echo $path;
  if (!file_exists($path)) return;
  $fa = file($path);
  $n = mycount($fa);
  for ($i=1; $i<$n; ++$i) {
    $sa = explode(";", $fa[$i]);
    $nin[$sa[1]][$sa[0]] = new NoteInfo;
    $nin[$sa[1]][$sa[0]]->etime = $sa[4];
    $nin[$sa[1]][$sa[0]]->dstime = $sa[5];
    $nin[$sa[1]][$sa[0]]->detime = $sa[6];
    $nin[$sa[1]][$sa[0]]->artic = $sa[7];
    $nin[$sa[1]][$sa[0]]->filter = $sa[8];
    $nin[$sa[1]][$sa[0]]->comment_start = $sa[9];
    $nin[$sa[1]][$sa[0]]->comment_end = $sa[10];
  }
  //print_r($nin);
}

