import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

// Configure the backend API URL
// We will use relative path if deployed to Netlify alongside functions
// For local dev, we might point to localhost
const API_URL = import.meta.env.PROD ? '/.netlify/functions/api/bfhl' : 'http://localhost:3000/bfhl';

const options = [
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'highest_lowercase_alphabet', label: 'Highest lowercase alphabet' }
];

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "0827AL231151";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponseData(null);

    try {
      // Validate JSON
      const parsedJson = JSON.parse(jsonInput);
      
      if (!parsedJson.data || !Array.isArray(parsedJson.data)) {
         setError('Invalid JSON format: "data" array is required.');
         return;
      }

      setIsLoading(true);

      const response = await axios.post(API_URL, parsedJson);
      
      setResponseData(response.data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please ensure your input is valid JSON.');
      } else {
        setError(err.response?.data?.message || err.message || 'Error connecting to API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (selected) => {
    setSelectedOptions(selected || []);
  };

  const renderFilteredResponse = () => {
    if (!responseData) return null;

    const selectedValues = selectedOptions.map(opt => opt.value);
    
    // If no option selected, maybe don't show any filtered data or show raw?
    if (selectedValues.length === 0) return null;

    return (
      <div className="mt-4 text-left">
        <h3 className="font-semibold mb-2">Filtered Response</h3>
        {selectedValues.includes('numbers') && (
           <div className="mb-2">
              <span className="font-semibold">Numbers:</span> {responseData.numbers?.join(', ')}
           </div>
        )}
        {selectedValues.includes('alphabets') && (
           <div className="mb-2">
              <span className="font-semibold">Alphabets:</span> {responseData.alphabets?.join(', ')}
           </div>
        )}
        {selectedValues.includes('highest_lowercase_alphabet') && (
           <div className="mb-2">
              <span className="font-semibold">Highest lowercase alphabet:</span> {responseData.highest_lowercase_alphabet?.join(', ')}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">BFHL API Challenge</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          <label className="text-left w-full font-medium mb-2 text-gray-700">API Input</label>
          <textarea 
            className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows="4"
            placeholder='{ "data": ["A", "C", "z"] }'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isLoading || !jsonInput.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        {responseData && (
          <div className="mt-6 w-full text-left">
             <label className="font-medium mb-2 block text-gray-700">Multi Filter</label>
             <Select
                isMulti
                name="filters"
                options={options}
                className="basic-multi-select mb-4"
                classNamePrefix="select"
                onChange={handleSelectChange}
                placeholder="Select filters..."
             />
             
             {renderFilteredResponse()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
