"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileTopNav({ items }) {
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const node = navRef.current;
    if (!node) return;

    const updateOffset = () => {
      const rect = node.getBoundingClientRect();
      const offset = Math.ceil(rect.bottom);
      document.documentElement.style.setProperty(
        "--mobile-topnav-offset",
        `${offset}px`
      );
    };

    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(node);
    window.addEventListener("resize", updateOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOffset);
      document.documentElement.style.setProperty("--mobile-topnav-offset", "0px");
    };
  }, []);

  useEffect(() => {
    if (optimisticPath && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [optimisticPath, pathname]);

  return (
    <nav
      ref={navRef}
      className="fixed top-2 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 lg:hidden"
    >
      <div className="flex items-center justify-between gap-2 rounded-full bg-slate-900/95 px-3 py-2 shadow-xl ring-1 ring-slate-900/20">
        {items.map((item) => {
          const currentPath = optimisticPath || pathname;
          const isActive = currentPath === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onPointerDown={() => setOptimisticPath(item.href)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setOptimisticPath(item.href);
                }
              }}
              onClick={() => setOptimisticPath(item.href)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold leading-tight transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-gray-300 opacity-100 "
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
