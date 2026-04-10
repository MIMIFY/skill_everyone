import { loadFont } from "@remotion/google-fonts/NotoSansSC";

// Load Noto Sans SC at module level.
// @remotion/google-fonts handles delayRender/continueRender internally,
// so Remotion waits for the font before capturing any frame.
// Only load weight 400 to minimise network requests.
loadFont("normal", {
  weights: ["300", "400", "500"],
  ignoreTooManyRequestsWarning: true,
});
