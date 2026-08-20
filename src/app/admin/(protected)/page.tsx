import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="mb-2 text-xl font-semibold text-white">Dashboard</h1>
      <p className="mb-6 text-sm text-white/60">Welcome back.</p>

      <Link
        href="/admin/products"
        className="inline-flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-6 py-5 transition-colors hover:bg-white/10"
      >
        <span className="text-base font-semibold text-white">Products</span>
        <span className="text-sm text-white/60">
          {PRODUCTS.length} {PRODUCTS.length === 1 ? "product" : "products"}
        </span>
      </Link>
    </>
  );
}
