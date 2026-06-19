import { existsSync, readFileSync } from "node:fs"
import process from "node:process"

const requiredFiles = ["manifest.json", "versions.json", "README.md", "main.js"]
const missing = requiredFiles.filter((file) => !existsSync(file))

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"))
const versions = JSON.parse(readFileSync("versions.json", "utf8"))

const errors = [
  ...missing.map((file) => `Missing release file: ${file}`),
  manifest.id !== "underscore-title" ? "manifest id must be underscore-title" : null,
  manifest.minAppVersion !== "1.13.0" ? "minAppVersion must be 1.13.0" : null,
  versions[manifest.version] !== manifest.minAppVersion
    ? "versions.json must map manifest version to minAppVersion"
    : null,
].filter((error) => error !== null)

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error)
  }
  process.exit(1)
}

console.log("Release check passed")
