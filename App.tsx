
import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Square, Save, FileCode, Terminal as TerminalIcon, Plus, Trash2, Cpu, FileText, Settings, Info } from 'lucide-react';
import { FileNode, TerminalLine } from './types';

const INITIAL_FILES: FileNode[] = [
  {
    id: '1',
    name: 'main.cpp',
    language: 'cpp',
    content: `#include <iostream>\n\nint main() {\n    std::cout << "C++ Forge Professional Edition" << std::endl;\n    std::cout << "Local high-performance environment initialized." << std::endl;\n    return 0;\n}`
  },
  {
    id: '2',
    name: 'header.h',
    language: 'cpp',
    content: `// Standard utility header\n#ifndef UTILS_H\n#define UTILS_H\n\nvoid greet();\n\n#endif`
  }
];

const STORAGE_KEY = 'cpp-forge-files';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });
  const [activeFileId, setActiveFileId] = useState<string>(files[0].id);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: value } : f));
  };

  const addLine = (content: string, type: TerminalLine['type'] = 'output') => {
    setTerminalLines(prev => [...prev, { content, type, timestamp: Date.now() }]);
  };

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLines([]);
    
    addLine(`$ g++ ${activeFile.name} -o output`, 'system');
    
    // Simulate compilation steps
    await new Promise(r => setTimeout(r, 600));
    addLine(`Compiling ${activeFile.name}...`, 'output');
    
    await new Promise(r => setTimeout(r, 400));
    addLine(`Linking objects...`, 'output');
    
    await new Promise(r => setTimeout(r, 500));
    addLine(`$ ./output`, 'system');
    
    addLine(`Note: This is a frontend simulation. Native system execution is restricted in the browser environment.`, 'system');
    addLine(`Process finished with exit code 0`, 'system');
    
    setIsRunning(false);
  };

  const createNewFile = () => {
    const name = prompt("Enter file name (e.g. main.cpp):");
    if (!name) return;
    const ext = name.split('.').pop()?.toLowerCase();
    
    let lang: 'c' | 'cpp' = 'cpp';
    if (ext === 'c') lang = 'c';
    else if (ext === 'cpp' || ext === 'h' || ext === 'hpp') lang = 'cpp';
    else {
      alert("Please use .c or .cpp extensions.");
      return;
    }

    const newFile: FileNode = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      language: lang,
      content: lang === 'cpp' ? '#include <iostream>\n\nint main() {\n    return 0;\n}' : '#include <stdio.h>\n\nint main() {\n    return 0;\n}'
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (id: string) => {
    if (files.length <= 1) return;
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) {
      const remaining = files.filter(f => f.id !== id);
      setActiveFileId(remaining[0].id);
    }
  };

  const saveFiles = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    addLine(`System: Workspace saved to local storage.`, 'system');
  };

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-slate-300 overflow-hidden select-none">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-[#161b22]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1117]">
          <h1 className="text-xs font-bold tracking-widest flex items-center gap-2 text-slate-100">
            <Cpu size={14} className="text-blue-500" /> FORGE IDE
          </h1>
          <div className="flex gap-1">
             <button onClick={createNewFile} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
               <Plus size={14} />
             </button>
             <button onClick={saveFiles} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
               <Save size={14} />
             </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explorer</div>
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`px-4 py-2 flex items-center justify-between group cursor-pointer text-sm transition-all ${
                activeFileId === file.id ? 'bg-[#21262d] text-blue-400 border-l-2 border-blue-500' : 'hover:bg-[#21262d]/50 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode size={14} className={activeFileId === file.id ? 'text-blue-400' : 'text-slate-500'} />
                <span className="truncate font-medium">{file.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#0d1117] border-t border-slate-800 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                <span>Workspace</span>
                <span className="text-green-500">Active</span>
            </div>
            <div className="text-[11px] text-slate-400 bg-[#161b22] p-2 rounded border border-slate-800">
                Local filesystem active. Changes are automatically cached.
            </div>
          </div>
          <div className="flex items-center justify-around border-t border-slate-800 pt-4 text-slate-500">
             <Settings size={14} className="cursor-not-allowed opacity-50" />
             <Info size={14} className="cursor-not-allowed opacity-50" />
             <FileText size={14} className="cursor-not-allowed opacity-50" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Toolbar */}
        <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-[#161b22] shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
               Editing: <span className="text-slate-100">{activeFile.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={runCode}
                disabled={isRunning}
                className={`flex items-center gap-2 px-5 py-1.5 rounded text-xs font-bold transition-all ${
                    isRunning 
                    ? 'bg-slate-800 text-slate-600' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-lg shadow-blue-900/20'
                }`}
             >
               {isRunning ? <Square size={12} fill="currentColor" className="animate-pulse" /> : <Play size={12} fill="currentColor" />}
               {isRunning ? 'BUILDING...' : 'RUN BUILD'}
             </button>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 relative bg-[#0d1117]">
          <Editor
            height="100%"
            language={activeFile.language}
            theme="vs-dark"
            value={activeFile.content}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              lineNumbers: 'on',
              renderLineHighlight: 'all'
              // backgroundColor is not a valid property for IStandaloneEditorConstructionOptions
            }}
          />
        </div>

        {/* Console / Terminal */}
        <div className="h-48 border-t border-slate-800 flex flex-col bg-[#0d1117] shrink-0">
          <div className="px-4 py-1.5 border-b border-slate-800/50 flex items-center justify-between bg-[#161b22]">
            <div className="flex items-center gap-2">
              <TerminalIcon size={12} className="text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Output Console</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">/bin/bash</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 fira-code text-xs">
            {terminalLines.length === 0 && (
              <div className="text-slate-700 select-none">Ready for deployment. Output will appear here.</div>
            )}
            {terminalLines.map((line, idx) => (
              <div 
                key={idx} 
                className={`mb-1 flex gap-3 ${
                  line.type === 'error' ? 'text-red-400 bg-red-400/5' : 
                  line.type === 'system' ? 'text-blue-400' : 
                  'text-slate-300'
                }`}
              >
                <span className="text-slate-700 shrink-0 font-mono">[{new Date(line.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                <span className="whitespace-pre-wrap">{line.content}</span>
              </div>
            ))}
            <div id="terminal-end" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-6 bg-[#161b22] border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-500 z-50">
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> System Ready</span>
            <span>Lines: {activeFile.content.split('\n').length}</span>
            <span>Chars: {activeFile.content.length}</span>
        </div>
        <div className="flex items-center gap-4 uppercase tracking-tighter">
            <span className="hover:text-slate-300 cursor-pointer">CRLF</span>
            <span className="hover:text-slate-300 cursor-pointer">UTF-8</span>
            <span className="text-slate-400 font-bold">{activeFile.language === 'cpp' ? 'C++' : 'ANSI C'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
