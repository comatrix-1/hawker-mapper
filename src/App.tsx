import "./App.css";
import Map from "./Map";
import Aside from "./Aside";
import { useEffect, useState } from "react";
import { searchOneMap } from "./helpers";
import { IHawker } from "./types";

function App() {
  const [selectedLatLng, setSelectedLatLng] = useState({ lat: 0, lng: 0 });
  const [hawkerList, setHawkerList] = useState<IHawker[]>([]);
  const BASE_URL =
    (import.meta.env.VITE_BASE_URL as string) ||
    process.env.VITE_BASE_URL ||
    "/";

  const isSearchingOneMap = false;
  const isFilteringUniqueGeoCodes = true;

  const fetchHawkerList = async () => {
    console.log("fetchHawkerList()");
    try {
      const result = await fetch(`${BASE_URL}dbs-paylah-hawker-list.json`);
      const jsonData: IHawker[] = (await result.json()) as IHawker[];
      console.log("jsonData", jsonData);

      let hawkerList: IHawker[] = jsonData;

      if (isSearchingOneMap) {
        const promises = hawkerList.map((hawker) => searchOneMap(hawker));
        const results = await Promise.all(promises);

        // Filter out undefined results (in case of errors or no results)
        const hawkerResultList = results.filter(
          (result) => result !== undefined
        );

        console.log("hawkerResultList", hawkerResultList);
      }

      if (isFilteringUniqueGeoCodes) {
        const uniqueGeoCodeSet = new Set<string>();
        let uniqueHawkerList: IHawker[] = [];

        for (const hawker of hawkerList) {
          const uniqueKey = `${hawker.stall ?? ""}${hawker.postalCode ?? ""}`;
          if (!uniqueKey.length) {
            console.log("!uniqueKey.length");
          } else if (!uniqueGeoCodeSet.has(uniqueKey)) {
            uniqueGeoCodeSet.add(uniqueKey);
            uniqueHawkerList = uniqueHawkerList.concat(hawker);
          } else {
            console.log("uniqueKey already in set", uniqueKey);
          }
        }

        hawkerList = uniqueHawkerList;
      }

      console.log("hawkerList at end", hawkerList);
      setHawkerList(hawkerList);
    } catch (error) {
      console.error("Failed to fetch hawker list", error);
    }
  };

  useEffect(() => {
    void (async () => fetchHawkerList())();
  }, []);

  return (
    <>
      <h1>Hawker list</h1>
      <p>
        This is a map showing the participating stalls for the DBS Paylah
        promotion. The full PDF can be found{" "}
        <a href="https://www.dbs.com.sg/iwov-resources/media/pdf/deposits/dbs-paylah-hawker-list.pdf">
          here.
        </a>{" "}
        The data was last updated on 6 June 2024.
        <p>Start by zooming in or tapping anywhere on the map to zoom in</p>
      </p>
      <main>
        <div style={{ height: "40%" }}>
          <Map
            hawkerList={hawkerList}
            selectedLatLng={selectedLatLng}
            setSelectedLatLng={setSelectedLatLng}
          />
        </div>
        <Aside selectedLatLng={selectedLatLng} hawkerList={hawkerList} />
      </main>
    </>
  );
}

export default App;
