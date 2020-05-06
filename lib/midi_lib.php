<?php
require_once __DIR__ . "/../plugin/midiclass/midi.class.php";

class MidiTrackInfo {
  public $trk_name; // Track name
  public $meta = array();
  public $prch = array(); // Used program changes
  public $cc_cnt = array(); // [cc] Count of cc events
  public $on_cnt = 0; // Note On events count
  public $ch_on_cnt = array(); // Note On events count in each channel
  public $tempo_cnt = 0; // Tempo events count
};

$midiclass = new Midi();
$track_count = 0;
$track_name = 0;
$track_name = array();
$mti = array();

function get_tracknames() {
  GLOBAL $midiclass, $track_count, $track_name, $midi_duration,
         $first_track, $has_track_names, $midi_file_type,
         $midi_ppq, $mftype, $track_notes, $track_minnote, $track_maxnote, $mti;
  $mti = array();
  $track_count = $midiclass->getTrackCount();
  $sil = $midiclass->getInstrumentList();
  $midi_ppq = $midiclass->getTimebase();
  if (!$midi_ppq) return;
  //echo $track_count;
  $track_name = array();
  $prev_tempo_tick = 0;
  $max_tick = 0;
  $tempo = 120;
  $pass = 0;
  $has_track_names = 0;
  $first_track = -1;
  $midi_file_type = $midiclass->type;
  for ($i=0; $i<$track_count; ++$i) {
    $track = $midiclass->getTrack($i);
    $track_minnote[$i] = 128;
    $track_maxnote[$i] = 0;
    // Create MIDI track info
    $mti[$i] = new MidiTrackInfo;
    foreach ($track as $key => $val) {
      $sa = explode(" ", $val);
      if ($sa[1] == "Par" && substr($sa[3], 0, 2) == "c=") {
        $cc = substr($sa[3], 2);
        $mti[$i]->cc_cnt[$cc]++;
      }
      if ($sa[1] == "Tempo") {
        //if ($sa[2] > 0) $tempo = 60000000 / $sa[2];
        // Use previous tempo to calculate
        $pass += ($sa[0] - $prev_tempo_tick) / $midiclass->getTimebase() * $tempo;
        $prev_tempo_tick = $sa[0];
        if ($sa[2] > 0) $tempo = $sa[2];
        $mti[$i]->tempo_cnt++;
      }
      if ($sa[1] == "On") {
        if ($first_track == -1) $first_track = $i;
        $ch = substr($sa[2], 3);
        if ($sa[4] != "v=0") {
          $note = substr($sa[3], 2);
          // Ignore Finale keyswitches
          if ($note > 12) {
            ++$track_notes[$i];
            $track_minnote[$i] = min($track_minnote[$i], $note);
            $track_maxnote[$i] = max($track_maxnote[$i], $note);
          }
          $mti[$i]->on_cnt++;
          $mti[$i]->ch_on_cnt[$ch]++;
        }
      }
      if (is_numeric($sa[0])) $max_tick = max($max_tick, $sa[0]);
      if ($sa[1] == "Meta" && substr($sa[2], 0, 2) == "0x") {
        $text = "";
        for ($x=3; $x<mycount($sa); ++$x) {
          if (strlen($sa[$x]) != 2) continue;
          $code = hexdec($sa[$x]);
          if ($code < 32) $text .= "#$code ";
          else $text .= chr($code);
        }
        $mti[$i]->meta[hexdec($sa[2])] = trim($text);
      }
      if ($sa[1] == "Meta" && $sa[2] == "TrkName") {
        ++$has_track_names;
        $track_name[$i] = "";
        for ($x=3; $x<mycount($sa); ++$x) {
          if ($track_name[$i] != "") $track_name[$i] .= " ";
          $track_name[$i] .= $sa[$x];
        }
        $track_name[$i] = str_replace("\"", "", $track_name[$i]);
        $mti[$i]->trk_name = $track_name[$i];
      }
      if ($sa[1] == "PrCh") {
        $icode = substr($sa[3], 2);
        if ($track_name[$i] == "") {
          if ($icode < 128 && $icode >= 0) {
            $track_name[$i] = $sil[$icode];
            $track_name[$i] = str_replace("\"", "", $track_name[$i]);
          }
        }
        $mti[$i]->prch[$sil[$icode]]++;
      }
    }
  }
  if ($first_track == -1) $first_track = 0;
  $pass += ($max_tick - $prev_tempo_tick) / $midiclass->getTimebase() * $tempo;
  //echo "($max_tick - $prev_tempo_tick) $tempo ";
  //echo "$max_tick " . $midiclass->getTimebase() . " " . $max_tick / $midiclass->getTimebase() . " " . $pass;
  $midi_duration = $pass / 1000000;
  //print_r($track_name);
  if ($midi_ppq == 960 || $midi_ppq == 256) $mftype = "Sibelius";
  else if ($midi_ppq == 1024) $mftype = "Finale";
  else if ($midi_ppq == 480 && $first_track == 0 && !$has_track_names) $mftype = "MuseScore";
  else $mftype = "Other";
  // Remove last empty tracks
  //while ($track_count > 1 && $track_notes[$track_count - 1] == 0) {
    //--$track_count;
  //}
}

function merge_track_with_tempo($tr) {
  GLOBAL $mevents, $midiclass;
  $track_count = $midiclass->getTrackCount();
  for ($i=0; $i<$track_count; ++$i) {
    $track = $midiclass->getTrack($i);
    foreach ($track as $key => $val) {
      $sa = explode(" ", $val);
      //echo "$i $val<br>";
      // Load only my track and tempo from all other tracks
      if ($sa[1] != "Tempo" && $i != $tr) continue;
      if (is_numeric($sa[0])) {
        $tick = $sa[0] + 0;
        $mevents[$tick][] = "$i $val";
      }
    }
  }
  ksort($mevents);
}

function show_midi_explorer() {
  GLOBAL $mti, $f_id, $first_track, $type, $site_name;
  echo "<table border=1 cellpadding=3 style='border-collapse: collapse;'>";
  echo "<tr>";
  echo "<th title='Source track number in MIDI file'>STR";
  echo "<th title='Internal track number in $site_name'>ITR";
  echo "<th>Information";
  for ($i=0; $i<mycount($mti); ++$i) {
    echo "<tr>";
    echo "<td align='center'>";
    if ($i >= $first_track && $type == "source") {
      echo "<a href='pianoroll.php?f_id=$f_id&strack=". ($i - $first_track) . "'>";
    }
    else {
      echo "<b>";
    }
    echo "$i</b></a>";
    echo "<td align='center'>";
    if ($i >= $first_track) {
      echo "<b>" . ($i - $first_track + 1);
    }
    echo "<td>";
    if ($mti[$i]->trk_name != "") echo "<span data-toggle=tooltip title='Track Name' style='background-color: #aaffff'>".$mti[$i]->trk_name."</span> ";
    $x = 0;
    foreach ($mti[$i]->meta as $key => $val) {
      if ($x > 3) {
        echo "... ";
        break;
      }
      if ($val != "") echo "<span data-toggle=tooltip title='Meta $key' style='background-color: #aaffaa'>".$val."</span> ";
      ++$x;
    }
    $x = 0;
    foreach ($mti[$i]->prch as $key => $val) {
      if ($x > 3) {
        echo "... ";
        break;
      }
      echo "<span data-toggle=tooltip title='Program Change' style='background-color: #ffccaa'>$key</span> ";
      ++$x;
    }
    $x = 0;
    arsort($mti[$i]->cc_cnt);
    foreach ($mti[$i]->cc_cnt as $cc => $cnt) {
      if ($x > 8) {
        echo "... ";
        break;
      }
      echo "<span data-toggle=tooltip title='CC$cc: $cnt events' style='background-color: #ffaaff'>CC$cc=$cnt</span> ";
      ++$x;
    }
    if ($mti[$i]->tempo_cnt) echo "<span data-toggle=tooltip title='Number of Tempo events' style='background-color: #dddddd'>".$mti[$i]->tempo_cnt." tempo</span> ";
    $ch_cnt = mycount($mti[$i]->ch_on_cnt);
    if ($mti[$i]->on_cnt) echo "<span data-toggle=tooltip title='Number of Note On events in $ch_cnt channels' style='background-color: #ffffff'>".$mti[$i]->on_cnt." notes</span> ";
    $x = 0;
    //print_r($mti[$i]->ch_on_cnt);
    foreach ($mti[$i]->ch_on_cnt as $key => $val) {
      if ($x > 5) {
        echo "... ";
        break;
      }
      echo "<span data-toggle=tooltip title='$val Note On events in channel $key' style='background-color: #ffff66'>ch$key:$val</span> ";
      ++$x;
    }
  }
  echo "</table>";
}
