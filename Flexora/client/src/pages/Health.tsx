import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Server, Database, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Health() {
  const uptime = Math.floor(Math.random() * 30) + 1; // Mock uptime in days
  
  const services = [
    { name: "API Server", status: "operational", icon: Server },
    { name: "Database", status: "operational", icon: Database },
    { name: "Processing Queue", status: "operational", icon: Zap },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">System Status</h1>
            <p className="text-xl text-muted-foreground">
              All systems operational
            </p>
          </div>

          <Card className="shadow-medium mb-8" data-testid="card-system-status">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" data-testid="icon-healthy" />
                </div>
                <div>
                  <CardTitle className="text-2xl" data-testid="text-system-status">System Healthy</CardTitle>
                  <p className="text-sm text-muted-foreground" data-testid="text-uptime">
                    Uptime: {uptime} days
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30" data-testid={`service-${service.name.toLowerCase().replace(' ', '-')}`}>
                    <div className="flex items-center gap-3">
                      <service.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <Badge className="bg-green-500 text-white" data-testid={`badge-status-${service.name.toLowerCase().replace(' ', '-')}`}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">
{`{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "${uptime} days",
  "services": {
    "api": "operational",
    "database": "operational",
    "queue": "operational"
  },
  "timestamp": "${new Date().toISOString()}"
}`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
