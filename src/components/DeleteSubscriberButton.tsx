"use client";

import { useTransition } from "react";
import { deleteSubscriber } from "@/app/actions/subscribe";

export default function DeleteSubscriberButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Remove this subscriber?")) return;
    startTransition(() => {
      deleteSubscriber(email);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
