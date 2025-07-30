import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityLog() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activity-logs', { limit: 10 }],
    refetchInterval: 30000,
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'payment_processed':
      case 'subscription_created':
        return <CheckCircle className="w-4 h-4 text-material-success" />;
      case 'subscription_cancel_requested':
      case 'subscription_reactivated':
        return <Clock className="w-4 h-4 text-material-warning" />;
      case 'payment_failed':
      case 'subscription_expired':
        return <AlertTriangle className="w-4 h-4 text-material-error" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIconBgColor = (action: string) => {
    switch (action) {
      case 'payment_processed':
      case 'subscription_created':
        return 'bg-green-100';
      case 'subscription_cancel_requested':
      case 'subscription_reactivated':
        return 'bg-orange-100';
      case 'payment_failed':
      case 'subscription_expired':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes === 0) return 'just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(activities as any)?.map((activity: any) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getIconBgColor(activity.action)}`}>
                  {getActivityIcon(activity.action)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
