// Registry of story JSON files. Add a new story: drop a JSON in /stories and import it here.
import benchmarkPilana from "../stories/benchmark-pilana.json";
import pyasaKutta from "../stories/pyasa-kutta.json";
import { StorySchema, type Story } from "./engine/schema";

export const STORIES: Story[] = [pyasaKutta, benchmarkPilana].map((s) => StorySchema.parse(s));
