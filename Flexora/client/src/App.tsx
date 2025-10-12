import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Route, Switch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "./pages/Home";
import ImageTools from "./pages/ImageTools";
import VideoTools from "./pages/VideoTools";
import DocumentEditor from "./pages/DocumentEditor";
import Converters from "./pages/Converters";
import AIWriting from "./pages/AIWriting";
import Utilities from "./pages/Utilities";
import FileConverter from "./pages/FileConverter";
import Roadmap from "./pages/Roadmap";
import Health from "./pages/Health";
import AllTools from "./pages/AllTools";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/image-tools" component={ImageTools} />
            <Route path="/video-tools" component={VideoTools} />
            <Route path="/document-editor" component={DocumentEditor} />
            <Route path="/converters" component={Converters} />
            <Route path="/ai-writing" component={AIWriting} />
            <Route path="/utilities" component={Utilities} />
            <Route path="/file-converter" component={FileConverter} />
            <Route path="/roadmap" component={Roadmap} />
            <Route path="/health" component={Health} />
            <Route path="/all-tools" component={AllTools} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
