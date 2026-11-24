// Registry of 2D films: film.json (story, narration, voice) + visuals (scene code).
import gufaKeTeenJson from "../../../films/gufa-ke-teen/film.json";
import pyasaKuttaJson from "../../../films/pyasa-kutta/film.json";
import soneKaMatkaJson from "../../../films/sone-ka-matka/film.json";
import { FilmSchema, type Film } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { gufaKeTeenVisuals } from "./GufaKeTeen";
import { pyasaKuttaVisuals } from "./PyasaKuttaFilm";
import { soneKaMatkaVisuals } from "./SoneKaMatka";

export const FILMS: Record<string, { film: Film; visuals: FilmVisuals }> = {
  "gufa-ke-teen": { film: FilmSchema.parse(gufaKeTeenJson), visuals: gufaKeTeenVisuals },
  "pyasa-kutta": { film: FilmSchema.parse(pyasaKuttaJson), visuals: pyasaKuttaVisuals },
  "sone-ka-matka": { film: FilmSchema.parse(soneKaMatkaJson), visuals: soneKaMatkaVisuals },
};
