import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Hash, Palette, QrCode, Link2, Lock, Mail, Clipboard, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const utilities = [
  { icon: Type, name: "Text Tools", description: "Case converter, word counter, text cleaner" },
  { icon: Hash, name: "Hash Generator", description: "MD5, SHA-1, SHA-256, and more" },
  { icon: Palette, name: "Color Converter", description: "HEX, RGB, HSL color conversions" },
  { icon: QrCode, name: "QR Code Generator", description: "Create custom QR codes" },
  { icon: Link2, name: "URL Shortener", description: "Shorten and track links" },
  { icon: Lock, name: "Password Generator", description: "Generate secure passwords" },
  { icon: Mail, name: "Email Extractor", description: "Extract emails from text" },
  { icon: Clipboard, name: "Clipboard Manager", description: "Enhanced clipboard history" },
];

export default function Utilities() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState("case");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const { toast } = useToast();

  const handleCaseConvert = (type: string) => {
    switch(type) {
      case "upper":
        setResult(text.toUpperCase());
        break;
      case "lower":
        setResult(text.toLowerCase());
        break;
      case "title":
        setResult(text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
        break;
    }
    toast({ title: "Text converted!" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Copied to clipboard!" });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResult(password);
    toast({ title: "Password generated!" });
  };

  const generateHash = async (algorithm: string) => {
    if (!text) {
      toast({ title: "Error", description: "Please enter text to hash", variant: "destructive" });
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setResult(hashHex);
      toast({ title: `${algorithm} hash generated!` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate hash", variant: "destructive" });
    }
  };

  const handleBase64Encode = () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const base64 = btoa(String.fromCharCode(...data));
      setResult(base64);
      toast({ title: "Text encoded to Base64!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to encode text", variant: "destructive" });
    }
  };

  const handleBase64Decode = () => {
    try {
      const binary = atob(text);
      const bytes = new Uint8Array([...binary].map(char => char.charCodeAt(0)));
      const decoder = new TextDecoder();
      const decoded = decoder.decode(bytes);
      setResult(decoded);
      toast({ title: "Base64 decoded!" });
    } catch (error) {
      toast({ title: "Error", description: "Invalid Base64 string", variant: "destructive" });
    }
  };

  const handleUrlEncode = () => {
    setResult(encodeURIComponent(text));
    toast({ title: "URL encoded!" });
  };

  const handleUrlDecode = () => {
    try {
      setResult(decodeURIComponent(text));
      toast({ title: "URL decoded!" });
    } catch (error) {
      toast({ title: "Error", description: "Invalid URL encoded string", variant: "destructive" });
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      toast({ title: "JSON formatted!" });
    } catch (error) {
      toast({ title: "Error", description: "Invalid JSON", variant: "destructive" });
      setJsonOutput("Invalid JSON");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      toast({ title: "JSON minified!" });
    } catch (error) {
      toast({ title: "Error", description: "Invalid JSON", variant: "destructive" });
      setJsonOutput("Invalid JSON");
    }
  };

  const handleWordCount = () => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    setResult(`Words: ${words}\nCharacters: ${chars}\nCharacters (no spaces): ${charsNoSpaces}`);
    toast({ title: "Word count calculated!" });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Utility Tools Suite</h1>
          <p className="text-xl text-muted-foreground">
            Essential productivity tools for everyday tasks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {utilities.map((utility) => (
            <Card 
              key={utility.name} 
              className="gradient-card hover:border-primary transition-smooth cursor-pointer"
              onClick={() => {
                const tabMap: Record<string, string> = {
                  "Text Tools": "case",
                  "Hash Generator": "hash",
                  "Password Generator": "password",
                  "Color Converter": "color"
                };
                const tab = tabMap[utility.name];
                if (tab) setActiveTab(tab);
              }}
            >
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-2">
                  <utility.icon className="h-5 w-5 text-cyan-500" />
                </div>
                <CardTitle className="text-lg">{utility.name}</CardTitle>
                <CardDescription className="text-sm">{utility.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">Utility Tools</CardTitle>
            <CardDescription>Quick tools for everyday tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
                <TabsTrigger value="case" data-testid="tab-case">Case</TabsTrigger>
                <TabsTrigger value="hash" data-testid="tab-hash">Hash</TabsTrigger>
                <TabsTrigger value="password" data-testid="tab-password">Password</TabsTrigger>
                <TabsTrigger value="base64" data-testid="tab-base64">Base64</TabsTrigger>
                <TabsTrigger value="url" data-testid="tab-url">URL</TabsTrigger>
                <TabsTrigger value="json" data-testid="tab-json">JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="case" className="space-y-4">
                <Textarea 
                  placeholder="Enter text to convert..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[150px]"
                  data-testid="textarea-case-input"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => handleCaseConvert("upper")} data-testid="button-uppercase">UPPERCASE</Button>
                  <Button onClick={() => handleCaseConvert("lower")} data-testid="button-lowercase">lowercase</Button>
                  <Button onClick={() => handleCaseConvert("title")} data-testid="button-titlecase">Title Case</Button>
                </div>
                <Button variant="outline" onClick={handleWordCount} data-testid="button-word-count">
                  Word Count
                </Button>
                {result && (
                  <div className="space-y-2">
                    <Textarea value={result} readOnly className="min-h-[100px]" data-testid="textarea-result" />
                    <Button variant="outline" onClick={handleCopy} className="w-full" data-testid="button-copy">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <p className="text-sm text-muted-foreground">Generate a secure random password</p>
                <Button onClick={generatePassword} className="w-full" variant="hero" data-testid="button-generate-password">
                  <Lock className="h-4 w-4 mr-2" />
                  Generate Password
                </Button>
                {result && (
                  <div className="space-y-2">
                    <Input value={result} readOnly className="font-mono" data-testid="input-password-result" />
                    <Button variant="outline" onClick={handleCopy} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Password
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hash" className="space-y-4">
                <p className="text-sm text-muted-foreground">Generate cryptographic hash from text</p>
                <Textarea 
                  placeholder="Enter text to hash..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  data-testid="textarea-hash-input"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => generateHash("SHA-256")} data-testid="button-sha256">SHA-256</Button>
                  <Button onClick={() => generateHash("SHA-384")} data-testid="button-sha384">SHA-384</Button>
                  <Button onClick={() => generateHash("SHA-512")} data-testid="button-sha512">SHA-512</Button>
                  <Button onClick={() => generateHash("SHA-1")} variant="outline" data-testid="button-sha1">SHA-1</Button>
                </div>
                {result && (
                  <div className="space-y-2">
                    <Textarea value={result} readOnly className="min-h-[100px] font-mono text-xs" data-testid="textarea-hash-result" />
                    <Button variant="outline" onClick={handleCopy} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Hash
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="base64" className="space-y-4">
                <p className="text-sm text-muted-foreground">Encode or decode Base64</p>
                <Textarea 
                  placeholder="Enter text..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  data-testid="textarea-base64-input"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleBase64Encode} data-testid="button-base64-encode">Encode</Button>
                  <Button onClick={handleBase64Decode} variant="outline" data-testid="button-base64-decode">Decode</Button>
                </div>
                {result && (
                  <div className="space-y-2">
                    <Textarea value={result} readOnly className="min-h-[100px] font-mono text-sm" data-testid="textarea-base64-result" />
                    <Button variant="outline" onClick={handleCopy} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <p className="text-sm text-muted-foreground">Encode or decode URL strings</p>
                <Textarea 
                  placeholder="Enter URL or text..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  data-testid="textarea-url-input"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleUrlEncode} data-testid="button-url-encode">Encode</Button>
                  <Button onClick={handleUrlDecode} variant="outline" data-testid="button-url-decode">Decode</Button>
                </div>
                {result && (
                  <div className="space-y-2">
                    <Textarea value={result} readOnly className="min-h-[100px]" data-testid="textarea-url-result" />
                    <Button variant="outline" onClick={handleCopy} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Result
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <p className="text-sm text-muted-foreground">Format and validate JSON</p>
                <Textarea 
                  placeholder='{"key": "value"}'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                  data-testid="textarea-json-input"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={formatJson} data-testid="button-json-format">Format JSON</Button>
                  <Button onClick={minifyJson} variant="outline" data-testid="button-json-minify">Minify JSON</Button>
                </div>
                {jsonOutput && (
                  <div className="space-y-2">
                    <Textarea value={jsonOutput} readOnly className="min-h-[150px] font-mono text-sm" data-testid="textarea-json-output" />
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText(jsonOutput);
                      toast({ title: "Copied to clipboard!" });
                    }} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
