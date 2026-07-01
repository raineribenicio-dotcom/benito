import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Admin · Nuvora", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/cupones", label: "Cupones" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white p-4 sm:block">
          <a href="/admin" className="text-lg font-bold text-brand-700">
            Nuvora Admin
          </a>
          <nav className="mt-6 space-y-1">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a href="/" className="mt-8 block text-xs text-gray-400 hover:text-brand-600">
            ← Ver tienda
          </a>
        </aside>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
