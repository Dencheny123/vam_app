export interface IMetaData {
  id: number;
  title: string;
  description: string;
  keywords: string;
  author_name: string;
  author_url: string;
  metadataBase: string;
  alternates: string;
  openGraph_title: string;
  openGraph_description: string;
  openGraph_url: string;
  openGraph_siteName: string;
  themeColor: string;
  icons_icon: string[] | string;
  icons_shortcut: string[] | string;
  icons_apple: string[] | string;
  other_geo_region: string;
  other_geo_placename: string;
  other_geo_position: string;
  other_ICBM: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface IMetaDataInput {
  id: number;
  title?: string;
  description?: string;
  keywords?: string;
  author_name?: string;
  author_url?: string;
  metadataBase?: string;
  alternates?: string;
  openGraph_title?: string;
  openGraph_description?: string;
  openGraph_url?: string;
  openGraph_siteName?: string;
  themeColor?: string;
  icons_icon?: File | string;
  icons_shortcut?: File | string;
  icons_apple?: File | string;
  other_geo_region?: string;
  other_geo_placename?: string;
  other_geo_position?: string;
  other_ICBM?: string;
}
