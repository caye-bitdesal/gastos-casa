"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarFooter from "@/app/hogar/components/SidebarFooter";

const NAV_ITEMS = [
  {
    href: "/hogar/resumen",
    label: "Resumen",
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/hogar/gastos",
    label: "Gastos",
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 1.667v16.666l2.5-1.666 2.5 1.666 2.5-1.666 2.5 1.666V1.667l-2.5 1.666L10 1.667 7.5 3.333 5 1.667z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 7.5h5M7.5 10.833h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/hogar/reparto",
    label: "Reparto",
    icon: (
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M13.333 17.5v-1.667c0-.884-.351-1.732-.976-2.357A3.333 3.333 0 0 0 10 12.5H5a3.333 3.333 0 0 0-3.333 3.333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.833 5.833a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.333 17.5v-1.667a3.333 3.333 0 0 0-2.5-3.225M13.333 2.608a3.333 3.333 0 0 1 0 6.459" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HogarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="j-app">
      <aside className="j-sb" aria-label="Navegación principal">
        <div className="j-sb-logo">
          <svg width="32" height="26" viewBox="0 0 32 26" fill="none" aria-hidden="true">
            <ellipse cx="12" cy="14" rx="11" ry="12" fill="#4B68D8" opacity=".92" />
            <ellipse cx="20" cy="12" rx="11" ry="12" fill="#E8956D" opacity=".88" />
          </svg>
          <span className="j-logo-nm">Juntos</span>
        </div>

        <nav className="j-sb-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`j-ni${pathname === item.href || pathname.startsWith(item.href + "/") ? " active" : ""}`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <SidebarFooter />
      </aside>

      <main className="j-main">
        {children}
      </main>
    </div>
  );
}
