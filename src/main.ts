import {
  downloadTableAsCsv,
  downloadTableAsHtml,
  downloadTableAsJson,
  downloadTableAsXls,
} from "./lib/downloadTable";
import { readFile } from "./lib/uploadTable";
import { generateSampleCSV, updateThemeIcon } from "./lib/utils";

document.addEventListener("DOMContentLoaded", () => {
  if (
    window &&
    window.matchMedia &&
    !window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.body.classList.add("dark-theme");
  }

  const themeToggleButton = document.getElementById(
    "themeToggleButton"
  )! as HTMLButtonElement;
  const generateCsvButton = document.getElementById("generateCsvButton")!;

  themeToggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    updateThemeIcon(themeToggleButton);
  });

  generateCsvButton.addEventListener("click", () => {
    generateSampleCSV();
  });

  updateThemeIcon(themeToggleButton);
});

document.getElementById("fileInput")!.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    readFile(file);
  }
});

document
  .getElementById("downloadButton")!
  .addEventListener("click", function () {
    const format = (
      document.getElementById("downloadFormat") as HTMLSelectElement
    ).value;
    switch (format) {
      case "csv":
        downloadTableAsCsv();
        break;
      case "json":
        downloadTableAsJson();
        break;
      case "html":
        downloadTableAsHtml();
        break;
      case "xlsx":
      case "xls":
      case "ods":
        downloadTableAsXls(format);
        break;
    }
  });
