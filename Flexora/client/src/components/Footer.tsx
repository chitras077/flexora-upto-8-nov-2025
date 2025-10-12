import { Link } from "wouter";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="gradient-hero h-8 w-8 rounded-lg" />
              <span className="text-xl font-bold">Flexora</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The all-in-one platform for image, video, document processing, and more.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/image-tools" className="hover:text-primary transition-smooth">Image Processing</Link></li>
              <li><Link to="/video-tools" className="hover:text-primary transition-smooth">Video Processing</Link></li>
              <li><Link to="/document-editor" className="hover:text-primary transition-smooth">Document Editor</Link></li>
              <li><Link to="/file-converter" className="hover:text-primary transition-smooth">File Converter</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-smooth">About Us</Link></li>
              <li><Link to="/roadmap" className="hover:text-primary transition-smooth">Roadmap</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-smooth">Pricing</Link></li>
              <li><a href="/health" className="hover:text-primary transition-smooth">Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-smooth">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-smooth">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-smooth">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Flexora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
