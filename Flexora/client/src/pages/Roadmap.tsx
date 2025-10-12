import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";

const roadmapItems = [
  {
    status: "completed",
    version: "v1.0",
    title: "Core Platform Launch",
    description: "Launch of the main platform with 7 tool categories",
    date: "January 2025",
    features: [
      "Image processing tools",
      "Video editing capabilities",
      "Document editor",
      "File converters",
      "AI writing suite",
      "Utility tools collection"
    ]
  },
  {
    status: "in-progress",
    version: "v1.5",
    title: "Enhanced AI Features",
    description: "Advanced AI capabilities across all tools",
    date: "Q1 2025",
    features: [
      "AI-powered image upscaling (up to 4x)",
      "Smart background removal",
      "Auto video stabilization",
      "AI content generation improvements",
      "Batch processing with AI optimization"
    ]
  },
  {
    status: "in-progress",
    version: "v1.8",
    title: "Collaboration & Cloud Sync",
    description: "Real-time collaboration and cloud storage",
    date: "Q2 2025",
    features: [
      "Real-time document collaboration",
      "Cloud storage integration",
      "Version history and backups",
      "Team workspaces",
      "Shared project folders"
    ]
  },
  {
    status: "upcoming",
    version: "v2.0",
    title: "Mobile Apps",
    description: "Native iOS and Android applications",
    date: "Q2 2025",
    features: [
      "Full-featured iOS app",
      "Full-featured Android app",
      "Cross-platform sync",
      "Mobile-optimized tools",
      "Offline mode support"
    ]
  },
  {
    status: "upcoming",
    version: "v2.5",
    title: "Advanced Video Tools",
    description: "Professional-grade video editing features",
    date: "Q3 2025",
    features: [
      "Multi-track timeline editor",
      "Green screen effects",
      "Motion tracking",
      "4K video support",
      "Advanced color grading",
      "Audio mixing and effects"
    ]
  },
  {
    status: "upcoming",
    version: "v3.0",
    title: "Developer API & Integrations",
    description: "Public API and third-party integrations",
    date: "Q4 2025",
    features: [
      "RESTful API for all tools",
      "Webhook support",
      "Zapier integration",
      "GitHub integration",
      "Slack integration",
      "Custom plugin support"
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "upcoming":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5" />;
    case "in-progress":
      return <Clock className="h-5 w-5" />;
    case "upcoming":
      return <Sparkles className="h-5 w-5" />;
    default:
      return null;
  }
};

export default function Roadmap() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Product Roadmap</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what we're working on and what's coming next. Our roadmap is transparent and updated regularly.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Completed
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
            <Clock className="h-4 w-4 mr-1" />
            In Progress
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
            <Sparkles className="h-4 w-4 mr-1" />
            Upcoming
          </Badge>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {roadmapItems.map((item, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth" data-testid={`roadmap-item-${item.version}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(item.status)} text-white`} data-testid={`badge-status-${item.version}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                        </Badge>
                        <Badge variant="outline" data-testid={`badge-version-${item.version}`}>{item.version}</Badge>
                      </div>
                      <CardTitle className="text-2xl" data-testid={`title-${item.version}`}>{item.title}</CardTitle>
                      <CardDescription data-testid={`description-${item.version}`}>{item.description}</CardDescription>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap ml-4" data-testid={`date-${item.version}`}>
                      {item.date}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2" data-testid={`feature-${item.version}-${fIndex}`}>
                        <div className={`mt-1 h-4 w-4 rounded-full ${getStatusColor(item.status)}`} />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto gradient-hero p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Have a Feature Request?
            </h2>
            <p className="text-white/90 mb-6">
              We'd love to hear your ideas! Join our community and share your feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-smooth" data-testid="button-join-community">
                Join Community
              </button>
              <button className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-smooth" data-testid="button-submit-feedback">
                Submit Feedback
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
