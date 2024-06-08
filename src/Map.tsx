import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useCallback, useEffect, useState } from "react";
import { IHawker } from "./types";
import { mapArrayToHawker, searchOneMap } from "./helpers";

export default function Map() {
  const [hawkerList, setHawkerList] = useState<IHawker[]>([]);

  const isSearchingOneMap = false;
  const isFilteringUniqueGeoCodes = true;

  const fetchHawkerList = useCallback(async () => {
    try {
      const result = await fetch("/dbs-paylah-hawker-list.json");
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
  }, [isSearchingOneMap]);

  useEffect(() => {
    void (async () => {
      await fetchHawkerList();
    })();
  }, []);

  return (
    <MapContainer
      center={[1.3599, 103.8157]}
      zoom={12}
      className="h-full w-full"
    >
      <TileLayer
        url="https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"
        detectRetina={true}
        maxZoom={19}
        minZoom={11}
        /** DO NOT REMOVE the OneMap attribution below **/
        attribution='<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/> OneMap | Map data &copy; contributors, <a href="https://www.sla.gov.sg/">Singapore Land Authority</a>'
      />
      {hawkerList?.map((hawker) => (
        <Marker
          position={[Number(hawker?.latitude ?? ""), Number(hawker?.longitude ?? "")]}
          key={`${hawker.stall ?? ""}${hawker.address ?? ""}`}
        >
          <Popup>
            <b>{hawker.area}</b>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
