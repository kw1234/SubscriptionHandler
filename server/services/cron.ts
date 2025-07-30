import { subscriptionService } from "./subscription";

// Simple cron-like implementation
export function startCronJobs() {
  console.log('Starting subscription management cron jobs...');

  // Process recurring payments every 10 minutes
  setInterval(async () => {
    await subscriptionService.processRecurringPayments();
  }, 10 * 60 * 1000);

  // Process expired subscriptions every 5 minutes
  setInterval(async () => {
    await subscriptionService.processExpiredSubscriptions();
  }, 5 * 60 * 1000);

  console.log('Cron jobs started');
}
