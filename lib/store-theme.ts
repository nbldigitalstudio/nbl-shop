export const STORE_THEME_VERSION = 1;

export type StoreThemeSettings = {
  version: number;
  colors: { primary: string; background: string; text: string };
  typography: { heading: string; body: string };
  logoUrl: string | null;
  bannerUrl: string | null;
  socialLinks: Record<string, string>;
  contact: Record<string, string>;
  categories: string[];
};

export const defaultStoreTheme: StoreThemeSettings = {
  version: STORE_THEME_VERSION,
  colors: { primary: "#18a986", background: "#ffffff", text: "#152020" },
  typography: { heading: "Inter", body: "Inter" },
  logoUrl: null,
  bannerUrl: null,
  socialLinks: {},
  contact: {},
  categories: []
};
