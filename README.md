# 🚀 HireMind: Your AI-Powered Strategic Career Co-Pilot

HireMind is a revolutionary job search ecosystem built for the **Google AI Hackathon**. It leverages **Google Vertex AI (Gemini 2.5 Flash)** to create an autonomous Agentic Workflow that transforms the tedious job application process into a seamless, one-click experience.

From extracting job descriptions to dynamically generating tailored resumes, predicting ATS scores, and instantly tracking applications in a personalized dashboard—HireMind handles it all.

---

## ✨ Key Features

### 1. 🧠 Autonomous Agentic Workflow (Vertex AI)
- **Semantic JD Parsing & Visa Check:** Instantly extracts key job details and automatically halts if the role explicitly denies visa sponsorship (e.g., "US Citizen Only").
- **Predictive Analytics:** Calculates your current ATS Match Rate and Interview Probability before and after optimization.
- **Adaptive Strategy:** If your match rate is < 50%, the AI Agent switches to "Aggressive Mode" to heavily rewrite and highlight transferable skills. If > 80%, it switches to "Refinement Mode".
- **Company Research Integration:** The agent dynamically calls tools to "research" company news to craft highly personalized Cover Letters and Cold Emails.

### 2. ⚡ Ultimate Chrome Extension
- **Deep DOM Extraction:** Extracts job postings directly from active tabs, bypassing iFrame and Shadow DOM limitations.
- **Shadow DOM Autofill Engine:** One-click application form filling that penetrates React/Angular states and Shadow Roots (e.g., Workday, Greenhouse).
- **One-Click Cold Email:** Instantly opens your native email client with a highly personalized follow-up email addressed to the recruiter.

### 3. 📊 Zero-DB Application Command Center
- **Magic Sync Dashboard:** A standalone React dashboard that instantly synchronizes your newly generated job applications from the Extension via a clever Base64 URL-Hash strategy—zero database latency, 100% seamless demo experience!

---

## 🏗️ System Architecture

The project is divided into three main components:

1. **`extension/` (Frontend - Chrome Extension):** Built with React & Vite. Acts as the user interface on job boards (LinkedIn, Indeed). Injects content scripts for JD extraction and form autofilling.
2. **`backend/` (Backend - Express & Vertex AI):** A Node.js API hosted on Google Cloud Run. It acts as the "Tool Provider" and Executor for the Gemini 2.5 Agentic Loop. It streams the AI's "Thinking Process" back to the extension in real-time via Server-Sent Events (SSE).
3. **`dashboard/hiremind-user/` (Frontend - Web App):** A React & Vite application serving as the user's personal Kanban board to track job applications, upcoming interviews, and AI-generated notes.

---

## 🛠️ Tech Stack

- **AI & LLM:** Google Vertex AI (`gemini-2.5-flash`), Function Calling (Tool Use)
- **Frontend (Extension & Dashboard):** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express.js, Server-Sent Events (SSE)
- **Auth:** Firebase Authentication (Google Sign-in)
- **Deployment:** Google Cloud Run (Backend)

---

## 🚀 Getting Started (Local Development)

To run the entire ecosystem locally, you will need three terminal windows.

### Prerequisites
- Node.js (v18+)
- `npm` or `yarn`

### Step 1: Start the Backend (AI Agent API)
1. Open Terminal 1:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend` folder and add your Google Cloud credentials (if required for Vertex AI local testing):
   ```env
   PORT=8080
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:8080`.*

### Step 2: Start the Dashboard (Command Center)
1. Open Terminal 2:
   ```bash
   cd dashboard/hiremind-user
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The dashboard will run on `http://localhost:3000` (or 5173).*

### Step 3: Build and Load the Chrome Extension
1. Open Terminal 3:
   ```bash
   cd extension
   npm install
   ```
2. Build the extension for production (must be rebuilt after any code changes):
   ```bash
   npm run build
   ```
3. **Load into Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** in the top right corner.
   - Click **"Load unpacked"** and select the `extension/dist` folder.
   - *Note: Every time you run `npm run build`, you must click the 🔄 (Reload) icon on the extension card in Chrome.*

---

## ☁️ Deployment Guide

### Deploying the Backend to Google Cloud Run
1. Ensure you have the Google Cloud CLI installed and authenticated.
2. Build and deploy using Google Cloud Run:
   ```bash
   cd backend
   gcloud run deploy career-agent-backend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```
3. Update the frontend fetch URL in `extension/src/App.tsx` with your newly provisioned Cloud Run URL.

### Deploying the Dashboard
The dashboard is a static React Single Page Application (SPA). It can be easily deployed to Vercel, Netlify, or Firebase Hosting.
```bash
cd dashboard/hiremind-user
npm run build
# Deploy the /dist folder to your preferred hosting provider
```

---

## 💡 How to Demo

1. Open a job posting on LinkedIn or Indeed.
2. Open the HireMind Chrome Extension and log in (or use "Continue from last time").
3. Click **"Extract from Page"** to pull the Job Description.
4. Click **"Generate"** and watch the AI Agent's thought process stream in real-time on the terminal UI.
5. Review your optimized ATS score and tailored resume.
6. Click **"Open Dashboard"**—a new tab will open, and your generated job will magically sync to the top of your Kanban board!
7. Back on the job board, click **"Autofill Application"** to let the extension complete the form for you.
8. Click **"Send Email"** to instantly open an email draft to the recruiter with the AI-generated Cover Letter.

---

**Built with ❤️ for the Google AI Hackathon**