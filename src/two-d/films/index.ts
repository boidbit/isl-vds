// Registry of 2D films: film.json (story, narration, voice) + visuals (scene code).
import billiAurAuratJson from "../../../films/billi-aur-aurat/film.json";
import gufaKeTeenJson from "../../../films/gufa-ke-teen/film.json";
import laalPattiJson from "../../../films/laal-patti-aur-cheel/film.json";
import samundarJson from "../../../films/samundar-mein-1000-dinar/film.json";
import pyasaKuttaJson from "../../../films/pyasa-kutta/film.json";
import soneKaMatkaJson from "../../../films/sone-ka-matka/film.json";
import { FilmSchema, type Film } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { billiAurAuratVisuals } from "./BilliAurAurat";
import { gufaKeTeenVisuals } from "./GufaKeTeen";
import { laalPattiAurCheelVisuals } from "./LaalPattiAurCheel";
import { samundarMeinDinarVisuals } from "./SamundarMeinDinar";
import { pyasaKuttaVisuals } from "./PyasaKuttaFilm";
import { soneKaMatkaVisuals } from "./SoneKaMatka";

export const FILMS: Record<string, { film: Film; visuals: FilmVisuals }> = {
  "billi-aur-aurat": { film: FilmSchema.parse(billiAurAuratJson), visuals: billiAurAuratVisuals },
  "gufa-ke-teen": { film: FilmSchema.parse(gufaKeTeenJson), visuals: gufaKeTeenVisuals },
  "laal-patti-aur-cheel": { film: FilmSchema.parse(laalPattiJson), visuals: laalPattiAurCheelVisuals },
  "samundar-mein-1000-dinar": { film: FilmSchema.parse(samundarJson), visuals: samundarMeinDinarVisuals },
  "pyasa-kutta": { film: FilmSchema.parse(pyasaKuttaJson), visuals: pyasaKuttaVisuals },
  "sone-ka-matka": { film: FilmSchema.parse(soneKaMatkaJson), visuals: soneKaMatkaVisuals },
};
