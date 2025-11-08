"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navigationItems = [
  { name: "Image Tools", href: "/image-tools", icon: null, gradient: "from-blue-500 to-cyan-500" },
  { name: "Video Tools", href: "/video-tools", icon: null, gradient: "from-purple-500 to-pink-500" },
  { name: "Document Editor", href: "/document-editor", icon: null, gradient: "from-green-500 to-emerald-500" },
  { name: "Converters", href: "/converters", icon: null, gradient: "from-orange-500 to-red-500" },
  { name: "AI Writing", href: "/ai-writing", icon: null, gradient: "from-pink-500 to-rose-500" },
  { name: "Utilities", href: "/utilities", icon: null, gradient: "from-cyan-500 to-blue-500" },
  { name: "File Converter", href: "/file-converter", icon: null, gradient: "from-indigo-500 to-purple-500" },
  { name: "All Tools", href: "/all-tools", icon: null, gradient: "from-gray-500 to-gray-600" },
];

interface NavigationProps {
  title?: string;
  showBackButton?: boolean;
}

export default function Navigation({ title, showBackButton = true }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    if (title) return title;
    
    const pathToTitle: Record<string, string> = {
      "/": "Home",
      "/image-tools": "Image Processing Tools",
      "/video-tools": "Video Processing Tools",
      "/document-editor": "Document Editor",
      "/converters": "Universal Converters",
      "/ai-writing": "AI Writing Suite",
      "/utilities": "Utility Tools",
      "/file-converter": "File Converter",
      "/all-tools": "All Tools",
    };
    
    return pathToTitle[pathname] || "FLEXORA";
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button */}
          <div className="flex items-center gap-4">
            {showBackButton && pathname !== "/" && (
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            )}
          </div>

          {/* Center - Page Title */}
          <h1 className="text-xl font-semibold hidden md:block">{getPageTitle()}</h1>

          {/* Right side - Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 ml-8 flex-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                      pathname === item.href
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                        : `text-gray-700 hover:bg-gradient-to-r hover:${item.gradient} hover:text-white hover:shadow-md`
                    }`}
                  >
                    <span className="font-medium text-sm">{item.name}</span>
                  </Button>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t mt-4 pt-4">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="relative group"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-300 ${
                        pathname === item.href
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : `text-gray-700 hover:bg-gradient-to-r hover:${item.gradient} hover:text-white hover:shadow-md`
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="font-medium">{item.name}</span>
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}