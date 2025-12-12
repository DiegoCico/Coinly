// Simple API service - can be replaced with tRPC client later
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  planType: 'trip' | 'house' | 'car' | 'education' | 'emergency' | 'other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  partnerContribution: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  milestones: Array<{
    id: string;
    title: string;
    targetAmount: number;
    targetDate: string;
    completed: boolean;
    completedAt?: string;
  }>;
  expenses: Array<{
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    isRecurring: boolean;
    recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  }>;
}

export interface CreatePlanInput {
  title: string;
  description?: string;
  planType: Plan['planType'];
  targetAmount: number;
  targetDate: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  partnerContribution: number;
}

export interface ProgressUpdate {
  planId: string;
  amount: number;
  note?: string;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const tokens = this.getStoredTokens();
    return tokens.accessToken 
      ? { 'Authorization': `Bearer ${tokens.accessToken}` }
      : {};
  }

  private getStoredTokens(): Partial<{ accessToken: string; idToken: string; refreshToken: string }> {
    try {
      const stored = localStorage.getItem('auth_tokens');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear tokens and redirect to login
        localStorage.removeItem('auth_tokens');
        window.location.href = '/signin';
        throw new Error('Authentication required');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    const response = await this.request('/trpc/planner.getPlans');
    return response.result?.data || response;
  }

  async getPlan(planId: string): Promise<Plan> {
    const response = await this.request(`/trpc/planner.getPlan?input=${encodeURIComponent(JSON.stringify({ planId }))}`);
    return response.result?.data || response;
  }

  async createPlan(input: CreatePlanInput): Promise<Plan> {
    const response = await this.request('/trpc/planner.createPlan', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.result?.data || response;
  }

  async updatePlan(planId: string, updates: Partial<CreatePlanInput>): Promise<{ success: boolean }> {
    const response = await this.request('/trpc/planner.updatePlan', {
      method: 'POST',
      body: JSON.stringify({ id: planId, ...updates }),
    });
    return response.result?.data || response;
  }

  async updateProgress(update: ProgressUpdate): Promise<{ success: boolean }> {
    const response = await this.request('/trpc/planner.updateProgress', {
      method: 'POST',
      body: JSON.stringify(update),
    });
    return response.result?.data || response;
  }

  async deletePlan(planId: string): Promise<{ success: boolean }> {
    const response = await this.request('/trpc/planner.deletePlan', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    return response.result?.data || response;
  }

  async getAnalytics(): Promise<{
    totalPlans: number;
    activePlans: number;
    completedPlans: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    totalMonthlySavings: number;
    totalPartnerContribution: number;
    overallProgress: number;
    plansByType: Record<string, { count: number; totalTarget: number; totalCurrent: number }>;
  }> {
    const response = await this.request('/trpc/planner.getAnalytics');
    return response.result?.data || response;
  }

  async getProgressHistory(planId: string): Promise<Array<{
    planId: string;
    amount: number;
    note?: string;
    createdAt: string;
  }>> {
    const response = await this.request(`/trpc/planner.getProgressHistory?input=${encodeURIComponent(JSON.stringify({ planId }))}`);
    return response.result?.data || response;
  }

  async seedDemoData(): Promise<{ success: boolean; message: string; count: number }> {
    const response = await this.request('/trpc/planner.seedDemoData', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response.result?.data || response;
  }
}

export const apiService = new ApiService();