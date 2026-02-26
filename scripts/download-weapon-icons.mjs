import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(import.meta.dirname, "..", "public", "assets", "icons", "weapons");

// Map: our weapon id -> wiki filename (without "File:" prefix)
const WIKI_FILES = {
  sword:            "UI Icon Items Sword1 FG.png",
  dagger:           "UI Icon Items Dagger1 FG.png",
  hammer:           "UI Icon Items Hammer1 FG.png",
  axe:              "UI Icon Items Axe1 FG.png",
  sledgehammer:     "UI Icon Items 2HHammer1 FG.png",
  spear:            "UI Icon Items Spear1 FG.png",
  "great-axe":      "UI Icon Items 2HAxe1 FG.png",
  "two-handed-sword":"UI Icon Items 2HSword1 FG.png",
  "hand-crossbow":  "UI Icon Items HandCrossbow1 FG.png",
  pistol:           "UI Icon Items Pistol1 FG.png",
  shortbow:         "UI Icon Items ShortBow1 FG.png",
  longbow:          "UI Icon Items LongBow1 FG.png",
  crossbow:         "UI Icon Items Crossbow1 FG.png",
  rifle:            "UI Icon Items Rifle1 FG.png",
  wand:             "UI Icon Items MagicWand1 FG.png",
  "magic-orb":      "UI Icon Items MagicOrb1 FG.png",
  "magic-scepter":  "UI Icon Items MagicScepter1 FG.png",
  "druidic-staff":  "UI Icon Items DruidicStaff1 FG.png",
  "power-staff":    "UI Icon Items MagicStaff1 FG.png",
  "tome-of-secrets":"UI Icon Items TomeOfMagic1 FG.png",
};

// DLC + Warp Crystal don't have wiki icons — we'll create simple placeholders
const PLACEHOLDER_WEAPONS = [
  "war-shield", "cannon", "gauntlet",
  "claws", "boomerang", "flower",
  "warp-crystal",
];

async function getImageUrls(filenames) {
  // Use MediaWiki API to resolve image URLs in batches of 50
  const titles = filenames.map((f) => `File:${f}`);
  const batches = [];
  for (let i = 0; i < titles.length; i += 50) {
    batches.push(titles.slice(i, i + 50));
  }

  const urlMap = {};

  for (const batch of batches) {
    const params = new URLSearchParams({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
    });

    const url = `https://thelastspell.fandom.com/api.php?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);

    const data = await res.json();
    const pages = data.query?.pages ?? {};

    for (const page of Object.values(pages)) {
      if (page.imageinfo?.[0]?.url) {
        // Normalize title back: "File:UI Icon Items Sword1 FG.png" -> "UI Icon Items Sword1 FG.png"
        const title = page.title.replace(/^File:/, "");
        urlMap[title] = page.imageinfo[0].url;
      }
    }
  }

  return urlMap;
}

function createPlaceholderSvg(name) {
  const label = name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="32" y="36" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="sans-serif">${label}</text>
</svg>`;
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outputPath, buffer);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Resolve wiki image URLs
  const filenames = Object.values(WIKI_FILES);
  console.log(`Resolving ${filenames.length} image URLs from wiki API...`);
  const urlMap = await getImageUrls(filenames);

  // Download each weapon icon
  const filenameToId = Object.fromEntries(
    Object.entries(WIKI_FILES).map(([id, filename]) => [filename, id]),
  );

  let downloaded = 0;
  let failed = 0;

  for (const [filename, id] of Object.entries(filenameToId)) {
    const url = urlMap[filename];
    if (!url) {
      console.warn(`  SKIP: No URL found for "${filename}" (${id})`);
      failed++;
      continue;
    }

    const outPath = join(OUT_DIR, `${id}.webp`);
    try {
      await downloadImage(url, outPath);
      downloaded++;
      console.log(`  OK: ${id}.webp`);
    } catch (err) {
      console.warn(`  FAIL: ${id} - ${err.message}`);
      failed++;
    }
  }

  // Create placeholder SVGs for DLC weapons + warp crystal
  for (const id of PLACEHOLDER_WEAPONS) {
    const outPath = join(OUT_DIR, `${id}.webp`);
    const svg = createPlaceholderSvg(id);
    await writeFile(outPath, svg);
    console.log(`  PLACEHOLDER: ${id}.webp`);
  }

  console.log(`\nDone: ${downloaded} downloaded, ${PLACEHOLDER_WEAPONS.length} placeholders, ${failed} failed`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
