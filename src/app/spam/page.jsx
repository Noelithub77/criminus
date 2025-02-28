'use client';

import { useState } from 'react';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export default function SpamDetection() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message to analyze');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setParsedResult(null);
      
      const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-2.0-flash-lite",
        maxOutputTokens: 2048,
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      });

      const response = await model.invoke(`You are a spam detection system. Analyze this SMS message and return a JSON object with spamScore (0-100), dangerScore (0-100), and warnings array: ${message}`);
      
      setResult(response);
      
      try {
        // Try to parse the response content
        const content = response.content || response;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(jsonStr);
        setParsedResult(parsed);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
      }
    } catch (err) {
      setError('Error analyzing message. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">SMS Spam Detector</h1>
      
      <div className="space-y-4">
        <textarea
          className="w-full p-3 border rounded-lg min-h-[100px] text-white"
          placeholder="Enter SMS message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        <button
          onClick={analyzeMessage}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Message'}
        </button>
        
        {error && (
          <div className="text-red-500 p-3 rounded-lg bg-red-50">
            {error}
          </div>
        )}
        
        {parsedResult && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-700">Spam Score</h3>
                  <div className="text-3xl font-bold text-orange-500">
                    {parsedResult.spamScore}%
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-700">Danger Score</h3>
                  <div className="text-3xl font-bold text-red-500">
                    {parsedResult.dangerScore}%
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Warnings</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <ul className="list-disc pl-5 space-y-2">
                    {parsedResult.warnings?.map((warning, index) => (
                      <li key={index} className="text-gray-700">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-white mb-3">Raw Response</h3>
              <pre className="whitespace-pre-wrap break-words text-sm text-gray-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 