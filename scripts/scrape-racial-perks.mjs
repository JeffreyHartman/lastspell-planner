const RAW_URL = "https://thelastspell.fandom.com/wiki/Perks?action=raw";

const DWARF_TREE_NAMES = new Set([
  "Jolly Drinker",
  "Bodycount Contest",
  "Thickness",
  "Carnage",
  "Hard As a Rock",
  "Look At My Muscles",
  "You're next!",
  "Emergency Tunnel",
  "Heart Of The Party",
  "Warcry",
]);

const ELF_TREE_NAMES = new Set([
  "Coffee Infused",
  "Urban Hate",
  "One with Nature",
  "Sentry",
  "Deadly Ranger",
  "Flicker Strike",
  "Elusive",
  "Infectious Strikes",
  "Hunter's Arsenal",
  "War Dance",
]);

function getSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Missing section start marker: ${startMarker}`);
  }

  const end = source.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error(`Missing section end marker: ${endMarker}`);
  }

  return source.slice(start, end);
}

function cleanWikiMarkup(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/\{\{Icons\|type=([^}]+)\}\}/g, "$1")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'''/g, "")
    .replace(/''/g, "")
    .replace(/<nowiki\/>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTableRows(sectionText) {
  const tableStart = sectionText.indexOf("{|");
  const tableEnd = sectionText.indexOf("|}", tableStart);

  if (tableStart === -1 || tableEnd === -1) {
    return [];
  }

  const tableBody = sectionText.slice(tableStart, tableEnd);
  const rowChunks = tableBody.split("\n|-\n").slice(1);

  return rowChunks
    .map((chunk) => {
      const lines = chunk.split("\n");
      const cells = [];
      let currentCell = "";

      for (const line of lines) {
        if (line.startsWith("|")) {
          if (currentCell !== "") {
            cells.push(currentCell.trim());
          }
          currentCell = line.slice(1).trim();
        } else if (!line.startsWith("!")) {
          currentCell += ` ${line.trim()}`;
        }
      }

      if (currentCell !== "") {
        cells.push(currentCell.trim());
      }

      if (cells.length < 3) {
        return null;
      }

      const [nameCell, tierCell, descriptionCell] =
        cells.length >= 4 ? [cells[1], cells[2], cells[3]] : cells;

      const name = cleanWikiMarkup(nameCell);
      const tierText = cleanWikiMarkup(tierCell);
      const description = cleanWikiMarkup(descriptionCell);
      const tier = Number(tierText);

      if (!name || Number.isNaN(tier)) {
        return null;
      }

      return { name, tier, description };
    })
    .filter(Boolean);
}

async function main() {
  const response = await fetch(RAW_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch wiki source: ${response.status}`);
  }

  const source = await response.text();

  const dwarfSection = getSection(source, "=== Dwarf", "=== Elf");
  const elfSection = getSection(source, "=== Elf", "== Other perks");

  const dwarfRows = parseTableRows(dwarfSection)
    .filter((row) => DWARF_TREE_NAMES.has(row.name))
    .map((row) => ({ ...row, type: "dwarf" }));

  const elfRows = parseTableRows(elfSection)
    .filter((row) => ELF_TREE_NAMES.has(row.name))
    .map((row) => ({ ...row, type: "elf" }));

  const perks = [...dwarfRows, ...elfRows].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }

    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }

    return a.name.localeCompare(b.name);
  });

  console.log(JSON.stringify(perks, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
