"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, FileText, MessageSquare, Languages, Briefcase, GraduationCap, Copy, Loader2 } from "lucide-react";
import { useState } from "react";

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
  const [language, setLanguage] = useState("english");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No input text",
        description: "Please enter some text to generate content",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setOutputText("");

    try {
      // Simulate AI generation with different outputs based on tab
      await new Promise(resolve => setTimeout(resolve, 2000));

      let generatedContent = "";
      
      switch (activeTab) {
        case "paraphrase":
          generatedContent = generateParaphrasedText(inputText, tone);
          break;
        case "blog":
          generatedContent = generateBlogPost(inputText, tone);
          break;
        case "social":
          generatedContent = generateSocialMediaPost(inputText, tone);
          break;
        case "translate":
          generatedContent = generateTranslation(inputText, language);
          break;
        default:
          generatedContent = "Generated content based on your input...";
      }

      setOutputText(generatedContent);
      toast({ title: "Content generated successfully!" });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "An error occurred while generating content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateParaphrasedText = (text: string, tone: string): string => {
    const paraphrases = {
      professional: `Here's a professionally rephrased version of your text: "${text}" - This version maintains the original meaning while adopting a more formal and business-appropriate tone suitable for professional communication.`,
      casual: `Here's your text in a more casual style: "${text}" - This version is more relaxed and conversational, perfect for informal settings and friendly communication.`,
      friendly: `Here's a friendly version of your text: "${text}" - This version is warm and approachable, making it great for building positive relationships.`,
      formal: `Here's a formal rendition of your text: "${text}" - This version adheres to strict formal conventions, ideal for academic and official correspondence.`
    };
    return paraphrases[tone as keyof typeof paraphrases] || paraphrases.professional;
  };

  const generateBlogPost = (topic: string, tone: string): string => {
    const blogIntros = {
      professional: `# ${topic}\n\nIn today's competitive landscape, understanding ${topic} has become increasingly crucial for professionals across various industries. This comprehensive guide explores the key aspects and implications of ${topic}, providing valuable insights for those seeking to enhance their knowledge and expertise in this area.\n\n## Key Considerations\n\nWhen examining ${topic}, several factors warrant careful consideration...`,
      casual: `# ${topic}: What You Need to Know!\n\nHey there! Ever wondered about ${topic}? You're in the right place! Let's dive into this fascinating topic and break it down in a way that actually makes sense.\n\n## First Things First\n\nSo, what's the big deal with ${topic}? Well, let me tell you...`,
      friendly: `# Let's Talk About ${topic}!\n\nHello, friends! Today we're going to explore something really interesting - ${topic}! Whether you're completely new to this topic or looking to learn more, I'm excited to share what I've discovered.\n\n## Why ${topic} Matters\n\nYou might be wondering why we're spending time on ${topic}. The truth is...`,
      formal: `# An Examination of ${topic}\n\nThe following analysis presents a formal examination of ${topic}, addressing its fundamental principles, practical applications, and broader implications within the contemporary context.\n\n## Introduction\n\n${topic} represents a significant area of study that warrants thorough investigation and scholarly consideration...`
    };
    return blogIntros[tone as keyof typeof blogIntros] || blogIntros.professional;
  };

  const generateSocialMediaPost = (content: string, tone: string): string => {
    const socialPosts = {
      professional: `📢 Excited to share insights on ${content}!\n\nIn today's professional landscape, ${content} plays a crucial role in driving success and innovation. Here are key takeaways:\n\n✅ Strategic importance\n✅ Practical applications\n✅ Future implications\n\n#ProfessionalDevelopment #${content.replace(/\s+/g, '')} #BusinessInsights`,
      casual: `Just thinking about ${content} and wow! 🤔\n\nIt's amazing how ${content} affects our daily lives. What are your thoughts?\n\nDrop a comment below! 👇\n\n#CasualChat #${content.replace(/\s+/g, '')} #RandomThoughts`,
      friendly: `Hey everyone! Let's chat about ${content}! 🌟\n\nI've been learning so much about ${content} lately and wanted to share my journey with you all. It's fascinating how ${content} connects to so many aspects of our lives!\n\nWhat's your experience with ${content}? Let's learn together! 💕\n\n#Community #Learning #${content.replace(/\s+/g, '')}`,
      formal: `Announcement: Discussion on ${content}\n\nWe are pleased to present a formal discourse on ${content}, addressing its significance and contemporary relevance.\n\nKey points of consideration:\n• Historical context\n• Current applications\n• Future prospects\n\nWe invite thoughtful engagement on this important topic.\n\n#FormalDiscussion #${content.replace(/\s+/g, '')} #ProfessionalDialogue`
    };
    return socialPosts[tone as keyof typeof socialPosts] || socialPosts.professional;
  };

  const generateTranslation = (text: string, targetLanguage: string): string => {
    const translations: Record<string, string> = {
      spanish: `[Spanish Translation] "${text}" - Esta es una traducción simulada al español. En una aplicación real, esto sería traducido por un servicio de traducción profesional.`,
      french: `[French Translation] "${text}" - Ceci est une traduction simulée en français. Dans une vraie application, ceci serait traduit par un service de traduction professionnel.`,
      german: `[German Translation] "${text}" - Dies ist eine simulierte Übersetzung ins Deutsche. In einer echten Anwendung würde dies von einem professionellen Übersetzungsdienst übersetzt.`,
      chinese: `[Chinese Translation] "${text}" - 这是模拟的中文翻译。在实际应用中，这将由专业翻译服务翻译。`,
      japanese: `[Japanese Translation] "${text}" - これはシミュレーションされた日本語翻訳です。実際のアプリケーションでは、プロの翻訳サービスによって翻訳されます。`,
      english: `[English Original] "${text}" - This is the original English text.`
    };
    return translations[targetLanguage] || translations.english;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({ title: "Copied to clipboard!" });
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
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
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
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
            >
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-2">
                  <tool.icon className="h-5 w-5 text-pink-500" />
                </div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <CardDescription className="text-sm">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">AI Writing Assistant</CardTitle>
            <CardDescription>Generate content with AI-powered tools</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="paraphrase">Paraphrase</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="translate">Translate</TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                {/* Settings */}
                <div className="grid md:grid-cols-2 gap-4">
                  {activeTab !== "translate" ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Language</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Input/Output Areas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea 
                      placeholder={
                        activeTab === "paraphrase" ? "Enter text to paraphrase..." :
                        activeTab === "blog" ? "Enter blog topic or outline..." :
                        activeTab === "social" ? "Enter content for social media post..." :
                        "Enter text to translate..."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea 
                      placeholder="Generated content will appear here..."
                      value={outputText}
                      readOnly
                      className="min-h-[200px]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !inputText.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCopy} 
                    disabled={!outputText}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </div>

                {/* Character Count */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Input: {inputText.length} characters</span>
                  <span>Output: {outputText.length} characters</span>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}