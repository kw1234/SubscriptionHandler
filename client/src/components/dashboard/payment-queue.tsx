import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PaymentQueue() {
  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ['/api/payment-history', { limit: 5 }],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Mock queue data since we don't have real-time queue info
  const queueData = {
    processing: 15,
    queued: 127,
    completedToday: 1203,
    successRate: 97.2,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-material-gray">
          Payment Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 text-material-blue mr-3 animate-spin" />
              <span className="text-sm text-material-gray">
                Processing {queueData.processing} payments...
              </span>
            </div>
            <span className="text-xs text-gray-500">In progress</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-material-gray">
                {queueData.queued} payments queued
              </span>
            </div>
            <span className="text-xs text-gray-500">Next: 5 min</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-material-success mr-3" />
              <span className="text-sm text-material-gray">
                {queueData.completedToday.toLocaleString()} completed today
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Success rate: {queueData.successRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
