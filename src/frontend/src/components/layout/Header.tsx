import { Activity, HelpCircle, Menu, Moon, Sun, Palette } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ACCENT_COLORS = [
  { name: "Orange", value: "#FF9900", light: "#FFA726" },
  { name: "Purple", value: "#9333EA", light: "#A855F7" },
  { name: "Blue", value: "#0EA5E9", light: "#38BDF8" },
  { name: "Green", value: "#10B981", light: "#34D399" },
  { name: "Pink", value: "#EC4899", light: "#F472B6" },
  { name: "Teal", value: "#14B8A6", light: "#2DD4BF" },
];

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleTheme,
  accentColor,
  setAccentColor
}: HeaderProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

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
          <div className="p-1.5 rounded shadow-md" style={{ backgroundColor: accentColor }}>
            <Activity size={18} className="text-[#232f3e]" />
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

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="text-gray-300 hover:text-white transition-colors p-1.5 rounded hover:bg-[#364150]"
            title="Change accent color"
          >
            <Palette size={18} />
          </button>

          {showColorPicker && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowColorPicker(false)}
              />
              <div className={`absolute right-0 top-12 p-4 rounded-lg shadow-2xl border z-50 min-w-[200px] ${
                darkMode ? "bg-[#1b2635] border-gray-700" : "bg-white border-gray-200"
              }`}>
                <p className={`text-xs font-semibold mb-3 uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Accent Color
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <div key={color.value} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => {
                          setAccentColor(color.value);
                          setShowColorPicker(false);
                        }}
                        className={`w-12 h-12 rounded-lg transition-all hover:scale-110 shadow-md ${
                          accentColor === color.value ? "ring-2 ring-offset-2 scale-105" : ""
                        } ${darkMode ? "ring-offset-gray-800" : "ring-offset-white"}`}
                        style={{ 
                          backgroundColor: color.value,
                          ringColor: accentColor === color.value ? color.value : undefined
                        }}
                        title={color.name}
                      />
                      <span className={`text-[10px] font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {color.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="text-gray-300 hover:text-white transition-colors p-1.5 rounded hover:bg-[#364150]">
          <HelpCircle size={18} />
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button className="flex items-center gap-2 text-sm transition-colors p-1 rounded hover:bg-[#364150]" style={{ color: accentColor }}>
          <span className="font-semibold hidden sm:block text-gray-200">Admin User</span>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A1C9] to-[#0077a3] flex items-center justify-center text-white text-xs font-bold border-2 shadow-md"
            style={{ borderColor: accentColor }}
          >
            AU
          </div>
        </button>
      </div>
    </header>
  );
}
