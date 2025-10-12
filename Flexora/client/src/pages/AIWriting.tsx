import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, MessageSquare, Languages, Briefcase, GraduationCap, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const tools = [
  { icon: FileText, name: "Blog Writer", description: "Generate engaging blog posts and articles" },
  { icon: MessageSquare, name: "Social Media", description: "Create posts for all platforms" },
  { icon: Sparkles, name: "Paraphraser", description: "Rewrite text in different styles" },
  { icon: Languages, name: "Translator", description: "Translate to 100+ languages" },
  { icon: Briefcase, name: "Business Writing", description: "Emails, reports, and proposals" },
  { icon: GraduationCap, name: "Academic", description: "Essays, research, and citations" },
];

export default function AIWriting() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeTab, setActiveTab] = useState("paraphrase");
  const [tone, setTone] = useState("professional");
  const { toast } = useToast();

  const handleGenerate = () => {
    // Simulate AI generation
    setOutputText(`Generated ${activeTab} content based on your input with ${tone} tone...`);
    toast({ title: "Content generated successfully!" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Writing & Productivity Suite</h1>
          <p className="text-xl text-muted-foreground">
            AI-powered writing tools for content creation and productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => (
            <Card 
              key={tool.name} 
              className="gradient-card hover:border-primary transition-smooth cursor-pointer"
              onClick={() => {
                const tabMap: Record<string, string> = {
                  "Blog Writer": "blog",
                  "Paraphraser": "paraphrase",
                  "Translator": "translate",
                  "Social Media": "social"
                };
                const tab = tabMap[tool.name];
                if (tab) setActiveTab(tab);
              }}
              data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-2">
                  <tool.icon className="h-5 w-5 text-pink-500" />
                </div>
                <CardTitle className="text-lg" data-testid={`text-tool-name-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>{tool.name}</CardTitle>
                <CardDescription className="text-sm" data-testid={`text-tool-description-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">AI Writing Assistant</CardTitle>
            <CardDescription>Generate content with AI-powered tools</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6" data-testid="tabs-ai-writing">
                <TabsTrigger value="paraphrase" data-testid="tab-paraphrase">Paraphrase</TabsTrigger>
                <TabsTrigger value="blog" data-testid="tab-blog">Blog</TabsTrigger>
                <TabsTrigger value="social" data-testid="tab-social">Social</TabsTrigger>
                <TabsTrigger value="translate" data-testid="tab-translate">Translate</TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger data-testid="select-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional" data-testid="select-tone-professional">Professional</SelectItem>
                      <SelectItem value="casual" data-testid="select-tone-casual">Casual</SelectItem>
                      <SelectItem value="friendly" data-testid="select-tone-friendly">Friendly</SelectItem>
                      <SelectItem value="formal" data-testid="select-tone-formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea 
                      placeholder="Enter your text here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px]"
                      data-testid="textarea-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea 
                      placeholder="Generated content will appear here..."
                      value={outputText}
                      readOnly
                      className="min-h-[200px]"
                      data-testid="textarea-output"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleGenerate} variant="hero" data-testid="button-generate">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                  <Button variant="outline" onClick={handleCopy} disabled={!outputText} data-testid="button-copy">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
