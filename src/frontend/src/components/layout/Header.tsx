import { Activity, Bell, HelpCircle, Menu, Moon, Sun } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleTheme
}: HeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-5 z-50 shadow-lg border-b transition-colors duration-300 ${
        darkMode ? "bg-[#232f3e] text-white border-gray-700" : "bg-[#232f3e] text-white border-gray-600"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-[#364150] rounded transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="bg-[#FF9900] p-1.5 rounded text-[#232f3e] shadow-md">
            <Activity size={18} />
          </div>
          <span className="text-white">Coinly</span>
          <span className="text-xs font-normal text-gray-400 mt-1 ml-0.5">
            Console
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="text-gray-300 hover:text-white transition-colors p-1.5 rounded hover:bg-[#364150]"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="text-gray-300 hover:text-white transition-colors relative p-1.5 rounded hover:bg-[#364150]">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        <button className="text-gray-300 hover:text-white transition-colors p-1.5 rounded hover:bg-[#364150]">
          <HelpCircle size={18} />
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button className="flex items-center gap-2 text-sm hover:text-[#FF9900] transition-colors p-1 rounded hover:bg-[#364150]">
          <span className="font-semibold hidden sm:block text-gray-200">Admin User</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A1C9] to-[#0077a3] flex items-center justify-center text-white text-xs font-bold border-2 border-[#FF9900] shadow-md">
            AU
          </div>
        </button>
      </div>
    </header>
  );
}
