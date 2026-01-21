
export interface FileNode {
  id: string;
  name: string;
  content: string;
  language: 'c' | 'cpp';
}

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}
