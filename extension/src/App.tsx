import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { Briefcase, FileText, UserCircle, LogOut, Sparkles, CheckCircle2, AlertCircle, Loader2, Settings } from 'lucide-react';

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  updatedAt: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'job' | 'settings'>('job');
  
  // Settings state
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [saveKeySuccess, setSaveKeySuccess] = useState(false);

  // Job state
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [generating, setGenerating] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState(false);

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
      alert(`登入失敗！請確保您已將 Chrome Extension ID 加入 Firebase 的 Authorized domains 中。\n錯誤訊息: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSaveKeySuccess(true);
    setTimeout(() => setSaveKeySuccess(false), 3000);
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const updatedProfile = { ...profile, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile.');
    }
    setSaving(false);
  };

  const extractJD = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'extractJD' }, (response) => {
        if (response) {
          setJdTitle(response.title || 'Extracted Job');
          setJdText(response.text || '');
        }
      });
    } else {
      setJdTitle('Senior Frontend Engineer');
      setJdText('We are looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and Tailwind CSS. You will build scalable web applications and optimize performance. Experience with Chrome Extensions is a plus.');
    }
  };

  const generateResume = async () => {
    if (!profile || !jdText) return;
    
    // 優先使用環境變數，若無則使用 localStorage 儲存的 key
    const currentApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'undefined' 
      ? process.env.GEMINI_API_KEY 
      : apiKey;

    if (!currentApiKey) {
      alert("請先在 Settings 分頁設定您的 Gemini API Key！");
      setActiveTab('settings');
      return;
    }

    setGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: currentApiKey });
      const prompt = `
        You are an expert ATS resume writer. 
        I have the following job description:
        Title: ${jdTitle}
        Description: ${jdText}

        Here is my basic profile data:
        Name: ${profile.fullName}
        Summary: ${profile.summary}
        Experience: ${profile.experience}
        Education: ${profile.education}
        Skills: ${profile.skills}

        Please generate a highly tailored, ATS-optimized resume summary and bullet points for my experience that specifically highlight keywords and requirements from the job description. Do not invent fake experience, but rephrase my existing experience to match the JD perfectly.
        Return the result in clear Markdown format.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setGeneratedResume(response.text || '');
    } catch (error) {
      console.error("Generation failed:", error);
      alert("生成履歷失敗，請檢查您的 API Key 是否正確。");
    }
    setGenerating(false);
  };

  const autofillForm = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ 
        action: 'autofill', 
        data: {
          fullName: profile?.fullName,
          email: profile?.email,
          phone: profile?.phone,
          resumeText: generatedResume
        }
      }, (response) => {
        if (response && response.success) {
          setAutofillSuccess(true);
          setTimeout(() => setAutofillSuccess(false), 3000);
        }
      });
    } else {
      setAutofillSuccess(true);
      setTimeout(() => setAutofillSuccess(false), 3000);
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ATS Resume Assistant</h1>
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
          <span className="font-semibold text-gray-800">Resume Assistant</span>
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
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">API Configuration</h3>
              <p className="text-xs text-gray-500 mb-4">
                Enter your Gemini API Key to generate resumes. This key is stored locally in your browser.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Gemini API Key</label>
                  <input 
                    type="password" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-google-blue/20 focus:border-google-blue transition-all"
                  />
                </div>
                <button 
                  onClick={saveApiKey}
                  className="w-full py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  {saveKeySuccess ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : null}
                  {saveKeySuccess ? 'Saved!' : 'Save API Key'}
                </button>
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
              disabled={saving}
              className="w-full py-2.5 bg-google-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Profile
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
                <button 
                  onClick={generateResume}
                  disabled={!jdText || generating}
                  className="text-xs font-medium text-white bg-google-red hover:bg-red-600 disabled:bg-gray-300 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                >
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate
                </button>
              </div>

              {generatedResume ? (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 max-h-48 overflow-y-auto text-xs text-gray-700 whitespace-pre-wrap">
                  {generatedResume}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <FileText className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click generate to create an ATS-optimized resume.</p>
                </div>
              )}
            </div>

            {/* Step 3: Autofill */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-google-green/10 text-google-green flex items-center justify-center text-xs font-bold">3</span>
                  Apply
                </h3>
                <button 
                  onClick={autofillForm}
                  disabled={!generatedResume && !profile?.fullName}
                  className={`text-xs font-medium text-white px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${autofillSuccess ? 'bg-google-green' : 'bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300'}`}
                >
                  {autofillSuccess ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Filled!</>
                  ) : (
                    'Autofill Application'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
