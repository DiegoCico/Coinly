import { z } from 'zod';
import { router, protectedProcedure } from './trpc';

// Mock investment data for demo purposes
const DEMO_INVESTMENTS = {
  portfolio: {
    totalValue: 125847.32,
    totalGain: 18234.67,
    totalGainPercent: 16.9,
    dayChange: 1247.83,
    dayChangePercent: 1.0,
    cash: 8450.00,
    invested: 117397.32
  },
  holdings: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 125,
      price: 148.50,
      value: 18562.50,
      dayChange: 2.35,
      dayChangePercent: 1.61,
      totalReturn: 3420.50,
      totalReturnPercent: 22.6,
      sector: "Technology",
      allocation: 14.7
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 45,
      price: 338.25,
      value: 15221.25,
      dayChange: -1.85,
      dayChangePercent: -0.54,
      totalReturn: 2890.25,
      totalReturnPercent: 23.4,
      sector: "Technology",
      allocation: 12.1
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 95,
      price: 134.80,
      value: 12806.00,
      dayChange: 3.20,
      dayChangePercent: 2.43,
      totalReturn: 1950.00,
      totalReturnPercent: 17.9,
      sector: "Technology",
      allocation: 10.2
    }
  ],
  performance: {
    "1d": { return: 1.0, value: 125847.32 },
    "1w": { return: 2.3, value: 123000.00 },
    "1m": { return: 4.7, value: 120200.00 },
    "3m": { return: 8.9, value: 115600.00 },
    "6m": { return: 12.1, value: 112280.00 },
    "1y": { return: 16.9, value: 107612.65 },
    "5y": { return: 89.3, value: 66500.00 },
    "all": { return: 147.2, value: 51000.00 }
  }
};

export const investmentsRouter = router({
  // Get portfolio overview
  getPortfolio: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.userId;
      
      // For demo mode, return mock data
      if (userId.startsWith('demo_user')) {
        return DEMO_INVESTMENTS.portfolio;
      }
      
      // In production, this would fetch real investment data from your broker API
      // For now, return demo data for all users
      return DEMO_INVESTMENTS.portfolio;
    }),

  // Get holdings
  getHoldings: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.userId;
      
      // For demo mode, return mock data
      if (userId.startsWith('demo_user')) {
        return DEMO_INVESTMENTS.holdings;
      }
      
      // In production, this would fetch real holdings data
      return DEMO_INVESTMENTS.holdings;
    }),

  // Get performance data
  getPerformance: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['1d', '1w', '1m', '3m', '6m', '1y', '5y', 'all']).default('1y')
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      
      // For demo mode, return mock data
      if (userId.startsWith('demo_user')) {
        return DEMO_INVESTMENTS.performance[input.timeRange];
      }
      
      // In production, this would fetch real performance data
      return DEMO_INVESTMENTS.performance[input.timeRange];
    }),

  // Get asset allocation
  getAllocation: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.userId;
      
      const allocation = [
        { name: "US Stocks", percentage: 59.9, value: 75420, color: "#3b82f6" },
        { name: "International", percentage: 14.8, value: 18650, color: "#10b981" },
        { name: "Bonds", percentage: 12.1, value: 15230, color: "#f59e0b" },
        { name: "Cash", percentage: 6.7, value: 8450, color: "#6b7280" },
        { name: "REITs", percentage: 4.1, value: 5097, color: "#8b5cf6" },
        { name: "Commodities", percentage: 2.4, value: 3000, color: "#ef4444" }
      ];
      
      // For demo mode, return mock data
      if (userId.startsWith('demo_user')) {
        return allocation;
      }
      
      // In production, this would calculate real allocation
      return allocation;
    }),

  // Get diversification metrics
  getDiversification: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.userId;
      
      const diversification = {
        overallScore: 78,
        geographic: { score: 85, breakdown: { US: 65, Europe: 20, Asia: 12, Emerging: 3 } },
        sector: { score: 78, breakdown: { Technology: 35, Healthcare: 15, Financial: 12, Consumer: 18, Other: 20 } },
        marketCap: { score: 72, breakdown: { "Large Cap": 70, "Mid Cap": 20, "Small Cap": 10 } }
      };
      
      // For demo mode, return mock data
      if (userId.startsWith('demo_user')) {
        return diversification;
      }
      
      // In production, this would calculate real diversification metrics
      return diversification;
    })
});