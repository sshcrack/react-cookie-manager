#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync } from "fs";

const run = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
};

const publish = async () => {
  console.log("\n🚀 Starting build and publish process...\n");

  // Check if user is logged in to npm
  try {
    execSync("npm whoami", { stdio: "pipe" });
  } catch (error) {
    console.error(
      "❌ You are not logged in to npm. Please run npm login first."
    );
    process.exit(1);
  }

  // Clean the dist directory
  console.log("🧹 Cleaning dist directory...");
  run("rm -rf dist");

  // Install dependencies
  console.log("\n📦 Installing dependencies...");
  if (!run("npm install")) {
    process.exit(1);
  }

  // Run build
  console.log("\n🛠️  Building package...");
  if (!run("npm run build")) {
    console.error("❌ Build failed");
    process.exit(1);
  }

  // Read current version
  const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));
  const currentVersion = packageJson.version;

  // Check if version exists
  try {
    const npmInfo = execSync(
      `npm view react-cookie-manager@${currentVersion} version`,
      { stdio: "pipe" }
    );
    if (npmInfo.toString().trim() === currentVersion) {
      console.error(
        `\n❌ Version ${currentVersion} already exists on npm. Please update the version in package.json`
      );
      process.exit(1);
    }
  } catch (error) {
    // Version doesn't exist, we can proceed
  }

  // Publish to npm
  console.log("\n📤 Publishing to npm...");
  if (!run("npm publish")) {
    console.error("❌ Publishing failed");
    process.exit(1);
  }

  console.log(`\n✅ Successfully published version ${currentVersion} to npm!`);
  console.log(
    "\n📦 Package: https://www.npmjs.com/package/react-cookie-manager"
  );
  console.log(`📊 Analytics: https://cookiekit.io\n`);
};

// Run the script
publish().catch((error) => {
  console.error("❌ An unexpected error occurred:", error);
  process.exit(1);
});
