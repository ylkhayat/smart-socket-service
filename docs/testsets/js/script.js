document.addEventListener("DOMContentLoaded", function () {
  fetch("tree.json")
    .then((response) => response.json())
    .then((files) => {
      const folder = document.createElement("div");
      createElements(files, folder);
      document.getElementById("sidebar").appendChild(folder);

      if (window.location.hash) {
        loadContent(window.location.hash.substring(1));
      }
    });
});

window.addEventListener("hashchange", function () {
  const anchors = document.querySelectorAll("#sidebar a");
  anchors.forEach((anchor) => {
    if (anchor.getAttribute("href") === window.location.hash) {
      anchor.classList.add("selected");
    } else {
      anchor.classList.remove("selected");
    }
  });
});

function createElements(files, parent) {
  Object.entries(files).forEach(([key, value]) => {
    if (typeof value === "object") {
      const folder = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = key;
      folder.appendChild(summary);
      parent.appendChild(folder);
      createElements(value, folder); // Recursive call for nested objects
    } else {
      const link = document.createElement("a");
      link.href = `#${value}`;
      link.textContent = key;
      link.onclick = function () {
        loadContent(value);
        return false;
      };
      parent.appendChild(link);
    }
  });
}

function loadContent(filePath) {
  const content = document.getElementById("content");
  fetch(filePath)
    .then((response) => response.text())
    .then((text) => {
      if (filePath.endsWith(".md")) {
        content.innerHTML = marked.parse(text);
      } else if (filePath.endsWith(".xml")) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const pre = document.createElement("pre");
        pre.textContent = new XMLSerializer().serializeToString(xmlDoc);
        content.innerHTML = "";
        content.appendChild(pre);
      } else if (filePath.endsWith(".pdf")) {
        content.innerHTML = "";
        PDFObject.embed(filePath, content);
      } else {
        content.innerHTML = text;
      }
      window.location.hash = filePath;
    });
}
