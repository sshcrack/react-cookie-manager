import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "url";

const PORT = 8000;

// Get current file path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types for common file extensions
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

// Create the server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = parse(req.url);

  // Get the path from the URL
  let pathname = `.${parsedUrl.pathname}`;

  // Default to dev.html if the root path is requested
  if (pathname === "./") {
    pathname = "./dev.html";
  }

  // Resolve the file path
  const filePath = path.resolve(pathname);

  // Get the file extension
  const ext = path.extname(filePath);

  // Set the content type based on the file extension
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If the file does not exist, return 404
      if (err.code === "ENOENT") {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
        return;
      }

      // For other errors, return 500
      console.error(`Error reading file: ${err}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 Internal Server Error");
      return;
    }

    // Set headers with strong no-cache directives
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });

    // Return the file content
    res.end(data);

    // Log request for debugging
    console.log(
      `${new Date().toISOString()} - ${req.method} ${pathname} - ${
        res.statusCode
      }`
    );
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`
-----------------------------------------------------
🚀 No-cache development server running on port ${PORT}
📂 Serving files from ${path.resolve(".")}
🌐 Open http://localhost:${PORT}/dev.html in your browser
❌ All browser caching is disabled
-----------------------------------------------------
`);
});
