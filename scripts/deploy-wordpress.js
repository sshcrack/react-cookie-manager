#!/usr/bin/env node

import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Paths
const PLUGIN_SLUG = "cookiekit-gdpr-cookie-consent";
const SOURCE_DIR = path.join(rootDir, "wordpress-plugin/cookiekit");
const BUILD_DIR = path.join(rootDir, "build");
const TRUNK_DIR = path.join(BUILD_DIR, "trunk");
const ASSETS_DIR = path.join(BUILD_DIR, "assets");
const TAGS_DIR = path.join(BUILD_DIR, "tags");

// Destination SVN directory (user-specified)
const SVN_DEST_DIR =
  "/Users/james/projects/apps/wordpress-cookie-kit-plugin/cookiekit";
const SVN_TRUNK_DIR = path.join(SVN_DEST_DIR, "trunk");
const SVN_ASSETS_DIR = path.join(SVN_DEST_DIR, "assets");
const SVN_TAGS_DIR = path.join(SVN_DEST_DIR, "tags");

// Directories to create inside trunk
const TRUNK_SUBDIRS = ["includes", "admin", "public", "assets", "languages"];

async function deploy() {
  try {
    console.log("🚀 Preparing WordPress plugin for deployment...");

    // First build the WordPress plugin
    console.log("🏗️ Building WordPress plugin...");
    await execCommand("node scripts/build-wordpress.js");

    // Create deployment directory structure
    console.log("📂 Creating deployment directory structure...");
    await fs.rm(BUILD_DIR, { recursive: true, force: true });
    await fs.mkdir(BUILD_DIR, { recursive: true });
    await fs.mkdir(TRUNK_DIR, { recursive: true });
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    await fs.mkdir(TAGS_DIR, { recursive: true });

    // Create trunk subdirectories
    for (const dir of TRUNK_SUBDIRS) {
      await fs.mkdir(path.join(TRUNK_DIR, dir), { recursive: true });
    }

    // Copy plugin files to trunk
    console.log("📋 Copying plugin files to trunk...");

    // Copy main plugin file
    await fs.copyFile(
      path.join(SOURCE_DIR, `${PLUGIN_SLUG}.php`),
      path.join(TRUNK_DIR, "cookiekit.php")
    );

    // Copy readme.txt
    await fs.copyFile(
      path.join(SOURCE_DIR, "readme.txt"),
      path.join(TRUNK_DIR, "readme.txt")
    );

    // Create an empty uninstall.php if it doesn't exist
    const uninstallPath = path.join(SOURCE_DIR, "uninstall.php");
    const uninstallExists = await fileExistsAsync(uninstallPath);

    if (uninstallExists) {
      await fs.copyFile(uninstallPath, path.join(TRUNK_DIR, "uninstall.php"));
    } else {
      // Create a basic uninstall.php file
      const uninstallContent = `<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @link       https://github.com/hypershiphq/react-cookie-manager
 * @since      1.0.0
 *
 * @package    CookieKit
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options created by the plugin
delete_option('cookiekit_settings');
delete_option('cookiekit_version');
`;
      await fs.writeFile(
        path.join(TRUNK_DIR, "uninstall.php"),
        uninstallContent
      );
    }

    // Copy assets
    console.log("🎨 Copying assets...");
    const sourceAssetsDir = path.join(SOURCE_DIR, "assets");

    // Create assets subdirectories in trunk (if they don't exist)
    await fs.mkdir(path.join(TRUNK_DIR, "assets", "css"), { recursive: true });
    await fs.mkdir(path.join(TRUNK_DIR, "assets", "js"), { recursive: true });

    // Copy CSS files
    const cssDir = path.join(sourceAssetsDir, "css");
    if (await directoryExistsAsync(cssDir)) {
      console.log("Copying CSS files...");
      const cssDest = path.join(TRUNK_DIR, "assets", "css");
      await copyDirectory(cssDir, cssDest);
    } else {
      console.log("⚠️ CSS directory not found:", cssDir);
    }

    // Copy JS files
    const jsDir = path.join(sourceAssetsDir, "js");
    if (await directoryExistsAsync(jsDir)) {
      console.log("Copying JS files...");
      const jsDest = path.join(TRUNK_DIR, "assets", "js");
      await copyDirectory(jsDir, jsDest);
    } else {
      console.log("⚠️ JS directory not found:", jsDir);
    }

    // Copy individual asset files (not in js/css subdirectories)
    const assetFiles = ["cookiekit-admin.js", "cookiekit-admin.css"];
    for (const file of assetFiles) {
      const filePath = path.join(sourceAssetsDir, file);
      if (await fileExistsAsync(filePath)) {
        await fs.copyFile(filePath, path.join(TRUNK_DIR, "assets", file));
      }
    }

    // Copy image files needed for the plugin functionality (like the logo)
    const pluginImages = [
      "cookiekit-logo.png",
      "cookiekit-logo.svg",
      "gdpr-shield.svg",
    ];
    console.log("Copying plugin image files...");
    for (const image of pluginImages) {
      const imagePath = path.join(sourceAssetsDir, image);
      if (await fileExistsAsync(imagePath)) {
        console.log(`Found and copying: ${image}`);
        await fs.copyFile(imagePath, path.join(TRUNK_DIR, "assets", image));
      } else {
        console.log(`Image file not found: ${image}`);
      }
    }

    // Copy WordPress.org assets to the assets directory
    const assetsImages = [
      "icon-128x128.png",
      "icon-256x256.png",
      "banner-772x250.png",
      "screenshot.png",
    ];

    for (const image of assetsImages) {
      const imagePath = path.join(sourceAssetsDir, image);
      if (await fileExistsAsync(imagePath)) {
        await fs.copyFile(imagePath, path.join(ASSETS_DIR, image));
      }
    }

    // Create a ZIP file of the trunk directory
    console.log("🗜️ Creating deployment ZIP file...");
    await execCommand(
      `cd ${BUILD_DIR} && zip -r ${PLUGIN_SLUG}-deploy.zip trunk assets`
    );

    // Copy files to the SVN directory
    console.log("📦 Copying files to the SVN directory...");

    // Ensure SVN directories exist
    console.log(`Checking SVN destination directory: ${SVN_DEST_DIR}`);
    if (await directoryExistsAsync(SVN_DEST_DIR)) {
      console.log("SVN destination directory exists.");

      // Clean up trunk directory
      console.log("Cleaning up the SVN trunk directory...");
      const trunkExists = await directoryExistsAsync(SVN_TRUNK_DIR);
      if (trunkExists) {
        // Preserve .svn directories for SVN metadata
        await execCommand(
          `find "${SVN_TRUNK_DIR}" -mindepth 1 -not -path "*/\\.svn/*" -not -path "*/\\.svn" -delete`
        );
      } else {
        await fs.mkdir(SVN_TRUNK_DIR, { recursive: true });
      }

      // Clean up assets directory (preserving .svn)
      console.log("Cleaning up the SVN assets directory...");
      const assetsExists = await directoryExistsAsync(SVN_ASSETS_DIR);
      if (assetsExists) {
        await execCommand(
          `find "${SVN_ASSETS_DIR}" -mindepth 1 -not -path "*/\\.svn/*" -not -path "*/\\.svn" -delete`
        );
      } else {
        await fs.mkdir(SVN_ASSETS_DIR, { recursive: true });
      }

      // Create necessary subdirectories in SVN trunk
      console.log("Creating subdirectories in SVN trunk...");
      for (const dir of TRUNK_SUBDIRS) {
        await fs.mkdir(path.join(SVN_TRUNK_DIR, dir), { recursive: true });
      }

      // Create js and css directories inside assets
      await fs.mkdir(path.join(SVN_TRUNK_DIR, "assets", "js"), {
        recursive: true,
      });
      await fs.mkdir(path.join(SVN_TRUNK_DIR, "assets", "css"), {
        recursive: true,
      });

      // Copy trunk files
      console.log("Copying trunk files to SVN...");
      await execCommand(`cp -R ${TRUNK_DIR}/* ${SVN_TRUNK_DIR}/`);

      // Copy assets files
      console.log("Copying assets files to SVN...");
      for (const image of assetsImages) {
        const imagePath = path.join(ASSETS_DIR, image);
        if (await fileExistsAsync(imagePath)) {
          await fs.copyFile(imagePath, path.join(SVN_ASSETS_DIR, image));
        }
      }

      console.log("✅ Files copied to SVN directory successfully!");

      // Verify the js and css files exist in the right locations
      console.log("\n📋 Verifying deployed files:");
      await execCommand(`ls -la ${SVN_TRUNK_DIR}/assets/js/`);
      await execCommand(`ls -la ${SVN_TRUNK_DIR}/assets/css/`);
      console.log("\n📋 Checking for image files in assets directory:");
      await execCommand(
        `find ${SVN_TRUNK_DIR}/assets -name "*.png" -o -name "*.svg" -o -name "*.jpg" | sort`
      );
    } else {
      console.error(
        `❌ SVN destination directory does not exist: ${SVN_DEST_DIR}`
      );
      console.log(
        "Please create the directory with the required structure (assets, tags, trunk) first."
      );
    }

    console.log("✅ Deployment preparation complete!");
    console.log(`📁 Deployment files location: ${BUILD_DIR}`);
    console.log(
      `📁 Deployment ZIP: ${path.join(BUILD_DIR, `${PLUGIN_SLUG}-deploy.zip`)}`
    );
    console.log(`📁 SVN directory: ${SVN_DEST_DIR}`);
    console.log("\nℹ️ To deploy to WordPress.org SVN:");
    console.log("1. Navigate to your SVN directory");
    console.log("2. Run 'svn status' to check changes");
    console.log("3. Run 'svn add' for any new files");
    console.log("4. Run 'svn commit -m \"Your commit message\"'");
  } catch (error) {
    console.error("❌ Deployment preparation failed:", error);
    process.exit(1);
  }
}

// Helper function to copy a directory and its contents recursively
async function copyDirectory(source, destination) {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDirectory(sourcePath, destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
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

// Helper function to check if a directory exists
async function directoryExistsAsync(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

// Run the deployment script
deploy();
