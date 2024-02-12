const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, ".."); // Change 'content' to your target directory
const outputPath = path.join(__dirname, "..", "tree.json");

function isDirectory(filePath) {
  return fs.statSync(filePath).isDirectory();
}

const ignore = [
  "node_modules",
  "index.html",
  "tree.json",
  "js",
  "css",
  "img",
  "fonts",
  "favicon.ico",
  "CNAME",
  ".git",
  ".gitignore",
  "LICENSE",
  "js",
  "css",
  ".DS_Store",
  "energy-monitor.log",
  "server-monitor.log",
];
function generateTree(dirPath, relativePath = "") {
  return fs.readdirSync(dirPath).reduce((acc, item) => {
    if (ignore.includes(item)) return acc;
    const fullPath = path.join(dirPath, item);
    const itemRelativePath = path.join(relativePath, item);
    if (isDirectory(fullPath)) {
      acc[item] = generateTree(fullPath, itemRelativePath);
    } else {
      acc[item] = itemRelativePath;
    }
    return acc;
  }, {});
}

const tree = generateTree(directoryPath);
fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2), "utf8");

console.log(`Tree structure generated at ${outputPath}`);
