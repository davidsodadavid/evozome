"use client";

import { useState } from "react";

export default function CopySubscribersButton({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(emails.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={emails.length === 0}
      className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
    >
      {copied ? "Copied!" : `Copy all emails (${emails.length})`}
    </button>
  );
}
