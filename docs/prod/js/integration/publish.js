import { settings } from "../state/settings.js";
import { nd } from "../notes/NotesData.js";
import { mgen_login, urlNoParams } from "../core/remote.js";
import { state2url, browser_id } from "../state/state.js";
import { saveState } from "../state/history.js";
import { ares } from "../analysis/AnalysisResults.js";
import { getMusicHash, getAnnotationsHash, getPublishedModeName, getSpeciesString, getVocraString, getCantusHash } from "../notes/NotesPublish.js";

export function publish(security, update=false) {
  $.ajax({
    type: 'POST',
    url: 'https://artinfuser.com/exercise/publish-exercise.php',
    data: {
      robot: 'robot_aih',
      token: 'xaJD5Bm9LwuQwRQ9',
      state: state2url(),
      settings: settings.settings2url(),
      title: nd.name,
      fname: nd.fileName,
      security: security,
      uname: mgen_login,
      browser_id: browser_id,
      base_url: urlNoParams(),
      root_eid: nd.root_eid,
      eid: update ? nd.eid : 0,
      logrocket: window.logrocketSessionUrl,
      algo: nd.algo,
      flags: ares.stats,
      music_hash: getMusicHash(),
      annotations_hash: getAnnotationsHash(),
      keysig: getPublishedModeName(),
      species: getSpeciesString(),
      cantus_hash: getCantusHash(),
      vocra: getVocraString(),
      timesig: nd.timesig.beats_per_measure + '/' + nd.timesig.beat_type,
    },
    dataType: 'html',
    success: function (data) {
      console.log('Publish success', data);
      getPublishResult(data);
    },
    error: function (error) {
      alertify.error('Error publishing: ' + error.status);
    }
  });
}

function getPublishResult(data) {
  let spl = data.split('\n');
  if (spl.length < 3 || spl[0] !== 'Published successfully' || isNaN(spl[1]) || isNaN(spl[2])) {
    alertify.error('Error publishing exercise: ' + data);
    return;
  }
  const root_eid = spl[1];
  const eid = spl[2];
  alertify.notify(`Published successfully as #${root_eid}/${eid}: <a style='color:yellow' href=https://artinfuser.com/exercise/exercise.php?id=${root_eid} target=_blank>your link</a>`, 'success', 60);
  nd.set_root_eid(root_eid);
  saveState(false);
}
