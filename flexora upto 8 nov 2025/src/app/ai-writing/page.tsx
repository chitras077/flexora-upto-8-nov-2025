import AIWriting from "@/components/AIWriting";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AIWritingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <Breadcrumbs />
      <AIWriting />
    </div>
  );
}