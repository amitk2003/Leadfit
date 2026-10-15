import { useState, useCallback } from 'react';
import {
  Upload, FileText, AlertCircle, CheckCircle2,
  X, Info, ShieldCheck, Sparkles, RefreshCw, ArrowRight
} from 'lucide-react';

const MAX_SIZE_MB = 10;

const SAMPLE_CSV_CONTENT = `company_name,company_domain,industry,employee_count,country,state_or_region,contact_name,contact_email,last_updated_at
Acme Technologies,acme.com,Technology,250,United States,California,Alice Johnson,alice@acme.com,2024-08-15
HealthCore Inc,healthcore.io,Healthcare,1200,United States,New York,Bob Williams,bob@healthcore.io,2023-12-01
FinServe Ltd,finserve.co.uk,Financial Services,80,United Kingdom,,Charles Brown,charles@finserve.co.uk,2024-06-20
RetailMax,retailmax.de,Retail,5000,Germany,,Dieter Müller,dieter@retailmax.de,2024-01-10
TechNova Solutions,technova.io,Technology,45,United States,Texas,Emma Davis,emma@technova.io,2024-09-01
GreenEnergy Co,greenenergy.com,Energy,300,Canada,,François Tremblay,francois@greenenergy.com,2023-05-15
EduPath,edupath.org,Education,120,United States,Massachusetts,Grace Kim,grace@edupath.org,2024-07-22
BuildRight Construction,buildright.com,Construction,850,United States,Florida,Henry Martin,henry@buildright.com,2024-03-30
Consulting Partners,consultingpartners.biz,Consulting,25,Australia,,Isabella Chen,isabella@consultingpartners.biz,2024-10-01
MediaHub,mediahub.net,Media & Entertainment,600,United Kingdom,,James Wilson,james@mediahub.net,2023-11-18
SaaSFlow,saasflow.io,Technology,180,United States,Washington,Katherine Lee,kate@saasflow.io,2024-09-15
LegalEdge,legaledge.com,Legal,40,United States,New York,Liam Garcia,liam@legaledge.com,2024-05-05
SupplyChainPro,supplychainpro.com,Logistics & Supply Chain,320,United States,Illinois,Maria Lopez,maria@supplychainpro.com,2024-08-01
TechNova Solutions,technova.io,Technology,45,United States,Texas,Emma Davis,emma@technova.io,2024-09-01
BioMed Research,biomed.org,Healthcare,75,Germany,,Niklas Bauer,niklas@biomed.org,2024-04-12
SolarTech,solartech.ae,Energy,150,United Arab Emirates,,Omar Al-Rashid,,2024-07-30
DataDriven Analytics,datadriven.ai,Technology,90,United States,California,Patricia Wong,patricia@datadriven.ai,2024-10-05
,,,,,,,invalid-email-format,2024-01-01
RealEstateOne,realestatone.com,Real Estate,200,United States,New York,Quinn Adams,quinn@realestatone.com,2024-06-18
TeleComNext,telecomnext.in,Telecommunications,4500,India,,Rajesh Kumar,rajesh@telecomnext.in,2022-08-22
CloudBase Systems,cloudbase.io,Technology,320,United States,Oregon,Sarah Thompson,sarah@cloudbase.io,2024-09-28
MicroManufacturing,micromfg.com,Manufacturing,60,United States,Michigan,Tom Harris,tom@micromfg.com,2024-07-01
NonProfitHub,nonprofithub.org,Non-profit,15,United States,Colorado,Uma Patel,uma@nonprofithub.org,2024-08-10`;

function UploadStep({ onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFile = useCallback((f) => {
    setError('');
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV (.csv) files are supported. Please verify your file extension.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_SIZE_MB} MB limit (${(f.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller file.`);
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const loadSampleDataset = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
    const sampleFile = new File([blob], 'sample_leads.csv', { type: 'text/csv' });
    handleFile(sampleFile);
  };

  const proceed = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      className="fade-in-up w-full max-w-3xl py-4 flex flex-col items-center mx-auto"
      style={{ marginLeft: 'auto', marginRight: 'auto' }}
    >
      {/* Hero Header - Centered */}
      <div className="text-center mb-8 pt-2 w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full px-3.5 py-1.5 text-xs font-semibold text-indigo-300 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Lead Intelligence & Prioritization Engine
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4 font-display text-center leading-tight">
          Turn raw lead lists into <span className="gradient-text">high-intent pipeline</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base text-slate-400 leading-relaxed text-center">
          Ingest your company and prospect records to evaluate qualification fit against your Ideal Customer Profile. LeadFit scores, ranks, and explains every lead with full transparency.
        </p>

        {/* 3-Step Process Indicator - Centered */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto mt-7 text-left">
          <div className="glass-card-light p-3.5 flex items-start gap-3">
            <span className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <p className="text-xs font-semibold text-white">Upload CSV Data</p>
              <p className="text-[11px] text-slate-400 leading-snug">Auto-maps contacts & attributes</p>
            </div>
          </div>
          <div className="glass-card-light p-3.5 flex items-start gap-3">
            <span className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <p className="text-xs font-semibold text-white">Configure ICP</p>
              <p className="text-[11px] text-slate-400 leading-snug">Set industries, sizes & weights</p>
            </div>
          </div>
          <div className="glass-card-light p-3.5 flex items-start gap-3">
            <span className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <p className="text-xs font-semibold text-white">Score & Export</p>
              <p className="text-[11px] text-slate-400 leading-snug">Explainable score & CSV download</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Drop Zone Card - Centered */}
      <div className="glass-card p-6 sm:p-8 mb-6 w-full shadow-2xl">
        <div
          className={`drop-zone min-h-[260px] p-8 text-center flex flex-col items-center justify-center transition-all ${
            dragOver ? 'drag-over' : ''
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('csv-file-input')?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('csv-file-input')?.click(); }}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleChange}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3.5 w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <FileText size={32} />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="font-semibold text-white text-base truncate max-w-xs">{file.name}</span>
                  <span className="badge badge-high text-[11px] py-0.5">
                    <CheckCircle2 size={11} /> Valid CSV
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Size: {(file.size / 1024).toFixed(1)} KB &bull; Ready for ICP analysis
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary text-xs py-1.5 px-3"
                  onClick={() => document.getElementById('csv-file-input')?.click()}
                >
                  <RefreshCw size={12} /> Replace file
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2.5"
                  onClick={() => setFile(null)}
                >
                  <X size={13} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-1 group-hover:scale-105 transition-transform">
                <Upload size={28} />
              </div>

              <div>
                <p className="text-base sm:text-lg font-semibold text-white text-center">
                  Drag and drop your CSV here
                </p>
                <p className="text-xs text-slate-400 mt-1 text-center">
                  or <span className="text-indigo-400 underline font-medium">browse your device</span> to select a file
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 mt-2">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/8">.CSV format</span>
                <span>•</span>
                <span>Maximum {MAX_SIZE_MB} MB</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Dataset Action - Centered */}
        {!file && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/6 text-xs text-slate-400 text-center">
            <span>Want to test immediately?</span>
            <button
              type="button"
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-indigo-500/10 transition-colors"
              onClick={loadSampleDataset}
            >
              <Sparkles size={13} />
              Load Sample Leads (24 demo records)
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 mt-4 text-rose-300 text-xs text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Auto-detected Columns & Schema Information Card */}
      <div className="glass-card-light p-5 mb-8 w-full text-left">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Auto-detected Schema & Tolerant Ingestion
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              LeadFit automatically recognizes common CSV header variants for company and contact fields. Extra columns are preserved, and missing cells do not cause import failure:
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                'company_name',
                'company_domain',
                'industry',
                'employee_count',
                'country',
                'state_or_region',
                'contact_name',
                'contact_email',
                'last_updated_at',
              ].map((col) => (
                <span key={col} className="tag text-[11px] font-mono">
                  {col}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-white/5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>In-memory processing guarantee: Lead files are processed transiently and never stored or retained on disk.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Proceed CTA - Centered */}
      <div className="flex items-center justify-center gap-3 w-full">
        <button
          type="button"
          className="btn-primary w-full sm:w-auto min-w-[260px] py-3.5 text-sm font-semibold justify-center shadow-lg shadow-indigo-500/20"
          onClick={proceed}
          disabled={!file}
        >
          {file ? (
            <>
              Configure ICP & Analyze
              <ArrowRight size={16} />
            </>
          ) : (
            'Select a CSV to Begin'
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadStep;
