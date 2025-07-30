import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function SubscriptionTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/subscriptions', { page, status, search }],
    refetchInterval: 30000,
  });

  const handleAction = async (subscriptionId: string, action: string) => {
    try {
      const endpoint = action === 'reactivate' 
        ? `/api/subscriptions/${subscriptionId}/reactivate`
        : `/api/subscriptions/${subscriptionId}/cancel`;
      
      await apiRequest("POST", endpoint);
      
      toast({
        title: "Success",
        description: `Subscription ${action === 'reactivate' ? 'reactivated' : 'updated'} successfully`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} subscription`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending_off: "bg-orange-100 text-orange-800",
      inactive: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    return {
      date: date.toLocaleDateString(),
      relative: diffInHours < 24 ? `in ${Math.round(diffInHours)} hours` : 'more than 24h'
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-material-gray">User Subscriptions</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_off">Pending Off</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Renewal</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data as any)?.subscriptions?.map((subscription: any) => {
              const renewalInfo = formatDate(subscription.nextRenewal);
              return (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-material-blue flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getInitials(subscription.user?.username || 'U')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.user?.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subscription.status)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">{renewalInfo.date}</div>
                      <div className="text-xs text-gray-500">{renewalInfo.relative}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-900">
                      <CreditCard className="w-4 h-4 text-gray-400 mr-1" />
                      {subscription.paymentMethod || 'stripe'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-material-blue hover:text-material-blue-dark"
                      >
                        View
                      </Button>
                      {subscription.status === 'pending_off' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-material-success hover:text-green-600"
                          onClick={() => handleAction(subscription.id, 'reactivate')}
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-material-warning hover:text-orange-600"
                          onClick={() => handleAction(subscription.id, 'cancel')}
                        >
                          Pause
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-material-error hover:text-red-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{(data as any)?.subscriptions?.length || 0}</span> of{" "}
            <span className="font-medium">{(data as any)?.total || 0}</span> results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant={page === 1 ? "default" : "outline"}
              size="sm"
              className={page === 1 ? "bg-material-blue text-white" : ""}
            >
              {page}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!(data as any)?.subscriptions?.length || (data as any).subscriptions.length < 10}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
