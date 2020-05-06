<?php

class XMLNote {
  public $pos = 0; // position inside measure
	public $pitch = 0; // with alteration applied
  public $dur = 0; // duration
  public $dur_div = 1; // duration divisions
  public $alter = 0;
  public $rest = true;
  public $tie_start = false;
  public $tie_stop = false;
  public $grace = false;
  public $tempo = 0;
  public $lyric;
  public $words;
  public $fifths = 100;
  public $mode;
};

class XMLMeasure {
  public $beats = 0;
  public $beat_type = 0;
  public $len = 0; // Measure length in whole notes
  public $barline;
};

class XMLVoice {
  public $id;
  public $name;
  public $display;
  public $staff;
  public $v;
  public $chord;
  public $average_pitch;
};

// Load MusicXML
class XFi
{
  public $error = "";
  public $warning = "";
  public $encoder;
  public $software;
  public $encoding_date;
  public $encoding_description;
  public $work_title;
  public $composer;
  public $arranger;
  public $rights;

  public $voice = array(); // [v]
  public $mea = array(); // [m]
  public $note = array(); // [v][m][]

  private $d;
  /** @var DOMXPath $xp */
  private $xp;

  public function LoadXML($txt)
  {
    $this->d = new DOMDocument();
    if (!$this->d->loadXML($txt)) {
      $this->error = "Error parsing MusicXML file - check format";
      return;
    }
    $this->xp = new DOMXPath($this->d);
    $this->encoder = $this->GetXPathValue("//score-partwise/identification/encoding/encoder");
    $this->encoding_date = $this->GetXPathValue("//score-partwise/identification/encoding/encoding-date");
    $this->software = $this->GetXPathValue("//score-partwise/identification/encoding/software");
    $this->encoding_description = $this->GetXPathValue("//score-partwise/identification/encoding/encoding-description");
    $this->work_title = $this->GetXPathValue("//score-partwise/work/work-title");
    $this->composer = $this->GetXPathValue("//score-partwise/identification/creator[@type='composer']");
    $this->arranger = $this->GetXPathValue("//score-partwise/identification/creator[@type='arranger']");
    $this->rights = $this->GetXPathValue("//score-partwise/identification/rights");
    $res = $this->xp->query("//score-partwise/part/measure/*");
    if ($res === false || !$res->length) {
      $this->error = "Cannot find notes in XML";
      return;
    }
    $divisions = 2;
    $m_pos = 0;
    $m_pos_prev = 0;
    $chord = 0;
    $max_mea = 1;
    $v = -1;
    $old_m = -1;
    $old_part_id = "";
    $mode = "";
    $fifths = 0;
    $beats = 4;
    $dur_prev = 256;
    $beat_type = 4;
    $this->mea[0] = new XMLMeasure();
    $words = array();
    /** @var DOMElement $e */
    foreach ($res as $e) {
      $n_attr = $e->parentNode->getElementsByTagName('attributes')->item(0);
      if ($n_attr) {
        $cur_div = $n_attr->getElementsByTagName('divisions')->item(0)->nodeValue;
        if ($cur_div) $divisions = $cur_div;
      }
      if ($e->nodeName == "direction") {
        $this->GetChildValue($e, $staff, 'staff');
        $n_direction_type = $e->parentNode->getElementsByTagName('direction-type')->item(0);
        // TODO: Is the next line a bug and should be removed?
        $this->GetChildValue($n_direction_type, $words[$staff], 'bar-style');
        if ($n_direction_type) {
          $n_words = $n_direction_type->getElementsByTagName("words");
          for ($i=0; $i<$n_words->length; ++$i) {
            $words[$staff] .= $n_words->item($i)->nodeValue;
            $words[$staff] .= " ";
          }
        }
      }
      if ($e->nodeName == "forward") {
        $m_pos = $m_pos + $e->getElementsByTagName('duration')->item(0)->nodeValue * 0.25 / $divisions;
        //echo "Pos: $m_pos change " . ($e->getElementsByTagName('duration')->item(0)->nodeValue * 0.25 / $divisions) . "<br>";
      }
      if ($e->nodeName == "backup") {
        $m_pos = $m_pos - $e->getElementsByTagName('duration')->item(0)->nodeValue * 0.25 / $divisions;
        //echo "Pos: $m_pos change " . ($e->getElementsByTagName('duration')->item(0)->nodeValue * 0.25 / $divisions) . "<br>";
      }
      if ($e->nodeName == "note") {
        $this->GetChildValue($e, $v, 'voice');
        $this->GetChildValue($e, $staff, 'staff');
        $part_id = $e->parentNode->parentNode->getAttribute('id');
        $m = $e->parentNode->getAttribute('number');
        if ($m > $max_mea) $max_mea = $m;
        if ($e->getElementsByTagName('chord')->length) {
          ++$chord;
        } else $chord = 0;
        $vi = $this->AllocateVoice($part_id, $staff, $v, $chord);
        // Load measure barline if it is first note in measure
        if (mycount($this->mea) <= $m) {
          $this->mea[$m] = new XMLMeasure;
          $n_barline = $e->parentNode->getElementsByTagName('barline')->item(0);
          $this->GetChildValue($n_barline, $this->mea[$m]->barline, 'bar-style');
        }
        // Load measure number if this is first note in measure in this voice
        if ($old_m != $m || $old_part_id != $part_id) {
          $m_pos = 0;
        }
        // Load measure parameters if this is new measure in this part
        if ($old_m != $m) {
          if ($n_attr) {
            $n_key = $n_attr->getElementsByTagName('key')->item(0);
            $this->GetChildValue($n_key, $mode, 'mode');
            $this->GetChildValue($n_key, $fifths, 'fifths');
            $n_time = $n_attr->getElementsByTagName('time')->item(0);
            $this->GetChildValue($n_time, $beats, 'beats');
            $this->GetChildValue($n_time, $beat_type, 'beat-type');
          }
          $this->mea[$m]->beats = $beats;
          $this->mea[$m]->beat_type = $beat_type;
          $this->mea[$m]->len = $this->mea[$m]->beats * 1.0 / $this->mea[$m]->beat_type;
        }
        $old_m = $m;
        $old_part_id = $part_id;
        if ($chord)
          $m_pos = $m_pos_prev;
        if (is_array($this->note[$vi][$m]))
          $ni = mycount($this->note[$vi][$m]);
        else $ni = 0;
        $this->note[$vi][$m][$ni] = new XMLNote;
        $this->note[$vi][$m][$ni]->pos = $m_pos;
        $this->note[$vi][$m][$ni]->fifths = $fifths;
        $this->note[$vi][$m][$ni]->mode = $mode;
        if ($this->FindChildByAttribute($e, "tie", "type", "stop")) {
          $this->note[$vi][$m][$ni]->tie_stop = 1;
        }
        if ($this->FindChildByAttribute($e, "tie", "type", "start")) {
          $this->note[$vi][$m][$ni]->tie_start = 1;
        }
        if ($e->getElementsByTagName('grace')->length) {
          $this->note[$vi][$m][$ni]->grace = true;
        }
        if ($e->getElementsByTagName('rest')->length) {
          $this->note[$vi][$m][$ni]->rest = true;
        } else {
          $this->note[$vi][$m][$ni]->rest = false;
          $this->note[$vi][$m][$ni]->alter = intval($e->getElementsByTagName('pitch')->item(0)->getElementsByTagName('alter')->item(0)->nodeValue);
          $octave = intval($e->getElementsByTagName('pitch')->item(0)->getElementsByTagName('octave')->item(0)->nodeValue);
          $pitch_name = $e->getElementsByTagName('pitch')->item(0)->getElementsByTagName('step')->item(0)->nodeValue;
          $pitch = 12 * ($octave + 1) + $this->GetPitchByName($pitch_name) + $this->note[$vi][$m][$ni]->alter;
          $this->note[$vi][$m][$ni]->pitch = $pitch;
          //echo "VI: $vi, Part id: $part_id, Voice: $v, Staff: $staff, Measure: $m, Chord: $chord, Pitch: $pitch_name/$pitch, Beats: $beats, Beat_type: $beat_type, Mode: $mode, Fifths: $fifths<br>";
        }
        if ($chord) {
          $this->note[$vi][$m][$ni]->dur = $dur_prev;
        } else {
          $this->GetChildValue($e, $this->note[$vi][$m][$ni]->dur, 'duration');
        }
        $this->note[$vi][$m][$ni]->dur_div = $divisions;
        $n_lyric = $e->getElementsByTagName('lyric')->item(0);
        $this->GetChildValue($n_lyric, $this->note[$vi][$m][$ni]->lyric, 'text');
        if ($words[$staff] != "") {
          $this->note[$vi][$m][$ni]->words = $words[$staff];
          $words[$staff] = "";
        }
        $m_pos_prev = $m_pos;
        $dur_prev = $this->note[$vi][$m][$ni]->dur;
        $m_pos += $this->note[$vi][$m][$ni]->dur * 0.25 / $divisions;
      }
    }
    for ($vi = 0; $vi < mycount($this->voice); ++$vi) {
      // Fill empty measures with pause
      for ($m = 1; $m < mycount($this->mea); ++$m) {
        // Do not fill measures with notes
        if (is_array($this->note[$vi][$m]) &&
          mycount($this->note[$vi][$m])) continue;
        $this->note[$vi][$m][0] = new XMLNote;
        $this->note[$vi][$m][0]->dur_div = 1024 / $this->mea[$m]->beat_type;
        $this->note[$vi][$m][0]->dur = 1024 * $this->mea[$m]->beats / $this->mea[$m]->beat_type;
        //echo "Added rest to empty measure $vi/$m<br>";
      }
    }
  }

  private function GetChildValue($node, &$var, $name)
  {
    /** @var DOMElement $node */
    if ($node) {
      $node2 = $node->getElementsByTagName($name)->item(0);
      if ($node2) $var = $node2->nodeValue;
    }
  }

  private function FindChildByAttribute($node, $child_name, $attr_name, $attr_value)
  {
    /** @var DOMElement $node */
    if (!$node) return 0;
    $nodes = $node->getElementsByTagName($child_name);
    if (!$nodes->length) return 0;
    /** @var DOMElement $node2 */
    foreach ($nodes as $node2) {
      if ($node2->getAttribute($attr_name) == $attr_value) return 1;
    }
    return 0;
  }

  private function GetXPathValue($q)
  {
    $res = $this->xp->query($q);
    return $res->item(0)->nodeValue;
  }

  private function GetPitchByName($pitch) {
    if ($pitch == 'C') return 0;
    if ($pitch == 'D') return 2;
    if ($pitch == 'E') return 4;
    if ($pitch == 'F') return 5;
    if ($pitch == 'G') return 7;
    if ($pitch == 'A') return 9;
    if ($pitch == 'B') return 11;
    $this->error = "Cannot parse pitch " . $pitch;
    return 0;
  }

  private function AllocateVoice($part_id, $staff, $v, $chord)
  {
    // Check if this voice exists
    for ($i = 0; $i < mycount($this->voice); ++$i) {
      if ($this->voice[$i]->id == $part_id && $this->voice[$i]->staff == $staff &&
        $this->voice[$i]->v == $v && $this->voice[$i]->chord == $chord) return $i;
    }
    // Create new voice
    $new_voice = new XMLVoice;
    $new_voice->id = $part_id;
    $new_voice->staff = $staff;
    $new_voice->v = $v;
    $new_voice->chord = $chord;
    $new_voice->name = $this->GetXPathValue("//score-partwise/part-list/score-part[@id = '" . $part_id . "']/part-name");
    $new_voice->display = $this->GetXPathValue("//score-partwise/part-list/score-part[@id = '" . $part_id . "']/part-name-display/display-text");
    // For chords search for previous voice
    if ($chord) {
      for ($i = 0; $i < mycount($this->voice); ++$i) {
        if ($this->voice[$i]->id == $part_id && $this->voice[$i]->staff == $staff &&
          $this->voice[$i]->v == $v && $this->voice[$i]->chord == $chord - 1) {
          // Insert before previous voice
          array_splice($this->voice, $i, 0, [$new_voice]);
          array_splice($this->note, $i, 0, [array()]);
          return $i;
        }
      }
    }
    $this->voice[] = $new_voice;
    return mycount($this->voice) - 1;
  }

  private function GetErrPrefix($vi, $m, $ni)
  {
    return "Measure $m, vi $vi, part id " . $this->voice[$vi]->id .
      ", part name " . $this->voice[$vi]->name . ", staff " .
      $this->voice[$vi]->staff . ", voice " .
      $this->voice[$vi]->v . ", chord " .
      $this->voice[$vi]->chord . ", beat " .
      $this->mea[$m]->beats . "/" .
      $this->mea[$m]->beat_type . ": note " . ($ni + 1) .
      " of " . mycount($this->note[$vi][$m]) . ".";
  }

  public function ValidateXML()
  {
    // Check if measure is not filled with notes
    for ($vi = 0; $vi < mycount($this->voice); ++$vi) {
      for ($m = 1; $m < mycount($this->mea); ++$m) {
        // Do not check measures without notes
        if (!mycount($this->note[$vi][$m])) continue;
        $stack = $this->note[$vi][$m][0]->pos;
        for ($ni = 0; $ni < mycount($this->note[$vi][$m]); ++$ni) {
          // Detect hidden pause
          if ($ni && $this->note[$vi][$m][$ni]->pos > $stack) {
            $new_pause = new XMLNote;
            $new_pause->pos = $stack;
            $new_pause->dur_div = $this->note[$vi][$m][$ni - 1]->dur_div;
            $new_pause->dur = ($this->note[$vi][$m][$ni]->pos - $stack) * 4 * $new_pause->dur_div;
            array_splice($this->note[$vi][$m], $ni, 0, [$new_pause]);
            //echo "Added hidden pause $vi/$m/$ni<br>";
          }
          // Detect length error
          if ($ni && $this->note[$vi][$m][$ni]->pos < $stack) {
            $this->error = $this->GetErrPrefix($vi, $m, $ni) . " Note starts at position " .
              $this->note[$vi][$m][$ni]->pos . " that is less than stack of previous note lengths $stack";
            return;
          }
          $stack += $this->note[$vi][$m][$ni]->dur * 0.25 / $this->note[$vi][$m][$ni]->dur_div;
        }
        for ($ni = 0; $ni < mycount($this->note[$vi][$m]); ++$ni) {
          if ($this->note[$vi][$m][$ni]->tie_start) {
            if ($ni < mycount($this->note[$vi][$m]) - 1) {
              if ($this->note[$vi][$m][$ni + 1]->rest) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note starts tie, but next note in this measure is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                $this->note[$vi][$m][$ni]->tie_start = 0;
              }
              if ($this->note[$vi][$m][$ni]->pitch != $this->note[$vi][$m][$ni + 1]->pitch) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note starts tie, but next note in this measure has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                $this->note[$vi][$m][$ni]->tie_start = 0;
              }
              if (!$this->note[$vi][$m][$ni + 1]->tie_stop) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note starts tie, but next note in this measure does not stop tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                $this->note[$vi][$m][$ni]->tie_start = 0;
              }
            } else if ($m < mycount($this->mea) - 1) {
              if (!mycount($this->note[$vi][$m + 1])) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note starts tie, but next measure does not have note in this voice.";
                $this->note[$vi][$m][$ni]->tie_start = 0;
              } else {
                if ($this->note[$vi][$m + 1][0]->rest) {
                  $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                    " Note starts tie, but next note is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  $this->note[$vi][$m][$ni]->tie_start = 0;
                }
                if ($this->note[$vi][$m][$ni]->pitch != $this->note[$vi][$m + 1][0]->pitch) {
                  $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                    " Note starts tie, but next note has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  $this->note[$vi][$m][$ni]->tie_start = 0;
                }
                if (!$this->note[$vi][$m + 1][0]->tie_stop) {
                  $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                    " Note starts tie, but next note does not stop tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  $this->note[$vi][$m][$ni]->tie_start = 0;
                }
              }
            } else {
              $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                " Note starts tie, but it is last note in this voice.";
              $this->note[$vi][$m][$ni]->tie_start = 0;
            }
          }
          if ($this->note[$vi][$m][$ni]->tie_stop) {
            if ($ni) {
              if ($this->note[$vi][$m][$ni - 1]->rest) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note stops tie, but previous note in this measure is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                $this->note[$vi][$m][$ni]->tie_stop = 0;
              }
              if ($this->note[$vi][$m][$ni]->pitch != $this->note[$vi][$m][$ni - 1]->pitch) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note stops tie, but previous note in this measure has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                $this->note[$vi][$m][$ni]->tie_stop = 0;
              }
              if (!$this->note[$vi][$m][$ni - 1]->tie_start) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note stops tie, but previous note in this measure does not stop tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                $this->note[$vi][$m][$ni]->tie_stop = 0;
              }
            } else if ($m > 1) {
              if (!mycount($this->note[$vi][$m - 1])) {
                $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                  " Note stops tie, but previous measure does not have note in this voice.";
                $this->note[$vi][$m][$ni]->tie_stop = 0;
              } else {
                if ($this->note[$vi][$m - 1][mycount($this->note[$vi][$m - 1]) - 1]->rest) {
                  $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                    " Note stops tie, but previous note is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  $this->note[$vi][$m][$ni]->tie_stop = 0;
                }
                if ($this->note[$vi][$m][$ni]->pitch != $this->note[$vi][$m - 1][mycount($this->note[$vi][$m - 1]) - 1]->pitch) {
                  $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                    " Note stops tie, but previous note has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  $this->note[$vi][$m][$ni]->tie_stop = 0;
                }
                if (!$this->note[$vi][$m - 1][mycount($this->note[$vi][$m - 1]) - 1]->tie_start) {
                  $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                    " Note stops tie, but previous note does not start tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  $this->note[$vi][$m][$ni]->tie_stop = 0;
                }
              }
            } else {
              $this->warning = $this->GetErrPrefix($vi, $m, $ni) .
                " Note stops tie, but it is the first note in this voice.";
              $this->note[$vi][$m][$ni]->tie_stop = 0;
            }
          }
        }
        // Do not check chord voices for note length $stack
        //if ($this->voice[$vi].chord) continue;
        // Add pause if measure is not full
        if ($stack < $this->mea[$m]->len) {
          $new_pause = new XMLNote;
          $new_pause->pos = $stack;
          $new_pause->dur_div = $this->note[$vi][$m][mycount($this->note[$vi][$m]) - 1]->dur_div;
          $new_pause->dur = ($this->mea[$m]->len - $stack) * 4 * $new_pause->dur_div;
          $this->note[$vi][$m][] = $new_pause;
          //echo "Added hidden pause to the end of measure $vi/$m<br>";
        }
        // Detect length error
        if ($stack > $this->mea[$m]->len) {
          $this->error = $this->GetErrPrefix($vi, $m, mycount($this->note[$vi][$m])) .
            " Need " . $this->mea[$m]->len . " time but got $stack";
          return;
        }
      }
    }
  }

  public function ReorderVoices($pdif)
  {
    if (!$pdif) return 0;
    //echo "<pre>";
    //print_r($this->voice);
    // Calculate average pitch
    for ($vi = 0; $vi < mycount($this->voice); ++$vi) {
      $apitch = 0;
      $alen = 0;
      for ($m = 1; $m < mycount($this->mea); ++$m) {
        for ($ni = 0; $ni < mycount($this->note[$vi][$m]); ++$ni) {
          if (!$this->note[$vi][$m][$ni]->rest) {
            $apitch += $this->note[$vi][$m][$ni]->dur * $this->note[$vi][$m][$ni]->pitch;
            $alen += $this->note[$vi][$m][$ni]->dur;
          }
        }
      }
      if ($alen) {
        $this->voice[$vi]->average_pitch = $apitch / $alen;
      } else {
        $this->voice[$vi]->average_pitch = 0;
      }
    }
    $reordered = 0;
    for ($i = 0; $i < 100; ++$i) {
      if (!$this->ReorderTwoVoices($pdif)) break;
      ++$reordered;
    }
    //print_r($this->voice);
    return $reordered;
  }

  private function ReorderTwoVoices($pdif)
  {
    for ($vi = 0; $vi < mycount($this->voice) - 1; ++$vi) {
      for ($vi2 = $vi + 1; $vi2 < mycount($this->voice); ++$vi2) {
        // Do not reorder voices if either of them was not calculated
        if (!$this->voice[$vi]->average_pitch) continue;
        if (!$this->voice[$vi2]->average_pitch) continue;
        // Reorder only if pitch difference is significant
        if ($this->voice[$vi2]->average_pitch - $this->voice[$vi]->average_pitch < $pdif) continue;
        $temp = $this->voice[$vi];
        $this->voice[$vi] = $this->voice[$vi2];
        $this->voice[$vi2] = $temp;
        $temp = $this->note[$vi];
        $this->note[$vi] = $this->note[$vi2];
        $this->note[$vi2] = $temp;
        //echo "Reordered voices $vi-$vi2<br>";
        return 1;
      }
    }
  }

}
