import * as XLSX from "xlsx";

const getTableRowsHeaders = (): [string[][], string[]] => {
  const table = document.getElementById("csvTable")!;

  const rows = [...table.querySelectorAll("tr")].map((row) =>
    [...row.querySelectorAll("td")].map((cell) => cell.textContent || "")
  );

  const headers = [...table.querySelectorAll("th")].map(
    (th) => th.textContent || ""
  );

  return [rows, headers];
};

const downloadLink = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

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
    const obj: { [key: string]: string } = {}; // Typage explicite pour les clés et valeurs
    row.forEach((cell, index) => {
      const header = headers[index];
      if (header) {
        // Vérifier que le header n'est pas vide
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

const downloadTableAsXlsx = () => {
  const [rows, headers] = getTableRowsHeaders();

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const workbookOut = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "binary",
  });

  const blob = new Blob([stringToArrayBuffer(workbookOut)], {
    type: "application/octet-stream",
  });

  downloadLink(blob, "table_data.xlsx");
};

const downloadTableAsXls = (bookType: "xls" | "ods") => {
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
  downloadTableAsXlsx,
};
