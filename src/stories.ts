// Registry of story JSON files. Add a new story: drop a JSON in /stories and import it here.
import pyasaKutta from "../stories/pyasa-kutta.json";
import { StorySchema, type Story } from "./engine/schema";

export const STORIES: Story[] = [pyasaKutta].map((s) => StorySchema.parse(s));
