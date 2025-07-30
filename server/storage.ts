import { 
  users, 
  subscriptions, 
  activityLogs, 
  paymentHistory,
  type User, 
  type InsertUser,
  type Subscription,
  type InsertSubscription,
  type ActivityLog,
  type InsertActivityLog,
  type PaymentHistory,
  type InsertPaymentHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sum, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Subscription methods
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription>;
  getActiveSubscriptions(): Promise<Subscription[]>;
  getPendingOffSubscriptions(): Promise<Subscription[]>;
  getExpiredSubscriptions(): Promise<Subscription[]>;
  
  // Activity log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  
  // Payment history methods
  createPaymentHistory(payment: InsertPaymentHistory): Promise<PaymentHistory>;
  getPaymentHistory(userId?: string, limit?: number): Promise<PaymentHistory[]>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeCount: number;
    pendingCount: number;
    dailyRevenue: number;
    failureCount: number;
  }>;
  
  // User subscriptions with pagination
  getUserSubscriptions(page: number, limit: number, status?: string): Promise<{
    subscriptions: (Subscription & { user: User })[];
    total: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const updateData: any = { stripeCustomerId };
    if (stripeSubscriptionId) {
      updateData.stripeSubscriptionId = stripeSubscriptionId;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription || undefined;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription || undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        ...subscription,
        updatedAt: new Date(),
      })
      .returning();
    return newSubscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
  }

  async getPendingOffSubscriptions(): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, 'pending_off'));
  }

  async getExpiredSubscriptions(): Promise<Subscription[]> {
    const now = new Date();
    return await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'pending_off'),
          lte(subscriptions.subscriptionEnd, now)
        )
      );
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return activityLog;
  }

  async getActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async createPaymentHistory(payment: InsertPaymentHistory): Promise<PaymentHistory> {
    const [paymentRecord] = await db
      .insert(paymentHistory)
      .values(payment)
      .returning();
    return paymentRecord;
  }

  async getPaymentHistory(userId?: string, limit: number = 10): Promise<PaymentHistory[]> {
    const baseQuery = db.select().from(paymentHistory);
    
    if (userId) {
      return await baseQuery
        .where(eq(paymentHistory.userId, userId))
        .orderBy(desc(paymentHistory.processedAt))
        .limit(limit);
    }
    
    return await baseQuery
      .orderBy(desc(paymentHistory.processedAt))
      .limit(limit);
  }

  async getDashboardMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const [pendingResult] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'pending_off'));

    const [revenueResult] = await db
      .select({ total: sum(paymentHistory.amount) })
      .from(paymentHistory)
      .where(
        and(
          eq(paymentHistory.status, 'succeeded'),
          gte(paymentHistory.processedAt, today),
          lte(paymentHistory.processedAt, tomorrow)
        )
      );

    const [failureResult] = await db
      .select({ count: count() })
      .from(paymentHistory)
      .where(
        and(
          eq(paymentHistory.status, 'failed'),
          gte(paymentHistory.processedAt, today),
          lte(paymentHistory.processedAt, tomorrow)
        )
      );

    return {
      activeCount: activeResult.count,
      pendingCount: pendingResult.count,
      dailyRevenue: parseFloat(revenueResult.total || '0'),
      failureCount: failureResult.count,
    };
  }

  async getUserSubscriptions(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    
    const baseQuery = db
      .select({
        subscription: subscriptions,
        user: users,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id));

    let results;
    if (status && status !== 'all') {
      results = await baseQuery
        .where(eq(subscriptions.status, status))
        .orderBy(desc(subscriptions.updatedAt))
        .limit(limit)
        .offset(offset);
    } else {
      results = await baseQuery
        .orderBy(desc(subscriptions.updatedAt))
        .limit(limit)
        .offset(offset);
    }

    // Get total count
    let totalCount;
    if (status && status !== 'all') {
      const [countResult] = await db
        .select({ count: count() })
        .from(subscriptions)
        .where(eq(subscriptions.status, status));
      totalCount = countResult.count;
    } else {
      const [countResult] = await db
        .select({ count: count() })
        .from(subscriptions);
      totalCount = countResult.count;
    }

    return {
      subscriptions: results.map(r => ({ ...r.subscription, user: r.user! })),
      total: totalCount,
    };
  }
}

export const storage = new DatabaseStorage();
