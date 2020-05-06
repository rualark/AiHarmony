<?php

define("XDIV", 14400);

require_once "xfi.php";

class XCVoice
{
  public $xv; // XFi voice id
  public $notes_count;
  public $part_id;
  public $name;
  public $display;
  public $staff;
  public $v;
  public $chord;
  public $species;
  public $species_detected;
  public $species_possible;
  public $minnote = 1000;
  public $maxnote = -1;
  public $nlen_count;
  public $tie_count = 0;
  public $measure_with_notes;
  public $unique_v = false;
  public $unique_staff = false;
  public $unique_chord = false;
  public $unique_name;
}

// XML Counterpoint analysis
class XCA
{
  public $error;
  public $voice = array(); // [v]
  public $first_measure_with_notes = 0;
  public $beats;
  public $beat_type;
  public $fifths;
  public $species_in_xml = array(); // If xml file contains "spXX" text

  /** @var XFi $xfi */
  public $xfi;

  public function AnalyseCP($path, $pdif, $txt="") {
    if ($txt == "") {
      if (!file_exists($path)) {
        $this->error = "File does not exist: $path";
        return;
      }
      $txt = file_get_contents($path);
    }
    $this->xfi = new XFi;
    $this->xfi->LoadXML($txt);
    if ($this->xfi->error != '') {
      $this->error = $this->xfi->error;
      return;
    }
    if ($this->xfi->ReorderVoices($pdif)) {
      //echo "Voices reordered due to significant difference in average pitch<br>";
    }
    $this->xfi->ValidateXML();
    if ($this->xfi->error != '') {
      $this->error = $this->xfi->error;
      return;
    }
    $this->GetFirstMeasure();
    if ($this->first_measure_with_notes == 0) {
      $this->error = "No notes found in XML file";
      return;
    }
    $this->MergeNotes();
    $this->FindVoicesWithNotes();
    $this->CountNoteTypes();
    $this->DetectSpecies();
    $this->GetUniqueVoiceNames();
    $this->CheckSpeciesMarks();
  }

  private function CheckSpeciesMarks() {
    for ($vi = 0; $vi < mycount($this->xfi->voice); ++$vi) {
      for ($m = 1; $m < mycount($this->xfi->mea); ++$m) {
        for ($ni = 0; $ni < mycount($this->xfi->note[$vi][$m]); ++$ni) {
          if ($this->xfi->note[$vi][$m][$ni]->lyric != "") {
            preg_match('/\b(sp[0-9]+)\b/', $this->xfi->note[$vi][$m][$ni]->lyric, $matches);
            if (mycount($matches)) {
              $this->species_in_xml[] = $matches[1];
            }
          }
          if ($this->xfi->note[$vi][$m][$ni]->words != "") {
            preg_match('/\b(sp[0-9][0-9]+)\b/', $this->xfi->note[$vi][$m][$ni]->words, $matches);
            if (mycount($matches)) {
              $this->species_in_xml[] = $matches[1];
            }
          }
        }
      }
    }
  }

  private function GetFirstMeasure() {
    for ($vi = 0; $vi < mycount($this->xfi->voice); ++$vi) {
      for ($m = 1; $m < mycount($this->xfi->mea); ++$m) {
        for ($ni = 0; $ni < mycount($this->xfi->note[$vi][$m]); ++$ni) {
          // Find first measure with notes
          if (!$this->xfi->note[$vi][$m][$ni]->rest) {
            if (!$this->first_measure_with_notes) {
              $this->first_measure_with_notes = $m;
              $this->beats = $this->xfi->mea[$m]->beats;
              $this->beat_type = $this->xfi->mea[$m]->beat_type;
              $this->fifths = $this->xfi->note[$vi][$m][$ni]->fifths;
            }
          }
        }
      }
    }
  }

  private function MergeNotes() {
    for ($vi = 0; $vi < mycount($this->xfi->voice); ++$vi) {
      for ($m = 1; $m < mycount($this->xfi->mea); ++$m) {
        for ($ni = 0; $ni < mycount($this->xfi->note[$vi][$m]) - 1; ++$ni) {
          // Detect same note with tie forward
          while ($ni < mycount($this->xfi->note[$vi][$m]) - 1 &&
            $this->xfi->note[$vi][$m][$ni]->pitch == $this->xfi->note[$vi][$m][$ni + 1]->pitch &&
            $this->xfi->note[$vi][$m][$ni]->tie_start &&
            $this->xfi->note[$vi][$m][$ni + 1]->tie_stop
          ) {
            $this->xfi->note[$vi][$m][$ni]->tie_start = $this->xfi->note[$vi][$m][$ni + 1]->tie_start;
            $this->xfi->note[$vi][$m][$ni]->dur += $this->xfi->note[$vi][$m][$ni + 1]->dur;
            array_splice($this->xfi->note[$vi][$m], $ni + 1, 1);
            //echo "Merged to note $vi/$m/$ni<br>";
          }
        }
      }
    }
  }

  private function FindVoicesWithNotes() {
    for ($vi = 0; $vi < mycount($this->xfi->voice); ++$vi) {
      $has_notes = 0;
      for ($m = 1; $m < mycount($this->xfi->mea); ++$m) {
        for ($ni = 0; $ni < mycount($this->xfi->note[$vi][$m]); ++$ni) {
          if (!$this->xfi->note[$vi][$m][$ni]->rest) {
            //echo "Detected note $vi/$m/$ni<br>";
            ++$has_notes;
          }
        }
      }
      // Add new voice
      if ($has_notes) {
        $this->voice[] = new XCVoice;
        $this->voice[mycount($this->voice) - 1]->xv = $vi;
        $this->voice[mycount($this->voice) - 1]->notes_count = $has_notes;
        $this->voice[mycount($this->voice) - 1]->part_id = $this->xfi->voice[$vi]->id;
        $this->voice[mycount($this->voice) - 1]->name = str_replace("MusicXML ", "", $this->xfi->voice[$vi]->name);
        $this->voice[mycount($this->voice) - 1]->display = $this->xfi->voice[$vi]->display;
        $this->voice[mycount($this->voice) - 1]->staff = $this->xfi->voice[$vi]->staff;
        $this->voice[mycount($this->voice) - 1]->v = $this->xfi->voice[$vi]->v;
        $this->voice[mycount($this->voice) - 1]->chord = $this->xfi->voice[$vi]->chord;
      }
    }
  }

  private function CountNoteTypes() {
    for ($vi = 0; $vi < mycount($this->voice); ++$vi) {
      $xv = $this->voice[$vi]->xv;
      $this->voice[$vi]->nlen_count = array();
      for ($m = 1; $m < mycount($this->xfi->mea); ++$m) {
        for ($ni = 0; $ni < mycount($this->xfi->note[$xv][$m]); ++$ni) {
          if (!$this->xfi->note[$xv][$m][$ni]->rest) {
            //echo "Detected note $vi/$m/$ni with dur " . $this->xfi->note[$xv][$m][$ni]->dur . "<br>";
            $nlen = $this->xfi->note[$xv][$m][$ni]->dur * XDIV / $this->xfi->note[$xv][$m][$ni]->dur_div;
            if ($nlen < XDIV / 2) {
              $this->error = "Notes shorter than 1/8 are not allowed in counterpoint exercises";
              return;
            }
            if ($nlen % (XDIV / 2)) {
              $this->error = "Tuplets are not allowed in counterpoint exercises";
              return;
            }
            // Count notes of different lengths
            ++$this->voice[$vi]->nlen_count[$nlen * 2 / XDIV];
            // Count ties
            if ($this->xfi->note[$xv][$m][$ni]->tie_start) {
              ++$this->voice[$vi]->tie_count;
            }
            // Count measures with notes
            ++$this->voice[$vi]->measure_with_notes[$m];
            // Calculate note range
            if ($this->voice[$vi]->minnote > $this->xfi->note[$xv][$m][$ni]->pitch)
              $this->voice[$vi]->minnote = $this->xfi->note[$xv][$m][$ni]->pitch;
            if ($this->voice[$vi]->maxnote < $this->xfi->note[$xv][$m][$ni]->pitch)
              $this->voice[$vi]->maxnote = $this->xfi->note[$xv][$m][$ni]->pitch;
          }
        }
      }
      //print_r($this->voice[$vi]->nlen_count);
      //echo $this->voice[$vi]->tie_count;
      //print_r($this->voice[$vi]->measure_with_notes);
    }
  }

  private function DetectSpecies() {
    $mlen = $this->beats * 8 / $this->beat_type;
    //echo " $mlen ";
    $cf_used = 0;
    for ($vi = mycount($this->voice) - 1; $vi >= 0; --$vi) {
      $vc = &$this->voice[$vi];
      //echo " $vi: ";
      //print_r($vc->nlen_count);
      // If only whole measure notes are present
      if (mycount($vc->nlen_count) == 1 && $vc->nlen_count[$mlen]) {
        if ($vc->tie_count == 0) {
          if ($cf_used) {
            $vc->species_detected = 1;
          } else {
            $vc->species_detected = 0;
            $cf_used = 1;
          }
        }
        else {
          $vc->species_detected = 1;
        }
      }
      // If only half measure notes and one whole measure note are present
      else if (mycount($vc->nlen_count) == 2 && $vc->nlen_count[$mlen] == 1 && $vc->nlen_count[$mlen / 2]) {
        if ($vc->tie_count > mycount($vc->measure_with_notes) / 4) {
          $vc->species_detected = 4;
        }
        else {
          $vc->species_detected = 2;
        }
      }
      // If only third measure notes and one whole measure note are present
      else if (($mlen == 6 || $mlen == 12) && mycount($vc->nlen_count) == 2 && $vc->nlen_count[$mlen] == 1 && $vc->nlen_count[$mlen / 3]) {
        if ($vc->tie_count > mycount($vc->measure_with_notes) / 4) {
          $vc->species_detected = 4;
        }
        else {
          $vc->species_detected = 2;
        }
      }
      // If only quarter notes and one whole measure note are present
      else if (mycount($vc->nlen_count) == 2 && $vc->nlen_count[$mlen] == 1 && $vc->nlen_count[2]) {
        $vc->species_detected = 3;
      }
      // Other rhythms
      else {
        $vc->species_detected = 5;
      }
      $vc->species = $vc->species_detected;
      //echo " {$vc->species} ";
    }
  }

  private function GetUniqueVoiceNames() {
    $nv = array();
    $ns = array();
    $nc = array();
    for ($vi = mycount($this->voice) - 1; $vi >= 0; --$vi) {
      $vc = &$this->voice[$vi];
      ++$nv[$vc->part_id][$vc->v];
      ++$ns[$vc->part_id][$vc->staff];
      ++$nc[$vc->part_id][$vc->chord];
    }
    foreach ($nv as $part_id => $val) {
      if (mycount($nv[$part_id]) > 1) {
        for ($vi = mycount($this->voice) - 1; $vi >= 0; --$vi) {
          $vc = &$this->voice[$vi];
          if ($vc->part_id == $part_id) $vc->unique_v = 1;
        }
      }
      if (mycount($ns[$part_id]) > 1) {
        for ($vi = mycount($this->voice) - 1; $vi >= 0; --$vi) {
          $vc = &$this->voice[$vi];
          if ($vc->part_id == $part_id) $vc->unique_staff = 1;
        }
      }
      if (mycount($nc[$part_id]) > 1) {
        for ($vi = mycount($this->voice) - 1; $vi >= 0; --$vi) {
          $vc = &$this->voice[$vi];
          if ($vc->part_id == $part_id) $vc->unique_chord = 1;
        }
      }
    }
    // Create unique strings
    for ($vi = mycount($this->voice) - 1; $vi >= 0; --$vi) {
      $vc = &$this->voice[$vi];
      $vc->unique_name = $vc->name;
      if (trim($vc->name) == "") $vc->unique_name = "[NO NAME]";
      $unique_st = "";
      if ($vc->unique_staff) {
        if ($unique_st != "") $unique_st .= ", ";
        $unique_st .= "staff {$vc->staff}";
      }
      if ($vc->unique_v) {
        if ($unique_st != "") $unique_st .= ", ";
        $unique_st .= "voice {$vc->v}";
      }
      if ($vc->unique_chord) {
        if ($unique_st != "") $unique_st .= ", ";
        $unique_st .= "subvoice " . ($vc->chord + 1);
      }
      if ($unique_st != "") $vc->unique_name .= " ($unique_st)";
    }
  }
}
