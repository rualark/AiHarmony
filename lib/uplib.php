<?php

require_once "xlib.php";

function get_single_file_in_folder($dir) {
  $handle = opendir($dir);
  while (($file = readdir($handle)) !== false) {
    if ($file == '.' || $file == '..') {
      continue;
    }
    if (is_dir("$dir$file")) continue;
    $filepath = $dir . $file;
  }
  closedir($handle);
  return $filepath;
}

function UploadErrorCodeToMessage($code) {
  switch ($code) {
    case UPLOAD_ERR_INI_SIZE:
      $message = "The uploaded file exceeds the upload_max_filesize directive in php.ini";
      break;
    case UPLOAD_ERR_FORM_SIZE:
      $message = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
      break;
    case UPLOAD_ERR_PARTIAL:
      $message = "The uploaded file was only partially uploaded";
      break;
    case UPLOAD_ERR_NO_FILE:
      $message = "No file was uploaded";
      break;
    case UPLOAD_ERR_NO_TMP_DIR:
      $message = "Missing a temporary folder";
      break;
    case UPLOAD_ERR_CANT_WRITE:
      $message = "Failed to write file to disk";
      break;
    case UPLOAD_ERR_EXTENSION:
      $message = "File upload stopped by extension";
      break;

    default:
      $message = "Unknown upload error";
      break;
  }
  return $message;
}

function mxl_unzip() {
  GLOBAL $ml, $fname, $fname2, $tmpname, $uid, $upload_error;
  // Get free ID
  mysqli_query($ml, "LOCK TABLES users WRITE");
  echo mysqli_error($ml);
  $r = mysqli_query($ml, "SELECT u_upload_id FROM users WHERE u_id=$uid");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  $upload_id = $w['u_upload_id'];
  mysqli_query($ml, "UPDATE users SET u_upload_id=u_upload_id+1 WHERE u_id=$uid");
  echo mysqli_error($ml);
  mysqli_query($ml, "UNLOCK TABLES");
  echo mysqli_error($ml);
  $zip = new ZipArchive;
  $res = $zip->open($tmpname);
  if ($res === TRUE) {
    $folder = "upload_unzip/" . date("Y/m-d") . "/$uid/$upload_id/";
    mkdir("share/" . substr($folder, 0, strlen($folder) - 1), 0777, true);
    // Copy file
    $zip->extractTo("share/" . $folder);
    $zip->close();
    $unzipped_fpath = get_single_file_in_folder("share/$folder");
    $tmpname = $unzipped_fpath;
    $fname = str_replace(".mxl", ".xml", $fname);
    $fname2 = str_replace(".mxl", ".xml", $fname2);
    //echo "$unzipped_fpath";
  } else {
    $upload_error = "Error unzipping MXL file. Please check your file";
    return 1;
  }
  return 0;
}

function upload_file($acode) {
  GLOBAL $upload_error, $ml, $uid, $waj, $default_ilist, $f_id, $create_cause, $j_id0, $wf,
         $f_site, $fname, $fname2, $tmpname, $algo, $fdt, $fnm, $start_class, $caa, $ua;
  $type = '';
  if ($algo[$acode]['mfi']) $type = 'MIDI';
  if ($algo[$acode]['xfi']) $type = 'MusicXML';
  $fname2 = "";
  $xca = new XCA;
  if ($fdt || $fnm) {
    $fname = $fnm;
    if ($type == "MIDI" && substr($fdt, 0, 16) == 'data:audio/midi,') {
      $fdt = urldecode(substr($fdt, 16));
    }
  }
  else {
    if ($_FILES["file"]["error"] > 0) {
      $upload_error = "Error: " . $_FILES["file"]["error"] . ". " . UploadErrorCodeToMessage($_FILES["file"]["error"]);
      return 1;
    }
    if ($_FILES["file"]["size"] == 0) {
      $upload_error = "Selected file is empty. Please select another file.";
      return 1;
    }
    $fname = $_FILES["file"]["name"];
    $tmpname = $_FILES["file"]["tmp_name"];
  }
  $pp = pathinfo($fname);
  $fname2 = transliterator_transliterate('Any-Latin; Latin-ASCII;', $fname);
  $fname2 = str_replace(" ", "-", $fname2);
  $fname2 = str_replace("_", "-", $fname2);
  $fname2 = str_replace(".midi", ".mid", $fname2);
  $fname2 = translit($fname2);
  $fname2 = preg_replace('/[^0-9a-zA-Z\-\.]/',"",$fname2);
  $fname2 = str_replace("--", "-", $fname2);
  $fname2 = str_replace("--", "-", $fname2);
  $fname2 = str_replace("--", "-", $fname2);
  if (strlen($fname2) < 7) $fname2 = date("Y-m-d-") . $fname2;
  if ($type == "MIDI") {
    if (strtolower($pp['extension']) != 'mid' && strtolower($pp['extension']) != 'midi') {
      $upload_error = "Wrong file extension: only mid and midi extensions can be accepted";
      return 1;
    }
    if ($tmpname) {
      if (load_midifile($tmpname)) {
        $upload_error = "Wrong MIDI file format. Probably not MIDI file?";
        return 1;
      }
    }
  }
  else {
    if (strtolower($pp['extension']) == "mxl") {
      if (mxl_unzip()) {
        return 1;
      }
      $pp = pathinfo($fname);
    }
    if (strtolower($pp['extension']) != 'xml') {
      $upload_error = "Wrong file extension: only XML extension can be accepted";
      return 1;
    }
    $xca->AnalyseCP($tmpname, 3, $fdt);
    if ($xca->error != "") {
      $upload_error = $xca->error;
      return 1;
    }
  }
  // Insert into sql
  mysqli_query($ml, "INSERT INTO files 
    (f_name, f_time, f_private, u_id, f_format, f_source, f_gen, f_site, f_store)
    VALUES('".mysqli_escape_string($ml, $fname2)."', NOW(), 1, '$uid', '$type', '".
      mysqli_escape_string($ml, $fname)."', '$acode', '$f_site', 7)");
  echo mysqli_error($ml);
  // Set job folder
  $f_id = mysqli_insert_id($ml);
  if ($type == "MusicXML") {
    $composer = mysqli_real_escape_string($ml, $xca->xfi->composer);
    $arranger = mysqli_real_escape_string($ml, $xca->xfi->arranger);
    $encoder = mysqli_real_escape_string($ml, $xca->xfi->encoder);
    $software = mysqli_real_escape_string($ml, $xca->xfi->software);
    $encoding_date = mysqli_real_escape_string($ml, $xca->xfi->encoding_date);
    $encoding_description = mysqli_real_escape_string($ml, $xca->xfi->encoding_description);
    $work_title = mysqli_real_escape_string($ml, $xca->xfi->work_title);
    $rights = mysqli_real_escape_string($ml, $xca->xfi->rights);
    mysqli_query($ml, "UPDATE files SET
      f_encoder='$encoder', f_encoding_date='$encoding_date', f_composer='$composer', f_arranger='$arranger',
      f_software='$software', f_work_title='$work_title', f_rights='$rights', 
      f_encoding_description='$encoding_description'
      WHERE f_id='$f_id'");
    echo mysqli_error($ml);
  }
  $f_folder = "upload/" . date("Y/m-d") . "/$uid-$f_id/";
  mkdir("share/" . substr($f_folder, 0, strlen($f_folder) - 1), 0777, true);
  if ($tmpname) {
    copy($tmpname, "share/" . $f_folder . $fname2);
  }
  else {
    file_put_contents("share/" . $f_folder . $fname2, $fdt);
  }
  $h_id = get_hash_id("share/" . $f_folder . $fname2);
  mysqli_query($ml, "UPDATE files SET f_folder='$f_folder', h_id='$h_id' WHERE f_id='$f_id'");
  echo mysqli_error($ml);
  // Load tracks and set predict dur/cost
  load_file();
  if ($type == "MIDI") {
    reload_inames_from_file();
  }
  load_file();
  // Create jobs
  $create_cause = "Upload new file";
  if ($acode == "CA3" || $acode == "MP1")
    $priority = 10 + min(1000, sqrt($wf['f_predict_dur']+1));
  else $priority = 2000;
  create_jobs($acode, $priority);
  load_active_jobs();
  if (is_array($waj[jcRENDER]))
    inject_config($waj[jcRENDER], "Instruments", $default_ilist);

  if ($acode == "MP1") {
    remap_instruments();
    detect_mftype();
    load_active_jobs();
    if ($j_id0) {
      copy_config($j_id0, $waj[jcRENDER]);
    }
  }

  //echo "New name: $fname2<br>";
  //echo "Upload: " . $_FILES["file"]["name"] . "<br />";
  //echo "Type: " . $_FILES["file"]["type"] . "<br />";
  //echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
  //echo "Temp file: " . $_FILES["file"]["tmp_name"] . "<br />";
  if ($fdt) {
    echo "$ua[u_name]\n";
    echo "Upload successful\n";
    if ($start_class) {
      load_file();
      load_active_jobs();
      $caa = parse_jobs_config($waj);
      load_instruments();
      get_tr_inst();
      load_voices($waj[jcRENDER]);
      map_stems($waj[jcRENDER]);
      AnalyseCP();
      mysqli_query($ml, "UPDATE files SET f_stems=0 WHERE f_id='$f_id'");
      echo mysqli_error($ml);
      mysqli_query($ml,"UPDATE jobs SET started_u_id='$uid', j_state=1, j_cleaned=0, j_size=0, j_queued=NOW() WHERE f_id='$f_id' AND j_class='$start_class' AND j_deleted=0 AND (j_state=0 OR j_state=3)");
      echo mysqli_error($ml);
      echo "Start successful\n";
    }
    die("$f_id");
  }
  die ("<script language=javascript>location.replace('file.php?f_id=$f_id');</script>");
}

