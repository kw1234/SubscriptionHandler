import { useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { CreditCard, Lock } from "lucide-react";

const MockPaymentForm = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/25');
  const [cvc, setCvc] = useState('123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      toast({
        title: "Payment Successful",
        description: "Your subscription is now active!",
      });
      setLocation('/dashboard');
    } else {
      toast({
        title: "Payment Failed",
        description: "Please try again with a different payment method.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Lock className="w-4 h-4" />
          <span>This is a demo payment form. No real charges will be made.</span>
        </div>
        
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="pl-10"
            />
            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
            />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-material-blue hover:bg-material-blue-dark"
      >
        {isLoading ? 'Processing Payment...' : 'Subscribe ($9.99/day)'}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createSubscription = async () => {
    if (!email || !username) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and username",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { 
        email, 
        username 
      });
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast({
          title: "Subscription Exists",
          description: data.message || "You already have an active subscription",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
    
    setIsCreating(false);
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-material-surface flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-material-gray text-center">
              Subscribe to SubManager Pro
            </CardTitle>
            <p className="text-gray-500 text-center">
              $9.99 per day with 24-hour renewal cycles
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>
            <Button
              onClick={createSubscription}
              disabled={isCreating}
              className="w-full bg-material-blue hover:bg-material-blue-dark"
            >
              {isCreating ? 'Creating...' : 'Continue to Payment'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-material-surface flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-material-gray text-center">
            Complete Your Subscription
          </CardTitle>
          <p className="text-gray-500 text-center">
            Secure payment powered by Stripe
          </p>
        </CardHeader>
        <CardContent>
          <MockPaymentForm />
        </CardContent>
      </Card>
    </div>
  );
}
