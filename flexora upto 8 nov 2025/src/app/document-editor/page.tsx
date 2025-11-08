import DocumentEditor from "@/components/DocumentEditor";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function DocumentEditorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Breadcrumbs />
      <DocumentEditor />
    </div>
  );
}