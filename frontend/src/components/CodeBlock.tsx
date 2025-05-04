
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  id: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript', id }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 rounded-t-lg border-b border-slate-700">
        <div className="text-xs font-mono text-slate-400">{language}</div>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto max-h-96" id={id}>
        <code className="text-sm text-slate-300">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
