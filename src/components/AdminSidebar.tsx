"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/media", label: "Media" },
];

const BG = "rgb(20,21,22)";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden"
        style={{ backgroundColor: BG }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/evozome/logo-light.png" alt="" width={20} height={20} />
          <span className="text-xs font-bold tracking-[0.22em]">EVOZOME</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-1 text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="flex h-full w-full flex-col p-6" style={{ backgroundColor: BG }}>
            <div className="mb-6 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <img src="/evozome/logo-light.png" alt="" width={20} height={20} />
                <span className="text-xs font-bold tracking-[0.22em]">EVOZOME</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-1 text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>
            <SidebarLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <aside
        className="hidden shrink-0 flex-col border-r border-white/10 p-6 md:flex md:w-56"
        style={{ backgroundColor: BG }}
      >
        <Link href="/admin" className="mb-6 flex items-center gap-2">
          <img src="/evozome/logo-light.png" alt="" width={20} height={20} />
          <span className="text-xs font-bold tracking-[0.22em]">EVOZOME</span>
        </Link>
        <SidebarLinks pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col justify-between">
      <div className="flex flex-col gap-1">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Dashboard
        </div>
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-4 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
        >
          View site
        </Link>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          Log out
        </button>
      </form>
    </nav>
  );
}
