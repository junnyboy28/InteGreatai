
import React from 'react';
import CodeBlock from './CodeBlock';
import { FileCode } from 'lucide-react';

interface WrapperCodeProps {
  code: string;
  language: string;
}

const WrapperCode: React.FC<WrapperCodeProps> = ({ code, language }) => {
  return (
    <div className="animate-fade-in">
      <div className="bg-integreat-dark-blue rounded-lg p-5 shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileCode className="mr-2" size={18} />
          Generated Wrapper Code
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          This code provides a convenient wrapper for interacting with the API based on your requirements.
        </p>
        <CodeBlock code={code} language={language} id="wrapper_code" />
      </div>
    </div>
  );
};

export default WrapperCode;
