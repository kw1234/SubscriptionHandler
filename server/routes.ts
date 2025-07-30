import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { subscriptionService } from "./services/subscription";
// import { startCronJobs } from "./services/cron";

// Mock Stripe for development
const mockStripe = {
  customers: {
    create: async (data: any) => ({
      id: `cus_mock_${Date.now()}`,
      email: data.email,
      name: data.name,
    }),
  },
  subscriptions: {
    create: async (data: any) => ({
      id: `sub_mock_${Date.now()}`,
      customer: data.customer,
      latest_invoice: {
        payment_intent: {
          client_secret: `pi_mock_${Date.now()}_secret`,
        },
      },
    }),
  },
};

// WebSocket clients for real-time updates
const wsClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Start cron jobs for subscription management
  // startCronJobs(); // Disabled for mock mode

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching metrics: " + error.message });
    }
  });

  // User subscriptions with pagination
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await storage.getUserSubscriptions(page, limit, status);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching subscriptions: " + error.message });
    }
  });

  // Activity logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching activity logs: " + error.message });
    }
  });

  // Payment history
  app.get("/api/payment-history", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getPaymentHistory(userId, limit);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching payment history: " + error.message });
    }
  });

  // Create or get existing subscription
  app.post('/api/create-subscription', async (req, res) => {
    try {
      const { email, username } = req.body;

      if (!email || !username) {
        return res.status(400).json({ message: "Email and username are required" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email,
          username,
          password: 'temp_password', // In real app, this would be properly handled
        });
      }

      // Check if user already has an active subscription
      const existingSubscription = await storage.getSubscriptionByUserId(user.id);
      
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.json({ 
          message: "User already has an active subscription",
          subscription: existingSubscription 
        });
      }

      // Create mock customer if doesn't exist
      if (!user.stripeCustomerId) {
        const customer = await mockStripe.customers.create({
          email: user.email,
          name: user.username,
        });

        user = await storage.updateUserStripeInfo(user.id, customer.id);
      }

      // Create mock subscription
      const subscription = await mockStripe.subscriptions.create({
        customer: user.stripeCustomerId!,
        items: [{
          price: 'price_mock_daily_subscription',
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription ID
      await storage.updateUserStripeInfo(user.id, user.stripeCustomerId!, subscription.id);

      // Create subscription record
      const now = new Date();
      const subscriptionEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      await storage.createSubscription({
        userId: user.id,
        status: 'active',
        subscriptionStart: now,
        subscriptionEnd,
        nextRenewal: subscriptionEnd,
        paymentMethod: 'stripe',
        lastPaymentAmount: '9.99', // Default amount
        isRecurring: true,
      });

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
        action: 'subscription_created',
        description: `Subscription created for ${user.email}`,
      });

      // Broadcast update via WebSocket
      broadcastUpdate({ type: 'subscription_created', userId: user.id });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  // Cancel subscription (set to pending off)
  app.post('/api/subscriptions/:id/cancel', async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // Update subscription to pending off
      const updatedSubscription = await storage.updateSubscription(id, {
        status: 'pending_off',
      });

      // Log activity
      await storage.createActivityLog({
        userId: subscription.userId,
        action: 'subscription_cancel_requested',
        description: `Subscription cancellation requested`,
      });

      // Broadcast update
      broadcastUpdate({ type: 'subscription_updated', subscriptionId: id });

      res.json(updatedSubscription);
    } catch (error: any) {
      res.status(500).json({ message: "Error cancelling subscription: " + error.message });
    }
  });

  // Reactivate subscription
  app.post('/api/subscriptions/:id/reactivate', async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // Extend subscription by 24 hours
      const now = new Date();
      const newEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const updatedSubscription = await storage.updateSubscription(id, {
        status: 'active',
        subscriptionEnd: newEnd,
        nextRenewal: newEnd,
      });

      // Log activity
      await storage.createActivityLog({
        userId: subscription.userId,
        action: 'subscription_reactivated',
        description: `Subscription reactivated`,
      });

      // Broadcast update
      broadcastUpdate({ type: 'subscription_updated', subscriptionId: id });

      res.json(updatedSubscription);
    } catch (error: any) {
      res.status(500).json({ message: "Error reactivating subscription: " + error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      wsClients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast updates to all connected clients
  function broadcastUpdate(data: any) {
    const message = JSON.stringify(data);
    wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
