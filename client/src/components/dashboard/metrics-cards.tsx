import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { 
  Ticket,
  Clock,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Subscriptions",
      value: (metrics as any)?.activeCount || 0,
      icon: Ticket,
      color: "bg-green-100 text-material-success",
    },
    {
      title: "Pending Off",
      value: (metrics as any)?.pendingCount || 0,
      icon: Clock,
      color: "bg-orange-100 text-material-warning",
    },
    {
      title: "Daily Revenue",
      value: `$${(metrics as any)?.dailyRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: "bg-blue-100 text-material-blue",
    },
    {
      title: "Payment Failures",
      value: (metrics as any)?.failureCount || 0,
      icon: AlertTriangle,
      color: "bg-red-100 text-material-error",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-semibold text-material-gray">
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
