import Papa from "papaparse";
import { IHawker } from "./types";
import { buildOneMapSearchUrl } from "./constants";

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

export const searchOneMap = async (
  hawker: IHawker
): Promise<IHawker | null> => {
  if (!hawker?.postalCode) return null;
  try {
    const result = await fetch(buildOneMapSearchUrl(hawker.postalCode));

    const resultJson: any = await result.json();

    if (resultJson && resultJson.found && resultJson.results.length > 0) {
      return {
        ...hawker,
        latitude: parseFloat(resultJson.results[0].LATITUDE),
        longitude: parseFloat(resultJson.results[0].LONGITUDE),
      };
    } else {
      console.log("No result for postal code: ", hawker.postalCode);
      return hawker;
    }
  } catch (error) {
    console.error(
      "Error fetching data for postal code: ",
      hawker.postalCode,
      error
    );
    return hawker;
  }
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

export const csvToJson = async (path: string) => {
  const resultList = await fetch(path);

  const resultListText = await resultList.text();

  const parsedResultList = JSON.parse(resultListText);

  return parsedResultList;
};

export const mapArrayToHawker = (array: any[]): IHawker[] => {
  const returnArray: any[] = array.map((item) => {
    return {
      stall: item.Stall,
      unit: item?.Unit,
      address: item.Address,
      area: item.Area,
      postalCode: item["Postal Code"],
    };
  });
  return returnArray;
};
