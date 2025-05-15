import {
  users, 
  projects, 
  xpEvents, 
  userXpTransactions, 
  campaigns,
  walletIntegrations,
  rewardDistributions,
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type XpEvent,
  type InsertXpEvent,
  type UserXpTransaction,
  type InsertUserXpTransaction,
  type Campaign,
  type InsertCampaign,
  type WalletIntegration,
  type InsertWalletIntegration,
  type RewardDistribution,
  type InsertRewardDistribution
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectByApiKey(apiKey: string): Promise<Project | undefined>;
  getProjectsByOwnerId(ownerId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  
  // XP Event methods
  getXpEvent(id: number): Promise<XpEvent | undefined>;
  getXpEventsByProjectId(projectId: number): Promise<XpEvent[]>;
  createXpEvent(xpEvent: InsertXpEvent): Promise<XpEvent>;
  updateXpEvent(id: number, xpEvent: Partial<InsertXpEvent>): Promise<XpEvent | undefined>;
  
  // User XP Transaction methods
  getUserXpTransaction(id: number): Promise<UserXpTransaction | undefined>;
  getUserXpTransactionsByProjectId(projectId: number): Promise<UserXpTransaction[]>;
  getUserXpTransactionsByExternalUserId(projectId: number, externalUserId: string): Promise<UserXpTransaction[]>;
  createUserXpTransaction(transaction: InsertUserXpTransaction): Promise<UserXpTransaction>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByProjectId(projectId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  
  // Wallet Integration methods
  getWalletIntegration(id: number): Promise<WalletIntegration | undefined>;
  getWalletIntegrationsByProjectId(projectId: number): Promise<WalletIntegration[]>;
  createWalletIntegration(walletIntegration: InsertWalletIntegration): Promise<WalletIntegration>;
  updateWalletIntegration(id: number, walletIntegration: Partial<InsertWalletIntegration>): Promise<WalletIntegration | undefined>;
  
  // Reward Distribution methods
  getRewardDistribution(id: number): Promise<RewardDistribution | undefined>;
  getRewardDistributionsByProjectId(projectId: number): Promise<RewardDistribution[]>;
  createRewardDistribution(rewardDistribution: InsertRewardDistribution): Promise<RewardDistribution>;
  updateRewardDistribution(id: number, rewardDistribution: Partial<InsertRewardDistribution>): Promise<RewardDistribution | undefined>;
  
  // Analytics methods
  getEventCounts(projectId: number): Promise<{ eventName: string; count: number; avgXp: number; status: string }[]>;
  getUserCount(projectId: number): Promise<number>;
  getTotalXpTransactions(projectId: number): Promise<number>;
  getActiveCampaignsCount(projectId: number): Promise<number>;
  getTotalRewardsDistributed(projectId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async getProjectByApiKey(apiKey: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.apiKey, apiKey));
    return project;
  }
  
  async getProjectsByOwnerId(ownerId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.ownerId, ownerId));
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    // Generate a unique API key if not provided
    if (!insertProject.apiKey) {
      insertProject.apiKey = `gami_${nanoid(32)}`;
    }
    
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
      
    return updatedProject;
  }
  
  // XP Event methods
  async getXpEvent(id: number): Promise<XpEvent | undefined> {
    const [xpEvent] = await db.select().from(xpEvents).where(eq(xpEvents.id, id));
    return xpEvent;
  }
  
  async getXpEventsByProjectId(projectId: number): Promise<XpEvent[]> {
    return await db.select().from(xpEvents).where(eq(xpEvents.projectId, projectId));
  }
  
  async createXpEvent(insertXpEvent: InsertXpEvent): Promise<XpEvent> {
    const [xpEvent] = await db.insert(xpEvents).values(insertXpEvent).returning();
    return xpEvent;
  }
  
  async updateXpEvent(id: number, xpEvent: Partial<InsertXpEvent>): Promise<XpEvent | undefined> {
    const [updatedXpEvent] = await db
      .update(xpEvents)
      .set(xpEvent)
      .where(eq(xpEvents.id, id))
      .returning();
      
    return updatedXpEvent;
  }
  
  // User XP Transaction methods
  async getUserXpTransaction(id: number): Promise<UserXpTransaction | undefined> {
    const [transaction] = await db.select().from(userXpTransactions).where(eq(userXpTransactions.id, id));
    return transaction;
  }
  
  async getUserXpTransactionsByProjectId(projectId: number): Promise<UserXpTransaction[]> {
    return await db
      .select()
      .from(userXpTransactions)
      .where(eq(userXpTransactions.projectId, projectId))
      .orderBy(desc(userXpTransactions.createdAt));
  }
  
  async getUserXpTransactionsByExternalUserId(projectId: number, externalUserId: string): Promise<UserXpTransaction[]> {
    return await db
      .select()
      .from(userXpTransactions)
      .where(
        and(
          eq(userXpTransactions.projectId, projectId),
          eq(userXpTransactions.externalUserId, externalUserId)
        )
      )
      .orderBy(desc(userXpTransactions.createdAt));
  }
  
  async createUserXpTransaction(insertTransaction: InsertUserXpTransaction): Promise<UserXpTransaction> {
    const [transaction] = await db.insert(userXpTransactions).values(insertTransaction).returning();
    return transaction;
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }
  
  async getCampaignsByProjectId(projectId: number): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.projectId, projectId))
      .orderBy(desc(campaigns.createdAt));
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }
  
  async updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updatedCampaign] = await db
      .update(campaigns)
      .set(campaign)
      .where(eq(campaigns.id, id))
      .returning();
      
    return updatedCampaign;
  }
  
  // Wallet Integration methods
  async getWalletIntegration(id: number): Promise<WalletIntegration | undefined> {
    const [walletIntegration] = await db.select().from(walletIntegrations).where(eq(walletIntegrations.id, id));
    return walletIntegration;
  }
  
  async getWalletIntegrationsByProjectId(projectId: number): Promise<WalletIntegration[]> {
    return await db
      .select()
      .from(walletIntegrations)
      .where(eq(walletIntegrations.projectId, projectId));
  }
  
  async createWalletIntegration(insertWalletIntegration: InsertWalletIntegration): Promise<WalletIntegration> {
    const [walletIntegration] = await db.insert(walletIntegrations).values(insertWalletIntegration).returning();
    return walletIntegration;
  }
  
  async updateWalletIntegration(id: number, walletIntegration: Partial<InsertWalletIntegration>): Promise<WalletIntegration | undefined> {
    const [updatedWalletIntegration] = await db
      .update(walletIntegrations)
      .set(walletIntegration)
      .where(eq(walletIntegrations.id, id))
      .returning();
      
    return updatedWalletIntegration;
  }
  
  // Reward Distribution methods
  async getRewardDistribution(id: number): Promise<RewardDistribution | undefined> {
    const [rewardDistribution] = await db.select().from(rewardDistributions).where(eq(rewardDistributions.id, id));
    return rewardDistribution;
  }
  
  async getRewardDistributionsByProjectId(projectId: number): Promise<RewardDistribution[]> {
    return await db
      .select()
      .from(rewardDistributions)
      .where(eq(rewardDistributions.projectId, projectId))
      .orderBy(desc(rewardDistributions.createdAt));
  }
  
  async createRewardDistribution(insertRewardDistribution: InsertRewardDistribution): Promise<RewardDistribution> {
    const [rewardDistribution] = await db.insert(rewardDistributions).values(insertRewardDistribution).returning();
    return rewardDistribution;
  }
  
  async updateRewardDistribution(id: number, rewardDistribution: Partial<InsertRewardDistribution>): Promise<RewardDistribution | undefined> {
    const [updatedRewardDistribution] = await db
      .update(rewardDistributions)
      .set(rewardDistribution)
      .where(eq(rewardDistributions.id, id))
      .returning();
      
    return updatedRewardDistribution;
  }
  
  // Analytics methods
  async getEventCounts(projectId: number): Promise<{ eventName: string; count: number; avgXp: number; status: string }[]> {
    const result = await db
      .select({
        eventName: xpEvents.name,
        count: sql<number>`count(${userXpTransactions.id})`,
        avgXp: sql<number>`avg(${userXpTransactions.xpAmount})`,
        status: xpEvents.status,
      })
      .from(xpEvents)
      .leftJoin(
        userXpTransactions,
        and(
          eq(xpEvents.id, userXpTransactions.eventId),
          eq(xpEvents.projectId, projectId)
        )
      )
      .where(eq(xpEvents.projectId, projectId))
      .groupBy(xpEvents.id);
      
    return result.map(item => ({
      eventName: item.eventName,
      count: item.count || 0,
      avgXp: Math.round(item.avgXp || 0),
      status: item.status
    }));
  }
  
  async getUserCount(projectId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(distinct ${userXpTransactions.externalUserId})`
      })
      .from(userXpTransactions)
      .where(eq(userXpTransactions.projectId, projectId));
      
    return result[0]?.count || 0;
  }
  
  async getTotalXpTransactions(projectId: number): Promise<number> {
    const result = await db
      .select({
        count: count()
      })
      .from(userXpTransactions)
      .where(eq(userXpTransactions.projectId, projectId));
      
    return result[0]?.count || 0;
  }
  
  async getActiveCampaignsCount(projectId: number): Promise<number> {
    const result = await db
      .select({
        count: count()
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.projectId, projectId),
          eq(campaigns.status, "active")
        )
      );
      
    return result[0]?.count || 0;
  }
  
  async getTotalRewardsDistributed(projectId: number): Promise<number> {
    const result = await db
      .select({
        sum: sql<number>`sum(${rewardDistributions.tokenAmount})`
      })
      .from(rewardDistributions)
      .where(
        and(
          eq(rewardDistributions.projectId, projectId),
          eq(rewardDistributions.status, "completed")
        )
      );
      
    return result[0]?.sum || 0;
  }
}

// For development/testing, we can use MemStorage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private xpEvents: Map<number, XpEvent>;
  private userXpTransactions: Map<number, UserXpTransaction>;
  private campaigns: Map<number, Campaign>;
  private walletIntegrations: Map<number, WalletIntegration>;
  private rewardDistributions: Map<number, RewardDistribution>;
  
  private userIdCounter: number = 1;
  private projectIdCounter: number = 1;
  private xpEventIdCounter: number = 1;
  private transactionIdCounter: number = 1;
  private campaignIdCounter: number = 1;
  private walletIntegrationIdCounter: number = 1;
  private rewardDistributionIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.xpEvents = new Map();
    this.userXpTransactions = new Map();
    this.campaigns = new Map();
    this.walletIntegrations = new Map();
    this.rewardDistributions = new Map();
    
    // Add initial data
    this.initializeData();
  }
  
  private initializeData() {
    // Create a test user
    const user: User = {
      id: this.userIdCounter++,
      username: "testuser",
      password: "password",
      email: "test@example.com",
      walletAddress: null,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Create a test project
    const project: Project = {
      id: this.projectIdCounter++,
      name: "Test Project",
      apiKey: "gami_test_" + nanoid(16),
      ownerId: user.id,
      status: "active",
      environment: "development",
      createdAt: new Date()
    };
    this.projects.set(project.id, project);
    
    // Create sample XP events
    const events = [
      { name: "complete_lesson", description: "Complete a lesson", xpAmount: 50 },
      { name: "submit_answer", description: "Submit an answer", xpAmount: 10 },
      { name: "daily_login", description: "Daily login", xpAmount: 5 },
      { name: "share_content", description: "Share content", xpAmount: 25 },
      { name: "purchase_item", description: "Purchase an item", xpAmount: 100 }
    ];
    
    for (const eventData of events) {
      const status = eventData.name === "share_content" ? "testing" : 
                     eventData.name === "purchase_item" ? "inactive" : "active";
                     
      const xpEvent: XpEvent = {
        id: this.xpEventIdCounter++,
        projectId: project.id,
        name: eventData.name,
        description: eventData.description,
        xpAmount: eventData.xpAmount,
        status,
        createdAt: new Date()
      };
      
      this.xpEvents.set(xpEvent.id, xpEvent);
      
      // Add some sample transactions
      const transactionCount = Math.floor(Math.random() * 5000) + 100;
      for (let i = 0; i < transactionCount; i++) {
        if (xpEvent.status !== "active" && Math.random() > 0.2) continue;
        
        const transaction: UserXpTransaction = {
          id: this.transactionIdCounter++,
          projectId: project.id,
          externalUserId: `user_${Math.floor(Math.random() * 1000)}`,
          eventId: xpEvent.id,
          xpAmount: xpEvent.xpAmount,
          metadata: { timestamp: new Date().toISOString() },
          createdAt: new Date()
        };
        
        this.userXpTransactions.set(transaction.id, transaction);
      }
    }
    
    // Create sample campaign
    const campaign: Campaign = {
      id: this.campaignIdCounter++,
      projectId: project.id,
      name: "Summer Challenge",
      description: "Complete summer challenges to earn rewards",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      rewardAmount: 5000,
      status: "active",
      createdAt: new Date()
    };
    this.campaigns.set(campaign.id, campaign);
    
    // Create sample wallet integrations
    const walletTypes = ["phantom", "solflare", "walletconnect"];
    walletTypes.forEach((type, index) => {
      const walletIntegration: WalletIntegration = {
        id: this.walletIntegrationIdCounter++,
        projectId: project.id,
        walletType: type,
        isEnabled: index < 2, // Only enable the first two
        config: { },
        createdAt: new Date()
      };
      this.walletIntegrations.set(walletIntegration.id, walletIntegration);
    });
    
    // Create sample reward distributions
    for (let i = 0; i < 100; i++) {
      const rewardDistribution: RewardDistribution = {
        id: this.rewardDistributionIdCounter++,
        projectId: project.id,
        campaignId: campaign.id,
        externalUserId: `user_${Math.floor(Math.random() * 1000)}`,
        walletAddress: `sol_${nanoid(32)}`,
        tokenAmount: Math.floor(Math.random() * 1000) + 10,
        transactionHash: Math.random() > 0.2 ? `tx_${nanoid(32)}` : null,
        status: Math.random() > 0.2 ? "completed" : (Math.random() > 0.5 ? "pending" : "failed"),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      };
      this.rewardDistributions.set(rewardDistribution.id, rewardDistribution);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectByApiKey(apiKey: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(project => project.apiKey === apiKey);
  }
  
  async getProjectsByOwnerId(ownerId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.ownerId === ownerId);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const project: Project = { 
      ...insertProject, 
      id, 
      apiKey: insertProject.apiKey || `gami_test_${nanoid(16)}`,
      createdAt: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  // XP Event methods
  async getXpEvent(id: number): Promise<XpEvent | undefined> {
    return this.xpEvents.get(id);
  }
  
  async getXpEventsByProjectId(projectId: number): Promise<XpEvent[]> {
    return Array.from(this.xpEvents.values()).filter(event => event.projectId === projectId);
  }
  
  async createXpEvent(insertXpEvent: InsertXpEvent): Promise<XpEvent> {
    const id = this.xpEventIdCounter++;
    const xpEvent: XpEvent = { ...insertXpEvent, id, createdAt: new Date() };
    this.xpEvents.set(id, xpEvent);
    return xpEvent;
  }
  
  async updateXpEvent(id: number, xpEventUpdate: Partial<InsertXpEvent>): Promise<XpEvent | undefined> {
    const xpEvent = this.xpEvents.get(id);
    if (!xpEvent) return undefined;
    
    const updatedXpEvent = { ...xpEvent, ...xpEventUpdate };
    this.xpEvents.set(id, updatedXpEvent);
    return updatedXpEvent;
  }
  
  // User XP Transaction methods
  async getUserXpTransaction(id: number): Promise<UserXpTransaction | undefined> {
    return this.userXpTransactions.get(id);
  }
  
  async getUserXpTransactionsByProjectId(projectId: number): Promise<UserXpTransaction[]> {
    return Array.from(this.userXpTransactions.values())
      .filter(txn => txn.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserXpTransactionsByExternalUserId(projectId: number, externalUserId: string): Promise<UserXpTransaction[]> {
    return Array.from(this.userXpTransactions.values())
      .filter(txn => txn.projectId === projectId && txn.externalUserId === externalUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createUserXpTransaction(insertTransaction: InsertUserXpTransaction): Promise<UserXpTransaction> {
    const id = this.transactionIdCounter++;
    const transaction: UserXpTransaction = { ...insertTransaction, id, createdAt: new Date() };
    this.userXpTransactions.set(id, transaction);
    return transaction;
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async getCampaignsByProjectId(projectId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const campaign: Campaign = { ...insertCampaign, id, createdAt: new Date() };
    this.campaigns.set(id, campaign);
    return campaign;
  }
  
  async updateCampaign(id: number, campaignUpdate: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...campaignUpdate };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  // Wallet Integration methods
  async getWalletIntegration(id: number): Promise<WalletIntegration | undefined> {
    return this.walletIntegrations.get(id);
  }
  
  async getWalletIntegrationsByProjectId(projectId: number): Promise<WalletIntegration[]> {
    return Array.from(this.walletIntegrations.values())
      .filter(integration => integration.projectId === projectId);
  }
  
  async createWalletIntegration(insertWalletIntegration: InsertWalletIntegration): Promise<WalletIntegration> {
    const id = this.walletIntegrationIdCounter++;
    const walletIntegration: WalletIntegration = { ...insertWalletIntegration, id, createdAt: new Date() };
    this.walletIntegrations.set(id, walletIntegration);
    return walletIntegration;
  }
  
  async updateWalletIntegration(id: number, walletIntegrationUpdate: Partial<InsertWalletIntegration>): Promise<WalletIntegration | undefined> {
    const walletIntegration = this.walletIntegrations.get(id);
    if (!walletIntegration) return undefined;
    
    const updatedWalletIntegration = { ...walletIntegration, ...walletIntegrationUpdate };
    this.walletIntegrations.set(id, updatedWalletIntegration);
    return updatedWalletIntegration;
  }
  
  // Reward Distribution methods
  async getRewardDistribution(id: number): Promise<RewardDistribution | undefined> {
    return this.rewardDistributions.get(id);
  }
  
  async getRewardDistributionsByProjectId(projectId: number): Promise<RewardDistribution[]> {
    return Array.from(this.rewardDistributions.values())
      .filter(distribution => distribution.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createRewardDistribution(insertRewardDistribution: InsertRewardDistribution): Promise<RewardDistribution> {
    const id = this.rewardDistributionIdCounter++;
    const rewardDistribution: RewardDistribution = { ...insertRewardDistribution, id, createdAt: new Date() };
    this.rewardDistributions.set(id, rewardDistribution);
    return rewardDistribution;
  }
  
  async updateRewardDistribution(id: number, rewardDistributionUpdate: Partial<InsertRewardDistribution>): Promise<RewardDistribution | undefined> {
    const rewardDistribution = this.rewardDistributions.get(id);
    if (!rewardDistribution) return undefined;
    
    const updatedRewardDistribution = { ...rewardDistribution, ...rewardDistributionUpdate };
    this.rewardDistributions.set(id, updatedRewardDistribution);
    return updatedRewardDistribution;
  }
  
  // Analytics methods
  async getEventCounts(projectId: number): Promise<{ eventName: string; count: number; avgXp: number; status: string }[]> {
    const events = await this.getXpEventsByProjectId(projectId);
    const result = [];
    
    for (const event of events) {
      const transactions = Array.from(this.userXpTransactions.values())
        .filter(txn => txn.projectId === projectId && txn.eventId === event.id);
      
      const count = transactions.length;
      const totalXp = transactions.reduce((sum, txn) => sum + txn.xpAmount, 0);
      const avgXp = count > 0 ? Math.round(totalXp / count) : 0;
      
      result.push({
        eventName: event.name,
        count,
        avgXp,
        status: event.status
      });
    }
    
    return result;
  }
  
  async getUserCount(projectId: number): Promise<number> {
    const externalUserIds = new Set(
      Array.from(this.userXpTransactions.values())
        .filter(txn => txn.projectId === projectId)
        .map(txn => txn.externalUserId)
    );
    
    return externalUserIds.size;
  }
  
  async getTotalXpTransactions(projectId: number): Promise<number> {
    return Array.from(this.userXpTransactions.values())
      .filter(txn => txn.projectId === projectId)
      .length;
  }
  
  async getActiveCampaignsCount(projectId: number): Promise<number> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.projectId === projectId && campaign.status === "active")
      .length;
  }
  
  async getTotalRewardsDistributed(projectId: number): Promise<number> {
    return Array.from(this.rewardDistributions.values())
      .filter(distribution => distribution.projectId === projectId && distribution.status === "completed")
      .reduce((sum, distribution) => sum + distribution.tokenAmount, 0);
  }
}

// Choose which storage implementation to use
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
