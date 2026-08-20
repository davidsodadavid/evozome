// Static product catalogue. The site is a single landing page for now, so
// there's just one "product" entry pointing at it — this is the seam where
// a real data source (DB, CMS) would slot in once there's more than one.
export type Product = {
  id: string;
  name: string;
  description: string;
  status: "Published" | "Draft";
  href: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "evozome-landing",
    name: "Armadillo 2.0",
    description: "The main and only page on the site.",
    status: "Published",
    href: "/",
  },
];
