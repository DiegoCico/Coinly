import { useState } from "react";
import { X, ArrowLeft, User, Bell, Shield, Palette, Moon, Sun, CreditCard, Plus, Trash2, CheckCircle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  darkMode, 
  toggleTheme, 
  accentColor, 
  setAccentColor 
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("appearance");

  if (!isOpen) return null;

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "banks", label: "Connected Banks", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account", icon: User },
  ];

  const accentColors = [
    { name: "Orange", value: "#FF9900" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Red", value: "#EF4444" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Teal", value: "#14B8A6" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Theme
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                    darkMode
                      ? "bg-[#232f3e] border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } hover:shadow-md`}
                >
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="font-medium">
                    {darkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Accent Color
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-md ${
                      accentColor === color.value
                        ? "ring-2 ring-offset-2"
                        : darkMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{
                      ...(accentColor === color.value && { '--tw-ring-color': color.value } as any),
                      backgroundColor: darkMode ? "#232f3e" : "#ffffff"
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "banks":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Connected Banks
              </h3>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Plus size={16} />
                Connect Bank
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Mock connected banks */}
              {[
                { 
                  name: "Chase Bank", 
                  accountType: "Checking", 
                  lastSync: "2 hours ago",
                  status: "connected",
                  logo: "🏦"
                },
                { 
                  name: "Bank of America", 
                  accountType: "Savings", 
                  lastSync: "1 day ago",
                  status: "connected",
                  logo: "🏛️"
                },
                { 
                  name: "Wells Fargo", 
                  accountType: "Credit Card", 
                  lastSync: "Failed",
                  status: "error",
                  logo: "💳"
                }
              ].map((bank, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode ? "bg-[#232f3e] border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{bank.logo}</div>
                    <div>
                      <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {bank.name}
                      </div>
                      <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {bank.accountType} • Last sync: {bank.lastSync}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {bank.status === "connected" ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span className={`text-sm ${darkMode ? "text-green-400" : "text-green-600"}`}>
                            Connected
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-red-500" />
                          <span className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"}`}>
                            Error
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg border-2 border-dashed ${
              darkMode ? "border-gray-600 bg-[#1a2332]" : "border-gray-300 bg-gray-50"
            }`}>
              <div className="text-center">
                <CreditCard size={32} className={`mx-auto mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Connect More Banks
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Add more bank accounts to get a complete view of your finances
                </p>
                <button
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  Add Bank Account
                </button>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {[
                { label: "Portfolio Updates", description: "Get notified about significant portfolio changes" },
                { label: "Market Alerts", description: "Receive alerts about market movements" },
                { label: "Goal Progress", description: "Updates on your financial planning goals" },
                { label: "Weekly Summary", description: "Weekly portfolio performance summary" },
              ].map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode ? "bg-[#232f3e] border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {item.label}
                    </div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {item.description}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Privacy Settings
            </h3>
            <div className="space-y-4">
              {[
                { label: "Hide Portfolio Values", description: "Show ••••• instead of actual amounts" },
                { label: "Anonymous Analytics", description: "Help improve the app with anonymous usage data" },
                { label: "Data Export", description: "Download your data at any time" },
              ].map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode ? "bg-[#232f3e] border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {item.label}
                    </div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {item.description}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                darkMode ? "bg-[#232f3e] border-gray-600" : "bg-gray-50 border-gray-200"
              }`}>
                <div className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Email Address
                </div>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              
              <div className={`p-4 rounded-lg border ${
                darkMode ? "bg-[#232f3e] border-gray-600" : "bg-gray-50 border-gray-200"
              }`}>
                <div className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Password
                </div>
                <button className={`px-4 py-2 rounded-md border transition-colors ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}>
                  Change Password
                </button>
              </div>

              <div className={`p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800`}>
                <div className="font-medium mb-2 text-red-800 dark:text-red-400">
                  Danger Zone
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-4xl h-[600px] rounded-xl shadow-2xl flex flex-col ${
          darkMode ? "bg-[#1b2635]" : "bg-white"
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <div className={`w-64 p-6 border-r flex-shrink-0 ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === tab.id
                        ? darkMode
                          ? "bg-[#232f3e] text-white"
                          : "bg-gray-100 text-gray-900"
                        : darkMode
                        ? "text-gray-400 hover:bg-[#232f3e] hover:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    style={activeTab === tab.id ? { color: accentColor } : {}}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 p-6 border-t flex-shrink-0 ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}