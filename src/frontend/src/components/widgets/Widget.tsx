import { useState } from "react";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";

interface WidgetProps {
  id: string;
  title: string;
  colSpan: number;
  darkMode: boolean;
  onResize: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  isDragging: string | null;
  children: React.ReactNode;
}

export default function Widget({
  id,
  title,
  colSpan,
  darkMode,
  onResize,
  onDragStart,
  onDrop,
  onDragEnter,
  isDragging,
  children
}: WidgetProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const spanClass =
    {
      1: "lg:col-span-1",
      2: "lg:col-span-2",
      3: "lg:col-span-3"
    }[colSpan] || "lg:col-span-1";

  return (
    <div
      id={`widget-${id}`}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragEnter={(e) => {
        if (isDragging !== id) {
          onDragEnter(e, id);
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        onDrop(e, id);
        setIsDragOver(false);
      }}
      onDragEnd={() => setIsDragOver(false)}
      onDragOver={(e) => e.preventDefault()}
      className={`
        ${spanClass}
        rounded-lg shadow-xl overflow-hidden flex flex-col min-h-[28rem] border transition-all duration-300 ease-in-out
        ${darkMode ? "bg-[#232f3e] border-gray-700 hover:shadow-2xl" : "bg-white border-gray-200 hover:shadow-2xl"}
        ${isDragging === id ? "opacity-30 border-4 border-dashed border-[#FF9900]" : ""}
        ${isDragOver ? "ring-4 ring-[#FF9900]/50 scale-[1.02]" : ""}
      `}
    >
      {/* Header */}
      <div
        className={`
          px-4 py-3 border-b flex justify-between items-center cursor-grab active:cursor-grabbing
          transition-colors duration-200
          ${darkMode ? "border-gray-700 bg-gradient-to-r from-[#2a384b] to-[#232f3e]" : "border-gray-100 bg-gradient-to-r from-gray-50 to-white"}
        `}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={14} className={darkMode ? "text-gray-500" : "text-gray-400"} />
          <h3 className={`font-semibold text-sm ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            {title}
          </h3>
        </div>

        <button
          onClick={() => onResize(id)}
          className={`p-1.5 rounded transition-colors ${
            darkMode ? "text-gray-400 hover:text-[#FF9900] hover:bg-gray-700" : "text-gray-500 hover:text-[#FF9900] hover:bg-gray-100"
          }`}
          title={`Current Size: ${colSpan} column${colSpan > 1 ? 's' : ''}. Click to resize.`}
        >
          {colSpan === 3 ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
