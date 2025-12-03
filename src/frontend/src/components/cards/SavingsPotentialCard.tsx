import { Zap } from "lucide-react";
import { SAVINGS_DATA } from "../../data/mockData";

interface Props {
  darkMode: boolean;
}

export default function SavingsPotentialCard({ darkMode }: Props) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex-1 space-y-3">
        {SAVINGS_DATA.map((item, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border flex items-start gap-3 transition-all duration-200 cursor-pointer ${
              darkMode
                ? "bg-gradient-to-br from-[#2a384b] to-[#232f3e] border-gray-600 hover:shadow-lg hover:border-green-500/50"
                : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-md hover:border-green-500/50"
            }`}
          >
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Zap size={20} className="text-green-500 flex-shrink-0" />
            </div>

            <div className="flex-grow">
              <p className={`${darkMode ? "text-green-400" : "text-green-700"} font-semibold text-sm`}>
                {item.opportunity}
              </p>

              <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {item.description}
              </p>
            </div>

            <span className={`text-lg font-bold flex-shrink-0 ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
              +${item.potential}
            </span>
          </div>
        ))}
      </div>

      <div className={`pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <p className={`text-xs text-right font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Total potential annual savings: <span className="text-green-500 font-bold">$4,800</span>
        </p>
      </div>
    </div>
  );
}
