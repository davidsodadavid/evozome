"use client";

import { useTransition } from "react";
import { deleteMedia } from "@/app/actions/media";

export default function DeleteMediaButton({ mediaKey }: { mediaKey: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this file? This can't be undone.")) return;
    startTransition(() => {
      deleteMedia(mediaKey);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
