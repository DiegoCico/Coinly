import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  darkMode: boolean;
  accentColor: string;
}

export default function Sidebar({ isOpen, darkMode, accentColor }: SidebarProps) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Wallet, label: "Cost Management" },
    { icon: CreditCard, label: "Billing" },
    { icon: TrendingUp, label: "Budgets" },
    { icon: Settings, label: "Preferences" }
  ];

  return (
    <aside
      className={`
        fixed left-0 top-14 bottom-0 w-64 border-r z-40 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${darkMode ? "bg-[#1b2635] border-gray-700" : "bg-[#f2f3f3] border-gray-300"}
      `}
    >
      <div className="p-4 overflow-y-auto h-[calc(100vh-8rem)]">
        <div
          className={`text-xs font-bold uppercase tracking-wider mb-3 px-3 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Main Navigation
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md
                transition-all duration-200
                ${
                  item.active
                    ? darkMode
                      ? "bg-[#232f3e] border border-gray-600 shadow-md"
                      : "bg-white border border-gray-200 shadow-sm"
                    : darkMode
                      ? "text-gray-300 hover:bg-[#232f3e] hover:text-white"
                      : "text-gray-700 hover:bg-gray-200 hover:text-[#232f3e]"
                }
              `}
              style={item.active ? { color: accentColor } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div
          className={`text-xs font-bold uppercase tracking-wider mb-3 px-3 mt-8 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Resources
        </div>

        <nav className="space-y-1.5">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              darkMode ? "text-gray-300 hover:bg-[#232f3e] hover:text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <HelpCircle size={18} />
            Documentation
          </button>
        </nav>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          darkMode ? "border-gray-700 bg-[#1b2635]" : "border-gray-300 bg-[#f2f3f3]"
        }`}
      >
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 w-full px-2 py-2 transition-colors rounded hover:bg-red-500/10">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
