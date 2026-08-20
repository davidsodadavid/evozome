"use client";

import { useState, useActionState } from "react";
import ImagePicker from "@/components/ImagePicker";
import { updateContent, type ContentFormState } from "@/app/actions/content";
import type { LandingContent } from "@/lib/content";
import { isVideoUrl, type MediaKind } from "@/lib/uploads";

type MediaItem = { key: string; url: string; filename: string; kind: MediaKind };

const initialState: ContentFormState = {};

const fieldClass =
  "w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-white/80";
const sectionClass = "flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5";
const sectionNumClass = "text-xs font-bold uppercase tracking-widest text-white/40";
const sectionTitleClass = "text-base font-semibold text-white";
const hintClass = "text-xs text-white/40";

function SectionHeader({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div>
      <div className={sectionNumClass}>Section {n}</div>
      <h2 className={sectionTitleClass}>{title}</h2>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export default function ContentForm({
  content,
  mediaLibrary,
}: {
  content: LandingContent;
  mediaLibrary: MediaItem[];
}) {
  const [state, formAction, pending] = useActionState(updateContent, initialState);
  const [heroIsVideo, setHeroIsVideo] = useState(isVideoUrl(content.heroImage));
  const [armadilloIsVideo, setArmadilloIsVideo] = useState(isVideoUrl(content.armadilloImage));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Order below matches top-to-bottom order on the live page. */}

      <div className={sectionClass}>
        <SectionHeader n={1} title="Hero" hint="First thing visitors see — full-screen photo or video." />
        <div>
          <label className={labelClass}>Title</label>
          <textarea name="heroTitle" defaultValue={content.heroTitle} rows={2} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <textarea name="heroSubtitle" defaultValue={content.heroSubtitle} rows={2} className={fieldClass} />
        </div>
        <ImagePicker
          name="heroImage"
          label="Background photo or video"
          initialUrl={content.heroImage}
          mediaLibrary={mediaLibrary}
          kinds={["photo", "video"]}
          onChange={(url) => setHeroIsVideo(isVideoUrl(url))}
        />
        {heroIsVideo && (
          <ImagePicker
            name="heroImageMobile"
            label="Mobile video (optional — falls back to the video above if left empty)"
            initialUrl={content.heroImageMobile}
            mediaLibrary={mediaLibrary}
            kinds={["video"]}
          />
        )}
      </div>

      <div className={sectionClass}>
        <SectionHeader n={2} title="Intro statement" hint="Small label + big statement + Contact Us button, right below the hero." />
        <div>
          <label className={labelClass}>Small label text</label>
          <textarea name="introLabel" defaultValue={content.introLabel} rows={2} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Statement</label>
          <textarea name="introStatement" defaultValue={content.introStatement} rows={3} className={fieldClass} />
        </div>
        <div className="flex flex-wrap gap-6">
          <ImagePicker name="introImageLeft" label="Left photo" initialUrl={content.introImageLeft} mediaLibrary={mediaLibrary} />
          <ImagePicker name="introImageRight" label="Right photo" initialUrl={content.introImageRight} mediaLibrary={mediaLibrary} />
        </div>
      </div>

      <div className={sectionClass}>
        <SectionHeader
          n={3}
          title="Resonance Chamber — Armadillo 2.0"
          hint="Heading + text + the INSIDE/OUTSIDE photo pair. This text is also reused lower down in the oversized “BUILD TO HEAL” section."
        />
        <div>
          <label className={labelClass}>Text</label>
          <textarea name="resonanceText" defaultValue={content.resonanceText} rows={4} className={fieldClass} />
        </div>
        <div className="flex flex-wrap gap-6">
          <ImagePicker name="resonanceImage1" label="Left photo (INSIDE)" initialUrl={content.resonanceImage1} mediaLibrary={mediaLibrary} />
          <ImagePicker name="resonanceImage2" label="Right photo (OUTSIDE)" initialUrl={content.resonanceImage2} mediaLibrary={mediaLibrary} />
        </div>
      </div>

      <div className={sectionClass}>
        <SectionHeader n={4} title="Armadillo 2.0 feature" hint="Full-height (100vh) photo or video with ARMADILLO / 2.0 overlaid top-left." />
        <ImagePicker
          name="armadilloImage"
          label="Background photo or video"
          initialUrl={content.armadilloImage}
          mediaLibrary={mediaLibrary}
          kinds={["photo", "video"]}
          onChange={(url) => setArmadilloIsVideo(isVideoUrl(url))}
        />
        {armadilloIsVideo && (
          <ImagePicker
            name="armadilloImageMobile"
            label="Mobile video (optional — falls back to the video above if left empty)"
            initialUrl={content.armadilloImageMobile}
            mediaLibrary={mediaLibrary}
            kinds={["video"]}
          />
        )}
      </div>

      <div className={sectionClass}>
        <SectionHeader n={5} title="Resonance Chamber window" hint="Split panel: photo on the left, logo + heading + text on the right." />
        <ImagePicker name="windowImage" label="Photo (left half)" initialUrl={content.windowImage} mediaLibrary={mediaLibrary} />
        <div>
          <label className={labelClass}>Heading</label>
          <input type="text" name="windowHeading" defaultValue={content.windowHeading} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea name="windowText" defaultValue={content.windowText} rows={4} className={fieldClass} />
        </div>
      </div>

      <div className={sectionClass}>
        <SectionHeader n={6} title="Built to Heal" hint="Closing section: intro text + the 4-photo gallery grid, above the READ MORE cards." />
        <div>
          <label className={labelClass}>Text</label>
          <textarea name="aboutText" defaultValue={content.aboutText} rows={4} className={fieldClass} />
        </div>
        <div className="flex flex-wrap gap-6">
          {[0, 1, 2, 3].map((i) => (
            <ImagePicker
              key={i}
              name={`gallery-${i}`}
              label={`Photo ${i + 1}`}
              initialUrl={content.gallery[i] ?? ""}
              mediaLibrary={mediaLibrary}
            />
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-6 py-2.5 text-sm font-medium disabled:opacity-50"
        style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
