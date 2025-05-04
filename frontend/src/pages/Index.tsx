
import React, { useState } from 'react';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import AnalysisForm from '@/components/AnalysisForm';
import ApiResults from '@/components/ApiResults';
import WrapperCode from '@/components/WrapperCode';
import EnvironmentSetup from '@/components/EnvironmentSetup';
import TestPlayground from '@/components/TestPlayground';
import { useToast } from '@/hooks/use-toast';

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

interface ApiResponse {
  endpoints: Endpoint[];
  auth_methods: AuthMethod[];
  suggested_integration: string;
  wrapper_code: string;
  env_template: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const { toast } = useToast();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleAnalyzeSubmit = async (formData: { documentation_url: string; use_case: string; preferred_language: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      setApiData(data);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed API documentation from ${formData.documentation_url}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEndpoint = async (requestData: any): Promise<any> => {
    const response = await fetch('/api/test-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  };

  const handleExportPostman = () => {
    if (!apiData || !apiData.endpoints || apiData.endpoints.length === 0) {
      toast({
        title: "No API endpoints to export",
        variant: "destructive",
      });
      return;
    }
    
    // Prompt for collection name and base URL
    const collectionName = prompt('Enter a name for your Postman collection:', 'API Collection') || 'API Collection';
    const baseUrl = prompt('Enter the base URL for the API:', 'https://api.example.com') || 'https://api.example.com';
    
    // Generate Postman collection
    const postmanCollection = generatePostmanCollection(collectionName, baseUrl, apiData.endpoints);
    
    // Download as JSON file
    downloadJson(postmanCollection, `${collectionName.replace(/\s+/g, '_')}.postman_collection.json`);
    
    toast({
      title: "Export Successful",
      description: `Exported ${apiData.endpoints.length} endpoints to Postman collection`,
    });
  };

  // Helper functions for Postman export
  const generatePostmanCollection = (name: string, baseUrl: string, endpoints: Endpoint[]) => {
    const collection = {
      info: {
        _postman_id: generateUuid(),
        name: name,
        description: "Generated from InteGreat.ai",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: endpoints.map(endpoint => {
        // Make sure baseUrl and path are properly joined
        let fullUrl = baseUrl;
        if (baseUrl.endsWith('/') && endpoint.path.startsWith('/')) {
          fullUrl = baseUrl + endpoint.path.substring(1);
        } else if (!baseUrl.endsWith('/') && !endpoint.path.startsWith('/')) {
          fullUrl = baseUrl + '/' + endpoint.path;
        } else {
          fullUrl = baseUrl + endpoint.path;
        }
        
        const urlObj = new URL(fullUrl);
        
        // Create request item
        const item = {
          name: `${endpoint.method} ${endpoint.path}`,
          request: {
            method: endpoint.method,
            header: [],
            url: {
              raw: fullUrl,
              protocol: urlObj.protocol.replace(':', ''),
              host: urlObj.hostname.split('.'),
              path: urlObj.pathname.split('/').filter(p => p),
            },
            description: endpoint.description
          },
          response: []
        };
        
        // Add parameters if any
        if (endpoint.parameters && Object.keys(endpoint.parameters).length > 0) {
          item.request.url.query = Object.entries(endpoint.parameters).map(([name, info]) => ({
            key: name,
            value: "",
            description: info.description,
            disabled: false
          }));
        }
        
        // Add body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
          item.request.body = {
            mode: 'raw',
            raw: '{\n    "key": "value"\n}',
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }
        
        return item;
      })
    };
    
    return collection;
  };

  const downloadJson = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-integreat-background text-integreat-text">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <AnalysisForm onSubmit={handleAnalyzeSubmit} loading={loading} error={error} />
              
              {apiData ? (
                <ApiResults 
                  endpoints={apiData.endpoints}
                  auth_methods={apiData.auth_methods}
                  suggested_integration={apiData.suggested_integration}
                  wrapper_code={apiData.wrapper_code}
                  env_template={apiData.env_template}
                  onExportPostman={handleExportPostman}
                />
              ) : (
                <div className="bg-integreat-dark-blue rounded-lg p-6 shadow-lg animated-bg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-2">Welcome to InteGreat.ai</h3>
                    <p className="text-slate-400 mb-4">
                      The smart API Documentation analyzer and code generator.
                    </p>
                    <div className="text-slate-400 text-sm max-w-md mx-auto">
                      <p>Enter your API documentation URL, describe your use case, and we'll generate ready-to-use wrapper code.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'wrapper-code' && apiData ? (
            <WrapperCode code={apiData.wrapper_code} language={apiData.wrapper_code ? 'javascript' : 'text'} />
          ) : activeTab === 'wrapper-code' && (
            <div className="text-center py-12">
              <p className="text-slate-400">Analyze an API to generate wrapper code</p>
            </div>
          )}
          
          {activeTab === 'env-setup' && apiData ? (
            <EnvironmentSetup env_template={apiData.env_template || '# No environment variables needed'} />
          ) : activeTab === 'env-setup' && (
            <div className="text-center py-12">
              <p className="text-slate-400">Analyze an API to get environment setup instructions</p>
            </div>
          )}
          
          {activeTab === 'test-playground' && apiData ? (
            <TestPlayground endpoints={apiData.endpoints} onTestEndpoint={handleTestEndpoint} />
          ) : activeTab === 'test-playground' && (
            <div className="text-center py-12">
              <p className="text-slate-400">Analyze an API to access the test playground</p>
            </div>
          )}
        </div>
      </div>
      
      <footer className="bg-integreat-dark-blue py-4 border-t border-slate-700">
        <div className="container mx-auto px-4 text-sm text-center text-slate-500">
          InteGreat.ai &copy; {new Date().getFullYear()} - API Documentation Analyzer & Code Generator
        </div>
      </footer>
    </div>
  );
};

export default Index;
