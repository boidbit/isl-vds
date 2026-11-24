import { Config } from "@remotion/cli/config";

// ANGLE gives WebGL in headless Chrome without a GPU (software rendering).
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);

// In environments without internet access to Remotion's Chrome download,
// point to a local headless Chrome build.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
