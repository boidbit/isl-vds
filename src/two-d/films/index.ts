// Registry of 2D films: film.json (story, narration, voice) + visuals (scene code).
import baadalAurBaaghJson from "../../../films/baadal-aur-baagh-ka-raaz/film.json";
import billiAurAuratJson from "../../../films/billi-aur-aurat/film.json";
import gufaKeTeenJson from "../../../films/gufa-ke-teen/film.json";
import pyasaKuttaJson from "../../../films/pyasa-kutta/film.json";
import soneKaMatkaJson from "../../../films/sone-ka-matka/film.json";
import { FilmSchema, type Film } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { baadalAurBaaghVisuals } from "./BaadalAurBaagh";
import { billiAurAuratVisuals } from "./BilliAurAurat";
import { gufaKeTeenVisuals } from "./GufaKeTeen";
import { pyasaKuttaVisuals } from "./PyasaKuttaFilm";
import { soneKaMatkaVisuals } from "./SoneKaMatka";

export const FILMS: Record<string, { film: Film; visuals: FilmVisuals }> = {
  "baadal-aur-baagh-ka-raaz": { film: FilmSchema.parse(baadalAurBaaghJson), visuals: baadalAurBaaghVisuals },
  "billi-aur-aurat": { film: FilmSchema.parse(billiAurAuratJson), visuals: billiAurAuratVisuals },
  "gufa-ke-teen": { film: FilmSchema.parse(gufaKeTeenJson), visuals: gufaKeTeenVisuals },
  "pyasa-kutta": { film: FilmSchema.parse(pyasaKuttaJson), visuals: pyasaKuttaVisuals },
  "sone-ka-matka": { film: FilmSchema.parse(soneKaMatkaJson), visuals: soneKaMatkaVisuals },
};
