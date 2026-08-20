"use client";

import { useActionState } from "react";
import ImagePicker from "@/components/ImagePicker";
import { updateContent, type ContentFormState } from "@/app/actions/content";
import type { LandingContent } from "@/lib/content";

type MediaItem = { key: string; url: string; filename: string };

const initialState: ContentFormState = {};

const fieldClass =
  "w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-white/80";
const sectionClass = "flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5";
const sectionTitleClass = "text-sm font-semibold uppercase tracking-wider text-white/50";

export default function ContentForm({
  content,
  mediaLibrary,
}: {
  content: LandingContent;
  mediaLibrary: MediaItem[];
}) {
  const [state, formAction, pending] = useActionState(updateContent, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Hero</h2>
        <div>
          <label className={labelClass}>Title</label>
          <textarea name="heroTitle" defaultValue={content.heroTitle} rows={2} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <textarea name="heroSubtitle" defaultValue={content.heroSubtitle} rows={2} className={fieldClass} />
        </div>
        <ImagePicker name="heroImage" label="Background photo" initialUrl={content.heroImage} mediaLibrary={mediaLibrary} />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Resonance Chamber</h2>
        <div>
          <label className={labelClass}>Text</label>
          <textarea name="resonanceText" defaultValue={content.resonanceText} rows={4} className={fieldClass} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Full-bleed image</h2>
        <ImagePicker name="fullBleedImage" label="Photo" initialUrl={content.fullBleedImage} mediaLibrary={mediaLibrary} />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>&ldquo;Build to Heal&rdquo; background</h2>
        <ImagePicker name="buildToHealImage" label="Photo" initialUrl={content.buildToHealImage} mediaLibrary={mediaLibrary} />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Built to Heal — about</h2>
        <div>
          <label className={labelClass}>Text</label>
          <textarea name="aboutText" defaultValue={content.aboutText} rows={4} className={fieldClass} />
        </div>
        <div className="flex flex-wrap gap-6">
          <ImagePicker name="aboutImage1" label="Photo 1" initialUrl={content.aboutImage1} mediaLibrary={mediaLibrary} />
          <ImagePicker name="aboutImage2" label="Photo 2" initialUrl={content.aboutImage2} mediaLibrary={mediaLibrary} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Premium Modular Structure — 3 products</h2>
        <div className="flex flex-col gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-md border border-white/10 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    name={`product-${i}-title`}
                    defaultValue={content.products[i]?.title}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    name={`product-${i}-desc`}
                    defaultValue={content.products[i]?.desc}
                    className={fieldClass}
                  />
                </div>
              </div>
              <ImagePicker
                name={`product-${i}-img`}
                label="Photo"
                initialUrl={content.products[i]?.img ?? ""}
                mediaLibrary={mediaLibrary}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Armadillo 2.0 feature</h2>
        <div>
          <label className={labelClass}>Text</label>
          <textarea name="armadilloText" defaultValue={content.armadilloText} rows={3} className={fieldClass} />
        </div>
        <ImagePicker name="armadilloImage" label="Photo" initialUrl={content.armadilloImage} mediaLibrary={mediaLibrary} />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Outside gallery — 4 photos</h2>
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Contact</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="contactEmail" defaultValue={content.contactEmail} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" name="contactPhone" defaultValue={content.contactPhone} className={fieldClass} />
          </div>
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
