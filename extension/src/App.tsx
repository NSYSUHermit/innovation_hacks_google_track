import { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Briefcase, FileText, UserCircle, LogOut, Sparkles, CheckCircle2, AlertCircle, Loader2, Settings, BarChart3, TrendingUp, Download, Mail, LayoutDashboard, ExternalLink } from 'lucide-react';

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  updatedAt: string;
}

// Lightweight Markdown renderer specifically designed for ATS resume layouts (no extra packages needed)
const ResumePreview = ({ text }: { text: string }) => {
  const formatText = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        elements.push(<div key={index} className="h-2"></div>);
        return;
      }

      // Parse bold and italics (supports ** and __ as well as * and _)
      const parseFormatting = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g);
        return parts.map((part, i) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
            return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          if ((part.startsWith('*') && part.endsWith('*') && part !== '*') || (part.startsWith('_') && part.endsWith('_') && part !== '_')) {
            return <em key={i} className="italic text-gray-600">{part.slice(1, -1)}</em>;
          }
          return part;
        });
      };

      // Handle headers (H1, H2, H3...)
      if (trimmed.startsWith('#')) {
        const match = trimmed.match(/^(#+)\s*(.*)/);
        if (match) {
          const level = match[1].length;
          const textContent = match[2];
          
          if (level === 1 || level === 3) {
            elements.push(<h1 key={index} className="text-xl font-bold text-center border-b-2 border-gray-800 pb-2 mb-4 uppercase tracking-wider text-gray-900">{parseFormatting(textContent)}</h1>);
          } else {
            elements.push(<h2 key={index} className="text-sm font-bold uppercase text-gray-800 mt-5 mb-2 border-b border-gray-300 pb-1">{parseFormatting(textContent)}</h2>);
          }
          return;
        }
      }

      // Handle bullet points (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const textContent = trimmed.substring(2);
        elements.push(
          <li key={index} className="ml-5 list-disc mb-1 leading-relaxed text-sm text-gray-700">
            {parseFormatting(textContent)}
          </li>
        );
        return;
      }

      // General paragraphs
      elements.push(
        <p key={index} className="mb-1 leading-relaxed text-sm text-gray-700">
          {parseFormatting(trimmed)}
        </p>
      );
    });
    return <>{elements}</>;
  };

  return (
    <div id="resume-preview" className="bg-white mx-auto shadow-sm px-6 py-8 w-full max-h-[350px] overflow-y-auto font-serif">
      {formatText(text)}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'job' | 'settings' | 'dashboard'>('job');
  
  // Job state
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sponsorshipIssue, setSponsorshipIssue] = useState<string | null>(null);
  const [autofillSuccess, setAutofillSuccess] = useState(false);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const thoughtsEndRef = useRef<HTMLDivElement>(null);
  const [latestJobData, setLatestJobData] = useState<any>(null); // 用來暫存剛生成的職缺資料
  const [metrics, setMetrics] = useState<{
    originalMatch: number;
    originalProb: number;
    newMatch: number;
    newProb: number;
  } | null>(null);
  const [toolsConfig, setToolsConfig] = useState({
    checkSponsorship: true,
    predictMetrics: true,
    researchNews: true,
    logStrategy: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser.uid, currentUser.email || '', currentUser.displayName || '');
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (thoughtsEndRef.current) {
      thoughtsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thoughts]);

  const loadProfile = async (uid: string, email: string, name: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile({
          uid,
          fullName: name,
          email: email,
          phone: '',
          location: '',
          linkedin: '',
          portfolio: '',
          summary: '',
          experience: '',
          education: '',
          skills: '',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(`Login Failed!\n\nError Code: ${error.code}\nError Message: ${error.message}\n\n💡 Troubleshooting:\n1. Go to Firebase Console > Authentication > Sign-in method > Google.\n2. Ensure "Project support email" is set.\n3. Ensure chrome-extension://<ID> is added to Authorized domains.`);
    }
  };

  const handleGuestLogin = () => {
    // Create a local mock user for testing without logging in
    const mockUser = {
      uid: 'guest-user-123',
      email: 'guest@example.com',
      displayName: 'Guest User',
    } as User;
    
    setUser(mockUser);
    setProfile({
      uid: mockUser.uid,
      fullName: 'Henry Lin',
      email: 'henry5060812@gmail.com',
      phone: '6232905568',
      location: 'San Francisco, CA',
      linkedin: 'https://www.linkedin.com/in/henrylin/',
      portfolio: 'https://github.com/henrylin',
      summary: 'Senior Software Engineer with 5 years of experience specializing in scalable Python backend architectures and AI-driven systems. Expert in designing high-performance FastAPI/Asyncio services, integrating complex RAG/LLM workflows, and managing distributed data pipelines. Proven track record in bridging low-level engineering with production-grade, containerized backends while maintaining 99.9% uptime through TDD and CI/CD excellence.',
      experience: 'Software Intern at ASUS Corp (2020-2023)/n Software Engineer at MicroTech Corp (2023-Present)',
      education: 'BS in Computer Science, Arizona State University',
      skills: 'Python, React, TypeScript, Chrome Extensions',
      updatedAt: new Date().toISOString()
    });
  };

  const handleLogout = async () => {
    if (user?.uid === 'guest-user-123') {
      setUser(null);
      setProfile(null);
    } else {
      await signOut(auth);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const updatedProfile = { ...profile, updatedAt: new Date().toISOString() };
      
      if (user.uid === 'guest-user-123') {
        // Local mode: Skip Firebase write, simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
      } else {
        // Authenticated mode: Write to Firebase Firestore
        await setDoc(doc(db, 'users', user.uid), updatedProfile);
      }

      setProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(`Save failed: ${error.message || 'Insufficient database permissions or network error'}`);
    } finally {
      setSaving(false);
    }
  };

  const extractJD = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'extractJD' }, (response) => {
        if (chrome.runtime.lastError) {
          alert(`System Error: ${chrome.runtime.lastError.message}\n\nPlease try refreshing the target webpage.`);
          return;
        }
        if (response && response.error) {
          alert(`Extraction failed: ${response.error}\n\nNote: Content cannot be extracted from chrome:// settings pages or new tabs. Please open a real job posting page to test.`);
          return;
        }
        if (response) {
          setJdTitle(response.title || 'Extracted Job');
          setJdText(response.text || '');
        }
      });
    } else {
      alert('⚠️ Preview Mode Restriction\n\nYou are currently in the AI Studio web preview window.\nThe page cannot extract content from other tabs due to browser security restrictions.\n\nPlease click "Export to ZIP" in the top right corner, pack the project, and install it in Chrome to extract content from your active job posting page!');
    }
  };

  const generateResume = async () => {
    if (!profile || !jdText) return;
    
    setGenerating(true);
    setMetrics(null);
    setGeneratedResume('');
    setGeneratedEmail('');
    setSponsorshipIssue(null);
    setThoughts([]);
    try {
      // Assemble data for backend Agent
      const rawWebpageText = `Title: ${jdTitle}\nDescription: ${jdText}`;
      const resumeText = `Name: ${profile.fullName}\nSummary: ${profile.summary}\nExperience: ${profile.experience}\nEducation: ${profile.education}\nSkills: ${profile.skills}`;

      // 收集使用者啟用的工具
      const enabledTools = [];
      if (toolsConfig.checkSponsorship) enabledTools.push('check_sponsorship');
      if (toolsConfig.predictMetrics) enabledTools.push('predict_success_metrics');
      if (toolsConfig.researchNews) enabledTools.push('research_company_news');
      if (toolsConfig.logStrategy) enabledTools.push('log_career_strategy');

      // Call Streaming API on Cloud Run
      const response = await fetch('https://career-agent-backend-63451007809.us-central1.run.app/api/generate-resume-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawWebpageText, resumeText, enabledTools })
      });

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().replace('data: ', ''));
              
              if (data.type === 'thought') {
                setThoughts(prev => [...prev, data.content]);
              } else if (data.type === 'result') {
                const res = data.content;
                if (res.isSponsorshipAvailable === false) {
                  setSponsorshipIssue(res.sponsorshipReason || 'Visa sponsorship explicitly not supported.');
                } else {
                  setMetrics({
                    originalMatch: res.initialMetrics?.atsScore || 0,
                    originalProb: res.initialMetrics?.interviewProb || 0,
                    newMatch: res.optimizedMetrics?.atsScore || 0,
                    newProb: res.optimizedMetrics?.interviewProb || 0,
                  });
                  setGeneratedResume(res.customizedResume || '');
                  setGeneratedEmail(res.coldEmail || '');

                  // 不用 Firebase！直接把生成的資料存在 Extension 的 State 中
                  const newJobRecord = {
                    id: `ai-${Date.now()}`,
                    company: res.autoFillFields?.company || 'Unknown Company',
                    role: res.autoFillFields?.jobTitle || jdTitle || 'Untitled Job',
                    status: 'Applied',
                    location: res.autoFillFields?.location || 'Remote',
                    fitScore: res.optimizedMetrics?.atsScore || 0,
                    interviewProbability: (res.optimizedMetrics?.interviewProb || 0) / 100,
                    appliedTime: new Date().toISOString(),
                    selectedChannels: ['HireMind Extension'],
                    tags: ['AI Tailored', 'Auto-Filled'],
                    experienceLevel: 'Mid-Level',
                    salary: 'TBD',
                    interviewTimeline: [],
                    jobDescription: jdText || '',
                    notes: `### 🤖 AI Generated Cover Letter\n\n${res.coverLetter || 'No cover letter generated.'}\n\n---\n\n### 📧 Follow-up Cold Email\n\n${res.coldEmail || 'No email generated.'}`
                  };
                  setLatestJobData(newJobRecord);
                }
              } else if (data.type === 'error') {
                console.error("Agent Error:", data.content);
              }
            } catch (e) {
              // Ignore errors from parsing incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate resume. Please verify the backend service is running normally.");
    }
    setGenerating(false);
  };

  // Export to actual PDF functionality
  const handleDownloadPDF = () => {
    const content = document.getElementById('resume-preview')?.innerHTML;
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ATS Resume</title>
            <style>
              @media print {
                @page { margin: 0; size: A4; }
                body { -webkit-print-color-adjust: exact; padding: 0 !important; }
              }
              body { background: white; margin: 0; padding: 2cm; font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; color: #374151; }
              h1 { font-size: 1.5rem; font-weight: bold; text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 0.5rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; }
              h2 { font-size: 0.875rem; font-weight: bold; text-transform: uppercase; color: #1f2937; margin-top: 1.25rem; margin-bottom: 0.5rem; border-bottom: 1px solid #d1d5db; padding-bottom: 0.25rem; }
              p { margin-bottom: 0.25rem; line-height: 1.625; font-size: 0.875rem; }
              ul { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.25rem; }
              li { margin-bottom: 0.25rem; line-height: 1.625; font-size: 0.875rem; }
              strong { font-weight: 600; color: #111827; }
              em { font-style: italic; color: #4b5563; }
              .h-2 { height: 0.5rem; }
            </style>
          </head>
          <body>
            ${content}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const autofillForm = (silent = false) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ 
        action: 'autofill', 
        data: {
          fullName: profile?.fullName,
          email: profile?.email,
          phone: profile?.phone,
          location: profile?.location,
          linkedin: profile?.linkedin,
          portfolio: profile?.portfolio,
          experience: profile?.experience,
          education: profile?.education,
          skills: profile?.skills,
          summary: profile?.summary,
          resumeText: generatedResume // Content optimized by AI
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          if (!silent) alert(`System Error: ${chrome.runtime.lastError.message}`);
          return;
        }
        if (response && response.error) {
          if (!silent) alert(`Autofill failed: ${response.error}`);
          return;
        }
        if (response && response.success) {
          if (response.filledCount === 0) {
            if (!silent) alert('No fillable fields found! This might not be a form page, or the field names are too unconventional.');
            return;
          }
          setAutofillSuccess(true);
          setTimeout(() => setAutofillSuccess(false), 3000);
        }
      });
    } else {
      if (!silent) alert('⚠️ Preview Mode Restriction\n\nPlease use the autofill feature in a real Chrome Extension environment.');
    }
  };

  const forceReloadAndFill = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          // 1. 強制重新整理當前頁面
          chrome.tabs.reload(tabs[0].id);
          
          // 2. 啟動連發填寫模式（每 2 秒嘗試一次，持續 10 秒），確保抓到延遲載入的表單
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            autofillForm(true); // 啟用 silent 模式，避免跳出煩人的警告
            if (attempts >= 5) {
              clearInterval(interval);
            }
          }, 2000);
        }
      });
    }
  };

  // 魔術般的 Demo 功能：一鍵開啟 Email 軟體並帶入所有內容
  const handleSendEmail = () => {
    if (!generatedEmail) return;
    const subject = encodeURIComponent(`Application for ${jdTitle || 'Position'} - ${profile?.fullName || 'Candidate'}`);
    const body = encodeURIComponent(generatedEmail);
    window.open(`mailto:recruiter@company.com?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-google-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6 text-center">
        <div className="w-16 h-16 bg-google-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">HireMind</h1>
        <p className="text-gray-500 mb-8 max-w-xs">Extract job details and generate tailored resumes instantly.</p>

        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm w-full max-w-xs justify-center"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-3 w-full max-w-xs my-5">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGuestLogin}
          className="flex items-center gap-3 bg-gray-900 border border-transparent rounded-full px-6 py-3 text-white font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98] w-full max-w-xs justify-center mb-3"
        >
          <UserCircle className="w-5 h-5 text-gray-300" />
          Continue from last time
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-google-blue rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800"> HireMind </span>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white shrink-0">
        <button 
          onClick={() => setActiveTab('job')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'job' ? 'border-google-blue text-google-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Job
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-google-blue text-google-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-google-blue text-google-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <UserCircle className="w-4 h-4" />
            Profile
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-google-blue text-google-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="mx-auto w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-google-blue" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Open Your Command Center</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Click below to open your personal application tracking dashboard in a new browser tab.
              </p>
              <button
                onClick={() => {
                  let url = 'http://localhost:3000/';
                  if (latestJobData) {
                    // 把剛生成的資料轉成 Base64，塞進 URL Hash 裡直接帶去網頁！
                    const encoded = btoa(encodeURIComponent(JSON.stringify(latestJobData)));
                    url += `#syncJob=${encoded}`;
                  } else {
                    alert("⚠️ Please wait for the AI to finish generating the resume before opening the Dashboard!");
                    return;
                  }
                  window.open(url, '_blank');
                }}
                className="bg-google-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 w-full max-w-xs mx-auto shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open Dashboard
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Backend Connection</h3>
              <p className="text-xs text-gray-500 mb-4">
                Successfully connected to Google Cloud Run Agent Backend.
                <br/><br/>
                <span className="font-mono bg-gray-100 p-1 rounded text-google-blue break-all">career-agent-backend-63451007809.us-central1.run.app</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Firebase Debug Info</h3>
              <p className="text-xs text-gray-500 mb-3">
                Please copy this URL and add it to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 break-all text-xs font-mono text-gray-700 select-all">
                {typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id 
                  ? `chrome-extension://${chrome.runtime.id}` 
                  : 'Not running as Chrome Extension'}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && profile && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <input 
                type="text" 
                value={profile.fullName} 
                onChange={e => setProfile({...profile, fullName: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input 
                  type="tel" 
                  value={profile.phone} 
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <input 
                  type="text" 
                  value={profile.location} 
                  onChange={e => setProfile({...profile, location: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  value={profile.linkedin} 
                  onChange={e => setProfile({...profile, linkedin: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Portfolio / GitHub</label>
                <input 
                  type="url" 
                  value={profile.portfolio} 
                  onChange={e => setProfile({...profile, portfolio: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Professional Summary</label>
              <textarea 
                value={profile.summary} 
                onChange={e => setProfile({...profile, summary: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Experience</label>
              <textarea 
                value={profile.experience} 
                onChange={e => setProfile({...profile, experience: e.target.value})}
                rows={5}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skills (comma separated)</label>
              <input 
                type="text" 
                value={profile.skills} 
                onChange={e => setProfile({...profile, skills: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
              />
            </div>
            <button 
              onClick={saveProfile}
              disabled={saving || saveSuccess}
              className={`w-full py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-4 ${saveSuccess ? 'bg-google-green' : 'bg-google-blue hover:bg-blue-600'}`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saveSuccess ? 'Profile Saved!' : 'Save Profile'}
            </button>
          </div>
        )}

        {activeTab === 'job' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Step 1: Extract */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-google-blue/10 text-google-blue flex items-center justify-center text-xs font-bold">1</span>
                  Job Description
                </h3>
                <button 
                  onClick={extractJD}
                  className="text-xs font-medium text-google-blue hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  Extract from Page
                </button>
              </div>
              
              {jdText ? (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm font-medium text-gray-800 mb-1 truncate">{jdTitle}</p>
                  <p className="text-xs text-gray-500 line-clamp-3">{jdText}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No job description extracted yet.</p>
                </div>
              )}
            </div>

            {/* Step 2: Generate */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-google-red/10 text-google-red flex items-center justify-center text-xs font-bold">2</span>
                  Tailored Resume
                </h3>
                <div className="flex items-center gap-2">
                  {generatedResume && (
                    <button 
                      onClick={handleDownloadPDF}
                      className="text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border border-gray-200"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  )}
                  <button 
                    onClick={generateResume}
                    disabled={!jdText || generating}
                    className="text-xs font-medium text-white bg-google-red hover:bg-red-600 disabled:bg-gray-300 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate
                  </button>
                </div>
              </div>

              {/* Agent Tools Configuration */}
              {!generatedResume && (
                <div className="mb-4 bg-gray-50/80 p-3 rounded-lg border border-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Agent Tools Configuration</span>
                  </div>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between cursor-pointer ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-xs text-gray-700 font-medium">Check Visa Sponsorship</span>
                      <input type="checkbox" checked={toolsConfig.checkSponsorship} onChange={e => setToolsConfig({...toolsConfig, checkSponsorship: e.target.checked})} className="rounded text-google-blue focus:ring-google-blue w-3.5 h-3.5" />
                    </label>
                    <label className={`flex items-center justify-between cursor-pointer ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-xs text-gray-700 font-medium">Predict ATS & Interview Odds</span>
                      <input type="checkbox" checked={toolsConfig.predictMetrics} onChange={e => setToolsConfig({...toolsConfig, predictMetrics: e.target.checked})} className="rounded text-google-blue focus:ring-google-blue w-3.5 h-3.5" />
                    </label>
                    <label className={`flex items-center justify-between cursor-pointer ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-xs text-gray-700 font-medium">Research Company News</span>
                      <input type="checkbox" checked={toolsConfig.researchNews} onChange={e => setToolsConfig({...toolsConfig, researchNews: e.target.checked})} className="rounded text-google-blue focus:ring-google-blue w-3.5 h-3.5" />
                    </label>
                    <label className={`flex items-center justify-between cursor-pointer ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-xs text-gray-700 font-medium">Log Strategy to Database</span>
                      <input type="checkbox" checked={toolsConfig.logStrategy} onChange={e => setToolsConfig({...toolsConfig, logStrategy: e.target.checked})} className="rounded text-google-blue focus:ring-google-blue w-3.5 h-3.5" />
                    </label>
                  </div>
                </div>
              )}

            {/* Display Agent Thinking Process */}
            {thoughts.length > 0 && (
              <div className="bg-gray-900 rounded-lg mb-4 flex flex-col overflow-hidden border border-gray-700 shadow-sm">
                {/* Terminal Header */}
                <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between shrink-0 transition-colors duration-300">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${generating ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                    <h3 className={`font-semibold text-[10px] uppercase tracking-widest ${generating ? 'text-gray-100' : 'text-gray-400'}`}>
                      {generating ? 'Agent Thinking Process' : 'Execution Log (Completed)'}
                    </h3>
                  </div>
                </div>
                {/* Terminal Body */}
                <div className={`p-3 font-mono text-xs h-32 overflow-y-auto space-y-1.5 shadow-inner transition-colors duration-500 ${generating ? 'text-green-400' : 'text-gray-400'}`}>
                  {thoughts.map((t, i) => (
                    <div key={i} className="whitespace-pre-wrap">{`> ${t}`}</div>
                  ))}
                  <div ref={thoughtsEndRef} />
                </div>
              </div>
            )}

              {sponsorshipIssue && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-900 mb-1">Visa Sponsorship Not Available</h4>
                      <p className="text-xs text-red-700 leading-relaxed mb-2">
                        The AI detected that this role does not offer visa sponsorship. We recommend saving your time and not applying to this position.
                      </p>
                      <div className="bg-red-100/50 p-2.5 rounded border border-red-200 text-[11px] font-mono text-red-800 italic">
                        "{sponsorshipIssue}"
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {generatedResume ? (
                <>
                  {metrics && (
                    <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in zoom-in duration-500">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-2 text-gray-500">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Before</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-gray-700">{metrics.originalMatch}%</div>
                            <div className="text-[10px] text-gray-500 leading-tight">Keyword<br/>Match</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-700">{metrics.originalProb}%</div>
                            <div className="text-[10px] text-gray-500 leading-tight">Interview<br/>Prob</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1.5 mb-2 text-google-blue">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">After Optimized</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-google-blue">{metrics.newMatch}%</div>
                            <div className="text-[10px] text-blue-600/80 leading-tight">Keyword<br/>Match</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-google-blue">{metrics.newProb}%</div>
                            <div className="text-[10px] text-blue-600/80 leading-tight">Interview<br/>Prob</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 bg-gray-100/80 p-2.5 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Preview</span>
                    </div>
                    <div className="rounded border border-gray-300 shadow-sm overflow-hidden">
                      <ResumePreview text={generatedResume} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Step 3: Autofill */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-google-green/10 text-google-green flex items-center justify-center text-xs font-bold">3</span>
                Apply & Follow-up
              </h3>

              <div className="space-y-3">
                {/* Action 1: Autofill */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Application Form</span>
                    <span className="text-[10px] text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-full">Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => autofillForm(false)}
                      disabled={!generatedResume && !profile?.fullName}
                      className={`flex-1 text-xs font-medium text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm ${autofillSuccess ? 'bg-google-green' : 'bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300'}`}
                    >
                      {autofillSuccess ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Filled Successfully</>
                      ) : (
                        'Autofill Application'
                      )}
                    </button>
                    <button 
                      onClick={forceReloadAndFill}
                      disabled={!generatedResume && !profile?.fullName}
                      className="text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-md transition-colors shadow-sm whitespace-nowrap"
                      title="Reloads the page and tries to force fill"
                    >
                      Force Fill
                    </button>
                  </div>
                </div>

                {/* Action 2: Email */}
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-blue-900 block mb-0.5">Cold Email</span>
                    <span className="text-[10px] text-blue-700/70 block leading-tight">Stand out to the recruiter<br/>with a personalized message</span>
                  </div>
                  <button 
                    onClick={handleSendEmail}
                    disabled={!generatedEmail}
                    className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
