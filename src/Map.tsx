import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useCallback, useEffect, useState } from "react";
import { IHawkerWithLongLat } from "./types";

export default function Map() {
  const [hawkerList, setHawkerList] = useState<IHawkerWithLongLat[]>([]);

  const parseHawker = (data: IHawkerWithLongLat): IHawkerWithLongLat | null => {
    if (!data) return null;

    const hawker: IHawkerWithLongLat = {
      Name: data.Name,
      Address: data.Address,
      "Postal code": data["Postal code"],
      Region: data.Region,
      Type: data.Type,
      latitude: data.latitude,
      longitude: data.longitude,
    };
    return hawker;
  };

  const fetchHawkerList = useCallback(async () => {
    try {
      const result = await fetch("/result.json");
      const retrievedHawkerList: IHawkerWithLongLat[] =
        (await result.json()) as IHawkerWithLongLat[];

      console.log("retrievedHawkerList", retrievedHawkerList);

      const uniqueItems = new Set<string>();

      const filteredList: IHawkerWithLongLat[] = retrievedHawkerList.filter(
        (hawker) => {
          const parsedHawker = parseHawker(hawker);
          if (!parsedHawker) {
            return false;
          } else if (
            !uniqueItems.has(parsedHawker.Name + parsedHawker["Postal code"])
          ) {
            uniqueItems.add(parsedHawker.Name + parsedHawker["Postal code"]);
            return true;
          } else {
            return false;
          }
        }
      );

      setHawkerList(filteredList);
    } catch (error) {
      console.error("Failed to fetch hawker list", error);
    }
  }, [setHawkerList]);

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
          position={[hawker.latitude, hawker.longitude]}
          key={hawker.Name + hawker.Address}
        >
          <Popup>
            <b>{hawker.Name}</b>
            <p>{hawker.Address}</p>
            <p>{hawker["Postal code"]}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
