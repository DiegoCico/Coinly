import { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette, 
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Building,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BankAccount {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: string;
  accountSubtype: string;
  mask: string;
  balance: {
    available: number;
    current: number;
    currency: string;
  };
  isActive: boolean;
  nickname?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Preferences() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showBalances, setShowBalances] = useState(false);
  const [isConnectingBank, setIsConnectingBank] = useState(false);

  // Form states
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'dark',
    currency: user?.preferences?.currency || 'USD',
    notifications: {
      email: user?.preferences?.notifications?.email || true,
      milestones: user?.preferences?.notifications?.milestones || true,
      reminders: user?.preferences?.notifications?.reminders || true,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'banking', label: 'Bank Accounts', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  useEffect(() => {
    if (activeTab === 'banking') {
      fetchBankAccounts();
    }
  }, [activeTab]);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/plaid.getAccounts`, {
        headers: {
          'Authorization': `Bearer ${getStoredTokens().accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBankAccounts(data.result?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectBankAccount = async () => {
    try {
      setIsConnectingBank(true);
      
      // First, get a link token
      const linkTokenResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/plaid.createLinkToken`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredTokens().accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: 'Coinly Financial Planner'
        }),
      });

      if (linkTokenResponse.ok) {
        const linkData = await linkTokenResponse.json();
        const linkToken = linkData.result?.data?.linkToken;

        if (linkToken) {
          // In a real implementation, you would use Plaid Link here
          // For demo purposes, we'll simulate the connection
          console.log('Link token received:', linkToken);
          
          // Simulate successful connection
          setTimeout(async () => {
            const exchangeResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/plaid.exchangeToken`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getStoredTokens().accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                publicToken: 'demo-public-token'
              }),
            });

            if (exchangeResponse.ok) {
              await fetchBankAccounts();
            }
            setIsConnectingBank(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to connect bank account:', error);
      setIsConnectingBank(false);
    }
  };

  const refreshBalances = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/plaid.refreshBalances`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredTokens().accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchBankAccounts();
      }
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/plaid.removeAccount`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredTokens().accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId
        }),
      });

      if (response.ok) {
        await fetchBankAccounts();
      }
    } catch (error) {
      console.error('Failed to remove account:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setIsLoading(true);
      await updateProfile({ preferences });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredTokens = () => {
    try {
      const stored = localStorage.getItem('auth_tokens');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string, subtype: string) => {
    if (type === 'depository') {
      return subtype === 'checking' ? '🏦' : '💰';
    } else if (type === 'credit') {
      return '💳';
    } else if (type === 'investment') {
      return '📈';
    }
    return '🏛️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1b2a] to-[#1a2332] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Preferences</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#232f3e] rounded-lg p-4 border border-gray-700">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#FF9900] text-[#232f3e] font-medium'
                          : 'text-gray-300 hover:bg-[#364150] hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-[#232f3e] rounded-lg border border-gray-700">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Theme Preference
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'light', label: 'Light Mode', icon: '☀️' },
                          { value: 'dark', label: 'Dark Mode', icon: '🌙' }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => setPreferences(prev => ({ ...prev, theme: theme.value as 'light' | 'dark' }))}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              preferences.theme === theme.value
                                ? 'border-[#FF9900] bg-[#FF9900]/10'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <div className="text-2xl mb-2">{theme.icon}</div>
                            <div className="text-white font-medium">{theme.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Default Currency
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </div>

                    <button
                      onClick={savePreferences}
                      disabled={isLoading}
                      className="w-full bg-[#FF9900] text-[#232f3e] py-3 px-4 rounded-lg font-semibold hover:bg-[#FF9900]/90 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Accounts */}
              {activeTab === 'banking' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Bank Accounts</h2>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowBalances(!showBalances)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
                      >
                        {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showBalances ? 'Hide' : 'Show'} Balances
                      </button>
                      <button
                        onClick={refreshBalances}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="space-y-4 mb-6">
                    {bankAccounts.length === 0 ? (
                      <div className="text-center py-8">
                        <Building size={48} className="mx-auto text-gray-500 mb-4" />
                        <p className="text-gray-400 mb-4">No bank accounts connected</p>
                        <p className="text-sm text-gray-500">Connect your bank account to track spending and automate savings</p>
                      </div>
                    ) : (
                      bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="p-4 bg-[#1a2332] border border-gray-600 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">
                                {getAccountTypeIcon(account.accountType, account.accountSubtype)}
                              </div>
                              <div>
                                <h3 className="font-medium text-white">
                                  {account.nickname || account.accountName}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {account.institutionName} •••• {account.mask}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {account.accountSubtype} account
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {showBalances && (
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-white">
                                    {formatCurrency(account.balance.current, account.balance.currency)}
                                  </div>
                                  {account.balance.available !== account.balance.current && (
                                    <div className="text-sm text-gray-400">
                                      Available: {formatCurrency(account.balance.available, account.balance.currency)}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <button
                                onClick={() => removeAccount(account.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                title="Disconnect account"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Connect New Account */}
                  <button
                    onClick={connectBankAccount}
                    disabled={isConnectingBank}
                    className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-[#FF9900] hover:text-[#FF9900] transition-colors disabled:opacity-50"
                  >
                    {isConnectingBank ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        Connect Bank Account
                      </>
                    )}
                  </button>

                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-300 mb-1">Secure Connection</h4>
                        <p className="text-xs text-blue-200/80">
                          Your bank credentials are encrypted and never stored on our servers. 
                          We use Plaid's secure API to connect to your bank.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    {[
                      {
                        key: 'email',
                        title: 'Email Notifications',
                        description: 'Receive important updates via email'
                      },
                      {
                        key: 'milestones',
                        title: 'Milestone Alerts',
                        description: 'Get notified when you reach savings milestones'
                      },
                      {
                        key: 'reminders',
                        title: 'Savings Reminders',
                        description: 'Weekly reminders to update your progress'
                      }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 bg-[#1a2332] border border-gray-600 rounded-lg">
                        <div>
                          <h3 className="font-medium text-white">{notification.title}</h3>
                          <p className="text-sm text-gray-400">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.notifications[notification.key as keyof typeof preferences.notifications]}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [notification.key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF9900]"></div>
                        </label>
                      </div>
                    ))}

                    <button
                      onClick={savePreferences}
                      disabled={isLoading}
                      className="w-full bg-[#FF9900] text-[#232f3e] py-3 px-4 rounded-lg font-semibold hover:bg-[#FF9900]/90 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-[#1a2332] border border-gray-600 rounded-lg">
                      <h3 className="font-medium text-white mb-2">Password</h3>
                      <p className="text-sm text-gray-400 mb-4">Change your account password</p>
                      <button className="px-4 py-2 bg-[#FF9900] text-[#232f3e] rounded-lg font-medium hover:bg-[#FF9900]/90 transition-colors">
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 bg-[#1a2332] border border-gray-600 rounded-lg">
                      <h3 className="font-medium text-white mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:border-gray-400 hover:text-white transition-colors">
                        Enable 2FA
                      </button>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <h3 className="font-medium text-red-300 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-200/80 mb-4">Permanently delete your account and all data</p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}