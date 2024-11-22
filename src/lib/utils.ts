import moon from "../assets/moon.svg?raw";
import sun from "../assets/sun.svg?raw";
import { createFormFromHeaders, displayCSVTable } from "./uploadTable";

const updateThemeIcon = (themeToggleButton: HTMLButtonElement) => {
  if (document.body.classList.contains("dark-theme")) {
    themeToggleButton.innerHTML = moon;
  } else {
    themeToggleButton.innerHTML = sun;
  }
};

const generateSampleCSV = () => {
  const url = "https://jsonplaceholder.typicode.com/users";
  fetch(url)
    .then((response) => response.json())
    .then((data: User[]) => {
      const headers = Object.keys(data[0]);
      const rows = data.map((user: User) => {
        return headers.map((header) => {
          if (header === "address") {
            return `${user.address.street} ${user.address.suite} ${user.address.city} ${user.address.zipcode}`;
          }

          if (header === "company") {
            return `${user.company.name} (${user.company.catchPhrase})`;
          }

          return user[header as keyof User];
        });
      });
      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");
      displayCSVTable(csvContent, "tableHeader", "tableBody");
      createFormFromHeaders("tableHeader", "formContainer");
    })
    .catch((error) => console.error("Error fetching data:", error));
};

const splitCsvRespectingQuotes = (input: string): string[] => {
  const regex = /"([^"]*)"|[^,]+/g;
  const result: string[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      result.push(match[1]);
    } else {
      result.push(match[0]);
    }
  }
  return result;
};

const hasQuotedPortion = (input: string): boolean => {
  return /"[^"]*"/.test(input);
};

export {
  generateSampleCSV,
  hasQuotedPortion,
  splitCsvRespectingQuotes,
  updateThemeIcon,
};
