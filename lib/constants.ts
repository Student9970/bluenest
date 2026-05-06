export const NAVI_AREAS = [
  "All",
  "Vashi",
  "Airoli",
  "Thane",
  "Nerul",
] as const;

export type AreaFilter = (typeof NAVI_AREAS)[number];

export type ListingArea = Exclude<AreaFilter, "All">;
