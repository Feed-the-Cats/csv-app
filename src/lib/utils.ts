import { createFormFromHeaders, displayCSVTable } from "./uploadTable";

const updateThemeIcon = (themeToggleButton: HTMLButtonElement) => {
  if (document.body.classList.contains("dark-theme")) {
    themeToggleButton.textContent = "🌜"; // Icône de lune pour le thème sombre
  } else {
    themeToggleButton.textContent = "🌞"; // Icône de soleil pour le thème clair
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
      console.log(headers);
      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");
      displayCSVTable(csvContent, "tableHeader", "tableBody");
      createFormFromHeaders("tableHeader", "formContainer");
    })
    .catch((error) => console.error("Error fetching data:", error));
};

export { generateSampleCSV, updateThemeIcon };
