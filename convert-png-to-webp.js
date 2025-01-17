#!/usr/bin/env node
/**
 * Script to convert all .png, .jpg, .jpeg, and .svg images in a directory (recursively) to .webp.
 * It overwrites the original files in place (data loss!).
 *
 * Usage:
 *   node convert-to-webp.js /path/to/images
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

/** 
 * The file extensions we'll target for conversion.
 * Add or remove extensions as needed (e.g. .gif).
 */
const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];

/**
 * Recursively convert all target files in the given directory to WebP.
 * @param {string} directory - The root directory to process.
 */
async function convertToWebp(directory) {
  // Read all items in the current directory
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // If directory, recurse
      await convertToWebp(itemPath);
    } else {
      // Check file extension
      const ext = path.extname(itemPath).toLowerCase();

      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        try {
          // Convert to WebP using sharp
          // "sharp" can read SVGs, but it will convert them to a raster format
          // at the default resolution unless specified otherwise.
          const data = await sharp(itemPath)
            .webp({ quality: 90 })
            .toBuffer();

          // Create the new file name with .webp
          // We'll replace .png / .jpg / .jpeg / .svg with .webp
          const newFilePath = itemPath.replace(
            /\.(png|jpg|jpeg|svg)$/i,
            ".webp"
          );

          // Write .webp file
          fs.writeFileSync(newFilePath, data);

          // Remove the old file
          fs.unlinkSync(itemPath);

          console.log(`Converted: ${itemPath} -> ${newFilePath}`);
        } catch (error) {
          console.error(`Error converting ${itemPath}:`, error);
        }
      }
    }
  }
}

(async () => {
  // Check CLI arguments
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: node convert-to-webp.js /path/to/images");
    process.exit(1);
  }

  const targetDir = args[0];
  if (!fs.existsSync(targetDir)) {
    console.error("Directory does not exist:", targetDir);
    process.exit(1);
  }

  try {
    await convertToWebp(path.resolve(targetDir));
    console.log("All target images converted to WebP successfully.");
  } catch (err) {
    console.error("Error during conversion:", err);
    process.exit(1);
  }
})();
