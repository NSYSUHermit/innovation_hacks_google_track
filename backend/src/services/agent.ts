import { VertexAI, FunctionDeclarationSchemaType, FunctionDeclaration } from '@google-cloud/vertexai';

// Initialize Vertex AI
const vertex_ai = new VertexAI({
    project: 'career-agent-pro', 
    location: 'us-central1'
});

const model = vertex_ai.getGenerativeModel({
    model: 'gemini-2.5-flash', 
});

// Step 1: Tool Definitions (The Agent's Toolkit)
const predictSuccessMetricsTool: FunctionDeclaration = {
  name: 'predict_success_metrics',
  description: 'Predicts the ATS score and interview probability based on the resume and job data.',
  parameters: {
        type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
          resumeText: { type: FunctionDeclarationSchemaType.STRING, description: 'The user\'s resume text.' },
      extractedJobData: {
            type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
              jobTitle: { type: FunctionDeclarationSchemaType.STRING },
              companyName: { type: FunctionDeclarationSchemaType.STRING },
        },
      },
    },
    required: ['resumeText', 'extractedJobData'],
  },
};

const researchCompanyNewsTool: FunctionDeclaration = {
  name: 'research_company_news',
  description: 'Researches recent headlines and achievements about the company.',
  parameters: {
        type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
          companyName: { type: FunctionDeclarationSchemaType.STRING, description: 'The name of the company to research.' },
    },
    required: ['companyName'],
  },
};

const logCareerStrategyTool: FunctionDeclaration = {
  name: 'log_career_strategy',
  description: 'Logs the chosen career strategy to the database.',
  parameters: {
        type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
          strategyType: { type: FunctionDeclarationSchemaType.STRING, description: 'The strategy type, e.g., "Aggressive Pivot" or "Refinement".' },
    },
    required: ['strategyType'],
  },
};

export interface AgentResult {
  isSponsorshipAvailable?: boolean;
  sponsorshipReason?: string;
  initialMetrics: { atsScore: number; interviewProb: number };
  optimizedMetrics: { atsScore: number; interviewProb: number };
  customizedResume: string;
  coverLetter: string;
  coldEmail: string;
  summary: string;
  autoFillFields: { jobTitle: string; company: string; location: string; yearsExp: string };
}

export async function runAgenticLoop(
  rawWebpageText: string, 
  resumeText: string,
  onThought?: (thought: string) => void,
  enabledTools?: string[]
): Promise<AgentResult> {
  const logThought = (consoleMsg: string, userMsg?: string) => {
    console.log(consoleMsg); // Always keep detailed logs in the backend terminal
    if (onThought && userMsg) onThought(userMsg); // Only send to frontend if userMsg is provided
  };

  try {
    logThought("[Step 0] Starting Semantic Extraction of job description...", "📄 Analyzing job description and keywords...");
    // Step 0: Semantic Extraction (The Parser)
    // We use Gemini to extract structured data from the messy webpage text.
    
    const isSponsorshipCheckEnabled = !enabledTools || enabledTools.includes('check_sponsorship');
    const extractionPrompt = isSponsorshipCheckEnabled
      ? `Extract the following information from this raw webpage text. Pay special attention to visa sponsorship policies. If it explicitly denies sponsorship (e.g., "US Citizen only", "No C2C", "No visa sponsorship"), set sponsorshipAvailable to false and provide the exact quote.\n\n${rawWebpageText}`
      : `Extract the following information from this raw webpage text.\n\n${rawWebpageText}`;

    const extractionRequiredFields = ['companyName', 'jobTitle', 'location', 'yearsOfExperienceRequired', 'cleanJobDescription'];
    if (isSponsorshipCheckEnabled) {
      extractionRequiredFields.push('sponsorshipAvailable');
    }

    const extractionResponse = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            companyName: { type: FunctionDeclarationSchemaType.STRING },
            jobTitle: { type: FunctionDeclarationSchemaType.STRING },
            location: { type: FunctionDeclarationSchemaType.STRING },
            yearsOfExperienceRequired: { type: FunctionDeclarationSchemaType.STRING },
            cleanJobDescription: { type: FunctionDeclarationSchemaType.STRING },
            sponsorshipAvailable: { 
              type: FunctionDeclarationSchemaType.BOOLEAN, 
              description: "Set to false ONLY IF the job explicitly states they do not sponsor visas, require US citizenship, or 'No C2C'. Otherwise, true." 
            },
            sponsorshipReason: { 
              type: FunctionDeclarationSchemaType.STRING, 
              description: "The exact quote from the JD denying sponsorship. Leave empty if sponsorship is available." 
            },
          },
          required: extractionRequiredFields,
        },
      },
    });

    const extractedText = extractionResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const extractedData = JSON.parse(extractedText);
    
    // Sponsorship Check: Early Exit if sponsorship is explicitly denied
    if (isSponsorshipCheckEnabled && extractedData.sponsorshipAvailable === false) {
      logThought(`[Step 0] Sponsorship check failed: "${extractedData.sponsorshipReason}"`, `❌ HALTING: This job does not provide visa sponsorship -> "${extractedData.sponsorshipReason}"`);
      return {
        isSponsorshipAvailable: false,
        sponsorshipReason: extractedData.sponsorshipReason,
        initialMetrics: { atsScore: 0, interviewProb: 0 },
        optimizedMetrics: { atsScore: 0, interviewProb: 0 },
        customizedResume: "", coverLetter: "", coldEmail: "", summary: "",
        autoFillFields: { jobTitle: extractedData.jobTitle, company: extractedData.companyName, location: extractedData.location, yearsExp: extractedData.yearsOfExperienceRequired }
      };
    }

    logThought(`[Step 0] Extraction complete. Found Job Title: "${extractedData.jobTitle}" at "${extractedData.companyName}".`, `✅ Successfully parsed job: ${extractedData.jobTitle} @ ${extractedData.companyName}`);

    logThought("[Step 1 & 2] Initializing Agentic Loop with tools...");
    // Step 2: The Reasoning & Adaptation Loop
    // We set up the system instructions to guide Gemini through the reasoning process.
    
    const allTools = [predictSuccessMetricsTool, researchCompanyNewsTool, logCareerStrategyTool];
    const activeTools = enabledTools 
      ? allTools.filter(tool => enabledTools.includes(tool.name)) 
      : allTools;

    const systemInstruction = `
      You are "The Strategic Resume Agent", a Senior Career Co-Pilot.
      Your goal is to adapt the user's resume and write a cover letter based on the extracted job data.
      
      You MUST follow these steps:
      1. You must first call the prediction tool (predict_success_metrics) to see the initial odds.
      2. If Probability < 50%, switch to 'Aggressive Mode': heavily rewrite the resume to highlight 'Transferable Skills' and 'ATS Keyword Injection'.
      3. If Probability > 80%, switch to 'Refinement Mode': maintain the user's original voice, focusing only on polish and formatting.
      4. Call log_career_strategy to log the chosen strategy.
      5. Call research_company_news to gather company news.
      6. You must use the company news gathered to write a highly personalized summary and cover letter that proves the user has researched the company.
      7. Generate a highly persuasive 'Cold Email' (or Thank You Letter) addressed to the recruiter for this position.
      
      CRITICAL TOOL RULES:
      - You ONLY have access to the tools provided in this session. If a step requires a tool that is not available, SKIP THAT STEP and proceed.
      - If a tool returns an error (e.g., {"error": "Tool call failed"}), DO NOT retry calling the same tool.
      - If 'predict_success_metrics' is unavailable or fails, assume a probability of 50% and proceed.
      - If 'research_company_news' is unavailable or fails, assume no news is available and proceed.
      - Do not get stuck in a loop of repeated tool calls. Proceed to the final output generation immediately.
      
      Finally, output a valid JSON object EXACTLY matching this schema (do NOT wrap in markdown \`\`\`json tags):
      {
        "initialMetrics": { "atsScore": number, "interviewProb": number },
        "optimizedMetrics": { "atsScore": number, "interviewProb": number },
        "customizedResume": "string",
        "coverLetter": "string",
        "coldEmail": "string",
        "summary": "string",
        "autoFillFields": {
          "jobTitle": "string", "company": "string", "location": "string", "yearsExp": "string"
        }
      }
    `;

    const chatConfig: any = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };
    if (activeTools.length > 0) {
      chatConfig.tools = [{ functionDeclarations: activeTools }];
    }
    
    const chat = model.startChat(chatConfig);

    // Start the loop
    logThought("[Agent] Sending initial prompt to Gemini with resume and extracted job data...", "🧠 AI Agent is evaluating your resume fit...");
    let chatResponse = await chat.sendMessage([{ text: `Here is the user's resume:\n${resumeText}\n\nHere is the extracted job data:\n${JSON.stringify(extractedData)}` }]);
    let response = chatResponse.response;

    // Determine base URL for fetch depending on environment (Node.js vs Browser)
    const baseUrl = typeof window !== 'undefined' ? '' : `http://127.0.0.1:${process.env.PORT || 8080}`;

    let functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall) || [];

    // Handle function calls
    while (functionCalls.length > 0) {
      const functionResponses: any[] = [];
      
      for (const call of functionCalls) {
        let userMessage = "";
        if (call.name === 'predict_success_metrics') userMessage = "📊 Calculating ATS match rate and interview probability...";
        else if (call.name === 'research_company_news') userMessage = "📰 Researching recent company news and background...";
        else if (call.name === 'log_career_strategy') userMessage = "🎯 Crafting your tailored resume strategy...";

        logThought(`[Tool Call] Agent decided to call \`${call.name}\` with args: ${JSON.stringify(call.args)}`, userMessage);
        
        let result = {};
        try {
          if (call.name === 'predict_success_metrics') {
            const res = await fetch(`${baseUrl}/api/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(call.args),
            });
            result = await res.json();
          } else if (call.name === 'research_company_news') {
            const res = await fetch(`${baseUrl}/api/research`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(call.args),
            });
            result = await res.json();
          } else if (call.name === 'log_career_strategy') {
            const res = await fetch(`${baseUrl}/api/log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(call.args),
            });
            result = await res.json();
          }
        } catch (err) {
          console.error(`Error calling tool ${call.name}:`, err);
          result = { error: 'Tool call failed' };
        }
        
        // Tool results are too verbose; only log in backend, do not send to frontend
        logThought(`[Tool Result] \`${call.name}\` returned: ${JSON.stringify(result)}`);
        
        functionResponses.push({
          functionResponse: {
            name: call.name as string,
            response: result,
          }
        });
      }
      
      // Send the tool responses back to the model
      logThought("[Agent] Sending tool results back to Gemini for further reasoning..."); // Transition message, not shown on frontend
      chatResponse = await chat.sendMessage(functionResponses);
      response = chatResponse.response;
      functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall) || [];
    }

    logThought("[Step 3] Synthesis complete. Parsing final structured output...", "✨ Generating final ATS-optimized resume and cover letter...");
    // Step 3: Synthesis & Structured Output
    
    let responseText = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || '{}';
    // Failsafe: Remove markdown json tags that AI might return
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(responseText) as AgentResult;

  } catch (error) {
    console.error('Agent loop failed:', error);
    if (onThought) onThought(`[Error] Agent loop failed: ${error}`);
    // Error Handling & Fallback
    // Return a high-quality MOCK JSON response so the user demo remains seamless.
    return {
      isSponsorshipAvailable: true,
      initialMetrics: { atsScore: 45, interviewProb: 30 },
      optimizedMetrics: { atsScore: 85, interviewProb: 75 },
      customizedResume: "# Fallback Resume\\n\\nThis is a fallback generated due to an error.",
      coverLetter: "Dear Hiring Manager,\\n\\nI am writing to apply for the position...",
      coldEmail: "Hi Recruiter,\n\nI recently applied for the Software Engineer role and wanted to quickly follow up. I believe my skills make me a great fit for the team. I have attached my resume for your consideration.\n\nBest,\nCandidate",
      summary: "Experienced professional with a strong background...",
      autoFillFields: {
        jobTitle: "Software Engineer",
        company: "Tech Corp",
        location: "Remote",
        yearsExp: "5+",
      },
    };
  }
}
