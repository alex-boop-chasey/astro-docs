/**
 * sync-astro-docs.js
 * Compiles all readable documentation and code examples
 * from your Astro docs repo into a single text file.
 */

import fs from "fs";
import path from "path";

const ROOT_DIR = "/Users/home/Sites/docs/astro/astro-docs/src/content/docs";
const OUTPUT_FILE = "/Users/home/Sites/docs/astro/astro-docs/scripts/astro-docs.txt";

const VALID_EXTENSIONS = [".md", ".mdx", ".astro"];
let output = [];

/**
 * Recursively crawl directories for documentation files
 */
function crawl(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip non-doc folders
      if (["node_modules", ".git", "dist", "build", "assets", "public"].includes(entry.name)) continue;
      crawl(fullPath);
    } else if (VALID_EXTENSIONS.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

/**
 * Process and clean each file
 */
function processFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const cleaned = raw
      .replace(/^---[\s\S]*?---/gm, "") // Remove frontmatter
      .replace(/<[^>]*>/g, "") // Strip HTML
      .replace(/^(import|export).*/gm, "") // Remove imports/exports
      .replace(/\n{3,}/g, "\n\n") // Normalize spacing
      .trim();

    if (cleaned) {
      output.push(`\n\n# ${filePath}\n\n${cleaned}`);
      console.log(`✅ Added: ${filePath}`);
    }
  } catch (err) {
    console.error(`⚠️ Error reading ${filePath}:`, err.message);
  }
}

/**
 * Main compile function
 */
(function compile() {
  console.log("🚀 Starting Astro docs compilation...");

  if (!fs.existsSync(ROOT_DIR)) {
    console.error(`❌ Docs folder not found at: ${ROOT_DIR}`);
    process.exit(1);
  }

  crawl(ROOT_DIR);
  fs.writeFileSync(OUTPUT_FILE, output.join("\n\n"), "utf8");

  console.log(`\n✅ Compilation complete: ${OUTPUT_FILE}`);
})();
