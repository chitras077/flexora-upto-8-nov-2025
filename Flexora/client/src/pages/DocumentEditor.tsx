import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Table, Presentation, FileSpreadsheet, FileType, FileEdit, Save, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const tools = [
  { icon: FileText, name: "Word Processor", description: "Create and edit rich text documents" },
  { icon: Table, name: "Spreadsheets", description: "Excel-compatible spreadsheet editor" },
  { icon: Presentation, name: "Presentations", description: "Create stunning slide decks" },
  { icon: FileSpreadsheet, name: "PDF Editor", description: "Annotate, merge, and split PDFs" },
  { icon: FileType, name: "Markdown Editor", description: "Write in Markdown with live preview" },
  { icon: FileEdit, name: "Text Editor", description: "Fast, distraction-free text editing" },
];

export default function DocumentEditor() {
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Document saved successfully!" });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Document downloaded!" });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Document Editor Suite</h1>
          <p className="text-xl text-muted-foreground">
            Create, edit, and collaborate on documents, spreadsheets, and presentations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => (
            <Card 
              key={tool.name} 
              className="gradient-card hover:border-primary transition-smooth cursor-pointer"
              onClick={() => {
                const tabMap: Record<string, string> = {
                  "Word Processor": "text",
                  "Markdown Editor": "markdown",
                  "Text Editor": "text"
                };
                const tab = tabMap[tool.name];
                if (tab) setActiveTab(tab);
              }}
              data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                  <tool.icon className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle className="text-lg" data-testid={`text-tool-name-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>{tool.name}</CardTitle>
                <CardDescription className="text-sm" data-testid={`text-tool-description-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">Document Editor</CardTitle>
            <CardDescription>Create and edit your documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6" data-testid="tabs-document-editor">
                <TabsTrigger value="text" data-testid="tab-text">Text Editor</TabsTrigger>
                <TabsTrigger value="markdown" data-testid="tab-markdown">Markdown</TabsTrigger>
                <TabsTrigger value="rich" data-testid="tab-rich">Rich Text</TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <Textarea 
                  placeholder="Start typing your document here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono"
                  data-testid="textarea-content"
                />

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1" data-testid="button-save">
                    <Save className="h-4 w-4 mr-2" />
                    Save Document
                  </Button>
                  <Button onClick={handleDownload} variant="outline" className="flex-1" data-testid="button-download">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <TabsContent value="markdown" className="mt-4">
                  <div className="border rounded-lg p-4 bg-muted/50" data-testid="preview-area">
                    <h4 className="font-semibold mb-2">Preview</h4>
                    <div className="prose prose-sm" data-testid="text-preview-content">{content || "Nothing to preview yet..."}</div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
