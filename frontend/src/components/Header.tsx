
import React from 'react';
import { Terminal, GitBranch, Link, Code } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-integreat-dark-blue border-b border-slate-700">
      <div className="flex items-center">
        <div className="w-10 h-10 mr-3 bg-integreat-accent rounded-lg flex items-center justify-center">
          <Terminal size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
            InteGreat<span className="text-integreat-accent">.ai</span>
            <span className="ml-2 text-xs bg-integreat-accent/20 text-integreat-accent px-2 py-0.5 rounded-full">
              Beta
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400">API Documentation Analysis & Code Generation</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <a href="#" className="hidden md:flex items-center text-sm text-slate-400 hover:text-white transition-colors">
          <GitBranch size={16} className="mr-1" />
          <span>GitHub</span>
        </a>
        <a href="#" className="hidden md:flex items-center text-sm text-slate-400 hover:text-white transition-colors">
          <Link size={16} className="mr-1" />
          <span>API Docs</span>
        </a>
        <a href="#" className="flex items-center px-3 py-1.5 bg-integreat-accent/10 border border-integreat-accent/20 text-integreat-accent rounded-md text-sm hover:bg-integreat-accent/20 transition-colors">
          <Code size={16} className="mr-1.5" />
          <span>API Key</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
