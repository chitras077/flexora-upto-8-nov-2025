import VideoTools from "@/components/VideoTools";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function VideoToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Breadcrumbs />
      <VideoTools />
    </div>
  );
}