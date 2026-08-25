import { getR2Json, putR2Json } from "@/lib/r2";

// Editable copy + images for the Armadillo 2.0 landing page. This is the
// single source of truth the public page renders from — stored as one JSON
// document in R2 (no database yet, matches the rest of this project).
export type LandingContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  /** Optional mobile-only override for heroImage — only meaningful when
   * heroImage is a video. Empty string means "use heroImage on mobile too". */
  heroImageMobile: string;

  // Intro statement section — sits right below the hero.
  introLabel: string;
  introStatement: string;
  introImageLeft: string;
  introImageRight: string;

  resonanceText: string;
  resonanceImage1: string;
  resonanceImage2: string;
  /** Caption sentence shown bottom-left on both the INSIDE and OUTSIDE
   * photos (hidden on screens <=1024px). Same sentence on both. */
  resonancePhotosCaption: string;

  aboutText: string;

  // "Window" split panel (photo | logo) below the Armadillo feature photo.
  windowImage: string;
  windowHeading: string;
  windowText: string;

  armadilloImage: string;
  /** Optional mobile-only override for armadilloImage — only meaningful when
   * armadilloImage is a video. Empty string means "use armadilloImage on mobile too". */
  armadilloImageMobile: string;

  gallery: { img: string; line1: string; line2: string }[];

  contactEmail: string;
  contactPhone: string;
};

const CONTENT_KEY = "data/landing-content.json";

export const DEFAULT_CONTENT: LandingContent = {
  heroTitle: "A PRIVATE SANCTUARY DESIGNED FOR PEOPLE WHO VALUE SPACE, SILENCE AND TIMELESS DESIGN.",
  heroSubtitle: "ARCHITECTURE THAT CHANGES HOW\nYOU EXPERIENCE NATURE AND SOUND",
  heroImage: "/evozome/img-01.png",
  heroImageMobile: "",

  introLabel: "ARCHITECTURE THAT CHANGES HOW\nYOU EXPERIENCE NATURE AND SOUND",
  introStatement: "A PRIVATE SANCTUARY DESIGNED FOR PEOPLE WHO VALUE SPACE, SILENCE AND TIMELESS DESIGN.",
  introImageLeft: "/evozome/img-03.png",
  introImageRight: "/evozome/img-04.png",

  resonanceText:
    "RESONANCE CHAMBER — IS A SPACE OR STRUCTURE DESIGNED TO AMPLIFY, SHAPE, AND TRANSMIT SOUND AND VIBRATION THROUGH ITS GEOMETRY, MATERIALS, AND ACOUSTIC PROPERTIES. THE CONCEPT ORIGINATES FROM ACOUSTICS, ARCHITECTURE, AND MUSICAL INSTRUMENTS, ENVIRONMENTS.",
  resonanceImage1: "https://pub-9230832a19fe46b3b1f291f153cea0ef.r2.dev/media/photos/154242dc-7488-497e-8ca4-7266e15fdff7.webp",
  resonanceImage2: "https://pub-9230832a19fe46b3b1f291f153cea0ef.r2.dev/media/photos/0cfe9e4b-77c0-429d-a8b0-2adba6c2804d.webp",
  resonancePhotosCaption: "EVERY DETAIL IS SHAPED BY LIGHT, MATERIAL, AND THE SPACE BETWEEN THEM.",

  aboutText:
    "A PRIVATE ARCHITECTURAL SANCTUARY FOR SOUND & TRANSFORMATION\nINSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION, THE RESONANCE CHAMBER IS A PRIVATE SANCTUARY WHERE ARCHITECTURE BECOMES AN INSTRUMENT.",

  windowImage: "/evozome/img-06.png",
  windowHeading: "BUILT TO HEAL",
  windowText:
    "RESONANCE CHAMBER — IS A SPACE OR STRUCTURE DESIGNED TO AMPLIFY, SHAPE, AND TRANSMIT SOUND AND VIBRATION THROUGH ITS GEOMETRY, MATERIALS, AND ACOUSTIC PROPERTIES. THE CONCEPT ORIGINATES FROM ACOUSTICS, ARCHITECTURE, AND MUSICAL INSTRUMENTS, ENVIRONMENTS.",

  armadilloImage: "/evozome/img-06.png",
  armadilloImageMobile: "",

  gallery: [
    { img: "/evozome/img-08.png", line1: "A PRIVATE ARCHITECTURAL", line2: "INSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION" },
    { img: "/evozome/img-09.png", line1: "A PRIVATE ARCHITECTURAL", line2: "INSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION" },
    { img: "/evozome/img-10.png", line1: "A PRIVATE ARCHITECTURAL", line2: "INSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION" },
    { img: "/evozome/img-11.png", line1: "A PRIVATE ARCHITECTURAL", line2: "INSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION" },
  ],

  contactEmail: "evozome@gmail.com",
  contactPhone: "381 4 239 249",
};

export async function getContent(): Promise<LandingContent> {
  const stored = await getR2Json<Record<string, unknown>>(CONTENT_KEY);
  if (!stored) return DEFAULT_CONTENT;
  // Shallow-merge so older saved documents missing newer fields still work.
  const merged = { ...DEFAULT_CONTENT, ...stored } as LandingContent;

  // Migrate older documents where gallery was a plain string[] of photo URLs
  // (before per-photo line1/line2 text existed) into the current shape.
  const rawGallery = merged.gallery as unknown;
  if (Array.isArray(rawGallery) && typeof rawGallery[0] === "string") {
    merged.gallery = (rawGallery as string[]).map((img, i) => ({
      img,
      line1: DEFAULT_CONTENT.gallery[i]?.line1 ?? DEFAULT_CONTENT.gallery[0].line1,
      line2: DEFAULT_CONTENT.gallery[i]?.line2 ?? DEFAULT_CONTENT.gallery[0].line2,
    }));
  }

  return merged;
}

export async function saveContent(content: LandingContent) {
  await putR2Json(CONTENT_KEY, content);
}
