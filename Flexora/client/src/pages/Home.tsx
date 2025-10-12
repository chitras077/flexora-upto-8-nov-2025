import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/CategoryCard";
import { 
  Image, 
  Video, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Wrench,
  FolderOpen,
  Search,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, FormEvent, MouseEvent } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  {
    title: "Image Processing",
    description: "Edit, enhance, and transform images with professional tools",
    icon: Image,
    href: "/image-tools",
    iconColor: "bg-blue-500",
  },
  {
    title: "Video Processing",
    description: "Trim, merge, and edit videos with ease",
    icon: Video,
    href: "/video-tools",
    iconColor: "bg-purple-500",
  },
  {
    title: "Document Editor",
    description: "Create and edit documents, spreadsheets, and presentations",
    icon: FileText,
    href: "/document-editor",
    iconColor: "bg-green-500",
  },
  {
    title: "Universal Converter",
    description: "Convert units, currencies, and more",
    icon: RefreshCw,
    href: "/converters",
    iconColor: "bg-orange-500",
  },
  {
    title: "AI Writing Suite",
    description: "Generate content with advanced AI tools",
    icon: Sparkles,
    href: "/ai-writing",
    iconColor: "bg-pink-500",
  },
  {
    title: "Utility Tools",
    description: "Text tools, data converters, and productivity utilities",
    icon: Wrench,
    href: "/utilities",
    iconColor: "bg-cyan-500",
  },
  {
    title: "File Converter",
    description: "Convert images, videos, and documents between formats",
    icon: FolderOpen,
    href: "/file-converter",
    iconColor: "bg-indigo-500",
  },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance for instant results",
  },
  {
    icon: TrendingUp,
    title: "Always Improving",
    description: "Regular updates with new features and tools",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Advanced AI capabilities across all tools",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/all-tools?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignIn = () => {
    toast({ title: "Sign In", description: "Sign in functionality coming soon!" });
  };

  const handleGetPremium = () => {
    toast({ title: "Get Premium", description: "Premium subscription coming soon!" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          {/* Sign In and Premium Buttons */}
          <div className="absolute top-0 right-4 flex gap-4 mt-4">
            <Button variant="outline" size="sm" onClick={handleSignIn} data-testid="button-sign-in">
              Sign In
            </Button>
            <Button variant="default" size="sm" onClick={handleGetPremium} data-testid="button-get-premium">
              Get Premium
            </Button>
          </div>
          
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              All Your Tools in{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                One Place
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Process images and videos, edit documents, convert files, and boost productivity with AI-powered tools
            </p>
            
            {/* Smart Search */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="What do you want to do today? (e.g. 'pdf to word')" 
                  className="h-14 pl-12 text-base shadow-medium"
                  data-testid="input-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  data-testid="button-search"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/all-tools">
                <Button variant="primary" size="xl" data-testid="button-view-tools">
                  View All Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Tools</h2>
            <p className="text-lg text-muted-foreground">
              Choose from 7 powerful categories with hundreds of tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.title} {...category} data-testid={`card-category-${category.title.toLowerCase().replace(/\s+/g, '-')}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Flexora?</h2>
            <p className="text-lg text-muted-foreground">
              Built for speed, security, and simplicity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="text-center space-y-4" data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold" data-testid={`text-feature-title-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>{feature.title}</h3>
                <p className="text-muted-foreground" data-testid={`text-feature-description-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See What's Coming Next</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Check out our public roadmap to see upcoming features and improvements
          </p>
          <Link to="/roadmap" data-testid="link-roadmap">
            <Button variant="hero" size="lg" data-testid="button-view-roadmap">
              View Roadmap
            </Button>
          </Link>
        </div>
      </section>


    </div>
  );
}
