import {launchAnalysis} from "./analysisLauncher.js";
import {data2plain} from "../state/state.js";
import {nd} from "../notes/NotesData.js";
import {ares} from "./AnalysisResults.js";
import { environment } from "../../js/core/remote.js";
import { settings } from "../state/settings.js";

export function analyse() {
  let debugLevel = 0;
  if (!environment.startsWith('prod')) debugLevel = 10;
  // Prevent drawing old shapes before analysis, while other analysis data should be drawn to prevent flickering
  ares.resetShapes();
  if (nd.algo === '') {
    ares.reset();
    $('#mode').html('');
    $('#analysisConsole').html('');
  }
  else {
    launchAnalysis(nd.algo, '__Z7analysePhi', data2plain(), {
      debugLevel: debugLevel,
      harmNotation: settings.harm_notation
    });
  }
}
