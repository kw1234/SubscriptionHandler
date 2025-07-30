import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log('Seeding database with demo data...');

    // Create demo users and subscriptions
    const demoUsers = [
      { email: 'alice@example.com', username: 'alice_smith' },
      { email: 'bob@example.com', username: 'bob_jones' },
      { email: 'carol@example.com', username: 'carol_davis' },
      { email: 'dave@example.com', username: 'dave_wilson' },
      { email: 'eve@example.com', username: 'eve_brown' },
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: 'demo_password',
        stripeCustomerId: `cus_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      // Create subscription with random status
      const statuses = ['active', 'pending_off', 'inactive'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const now = new Date();
      const subscriptionStart = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random start within last 7 days
      const subscriptionEnd = new Date(subscriptionStart.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

      await storage.createSubscription({
        userId: user.id,
        status,
        subscriptionStart,
        subscriptionEnd,
        nextRenewal: status === 'active' ? subscriptionEnd : null,
        paymentMethod: 'stripe',
        lastPaymentAmount: '9.99',
        isRecurring: true,
      });

      // Create activity logs
      await storage.createActivityLog({
        userId: user.id,
        action: 'subscription_created',
        description: `Subscription created for ${user.email}`,
      });

      // Create payment history
      const paymentStatuses = ['succeeded', 'failed'];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      await storage.createPaymentHistory({
        userId: user.id,
        subscriptionId: (await storage.getSubscriptionByUserId(user.id))!.id,
        amount: '9.99',
        currency: 'usd',
        status: paymentStatus,
        stripePaymentIntentId: `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        failureReason: paymentStatus === 'failed' ? 'Insufficient funds' : null,
      });

      console.log(`Created demo user: ${userData.email}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };