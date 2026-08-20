import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function AdminProductsPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Products</h1>
        <Link href="/admin" className="text-sm text-white/60 hover:text-white">
          ← Dashboard
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {PRODUCTS.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/5 p-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
                >
                  {product.status}
                </span>
                <span className="font-medium text-white">{product.name}</span>
              </div>
              <span className="text-xs text-white/50">{product.description}</span>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <Link href={product.href} className="text-sm text-white/60 hover:underline">
                View
              </Link>
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="text-sm font-medium text-white hover:underline"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
