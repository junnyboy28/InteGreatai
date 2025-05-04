
import React from 'react';
import CodeBlock from './CodeBlock';
import { Settings } from 'lucide-react';

interface EnvironmentSetupProps {
  env_template: string;
}

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({ env_template }) => {
  return (
    <div className="animate-fade-in">
      <div className="bg-integreat-dark-blue rounded-lg p-5 shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="mr-2" size={18} />
          Environment Setup
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Configure your environment variables below to use the wrapper code properly.
        </p>
        <CodeBlock code={env_template} language="bash" id="env_template" />
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800 rounded-md">
          <p className="text-sm text-blue-200">
            <strong>Tip:</strong> Create a <code className="text-xs bg-black/30 px-1 py-0.5 rounded">.env</code> file in your project root and add these variables.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentSetup;
