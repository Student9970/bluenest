export type ListingType = "rent" | "daily";

export type Listing = {
  id: string;
  title: string;
  area: string;
  price: number;
  type: ListingType;
  description: string;
  imageUrl: string;
  ownerPhone: string;
  /** User-owned listing from this device/session */
  isOwn?: boolean;
};

export type AuthUser = {
  uid: string;
  name: string;
  email: string;
  photoUrl: string | null;
};
