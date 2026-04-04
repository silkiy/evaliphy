"use client";

import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DocSection {
  title: string;
  id: string;
}

interface DocItem {
  slug: string;
  title: string;
  sections?: DocSection[];
}

interface SidebarProps {
  docs: DocItem[];
}

export function Sidebar({ docs }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-24 space-y-8">
      <div>
        <p className="px-3 mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Getting Started
        </p>
        <div className="space-y-1">
          {docs.map((doc) => {
            const isActive = pathname === `/docs/${doc.slug}`;
            return (
              <div key={doc.slug} className="space-y-1">
                <Link
                  href={`/docs/${doc.slug}`}
                  className={clsx(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-zinc-900 bg-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  <ChevronRight
                    className={clsx(
                      "mr-2 h-4 w-4 transition-transform",
                      isActive ? "rotate-90 text-zinc-900" : "text-zinc-400 group-hover:text-zinc-500"
                    )}
                  />
                  {doc.title}
                </Link>
                {isActive && doc.sections && doc.sections.length > 0 && (
                  <div className="ml-9 space-y-1 border-l border-zinc-200">
                    {doc.sections.map((section) => (
                      <Link
                        key={section.id}
                        href={`/docs/${doc.slug}#${section.id}`}
                        className="block border-l border-transparent px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors"
                      >
                        {section.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
