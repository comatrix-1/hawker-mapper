export const buildOneMapSearchUrl = (searchVal: string) => {
  return `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchVal}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
};
