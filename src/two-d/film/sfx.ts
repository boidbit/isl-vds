// Sound resolution: a recorded sound in public/sfx/real (registered in index.json)
// replaces the generated one with the same name.
import real from "../../../public/sfx/real/index.json";

const REAL = real as Record<string, string>;

export const sfxPath = (file: string) => {
  const name = file.replace(/^sfx\//, "").replace(/\.[a-z0-9]+$/i, "");
  return REAL[name] ? `sfx/real/${REAL[name]}` : file;
};
