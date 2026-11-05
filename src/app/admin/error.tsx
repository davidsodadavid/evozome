"use client";

import { useEffect } from "react";

// Catches errors inside /admin — in particular "Failed to find Server
// Action" (https://nextjs.org/docs/messages/failed-to-find-server-action),
// which happens when an admin leaves a tab open across a deploy: the page's
// JS still references action IDs from the old build, so every click (e.g.
// Save) fails against the new one. Without this boundary that error just
// crashes to a blank/default error screen with no indication of what to do.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isStaleDeploy = /Failed to find Server Action/i.test(error.message);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold text-white">
        {isStaleDeploy ? "This page is out of date" : "Something went wrong"}
      </h1>
      <p className="max-w-sm text-sm text-white/60">
        {isStaleDeploy
          ? "The site was updated since this tab was opened, so this action couldn't go through. Refresh the page and try again — nothing was lost."
          : "An unexpected error occurred. You can try again, or refresh the page."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md px-6 py-2.5 text-sm font-medium"
          style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
        >
          Refresh page
        </button>
        {!isStaleDeploy && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/15"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
