import Papa from "papaparse";
import { IHawker, IHawkerWithLongLat } from "./types";

export const fetchCsv = async (path: string) => {
  try {
    const response = await fetch(path);

    if (!response || !response.ok) {
      throw new Error("Error fetching CSV file");
    }

    const csv = await response.text();

    // Return the parsed data directly instead of using a Promise
    const parsedData = await new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });

    return parsedData;
  } catch (error) {
    console.error("Error reading CSV file:", error);
    return [];
  }
};

export const searchOneMap = async (hawker: IHawker) => {
  const result = await fetch(
    `https://developers.onemap.sg/commonapi/search?searchVal=${hawker["Postal code"]}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
  );

  const resultJson: any = await result.json();

  if (resultJson && resultJson.found && resultJson.results.length > 0) {
    return {
      ...hawker,
      latitude: resultJson.results[0].LATITUDE as number,
      longitude: resultJson.results[0].LONGITUDE as number,
    };
  } else console.log("No result for postal code: ", hawker["Postal code"]);
};

export const exportData = (data: any, fileName: string, type: any) => {
  // Create a link and download the file
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const searchAndSaveList = async (hawkersToSearch: IHawker[]) => {
  console.log(
    "searchAndSaveList :: hawkersToSearch.length : ",
    hawkersToSearch.length
  );
  var hawkerResultList: any[] = [];

  // Use `for...of` loop to ensure proper handling of asynchronous calls
  for (const hawkerToSearch of hawkersToSearch) {
    const result = await searchOneMap(hawkerToSearch);
    hawkerResultList.push(result);
    console.log(hawkerResultList);
  }

  console.log(
    "searchAndSaveList :: search complete. length: ",
    hawkerResultList.length
  );

  const dataToExport = JSON.stringify(hawkerResultList);

  exportData(dataToExport, "data", "csv");
};

export const csvToJson = async (path: string) => {
  const resultList = await fetch(path);

  const resultListText = await resultList.text();

  const parsedResultList = JSON.parse(resultListText);

  return parsedResultList;
};
