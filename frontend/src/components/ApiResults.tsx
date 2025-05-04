import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCog, Code, Terminal, FileJson } from 'lucide-react';
import CodeBlock from './CodeBlock';
import ReactMarkdown from 'react-markdown';

interface Parameter {
  type: string;
  description: string;
  required?: boolean;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Record<string, Parameter>;
}

interface AuthMethod {
  type: string;
  description: string;
}

interface ApiResultsProps {
  endpoints: Endpoint[];
  auth_methods: AuthMethod[];
  suggested_integration: string;
  wrapper_code: string;
  env_template: string;
  onExportPostman: () => void;
}

const ApiResults: React.FC<ApiResultsProps> = ({
  endpoints,
  auth_methods,
  suggested_integration,
  wrapper_code,
  env_template,
  onExportPostman,
}) => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);

  const toggleEndpoint = (index: number) => {
    setExpandedEndpoint(expandedEndpoint === index ? null : index);
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-600';
      case 'POST':
        return 'bg-green-600';
      case 'PUT':
        return 'bg-amber-600';
      case 'DELETE':
        return 'bg-red-600';
      case 'PATCH':
        return 'bg-purple-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">API Analysis Results</h2>
        <button 
          onClick={onExportPostman}
          className="flex items-center px-3 py-2 bg-integreat-accent text-white rounded-md text-sm hover:bg-integreat-accent/80 transition-colors"
        >
          <FileJson size={16} className="mr-1.5" />
          Export to Postman
        </button>
      </div>

      <div className="bg-integreat-dark-blue rounded-lg p-5 shadow-md">
        <h3 className="flex items-center text-lg font-medium mb-3">
          <FileCog className="mr-2 text-slate-400" size={18} />
          Endpoints ({endpoints.length})
        </h3>
        <div className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <div 
              key={`${endpoint.method}-${endpoint.path}-${index}`}
              className="border border-slate-700 rounded-md overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                onClick={() => toggleEndpoint(index)}
              >
                <div className="flex items-center">
                  <span className={`${getMethodColor(endpoint.method)} text-xs font-medium px-2 py-1 rounded-md mr-3`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm truncate">{endpoint.path}</span>
                </div>
                {expandedEndpoint === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {expandedEndpoint === index && (
                <div className="p-4 border-t border-slate-700 bg-black/20">
                  <p className="text-sm text-slate-300 mb-3">{endpoint.description}</p>
                  
                  {endpoint.parameters && Object.keys(endpoint.parameters).length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2 text-slate-300">Parameters:</h4>
                      <div className="bg-black/30 rounded-md overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-black/30 text-slate-400">
                            <tr>
                              <th className="px-3 py-2">Name</th>
                              <th className="px-3 py-2">Type</th>
                              <th className="px-3 py-2">Description</th>
                              <th className="px-3 py-2">Required</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(endpoint.parameters).map(([name, param]) => (
                              <tr key={name} className="border-t border-slate-800">
                                <td className="px-3 py-2 font-mono font-medium">{name}</td>
                                <td className="px-3 py-2">{param.type}</td>
                                <td className="px-3 py-2 text-slate-400">{param.description}</td>
                                <td className="px-3 py-2">
                                  {param.required ? (
                                    <span className="text-green-400">Yes</span>
                                  ) : (
                                    <span className="text-slate-400">No</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-integreat-dark-blue rounded-lg p-5 shadow-md">
        <h3 className="flex items-center text-lg font-medium mb-3">
          <Terminal className="mr-2 text-slate-400" size={18} />
          Authentication Methods
        </h3>
        <div className="space-y-2">
          {auth_methods.map((auth, index) => (
            <div key={index} className="bg-slate-900/50 p-3 rounded-md border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300">{auth.type}</h4>
              <p className="text-sm text-slate-400 mt-1">{auth.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-integreat-dark-blue rounded-lg p-5 shadow-md">
        <h3 className="text-lg font-medium mb-3">Suggested Integration</h3>
        <div className="text-slate-300 text-sm prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{suggested_integration}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ApiResults;
