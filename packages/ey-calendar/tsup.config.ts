import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "tsup";

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: async () => {
    const srcDir = resolve(__dirname, "src/styles");
    const distDir = resolve(__dirname, "dist");

    // Ensure dist directory exists
    mkdirSync(distDir, { recursive: true });

    // Copy individual CSS files (structure and theme)
    const individualFiles = ["ey-calendar.structure.css", "ey-calendar.theme.css"];

    for (const file of individualFiles) {
      try {
        copyFileSync(resolve(srcDir, file), resolve(distDir, file));
        console.log(`✓ Copied ${file} to dist/`);
      } catch (err) {
        console.error(`✗ Failed to copy ${file}:`, err);
      }
    }

    // Create bundled ey-calendar.css by concatenating structure + theme
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

      writeFileSync(resolve(distDir, "ey-calendar.css"), bundledCSS);
      console.log(`✓ Created bundled ey-calendar.css in dist/`);
    } catch (err) {
      console.error(`✗ Failed to create bundled CSS:`, err);
    }
  },
});
