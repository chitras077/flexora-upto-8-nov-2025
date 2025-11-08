import ImageTools from "@/components/ImageTools";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ImageToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Breadcrumbs />
      <ImageTools />
    </div>
  );
}