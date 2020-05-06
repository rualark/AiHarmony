<?php
require_once __DIR__ . "/../plugin/parsedown/parsedown.php";


class DocInfo {
  public $name;
  public $fname;
  public $level;
  public $pid;
}

$docs_title = "";
$docs_group = "";
$docs_text = "";
$docs_parsed = "";
$docs_menu_st = "";
$docs_need_show_rules = 0;

function inject_docs(&$st) {
  GLOBAL $wi, $site_name, $docs_need_show_rules;
  if (strpos($st, "\$Instruments\$") !== false) {
    load_instruments();
    $first = 1;
    $ilist = "";
    $iclass_old = "-1-1-1";
    foreach ($wi as $igroup => $wa) {
      if ($wa[0]['i_class'] != $iclass_old) {
        if (!$first) $ilist .= "</table>";
        $first = 0;
        $iclass_old = $wa[0]['i_class'];
        $ilist .= "<h4>" . $wa[0]['i_class'] . "</h4>";
        $ilist .= "<table class='table'>";
      }
      $ilist .= "<tr>";
      if ($wa[0]['n_min'] != "") $title = "data-toggle=tooltip data-placement=top title='".$wa[0]['n_min']."-".$wa[0]['n_max']."'";
      else $title = "";
      $ilist .= "<td><b $title>" . $wa[0]['i_group'];
      $clist = "";
      foreach ($wa as $id => $w) {
        if ($clist != "") $clist .= ", ";
        $clist .= get_inst_badges($w);
        $clist .= $w['i_name'];
      }
      $ilist .= "<td>$clist";
    }
    $ilist .= "</table>";
    $st = str_replace("\$Instruments\$", $ilist, $st);
  }
  if (strpos($st, "\$show_rules\$") !== false) {
    $st = str_replace("\$show_rules\$", "", $st);
    $docs_need_show_rules = 1;
  }
  $st = str_replace("<td>\$td-green\$", "<td bgcolor=#ddffdd>", $st);
  $st = str_replace("<td>\$td-red\$", "<td bgcolor=#ffdddd>", $st);
  $st = str_replace("<td>\$td-yellow\$", "<td bgcolor=#ffffdd>", $st);
  $st = str_replace("<td>\$td-yellow\$", "<td bgcolor=#ffffdd>", $st);
  $st = str_replace("<img src", "<img style='max-width: 100%' src", $st);

  $st = str_replace("\$site_name\$", "$site_name", $st);
}

function show_docs($fname) {
  GLOBAL $docs_parsed, $docname, $docname2, $docs_title, $docs_need_show_rules;
  echo "<div class='col-sm-9'>";
  echo "<h1>$docs_title</h1>";
  if ($docs_need_show_rules) {
    init_rules_tree();
    load_rules(1);
    show_rules_tree(0);
  }
  echo $docs_parsed;
  echo "</div>";
}

function get_docs($fname) {
  GLOBAL $docs_text, $docs_parsed, $docs_folder;
  $fname = str_replace("/", "", $fname);
  if (!file_exists("$docs_folder/$fname.md")) {
    die("Wrong URL");
  }
  $docs_text = file_get_contents("$docs_folder/$fname.md");
  $sa = explode("\n", $docs_text);
  // Parse
  $Parsedown = new Parsedown();
  $docs_parsed = $Parsedown->text($docs_text);
  // Bootstrap
  $docs_parsed = str_replace("<table>", "<table class=table>", $docs_parsed);
  // Parse variables
  inject_docs($docs_parsed);
}

function load_docs_titles2($fname) {
  GLOBAL $docname, $docname2;
  $fa = file("$fname");
  for ($i=0; $i<mycount($fa); ++$i) {
    $st = trim($fa[$i]);
    if ($st[0] == '-') $st = trim(substr($st, 1));
    $pos = strpos($st, "|");
    if (!$pos) continue;
    $sa = explode("|", $st);
    $name = trim($sa[0]);
    $fname3 = trim($sa[1]);
    $name2 = trim($sa[2]);
    $docname[$fname3] = $name;
    $docname2[$fname3] = $name2;
  }
}

function load_docs_titles() {
  GLOBAL $docs_folder, $docname;
  load_docs_titles2("$docs_folder/_menu.txt");
  load_docs_titles2("$docs_folder/_menu-counterpoint.txt");
  load_docs_titles2("$docs_folder/_menu-algo.txt");
}

function load_docs_menu($fname) {
  GLOBAL $docs_menu, $docname, $docname2, $docs_folder, $docs_menu_st, $docs_title, $docs_menu_file;
  $fa = file("$docs_folder/$docs_menu_file");
  $n = mycount($fa);
  $pid = array();
  $level = 0;
  $docs_menu_st = "<div class='col-sm-3'>";
  for ($i=0; $i<$n; ++$i) {
    $st = $fa[$i];
    $st2 = trim($st);
    // Ignore wrong first character
    if ($st2[0] != '-') continue;
    $st2 = substr($st2, 1);
    $st2 = trim($st2);
    $sa = explode("|", $st2);
    $name = trim($sa[0]);
    $fname3 = trim($sa[1]);
    $name2 = trim($sa[2]);
    $level = 0;
    if ($st[0] == '-') {
    }
    else if ($st[0] == ' ') {
      $sl = strlen($st);
      for ($x=1; $x<$sl; ++$x) {
        if ($st[$x] != ' ') {
          $level = $x / 2;
          break;
        }
      }
    }
    else {
      // Ignore wrong string
      continue;
    }
    $doc = new DocInfo;
    $doc->name = $name;
    $doc->fname = $fname3;
    $doc->level = $level;
    if ($level) $doc->pid = $pid[$level - 1];
    else $doc->pid = 0;
    $docs_menu[] = $doc;
    if ($fname3 != "") {
      $docname[$fname3] = $name;
      $docname2[$fname3] = $name2;
    }
    $pid[$level] = mycount($docs_menu) - 1;
    // Show
    if ($level == 0) {
      if ($i) {
        $docs_menu_st .= "</div></div>";
      }
      $docs_menu_st .= "<div class='panel panel-default'>";
      $docs_menu_st .= "<div class='panel-heading'>";
      $docs_menu_st .= "<b>";
      $docs_menu_st .= "$name</b>";
      $docs_menu_st .= "</div>";
      $docs_menu_st .= "<div class='panel-body'>";
    }
    else {
      if ($fname3 == "") {
        $docs_menu_st .= "<br>";
        $docs_menu_st .= "$name<br>";
      }
      else {
        $docs_menu_st .= "&nbsp;&nbsp;&nbsp;<a href='docs.php?d=$fname3'>$name</a><br>";
      }
    }
  }
  $docs_menu_st .= "</div></div>";
  $docs_menu_st .= "</div>";
  if ($docname2[$fname] == "") $docs_title = $docname[$fname];
  else $docs_title = $docname2[$fname];
}

?>