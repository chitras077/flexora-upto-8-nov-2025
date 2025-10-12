import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, FileText, Upload, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const imageFormats = ["PNG", "JPG", "WebP"];
const videoFormats = ["MP4", "WEBM"];
const documentFormats = ["PDF", "TXT"];

export default function FileConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [activeTab, setActiveTab] = useState("image");
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOutputFormat("");
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const convertImage = async () => {
    if (!selectedFile || !outputFormat) return;
    
    setConverting(true);
    const objectUrl = URL.createObjectURL(selectedFile);
    
    try {
      const img = document.createElement('img');
      img.src = objectUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }
      
      ctx.drawImage(img, 0, 0);
      
      const mimeType = outputFormat.toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${outputFormat.toLowerCase()}`;
      const quality = outputFormat.toLowerCase() === 'jpg' ? 0.92 : 0.95;
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast({ 
            title: "Error", 
            description: `Failed to convert to ${outputFormat}. This format may not be supported by your browser.`, 
            variant: "destructive" 
          });
          setConverting(false);
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${outputFormat.toLowerCase()}`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Success!", description: `Image converted to ${outputFormat}` });
        setConverting(false);
      }, mimeType, quality);
    } catch (error) {
      toast({ title: "Error", description: "Failed to convert image", variant: "destructive" });
      setConverting(false);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">File Converter</h1>
          <p className="text-xl text-muted-foreground">
            Convert images, videos, and documents between formats
          </p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl">Convert Files</CardTitle>
            <CardDescription>Upload a file and choose output format</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="image" data-testid="tab-image">
                  <Image className="h-4 w-4 mr-2" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="video" data-testid="tab-video">
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger value="document" data-testid="tab-document">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-file-upload"
                    data-testid="input-image-upload"
                  />
                  <label htmlFor="image-file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload an image</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-filename">
                      {selectedFile ? selectedFile.name : "Drag and drop or click to browse"}
                    </p>
                  </label>
                </div>

                {selectedFile && filePreview && (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border">
                      <img src={filePreview} alt="Preview" className="w-full max-h-64 object-contain" data-testid="image-preview" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-3">Convert to:</h3>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {imageFormats.map((format) => (
                          <Button
                            key={format}
                            variant={outputFormat === format ? "default" : "outline"}
                            onClick={() => setOutputFormat(format)}
                            size="sm"
                            data-testid={`button-format-${format.toLowerCase()}`}
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-file-upload"
                    data-testid="input-video-upload"
                  />
                  <label htmlFor="video-file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload a video</p>
                    <p className="text-sm text-muted-foreground">
                      Video conversion requires server-side processing (coming soon)
                    </p>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="document" className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                  <input 
                    type="file" 
                    accept=".doc,.docx,.pdf,.txt,.xlsx,.pptx,.rtf,.odt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-file-upload"
                    data-testid="input-document-upload"
                  />
                  <label htmlFor="document-file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload a document</p>
                    <p className="text-sm text-muted-foreground">
                      Document conversion requires server-side processing (coming soon)
                    </p>
                  </label>
                </div>
              </TabsContent>
            </Tabs>

            {selectedFile && outputFormat && activeTab === "image" && (
              <div className="mt-6 pt-6 border-t">
                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  onClick={convertImage}
                  disabled={converting}
                  data-testid="button-convert"
                >
                  {converting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Convert and Download
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
