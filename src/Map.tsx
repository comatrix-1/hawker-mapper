import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { IHawker } from "./types";
import { useState } from "react";

type Props = {
  hawkerList: IHawker[];
  selectedLatLng: { lat: number; lng: number };
  setSelectedLatLng: React.Dispatch<
    React.SetStateAction<{
      lat: number;
      lng: number;
    }>
  >;
};

function MapComponent({
  setCurrentZoom,
  hawkerList,
  setVisibleMarkers,
}: {
  setCurrentZoom: React.Dispatch<React.SetStateAction<number>>;
  hawkerList: any[];
  setVisibleMarkers: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const map = useMapEvents({
    click: () => {
      map.locate();
    },
    locationfound: (location) => {
      console.log("location found:", location);
    },
    zoom: () => {
      console.log("handleZoomChange() zoom", map.getZoom());
      setCurrentZoom(map.getZoom());
    },
    moveend: () => {
      // On moveend, check which markers are within the viewport
      const bounds = map.getBounds();
      const visibleMarkersIds = hawkerList
        .filter((hawker) =>
          bounds.contains([Number(hawker.latitude), Number(hawker.longitude)])
        )
        .map((hawker) => `${hawker.stall ?? ""}${hawker.address ?? ""}`);

      setVisibleMarkers(visibleMarkersIds);
    },
  });
  return null;
}

export default function Map({ hawkerList, setSelectedLatLng }: Props) {
  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const [visibleMarkers, setVisibleMarkers] = useState<any[]>([]);
  console.log("currentZoom", currentZoom);

  const handleClick = (event: L.LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    setSelectedLatLng({ lat: lat, lng: lng });
  };

  const visibleHawkers = hawkerList.filter(
    (hawker) =>
      visibleMarkers.includes(`${hawker.stall ?? ""}${hawker.address ?? ""}`) &&
      currentZoom >= 12 // Adjust the zoom level as per your requirement
  );

  return (
    <MapContainer
      center={[1.3599, 103.8157]}
      zoom={currentZoom}
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
      <MapComponent
        setCurrentZoom={setCurrentZoom}
        setVisibleMarkers={setVisibleMarkers}
        hawkerList={hawkerList}
      />
      {currentZoom >= 16 &&
        visibleHawkers.map((hawker) => (
          <Marker
            position={[Number(hawker.latitude), Number(hawker.longitude)]}
            key={`${hawker.stall ?? ""}${hawker.address ?? ""}`}
            eventHandlers={{ click: handleClick }}
          >
            <Popup>
              <b>{hawker.area}</b>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
