import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceStatus {
  name: string;
  uptime: string;
  status: "operational" | "degraded" | "outage";
}

interface ApiStatusProps {
  services: ServiceStatus[];
}

export default function ApiStatus({ services }: ApiStatusProps) {
  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-amber-500";
      case "outage":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusText = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "degraded":
        return "text-amber-600";
      case "outage":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getStatusLabel = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded";
      case "outage":
        return "Outage";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-lg font-medium text-slate-900">API Status</h3>
      </div>
      <CardContent className="p-5">
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-center mb-4">
              <div className={cn("w-3 h-3 rounded-full mr-2", getStatusColor(service.status))} />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{service.name}</div>
                <div className="text-xs text-slate-500">{service.uptime} uptime</div>
              </div>
              <div className={cn("text-sm font-medium", getStatusText(service.status))}>
                {getStatusLabel(service.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="bg-slate-50 px-5 py-4 text-center">
        <a 
          href="#" 
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          View Status Page
        </a>
      </div>
    </Card>
  );
}
