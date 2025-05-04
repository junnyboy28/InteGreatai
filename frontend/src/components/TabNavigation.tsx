
import React, { useState } from 'react';
import { Maximize2, TerminalSquare, FileCode, Settings, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Maximize2 size={16} /> },
    { id: 'wrapper-code', label: 'Wrapper Code', icon: <FileCode size={16} /> },
    { id: 'env-setup', label: 'Environment Setup', icon: <Settings size={16} /> },
    { id: 'test-playground', label: 'Test Playground', icon: <PlayCircle size={16} /> },
  ];

  return (
    <div className="flex border-b border-slate-700 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center px-4 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === tab.id 
              ? "border-integreat-accent text-white" 
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500"
          )}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
