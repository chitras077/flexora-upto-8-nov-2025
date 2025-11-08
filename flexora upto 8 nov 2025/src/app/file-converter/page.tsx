import FileConverter from "@/components/FileConverter";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function FileConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Breadcrumbs />
      <FileConverter />
    </div>
  );
}