// Registry of 2D films: film.json (story, narration, voice) + visuals (scene code).
import pyasaKuttaJson from "../../../films/pyasa-kutta/film.json";
import { FilmSchema, type Film } from "../film/schema";
import type { FilmVisuals } from "../film/types";
import { pyasaKuttaVisuals } from "./PyasaKuttaFilm";

export const FILMS: Record<string, { film: Film; visuals: FilmVisuals }> = {
  "pyasa-kutta": { film: FilmSchema.parse(pyasaKuttaJson), visuals: pyasaKuttaVisuals },
};
