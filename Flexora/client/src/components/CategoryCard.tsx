import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
}

export const CategoryCard = ({ title, description, icon: Icon, href, iconColor }: CategoryCardProps) => {
  return (
    <Link to={href} className="group">
      <Card className="h-full gradient-card border-2 transition-smooth hover:border-primary hover:shadow-medium cursor-pointer">
        <CardHeader>
          <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center mb-4 transition-smooth group-hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};
