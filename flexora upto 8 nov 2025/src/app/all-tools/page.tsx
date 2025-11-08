import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Image, 
  Video, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Wrench,
  FolderOpen,
  Search,
  Crop,
  RotateCw,
  Layers,
  Contrast,
  Sun,
  Droplets,
  ImagePlus,
  Scissors,
  FilePlus,
  Download
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Breadcrumbs from "@/components/Breadcrumbs";

const allTools = [
  {
    category: "Image Processing",
    color: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    tools: [
      { icon: Crop, name: "Crop & Resize", description: "Crop with aspect ratios and precise dimensions", href: "/image-tools" },
      { icon: RotateCw, name: "Rotate & Flip", description: "90° rotations and flip horizontally/vertically", href: "/image-tools" },
      { icon: Sparkles, name: "Auto Enhance", description: "AI-powered one-tap enhancement", href: "/image-tools" },
      { icon: Layers, name: "Layers & Masks", description: "Professional layer-based editing", href: "/image-tools" },
      { icon: Contrast, name: "Adjustments", description: "Exposure, contrast, and color balance", href: "/image-tools" },
      { icon: Sun, name: "Filters & Effects", description: "Apply beautiful filters and effects", href: "/image-tools" },
      { icon: Droplets, name: "Remove Background", description: "AI-powered background removal", href: "/image-tools" },
      { icon: ImagePlus, name: "Upscale", description: "AI image upscaling up to 4x", href: "/image-tools" },
    ],
  },
  {
    category: "Video Processing",
    color: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    tools: [
      { icon: Scissors, name: "Video Trimmer", description: "Trim and cut videos with precision", href: "/video-tools" },
      { icon: FilePlus, name: "Video Merger", description: "Merge multiple videos into one", href: "/video-tools" },
      { icon: Sparkles, name: "Video Effects", description: "Apply filters and effects to videos", href: "/video-tools" },
    ],
  },
  {
    category: "Document Editor",
    color: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    tools: [
      { icon: FileText, name: "Document Editor", description: "Create and edit documents", href: "/document-editor" },
    ],
  },
  {
    category: "Universal Converter",
    color: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
    tools: [
      { icon: RefreshCw, name: "Unit Converter", description: "Convert units and measurements", href: "/converters" },
    ],
  },
  {
    category: "AI Writing Suite",
    color: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50",
    tools: [
      { icon: Sparkles, name: "AI Content Generator", description: "Generate content with AI", href: "/ai-writing" },
    ],
  },
  {
    category: "Utility Tools",
    color: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-50 to-blue-50",
    tools: [
      { icon: Wrench, name: "Text Tools", description: "Text manipulation utilities", href: "/utilities" },
    ],
  },
  {
    category: "File Converter",
    color: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
    tools: [
      { icon: FolderOpen, name: "File Format Converter", description: "Convert between file formats", href: "/file-converter" },
      { icon: Download, name: "PDF to Word", description: "Convert PDF files to Word documents", href: "/file-converter" },
      { icon: Download, name: "Image Converter", description: "Convert images between formats", href: "/file-converter" },
    ],
  },
];

export default function AllToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [urlParams, setUrlParams] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchQuery(search);
        setUrlParams(search);
      }
    }
  }, []);

  const filteredTools = allTools.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Breadcrumbs />
      
      {/* Page Content */}
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              All Tools
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse all available tools across all categories
            </p>
            
            <div className="max-w-2xl">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search for tools (e.g. 'pdf to word')" 
                    className="h-12 pl-12 pr-4 text-base bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {searchQuery && (
                <motion.div 
                  className="mt-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Showing results for: <span className="font-medium text-blue-600">{searchQuery}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {filteredTools.map((category, categoryIndex) => (
            <motion.div 
              key={category.category} 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
            >
              <h2 className={`text-2xl font-semibold mb-6 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 + toolIndex * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link href={tool.href}>
                      <Card className={`hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border-0 bg-gradient-to-br ${category.bgGradient} group overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative">
                          <motion.div 
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-3 shadow-lg`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <tool.icon className="h-6 w-6 text-white" />
                          </motion.div>
                          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                            {tool.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 leading-relaxed">
                            {tool.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="flex items-center text-blue-600 font-medium group-hover:text-purple-600 transition-colors duration-300">
                            <span>Open Tool</span>
                            <motion.div
                              className="ml-1"
                              whileHover={{ x: 3 }}
                            >
                              →
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredTools.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-muted-foreground text-lg">No tools found matching your search.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}