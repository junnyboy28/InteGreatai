
import React from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface AnalysisFormProps {
  onSubmit: (data: {
    documentation_url: string;
    use_case: string;
    preferred_language: string;
  }) => void;
  loading: boolean;
  error: string | null;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = React.useState({
    documentation_url: '',
    use_case: '',
    preferred_language: 'javascript',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const apiSuggestions = [
    { name: 'Twitter API', url: 'https://developer.twitter.com/en/docs/twitter-api' },
    { name: 'Stripe API', url: 'https://stripe.com/docs/api' },
    { name: 'OpenAI API', url: 'https://platform.openai.com/docs/api-reference' },
  ];

  const handleSuggestionClick = (url: string) => {
    setFormData({
      ...formData,
      documentation_url: url,
    });
  };

  return (
    <div className="animated-bg bg-integreat-dark-blue rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-1">Analyze API Documentation</h2>
      <p className="text-slate-400 mb-4 text-sm">
        Enter the URL to your API documentation and we'll extract the endpoints and generate wrapper code.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start">
          <AlertCircle className="text-red-400 mr-2 mt-0.5" size={16} />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
      
      <form id="apiForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="documentation_url" className="block text-sm font-medium text-slate-300 mb-1">
            API Documentation URL
          </label>
          <input
            type="url"
            id="documentation_url"
            name="documentation_url"
            value={formData.documentation_url}
            onChange={handleChange}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:ring-2 focus:ring-integreat-light-blue focus:border-transparent outline-none"
            placeholder="https://api.example.com/docs"
            required
          />
        </div>
        
        <div>
          <label htmlFor="use_case" className="block text-sm font-medium text-slate-300 mb-1">
            Use Case Description
          </label>
          <textarea
            id="use_case"
            name="use_case"
            value={formData.use_case}
            onChange={handleChange}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:ring-2 focus:ring-integreat-light-blue focus:border-transparent outline-none min-h-[80px]"
            placeholder="I want to build a dashboard that shows user activity and allows user management..."
            required
          />
        </div>
        
        <div>
          <label htmlFor="preferred_language" className="block text-sm font-medium text-slate-300 mb-1">
            Preferred Programming Language
          </label>
          <select
            id="preferred_language"
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleChange}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:ring-2 focus:ring-integreat-light-blue focus:border-transparent outline-none"
            required
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="ruby">Ruby</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="php">PHP</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-integreat-light-blue hover:bg-blue-600 text-white rounded-md font-medium flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            ) : (
              <>
                <Search size={18} className="mr-2" />
                Analyze API Documentation
              </>
            )}
          </button>
        </div>
        
        <div className="pt-2">
          <p className="text-xs text-slate-400 mb-2">Or try one of these examples:</p>
          <div className="flex flex-wrap gap-2">
            {apiSuggestions.map((api) => (
              <button
                key={api.name}
                type="button"
                className="api-suggestion text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors"
                onClick={() => handleSuggestionClick(api.url)}
                data-url={api.url}
              >
                {api.name}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnalysisForm;
