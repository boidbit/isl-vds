// Fetch the full text of a Hadith (English + Arabic + grades) so a script is written from the source, not from a
// summary. Text comes from the open hadith-api (github.com/fawazahmed0/hadith-api, via cdn.jsdelivr.net): the same
// collections and translations as sunnah.com, which blocks automated clients. The sunnah.com link is printed for the
// owner's one-minute check.
//
//   npm run hadith -- bukhari 439
//   npm run hadith -- muslim 2984a --film baadal-aur-baagh-ka-raaz   (also saves films/<id>/source.md)
//
// Collections: bukhari, muslim (sahih by consensus), abudawud, tirmidhi, nasai, ibnmajah (use only with a Sahih/Hasan
// grade), malik, nawawi (40 Hadith), qudsi. Needs curl.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const NAMES: Record<string, string> = {
  bukhari: "Sahih al-Bukhari",
  muslim: "Sahih Muslim",
  abudawud: "Sunan Abi Dawud",
  tirmidhi: "Jami` at-Tirmidhi",
  nasai: "Sunan an-Nasa'i",
  ibnmajah: "Sunan Ibn Majah",
  malik: "Muwatta Malik",
  nawawi: "40 Hadith Nawawi",
  qudsi: "40 Hadith Qudsi",
};
const SAHIH_BOOKS = new Set(["bukhari", "muslim"]);

const args = process.argv.slice(2);
const film = args.includes("--film") ? args[args.indexOf("--film") + 1] : undefined;
const [col, num] = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--film");
if (!col || !num || !NAMES[col] || !/^\d+[a-z]?$/.test(num)) {
  console.log(`Usage: npm run hadith -- <${Object.keys(NAMES).join("|")}> <number, e.g. 439 or 2984a> [--film <id>]`);
  process.exit(1);
}

const get = (url: string) => JSON.parse(execFileSync("curl", ["-sS", "--fail", "--max-time", "90", url], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));

type H = { hadithnumber: number; arabicnumber?: number | string; text: string; grades?: { name: string; grade: string }[] };

/** sunnah.com number -> API hadith. Muslim uses its own numbering: "2984a" = arabicnumber 2984.01. */
const find = (lang: "eng" | "ara"): H | undefined => {
  if (col === "muslim") {
    const all: { hadiths: H[] } = get(`${CDN}/${lang}-muslim.min.json`);
    const base = num.replace(/[a-z]$/, "");
    const letter = num.match(/[a-z]$/)?.[0];
    const sub = letter ? `${base}.${String(letter.charCodeAt(0) - 96).padStart(2, "0")}` : null;
    const match = (h: H) => {
      const a = String(h.arabicnumber ?? "");
      return sub ? a === sub : a === base || a === `${base}.01`;
    };
    return all.hadiths.find(match);
  }
  const one: { hadiths: H[] } = get(`${CDN}/${lang}-${col}/${num.replace(/[a-z]$/, "")}.json`);
  return one.hadiths[0];
};

const en = find("eng");
if (!en || !en.text.trim()) {
  console.log(`Not found: ${NAMES[col]} ${num}. Check the number on https://sunnah.com/${col}:${num}`);
  process.exit(1);
}
let ar: H | undefined;
try {
  ar = find("ara");
} catch {
  ar = undefined;
}

const grades = (en.grades ?? []).map((g) => `${g.grade} (${g.name})`);
const good = grades.some((g) => /^(sahih|hasan)/i.test(g));
const weak = grades.some((g) => /da'?e?if|daif|mawdu|munkar|fabricat/i.test(g));
const strong = SAHIH_BOOKS.has(col) || (good && !weak);
const ref = `${NAMES[col]} ${num}`;
const url = `https://sunnah.com/${col}:${num}`;
const status = SAHIH_BOOKS.has(col)
  ? "Sahih (Bukhari/Muslim: authentic by consensus)"
  : strong
    ? `Usable: ${grades.join("; ")}`
    : good && weak
      ? `DISPUTED grade (${grades.join("; ")}): avoid, or only after a scholar confirms`
      : `NOT USABLE for a film: ${grades.length ? grades.join("; ") : "no grade given"} (weak or unknown)`;

const md = `# Source: ${ref}

- Link (owner check): ${url}
- Status: ${status}
- Text from the open hadith-api (same collections/translations as sunnah.com); the English is a translation.

## English
${en.text.trim()}

## Arabic
${ar?.text?.trim() ?? "(not available)"}
`;

console.log(md);
if (!strong) {
  console.log("Do not build a film on this Hadith: pick one from Bukhari/Muslim or one graded Sahih/Hasan.");
  process.exitCode = 2;
}
if (film) {
  if (!/^[a-z0-9-]+$/.test(film)) throw new Error("film id must be kebab-case");
  mkdirSync(`films/${film}`, { recursive: true });
  writeFileSync(`films/${film}/source.md`, md);
  console.log(`Saved films/${film}/source.md`);
}
