import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Target,
  User
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  darkMode: boolean;
  accentColor: string;
}

export default function Sidebar({ isOpen, darkMode, accentColor }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Target, label: "Planner", path: "/planner" },
    { icon: TrendingUp, label: "Budgets", path: "/budgets" },
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
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md
                  transition-all duration-200
                  ${
                    isActive
                      ? darkMode
                        ? "bg-[#232f3e] border border-gray-600 shadow-md"
                        : "bg-white border border-gray-200 shadow-sm"
                      : darkMode
                        ? "text-gray-300 hover:bg-[#232f3e] hover:text-white"
                        : "text-gray-700 hover:bg-gray-200 hover:text-[#232f3e]"
                  }
                `}
                style={isActive ? { color: accentColor } : {}}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
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
            onClick={() => navigate("/preferences")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              location.pathname === "/preferences"
                ? darkMode
                  ? "bg-[#232f3e] border border-gray-600 shadow-md"
                  : "bg-white border border-gray-200 shadow-sm"
                : darkMode
                  ? "text-gray-300 hover:bg-[#232f3e] hover:text-white"
                  : "text-gray-700 hover:bg-gray-200"
            }`}
            style={location.pathname === "/preferences" ? { color: accentColor } : {}}
          >
            <Settings size={18} />
            Settings
          </button>
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
        className={`absolute bottom-0 left-0 right-0 border-t ${
          darkMode ? "border-gray-700 bg-[#1b2635]" : "border-gray-300 bg-[#f2f3f3]"
        }`}
      >
        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-700/20">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                  {user.givenName} {user.familyName}
                </p>
                <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="p-4">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 w-full px-2 py-2 transition-colors rounded hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
