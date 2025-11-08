"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumbs = () => {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === "/") return null;

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/" }
    ];

    // Build breadcrumb items from path segments
    let currentPath = "";
    const pathLabels: { [key: string]: string } = {
      "image-tools": "Image Tools",
      "video-tools": "Video Tools", 
      "document-editor": "Document Editor",
      "converters": "Converters",
      "ai-writing": "AI Writing",
      "utilities": "Utility Tools",
      "file-converter": "File Converter",
      "all-tools": "All Tools"
    };

    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground py-4 px-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.href || item.label}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className={`flex items-center space-x-1 hover:text-foreground transition-colors ${
                index === 0 ? "text-blue-600 hover:text-blue-700" : ""
              }`}
            >
              {index === 0 && <Home className="h-4 w-4" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;