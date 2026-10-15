import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Target, Upload, Settings, BarChart2, ChevronRight,
  AlertCircle, FileText, RefreshCw, CheckCircle2,
  Sparkles, Layers, Sliders, ExternalLink, ShieldCheck,
  RotateCcw
} from 'lucide-react';

import UploadStep from './components/UploadStep';
import ICPConfig from './components/ICPConfig';
import { SummaryStats, ResultsTable } from './components/ResultsTable';
import LeadDetailPanel from './components/LeadDetailPanel';
import { api, DEFAULT_ICP } from './api';

const STEPS = [
  { id: 'upload', number: '1', label: 'Upload CSV', icon: Upload },
  { id: 'config', number: '2', label: 'Configure ICP', icon: Settings },
  { id: 'results', number: '3', label: 'Results & Intelligence', icon: BarChart2 },
];

function WorkflowIndicator({ currentStep, onStepClick, hasFile, hasResults }) {
  const currentIdx = STEPS.findIndex(s => s.id === currentStep);

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isDone = idx < currentIdx;
        const canClick = (step.id === 'upload') ||
          (step.id === 'config' && hasFile) ||
          (step.id === 'results' && hasResults);

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : isDone
                  ? 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
              onClick={() => canClick && onStepClick(step.id)}
              disabled={!canClick && !isActive}
              title={canClick ? `Go to ${step.label}` : 'Complete prior steps first'}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                {isDone ? '✓' : step.number}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>

            {idx < STEPS.length - 1 && (
              <ChevronRight
                size={14}
                className={`hidden xs:block ${idx < currentIdx ? 'text-indigo-400/60' : 'text-slate-700'}`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function App() {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [icp, setIcp] = useState(DEFAULT_ICP);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = useCallback((f) => {
    setFile(f);
    setAnalysisResult(null);
    setError('');
    setStep('config');
    toast.success(`"${f.name}" loaded successfully.`);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.analyze(file, icp);
      setAnalysisResult(result);
      // Store the raw lead data for recalculate and export preservation
      setRawRows(result.results.map(r => ({
        ...r.original_row,
        _id: r.id,
        _warnings: r.warnings,
        _is_duplicate: r.is_duplicate,
        _duplicate_of: r.duplicate_of,
        _display_name: r.company_name,
        _original: r.original_row,
        company_name: r.company_name,
        company_domain: r.company_domain,
        industry: r.industry,
        employee_count: r.employee_count,
        country: r.country,
        state_or_region: r.state_or_region,
        contact_name: r.contact_name,
        contact_email: r.contact_email,
        last_updated_at: r.last_updated_at,
        _parsed_date: null,
      })));
      setStep('results');
      toast.success(`Analyzed ${result.summary.processed_rows} leads successfully!`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed. Please verify your CSV.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [file, icp]);

  const handleRecalculate = useCallback(async () => {
    if (!rawRows.length) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.recalculate(rawRows, icp);
      setAnalysisResult(result);
      toast.success('Lead scores recalculated successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Recalculation failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [rawRows, icp]);

  const handleExport = useCallback(async () => {
    if (!rawRows.length) return;
    try {
      await api.exportCsv(rawRows, icp);
      toast.success('Prioritized CSV export downloaded.');
    } catch (err) {
      toast.error('Export download failed. Please try again.');
    }
  }, [rawRows, icp]);

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setRawRows([]);
    setError('');
    setSelectedLead(null);
    setStep('upload');
  };

  return (
    <div className="bg-app min-h-screen text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121629',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.85rem',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />

      {/* Top Navigation Shell */}
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#080a12]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Product Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 group text-left"
              title="Return to LeadFit Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
                <Target size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-white font-display tracking-tight">
                    LeadFit
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 rounded px-1.5 py-0.5">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                  Lead Prioritization Engine
                </p>
              </div>
            </button>
          </div>

          {/* Workflow Stepper */}
          <WorkflowIndicator
            currentStep={step}
            onStepClick={setStep}
            hasFile={Boolean(file)}
            hasResults={Boolean(analysisResult)}
          />

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-2.5">
            {file && (
              <div className="hidden lg:flex items-center gap-2 text-xs bg-white/4 rounded-lg px-3 py-1.5 border border-white/6">
                <FileText size={13} className="text-emerald-400" />
                <span className="text-slate-300 max-w-[130px] truncate">{file.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
            )}

            {file && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-ghost text-xs py-1.5 px-2.5 text-slate-400 hover:text-white"
                title="Start a new upload"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">New Upload</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* Global Error Notice */}
        {error && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 text-rose-300 text-sm fade-in-up w-full">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block text-rose-200">Execution Error</span>
              {error}
            </div>
            <button
              type="button"
              className="text-rose-400 hover:text-rose-100 p-1"
              onClick={() => setError('')}
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Step 1: Upload Step */}
        {step === 'upload' && (
          <div className="w-full flex justify-center items-center">
            <UploadStep onUpload={handleUpload} />
          </div>
        )}

        {/* Step 2: ICP Configuration */}
        {step === 'config' && (
          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
            <ICPConfig
              icp={icp}
              onChange={setIcp}
              onAnalyze={handleAnalyze}
              loading={loading}
            />

            {/* Sidebar Context Card */}
            <aside className="space-y-5 lg:sticky lg:top-24">
              {/* Loaded File Summary */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/6">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Active Dataset
                  </span>
                  <span className="badge badge-high text-[10px] py-0.5">
                    Ready
                  </span>
                </div>

                {file ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">File Name</span>
                      <span className="font-medium text-white truncate ml-2 max-w-[160px]" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">File Size</span>
                      <span className="font-mono text-white">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Format</span>
                      <span className="text-white">Delimited CSV</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No file selected.</p>
                )}

                <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    onClick={() => setStep('upload')}
                  >
                    Change dataset file
                  </button>
                </div>
              </div>

              {/* Scoring Methodology Guide */}
              <div className="glass-card-light p-5 space-y-3 text-xs leading-relaxed">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span>How Scores Are Derived</span>
                </div>
                <p className="text-slate-400">
                  LeadFit uses transparent, deterministic logic to evaluate each contact record:
                </p>
                <ul className="space-y-2 text-slate-400 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>0–100 criterion scores</strong> are computed independently per rule.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>Missing data fields are <strong>excluded from the denominator</strong> rather than scored as zero.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>Data Coverage</strong> shows what percentage of criteria had sufficient data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>Lead priority tiers: <strong>High (≥75)</strong>, <strong>Medium (≥50)</strong>, <strong>Low (&lt;50)</strong>.</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}

        {/* Step 3: Results Dashboard */}
        {step === 'results' && analysisResult && (
          <div className="space-y-6">
            {/* Active ICP Summary Bar */}
            <div className="glass-card px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-slate-400">
                <span className="text-white font-semibold mr-2">Evaluated Profile:</span>
                <span className="text-slate-300">
                  {icp.preferred_industries.length > 0
                    ? icp.preferred_industries.slice(0, 3).join(', ') + (icp.preferred_industries.length > 3 ? ` +${icp.preferred_industries.length - 3}` : '')
                    : 'All Industries'}
                </span>
                {icp.min_employees && (
                  <span className="text-slate-300"> &bull; {icp.min_employees.toLocaleString()}+ employees</span>
                )}
                {icp.target_countries.length > 0 && (
                  <span className="text-slate-300"> &bull; {icp.target_countries.slice(0, 2).join(', ')}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary text-xs py-1.5 px-3"
                  onClick={() => setStep('config')}
                >
                  <Settings size={13} />
                  <span>Adjust ICP Weights</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Cards & Charts */}
            <SummaryStats
              summary={analysisResult.summary}
              results={analysisResult.results}
            />

            {/* Interactive Data Table */}
            <ResultsTable
              results={analysisResult.results}
              onSelectLead={setSelectedLead}
              onExport={handleExport}
              onRecalculate={handleRecalculate}
              loading={loading}
            />

            {/* Slide-over Lead Detail Drawer */}
            {selectedLead && (
              <LeadDetailPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
              />
            )}
          </div>
        )}
      </main>

      {/* Production Footer Shell */}
      <footer className="border-t border-white/6 bg-[#070910] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">LeadFit</span>
            <span>&bull;</span>
            <span>Deterministic ICP Scoring & Lead Intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              API Connected
            </span>
            <span>FastAPI Backend v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
