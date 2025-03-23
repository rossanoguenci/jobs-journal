import {readFileSync, writeFileSync} from "fs";
import {format} from "date-fns";
import config from "../app.config.js"; // Import centralized metadata

// Read package.json
const packageJsonPath = "package.json";
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

// Generate SemVer-compliant build number
const buildNumber = format(new Date(), "yyyyMMddHHmmss");

// Define build info
const buildInfo = {
    version: `${packageJson.version}`,
    buildNumber: `${buildNumber}`,
    devVersion: `${packageJson.version}+${buildNumber}`,
};

// Update build-info.json
writeFileSync("build-info.json", JSON.stringify(buildInfo, null, 2));

// Update tauri.conf.json
const tauriConfPath = "src-tauri/tauri.conf.json";
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"));
tauriConf.version = buildInfo.version;
tauriConf.productName = config.name;
tauriConf.identifier = config.identifier;
tauriConf.app.windows[0].title = `${config.title} - ${buildInfo.version}`;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));

// Update src-tauri/Cargo.toml
const cargoTomlPath = "src-tauri/Cargo.toml";
let cargoToml = readFileSync(cargoTomlPath, "utf8");

// Replace values in Cargo.toml using regex
cargoToml = cargoToml.replace(/name = ".*"/, `name = "${config.name.replace(/-/g, "_")}"`);
cargoToml = cargoToml.replace(/version = ".*"/, `version = "${buildInfo.version}"`);
cargoToml = cargoToml.replace(/description = ".*"/, `description = "${config.description}"`);
cargoToml = cargoToml.replace(/authors = \[".*"]/, `authors = ["${config.author}"]`);
cargoToml = cargoToml.replace(/license = ".*"/, `license = "${config.license}"`);
cargoToml = cargoToml.replace(/repository = ".*"/, `repository = "${config.repository}"`);

writeFileSync(cargoTomlPath, cargoToml);

// Update package.json (Only static fields)
packageJson.name = config.name;
packageJson.description = config.description;
packageJson.author = config.author;
packageJson.repository = config.repository;
packageJson.homepage = config.homepage;
packageJson.license = config.license;
packageJson.version = buildInfo.version;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`✅ Updated build-info.json, tauri.conf.json, Cargo.toml, and package.json using app.config.js`);

// Append version to env file
const envPath = ".env.local";
// Create the .env.local content
const envContent = `NEXT_PUBLIC_VERSION=${buildInfo.version}
NEXT_PUBLIC_BUILD_NUMBER=${buildInfo.buildNumber}
NEXT_PUBLIC_DEV_VERSION=${buildInfo.devVersion}
`;

writeFileSync(envPath, envContent);

console.log("✅ Updated .env.local with dev version:", buildInfo.version);