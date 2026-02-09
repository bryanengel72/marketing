import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Building2,
  Target,
  Users,
  Briefcase,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  Download,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

import { submit, useTemplateVariables, CampaignData } from './bridge';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { TextArea } from './components/ui/TextArea';
import { ChipGroup } from './components/ui/ChipGroup';
import { StrategyView } from './components/StrategyView';

// Options Constants
const BUSINESS_MODELS = ['B2B', 'B2C', 'D2C', 'Marketplace', 'Agency'];
const OFFER_TYPES = ['Product', 'Service', 'Lead Magnet', 'Webinar', 'Consultation', 'SaaS Trial'];
const OBJECTIVES = ['Leads', 'Sales', 'Bookings', 'Brand Awareness', 'App Installs', 'Traffic'];
const CHANNELS = ['Paid Social', 'Email Marketing', 'Search Ads', 'SEO/Content', 'Organic Social', 'Influencer', 'Display Ads'];
const TIMEFRAMES = ['14 days', '30 days', '60 days', '90 days', 'Ongoing'];
const BRAND_TONES = ['Professional', 'Conversational', 'Authority', 'Playful', 'Urgent', 'Educational'];

// Steps Definition
const STEPS = [
  { id: 1, title: 'Business Profile', icon: Building2, subtitle: "Company Context" },
  { id: 2, title: 'Value Proposition', icon: Briefcase, subtitle: "Offer Details" },
  { id: 3, title: 'Target Market', icon: Users, subtitle: "Audience Analysis" },
  { id: 4, title: 'Execution Strategy', icon: Target, subtitle: "Campaign Logistics" },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState<CampaignData>({
    business_industry: '',
    business_model: '',
    offer_type: '',
    offer_description: '',
    offer_price: '',
    objective: '',
    audience_persona: '',
    audience_geo: '',
    monthly_budget: '',
    channels: [],
    timeframe: '',
    brand_tone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Load initial variables
  useEffect(() => {
    const initialVariables = useTemplateVariables();
    if (initialVariables) {
      setFormData(prev => ({
        ...prev,
        ...initialVariables
      }));
    }
  }, []);

  const handleChange = (field: keyof CampaignData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.business_industry && !!formData.business_model;
      case 2:
        return !!formData.offer_type && !!formData.offer_description;
      case 3:
        return !!formData.audience_persona && !!formData.audience_geo;
      case 4:
        return !!formData.objective;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert("Please complete the required fields to proceed.");
      return;
    }
    setDirection('next');
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setDirection('prev');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      alert("Please complete all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await submit(formData);
      setSubmissionResult(result);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Submission failed:", error);
      alert("An error occurred during submission. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmissionResult(null);
    setCurrentStep(1);

    // Reset form data to defaults or empty
    const initialVariables = useTemplateVariables();
    setFormData({
      business_industry: '',
      business_model: '',
      offer_type: '',
      offer_description: '',
      offer_price: '',
      objective: '',
      audience_persona: '',
      audience_geo: '',
      monthly_budget: '',
      channels: [],
      timeframe: '',
      brand_tone: '',
      ...(initialVariables || {})
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    // Directly clear the form without confirmation dialog to prevent blocking issues
    setFormData({
      business_industry: '',
      business_model: '',
      offer_type: '',
      offer_description: '',
      offer_price: '',
      objective: '',
      audience_persona: '',
      audience_geo: '',
      monthly_budget: '',
      channels: [],
      timeframe: '',
      brand_tone: '',
    });
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Robust logic to parse the API response
  const parsedResponse = useMemo(() => {
    if (!isSuccess || !submissionResult) return null;

    // Helper: safely parse JSON from string or return object if already object
    const parseJSON = (str: any) => {
      if (typeof str === 'object' && str !== null) return str;
      if (typeof str !== 'string') return null;
      try {
        // Handle markdown code blocks
        const clean = str.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
        return JSON.parse(clean);
      } catch (e) {
        // Try finding JSON block embedded in text (fallback for conversational wrappers)
        try {
          const firstOpen = str.indexOf('{');
          const lastClose = str.lastIndexOf('}');
          if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = str.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonStr);
          }
        } catch { }
        return null;
      }
    };

    // Duck typing helper to identify a valid strategy object
    const isStrategyObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return false;
      const keys = Object.keys(obj);
      // Valid strategy should have at least one of these core keys
      return (
        keys.includes('overview') ||
        keys.includes('funnel') ||
        keys.includes('kpis') ||
        keys.includes('channel_strategy') ||
        keys.includes('timeline') ||
        keys.includes('campaign_strategy') // wrapper key
      );
    };

    // --- Search Logic ---
    let strategy: any = null;
    let textContent = '';

    // 1. Gather all potential candidates (objects or strings) from the result structure
    const candidates: any[] = [
      submissionResult,
      submissionResult.result,
      submissionResult.output,
      submissionResult.variables,
      submissionResult.thread?.variables
    ];

    // Add posts content to candidates
    const posts = submissionResult.posts || submissionResult.thread?.posts;
    if (Array.isArray(posts)) {
      posts.forEach(post => {
        if (post.content) candidates.push(post.content);
      });
    }

    // 2. Iterate candidates to find the strategy
    for (const candidate of candidates) {
      if (!candidate) continue;

      // If candidate is already an object, check if it IS the strategy
      if (typeof candidate === 'object') {
        if (isStrategyObject(candidate)) {
          // If it's wrapped in 'campaign_strategy', unwrap it
          if (candidate.campaign_strategy) {
            strategy = {
              campaign_strategy: typeof candidate.campaign_strategy === 'string'
                ? parseJSON(candidate.campaign_strategy)
                : candidate.campaign_strategy,
              validate_strategy: typeof candidate.validate_strategy === 'string'
                ? parseJSON(candidate.validate_strategy)
                : candidate.validate_strategy
            };
          } else {
            // It is the strategy object itself
            strategy = { campaign_strategy: candidate };
          }
          if (strategy.campaign_strategy && isStrategyObject(strategy.campaign_strategy)) break;
        }
      }

      // If candidate is a string, try to parse it
      if (typeof candidate === 'string') {
        // Keep longest string as fallback text
        if (candidate.length > textContent.length) textContent = candidate;

        const parsed = parseJSON(candidate);
        if (parsed && isStrategyObject(parsed)) {
          if (parsed.campaign_strategy) {
            strategy = parsed;
          } else {
            strategy = { campaign_strategy: parsed };
          }
          break;
        }
      }
    }

    // 3. Fallback text handling
    // If we didn't find a structured strategy, ensure we have some text to show.
    if (!strategy && !textContent) {
      textContent = typeof submissionResult === 'string'
        ? submissionResult
        : JSON.stringify(submissionResult, null, 2);
    }

    return {
      structured: strategy,
      text: textContent
    };

  }, [submissionResult, isSuccess]);

  // Render Strategy Report View
  if (isSuccess && parsedResponse) {
    // If we have structured data, use the StrategyView component
    if (parsedResponse.structured && parsedResponse.structured.campaign_strategy) {
      return <StrategyView data={parsedResponse.structured} onReset={handleReset} />;
    }

    // Otherwise, fall back to the Markdown text view
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <div className="bg-corporate-900 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-corporate-900 flex items-center justify-center font-serif font-bold text-lg rounded-sm">V</div>
            <span className="font-serif font-bold text-lg tracking-wide hidden md:inline">VECTOR STRATEGY ENGINE</span>
            <span className="font-serif font-bold text-lg tracking-wide md:hidden">VECTOR</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs md:text-sm bg-corporate-800 hover:bg-corporate-700 px-4 py-2 rounded-sm transition-colors border border-corporate-700"
          >
            <RefreshCw size={14} />
            <span>New Campaign</span>
          </button>
        </div>

        <main className="max-w-5xl mx-auto p-4 md:p-12 lg:p-16">
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center gap-2 text-action-600 mb-2 font-bold uppercase tracking-wider text-xs">
              <CheckCircle2 size={16} />
              <span>Strategy Generated Successfully</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-corporate-900 mb-4">
              Your Marketing Strategy
            </h1>
            <p className="text-slate-600 max-w-2xl text-lg">
              Based on your inputs for <span className="font-semibold text-corporate-900">{formData.business_industry}</span> targeting <span className="font-semibold text-corporate-900">{formData.objective}</span>.
            </p>
          </div>

          <div className="bg-white p-8 md:p-16 shadow-paper rounded-sm border border-slate-200 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="bg-blue-50 p-4 border border-blue-100 rounded mb-6 text-sm text-blue-800">
              <span className="font-bold">Display Note:</span> We received a response but couldn't auto-format the strategy. Displaying raw output below.
            </div>
            <article className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-corporate-900 prose-a:text-action-600 prose-strong:text-corporate-800 break-words">
              <ReactMarkdown>
                {parsedResponse.text}
              </ReactMarkdown>
            </article>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
              <p className="text-slate-400 text-sm italic">Generated by MindStudio AI Agent</p>
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-corporate-900 rounded-sm font-medium transition-colors"
                >
                  <Download size={18} />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-corporate-900 hover:bg-corporate-800 text-white rounded-sm font-medium transition-colors"
                >
                  <RefreshCw size={18} />
                  <span>Refine Inputs</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-x-hidden">

      {/* Mobile Header */}
      <div className="md:hidden bg-corporate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-corporate-900 flex items-center justify-center font-serif font-bold text-lg rounded-sm">V</div>
          <span className="font-serif font-bold text-lg tracking-wide">VECTOR</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-white p-1 hover:bg-corporate-800 rounded transition-colors active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Navigation Sidebar */}
      <div className={`
        fixed inset-0 z-40 bg-corporate-900 text-white w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:min-h-screen
      `}>
        {/* Mobile Close Button Area */}
        <div className="md:hidden p-4 flex justify-between items-center border-b border-corporate-800">
          <div className="flex items-center gap-2 opacity-50">
            <span className="font-serif font-bold text-lg tracking-wide">MENU</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white p-2 hover:bg-corporate-800 rounded-full transition-colors active:bg-corporate-700"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-12 flex-1 flex flex-col overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white text-corporate-900 flex items-center justify-center font-serif font-bold text-xl rounded-sm">V</div>
            <h1 className="font-serif font-bold text-2xl tracking-widest">VECTOR</h1>
          </div>

          <div className="space-y-0">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="sidebar-step">
                  <div className={`
                    relative z-10 flex items-start gap-4 p-4 transition-all duration-300
                    ${isActive ? 'bg-corporate-800/30' : 'hover:bg-corporate-800/10'}
                  `}>
                    <div className={`
                      sidebar-step-marker flex-shrink-0 mt-1
                      ${isActive ? 'active' : isCompleted ? 'completed' : 'bg-corporate-700'}
                    `}></div>
                    <div className="pt-0">
                      <p className={`sidebar-step-title text-xs font-medium uppercase tracking-wider mb-1 transition-colors ${isActive ? 'text-white' : 'text-corporate-400'}`}>
                        {step.subtitle}
                      </p>
                      <h3 className={`font-serif font-normal text-base leading-tight transition-colors ${isActive ? 'text-white font-medium' : 'text-corporate-300'}`}>
                        {step.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-8 md:pt-12">
            <div className="executive-note">
              <h4 className="executive-note-title mb-2">Strategic Advisory</h4>
              <p className="executive-note-content text-xs md:text-sm">
                Our AI model analyzes 50+ strategic variables to generate your plan. Ensure all inputs are accurate for optimal results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Form */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto h-screen w-full">
        <main className="flex-1 p-4 md:p-12 lg:p-16 w-full max-w-4xl mx-auto">

          <div key={`header-${currentStep}`} className="mb-6 md:mb-10 pb-4 md:pb-6 border-b border-slate-200 animate-fadeIn flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-corporate-900 mb-2">
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-action-600">Phase {currentStep}</span>
                <div className="h-px w-6 md:w-8 bg-slate-300"></div>
              </div>
              <h2 className="text-2xl md:text-3xl md:text-4xl font-serif font-bold text-corporate-900">
                {STEPS[currentStep - 1].title}
              </h2>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors px-3 py-2 rounded-sm hover:bg-red-50 text-xs font-bold uppercase tracking-wider"
              title="Clear all fields and restart"
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">Reset Form</span>
            </button>
          </div>

          <div className="bg-white p-5 md:p-12 shadow-paper rounded-sm border border-slate-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
            <div
              key={currentStep}
              className={`space-y-8 md:space-y-10 ${direction === 'next' ? 'animate-slideInRight' : 'animate-slideInLeft'}`}
            >
              {currentStep === 1 && (
                <div className="space-y-8 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="md:col-span-2">
                      <Input
                        label="Industry / Sector"
                        placeholder="e.g. Enterprise SaaS, Financial Services"
                        value={formData.business_industry}
                        onChange={(e) => handleChange('business_industry', e.target.value)}
                        autoFocus
                      />
                    </div>
                    <Select
                      label="Business Model"
                      options={BUSINESS_MODELS}
                      value={formData.business_model}
                      onChange={(e) => handleChange('business_model', e.target.value)}
                    />
                    <div className="executive-note">
                      <h4 className="executive-note-title mb-2">Executive Note</h4>
                      <p className="executive-note-content text-xs md:text-sm">
                        Defining your model accurately helps the AI select appropriate channel mixes. For 'Agency', the strategy will focus on client acquisition.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <Select
                      label="Offer Type"
                      options={OFFER_TYPES}
                      value={formData.offer_type}
                      onChange={(e) => handleChange('offer_type', e.target.value)}
                      autoFocus
                    />
                    <Input
                      label="Price Point"
                      placeholder="e.g. $5,000 / month retainer"
                      value={formData.offer_price}
                      onChange={(e) => handleChange('offer_price', e.target.value)}
                    />
                  </div>
                  <TextArea
                    label="Value Proposition"
                    placeholder="Detail the core deliverables and unique selling points..."
                    value={formData.offer_description}
                    onChange={(e) => handleChange('offer_description', e.target.value)}
                    rows={6}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8 md:space-y-10">
                  <TextArea
                    label="Audience Persona"
                    placeholder="Describe the decision maker: Role, challenges, and objectives..."
                    value={formData.audience_persona}
                    onChange={(e) => handleChange('audience_persona', e.target.value)}
                    rows={6}
                    autoFocus
                  />
                  <Input
                    label="Target Geography"
                    placeholder="e.g. North America, EMEA"
                    value={formData.audience_geo}
                    onChange={(e) => handleChange('audience_geo', e.target.value)}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <Select
                      label="Primary Objective"
                      options={OBJECTIVES}
                      value={formData.objective}
                      onChange={(e) => handleChange('objective', e.target.value)}
                      autoFocus
                    />
                    <Input
                      label="Monthly Budget"
                      placeholder="e.g. $10,000"
                      value={formData.monthly_budget}
                      onChange={(e) => handleChange('monthly_budget', e.target.value)}
                    />
                    <Select
                      label="Timeline"
                      options={TIMEFRAMES}
                      value={formData.timeframe}
                      onChange={(e) => handleChange('timeframe', e.target.value)}
                    />
                    <Select
                      label="Brand Tone"
                      options={BRAND_TONES}
                      value={formData.brand_tone}
                      onChange={(e) => handleChange('brand_tone', e.target.value)}
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <ChipGroup
                      label="Preferred Channels (Select max 3)"
                      options={CHANNELS}
                      selected={formData.channels}
                      onChange={(newChannels) => handleChange('channels', newChannels)}
                      maxSelection={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 md:mt-8 flex justify-between items-center gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-xs md:text-sm transition-colors uppercase tracking-wider rounded-sm
                ${currentStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-corporate-900 hover:text-action-600 hover:bg-slate-100'
                }
              `}
            >
              <ArrowLeft size={16} />
              <span className="hidden md:inline">Previous Phase</span>
              <span className="md:hidden">Back</span>
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex-1 md:flex-none bg-corporate-900 text-white font-medium py-3 px-6 md:px-8 rounded-sm hover:bg-corporate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 uppercase tracking-wide text-xs md:text-sm active:transform active:translate-y-0.5"
              >
                <span className="hidden md:inline">Next Phase</span>
                <span className="md:hidden">Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 md:flex-none bg-action-600 text-white font-medium py-3 px-6 md:px-8 rounded-sm hover:bg-action-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100 uppercase tracking-wide text-xs md:text-sm disabled:opacity-70 disabled:cursor-not-allowed active:transform active:translate-y-0.5"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                <span className="hidden md:inline">Generate Strategy</span>
                <span className="md:hidden">Submit</span>
                {!isLoading && <ArrowRight size={16} />}
              </button>
            )}
          </div>
        </main>
      </div>

      <style>{`
        /* McKinsey-Style Typography */
        .uppercase {
          letter-spacing: 0.15em;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: #000000;
          font-weight: 600;
        }
        
        p, li, span {
          line-height: 1.7;
          font-weight: 300;
        }
        
        /* Enhanced Spacing */
        .space-y-6 > * + * {
          margin-top: 2.5rem;
        }
        
        .space-y-10 > * + * {
          margin-top: 3rem;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95);
            filter: blur(4px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(40px) rotateY(-10deg);
            filter: blur(2px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0) rotateY(0);
            filter: blur(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInLeft {
          from { 
            opacity: 0; 
            transform: translateX(-40px) rotateY(10deg);
            filter: blur(2px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0) rotateY(0);
            filter: blur(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.7) rotate(-2deg);
          }
          to { 
            opacity: 1; 
            transform: scale(1) rotate(0);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* McKinsey-Style Button Effects */
        button, .button {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          border-radius: 2px !important;
        }

        button:hover:not(:disabled), .button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15);
        }

        button:active:not(:disabled), .button:active {
          transform: translateY(0);
          transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* McKinsey-Style Input Focus */
        input, textarea, select {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-width: 1px !important;
          border-radius: 0px !important;
        }

        input:focus, textarea:focus, select:focus {
          border-bottom-width: 2px !important;
          border-bottom-color: #2563eb !important;
          box-shadow: none !important;
          outline: none !important;
        }

        /* Refined Card Effects */
        .bg-white, .bg-corporate-800 {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0px !important;
        }

        .shadow-paper {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .shadow-paper:hover {
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        /* Minimal Sidebar Step Design */
        .sidebar-step {
          position: relative;
        }

        .sidebar-step::before {
          content: '';
          position: absolute;
          left: 16px;
          top: 32px;
          bottom: -32px;
          width: 1px;
          background: rgba(148, 163, 184, 0.3);
        }

        .sidebar-step:last-child::before {
          display: none;
        }

        .sidebar-step-marker {
          width: 8px;
          height: 8px;
          border-radius: 0px;
          transition: all 0.3s ease;
        }

        .sidebar-step-marker.active {
          background: #2563eb;
          width: 12px;
          height: 12px;
        }

        .sidebar-step-marker.completed {
          background: #2563eb;
          border: 2px solid #2563eb;
        }

        /* Subtle hover underline */
        .sidebar-step:hover .sidebar-step-title {
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
        }

        /* Loading spinner enhancement */
        @keyframes spinEnhanced {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          to { transform: rotate(360deg) scale(1); }
        }

        .animate-spin {
          animation: spinEnhanced 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Smooth page transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        /* Ripple effect on click */
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        /* Executive Note / Tip Box Styling */
        .executive-note {
          background: white;
          border-left: 3px solid #2563eb;
          border-radius: 0px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        
        .executive-note-title {
          font-weight: 500;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1e40af;
        }
        
        .executive-note-content {
          font-weight: 300;
          line-height: 1.7;
          color: #475569;
        }
      `}</style>
    </div>
  );
}

export default App;