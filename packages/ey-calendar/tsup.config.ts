import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import cssnano from "cssnano";
import postcss from "postcss";
import { defineConfig } from "tsup";

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Minify CSS using cssnano
 */
async function minifyCSS(css: string): Promise<string> {
  const result = await postcss([cssnano({ preset: "default" })]).process(css, {
    from: undefined,
  });
  return result.css;
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: ["react", "react-dom"],
  onSuccess: async () => {
    const srcDir = resolve(__dirname, "src/styles");
    const distDir = resolve(__dirname, "dist");

    // Ensure dist directory exists
    mkdirSync(distDir, { recursive: true });

    // Copy and minify individual CSS files (structure and theme)
    const individualFiles = ["ey-calendar.structure.css", "ey-calendar.theme.css"];

    for (const file of individualFiles) {
      try {
        const css = readFileSync(resolve(srcDir, file), "utf-8");
        const minified = await minifyCSS(css);
        writeFileSync(resolve(distDir, file), minified);
        console.log(`✓ Minified and copied ${file} to dist/`);
      } catch (err) {
        console.error(`✗ Failed to minify ${file}:`, err);
      }
    }

    // Create bundled and minified ey-calendar.css by concatenating structure + theme
    // This avoids @import issues when importing from node_modules
    try {
      const structureCSS = readFileSync(resolve(srcDir, "ey-calendar.structure.css"), "utf-8");
      const themeCSS = readFileSync(resolve(srcDir, "ey-calendar.theme.css"), "utf-8");

      const bundledCSS = `/**
 * EyCalendar - Complete CSS Bundle
 *
 * This file combines structure and theme CSS for easy import.
 * Import this single file for the complete out-of-the-box experience.
 *
 * Usage:
 *   import '@emoory/ey-calendar/styles.css'
 *
 * For more control, import separately:
 *   import '@emoory/ey-calendar/styles/structure.css'
 *   import '@emoory/ey-calendar/styles/theme.css'
 *
 * @package @emoory/ey-calendar
 * @author Zuher ELMAS - Emoory Team
 */

${structureCSS}

${themeCSS}
`;

      const minifiedBundled = await minifyCSS(bundledCSS);
      writeFileSync(resolve(distDir, "ey-calendar.css"), minifiedBundled);
      console.log(`✓ Created and minified bundled ey-calendar.css in dist/`);
    } catch (err) {
      console.error(`✗ Failed to create bundled CSS:`, err);
    }
  },
});
