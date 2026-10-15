import { useState } from 'react';
import {
  Target, Factory, Users, Globe, Calendar,
  Sliders, ChevronDown, ChevronUp, AlertCircle, Info,
  CheckCircle2, Sparkles, X, Plus, HelpCircle
} from 'lucide-react';

const COMMON_INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Manufacturing',
  'Retail', 'Education', 'Real Estate', 'Media & Entertainment',
  'Logistics & Supply Chain', 'Consulting', 'Marketing & Advertising',
  'Construction', 'Energy', 'Telecommunications', 'Legal',
  'Government', 'Non-profit'
];

const COMMON_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'Netherlands', 'Sweden', 'Japan',
  'United Arab Emirates', 'Ireland', 'Israel', 'Brazil'
];

const EMPLOYEE_PRESETS = [
  { label: 'Startup (1–50)', min: 1, max: 50 },
  { label: 'Growth (51–250)', min: 51, max: 250 },
  { label: 'Mid-Market (251–1,000)', min: 251, max: 1000 },
  { label: 'Enterprise (1,000+)', min: 1000, max: null },
];

function TagInput({ value, onChange, suggestions, placeholder, emptyWarning }) {
  const [input, setInput] = useState('');
  const [showSugg, setShowSugg] = useState(false);

  const filtered = suggestions.filter(
    s => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const add = (item) => {
    const trimmed = item.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    setShowSugg(false);
  };

  const remove = (item) => onChange(value.filter(v => v !== item));

  return (
    <div className="relative">
      <div
        className="input-field flex flex-wrap items-center gap-1.5 min-h-[46px] cursor-text"
        onClick={() => setShowSugg(true)}
      >
        {value.map(v => (
          <span key={v} className="tag text-xs">
            {v}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(v); }}
              title={`Remove ${v}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-white placeholder:text-slate-500 py-1"
          placeholder={value.length === 0 ? placeholder : 'Add more...'}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSugg(true); }}
          onFocus={() => setShowSugg(true)}
          onBlur={() => setTimeout(() => setShowSugg(false), 200)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input) { e.preventDefault(); add(input); }
            if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]);
          }}
        />
      </div>

      {showSugg && filtered.length > 0 && (
        <div className="absolute z-30 w-full mt-1.5 glass-card-elevated py-1.5 max-h-52 overflow-y-auto shadow-2xl border border-white/10">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Suggested Options
          </div>
          {filtered.slice(0, 10).map(s => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-white transition-colors flex items-center justify-between"
              onMouseDown={() => add(s)}
            >
              <span>{s}</span>
              <Plus size={12} className="text-indigo-400" />
            </button>
          ))}
        </div>
      )}

      {value.length === 0 && emptyWarning && (
        <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
          <Info size={12} className="text-slate-400 shrink-0" />
          <span>{emptyWarning}</span>
        </p>
      )}
    </div>
  );
}

function WeightSliderRow({ icon: Icon, label, desc, field, icp, onChange, accentColor }) {
  const val = icp[field] ?? 0;
  const totalWeight =
    (icp.industry_weight || 0) +
    (icp.employee_weight || 0) +
    (icp.completeness_weight || 0) +
    (icp.geography_weight || 0) +
    (icp.freshness_weight || 0);

  const sharePct = totalWeight > 0 ? Math.round((val / totalWeight) * 100) : 0;

  return (
    <div className="glass-card-light p-3.5 sm:p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentColor}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{label}</h4>
            <p className="text-[11px] text-slate-400 truncate">{desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded font-mono">
            {sharePct}% share
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={val}
              onChange={e => onChange(field, Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-slate-500 font-mono">pts</span>
          </div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={val}
        onChange={e => onChange(field, parseFloat(e.target.value) || 0)}
        className="weight-slider"
        style={{
          background: `linear-gradient(to right, #6366f1 ${val}%, rgba(255,255,255,0.08) ${val}%)`
        }}
      />
    </div>
  );
}

function ICPConfig({ icp, onChange, onAnalyze, loading }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const totalWeight =
    (icp.industry_weight || 0) +
    (icp.employee_weight || 0) +
    (icp.completeness_weight || 0) +
    (icp.geography_weight || 0) +
    (icp.freshness_weight || 0);

  const weightsValid = totalWeight > 0;

  const set = (key, val) => onChange({ ...icp, [key]: val });

  const hasEmployeeRangeError =
    icp.min_employees != null &&
    icp.max_employees != null &&
    icp.min_employees > icp.max_employees;

  return (
    <div className="fade-in-up w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-high text-[11px] py-0.5">Configuration Active</span>
            <span className="text-xs text-slate-500">Step 2 of 3</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Define Ideal Customer Profile (ICP)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure firmographic boundaries and scoring weight distribution. Only attributes present in your CSV records influence calculated scores.
          </p>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="space-y-6">
        {/* Section 1: Firmographics (Industry & Size) */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Factory size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Target Firmographics</h3>
                <p className="text-[11px] text-slate-400">Target industries and employee size bracket</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">Required for optimal fit</span>
          </div>

          <div className="space-y-5">
            {/* Preferred Industries */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">
                  Preferred Industries
                </label>
                <span className="text-[11px] text-slate-500">
                  {icp.preferred_industries.length} selected
                </span>
              </div>
              <TagInput
                value={icp.preferred_industries}
                onChange={v => set('preferred_industries', v)}
                suggestions={COMMON_INDUSTRIES}
                placeholder="Select or type target industries (e.g. Technology, Healthcare)..."
                emptyWarning="No industries specified — leads will evaluate as neutral/unavailable for this criterion."
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                <span className="text-[11px] text-slate-500 mr-1">Quick add:</span>
                {['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail'].map(ind => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => {
                      if (!icp.preferred_industries.includes(ind)) {
                        set('preferred_industries', [...icp.preferred_industries, ind]);
                      }
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      icp.preferred_industries.includes(ind)
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-white/4 text-slate-400 border-white/6 hover:bg-white/8 hover:text-slate-200'
                    }`}
                  >
                    + {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Employee Count Range */}
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">
                  Employee Count Range
                </label>
                {hasEmployeeRangeError && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle size={11} /> Minimum cannot exceed maximum
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">Minimum Employees</label>
                  <input
                    type="number"
                    className={`input-field ${hasEmployeeRangeError ? 'border-rose-500' : ''}`}
                    placeholder="e.g. 50 (leave empty for none)"
                    value={icp.min_employees ?? ''}
                    onChange={e => set('min_employees', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">Maximum Employees</label>
                  <input
                    type="number"
                    className={`input-field ${hasEmployeeRangeError ? 'border-rose-500' : ''}`}
                    placeholder="e.g. 1000 (leave empty for no ceiling)"
                    value={icp.max_employees ?? ''}
                    onChange={e => set('max_employees', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>
              </div>

              {/* Employee Count Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                {EMPLOYEE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange({ ...icp, min_employees: preset.min, max_employees: preset.max })}
                    className="text-[11px] px-2 py-0.5 rounded bg-white/4 border border-white/6 text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Target Geography & Freshness */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Geographic Focus & Data Recency</h3>
                <p className="text-[11px] text-slate-400">Target countries, regions, and freshness horizon</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">Target Countries</label>
                <span className="text-[11px] text-slate-500">
                  {icp.target_countries.length} selected
                </span>
              </div>
              <TagInput
                value={icp.target_countries}
                onChange={v => set('target_countries', v)}
                suggestions={COMMON_COUNTRIES}
                placeholder="Select or type target countries (e.g. United States, United Kingdom)..."
                emptyWarning="No countries selected — geographic fit will not penalize leads from any region."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">
                  Target States / Regions <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. California, New York, Ontario"
                  value={icp.target_regions.join(', ')}
                  onChange={e =>
                    set('target_regions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))
                  }
                />
                <p className="text-[11px] text-slate-500 mt-1">Comma-separated regions</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">
                  Data Freshness Horizon <span className="text-slate-500 font-normal">(days)</span>
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 365 (leave empty to skip freshness check)"
                  value={icp.data_freshness_days ?? ''}
                  onChange={e => set('data_freshness_days', e.target.value ? parseInt(e.target.value) : null)}
                  min="1"
                />
                <p className="text-[11px] text-slate-500 mt-1">Evaluated against last_updated_at column</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Scoring Weights & Explainability */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-5 border-b border-white/6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Criterion Scoring Weights</h3>
                <p className="text-[11px] text-slate-400">Adjust relative priority of each criterion in overall fit</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-semibold flex items-center gap-1.5 ${
                  weightsValid
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {weightsValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>Total Weight: {totalWeight.toFixed(0)} pts</span>
              </div>
            </div>
          </div>

          {/* Explainability Callout */}
          <div className="glass-card-light p-3.5 mb-4 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Info size={15} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-300 mb-0.5">How LeadFit weights work:</p>
              <p>
                Each lead receives a 0–100 score per criterion. If a criterion cannot be evaluated due to missing CSV fields, LeadFit excludes it from the denominator rather than penalizing the prospect with a zero score. The accompanying <span className="text-white font-medium">Data Coverage</span> indicator reveals what portion of criteria were verified.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <WeightSliderRow
              icon={Factory}
              label="Industry Match"
              desc="Evaluates preferred industry alignment"
              field="industry_weight"
              icp={icp}
              onChange={set}
              accentColor="bg-indigo-500/15 text-indigo-400"
            />
            <WeightSliderRow
              icon={Users}
              label="Employee Size Range"
              desc="Evaluates head-count boundary match"
              field="employee_weight"
              icp={icp}
              onChange={set}
              accentColor="bg-violet-500/15 text-violet-400"
            />
            <WeightSliderRow
              icon={Sliders}
              label="Data Completeness"
              desc="Rewards density of populated contact & company fields"
              field="completeness_weight"
              icp={icp}
              onChange={set}
              accentColor="bg-sky-500/15 text-sky-400"
            />
            <WeightSliderRow
              icon={Globe}
              label="Geographic Fit"
              desc="Matches target countries and territories"
              field="geography_weight"
              icp={icp}
              onChange={set}
              accentColor="bg-emerald-500/15 text-emerald-400"
            />
            <WeightSliderRow
              icon={Calendar}
              label="Data Freshness"
              desc="Considers recency of last_updated_at record timestamp"
              field="freshness_weight"
              icp={icp}
              onChange={set}
              accentColor="bg-amber-500/15 text-amber-400"
            />
          </div>

          {!weightsValid && (
            <p className="text-xs text-rose-400 mt-3 flex items-center gap-1.5">
              <AlertCircle size={13} />
              At least one criterion must have a positive weight value to proceed.
            </p>
          )}
        </div>

        {/* Section 4: Advanced Thresholds (Collapsible) */}
        <div className="glass-card p-5">
          <button
            type="button"
            className="w-full flex items-center justify-between text-left"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <div className="flex items-center gap-2.5">
              <Target size={16} className="text-slate-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200">
                  Advanced Priority Thresholds
                </h4>
                <p className="text-[11px] text-slate-500">
                  Configure cutoff boundaries for High / Medium / Low fit classification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {advancedOpen ? 'Hide' : 'Configure'}
              </span>
              {advancedOpen ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </div>
          </button>

          {advancedOpen && (
            <div className="mt-4 pt-4 border-t border-white/6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-emerald-400 mb-1 block">
                  High Fit Cutoff (≥)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-field font-mono"
                  value={icp.high_fit_threshold}
                  onChange={e => set('high_fit_threshold', parseFloat(e.target.value) || 0)}
                />
                <p className="text-[11px] text-slate-500 mt-1">Default: 75. Leads at or above this score</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 mb-1 block">
                  Medium Fit Cutoff (≥)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-field font-mono"
                  value={icp.medium_fit_threshold}
                  onChange={e => set('medium_fit_threshold', parseFloat(e.target.value) || 0)}
                />
                <p className="text-[11px] text-slate-500 mt-1">Default: 50. High &gt; score ≥ Medium</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-indigo-400 mb-1 block">
                  Min Coverage Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-field font-mono"
                  value={icp.min_coverage_threshold}
                  onChange={e => set('min_coverage_threshold', parseFloat(e.target.value) || 0)}
                />
                <p className="text-[11px] text-slate-500 mt-1">Leads below this coverage marked 'Insufficient data'</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/6">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <HelpCircle size={14} className="shrink-0" />
          <span>All calculations execute deterministically using backend heuristic scoring.</span>
        </div>

        <button
          type="button"
          className="btn-primary w-full sm:w-auto min-w-[240px] py-3 text-sm font-semibold justify-center"
          onClick={onAnalyze}
          disabled={loading || !weightsValid || hasEmployeeRangeError}
        >
          {loading ? (
            <span className="flex items-center gap-2.5">
              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              Executing Analysis Engine...
            </span>
          ) : (
            <>
              <Target size={17} />
              Run ICP Lead Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ICPConfig;
