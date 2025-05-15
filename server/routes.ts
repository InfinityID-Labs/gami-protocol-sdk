import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { trackEventSchema, connectWalletSchema } from "@shared/schema";
import express from "express";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, generateApiKey } from "./auth";
import { gamificationService } from "./services/gamification.service";
import { walrusService } from "./services/walrus.service";
import { isMongoAvailable } from "./mongo";

// Initialize test data for development purposes
async function initializeTestData() {
  try {
    // Check if test project exists
    const testApiKey = "test-dev-api-key-123456";
    const existingProject = await storage.getProjectByApiKey(testApiKey);
    
    if (!existingProject) {
      console.log("Creating test project with API key:", testApiKey);
      
      // Create a test user if needed
      let testUser = await storage.getUserByUsername("testuser");
      if (!testUser) {
        testUser = await storage.createUser({
          username: "testuser",
          email: "test@example.com",
          password: "hashedpassword", // This would be hashed in production
          firstName: "Test",
          lastName: "User"
        });
      }
      
      // Create test project
      const project = await storage.createProject({
        ownerId: testUser.id,
        name: "Test Project",
        apiKey: testApiKey,
        description: "A test project for development",
        environment: "development",
        status: "active"
      });
      
      // Create wallet integrations for the project
      await storage.createWalletIntegration({
        projectId: project.id,
        walletType: "phantom",
        isEnabled: true
      });
      
      await storage.createWalletIntegration({
        projectId: project.id,
        walletType: "solflare",
        isEnabled: true
      });
      
      console.log("Test data initialized successfully");
    } else {
      console.log("Test project already exists");
    }
  } catch (error) {
    console.error("Error initializing test data:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize test data in development
  if (process.env.NODE_ENV === "development") {
    await initializeTestData();
  }
  
  // Setup authentication
  const { requireAuth, apiKeyAuth } = setupAuth(app);
  
  // API routes
  const apiRouter = express.Router();
  
  // User routes for authentication (handled by setupAuth)
  
  // User's projects
  apiRouter.get("/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projects = await storage.getProjectsByOwnerId(user.id);
      
      // Don't send sensitive data like API keys
      const safeProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        environment: project.environment,
        createdAt: project.createdAt
      }));
      
      res.status(200).json(safeProjects);
    } catch (error) {
      res.status(500).json({ error: "Error fetching projects" });
    }
  });
  
  // Get project API keys (only for authenticated users)
  apiRouter.get("/projects/:id/keys", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const user = req.user;
      
      // Verify the project belongs to the user
      const project = await storage.getProject(projectId);
      if (!project || project.ownerId !== user.id) {
        return res.status(403).json({ error: "You do not have access to this project" });
      }
      
      res.status(200).json({
        apiKey: project.apiKey
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching API key" });
    }
  });
  
  // Create a new project (for authenticated users)
  apiRouter.post("/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectSchema = z.object({
        name: z.string().min(3).max(100),
        description: z.string().optional(),
        environment: z.enum(["development", "production"]).default("development")
      });
      
      const data = projectSchema.parse(req.body);
      const user = req.user;
      
      // Generate a new API key
      const apiKey = generateApiKey();
      
      const project = await storage.createProject({
        ownerId: user.id,
        name: data.name,
        apiKey,
        description: data.description || null,
        environment: data.environment,
        status: "active"
      });
      
      // Don't return the API key in the response
      const { apiKey: _, ...safeProject } = project;
      
      res.status(201).json(safeProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating project" });
    }
  });
  
  // We're using the apiKeyAuth middleware from setupAuth
  
  // SDK API endpoints
  
  // Track XP event
  apiRouter.post("/track", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const data = trackEventSchema.parse(req.body);
      const project = (req as any).project;
      
      // Find the XP event
      const events = await storage.getXpEventsByProjectId(project.id);
      const xpEvent = events.find(event => event.name === data.event);
      
      if (!xpEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (xpEvent.status !== "active") {
        return res.status(400).json({ error: "Event is not active" });
      }
      
      // Create XP transaction
      const transaction = await storage.createUserXpTransaction({
        projectId: project.id,
        externalUserId: data.userId,
        eventId: xpEvent.id,
        xpAmount: xpEvent.xpAmount,
        metadata: data.metadata || {}
      });
      
      res.status(200).json({ 
        success: true, 
        transaction: {
          id: transaction.id,
          userId: transaction.externalUserId,
          event: xpEvent.name,
          xp: transaction.xpAmount,
          timestamp: transaction.createdAt
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error tracking XP event" });
    }
  });
  
  // Connect wallet
  apiRouter.post("/connect-wallet", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const data = connectWalletSchema.parse(req.body);
      const project = (req as any).project;
      
      // Check if the wallet type is enabled for this project
      const walletIntegrations = await storage.getWalletIntegrationsByProjectId(project.id);
      const walletIntegration = walletIntegrations.find(w => w.walletType === data.walletType);
      
      if (!walletIntegration) {
        return res.status(404).json({ error: "Wallet type not found" });
      }
      
      if (!walletIntegration.isEnabled) {
        return res.status(400).json({ error: "Wallet type is not enabled" });
      }
      
      // In a real implementation, we would handle the wallet connection here
      // For now, we'll just return success
      res.status(200).json({ 
        success: true,
        message: `Successfully connected to ${data.walletType}`
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error connecting wallet" });
    }
  });
  
  // Get wallet token balances
  apiRouter.post("/wallet/balances", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const balanceSchema = z.object({
        publicKey: z.string(),
        chainType: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom'])
      });
      
      const data = balanceSchema.parse(req.body);
      
      // Prepare balances array with mock data
      let balances = [];
      
      // If it's a Solana chain, attempt to get real GAMI token balance if token is created
      if (data.chainType === 'solana') {
        try {
          const tokenService = await import('./services/token.service');
          const tokenInfo = tokenService.getCurrentTokenInfo();
          
          if (tokenInfo) {
            // Get real GAMI token balance
            try {
              const tokenBalance = await tokenService.getTokenBalance(data.publicKey);
              
              // Add real GAMI token to balances
              balances = [
                { token: 'SOL', amount: 1.25, usdValue: 125.00 }, // SOL is still mocked
                { 
                  token: 'GAMI', 
                  amount: tokenBalance.uiBalance, 
                  usdValue: tokenBalance.uiBalance * 0.1, // Mock value calculation
                  tokenAddress: tokenInfo.address,
                  solscanUrl: tokenInfo.solscanUrl
                }
              ];
              
              return res.status(200).json({ 
                success: true, 
                balances,
                tokenInfo: {
                  address: tokenInfo.address,
                  solscanUrl: tokenInfo.solscanUrl
                }
              });
            } catch (balanceError) {
              console.error('Error fetching token balance:', balanceError);
              // Fall back to mock data if balance fetch fails
            }
          }
        } catch (tokenError) {
          console.error('Error importing token service:', tokenError);
          // Fall back to mock if token service fails
        }
      }
      
      // If we reach here, use mock data
      switch (data.chainType) {
        case 'solana':
          balances = [
            { token: 'SOL', amount: 1.25, usdValue: 125.00 },
            { token: 'GAMI', amount: 500, usdValue: 50.00 },
          ];
          break;
        case 'ethereum':
          balances = [
            { token: 'ETH', amount: 0.5, usdValue: 1000.00 },
            { token: 'GAMI', amount: 300, usdValue: 30.00 },
          ];
          break;
        default:
          balances = [
            { token: data.chainType.toUpperCase(), amount: 10, usdValue: 100.00 },
            { token: 'GAMI', amount: 200, usdValue: 20.00 },
          ];
      }
      
      res.status(200).json({ success: true, balances });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error fetching wallet balances" });
    }
  });
  
  // Send a transaction
  apiRouter.post("/transaction", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const txSchema = z.object({
        fromPublicKey: z.string(),
        chainType: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom']),
        toAddress: z.string(),
        amount: z.number().positive(),
        token: z.string().optional(),
        memo: z.string().optional()
      });
      
      const data = txSchema.parse(req.body);
      
      // Generate a mock transaction hash
      const txHash = `tx_${data.chainType}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // In a real implementation, this would create and send a transaction on the specified blockchain
      res.status(200).json({
        success: true,
        txHash,
        amount: data.amount,
        token: data.token || data.chainType.toUpperCase(),
        timestamp: new Date()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating transaction" });
    }
  });
  
  // Send a Solana transaction (special handler for Solana)
  apiRouter.post("/solana/transaction", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const txSchema = z.object({
        fromPublicKey: z.string(),
        toAddress: z.string(),
        amount: z.number().positive(),
        token: z.string().optional(),
        memo: z.string().optional()
      });
      
      const data = txSchema.parse(req.body);
      
      // Import the token service for actual Solana transactions
      // Only attempt real transactions if token is GAMI
      if (data.token === 'GAMI') {
        try {
          const tokenService = await import('./services/token.service');
          const tokenInfo = tokenService.getCurrentTokenInfo();
          
          if (tokenInfo) {
            // Use the real token service to send the transaction
            const result = await tokenService.transferTokens(
              data.fromPublicKey, 
              data.toAddress, 
              data.amount
            );
            
            return res.status(200).json({
              success: true,
              txHash: result.signature,
              token: 'GAMI',
              amount: data.amount,
              tokenAddress: tokenInfo.address,
              solscanUrl: tokenInfo.solscanUrl,
              timestamp: new Date()
            });
          }
        } catch (tokenError) {
          console.error('Error using token service:', tokenError);
          // Fall back to mock if real implementation fails
        }
      }
      
      // Generate a mock Solana transaction hash if we couldn't use the real implementation
      const txHash = `sol_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      res.status(200).json({
        success: true,
        txHash,
        token: data.token || 'SOL',
        amount: data.amount,
        timestamp: new Date()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating Solana transaction" });
    }
  });
  
  // Cross-chain transfer
  apiRouter.post("/cross-chain/transfer", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const transferSchema = z.object({
        fromChain: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom']),
        toChain: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom']),
        amount: z.number().positive(),
        tokenAddress: z.string(),
        destinationAddress: z.string(),
        walletPublicKey: z.string()
      });
      
      const data = transferSchema.parse(req.body);
      
      // Generate a mock transfer ID and transaction hash
      const transferId = `wh_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const sourceTxHash = `${data.fromChain}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // In a real implementation, this would initiate a cross-chain transfer via Wormhole
      res.status(200).json({
        success: true,
        transferId,
        sourceTxHash,
        fromChain: data.fromChain,
        toChain: data.toChain,
        amount: data.amount,
        tokenAddress: data.tokenAddress,
        timestamp: new Date()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error initiating cross-chain transfer" });
    }
  });
  
  // Get transfer status
  apiRouter.get("/cross-chain/status/:transferId", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const transferId = req.params.transferId;
      
      // In a real implementation, this would query the actual transfer status
      // For demo purposes, return a random status based on the timestamp in the transfer ID
      const timestamp = parseInt(transferId.split('_')[1]);
      const elapsed = Date.now() - timestamp;
      
      let status;
      let txHash;
      
      if (elapsed < 10000) {
        status = 'initiated';
      } else if (elapsed < 20000) {
        status = 'source_transfer_pending';
        txHash = `source_${transferId}`;
      } else if (elapsed < 30000) {
        status = 'source_transfer_complete';
        txHash = `source_${transferId}`;
      } else if (elapsed < 40000) {
        status = 'wormhole_relay_pending';
        txHash = `source_${transferId}`;
      } else if (elapsed < 50000) {
        status = 'destination_transfer_pending';
        txHash = `dest_${transferId}`;
      } else {
        status = 'completed';
        txHash = `dest_${transferId}`;
      }
      
      res.status(200).json({
        success: true,
        transferId,
        status,
        txHash,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching transfer status" });
    }
  });
  
  // Get supported chains
  apiRouter.get("/cross-chain/supported-chains", apiKeyAuth, async (req: Request, res: Response) => {
    // In a real implementation, this would query the actual supported chains
    res.status(200).json({
      success: true,
      chains: ['solana', 'ethereum', 'polygon', 'avalanche', 'bsc']
    });
  });
  
  // Get fee estimate
  apiRouter.get("/cross-chain/fee-estimate", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const fromChain = req.query.fromChain as string;
      const toChain = req.query.toChain as string;
      const amount = parseFloat(req.query.amount as string);
      
      if (!fromChain || !toChain || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid parameters" });
      }
      
      // Calculate a mock fee based on the chains and amount
      let fee = 0;
      let token = '';
      
      if (fromChain === 'solana') {
        fee = 0.001;
        token = 'SOL';
      } else if (fromChain === 'ethereum') {
        fee = 0.005;
        token = 'ETH';
      } else {
        fee = 0.01;
        token = fromChain.toUpperCase();
      }
      
      // Add a small percentage of the amount
      fee += amount * 0.005;
      
      res.status(200).json({
        success: true,
        fee: parseFloat(fee.toFixed(6)),
        token,
        fromChain,
        toChain,
        amount
      });
    } catch (error) {
      res.status(500).json({ error: "Error calculating fee estimate" });
    }
  });
  
  // Get transfer history
  apiRouter.get("/cross-chain/history", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const walletPublicKey = req.query.walletPublicKey as string;
      
      if (!walletPublicKey) {
        return res.status(400).json({ error: "Wallet public key is required" });
      }
      
      // Mock transfer history
      const transfers = [
        {
          id: `wh_${Date.now() - 3600000}_${Math.floor(Math.random() * 1000000)}`,
          fromChain: 'solana',
          toChain: 'ethereum',
          amount: 10,
          token: 'GAMI',
          status: 'completed',
          sourceTxHash: `sol_${Date.now() - 3600000}_${Math.floor(Math.random() * 1000000)}`,
          destinationTxHash: `eth_${Date.now() - 3550000}_${Math.floor(Math.random() * 1000000)}`,
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: `wh_${Date.now() - 7200000}_${Math.floor(Math.random() * 1000000)}`,
          fromChain: 'ethereum',
          toChain: 'solana',
          amount: 5,
          token: 'GAMI',
          status: 'completed',
          sourceTxHash: `eth_${Date.now() - 7200000}_${Math.floor(Math.random() * 1000000)}`,
          destinationTxHash: `sol_${Date.now() - 7150000}_${Math.floor(Math.random() * 1000000)}`,
          timestamp: new Date(Date.now() - 7200000)
        }
      ];
      
      res.status(200).json({
        success: true,
        transfers
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching transfer history" });
    }
  });
  
  // Admin dashboard API endpoints
  
  // Get project stats
  apiRouter.get("/admin/stats", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const [userCount, xpTransactions, activeCampaigns, rewardsDistributed] = await Promise.all([
        storage.getUserCount(project.id),
        storage.getTotalXpTransactions(project.id),
        storage.getActiveCampaignsCount(project.id),
        storage.getTotalRewardsDistributed(project.id)
      ]);
      
      res.status(200).json({
        activeUsers: userCount,
        xpTransactions,
        activeCampaigns,
        rewardsDistributed
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching stats" });
    }
  });
  
  // Get XP events
  apiRouter.get("/admin/events", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      const eventCounts = await storage.getEventCounts(project.id);
      
      res.status(200).json(eventCounts);
    } catch (error) {
      res.status(500).json({ error: "Error fetching events" });
    }
  });
  
  // Get wallet integrations
  apiRouter.get("/admin/wallet-integrations", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      const walletIntegrations = await storage.getWalletIntegrationsByProjectId(project.id);
      
      res.status(200).json(walletIntegrations);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wallet integrations" });
    }
  });
  
  // Update wallet integration
  apiRouter.patch("/admin/wallet-integrations/:id", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const project = (req as any).project;
      const walletIntegration = await storage.getWalletIntegration(id);
      
      if (!walletIntegration) {
        return res.status(404).json({ error: "Wallet integration not found" });
      }
      
      if (walletIntegration.projectId !== project.id) {
        return res.status(403).json({ error: "You don't have access to this wallet integration" });
      }
      
      const updatedWalletIntegration = await storage.updateWalletIntegration(id, {
        isEnabled: req.body.isEnabled !== undefined ? Boolean(req.body.isEnabled) : undefined,
        config: req.body.config !== undefined ? req.body.config : undefined
      });
      
      res.status(200).json(updatedWalletIntegration);
    } catch (error) {
      res.status(500).json({ error: "Error updating wallet integration" });
    }
  });
  
  // Create XP event
  apiRouter.post("/admin/events", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const eventSchema = z.object({
        name: z.string().min(3).max(50),
        description: z.string().optional(),
        xpAmount: z.number().int().positive(),
        status: z.enum(["active", "inactive", "testing"]).default("active")
      });
      
      const data = eventSchema.parse(req.body);
      
      const xpEvent = await storage.createXpEvent({
        projectId: project.id,
        name: data.name,
        description: data.description || null,
        xpAmount: data.xpAmount,
        status: data.status
      });
      
      res.status(201).json(xpEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating XP event" });
    }
  });
  
  // Update XP event
  apiRouter.patch("/admin/events/:id", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const project = (req as any).project;
      const xpEvent = await storage.getXpEvent(id);
      
      if (!xpEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (xpEvent.projectId !== project.id) {
        return res.status(403).json({ error: "You don't have access to this event" });
      }
      
      const updateSchema = z.object({
        name: z.string().min(3).max(50).optional(),
        description: z.string().optional().nullable(),
        xpAmount: z.number().int().positive().optional(),
        status: z.enum(["active", "inactive", "testing"]).optional()
      });
      
      const data = updateSchema.parse(req.body);
      
      const updatedXpEvent = await storage.updateXpEvent(id, data);
      
      res.status(200).json(updatedXpEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error updating XP event" });
    }
  });
  
  // Get campaigns
  apiRouter.get("/admin/campaigns", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      const campaigns = await storage.getCampaignsByProjectId(project.id);
      
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Error fetching campaigns" });
    }
  });
  
  // Create campaign
  apiRouter.post("/admin/campaigns", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const campaignSchema = z.object({
        name: z.string().min(3).max(100),
        description: z.string().optional(),
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str)).optional(),
        rewardAmount: z.number().int().positive().optional(),
        status: z.enum(["active", "inactive", "completed"]).default("active")
      });
      
      const data = campaignSchema.parse(req.body);
      
      const campaign = await storage.createCampaign({
        projectId: project.id,
        name: data.name,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        rewardAmount: data.rewardAmount || null,
        status: data.status
      });
      
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating campaign" });
    }
  });
  
  // ---------------------------------------
  // New MongoDB-powered API endpoints
  // ---------------------------------------
  
  // Status endpoint to check services
  apiRouter.get("/status", (req: Request, res: Response) => {
    res.status(200).json({
      status: "online",
      postgres: true,
      mongodb: isMongoAvailable
    });
  });
  
  // E-commerce integration endpoints
  apiRouter.post("/partner/register", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { registerPartnerSchema } = await import('@shared/schema');
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const validatedData = registerPartnerSchema.parse(req.body);
      const partner = await ecommerceService.registerPartner(validatedData);
      
      res.status(201).json({
        success: true,
        partner: {
          id: partner.id,
          partnerId: partner.partnerId,
          partnerName: partner.partnerName
        }
      });
    } catch (error) {
      console.error('Partner registration error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'PARTNER_REGISTRATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to register partner'
        }
      });
    }
  });

  apiRouter.post("/customer/onboard", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { onboardCustomerSchema } = await import('@shared/schema');
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const validatedData = onboardCustomerSchema.parse(req.body);
      const customer = await ecommerceService.onboardCustomer(validatedData);
      
      res.status(201).json({
        success: true,
        customerId: customer.id,
        universalId: customer.universalId,
        qrCode: customer.qrCode,
        deepLink: customer.deepLink
      });
    } catch (error) {
      console.error('Customer onboarding error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CUSTOMER_ONBOARDING_FAILED',
          message: error instanceof Error ? error.message : 'Failed to onboard customer'
        }
      });
    }
  });

  apiRouter.get("/customer/:universalId/qr", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const universalId = req.params.universalId;
      const format = req.query.format as 'svg' | 'png' | 'dataUrl' || 'svg';
      
      const customer = await ecommerceService.getCustomerByUniversalId(universalId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found'
          }
        });
      }
      
      const qrCode = await ecommerceService.generateQRCode(universalId, format);
      
      res.status(200).json({
        success: true,
        qrCode
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'QR_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to generate QR code'
        }
      });
    }
  });

  apiRouter.get("/customer/:universalId/deeplink", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const universalId = req.params.universalId;
      
      const customer = await ecommerceService.getCustomerByUniversalId(universalId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found'
          }
        });
      }
      
      const partner = await ecommerceService.getPartnerById(customer.partnerId);
      // Convert null to undefined for type compatibility
      const deepLinkUrl = partner?.deepLinkUrl === null ? undefined : partner?.deepLinkUrl;
      const deepLink = ecommerceService.generateDeepLink(universalId, deepLinkUrl);
      
      res.status(200).json({
        success: true,
        deepLink
      });
    } catch (error) {
      console.error('Deep link generation error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'DEEP_LINK_GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to generate deep link'
        }
      });
    }
  });
  
  apiRouter.post("/points/award", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { awardPointsSchema } = await import('@shared/schema');
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const validatedData = awardPointsSchema.parse(req.body);
      
      const result = await ecommerceService.awardPoints(
        validatedData.externalCustomerId,
        validatedData.partnerId,
        validatedData.points,
        validatedData.transactionType,
        validatedData.metadata
      );
      
      res.status(200).json({
        success: true,
        transferId: result.transaction.transferId,
        pointsAmount: validatedData.points,
        balance: result.balance
      });
    } catch (error) {
      console.error('Points award error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'POINTS_AWARD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to award points'
        }
      });
    }
  });
  
  apiRouter.post("/points/redeem", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { redeemPointsSchema } = await import('@shared/schema');
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const validatedData = redeemPointsSchema.parse(req.body);
      
      const result = await ecommerceService.redeemPoints(
        validatedData.externalCustomerId,
        validatedData.partnerId,
        validatedData.points,
        validatedData.purpose,
        validatedData.metadata
      );
      
      res.status(200).json({
        success: true,
        transferId: result.transaction.transferId,
        pointsAmount: validatedData.points,
        balance: result.balance
      });
    } catch (error) {
      console.error('Points redemption error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'POINTS_REDEMPTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to redeem points'
        }
      });
    }
  });
  
  apiRouter.get("/customer/balance", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const externalCustomerId = req.query.externalCustomerId as string;
      const partnerId = req.query.partnerId as string;
      
      if (!externalCustomerId || !partnerId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'externalCustomerId and partnerId are required'
          }
        });
      }
      
      const balance = await ecommerceService.getCustomerBalance(externalCustomerId, partnerId);
      
      if (balance === null) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found'
          }
        });
      }
      
      res.status(200).json({
        success: true,
        balance
      });
    } catch (error) {
      console.error('Balance check error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'BALANCE_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Failed to check balance'
        }
      });
    }
  });
  
  // Activate a shadow account (for customers who didn't have the app when they earned points)
  apiRouter.post("/customer/activate-shadow-account", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { activateShadowAccountSchema } = await import('@shared/schema');
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const validatedData = activateShadowAccountSchema.parse(req.body);
      
      // Activate the shadow account
      const activatedCustomer = await ecommerceService.activateShadowAccount(
        validatedData.claimCode,
        validatedData.walletPublicKey,
        {
          email: validatedData.email,
          phone: validatedData.phone,
          deviceId: validatedData.deviceId
        }
      );
      
      res.status(200).json({
        success: true,
        universalId: activatedCustomer.universalId,
        points: activatedCustomer.points,
        message: 'Shadow account successfully activated and points transferred'
      });
    } catch (error) {
      console.error('Shadow account activation error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'SHADOW_ACCOUNT_ACTIVATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to activate shadow account'
        }
      });
    }
  });
  
  // Check if a claim code is valid and retrieve info about the shadow account
  apiRouter.get("/customer/claim-code/:code", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const claimCode = req.params.code;
      
      // Get customer by claim code
      const customer = await ecommerceService.getCustomerByClaimCode(claimCode);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CLAIM_CODE_NOT_FOUND',
            message: 'No shadow account found with this claim code'
          }
        });
      }
      
      if (!customer.shadowAccount) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ACCOUNT_ALREADY_ACTIVATED',
            message: 'This account has already been activated'
          }
        });
      }
      
      // Get partner info
      const partner = await ecommerceService.getPartnerById(customer.partnerId);
      
      res.status(200).json({
        success: true,
        points: customer.points,
        partnerName: partner?.partnerName || 'Unknown Partner',
        universalId: customer.universalId,
        pendingActivation: true,
        lastActivity: customer.lastActivity
      });
    } catch (error) {
      console.error('Claim code validation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CLAIM_CODE_VALIDATION_FAILED',
          message: 'Failed to validate claim code'
        }
      });
    }
  });
  
  // Get shadow accounts for a partner
  apiRouter.get("/partner/:partnerId/shadow-accounts", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const partnerId = req.params.partnerId;
      
      // Get partner
      const partner = await ecommerceService.getPartnerById(partnerId);
      if (!partner) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PARTNER_NOT_FOUND',
            message: 'Partner not found'
          }
        });
      }
      
      // Get shadow accounts
      const shadowAccounts = await ecommerceService.getPartnerShadowAccounts(partnerId);
      
      res.status(200).json({
        success: true,
        shadowAccounts: shadowAccounts.map(account => ({
          universalId: account.universalId,
          externalCustomerId: account.externalCustomerId,
          name: account.name,
          email: account.email,
          points: account.points,
          claimCode: account.claimCode,
          lastActivity: account.lastActivity
        }))
      });
    } catch (error) {
      console.error('Shadow accounts retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SHADOW_ACCOUNTS_RETRIEVAL_FAILED',
          message: 'Failed to retrieve shadow accounts'
        }
      });
    }
  });
  
  apiRouter.get("/customer/exists", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { ecommerceService } = await import('./services/ecommerce.service');
      
      const externalCustomerId = req.query.externalCustomerId as string;
      const partnerId = req.query.partnerId as string;
      
      if (!externalCustomerId || !partnerId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'externalCustomerId and partnerId are required'
          }
        });
      }
      
      const exists = await ecommerceService.customerExists(externalCustomerId, partnerId);
      
      res.status(200).json({
        success: true,
        exists
      });
    } catch (error) {
      console.error('Customer check error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CUSTOMER_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Failed to check customer'
        }
      });
    }
  });
  
  // Get user profile with achievements and inventory
  apiRouter.get("/users/:externalUserId/profile", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const externalUserId = req.params.externalUserId;
      const project = (req as any).project;
      
      const profile = await gamificationService.getUserProfile(project.id, externalUserId);
      
      res.status(200).json({ success: true, profile });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error fetching user profile" });
    }
  });
  
  // Get user events
  apiRouter.get("/users/:externalUserId/events", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const externalUserId = req.params.externalUserId;
      const project = (req as any).project;
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;
      
      const events = await gamificationService.getUserEvents(project.id, externalUserId, limit, skip);
      
      res.status(200).json({ success: true, events });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error fetching user events" });
    }
  });
  
  // Award achievement
  apiRouter.post("/users/:externalUserId/achievements", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const achievementSchema = z.object({
        achievementId: z.string(),
        title: z.string(),
        description: z.string(),
        imageUrl: z.string().optional(),
        xpAmount: z.number().int().optional(),
        metadata: z.record(z.any()).optional()
      });
      
      const data = achievementSchema.parse(req.body);
      const externalUserId = req.params.externalUserId;
      const project = (req as any).project;
      
      const result = await gamificationService.awardAchievement({
        projectId: project.id,
        externalUserId,
        achievementId: data.achievementId,
        achievementTitle: data.title,
        achievementDescription: data.description,
        imageUrl: data.imageUrl,
        xpAmount: data.xpAmount,
        metadata: data.metadata
      });
      
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error awarding achievement" });
    }
  });
  
  // Add inventory item
  apiRouter.post("/users/:externalUserId/inventory", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const itemSchema = z.object({
        itemId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        attributes: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional()
      });
      
      const data = itemSchema.parse(req.body);
      const externalUserId = req.params.externalUserId;
      const project = (req as any).project;
      
      const result = await gamificationService.addInventoryItem({
        projectId: project.id,
        externalUserId,
        itemId: data.itemId,
        itemName: data.name,
        itemDescription: data.description,
        imageUrl: data.imageUrl,
        quantity: data.quantity,
        attributes: data.attributes,
        metadata: data.metadata
      });
      
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error adding inventory item" });
    }
  });
  
  // Enhanced track endpoint (works with both MongoDB and PostgreSQL)
  apiRouter.post("/track/v2", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const trackSchema = z.object({
        userId: z.string(),
        event: z.string(),
        actionType: z.string().default('default'),
        xpAmount: z.number().int().optional(),
        contextData: z.record(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
        sessionId: z.string().optional()
      });
      
      const data = trackSchema.parse(req.body);
      const project = (req as any).project;
      
      // If xpAmount is not provided, try to find it from event config
      let xpAmount = data.xpAmount;
      if (xpAmount === undefined) {
        const events = await storage.getXpEventsByProjectId(project.id);
        const xpEvent = events.find(event => event.name === data.event);
        
        if (xpEvent) {
          xpAmount = xpEvent.xpAmount;
        } else {
          // Default to 0 if event not found
          xpAmount = 0;
        }
      }
      
      const result = await gamificationService.trackXpEvent({
        projectId: project.id,
        externalUserId: data.userId,
        eventName: data.event,
        actionType: data.actionType,
        xpAmount,
        contextData: data.contextData,
        metadata: data.metadata,
        sessionId: data.sessionId
      });
      
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error tracking event" });
    }
  });
  
  // Get project analytics
  apiRouter.get("/admin/analytics", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const analytics = await gamificationService.getProjectAnalytics(project.id);
      
      res.status(200).json({ success: true, analytics });
    } catch (error) {
      res.status(500).json({ error: "Error fetching analytics" });
    }
  });

  // Get GAMI token info
  apiRouter.get("/token/info", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      // Import the token service
      const tokenService = await import('./services/token.service');
      const tokenInfo = tokenService.getCurrentTokenInfo();
      
      if (tokenInfo) {
        // Get full token info
        const fullTokenInfo = await tokenService.getTokenInfo();
        return res.status(200).json({ 
          success: true, 
          token: fullTokenInfo,
          solscanUrl: tokenInfo.solscanUrl
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: "GAMI token has not been created yet" 
        });
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
      res.status(500).json({ error: "Error fetching token information" });
    }
  });
  
  // Create the GAMI token
  apiRouter.post("/token/create", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      // Import the token service
      const tokenService = await import('./services/token.service');
      const existingToken = tokenService.getCurrentTokenInfo();
      
      if (existingToken) {
        return res.status(400).json({ 
          success: false, 
          message: "GAMI token already exists",
          token: existingToken
        });
      }
      
      // Create the token
      const tokenResult = await tokenService.createToken();
      
      // Mint initial supply
      await tokenService.mintTokens(tokenResult.tokenAddress, 1000000);
      
      // Get token info
      const tokenInfo = await tokenService.getTokenInfo();
      
      return res.status(201).json({
        success: true,
        token: tokenInfo,
        message: "GAMI token created successfully"
      });
    } catch (error) {
      console.error('Error creating token:', error);
      res.status(500).json({ error: "Error creating GAMI token" });
    }
  });
  
  // Register API routes
  // Walrus blockchain storage API endpoints
  // Using a middleware that skips authentication in development mode for easier testing
  const testOrApiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development' && req.path.startsWith('/walrus/')) {
      // Skip authentication for Walrus endpoints in development
      return next();
    }
    // Otherwise use the normal API key authentication
    return apiKeyAuth(req, res, next);
  };
  
  apiRouter.post("/walrus/metadata", testOrApiKeyAuth, async (req: Request, res: Response) => {
    try {
      const metadataSchema = z.object({
        blobId: z.string(),
        metadata: z.record(z.any())
      });
      
      const data = metadataSchema.parse(req.body);
      
      await walrusService.storeMetadata(data.blobId, data.metadata);
      
      res.status(201).json({
        success: true,
        blobId: data.blobId
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error storing Walrus metadata" });
    }
  });
  
  apiRouter.get("/walrus/metadata/:blobId", testOrApiKeyAuth, async (req: Request, res: Response) => {
    try {
      const blobId = req.params.blobId;
      
      const metadata = await walrusService.getMetadata(blobId);
      
      if (!metadata) {
        return res.status(404).json({ error: "Metadata not found" });
      }
      
      res.status(200).json({
        success: true,
        blobId,
        metadata
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching Walrus metadata" });
    }
  });
  
  apiRouter.delete("/walrus/metadata/:blobId", testOrApiKeyAuth, async (req: Request, res: Response) => {
    try {
      const blobId = req.params.blobId;
      
      const success = await walrusService.deleteMetadata(blobId);
      
      if (!success) {
        return res.status(404).json({ error: "Metadata not found" });
      }
      
      res.status(200).json({
        success: true,
        blobId
      });
    } catch (error) {
      res.status(500).json({ error: "Error deleting Walrus metadata" });
    }
  });
  
  apiRouter.get("/walrus/metadata", testOrApiKeyAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const metadata = await walrusService.listMetadata(limit, offset);
      
      res.status(200).json({
        success: true,
        count: metadata.length,
        metadata
      });
    } catch (error) {
      res.status(500).json({ error: "Error listing Walrus metadata" });
    }
  });

  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
