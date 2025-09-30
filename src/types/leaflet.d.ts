declare module "leaflet" {
  import * as L from "@types/leaflet";
  export = L;
}

declare module "leaflet/dist/leaflet.css" {
  const content: any;
  export default content;
}
