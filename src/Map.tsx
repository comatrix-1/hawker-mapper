import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import { useCallback, useEffect, useState } from "react";
import { IHawker } from "./types";
import { mapArrayToHawker, searchOneMap } from "./helpers";

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

export default function Map({
  hawkerList,
  selectedLatLng,
  setSelectedLatLng,
}: Props) {
  const handleClick = (event: L.LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    setSelectedLatLng({ lat: lat, lng: lng });
  };

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
          position={[
            Number(hawker?.latitude ?? ""),
            Number(hawker?.longitude ?? ""),
          ]}
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
