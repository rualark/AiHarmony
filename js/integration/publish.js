import { settings } from "../state/settings.js";
import { nd } from "../notes/NotesData.js";
import { mgen_login, urlNoParams } from "../core/remote.js";
import { state2url } from "../state/state.js";

export function publish(security) {
  $.ajax({
    type: 'POST',
    url: 'https://artinfuser.com/studio/publish-exercise.php',
    data: {
      robot: 'robot_aih',
      token: 'xaJD5Bm9LwuQwRQ9',
      state: state2url(),
      settings: settings.settings2url(),
      title: nd.name,
      fname: nd.fileName,
      security: security,
      uname: mgen_login,
      browser_id: 'unavailable',
      base_url: urlNoParams(),
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
  if (spl.length < 2 || spl[0] !== 'Published successfully' || isNaN(spl[1])) {
    alertify.error('Error: ' + data);
    return;
  }
  const publish_id = spl[1];
  alertify.notify(`Published successfully: <a style='color:yellow' href=https://artinfuser.com/studio/exercise.php?id=${publish_id} target=_blank>your link</a>`, 'success', 60);
}
