/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { runAgenticLoop, AgentResult } from './services/agent';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [rawWebpageText, setRawWebpageText] = useState('We are looking for a Senior Software Engineer at TechCorp. Location: San Francisco. Requirements: 5+ years of experience in Node.js and React.');
  const [resumeText, setResumeText] = useState('John Doe\\nSoftware Developer\\n3 years of experience building web applications with JavaScript.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const thoughtsEndRef = useRef<HTMLDivElement>(null);

  const handleRunAgent = async () => {
    setIsLoading(true);
    setResult(null);
    setThoughts([]);
    try {
      // For the AI Studio preview, we run the agent logic directly in the browser
      // to comply with the environment's security constraints.
      // When deployed to Cloud Run, you can switch this to use the streaming API:
      // await runAgenticLoopStream(rawWebpageText, resumeText);
      
      const res = await runAgenticLoop(rawWebpageText, resumeText, (thought) => {
        setThoughts((prev) => [...prev, thought]);
      });
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example of how to call the streaming API when deployed to Cloud Run
  const runAgenticLoopStream = async (rawWebpageText: string, resumeText: string) => {
    try {
      const response = await fetch('/api/generate-resume-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawWebpageText, resumeText })
      });

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            
            if (data.type === 'thought') {
              setThoughts(prev => [...prev, data.content]);
            } else if (data.type === 'result') {
              setResult(data.content);
            } else if (data.type === 'error') {
              console.error("Agent Error:", data.content);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream failed:", error);
    }
  };

  useEffect(() => {
    if (thoughtsEndRef.current) {
      thoughtsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thoughts]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">The Strategic Resume Agent</h1>
          <p className="text-gray-600 mt-2">Paste the job description and your resume below to generate optimized application materials.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Raw Webpage Text (Job Description)</label>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={rawWebpageText}
              onChange={(e) => setRawWebpageText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Your Resume</label>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Agent is reasoning...
            </>
          ) : (
            'Run Agentic Loop'
          )}
        </button>

        {thoughts.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto space-y-2 shadow-inner">
            <h3 className="text-gray-100 font-semibold mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-700">Agent Thinking Process</h3>
            {thoughts.map((t, i) => (
              <div key={i} className="whitespace-pre-wrap">{`> ${t}`}</div>
            ))}
            <div ref={thoughtsEndRef} />
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">Agent Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Initial Metrics</h3>
                <p className="text-blue-800">ATS Score: <span className="font-bold">{result.initialMetrics.atsScore}</span></p>
                <p className="text-blue-800">Interview Probability: <span className="font-bold">{result.initialMetrics.interviewProb}%</span></p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-green-900 mb-2">Optimized Metrics</h3>
                <p className="text-green-800">ATS Score: <span className="font-bold">{result.optimizedMetrics.atsScore}</span></p>
                <p className="text-green-800">Interview Probability: <span className="font-bold">{result.optimizedMetrics.interviewProb}%</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Auto-Fill Fields</h3>
                <div className="bg-gray-100 p-3 rounded-md mt-1 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Job Title:</span> {result.autoFillFields.jobTitle}</div>
                  <div><span className="font-semibold">Company:</span> {result.autoFillFields.company}</div>
                  <div><span className="font-semibold">Location:</span> {result.autoFillFields.location}</div>
                  <div><span className="font-semibold">Years Exp:</span> {result.autoFillFields.yearsExp}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Professional Summary</h3>
                <p className="bg-gray-50 p-4 rounded-md mt-1 text-gray-700 whitespace-pre-wrap">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-md mt-1 text-gray-700 whitespace-pre-wrap">{result.coverLetter}</div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Customized Resume</h3>
                <div className="bg-gray-50 p-4 rounded-md mt-1 text-gray-700 whitespace-pre-wrap">{result.customizedResume}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
