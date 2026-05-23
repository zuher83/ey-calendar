import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, "..");
const packageJsonPath = path.join(packageDir, "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

function collectExportTargets(exportsField) {
  const targets = new Set();

  function visit(value) {
    if (typeof value === "string") {
      targets.add(value.replace(/^\.\//, ""));
      return;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  }

  visit(exportsField);
  return targets;
}

async function validatePackedFiles() {
  const { stdout } = await execFileAsync("npm", ["pack", "--json", "--dry-run"], {
    cwd: packageDir,
  });
  const [packResult] = JSON.parse(stdout);
  const packedFiles = new Set(packResult.files.map((file) => file.path));

  const requiredFiles = new Set([
    ...collectExportTargets(packageJson.exports),
    "README.md",
    "CHANGELOG.md",
    "package.json",
  ]);
  const missingFiles = [...requiredFiles].filter((file) => !packedFiles.has(file));

  assert.equal(
    missingFiles.length,
    0,
    `npm pack is missing published files:\n${missingFiles.map((file) => `- ${file}`).join("\n")}`
  );
}

function createEsmConsumer() {
  return `
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const esmEntrypoint = import.meta.resolve("@emoory/ey-calendar");

assert.ok(esmEntrypoint.endsWith("/dist/index.mjs"));
assert.ok(require.resolve("@emoory/ey-calendar/styles.css").endsWith("ey-calendar.css"));
assert.ok(
  require.resolve("@emoory/ey-calendar/styles/structure.css").endsWith(
    "ey-calendar.structure.css"
  )
);
assert.ok(
  require.resolve("@emoory/ey-calendar/styles/theme.css").endsWith("ey-calendar.theme.css")
);
`;
}

function createCjsConsumer() {
  return `
const assert = require("node:assert/strict");
const calendar = require("@emoory/ey-calendar");

assert.equal(typeof calendar.EyCalendar, "function");
assert.equal(typeof calendar.resolveTheme, "function");
assert.equal(typeof calendar.cn, "function");
assert.equal(calendar.cn("root", null, "active"), "root active");
assert.ok(require.resolve("@emoory/ey-calendar/styles.css").endsWith("ey-calendar.css"));
assert.ok(
  require.resolve("@emoory/ey-calendar/styles/structure.css").endsWith(
    "ey-calendar.structure.css"
  )
);
assert.ok(
  require.resolve("@emoory/ey-calendar/styles/theme.css").endsWith("ey-calendar.theme.css")
);
`;
}

async function validatePublishedEntrypoints() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ey-calendar-package-contract-"));

  try {
    const scopeDir = path.join(tempDir, "node_modules", "@emoory");
    const linkedPackageDir = path.join(scopeDir, "ey-calendar");

    await mkdir(scopeDir, { recursive: true });
    await symlink(packageDir, linkedPackageDir, "dir");
    await writeFile(path.join(tempDir, "consumer.mjs"), createEsmConsumer());
    await writeFile(path.join(tempDir, "consumer.cjs"), createCjsConsumer());

    await execFileAsync(process.execPath, [path.join(tempDir, "consumer.mjs")], { cwd: tempDir });
    await execFileAsync(process.execPath, [path.join(tempDir, "consumer.cjs")], { cwd: tempDir });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

await validatePackedFiles();
await validatePublishedEntrypoints();

console.log("Package contract validated.");
