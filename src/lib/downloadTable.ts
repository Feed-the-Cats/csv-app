import * as XLSX from "xlsx";

/**
 * Extracts the data rows and header row from the HTML table with the ID "csvTable".
 *
 * @returns A tuple containing two elements:
 *   - An array of arrays of strings, where each inner array represents a row of data from the table.
 *   - An array of strings representing the header row of the table.
 *
 * The function assumes that the HTML table has a structure where headers are in <th> elements
 * and data cells are in <td> elements. It filters out rows without data cells.
 */

const getTableRowsHeaders = (): [string[][], string[]] => {
  const table = document.getElementById("csvTable")!;

  const rows = [...table.querySelectorAll("tr")]
    .filter((row) => row.querySelectorAll("td").length > 0)
    .map((row) =>
      [...row.querySelectorAll("td")].map((cell) => cell.textContent || "")
    );

  const headers = [...table.querySelectorAll("th")].map(
    (th) => th.textContent || ""
  );

  return [rows, headers];
};

/**
 * Creates a blob URL, appends it to a newly created link element,
 * simulates a click on the link, and then revokes the blob URL.
 * Used to download a blob as a file.
 *
 * @param {Blob} blob the blob to download
 * @param {string} fileName the name of the file to download as
 */

const downloadLink = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Converts a string into an ArrayBuffer.
 *
 * This function creates an ArrayBuffer with the same length as the input string
 * and fills it with the char codes of the string, masked to 8 bits.
 *
 * @param s - The string to be converted into an ArrayBuffer.
 * @returns An ArrayBuffer where each byte is the char code of the corresponding character in the string.
 */

const stringToArrayBuffer = (s: string) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};

const downloadTableAsCsv = () => {
  const [rows, headers] = getTableRowsHeaders();

  const csvContent = [headers, ...rows]
    .map((row) => (Array.isArray(row) ? row.join(",") : row))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  downloadLink(blob, "table_data.csv");
};

const downloadTableAsJson = () => {
  const [rows, headers] = getTableRowsHeaders();

  const data = rows.slice(1).map((row) => {
    const obj: { [key: string]: string } = {};
    row.forEach((cell, index) => {
      const header = headers[index];
      if (header) {
        obj[header] = cell;
      }
    });
    return obj;
  });

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });

  downloadLink(blob, "table_data.json");
};

const downloadTableAsHtml = () => {
  const table = document.getElementById("csvTable")!;
  const tableHtml = table.outerHTML;
  const blob = new Blob([tableHtml], { type: "text/html;charset=utf-8;" });

  downloadLink(blob, "table_data.html");
};

const downloadTableAsXls = (bookType: "xlsx" | "xls" | "ods") => {
  const [rows, headers] = getTableRowsHeaders();

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const workbookOut = XLSX.write(workbook, {
    bookType: bookType,
    type: "binary",
  });

  const blob = new Blob([stringToArrayBuffer(workbookOut)], {
    type: "application/octet-stream",
  });
  downloadLink(blob, `table_data.${bookType}`);
};

export {
  downloadTableAsCsv,
  downloadTableAsHtml,
  downloadTableAsJson,
  downloadTableAsXls,
};
