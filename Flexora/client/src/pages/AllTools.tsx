import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Link, useLocation } from "wouter";
import { useState, useEffect, FormEvent } from "react";

const allTools = [
  {
    category: "Image Processing",
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
    tools: [
      { icon: Scissors, name: "Video Trimmer", description: "Trim and cut videos with precision", href: "/video-tools" },
      { icon: FilePlus, name: "Video Merger", description: "Merge multiple videos into one", href: "/video-tools" },
      { icon: Sparkles, name: "Video Effects", description: "Apply filters and effects to videos", href: "/video-tools" },
    ],
  },
  {
    category: "Document Editor",
    tools: [
      { icon: FileText, name: "Document Editor", description: "Create and edit documents", href: "/document-editor" },
    ],
  },
  {
    category: "Universal Converter",
    tools: [
      { icon: RefreshCw, name: "Unit Converter", description: "Convert units and measurements", href: "/converters" },
    ],
  },
  {
    category: "AI Writing Suite",
    tools: [
      { icon: Sparkles, name: "AI Content Generator", description: "Generate content with AI", href: "/ai-writing" },
    ],
  },
  {
    category: "Utility Tools",
    tools: [
      { icon: Wrench, name: "Text Tools", description: "Text manipulation utilities", href: "/utilities" },
    ],
  },
  {
    category: "File Converter",
    tools: [
      { icon: FolderOpen, name: "File Format Converter", description: "Convert between file formats", href: "/file-converter" },
      { icon: Download, name: "PDF to Word", description: "Convert PDF files to Word documents", href: "/file-converter" },
      { icon: Download, name: "Image Converter", description: "Convert images between formats", href: "/file-converter" },
    ],
  },
];

export default function AllTools() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [location]);

  const filteredTools = allTools.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Tools</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Browse all available tools across all categories
          </p>
          
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for tools (e.g. 'pdf to word')" 
                className="h-12 pl-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-tools"
              />
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-muted-foreground">
                Showing results for: <span className="font-medium">{searchQuery}</span>
              </div>
            )}
          </div>
        </div>

        {filteredTools.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.tools.map((tool) => (
                <Link key={tool.name} to={tool.href}>
                  <Card className="gradient-card hover:border-primary transition-smooth cursor-pointer h-full" data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription className="text-sm">{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tools found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
