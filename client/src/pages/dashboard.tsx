import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { SubscriptionTable } from "@/components/dashboard/subscription-table";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { PaymentQueue } from "@/components/dashboard/payment-queue";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // WebSocket connection for real-time updates
  // useWebSocket((data) => {
  //   // Invalidate relevant queries when updates are received
  //   if (
  //     data.type === "subscription_created" ||
  //     data.type === "subscription_updated"
  //   ) {
  //     queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
  //     queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
  //     queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
  //     setLastUpdated(new Date());
  //   }
  // });

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    setLastUpdated(new Date());
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes === 0) return "just now";
    if (diffInMinutes === 1) return "1 minute ago";
    return `${diffInMinutes} minutes ago`;
  };

  return (
    <div className="flex h-screen bg-material-surface">
      {/* TODO: Uncomment sidebar when the functionality is needed */}
      {/* <Sidebar /> */}

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-medium text-material-gray">
                Subscription Dashboard
              </h2>
              <p className="text-gray-500 mt-1">
                Monitor and manage user subscriptions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </span>
              <Button
                onClick={handleRefresh}
                className="bg-material-blue text-white hover:bg-material-blue-dark"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <MetricsCards />

          <div className="mb-8">
            <SubscriptionTable />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityLog />
            <PaymentQueue />
          </div>
        </div>
      </div>
    </div>
  );
}
