import * as XLSX from "xlsx";

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
      const row = lines[i].split(",");
      const tr = document.createElement("tr");
      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell.trim();
        tr.appendChild(td);
      });
      TBody.appendChild(tr);
    }
  }
};

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

  headers.forEach((header) => {
    const label = document.createElement("label");
    label.textContent = header;

    const input = document.createElement("input");
    input.type = "text";

    label.appendChild(input);
    formContainer.appendChild(label);
  });
};

// corriger json upload
/* const jsonToCSV = (jsonData: any) => {
  const headers = Object.keys(jsonData[0]);
  const rows = [headers.join(",")];
  jsonData.forEach((row: any) => {
    const values = headers.map((key) =>
      JSON.stringify(row[headers], (_, v) => (v === null ? "" : v))
    );
    rows.push(values.join(","));
  });
  return rows.join("\n");
}; */

/* const jsonToCSV = (jsonData: any)=>{
  const headers = Object.keys(jsonData[0]);
  const rows = data.map((user: User) => {
    headers.map((header) => {
      if (header === 'address') {
        return `${user.address.street} ${user.address.suite} ${user.address.city} ${user.address.zipcode}`;
      }

      if (header === 'company') {
        return `${user.company.name} (${user.company.catchPhrase})`;
      }

      return user[header as keyof User];
    });
  });
} */

const readFile = (file: File) => {
  const reader = new FileReader();
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  reader.onload = (event) => {
    if (fileExtension === "csv") {
      const data = new Uint8Array(event.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvText = XLSX.utils.sheet_to_csv(worksheet);

      displayCSVTable(csvText, "tableHeader", "tableBody");
      createFormFromHeaders("tableHeader", "formContainer");
    } else if (fileExtension === "json") {
      const jsonData = JSON.parse(event.target!.result as string);
      const csvText = jsonToCSV(jsonData);
      displayCSVTable(csvText, "tableHeader", "tableBody");
      createFormFromHeaders("tableHeader", "formContainer");
    } else if (fileExtension === "xls" || fileExtension === "xlsx") {
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
    fileExtension === "xlsx"
  ) {
    reader.readAsArrayBuffer(file);
  }

  //reader.readAsArrayBuffer(file);
};

export { createFormFromHeaders, displayCSVTable, readFile };

/* 
import * as XLSX from 'xlsx';

const displayCSVTable = (csvText: string, tableHeader: string, tableBody: string) => {
  const lines = csvText.split('\n');
  const tableHeaderRow = document.getElementById(tableHeader)!;
  const TBody = document.getElementById(tableBody)!;

  tableHeaderRow.innerHTML = '';
  TBody.innerHTML = '';

  if (lines.length > 0) {
    const headers = lines[0].split(',');
    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header.trim();
      tableHeaderRow.appendChild(th);
    });

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell.trim();
        tr.appendChild(td);
      });
      TBody.appendChild(tr);
    }
  }
};

const createFormFromHeaders = (tableHeader: string, DynamicFormContainer: string) => {
  const tableHeaderRow = document.getElementById(tableHeader)!;
  const formContainer = document.getElementById(DynamicFormContainer)!;
  const headers = Array.from(tableHeaderRow.children).map(
    (th) => th.textContent
  );

  formContainer.innerHTML = '';

  headers.forEach((header) => {
    const label = document.createElement('label');
    label.textContent = header;

    const input = document.createElement('input');
    input.type = 'text';

    label.appendChild(input);
    formContainer.appendChild(label);
  });
};

const readFile = (file: File) => {
  const reader = new FileReader();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  reader.onload = (event) => {
    if (fileExtension === 'json') {
      // Process JSON file
      const jsonData = JSON.parse(event.target!.result as string);
      const csvText = jsonToCSV(jsonData);
      displayCSVTable(csvText, 'tableHeader', 'tableBody');
      createFormFromHeaders('tableHeader', 'formContainer');
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      // Process Excel file
      const data = new Uint8Array(event.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      displayCSVTable(csvText, 'tableHeader', 'tableBody');
      createFormFromHeaders('tableHeader', 'formContainer');
    }
  };

  // Determine the appropriate reader method based on file type
  if (fileExtension === 'json') {
    reader.readAsText(file);
  } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
    reader.readAsArrayBuffer(file);
  }
};

// Utility function to convert JSON to CSV
const jsonToCSV = (jsonData: any) => {
  const keys = Object.keys(jsonData[0]);
  const csvRows = [keys.join(',')];
  jsonData.forEach((row: any) => {
    const values = keys.map((key) => JSON.stringify(row[key], (_, v) => (v === null ? '' : v)));
    csvRows.push(values.join(','));
  });
  return csvRows.join('\n');
};

*/
