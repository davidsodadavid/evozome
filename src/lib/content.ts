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

  aboutText: string;
  aboutImage1: string;
  aboutImage2: string;

  products: { title: string; desc: string; img: string }[];

  armadilloText: string;
  armadilloImage: string;

  gallery: string[];

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

  aboutText:
    "A PRIVATE ARCHITECTURAL SANCTUARY FOR SOUND & TRANSFORMATION\nINSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION, THE RESONANCE CHAMBER IS A PRIVATE SANCTUARY WHERE ARCHITECTURE BECOMES AN INSTRUMENT.",
  aboutImage1: "/evozome/img-03.png",
  aboutImage2: "/evozome/img-04.png",

  products: [
    { title: "ARMADILLO 2.0", desc: "MODULAR RESONANCE CHAMBER", img: "/evozome/img-07.png" },
    { title: "CHAMBER ONE", desc: "SOLO ACOUSTIC RETREAT", img: "/evozome/img-03.png" },
    { title: "THE VESSEL", desc: "SHARED LISTENING SPACE", img: "/evozome/img-04.png" },
  ],

  armadilloText:
    "A PREMIUM MODULAR STRUCTURE INSPIRED BY ANCIENT ACOUSTIC ARCHITECTURE, SACRED GEOMETRY, AND THE TIMELESS RELATIONSHIP BETWEEN SPACE AND VIBRATION.",
  armadilloImage: "/evozome/img-06.png",

  gallery: ["/evozome/img-08.png", "/evozome/img-09.png", "/evozome/img-10.png", "/evozome/img-11.png"],

  contactEmail: "evozome@gmail.com",
  contactPhone: "381 4 239 249",
};

export async function getContent(): Promise<LandingContent> {
  const stored = await getR2Json<LandingContent>(CONTENT_KEY);
  if (!stored) return DEFAULT_CONTENT;
  // Shallow-merge so older saved documents missing newer fields still work.
  return { ...DEFAULT_CONTENT, ...stored };
}

export async function saveContent(content: LandingContent) {
  await putR2Json(CONTENT_KEY, content);
}
