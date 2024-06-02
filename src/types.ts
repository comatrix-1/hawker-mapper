export interface IHawker {
  Name: string;
  Address: string;
  "Postal code": string;
  Region: string;
  Type: string;
}

export interface IHawkerWithLongLat extends IHawker {
  latitude: number;
  longitude: number;
}
