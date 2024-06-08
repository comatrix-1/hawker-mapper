import "./App.css";
import Map from "./Map";
import Aside from "./Aside";
import { useState } from "react";
import { searchOneMap } from "./helpers";
import { IHawker } from "./types";

function App() {
  const [selectedLatLng, setSelectedLatLng] = useState({ lat: 0, lng: 0 });
  const [hawkerList, setHawkerList] = useState<IHawker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL =
    import.meta.env.VITE_BASE_URL || process.env.VITE_BASE_URL || "/";

  const isSearchingOneMap = false;
  const isFilteringUniqueGeoCodes = true;

  const handleFetchHawkerList = () => {
    void fetchHawkerList();
  };

  const fetchHawkerList = async () => {
    console.log("fetchHawkerList()");
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Hawker list</h1>
      <button onClick={handleFetchHawkerList}>
        {isLoading ? "Loading..." : "Fetch hawker list"}
      </button>
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
