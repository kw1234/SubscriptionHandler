import { storage } from "../storage";

// Mock Stripe for development
const mockStripe = {
  paymentIntents: {
    create: async (data: any) => ({
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      amount: data.amount,
      currency: data.currency,
      customer: data.customer,
    }),
    confirm: async (paymentIntentId: string) => {
      // Simulate 90% success rate for demo purposes
      const isSuccess = Math.random() > 0.1;
      return {
        id: paymentIntentId,
        status: isSuccess ? 'succeeded' : 'failed',
      };
    },
  },
};

export class SubscriptionService {
  async processRecurringPayments() {
    try {
      console.log('Processing recurring payments...');
      
      // Get all active subscriptions that are due for renewal
      const activeSubscriptions = await storage.getActiveSubscriptions();
      const now = new Date();
      
      for (const subscription of activeSubscriptions) {
        if (subscription.nextRenewal && subscription.nextRenewal <= now) {
          await this.processSubscriptionRenewal(subscription.id);
        }
      }
      
      console.log(`Processed renewals for ${activeSubscriptions.length} subscriptions`);
    } catch (error) {
      console.error('Error processing recurring payments:', error);
    }
  }

  async processSubscriptionRenewal(subscriptionId: string) {
    try {
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) return;

      const user = await storage.getUser(subscription.userId);
      if (!user || !user.stripeCustomerId) return;

      // Create payment intent for renewal
      const paymentIntent = await mockStripe.paymentIntents.create({
        amount: Math.round(parseFloat(subscription.lastPaymentAmount || '9.99') * 100),
        currency: 'usd',
        customer: user.stripeCustomerId,
      });

      // Try to confirm payment
      const confirmedPayment = await mockStripe.paymentIntents.confirm(paymentIntent.id);

      if (confirmedPayment.status === 'succeeded') {
        // Payment successful - extend subscription
        const newEnd = new Date(subscription.subscriptionEnd.getTime() + 24 * 60 * 60 * 1000);
        
        await storage.updateSubscription(subscriptionId, {
          subscriptionEnd: newEnd,
          nextRenewal: newEnd,
        });

        // Record successful payment
        await storage.createPaymentHistory({
          userId: user.id,
          subscriptionId,
          amount: subscription.lastPaymentAmount || '9.99',
          status: 'succeeded',
          stripePaymentIntentId: paymentIntent.id,
        });

        // Log activity
        await storage.createActivityLog({
          userId: user.id,
          action: 'payment_processed',
          description: `Recurring payment processed successfully`,
        });

        console.log(`Subscription ${subscriptionId} renewed successfully`);
      } else {
        // Payment failed
        await this.handleFailedPayment(subscriptionId, paymentIntent.id, 'Payment failed');
      }
    } catch (error: any) {
      console.error(`Error renewing subscription ${subscriptionId}:`, error);
      await this.handleFailedPayment(subscriptionId, '', error.message);
    }
  }

  async handleFailedPayment(subscriptionId: string, paymentIntentId: string, reason: string) {
    const subscription = await storage.getSubscription(subscriptionId);
    if (!subscription) return;

    // Record failed payment
    await storage.createPaymentHistory({
      userId: subscription.userId,
      subscriptionId,
      amount: subscription.lastPaymentAmount || '9.99',
      status: 'failed',
      stripePaymentIntentId: paymentIntentId,
      failureReason: reason,
    });

    // Log activity
    await storage.createActivityLog({
      userId: subscription.userId,
      action: 'payment_failed',
      description: `Payment failed: ${reason}`,
    });

    console.log(`Payment failed for subscription ${subscriptionId}: ${reason}`);
  }

  async processExpiredSubscriptions() {
    try {
      console.log('Processing expired subscriptions...');
      
      const expiredSubscriptions = await storage.getExpiredSubscriptions();
      
      for (const subscription of expiredSubscriptions) {
        // Move from pending_off to inactive
        await storage.updateSubscription(subscription.id, {
          status: 'inactive',
        });

        // Log activity
        await storage.createActivityLog({
          userId: subscription.userId,
          action: 'subscription_expired',
          description: `Subscription expired and set to inactive`,
        });

        console.log(`Subscription ${subscription.id} set to inactive`);
      }
      
      console.log(`Processed ${expiredSubscriptions.length} expired subscriptions`);
    } catch (error) {
      console.error('Error processing expired subscriptions:', error);
    }
  }
}

export const subscriptionService = new SubscriptionService();
