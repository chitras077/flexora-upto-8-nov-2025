"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Image, 
  Video, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Wrench,
  FolderOpen,
  Search,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/image-tools", label: "Image Tools", icon: Image, gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-cyan-50" },
  { href: "/video-tools", label: "Video Tools", icon: Video, gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-50 to-pink-50" },
  { href: "/document-editor", label: "Document Editor", icon: FileText, gradient: "from-green-500 to-emerald-500", bgGradient: "from-green-50 to-emerald-50" },
  { href: "/converters", label: "Converters", icon: RefreshCw, gradient: "from-orange-500 to-red-500", bgGradient: "from-orange-50 to-red-50" },
  { href: "/ai-writing", label: "AI Writing", icon: Sparkles, gradient: "from-pink-500 to-rose-500", bgGradient: "from-pink-50 to-rose-50" },
  { href: "/utilities", label: "Utilities", icon: Wrench, gradient: "from-cyan-500 to-blue-500", bgGradient: "from-cyan-50 to-blue-50" },
  { href: "/file-converter", label: "File Converter", icon: FolderOpen, gradient: "from-indigo-500 to-purple-500", bgGradient: "from-indigo-50 to-purple-50" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FLEXORA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 ml-8 flex-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isActive(item.href)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : `text-gray-700 hover:bg-gradient-to-r hover:${item.gradient} hover:text-white hover:shadow-md`
                      }`}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`p-1 rounded-md ${
                          isActive(item.href)
                            ? "bg-white/20"
                            : "group-hover:bg-white/20"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive(item.href)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : `text-gray-700 hover:bg-gradient-to-r hover:${item.gradient} hover:text-white hover:shadow-md`
                      }`}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`p-2 rounded-lg ${
                          isActive(item.href)
                            ? "bg-white/20"
                            : "group-hover:bg-white/20"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;