import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { runAgenticLoop } from './src/services/agent';

/**
 * ============================================================================
 * THE STRATEGIC RESUME AGENT - BACKEND SERVER
 * ============================================================================
 * 
 * ARCHITECTURE NOTE:
 * Per Google AI Studio environment security constraints, the Gemini API calls 
 * MUST be executed from the frontend code. Therefore, the actual Agentic Loop 
 * (Step 0 to Step 3) is implemented in `src/services/agent.ts`.
 * 
 * This Node.js Express server acts as the "Tool Provider" for the Agent.
 * It exposes the APIs that the Gemini Agent autonomously calls during Step 1 & 2.
 * 
 * THE 5-STEP AGENTIC WORKFLOW (Implemented in `src/services/agent.ts`):
 * 
 * Step 0: Semantic Extraction (The Parser)
 *   - The frontend sends `rawWebpageText` to Gemini to extract structured data 
 *     (companyName, jobTitle, location, etc.) using a strict JSON schema.
 * 
 * Step 1: Tool Definitions (The Agent's Toolkit)
 *   - The frontend defines tools (predict_success_metrics, research_company_news, 
 *     log_career_strategy) and passes them to Gemini.
 *   - When Gemini decides to use a tool, the frontend intercepts the call and 
 *     makes an HTTP POST request to the endpoints defined in this server.js file.
 * 
 * Step 2: The Reasoning & Adaptation Loop
 *   - Gemini is instructed to first call `predict_success_metrics`.
 *   - Based on the returned probability, it switches to "Aggressive Mode" (<50%) 
 *     or "Refinement Mode" (>80%).
 *   - It then calls `research_company_news` to gather grounding data.
 *   - Finally, it calls `log_career_strategy` to record the decision.
 * 
 * Step 3: Synthesis & Structured Output
 *   - Gemini synthesizes the final customized resume, cover letter, and summary, 
 *     returning a strict JSON object for the frontend to render.
 * ============================================================================
 */

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT as string) || 8080;

  app.use(cors());
  app.use(express.json());

  // Tool 1: predict_success_metrics
  app.post('/api/predict', (req, res) => {
    const { resumeText, extractedJobData } = req.body;
    // Mock prediction logic
    const isTech = extractedJobData?.jobTitle?.toLowerCase().includes('engineer');
    const preAtsScore = isTech ? 65 : 45;
    const preInterviewProbability = isTech ? 55 : 30;
    
    res.json({
      preAtsScore,
      preInterviewProbability
    });
  });

  // Tool 2: research_company_news
  app.post('/api/research', (req, res) => {
    const { companyName } = req.body;
    // Mock research
    res.json({
      headlines: [
        `${companyName || 'The company'} announces new AI-driven product line.`,
        `${companyName || 'The company'} expands operations to Europe.`,
        `${companyName || 'The company'} recognized as a top workplace in 2026.`
      ]
    });
  });

  // Tool 3: log_career_strategy
  app.post('/api/log', (req, res) => {
    const { strategyType } = req.body;
    console.log(`[Firestore Mock] Logged strategy: ${strategyType}`);
    res.json({ success: true, loggedStrategy: strategyType });
  });

  // Streaming API Endpoint for Cloud Run deployment
  app.post('/api/generate-resume-stream', async (req, res) => {
    // 1. Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { rawWebpageText, resumeText } = req.body;

    // 2. Define the onThought callback to push data to the client
    const onThought = (thought: string) => {
      const message = JSON.stringify({ type: 'thought', content: thought });
      res.write(`data: ${message}\n\n`);
    };

    try {
      // 3. Execute the Agentic Loop
      const finalResult = await runAgenticLoop(rawWebpageText, resumeText, onThought);
      
      // 4. Push the final result
      const finalMessage = JSON.stringify({ type: 'result', content: finalResult });
      res.write(`data: ${finalMessage}\n\n`);

    } catch (error: any) {
      const errorMessage = JSON.stringify({ type: 'error', content: error.message });
      res.write(`data: ${errorMessage}\n\n`);
    } finally {
      // 5. Close the connection
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Agent server listening on port ${port}`);
  });
}

startServer();
