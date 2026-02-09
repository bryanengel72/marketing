import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  Megaphone,
  Share2,
  Search,
  Mail,
  Layout,
  Download,
  RefreshCw,
  Printer,
  AlertCircle,
  Target,
  BarChart3,
  Users
} from 'lucide-react';

interface StrategyViewProps {
  data: any;
  onReset: () => void;
}

const ChannelIcon = ({ channel }: { channel: string }) => {
  const normalized = channel.toLowerCase();
  if (normalized.includes('social')) return <Share2 size={20} />;
  if (normalized.includes('search') || normalized.includes('seo')) return <Search size={20} />;
  if (normalized.includes('email')) return <Mail size={20} />;
  if (normalized.includes('influencer')) return <Megaphone size={20} />;
  if (normalized.includes('content')) return <Layout size={20} />;
  return <Target size={20} />;
};

export const StrategyView: React.FC<StrategyViewProps> = ({ data, onReset }) => {
  const { campaign_strategy, validate_strategy } = data;

  // robustly parse risks from various formats
  const parsedRisks = useMemo(() => {
    if (!campaign_strategy.risks) return [];

    // 1. If it's already an array
    if (Array.isArray(campaign_strategy.risks)) return campaign_strategy.risks;

    const risksObj = campaign_strategy.risks;
    const keys = Object.keys(risksObj);

    // 2. Check for indexed structure (risk_1, mitigation_1, etc.)
    const riskKeys = keys.filter(k => k.startsWith('risk_'));
    if (riskKeys.length > 0) {
      const risks: any[] = [];
      riskKeys.forEach(rKey => {
        // extract index (e.g. "1" from "risk_1")
        const match = rKey.match(/risk_(\d+)/);
        const index = match ? match[1] : null;
        if (index) {
          const val = risksObj[rKey];
          // Handle case where risk_1 is an object { description, mitigation }
          if (typeof val === 'object' && val !== null) {
            risks.push({
              description: val.description || val.text || JSON.stringify(val),
              mitigation: val.mitigation || risksObj[`mitigation_${index}`] || ''
            });
          } else {
            // Handle case where risk_1 is a string description
            risks.push({
              description: val,
              mitigation: risksObj[`mitigation_${index}`] || 'See general strategy.'
            });
          }
        }
      });
      return risks;
    }

    // 3. Fallback: treat values as objects or strings
    return Object.values(risksObj).map((val: any) => {
      if (typeof val === 'string') return { description: val, mitigation: '' };
      return val;
    });
  }, [campaign_strategy.risks]);

  // Helper to safely render content
  const renderContent = (content: any) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return content;
    if (typeof content === 'object' && content !== null) {
      // Try to find a meaningful string property
      return content.description || content.text || content.name || JSON.stringify(content);
    }
    return '';
  };

  // Helper to ensure we have an array
  const ensureArray = (item: any): any[] => {
    if (!item) return [];
    if (Array.isArray(item)) return item;
    if (typeof item === 'string') {
      // Check if it's a period-separated list (sentences)
      if (item.includes('. ')) {
        return item.split('. ')
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(s => s.endsWith('.') ? s : s + '.');
      }
      // Check if it's a comma-separated list
      if (item.includes(',')) {
        return item.split(',').map(s => s.trim());
      }
      return [item];
    }
    // If it's an object, wrap it in array
    return [item];
  };

  if (!campaign_strategy) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 print:bg-white print:pb-0">

      {/* Global Animation and Print Styles for this view */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; /* start hidden */
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        @keyframes drawLine {
          from { height: 0; }
          to { height: 100%; }
        }
        .animate-drawLine {
          animation: drawLine 1s cubic-bezier(0.45, 0, 0.55, 1) forwards;
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite;
        }

        @media print {
          @page { margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          
          /* Override animation opacity for print to ensure visibility */
          .animate-fadeIn, .animate-slideInRight, .animate-drawLine {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
            height: 100% !important; /* Force lines to full height */
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-corporate-900 text-white p-4 sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-corporate-900 flex items-center justify-center font-serif font-bold text-lg rounded-sm">V</div>
            <span className="font-serif font-bold text-lg tracking-wide hidden md:inline">VECTOR STRATEGY ENGINE</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="hidden md:flex items-center gap-2 text-xs bg-corporate-800 hover:bg-corporate-700 px-3 py-2 rounded-sm border border-corporate-700 transition-colors"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 text-xs bg-action-600 hover:bg-action-700 px-3 py-2 rounded-sm transition-colors text-white font-medium"
            >
              <RefreshCw size={14} />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 print:p-0 print:max-w-none">

        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-lg rounded-sm">V</div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Vector Strategy Engine</h1>
          </div>
          <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Marketing Campaign Strategy Report</p>
        </div>

        {/* Overview Section */}
        <section className="bg-white p-6 md:p-10 rounded-sm shadow-paper border border-slate-200 animate-fadeIn print:shadow-none print:border-none print:p-0">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-corporate-900 mb-6">Executive Summary</h1>
            <p className="text-lg text-slate-700 leading-relaxed mb-8">{renderContent(campaign_strategy.overview)}</p>

            <div className="bg-corporate-50 border-l-4 border-action-600 p-6 rounded-r-sm print:bg-slate-50 print:border-slate-900">
              <h3 className="text-xs font-bold text-corporate-500 uppercase tracking-wider mb-2">Core Messaging</h3>
              <p className="text-xl md:text-2xl font-serif text-corporate-900 italic">"{renderContent(campaign_strategy.core_message)}"</p>
            </div>
          </div>
        </section>

        {/* Validation Alert */}
        {validate_strategy && validate_strategy.issue_count > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 md:p-6 animate-fadeIn [animation-delay:100ms] print:border print:border-amber-200 print:bg-amber-50/50">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-amber-900 text-lg mb-1">Strategy Validation</h3>
                <p className="text-amber-800 text-sm mb-4">{renderContent(validate_strategy.summary)}</p>
                {validate_strategy.issues && (
                  <div className="space-y-3">
                    {validate_strategy.issues.map((issue: any, idx: number) => (
                      <div key={idx} className="bg-white/60 p-3 rounded-sm border border-amber-100 text-sm print:border-amber-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${issue.severity === 'blocking' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {issue.severity ? renderContent(issue.severity).replace('_', ' ') : 'Issue'}
                          </span>
                          <span className="font-bold text-slate-700 capitalize">{issue.type ? renderContent(issue.type).replace('_', ' ') : 'Optimization'}</span>
                        </div>
                        <p className="text-slate-600 mb-1"><span className="font-medium">Observation:</span> {renderContent(issue.evidence)}</p>
                        <p className="text-slate-800"><span className="font-medium text-action-700">Recommendation:</span> {renderContent(issue.recommendation)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Funnel & KPIs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Funnel Strategy with Enhanced Animation */}
          <section className="lg:col-span-2 bg-white p-6 rounded-sm shadow-paper border border-slate-200 print:shadow-none print:border print:border-slate-200 print:break-inside-avoid animate-fadeIn [animation-delay:200ms]">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <Layers className="text-action-600" size={20} />
              <h2 className="text-xl font-bold text-corporate-900">Funnel Strategy</h2>
            </div>

            <div className="relative pl-4 md:pl-0">
              {/* Animated Connecting Line */}
              <div className="absolute left-[27px] md:left-[35px] top-6 bottom-12 w-0.5 bg-slate-100 overflow-hidden">
                <div className="w-full bg-gradient-to-b from-action-600 to-corporate-900 h-full animate-drawLine origin-top"></div>
              </div>

              <div className="space-y-8">
                {/* Top Funnel */}
                <div className="relative flex gap-6 group animate-slideInRight [animation-delay:300ms]">
                  <div className="relative z-10 shrink-0 w-14 h-14 md:w-18 md:h-18 flex items-center justify-center rounded-full bg-white border-2 border-action-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Megaphone className="text-action-600" size={24} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">Awareness</span>
                      <h3 className="font-bold text-lg text-corporate-900">Top Funnel</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 relative group-hover:border-action-200 transition-colors">
                      <div className="absolute left-[-6px] top-6 w-3 h-3 bg-slate-50 border-t border-l border-slate-100 transform -rotate-45 group-hover:border-action-200 transition-colors"></div>
                      <p className="text-slate-700 leading-relaxed">{renderContent(campaign_strategy.funnel?.top_funnel)}</p>
                    </div>
                  </div>
                </div>

                {/* Middle Funnel */}
                <div className="relative flex gap-6 group animate-slideInRight [animation-delay:500ms]">
                  <div className="relative z-10 shrink-0 w-14 h-14 md:w-18 md:h-18 flex items-center justify-center rounded-full bg-white border-2 border-action-700 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Users className="text-action-700" size={24} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider">Consideration</span>
                      <h3 className="font-bold text-lg text-corporate-900">Middle Funnel</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 relative group-hover:border-action-200 transition-colors">
                      <div className="absolute left-[-6px] top-6 w-3 h-3 bg-slate-50 border-t border-l border-slate-100 transform -rotate-45 group-hover:border-action-200 transition-colors"></div>
                      <p className="text-slate-700 leading-relaxed">{renderContent(campaign_strategy.funnel?.middle_funnel)}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Funnel */}
                <div className="relative flex gap-6 group animate-slideInRight [animation-delay:700ms]">
                  <div className="relative z-10 shrink-0 w-14 h-14 md:w-18 md:h-18 flex items-center justify-center rounded-full bg-corporate-900 border-2 border-corporate-900 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="text-white" size={24} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider">Conversion</span>
                      <h3 className="font-bold text-lg text-corporate-900">Bottom Funnel</h3>
                    </div>
                    <div className="bg-corporate-50 p-4 rounded-sm border border-corporate-100 relative group-hover:border-corporate-200 transition-colors shadow-sm">
                      <div className="absolute left-[-6px] top-6 w-3 h-3 bg-corporate-50 border-t border-l border-corporate-100 transform -rotate-45 group-hover:border-corporate-200 transition-colors"></div>
                      <p className="text-corporate-900 font-medium leading-relaxed">{renderContent(campaign_strategy.funnel?.bottom_funnel)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* KPIs */}
          <section className="bg-white p-6 rounded-sm shadow-paper border border-slate-200 print:shadow-none print:border print:border-slate-200 print:break-inside-avoid animate-fadeIn [animation-delay:400ms]">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <BarChart3 className="text-action-600" size={20} />
              <h2 className="text-xl font-bold text-corporate-900">Key Metrics</h2>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={14} />
                  Leading Indicators
                </h3>
                <ul className="space-y-3">
                  {ensureArray(campaign_strategy.kpis?.leading_indicators).map((kpi: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 group hover:bg-slate-50 p-2 rounded transition-colors -mx-2">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-action-600 print:bg-slate-800 ring-2 ring-blue-100 group-hover:ring-action-300 transition-all"></div>
                      <span className="leading-relaxed">{renderContent(kpi)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target size={14} />
                  Lagging Indicators
                </h3>
                <ul className="space-y-3">
                  {ensureArray(campaign_strategy.kpis?.lagging_indicators).map((kpi: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-corporate-900 font-medium group hover:bg-slate-50 p-2 rounded transition-colors -mx-2">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-corporate-900 ring-2 ring-slate-200 group-hover:ring-corporate-300 transition-all"></div>
                      <span className="leading-relaxed">{renderContent(kpi)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Channel Strategy Grid */}
        {campaign_strategy.channel_strategy && (
          <section className="animate-fadeIn [animation-delay:600ms]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-corporate-900">Channel Strategy</h2>
              {campaign_strategy.budget_allocation && (
                <div className="hidden md:flex gap-4 print:flex">
                  {Object.entries(campaign_strategy.budget_allocation).map(([key, value]: any) => (
                    <div key={key} className="bg-white px-3 py-1.5 rounded-sm border border-slate-200 shadow-sm text-xs font-medium text-slate-600 capitalize print:shadow-none print:border-slate-300">
                      {key.replace('_', ' ')}: <span className="text-corporate-900 font-bold">{renderContent(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(campaign_strategy.channel_strategy).map(([channel, details]: any) => {
                // Normalize details: if it's a string, convert to object structure
                const strategyContent = typeof details === 'string'
                  ? { strategy: details, targeting: null, topics: null, kpis: null, budget: null }
                  : details;

                return (
                  <div key={channel} className="bg-white rounded-sm shadow-paper border border-slate-200 overflow-hidden flex flex-col print:shadow-none print:border print:border-slate-200 print:break-inside-avoid hover:shadow-lg transition-shadow duration-300 group">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center print:bg-slate-100 group-hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="text-corporate-600 bg-white p-1.5 rounded-sm border border-slate-200 shadow-sm group-hover:border-action-200 group-hover:text-action-600 transition-colors">
                          <ChannelIcon channel={channel} />
                        </div>
                        <h3 className="font-bold text-corporate-900 capitalize">{channel.replace('_', ' ')}</h3>
                      </div>
                      {strategyContent.budget && (
                        <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-sm border border-green-100 print:border-slate-300 print:text-slate-800">
                          {renderContent(strategyContent.budget).includes('$') ? renderContent(strategyContent.budget).split(' ')[0] : renderContent(strategyContent.budget)}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      {strategyContent.strategy && <p className="text-sm text-slate-600 mb-4 flex-1">{renderContent(strategyContent.strategy)}</p>}

                      {strategyContent.targeting && (
                        <div className="mb-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Targeting</h4>
                          <p className="text-xs text-slate-800 bg-slate-50 p-2 rounded-sm border border-slate-100 print:bg-white print:border-slate-200">{renderContent(strategyContent.targeting)}</p>
                        </div>
                      )}

                      {strategyContent.topics && (
                        <div className="mb-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Content Topics</h4>
                          <div className="flex flex-wrap gap-1">
                            {ensureArray(strategyContent.topics).slice(0, 3).map((t: any, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 print:bg-white">{renderContent(t)}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {strategyContent.kpis && (
                        <div className="mt-auto pt-4 border-t border-slate-50">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Success Metrics</h4>
                          <div className="text-xs text-slate-700 font-medium">
                            {ensureArray(strategyContent.kpis).map((k: any) => renderContent(k)).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Timeline */}
        {campaign_strategy.timeline && (
          <section className="bg-white p-6 md:p-10 rounded-sm shadow-paper border border-slate-200 animate-fadeIn [animation-delay:800ms] print:shadow-none print:border print:border-slate-200 print:break-inside-avoid">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <Calendar className="text-action-600" size={20} />
              <h2 className="text-xl font-bold text-corporate-900">Execution Timeline</h2>
            </div>
            <div className="space-y-8">
              {Object.entries(campaign_strategy.timeline).map(([week, tasks]: any, idx: number) => {
                const taskArray = ensureArray(tasks);

                return (
                  <div key={week} className="flex gap-4 md:gap-8 group">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-sm bg-corporate-900 text-white flex items-center justify-center font-bold text-sm shadow-md z-10 print:bg-slate-900 print:text-white print:shadow-none transition-transform duration-300 group-hover:scale-110 group-hover:bg-action-600">
                        {idx + 1}
                      </div>
                      {idx !== Object.keys(campaign_strategy.timeline).length - 1 && (
                        <div className="w-px h-full bg-slate-200 my-2 group-last:hidden print:bg-slate-300"></div>
                      )}
                    </div>
                    <div className="pb-8 border-b border-slate-100 w-full last:border-0 last:pb-0">
                      <h3 className="font-bold text-corporate-800 capitalize mb-3">{week.replace('_', ' ')}</h3>
                      {taskArray.length > 1 ? (
                        <ul className="space-y-2">
                          {taskArray.map((task: any, taskIdx: number) => (
                            <li key={taskIdx} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
                              <span className="text-action-600 mt-1.5">•</span>
                              <span>{renderContent(task)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-600 text-sm leading-relaxed">{renderContent(taskArray[0])}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Risks */}
        {parsedRisks.length > 0 && (
          <section className="bg-slate-50 border border-slate-200 p-6 rounded-sm animate-fadeIn [animation-delay:1000ms] print:bg-white print:border print:border-slate-200 print:break-inside-avoid">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-slate-500" />
              <h2 className="text-lg font-bold text-slate-700">Risk Assessment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedRisks.map((risk: any, i: number) => (
                <div key={i} className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
                  <p className="text-sm font-medium text-slate-800 mb-2">{renderContent(risk.description)}</p>
                  {risk.mitigation && (
                    <p className="text-xs text-slate-500 italic"><span className="font-bold text-slate-600 not-italic">Mitigation:</span> {renderContent(risk.mitigation)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};