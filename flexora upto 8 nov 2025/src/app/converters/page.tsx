import Converters from "@/components/Converters";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ConvertersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Breadcrumbs />
      <Converters />
    </div>
  );
}