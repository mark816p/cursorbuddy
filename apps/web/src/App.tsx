import React, { useState, useEffect } from "react";
import {
  Download,
  Mic,
  Monitor,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  CheckCircle2,
  Copy,
  Lock,
  ChevronDown,
  Sparkles,
  MousePointer,
  Volume2,
  RefreshCw,
  Laptop,
  Code2,
  Box,
  FileSpreadsheet,
  Palette,
  AlertTriangle,
  Radio,
  Star,
  Cpu,
  Check,
  Keyboard,
  Folder,
  Search,
  GitBranch,
  Play,
  Wrench,
  Move,
  Layers,
  Table,
  Filter,
  BarChart3,
  Sliders,
  Square,
  Type,
  Columns,
  Grid,
} from "lucide-react";

// Direct GitHub Release Download Links
const GITHUB_REPO_URL = "https://github.com/mark816p/cursorbuddy";
const WINDOWS_EXE_URL =
  "https://github.com/mark816p/cursorbuddy/releases/latest/download/Cursorbuddy_0.1.0_x64-setup.exe";
const RELEASES_PAGE_URL = "https://github.com/mark816p/cursorbuddy/releases";

interface Scenario {
  id: "vscode" | "blender" | "excel" | "figma";
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  userQuestion: string;
  spokenGuidance: string;
  targetButtonLabel: string;
  stepNumber: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "vscode",
    name: "VS Code / IDE",
    category: "Software Engineering",
    icon: Code2,
    userQuestion: "How do I format this document with Prettier?",
    spokenGuidance: "Click the 'Format Document' icon in the top right editor tab bar or press Shift+Alt+F.",
    targetButtonLabel: "Format Document",
    stepNumber: 1,
  },
  {
    id: "blender",
    name: "Blender 3D",
    category: "3D Animation & CAD",
    icon: Box,
    userQuestion: "Where do I find the Subdivision Surface modifier?",
    spokenGuidance: "Click the blue wrench 'Modifier Properties' tab on the right panel, then select 'Add Modifier'.",
    targetButtonLabel: "Modifier Properties > Add Modifier",
    stepNumber: 1,
  },
  {
    id: "excel",
    name: "Excel / Sheets",
    category: "Financial Analytics",
    icon: FileSpreadsheet,
    userQuestion: "How do I create a dynamic Pivot Table from this data?",
    spokenGuidance: "Click 'Insert' in the top ribbon menu, then click the 'PivotTable' button on the far left.",
    targetButtonLabel: "Insert > PivotTable",
    stepNumber: 1,
  },
  {
    id: "figma",
    name: "Figma / UI Design",
    category: "Creative Design",
    icon: Palette,
    userQuestion: "How do I turn on Auto-Layout wrapping for this frame?",
    spokenGuidance: "In the right Design sidebar, look under 'Auto layout' and toggle the third icon for 'Wrap'.",
    targetButtonLabel: "Auto Layout > Wrap Items",
    stepNumber: 1,
  },
];

export const App: React.FC = () => {
  // Scenario & Simulator State
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isPressingHotkey, setIsPressingHotkey] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  // Simulator timing effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPressingHotkey) {
      setDemoState("listening");
    } else if (demoState === "listening") {
      setDemoState("thinking");
      timer = setTimeout(() => {
        setDemoState("speaking");
      }, 850);
    }
    return () => clearTimeout(timer);
  }, [isPressingHotkey, demoState]);

  const resetDemo = () => {
    setDemoState("idle");
    setIsPressingHotkey(false);
  };

  const copyShortcuts = () => {
    navigator.clipboard.writeText("Ctrl + Alt");
    setCopiedShortcut(true);
    setTimeout(() => setCopiedShortcut(false), 2000);
  };

  // Render authentic workspace for VS Code
  const renderVsCodeWorkspace = () => (
    <div className="flex-1 flex overflow-hidden font-mono text-xs select-none">
      {/* Activity Bar */}
      <div className="w-11 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 justify-between text-slate-500 shrink-0">
        <div className="space-y-4 flex flex-col items-center">
          <div className="text-white border-l-2 border-blue-500 pl-1">
            <Folder className="w-4 h-4 text-blue-400" />
          </div>
          <Search className="w-4 h-4 hover:text-slate-300 transition" />
          <GitBranch className="w-4 h-4 hover:text-slate-300 transition" />
          <Play className="w-4 h-4 hover:text-slate-300 transition" />
        </div>
        <Sliders className="w-4 h-4 hover:text-slate-300 transition" />
      </div>

      {/* Explorer Sidebar */}
      <div className="w-44 bg-slate-900/90 border-r border-slate-800 p-3 hidden sm:flex flex-col text-[11px] text-slate-400 shrink-0">
        <div className="font-bold text-[10px] text-slate-300 uppercase tracking-wider mb-2">Explorer</div>
        <div className="space-y-1">
          <div className="text-slate-500">&gt; node_modules</div>
          <div className="text-slate-300 font-semibold">v src/</div>
          <div className="pl-3 text-blue-400 font-bold bg-blue-600/10 px-1 py-0.5 rounded">App.tsx •</div>
          <div className="pl-3 hover:text-slate-200">index.css</div>
          <div className="pl-3 hover:text-slate-200">main.tsx</div>
          <div className="text-slate-500">package.json</div>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 flex flex-col bg-slate-950/70 overflow-hidden">
        {/* Editor Tabs Header */}
        <div className="bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 h-9 shrink-0">
          <div className="flex items-center">
            <div className="bg-slate-900 border-t-2 border-blue-500 px-3 py-1.5 text-xs text-white flex items-center gap-2">
              <span className="text-blue-400 font-bold">TSX</span>
              <span>App.tsx</span>
              <span className="text-slate-500 text-[10px]">✕</span>
            </div>
            <div className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300">index.css</div>
          </div>

          {/* Target Button: Format Document */}
          <div className="flex items-center gap-2">
            <button
              id="vscode-format-btn"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/50 rounded flex items-center gap-1.5 text-[11px] font-sans font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Format Document</span>
            </button>
            <Play className="w-3.5 h-3.5 text-emerald-400 cursor-pointer" />
          </div>
        </div>

        {/* Code Lines Area */}
        <div className="p-4 space-y-1.5 overflow-hidden text-xs font-mono leading-relaxed text-slate-300">
          <div className="text-slate-600">
            <span className="text-slate-600 mr-4 select-none">1</span>
            <span className="text-purple-400">import</span> React, &#123; useState &#125;{" "}
            <span className="text-purple-400">from</span> <span className="text-emerald-400">"react"</span>;
          </div>
          <div>
            <span className="text-slate-600 mr-4 select-none">2</span>
            <span className="text-purple-400">import</span> &#123; Companion &#125;{" "}
            <span className="text-purple-400">from</span> <span className="text-emerald-400">"@cursorbuddy/sdk"</span>;
          </div>
          <div>
            <span className="text-slate-600 mr-4 select-none">3</span>
          </div>
          <div>
            <span className="text-slate-600 mr-4 select-none">4</span>
            <span className="text-blue-400">export const</span> <span className="text-amber-300">WorkspaceView</span> = () =&gt; &#123;
          </div>
          <div className="pl-4">
            <span className="text-slate-600 mr-4 select-none">5</span>
            <span className="text-blue-400">const</span> [active, setActive] = useState(
            <span className="text-amber-300">true</span>);
          </div>
          <div className="pl-4 text-slate-500">
            <span className="text-slate-600 mr-4 select-none">6</span>
            // Unformatted line: needs Prettier alignment
          </div>
          <div className="pl-4 bg-blue-950/20 py-0.5 rounded border-l-2 border-amber-400">
            <span className="text-slate-600 mr-4 select-none">7</span>
            <span className="text-blue-400">const</span> settings = &#123;hotkey:<span className="text-emerald-400">"Ctrl+Alt"</span>,mode:<span className="text-emerald-400">"zero-disk"</span>,buffer:<span className="text-emerald-400">"RAM"</span>&#125;;
          </div>
          <div className="pl-4">
            <span className="text-slate-600 mr-4 select-none">8</span>
            <span className="text-purple-400">return</span> &lt;<span className="text-teal-300">CompanionCanvas</span> overlay=&#123;active&#125; /&gt;;
          </div>
          <div>
            <span className="text-slate-600 mr-4 select-none">9</span>
            &#125;;
          </div>
        </div>

        {/* VS Code Status Bar */}
        <div className="mt-auto bg-blue-600/20 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Ln 7, Col 18</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <span>TypeScript React</span>
            <span>Prettier: Warning</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render authentic workspace for Blender 3D
  const renderBlenderWorkspace = () => (
    <div className="flex-1 flex overflow-hidden font-sans text-xs select-none bg-slate-950">
      {/* 3D Viewport Tool Strip */}
      <div className="w-10 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 gap-3 text-slate-400 shrink-0">
        <div className="p-1.5 bg-blue-600 text-white rounded-lg">
          <MousePointer className="w-4 h-4" />
        </div>
        <Move className="w-4 h-4 hover:text-white cursor-pointer" />
        <RefreshCw className="w-4 h-4 hover:text-white cursor-pointer" />
        <Square className="w-4 h-4 hover:text-white cursor-pointer" />
        <Grid className="w-4 h-4 hover:text-white cursor-pointer" />
      </div>

      {/* Main 3D Viewport Area */}
      <div className="flex-1 flex flex-col bg-slate-950/90 relative overflow-hidden">
        {/* Top Viewport Header */}
        <div className="bg-slate-900/80 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">Layout</span>
            <span className="text-slate-400">Modeling</span>
            <span className="text-slate-400">Sculpting</span>
            <span className="text-slate-400">UV Editing</span>
            <span className="text-slate-400">Shading</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">User Perspective • Collection &gt; Cube</div>
        </div>

        {/* 3D Isometric Viewport Wireframe */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          {/* Coordinate axes */}
          <div className="absolute inset-x-8 top-1/2 h-[1px] bg-rose-500/30" />
          <div className="absolute inset-y-8 left-1/2 w-[1px] bg-emerald-500/30" />

          {/* 3D Cube Geometry with volumetric highlights */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              {/* Top face */}
              <polygon points="50,15 85,32 50,50 15,32" fill="#3b82f6" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
              {/* Left face */}
              <polygon points="15,32 50,50 50,85 15,67" fill="#1d4ed8" fillOpacity="0.5" stroke="#3b82f6" strokeWidth="1.5" />
              {/* Right face */}
              <polygon points="50,50 85,32 85,67 50,85" fill="#1e40af" fillOpacity="0.6" stroke="#2563eb" strokeWidth="1.5" />
            </svg>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-blue-300 font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-blue-500/30">
              SubD Level: 0
            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Playback 0 / 250</span>
          <span>FPS: 60.0 • No Modifiers Active</span>
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="w-56 bg-slate-900 border-l border-slate-800 p-3 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          {/* Vertical property icon pills */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 text-slate-400">
            <Box className="w-4 h-4 text-slate-500" />
            <Layers className="w-4 h-4 text-slate-500" />
            {/* The Target Wrench Icon */}
            <div className="p-1 bg-blue-600 text-white rounded">
              <Wrench className="w-4 h-4" />
            </div>
            <Grid className="w-4 h-4 text-slate-500" />
          </div>

          <div className="font-bold text-xs text-white">Modifier Properties</div>
          <p className="text-[11px] text-slate-400">Add generative mesh deformers to active object.</p>

          {/* The Target Action Button */}
          <button
            id="blender-modifier-btn"
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg shadow-blue-600/30 transition"
          >
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Add Modifier</span>
            </span>
            <span className="text-[10px] bg-blue-700 px-1.5 py-0.5 rounded font-mono">SubD</span>
          </button>

          <div className="space-y-1.5 pt-2 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Viewport Levels:</span>
              <span className="font-mono text-white">2</span>
            </div>
            <div className="flex justify-between">
              <span>Render Levels:</span>
              <span className="font-mono text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span>Optimal Display:</span>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render authentic workspace for Excel / Financials
  const renderExcelWorkspace = () => (
    <div className="flex-1 flex flex-col overflow-hidden font-sans text-xs select-none bg-slate-950">
      {/* Excel Green Header Ribbon */}
      <div className="bg-emerald-950/60 border-b border-emerald-800/60 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-emerald-400">Excel Financials</span>
          <span className="text-slate-400">AutoSave: On</span>
          <span className="text-slate-500">|</span>
          <span className="text-white font-semibold">Q3_Revenue_Forecast.xlsx</span>
        </div>
        <div className="text-[11px] text-emerald-300 font-mono">100% Zoom • 12,400 Rows</div>
      </div>

      {/* Ribbon Menu Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-6 text-xs text-slate-400 h-9 shrink-0">
        <span>File</span>
        <span>Home</span>
        {/* Active Insert Tab */}
        <span className="text-white font-bold border-b-2 border-emerald-500 py-1.5">Insert</span>
        <span>Draw</span>
        <span>Page Layout</span>
        <span>Formulas</span>
        <span>Data</span>
      </div>

      {/* Ribbon Action Tools Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2.5 flex items-center gap-4 shrink-0">
        {/* The Target Action Button: PivotTable */}
        <button
          id="excel-pivottable-btn"
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 text-xs font-bold shadow-md shadow-emerald-600/30 transition"
        >
          <Table className="w-4 h-4" />
          <span>PivotTable</span>
        </button>

        <button className="px-2.5 py-1.5 bg-slate-800 text-slate-300 rounded flex items-center gap-1.5 text-xs hover:bg-slate-700">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Charts</span>
        </button>

        <button className="px-2.5 py-1.5 bg-slate-800 text-slate-300 rounded flex items-center gap-1.5 text-xs hover:bg-slate-700">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <span>Slicer Filter</span>
        </button>
      </div>

      {/* Formula Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 flex items-center gap-2 text-xs font-mono shrink-0">
        <span className="font-bold text-slate-500">fx</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400">=VLOOKUP(A4, RegionalData!$B$2:$G$800, 4, FALSE)</span>
      </div>

      {/* Financial Spreadsheet Data Grid */}
      <div className="flex-1 overflow-hidden bg-slate-950 font-mono text-[11px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px]">
              <th className="p-2 border-r border-slate-800 w-10 text-center">#</th>
              <th className="p-2 border-r border-slate-800 font-bold text-white">A: Region</th>
              <th className="p-2 border-r border-slate-800 font-bold text-white">B: Product Line</th>
              <th className="p-2 border-r border-slate-800 font-bold text-white">C: Q3 Revenue</th>
              <th className="p-2 border-r border-slate-800 font-bold text-white">D: Gross Margin</th>
              <th className="p-2 font-bold text-white">E: YoY Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="p-2 bg-slate-900/80 text-center text-slate-500 font-bold border-r border-slate-800">1</td>
              <td className="p-2 border-r border-slate-800 text-white font-semibold">North America</td>
              <td className="p-2 border-r border-slate-800">Enterprise AI Core</td>
              <td className="p-2 border-r border-slate-800 text-emerald-400 font-bold">$742,000</td>
              <td className="p-2 border-r border-slate-800">82.4%</td>
              <td className="p-2 text-emerald-400 font-bold">+28.5%</td>
            </tr>
            <tr>
              <td className="p-2 bg-slate-900/80 text-center text-slate-500 font-bold border-r border-slate-800">2</td>
              <td className="p-2 border-r border-slate-800 text-white font-semibold">Europe (EMEA)</td>
              <td className="p-2 border-r border-slate-800">Cloud Storage Tier</td>
              <td className="p-2 border-r border-slate-800 text-emerald-400 font-bold">$488,500</td>
              <td className="p-2 border-r border-slate-800">76.8%</td>
              <td className="p-2 text-emerald-400 font-bold">+19.2%</td>
            </tr>
            <tr>
              <td className="p-2 bg-slate-900/80 text-center text-slate-500 font-bold border-r border-slate-800">3</td>
              <td className="p-2 border-r border-slate-800 text-white font-semibold">Asia Pacific</td>
              <td className="p-2 border-r border-slate-800">Developer License</td>
              <td className="p-2 border-r border-slate-800 text-emerald-400 font-bold">$315,200</td>
              <td className="p-2 border-r border-slate-800">71.5%</td>
              <td className="p-2 text-emerald-400 font-bold">+44.1%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render authentic workspace for Figma UI Design
  const renderFigmaWorkspace = () => (
    <div className="flex-1 flex overflow-hidden font-sans text-xs select-none bg-slate-950">
      {/* Left Layers Sidebar */}
      <div className="w-48 bg-slate-900 border-r border-slate-800 p-3 hidden sm:flex flex-col text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-bold text-slate-300">
          <span>Layers</span>
          <span className="text-slate-500">Assets</span>
        </div>
        <div className="space-y-1">
          <div className="text-blue-400 font-bold flex items-center gap-1.5">
            <LayoutGridIcon className="w-3.5 h-3.5" />
            <span># Hero Component</span>
          </div>
          <div className="pl-3 text-slate-300 flex items-center gap-1.5">
            <Square className="w-3 h-3 text-slate-500" />
            <span>Frame: Header</span>
          </div>
          <div className="pl-5 text-slate-400 flex items-center gap-1.5">
            <Type className="w-3 h-3 text-slate-500" />
            <span>Headline Title</span>
          </div>
          <div className="pl-5 text-purple-400 flex items-center gap-1.5 font-semibold">
            <Columns className="w-3 h-3 text-purple-400" />
            <span>Badge Wrap Row</span>
          </div>
        </div>
      </div>

      {/* Central Figma Design Canvas */}
      <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden items-center justify-center p-6">
        {/* Figma 50% dot grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        {/* Selected Frame in Canvas with Blue Handles */}
        <div className="relative z-10 w-80 p-5 rounded-2xl bg-slate-900 border-2 border-purple-500 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">
              Auto Layout (Horizontal)
            </div>
            <span className="text-[10px] text-slate-400 font-mono">640 × 380</span>
          </div>
          <div className="text-sm font-bold text-white">Dynamic Navigation Bar</div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
              Dashboard
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
              Telemetry
            </span>
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">
              Active Session
            </span>
          </div>
        </div>
      </div>

      {/* Right Design Properties Panel */}
      <div className="w-56 bg-slate-900 border-l border-slate-800 p-3.5 space-y-4 shrink-0">
        <div className="font-bold text-xs text-white pb-2 border-b border-slate-800">Design Properties</div>

        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Dimensions:</span>
            <span className="font-mono text-white">W 640 • H 380</span>
          </div>
          <div className="flex justify-between">
            <span>Corner Radius:</span>
            <span className="font-mono text-white">16px</span>
          </div>
        </div>

        {/* The Target Section: Auto Layout */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="font-bold text-xs text-purple-300 flex items-center justify-between">
            <span>Auto Layout</span>
            <span className="text-[10px] text-slate-500 font-mono">Shift+A</span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <button className="flex-1 py-1 bg-slate-800 text-slate-400 rounded text-center text-xs">
              ↓ Vert
            </button>
            <button className="flex-1 py-1 bg-slate-800 text-slate-400 rounded text-center text-xs">
              → Horiz
            </button>
            {/* The Target Button: Wrap */}
            <button
              id="figma-wrap-btn"
              className="flex-1 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-center text-xs font-bold shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-1"
            >
              <Columns className="w-3 h-3" />
              <span>Wrap</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 pt-1">Padding: 24px • Item Gap: 12px</div>
        </div>
      </div>
    </div>
  );

  // Helper icon component for Figma
  function LayoutGridIcon(props: { className?: string }) {
    return <Grid className={props.className} />;
  }

  // Dynamic annotation placement based on active scenario
  const renderAnnotationOverlay = () => {
    if (demoState !== "speaking") return null;

    if (activeScenario.id === "vscode") {
      return (
        <div className="absolute inset-0 pointer-events-none z-30 animate-in fade-in duration-200">
          {/* Target box over Format Document button */}
          <div className="absolute top-[4px] right-[34px] w-[150px] h-[30px] border-2 border-blue-400 rounded-lg shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse flex items-center justify-center">
            <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-lg border-2 border-white">
              {activeScenario.stepNumber}
            </span>
          </div>
          {/* Spoken Guidance Card */}
          <div className="absolute top-[42px] right-[20px] max-w-sm bg-slate-900/95 border border-blue-500/40 text-slate-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-sans leading-relaxed">
            <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Spoken Guidance:
            </div>
            "{activeScenario.spokenGuidance}"
          </div>
        </div>
      );
    }

    if (activeScenario.id === "blender") {
      return (
        <div className="absolute inset-0 pointer-events-none z-30 animate-in fade-in duration-200">
          {/* Target box over Add Modifier button in right sidebar */}
          <div className="absolute top-[88px] right-[14px] w-[200px] h-[40px] border-2 border-blue-400 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse flex items-center justify-center">
            <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-lg border-2 border-white">
              {activeScenario.stepNumber}
            </span>
          </div>
          {/* Spoken Guidance Card */}
          <div className="absolute top-[138px] right-[14px] max-w-xs bg-slate-900/95 border border-blue-500/40 text-slate-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-sans leading-relaxed">
            <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Spoken Guidance:
            </div>
            "{activeScenario.spokenGuidance}"
          </div>
        </div>
      );
    }

    if (activeScenario.id === "excel") {
      return (
        <div className="absolute inset-0 pointer-events-none z-30 animate-in fade-in duration-200">
          {/* Target box over PivotTable in Ribbon */}
          <div className="absolute top-[68px] left-[10px] w-[130px] h-[40px] border-2 border-emerald-400 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-pulse flex items-center justify-center">
            <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-lg border-2 border-white">
              {activeScenario.stepNumber}
            </span>
          </div>
          {/* Spoken Guidance Card */}
          <div className="absolute top-[120px] left-[10px] max-w-sm bg-slate-900/95 border border-emerald-500/40 text-slate-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-sans leading-relaxed">
            <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Spoken Guidance:
            </div>
            "{activeScenario.spokenGuidance}"
          </div>
        </div>
      );
    }

    if (activeScenario.id === "figma") {
      return (
        <div className="absolute inset-0 pointer-events-none z-30 animate-in fade-in duration-200">
          {/* Target box over Auto Layout Wrap button */}
          <div className="absolute top-[136px] right-[14px] w-[80px] h-[34px] border-2 border-purple-400 rounded-lg shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-pulse flex items-center justify-center">
            <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-lg border-2 border-white">
              {activeScenario.stepNumber}
            </span>
          </div>
          {/* Spoken Guidance Card */}
          <div className="absolute top-[180px] right-[14px] max-w-xs bg-slate-900/95 border border-purple-500/40 text-slate-200 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-sans leading-relaxed">
            <div className="font-bold text-purple-400 mb-1 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Spoken Guidance:
            </div>
            "{activeScenario.spokenGuidance}"
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* 1. Global Announcement Ticker */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-950 border-b border-blue-500/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-blue-200">Cursorbuddy v0.1.0 Released</span>
            <span className="hidden sm:inline text-slate-400">• One-Click Windows Setup (.exe) now live on GitHub Releases</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Disk Media
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Open-Source MIT</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition"
            >
              Star on GitHub <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Glassmorphism Sticky Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
              CB
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Cursorbuddy</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                v0.1.0
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#simulator" className="hover:text-blue-400 transition">
              Interactive Simulator
            </a>
            <a href="#photos" className="hover:text-blue-400 transition">
              Workspaces & Photos
            </a>
            <a href="#philosophy" className="hover:text-blue-400 transition">
              Anti-Bot Philosophy
            </a>
            <a href="#features" className="hover:text-blue-400 transition">
              Architecture
            </a>
            <a href="#privacy" className="hover:text-blue-400 transition">
              Privacy Matrix
            </a>
            <a href="#shortcuts" className="hover:text-blue-400 transition">
              Shortcuts
            </a>
            <a href="#faq" className="hover:text-blue-400 transition">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>GitHub</span>
            </a>

            <a
              href={WINDOWS_EXE_URL}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-4 h-4" />
              <span>Download (.exe)</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 3. Hero Section */}
        <section className="relative pt-24 pb-28 overflow-hidden">
          {/* Ambient Lighting Backdrop */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-teal-500/20 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute -top-10 right-10 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">The AI Companion that Teaches You Where to Click — Never Clicks For You</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
              Stop hunting through menus. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
                Let your companion guide your next click.
              </span>
            </h1>

            {/* Subtext */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
              Hold <kbd className="kbd-key text-blue-300">Ctrl + Alt</kbd>, ask a voice question about your screen, and release. Cursorbuddy speaks concise guidance and projects pixel-perfect SVG annotations right over the target control.
            </p>

            {/* High-Converting Download CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href={WINDOWS_EXE_URL}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Download for Windows (.exe)</span>
              </a>

              <a
                href={RELEASES_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl transition backdrop-blur-md"
              >
                <span>macOS (.dmg) & Source Code</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Specs / Trust Chips */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1-Click Windows Setup (129 KB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Continuous Watching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Local GPU Pre-Upload Redaction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-blue-400" />
                <span>Windows 10/11 & macOS</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Supercharged Multi-Scenario Interactive Simulator */}
        <section id="simulator" className="py-20 border-t border-slate-900 bg-slate-950/60 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <Radio className="w-3.5 h-3.5" />
                <span>Live Browser Interactive Simulator</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Experience Spatial Guidance Live</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Select a desktop app scenario below, hold the push-to-talk button, and watch Cursorbuddy analyze the screen and project step annotations!
              </p>
            </div>

            {/* Scenario Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
              {SCENARIOS.map((sc) => {
                const Icon = sc.icon;
                const isSelected = activeScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScenario(sc);
                      resetDemo();
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/15"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{sc.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{sc.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Realistic Desktop App Mockup Window */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
              {/* Window Titlebar */}
              <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-300 font-mono ml-2 font-medium">
                    {activeScenario.name} — Workspace Preview
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>Display 1 (2560x1440 @ 125% DPI)</span>
                  <span>• Overlay Layer: Active</span>
                </div>
              </div>

              {/* User Voice Question Prompt Pill */}
              <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">User Voice Prompt:</span>
                  <span className="text-slate-200 font-sans italic">"{activeScenario.userQuestion}"</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Push-to-Talk 16kHz PCM</span>
              </div>

              {/* Mock App Screen Canvas with Scenario-Specific Rendering */}
              <div className="h-[400px] relative bg-slate-950 flex flex-col justify-between overflow-hidden">
                {activeScenario.id === "vscode" && renderVsCodeWorkspace()}
                {activeScenario.id === "blender" && renderBlenderWorkspace()}
                {activeScenario.id === "excel" && renderExcelWorkspace()}
                {activeScenario.id === "figma" && renderFigmaWorkspace()}

                {/* Dynamic SVG Annotation Overlay Layer (Active when Speaking) */}
                {renderAnnotationOverlay()}
              </div>

              {/* Interactive Controls Bar */}
              <div className="bg-slate-900 border-t border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white transition-all duration-300 shadow-md ${
                      demoState === "listening"
                        ? "bg-rose-600 scale-110 shadow-rose-500/30"
                        : demoState === "thinking"
                        ? "bg-amber-600 animate-spin shadow-amber-500/30"
                        : demoState === "speaking"
                        ? "bg-emerald-600 shadow-emerald-500/30"
                        : "bg-blue-600"
                    }`}
                  >
                    {demoState === "listening" ? (
                      <Mic className="w-6 h-6 animate-pulse" />
                    ) : demoState === "thinking" ? (
                      <RefreshCw className="w-6 h-6" />
                    ) : demoState === "speaking" ? (
                      <Sparkles className="w-6 h-6" />
                    ) : (
                      <MousePointer className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {demoState === "idle" && "Ready to Listen"}
                      {demoState === "listening" && "Recording In-Memory Voice Buffer..."}
                      {demoState === "thinking" && "Blacking out sensitive windows & analyzing..."}
                      {demoState === "speaking" && "Guiding Your Next Click"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {demoState === "idle" && "Hold button or press Ctrl+Alt to speak a question"}
                      {demoState === "listening" && "Release button to submit question to Claude"}
                      {demoState === "thinking" && "Snapping coordinates to Windows UIAutomation bounds"}
                      {demoState === "speaking" && "Teaching you where to click (never auto-clicking)"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onMouseDown={() => setIsPressingHotkey(true)}
                    onMouseUp={() => setIsPressingHotkey(false)}
                    onTouchStart={() => setIsPressingHotkey(true)}
                    onTouchEnd={() => setIsPressingHotkey(false)}
                    className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                      isPressingHotkey
                        ? "bg-rose-600 text-white shadow-rose-600/30 scale-95"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
                    }`}
                  >
                    {isPressingHotkey ? "Release to Send" : "Hold to Talk (Ctrl + Alt)"}
                  </button>

                  {demoState !== "idle" && (
                    <button
                      onClick={resetDemo}
                      className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Curated High-Resolution Photography Showcase */}
        <section id="photos" className="py-24 border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <Laptop className="w-3.5 h-3.5" />
                <span>Engineered for Real Physical Workspaces</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                From Ultrawide Desks to Complex Multi-Monitor Setups
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Cursorbuddy is rigorously tested across real human workstations, handling mixed-DPI scaling, rotated displays, and high-density creative suites with zero coordinate drift.
              </p>
            </div>

            {/* Photography Showcase Grid with Glass Overlays */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Photo 1: Software Engineer Dual-Monitor */}
              <div className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl hover:border-blue-500/40 transition-all duration-300">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
                    alt="Software Engineer Multi-Monitor Workspace"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono font-bold text-blue-400 backdrop-blur-md">
                    Dev Environment • Mixed DPI
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                    Software & DevOps Workstations
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly pinpoint Docker containers, AWS console settings, and terminal flags without leaving your focused editor flow.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Target: VS Code / Terminal / Chrome</span>
                  </div>
                </div>
              </div>

              {/* Photo 2: 3D CAD & Creative Studio */}
              <div className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl hover:border-purple-500/40 transition-all duration-300">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80"
                    alt="Creative 3D Design and Color Grading Suite"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono font-bold text-purple-400 backdrop-blur-md">
                    Creative Suite • 4K Color Grading
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">
                    3D Modeling & Creative Studios
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Find deep modifier trees in Blender, DaVinci Resolve nodes, or Photoshop neural filters without breaking creative momentum.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Target: Blender / Resolve / Maya</span>
                  </div>
                </div>
              </div>

              {/* Photo 3: Clean Minimal Ultrawide Setup */}
              <div className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl hover:border-teal-500/40 transition-all duration-300">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80"
                    alt="Minimalist Ultrawide Desk Setup"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono font-bold text-teal-400 backdrop-blur-md">
                    Ergonomic Ultrawide • 21:9 Aspect
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition">
                    Executive & Financial Modeling
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Navigate massive Excel spreadsheets, ERP systems, and complex CRM interfaces with one spoken question.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Target: Excel / Salesforce / SAP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. The Anti-Bot Manifesto (Why Cursorbuddy Never Clicks) */}
        <section id="philosophy" className="py-24 border-t border-slate-900 bg-slate-950/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>The Companion Philosophy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                The 3 Sins of Autonomous Click Bots
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Autonomous agents that seize control of your mouse cursor sound exciting until they delete code, submit live forms, or stream your screen 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sin 1 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">The Destructive Click Hazard</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous agents guess coordinates and click blind confirmation modals. When they miscalculate by 15 pixels, they close uncommitted work, delete records, or initiate irreversible transactions.
                </p>
                <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cursorbuddy shows you where to click and explains why.</span>
                </div>
              </div>

              {/* Sin 2 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Cognitive Skill Atrophy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When software does everything for you behind a black box, you never learn how your tools operate. You become permanently dependent on an agent that breaks the moment an application updates its UI.
                </p>
                <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cursorbuddy builds your muscle memory and software mastery.</span>
                </div>
              </div>

              {/* Sin 3 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Continuous Screen Surveillance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Most screen assistants record your desktop constantly in the background, logging passwords, medical records, and private chat histories to local disk or remote cloud servers.
                </p>
                <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cursorbuddy captures only when Ctrl+Alt is explicitly held.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Deep Architectural Bento Box (6 Signature Innovations) */}
        <section id="features" className="py-24 border-t border-slate-900 bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>Under The Hood Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Engineered for Zero Data Leaks & Extreme Precision
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Built from the metal up with Rust, Tauri 2, and Anthropic Claude for sub-second response times without sacrificing security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-slate-900/70 border border-slate-800 p-7 rounded-3xl space-y-3 hover:border-blue-500/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Push-to-Talk 16kHz PCM Buffer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Audio is recorded directly into in-memory ring buffers via <code className="text-slate-300">cpal</code> and freed immediately. Nothing is ever written to disk.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900/70 border border-slate-800 p-7 rounded-3xl space-y-3 hover:border-purple-500/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">UIAutomation Control Snapping</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Queries native Windows UIAutomation and macOS Accessibility APIs to snap visual bounding boxes to physical button rectangles with 0% drift.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900/70 border border-slate-800 p-7 rounded-3xl space-y-3 hover:border-emerald-500/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">High-Speed Voice Dictation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hold <kbd className="kbd-key text-purple-300">Ctrl+Alt+Shift</kbd> to transcribe speech and simulate paste. Restores your prior clipboard contents in under 50ms.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-900/70 border border-slate-800 p-7 rounded-3xl space-y-3 hover:border-rose-500/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Local GPU Pre-Upload Redaction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically paints solid blackout rectangles over 1Password, Bitwarden, banks, and private browser tabs directly on the raw RGBA frame.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-900/70 border border-slate-800 p-7 rounded-3xl space-y-3 hover:border-amber-500/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Anti-Capture Click-Through Overlays</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configures <code className="text-slate-300">WDA_EXCLUDEFROMCAPTURE</code> on Windows, making annotations completely invisible to screen shares and recorders.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-900/70 border border-slate-800 p-7 rounded-3xl space-y-3 hover:border-teal-500/30 transition">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Transactional SQLite Undo Journal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Background automation tasks never delete files. File moves and renames are recorded to an on-device SQLite journal supporting 1-click full undo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Comprehensive Privacy & Architecture Comparison Matrix */}
        <section id="privacy" className="py-24 border-t border-slate-900 bg-slate-950/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Architecture Comparison</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Privacy Invariant Matrix</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                How Cursorbuddy's memory-only pipeline compares against traditional screen recorders and autonomous mouse agents.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                    <th className="p-4 sm:p-5 font-bold">Privacy & Architecture Invariant</th>
                    <th className="p-4 sm:p-5 font-bold text-blue-400">Cursorbuddy</th>
                    <th className="p-4 sm:p-5 font-bold text-slate-500">Autonomous Clickers</th>
                    <th className="p-4 sm:p-5 font-bold text-slate-500">Screen Recorders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Continuous Background Capture</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> Never (Push-to-Talk only)
                    </td>
                    <td className="p-4 sm:p-5 text-rose-400">Always On</td>
                    <td className="p-4 sm:p-5 text-rose-400">Always On</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Hijacks Mouse or Deletes Files</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> Never (Teaches user)
                    </td>
                    <td className="p-4 sm:p-5 text-amber-400">Yes (Destructive risks)</td>
                    <td className="p-4 sm:p-5 text-slate-400">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Local Password & Banking Blackout</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> Automatic On-Device GPU
                    </td>
                    <td className="p-4 sm:p-5 text-rose-400">None</td>
                    <td className="p-4 sm:p-5 text-rose-400">None</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Media Saved to Local Disk</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> Zero (Ephemeral RAM only)
                    </td>
                    <td className="p-4 sm:p-5 text-amber-400">Varies</td>
                    <td className="p-4 sm:p-5 text-rose-400">Yes (Gigabytes stored)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Invisible to Screen Shares (Anti-Capture)</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> WDA_EXCLUDEFROMCAPTURE
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">N/A</td>
                    <td className="p-4 sm:p-5 text-rose-400">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Clipboard Preservation on Dictate</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> Restored in 50ms
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">N/A</td>
                    <td className="p-4 sm:p-5 text-slate-400">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 9. Global Keyboard Shortcuts Cheatsheet */}
        <section id="shortcuts" className="py-24 border-t border-slate-900 bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Global Modifier Chords</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Always One Keystroke Away</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Works seamlessly across any active application on Windows 10/11 and macOS.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shortcut 1 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">Push-to-Talk Question</div>
                  <div className="text-xs text-slate-400">
                    Captures active display & speaks guidance
                  </div>
                </div>
                <button
                  onClick={copyShortcuts}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs text-blue-400 font-bold shadow-sm transition active:scale-95"
                  title="Click to copy shortcut"
                >
                  {copiedShortcut ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>Ctrl + Alt</span>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </>
                  )}
                </button>
              </div>

              {/* Shortcut 2 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">Voice Dictation & Paste</div>
                  <div className="text-xs text-slate-400">
                    Transcribes voice & restores clipboard
                  </div>
                </div>
                <kbd className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-purple-400 font-bold shadow-sm">
                  Ctrl + Alt + Shift
                </kbd>
              </div>

              {/* Shortcut 3 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">Dismiss Overlay Marks</div>
                  <div className="text-xs text-slate-400">
                    Immediately clears SVG annotations & halts audio
                  </div>
                </div>
                <kbd className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-slate-300 font-bold shadow-sm">
                  Esc
                </kbd>
              </div>

              {/* Shortcut 4 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">Pause / Resume Companion</div>
                  <div className="text-xs text-slate-400">
                    Disables mic & display capture entirely
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3.5 py-2 border border-slate-800 rounded-xl">
                  System Tray
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Community Reviews & Testimonials */}
        <section className="py-24 border-t border-slate-900 bg-slate-950/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <Star className="w-3.5 h-3.5 fill-blue-400" />
                <span>Loved by Engineers & Creators</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Built for People Who Work on Screens</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "I was terrified of autonomous AI agents clicking buttons in our production AWS console. Cursorbuddy is the exact opposite — it points at the right button and explains why, keeping me in complete control."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 text-xs">
                    EL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Elena Rostova</div>
                    <div className="text-[10px] text-slate-500">Lead Infrastructure Engineer</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Blender has roughly 4,000 submenus. I used to spend 15 minutes searching YouTube tutorials just to find an obscure UV toggle. Now I hold Ctrl+Alt, ask, and a circle appears right over it."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-xs">
                    MK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Marcus Vance</div>
                    <div className="text-[10px] text-slate-500">3D Technical Artist</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "The zero-disk media guarantee and local redaction of password managers made this the only AI desktop tool our corporate enterprise security team actually approved for installation."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-xs">
                    DK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">David Kim</div>
                    <div className="text-[10px] text-slate-500">VP of Information Security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ Section */}
        <section id="faq" className="py-24 border-t border-slate-900 bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about Cursorbuddy.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How does Cursorbuddy know where to draw annotations?",
                  a: "When you release the push-to-talk hotkey, Cursorbuddy captures the display containing your cursor, blackouts sensitive windows locally, downscales the frame, and sends it with your audio question to Claude. If Accessibility is enabled, it automatically snaps visual arrows and circles to the exact native OS button bounds via Windows UIAutomation.",
                },
                {
                  q: "Why doesn't Cursorbuddy just click the button for me?",
                  a: "Autonomous clicking agents frequently miss confirmation dialogs, execute destructive actions, and rob users of the ability to learn. Cursorbuddy is intentionally designed to teach you where to click and explain why, so you gain mastery over your software.",
                },
                {
                  q: "Are my screen captures or voice recordings saved to disk?",
                  a: "Never. Mic audio and screen captures are held in in-memory RAM buffers and completely freed after transmission. Screenshots are only saved to disk if you explicitly toggle Debug Mode in Settings.",
                },
                {
                  q: "Can Cursorbuddy see my passwords or banking information?",
                  a: "No. Before any screenshot is processed or leaves your machine, an on-device redaction filter enumerates visible windows and paints solid blackout rectangles over password managers (1Password, Bitwarden, KeePass), banking portals, and private/incognito windows.",
                },
                {
                  q: "How does the Windows one-click installer work?",
                  a: "Clicking the 'Download for Windows (.exe)' button downloads the standalone setup executable straight from GitHub Releases. Running it installs Cursorbuddy with one click and places the icon in your system tray.",
                },
                {
                  q: "Does Cursorbuddy support multi-monitor setups with different DPI scalings?",
                  a: "Yes. Cursorbuddy includes a custom coordinate mapping engine supporting 100%, 125%, 150%, and 200% Windows scaling, negative-origin secondary monitors, and vertical displays with zero offset drift.",
                },
                {
                  q: "How does voice dictation mode work?",
                  a: "Holding Ctrl+Alt+Shift records your voice, sends it to high-speed Whisper transcription, simulates paste into the focused field, and restores your previous clipboard contents within 50ms.",
                },
                {
                  q: "Is Cursorbuddy open source?",
                  a: "Yes! Cursorbuddy is 100% open-source under the MIT license on GitHub.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-blue-400 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeFaq === idx ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Final High-Impact CTA Banner */}
        <section className="py-24 border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-blue-950/30 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Community Edition Available</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to navigate your screen with ease?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Download the one-click Windows installer and experience a desktop companion that empowers your workflow.
            </p>

            <div className="pt-3">
              <a
                href={WINDOWS_EXE_URL}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-2xl shadow-blue-600/40 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Download for Windows (.exe)</span>
              </a>
            </div>

            <div className="pt-2 text-xs text-slate-500 font-mono">
              Cursorbuddy_0.1.0_x64-setup.exe · 141 KB · Windows 10 & 11 (64-bit)
            </div>
          </div>
        </section>
      </main>

      {/* 13. Rich Professional Multi-Column Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                CB
              </div>
              <span className="text-white font-bold text-base">Cursorbuddy</span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              The cross-platform AI desktop companion built with Tauri 2, Rust, and Claude that teaches you where to click rather than automating your mouse.
            </p>
            <div className="text-[11px] text-slate-500">
              © 2026 Cursorbuddy Contributors. Distributed under the MIT License.
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">Product</div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#simulator" className="hover:text-white transition">
                  Interactive Simulator
                </a>
              </li>
              <li>
                <a href="#photos" className="hover:text-white transition">
                  Workspaces
                </a>
              </li>
              <li>
                <a href={WINDOWS_EXE_URL} className="hover:text-white transition">
                  Windows Installer (.exe)
                </a>
              </li>
              <li>
                <a href={RELEASES_PAGE_URL} target="_blank" rel="noreferrer" className="hover:text-white transition">
                  macOS Releases (.dmg)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">Architecture</div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Zero-Disk Media
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition">
                  Local Redaction
                </a>
              </li>
              <li>
                <a href="#shortcuts" className="hover:text-white transition">
                  Global Hotkeys
                </a>
              </li>
              <li>
                <a
                  href={`${GITHUB_REPO_URL}/blob/main/docs/ARCHITECTURE.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  Architecture Docs
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">Open Source</div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" className="hover:text-white transition">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href={`${GITHUB_REPO_URL}/issues`} target="_blank" rel="noreferrer" className="hover:text-white transition">
                  Issue Tracker
                </a>
              </li>
              <li>
                <a href={`${GITHUB_REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-white transition">
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
