export type ViewKey = "home" | "search" | "detail" | "bookmarks";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BusinessHours {
  /** 0 = Sunday ... 6 = Saturday */
  open: string;
  close: string;
  closed?: boolean;
}

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

export interface Review {
  id: string;
  businessId: string;
  author: string;
  avatarHue: number;
  rating: number;
  date: string;
  text: string;
  tags: string[];
  helpful: number;
  isLocal?: boolean;
}

export interface Business {
  id: string;
  name: string;
  tagline: string;
  category: string;
  subcategory: string[];
  neighborhood: string;
  area: string;
  address: string;
  phone: string;
  price: PriceLevel;
  rating: number;
  reviewCount: number;
  coords: Coordinates;
  photos: string[];
  hours: Record<number, BusinessHours>;
  attributes: string[];
  description: string;
  menuHighlights: string[];
  verified: boolean;
  featured?: boolean;
  keywords: string[];
  reviews: Review[];
  distanceFromCenterKm: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  hue: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  area: string;
  vibe: string;
  coords: Coordinates;
  businessCount: number;
}

export interface FilterState {
  query: string;
  category: string; // "" = all
  neighborhood: string; // "" = all
  minRating: number;
  maxPrice: number; // 1-4
  openNow: boolean;
  sort: "rating" | "reviews" | "distance";
}

export const PRICE_LEVELS: PriceLevel[] = ["$", "$$", "$$$", "$$$$"];