import jsonFile from "../Untitled-1.json";

const displayJsonButton = document.getElementById("displayJsonButton");

const jsonToCSV = (jsonData: any) => {
  const headers = Object.keys(jsonData[0]);
  const rows = [headers.join(",")];
};

const readFile = (json: object) => {
  const reader = new FileReader();
  //const fileExtension = file.name.split(".").pop()?.toLowerCase();

  reader.onload = (event) => {
    const jsonFileParsed = JSON.parse(event.target!.result as string);
    console.log(jsonFileParsed);
  };

  reader.readAsText(json);
};

displayJsonButton?.addEventListener("click", () => {
  const jsonFileParsed = JSON.stringify(jsonFile);
  console.log("jsonFileParsed", jsonFileParsed);
});
