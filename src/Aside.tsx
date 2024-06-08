import { IHawker } from "./types";

type Props = {
  hawkerList: IHawker[];
  selectedLatLng: { lat: number; lng: number };
};

interface IArea {
  area: string;
  address: string;
}

const Aside = ({ hawkerList, selectedLatLng }: Props) => {
  console.log("selectedLatLng", selectedLatLng);
  const filteredHawkerList = hawkerList.filter(
    (hawker) =>
      hawker.latitude === selectedLatLng.lat &&
      hawker.longitude === selectedLatLng.lng
  );

  // Custom function to check if the set already contains an area
  const containsArea = (set: Set<IArea>, areaObj: IArea): boolean => {
    for (const item of set) {
      if (item.area === areaObj.area && item.address === areaObj.address) {
        return true;
      }
    }
    return false;
  };

  // Create a set of unique areas
  const hawkerSet = new Set<IArea>();

  for (const hawker of filteredHawkerList) {
    if (!hawker?.area) {
      console.log("empty hawker?.area");
    } else {
      const areaObj: IArea = {
        area: hawker.area,
        address: hawker.address ?? "",
      };
      if (!containsArea(hawkerSet, areaObj)) {
        hawkerSet.add(areaObj);
      }
    }
  }

  console.log("hawkerSet", hawkerSet);

  return (
    <>
      {Array.from(hawkerSet).map((area) => (
        <div key={area.address}>
          <h2 style={{ fontSize: 28 }}>
            <b>{area.area}</b>
          </h2>
          <h2 style={{ fontSize: 22 }}>{area.address}</h2>
          {filteredHawkerList
            .filter((hawker) => hawker.address === area.address)
            .map((hawker) => (
              <div key={hawker.stall}>
                <b>{hawker.stall}</b>
                {` `}
                {hawker.unit && <span>{hawker.unit}</span>}
              </div>
            ))}
        </div>
      ))}
    </>
  );
};

export default Aside;
