import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const WORDPRESS_PLUGIN_DIR = "wordpress-plugin/cookiekit/assets";
const PLUGIN_SLUG = "cookiekit-gdpr-cookie-consent";
// Define logo files that should be preserved during build
const PRESERVE_FILES = [
  "cookiekit-logo.svg",
  "gdpr-shield.svg",
  "cookiekit-logo.png",
];

async function buildWordPress() {
  try {
    // Generate version hash
    const timestamp = Date.now();
    const hash = crypto
      .createHash("md5")
      .update(timestamp.toString())
      .digest("hex")
      .slice(0, 8);
    const jsFilename = `cookie-manager.${hash}.js`;
    const cssFilename = `cookie-manager.${hash}.css`;

    // Ensure WordPress plugin assets directory exists
    await fs.mkdir(WORDPRESS_PLUGIN_DIR, { recursive: true });

    // Clean up old files but preserve logo files
    console.log("🧹 Cleaning up old files (preserving logo files)...");
    const oldFiles = await fs.readdir(WORDPRESS_PLUGIN_DIR);
    await Promise.all(
      oldFiles
        .filter(
          (file) =>
            !PRESERVE_FILES.includes(file) &&
            file.match(/cookie-manager\.[a-f0-9]+\.(js|css)/)
        )
        .map((file) => fs.unlink(path.join(WORDPRESS_PLUGIN_DIR, file)))
    );

    // Run WordPress build
    console.log("🏗️  Building WordPress bundle...");
    await execCommand("npm run build:wordpress");

    // Copy files to WordPress plugin directory
    console.log("📦 Copying files to WordPress plugin...");

    // List files in dist directory to help with debugging
    console.log("📂 Checking build output...");
    const files = await fs.readdir("dist/wordpress");
    console.log("Built files:", files);

    // Copy the files with versioned names
    await fs.copyFile(
      "dist/wordpress/cookie-manager.js",
      path.join(WORDPRESS_PLUGIN_DIR, jsFilename)
    );
    await fs.copyFile(
      "dist/wordpress/cookie-manager.css",
      path.join(WORDPRESS_PLUGIN_DIR, cssFilename)
    );

    // Update PHP files with new filenames
    console.log("✏️ Updating PHP files with new asset paths...");

    // Define both old and new PHP filenames
    const phpFiles = [
      `wordpress-plugin/cookiekit/${PLUGIN_SLUG}.php`, // New filename
      "wordpress-plugin/cookiekit/cookiekit.php", // Old filename (for backward compatibility)
    ];

    // Process each PHP file that exists
    for (const phpFile of phpFiles) {
      try {
        const fileExists = await fileExistsAsync(phpFile);

        if (fileExists) {
          console.log(`Updating asset paths in ${phpFile}...`);
          let phpContent = await fs.readFile(phpFile, "utf8");

          // Update asset paths in PHP file using more specific regex
          phpContent = phpContent.replace(
            /'assets\/cookie-manager(?:\.[a-f0-9]+)?\.js'/g,
            `'assets/${jsFilename}'`
          );
          phpContent = phpContent.replace(
            /'assets\/cookie-manager(?:\.[a-f0-9]+)?\.css'/g,
            `'assets/${cssFilename}'`
          );

          await fs.writeFile(phpFile, phpContent);
          console.log(`✅ Updated ${phpFile}`);
        }
      } catch (err) {
        console.log(`⚠️ Skipping ${phpFile}: ${err.message}`);
      }
    }

    // Create WordPress plugin zip
    console.log("🗜️  Creating WordPress plugin zip...");
    await execCommand(
      `cd wordpress-plugin && rm -f ${PLUGIN_SLUG}.zip && zip -r ${PLUGIN_SLUG}.zip cookiekit/`
    );

    console.log("✅ WordPress plugin built successfully!");
    console.log(`📁 Plugin zip location: wordpress-plugin/${PLUGIN_SLUG}.zip`);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stdout);
        console.error(stderr);
        reject(error);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve(stdout);
    });
  });
}

// Helper function to check if a file exists
async function fileExistsAsync(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

buildWordPress();
