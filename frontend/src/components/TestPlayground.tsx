
import React, { useState } from 'react';
import { Play, Plus, Send, ArrowRight, Clock } from 'lucide-react';
import CodeBlock from './CodeBlock';

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

interface TestPlaygroundProps {
  endpoints: Endpoint[];
  onTestEndpoint: (data: any) => Promise<any>;
}

const TestPlayground: React.FC<TestPlaygroundProps> = ({ endpoints, onTestEndpoint }) => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Array<{ name: string; value: string }>>([]);
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEndpointIndex(e.target.value);
    setParameters({});
    setRequestBody("");
    setResponse(null);
    setError(null);
  };

  const handleParameterChange = (name: string, value: string) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeaderChange = (index: number, field: 'name' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { name: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedEndpointIndex || !baseUrl) return;
    
    const endpoint = endpoints[parseInt(selectedEndpointIndex)];
    setLoading(true);
    setError(null);
    
    try {
      // Construct URL
      let url = baseUrl;
      if (url.endsWith('/') && endpoint.path.startsWith('/')) {
        url = url.slice(0, -1);
      }
      url = url + endpoint.path;
      
      // Collect headers
      const headerObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.name) headerObj[h.name] = h.value;
      });
      
      // Parse body if needed
      let parsedBody = {};
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && requestBody) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch (e) {
          setError("Invalid JSON in request body");
          setLoading(false);
          return;
        }
      }
      
      const result = await onTestEndpoint({
        url,
        method: endpoint.method,
        headers: headerObj,
        params: parameters,
        body: parsedBody
      });
      
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const selectedEndpoint = selectedEndpointIndex 
    ? endpoints[parseInt(selectedEndpointIndex)] 
    : null;

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
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
    <div className="animate-fade-in">
      <div className="bg-integreat-dark-blue rounded-lg p-5 shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Play className="mr-2" size={18} />
          API Test Playground
        </h2>
        
        <div className="mb-4">
          <label htmlFor="endpoint-selector" className="block text-sm font-medium text-slate-300 mb-1">
            Select an endpoint to test
          </label>
          <select
            id="endpoint-selector"
            value={selectedEndpointIndex}
            onChange={handleEndpointChange}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:ring-2 focus:ring-integreat-light-blue focus:border-transparent outline-none"
          >
            <option value="">Select an endpoint</option>
            {endpoints.map((endpoint, index) => (
              <option key={`${endpoint.method}-${endpoint.path}-${index}`} value={index}>
                {endpoint.method} {endpoint.path}
              </option>
            ))}
          </select>
        </div>
        
        {selectedEndpoint && (
          <div id="endpoint-details" className="border border-slate-700 rounded-md overflow-hidden">
            <div className="bg-slate-900 p-3 border-b border-slate-700">
              <div className="flex items-center mb-2">
                <span className={`${getMethodColor(selectedEndpoint.method)} text-xs font-medium px-2 py-1 rounded-md mr-3`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm">{selectedEndpoint.path}</span>
              </div>
              <p className="text-sm text-slate-400">{selectedEndpoint.description}</p>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="base-url" className="block text-sm font-medium text-slate-300 mb-1">
                  Base URL
                </label>
                <input
                  type="url"
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:ring-2 focus:ring-integreat-light-blue focus:border-transparent outline-none"
                  placeholder="https://api.example.com"
                  required
                />
              </div>
              
              {selectedEndpoint.parameters && Object.keys(selectedEndpoint.parameters).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-slate-300">Parameters</h3>
                  <div id="endpoint-parameters" className="space-y-2">
                    {Object.entries(selectedEndpoint.parameters).map(([name, info]) => (
                      <div key={name} className="parameter-row flex gap-3">
                        <div className="parameter-name w-1/3">
                          <label htmlFor={`param-${name}`} className="block text-sm text-slate-400">
                            {name} ({info.type})
                            {info.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                        </div>
                        <div className="w-2/3">
                          <input
                            type="text"
                            id={`param-${name}`}
                            data-param={name}
                            className="parameter-value w-full p-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm"
                            placeholder={info.description}
                            onChange={(e) => handleParameterChange(name, e.target.value)}
                            value={parameters[name] || ''}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-slate-300">Headers</h3>
                  <button 
                    id="add-header" 
                    onClick={addHeader}
                    className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
                  >
                    <Plus size={12} className="mr-1" />
                    Add Header
                  </button>
                </div>
                <div id="endpoint-headers" className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="parameter-row flex gap-3 items-start">
                      <input
                        type="text"
                        className="header-name w-5/12 p-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm"
                        placeholder="Name"
                        value={header.name}
                        onChange={(e) => handleHeaderChange(index, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        className="header-value w-5/12 p-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm"
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                      />
                      <button 
                        onClick={() => removeHeader(index)}
                        className="w-2/12 p-2 bg-slate-800 hover:bg-red-800 text-slate-300 hover:text-white rounded-md transition-colors text-center"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                <div id="body-section">
                  <label htmlFor="request-body" className="block text-sm font-medium text-slate-300 mb-1">
                    Request Body (JSON)
                  </label>
                  <textarea
                    id="request-body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-md text-white text-sm font-mono focus:ring-2 focus:ring-integreat-light-blue focus:border-transparent outline-none min-h-[120px]"
                    placeholder='{\n  "key": "value"\n}'
                  ></textarea>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-md">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  id="send-request"
                  onClick={handleSubmit}
                  disabled={loading || !baseUrl}
                  className="py-2 px-4 bg-integreat-light-blue hover:bg-blue-600 text-white rounded-md font-medium flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="loading-dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {response && (
        <div id="response-area" className="bg-integreat-dark-blue rounded-lg p-5 shadow-md animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Response</h3>
          
          <div className="flex space-x-4 mb-4">
            <div className="bg-slate-900 p-3 rounded-md flex items-center">
              <span className="text-sm text-slate-400 mr-2">Status:</span>
              <span className={`text-sm font-medium ${
                response.status_code >= 200 && response.status_code < 300
                  ? 'text-green-400'
                  : response.status_code >= 400
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}>{response.status_code}</span>
            </div>
            
            <div className="bg-slate-900 p-3 rounded-md flex items-center">
              <Clock size={14} className="text-slate-400 mr-1.5" />
              <span className="text-sm text-slate-400 mr-1">Time:</span>
              <span className="text-sm">{response.time_ms.toFixed(2)} ms</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Headers</h4>
              <div className="rounded-lg bg-black/30 p-3">
                <pre className="text-xs text-slate-300 overflow-auto max-h-32">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Response Body</h4>
              <CodeBlock 
                id="response-body" 
                code={typeof response.response === 'string' 
                  ? response.response 
                  : JSON.stringify(response.response, null, 2)}
                language="json" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPlayground;
