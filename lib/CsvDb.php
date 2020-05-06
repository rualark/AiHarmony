<?php
class CsvDb {
  public $result; // [row][field] Array of mapped results
  public $header; // [field] Field names
  public $filter; // [field] Filter values for each field

  private $line; // Current line in file
  private $sep = ";"; // Separator between fields in file
  private $path; // File path
  private $fh; // File handler

  private function FileOpen() {
    $this->fh = fopen($this->path, "r");
    $this->line = 0;
  }

  private function FileClose() {
    fclose($this->fh);
  }

  function Open($pth) {
    $this->path = $pth;
    if (!file_exists($pth)) return "Cannot find file " . $pth;
    $this->FileOpen();
    $this->LoadHeader();
    $this->FileClose();
    return "";
  }

  function Select() {
    $this->result = array();
    $this->FileOpen();
    $this->LoadHeader();
    while (($st = fgets($this->fh, 4096)) !== false) {
      $st = trim($st);
      $sa = explode($this->sep, $st);
      if (mycount($sa) != mycount($this->header)) {
        return "Wrong column count in file " . $this->path . " at line " . $this->line;
      }
      if (mycount($this->filter)) {
        $found = 1;
        foreach ($this->filter as $key => $val) {
          if ($sa[$this->header[$key]] != $val) {
            $found = 0;
            break;
          }
        }
        if (!$found) continue;
      }
      $r = mycount($this->result);
      foreach ($this->header as $field => $pos) {
        $this->result[$r][$field] = $sa[$pos];
      }
      ++$this->line;
    }
    $this->FileClose();
    return "";
  }

  private function LoadHeader() {
    $this->header = array();
    $st = fgets($this->fh);
    ++$this->line;
    if (substr($st, 0, 4) == "sep=") {
      $this->sep = substr($st, 4, 1);
      $st = fgets($this->fh);
      ++$this->line;
    }
    $st = trim($st);
    $sa = explode($this->sep, $st);
    for ($i=0; $i<mycount($sa); ++$i) {
      $this->header[$sa[$i]] = $i;
    }
  }
}
?>