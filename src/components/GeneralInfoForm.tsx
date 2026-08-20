"use client";

import { useActionState } from "react";
import { updateGeneralInfo, type ContentFormState } from "@/app/actions/content";

const initialState: ContentFormState = {};

const fieldClass =
  "w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-white/80";

export default function GeneralInfoForm({
  contactEmail,
  contactPhone,
}: {
  contactEmail: string;
  contactPhone: string;
}) {
  const [state, formAction, pending] = useActionState(updateGeneralInfo, initialState);

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
    >
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" name="contactEmail" defaultValue={contactEmail} className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input type="text" name="contactPhone" defaultValue={contactPhone} className={fieldClass} />
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
