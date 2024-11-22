import * as XLSX from "xlsx";
import { hasQuotedPortion, splitCsvRespectingQuotes } from "./utils";

/**
 * Maps a row of strings to a TableRowElement by creating a new TableDataElement
 * for each string in the row, setting its textContent to the trimmed string,
 * and appending it to the TableRowElement.
 * @param row The row to map.
 * @param tr The TableRowElement to append the new cells to.
 */
const mapRow = (row: string[], tr: HTMLTableRowElement): void => {
  row.forEach((cell) => {
    const td = document.createElement("td");
    td.textContent = cell.trim();
    tr.appendChild(td);
  });
};

/**
 * Displays a CSV string in an HTML table by populating the specified table header
 * and table body elements. Parses the CSV text to extract headers and rows, and
 * dynamically creates table header and row elements to display the data.
 *
 * @param csvText - The CSV formatted string to be displayed in the table.
 * @param tableHeader - The ID of the HTML element where the table headers should be inserted.
 * @param tableBody - The ID of the HTML element where the table rows should be inserted.
 */

const displayCSVTable = (
  csvText: string,
  tableHeader: string,
  tableBody: string
) => {
  const lines = csvText.split("\n");
  const tableHeaderRow = document.getElementById(tableHeader)!;
  const TBody = document.getElementById(tableBody)!;

  tableHeaderRow.innerHTML = "";
  TBody.innerHTML = "";

  if (lines.length > 0) {
    const headers = lines[0].split(",");
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header.trim();
      tableHeaderRow.appendChild(th);
    });
    for (let i = 1; i < lines.length; i++) {
      if (hasQuotedPortion(lines[i])) {
        const row = splitCsvRespectingQuotes(lines[i]);
        const tr = document.createElement("tr");
        mapRow(row, tr);
        TBody.appendChild(tr);
      } else {
        const row = lines[i].split(",");
        const tr = document.createElement("tr");
        mapRow(row, tr);
        TBody.appendChild(tr);
      }
    }
  }
};

const addRowToTable = (inputs: HTMLInputElement[], tableId: string) => {
  const table = document.getElementById(tableId)! as HTMLTableElement;
  const newRow = table.insertRow();

  inputs.forEach((input) => {
    const cell = newRow.insertCell();
    cell.textContent = input.value; // Récupérer la valeur saisie
    input.value = ""; // Réinitialiser le champ de saisie après l'ajout
  });
};

/**
 * @param tableHeader - The ID of the HTML element containing the table headers.
 * @param DynamicFormContainer - The ID of the HTML element where the dynamic form should be inserted.
 *
 * Creates a dynamic form by inserting input fields for each table header.
 * The generated form is inserted into the element with the given ID.
 */
const createFormFromHeaders = (
  tableHeader: string,
  DynamicFormContainer: string
) => {
  const tableHeaderRow = document.getElementById(tableHeader)!;
  const formContainer = document.getElementById(DynamicFormContainer)!;
  const headers = Array.from(tableHeaderRow.children).map(
    (th) => th.textContent
  );

  formContainer.innerHTML = "";
  const inputs: HTMLInputElement[] = [];

  headers.forEach((header) => {
    const label = document.createElement("label");
    label.textContent = header;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Enter ${header}`;
    label.appendChild(input);

    inputs.push(input);
    formContainer.appendChild(label);
  });
  const submitButton = document.createElement("button");
  submitButton.textContent = "Add Row";
  submitButton.type = "button";
  submitButton.addEventListener("click", () => {
    addRowToTable(inputs, "csvTable");
  });
  formContainer.appendChild(submitButton);
};

/**
 * Escapes a value for use in a CSV.
 *
 * If the value contains a comma or a double quote, it is wrapped in double
 * quotes and any double quotes within the value are replaced with two double
 * quotes.
 *
 * @param value - The value to escape.
 * @returns The escaped value.
 */
const escapeCsvValue = (value: string): string => {
  if (value.includes(",") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Flattens a nested object into a single-level object with key paths.
 *
 * This function recursively traverses an object, flattening its structure
 * so that nested keys are represented in a single-level object. Each key
 * in the returned object is a path representing the hierarchy of the original
 * object, with levels separated by the specified separator.
 *
 * @param obj - The object to be flattened. It can contain nested objects or arrays.
 * @param parentKey - A prefix to prepend to each key path, useful for recursion.
 *                    Defaults to an empty string.
 * @param sep - The separator to use between key path levels. Defaults to '/'.
 * @returns A single-level object where keys are path strings of the original object's structure.
 */

const flattenObject = (
  obj: any,
  parentKey = "",
  sep = "/"
): Record<string, any> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = parentKey ? `${parentKey}${sep}${key}` : key;

    if (Array.isArray(value)) {
      if (typeof value[0] === "object" && value[0] !== null) {
        value.forEach((item, index) => {
          Object.assign(acc, flattenObject(item, `${newKey}[${index}]`, sep));
        });
      } else {
        acc[newKey] = escapeCsvValue(
          value
            .map((item) =>
              typeof item === "string"
                ? escapeCsvValue(String(item))
                : JSON.stringify(item)
            )
            .join(",")
        );
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, newKey, sep));
    } else {
      acc[newKey] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Converts a JSON array to a CSV string.
 * @param jsonData The input JSON array of objects.
 * @returns A CSV string where each row is a flattened representation of the original JSON objects.
 * @throws {Error} If the input JSON is not an array of objects.
 */
const jsonToCSV = (jsonData: any[]): string => {
  if (!Array.isArray(jsonData)) {
    const error = new Error("The input JSON should be an array of objects.");
    const errorMessage = document.querySelector(
      "#errorMessage"
    ) as HTMLDivElement;
    errorMessage.innerHTML = error.message;
    errorMessage.classList.toggle("display-error");
  }
  const flatData = jsonData.map((item) => flattenObject(item));
  const keys = Array.from(
    new Set(flatData.flatMap((item) => Object.keys(item)))
  );
  const headers = keys.join(",");
  const rows = flatData.map((item) => keys.map((key) => item[key]).join(","));
  return [headers, ...rows].join("\n");
};

/**
 * Reads a file and parses its contents, then calls the displayCSVTable and createFormFromHeaders functions
 * with the parsed data. The file type is determined by its extension.
 * @param file The file to read. Must be a JSON, CSV, XLSX, XLS, or ODS file.
 */
const readFile = (file: File) => {
  const errorMessage = document.querySelector(
    "#errorMessage"
  ) as HTMLDivElement;
  if (!errorMessage.classList.contains("display-error")) {
    errorMessage.classList.add("display-error");
  }
  const reader = new FileReader();
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  reader.onload = (event) => {
    if (fileExtension === "json") {
      const jsonData = JSON.parse(event.target!.result as string);
      const csvText = jsonToCSV(jsonData);
      displayCSVTable(csvText, "tableHeader", "tableBody");
      createFormFromHeaders("tableHeader", "formContainer");
    } else if (
      fileExtension === "csv" ||
      fileExtension === "xls" ||
      fileExtension === "xlsx" ||
      fileExtension === "ods"
    ) {
      const data = new Uint8Array(event.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      displayCSVTable(csvText, "tableHeader", "tableBody");
      createFormFromHeaders("tableHeader", "formContainer");
    }
  };
  if (fileExtension === "json") {
    reader.readAsText(file);
  } else if (
    fileExtension === "csv" ||
    fileExtension === "xls" ||
    fileExtension === "xlsx" ||
    fileExtension === "ods"
  ) {
    reader.readAsArrayBuffer(file);
  }
};

export { createFormFromHeaders, displayCSVTable, readFile };
