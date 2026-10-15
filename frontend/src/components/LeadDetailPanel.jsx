import { useEffect, useState } from 'react';
import {
  X, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  Building2, Globe, Users, Briefcase, Mail, Calendar,
  Copy, Check, ExternalLink, ShieldAlert, BarChart3,
  Layers, MapPin, UserCheck, ShieldCheck
} from 'lucide-react';

const CRITERION_LABELS = {
  industry: 'Industry Alignment',
  employee_size: 'Employee Headcount Match',
  data_completeness: 'Data Field Completeness',
  geography: 'Geographic Location Fit',
  data_freshness: 'Record Timestamp Recency',
};

const STATUS_ICONS = {
  matched: {
    Icon: CheckCircle2,
    cls: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    badge: 'badge-high',
    label: 'Matched'
  },
  partial: {
    Icon: AlertTriangle,
    cls: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    badge: 'badge-medium',
    label: 'Partial Match'
  },
  mismatched: {
    Icon: XCircle,
    cls: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    badge: 'badge-low',
    label: 'Mismatched'
  },
  missing: {
    Icon: HelpCircle,
    cls: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
    badge: 'badge-insufficient',
    label: 'Field Missing'
  },
  unavailable: {
    Icon: HelpCircle,
    cls: 'text-slate-500',
    bg: 'bg-slate-600/10 border-slate-600/20',
    badge: 'badge-insufficient',
    label: 'Not Configured'
  },
};

const PRIORITY_THEMES = {
  'High fit': {
    ring: '#10b981',
    text: '#34d399',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    badge: 'badge-high'
  },
  'Medium fit': {
    ring: '#f59e0b',
    text: '#fbbf24',
    bg: 'bg-amber-500/10 border-amber-500/20',
    badge: 'badge-medium'
  },
  'Low fit': {
    ring: '#f43f5e',
    text: '#fb7185',
    bg: 'bg-rose-500/10 border-rose-500/20',
    badge: 'badge-low'
  },
  'Insufficient data': {
    ring: '#64748b',
    text: '#94a3b8',
    bg: 'bg-slate-500/10 border-slate-500/20',
    badge: 'badge-insufficient'
  },
};

function ScoreGaugeRing({ score, priority }) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const safeScore = Math.min(100, Math.max(0, score || 0));
  const offset = circumference * (1 - safeScore / 100);
  const theme = PRIORITY_THEMES[priority] || PRIORITY_THEMES['Low fit'];

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width="98" height="98" className="-rotate-90">
        <circle
          cx="49"
          cy="49"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
        />
        <circle
          cx="49"
          cy="49"
          r={r}
          fill="none"
          stroke={theme.ring}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold font-mono" style={{ color: theme.text }}>
          {safeScore.toFixed(1)}
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          / 100
        </div>
      </div>
    </div>
  );
}

function FieldItem({ icon: Icon, label, value, onCopy, copied, warning }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon size={14} className="text-slate-500 shrink-0" />
        <span className="text-xs text-slate-400 min-w-[90px] shrink-0">{label}</span>
        <span className={`text-xs font-medium truncate ${value ? 'text-slate-200' : 'text-slate-600 italic'}`}>
          {value || 'Not provided'}
        </span>
        {warning && (
          <span className="badge badge-warning text-[10px] py-0 px-1.5 shrink-0">
            {warning}
          </span>
        )}
      </div>

      {value && onCopy && (
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="text-slate-500 hover:text-white p-1 rounded transition-colors shrink-0"
          title={`Copy ${label}`}
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      )}
    </div>
  );
}

function CriterionCard({ criterion }) {
  const cfg = STATUS_ICONS[criterion.status] || STATUS_ICONS.missing;
  const { Icon } = cfg;

  return (
    <div className={`rounded-xl border p-3.5 mb-2.5 ${cfg.bg} transition-colors`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon size={15} className={cfg.cls} />
          <span className="text-xs sm:text-sm font-semibold text-white">
            {CRITERION_LABELS[criterion.name] || criterion.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            weight: {criterion.weight}
          </span>
          <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${cfg.badge}`}>
            {criterion.score.toFixed(0)} pts
          </span>
        </div>
      </div>

      <div className="h-1.5 bg-white/6 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, criterion.score))}%`,
            backgroundColor:
              criterion.status === 'matched' ? '#10b981' :
              criterion.status === 'partial' ? '#f59e0b' :
              criterion.status === 'mismatched' ? '#f43f5e' : '#64748b'
          }}
        />
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        {criterion.reason}
      </p>
    </div>
  );
}

function LeadDetailPanel({ lead, onClose }) {
  const [copiedKey, setCopiedKey] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!lead) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const theme = PRIORITY_THEMES[lead.priority] || PRIORITY_THEMES['Low fit'];

  return (
    <>
      {/* Backdrop Overlay */}
      <div className="overlay" onClick={onClose} />

      {/* Drawer Container */}
      <div className="detail-panel flex flex-col">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-[#0d101d]/95 backdrop-blur-md border-b border-white/6 px-5 py-4 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base truncate font-display">
                {lead.company_name}
              </h3>
              {lead.is_duplicate && (
                <span className="badge badge-duplicate text-[10px] py-0 px-1.5">
                  Duplicate
                </span>
              )}
            </div>
            {lead.company_domain && (
              <a
                href={`https://${lead.company_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-0.5"
              >
                <span>{lead.company_domain}</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Close details (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          {/* Hero Fit & Coverage Score Card */}
          <div className="glass-card-light p-4 rounded-2xl flex items-center gap-4">
            <ScoreGaugeRing score={lead.score} priority={lead.priority} />

            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                ICP Qualification Status
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${theme.badge} text-xs font-bold`}>
                  {lead.priority}
                </span>
              </div>

              {/* Data Coverage Indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Data Coverage</span>
                  <span className="font-mono text-white font-semibold">
                    {lead.coverage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, lead.coverage))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Candidate Callout */}
          {lead.is_duplicate && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3.5 text-xs text-orange-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-orange-200">
                <Copy size={13} />
                <span>Duplicate Record Candidate</span>
              </div>
              <p className="text-[11px] text-orange-300/80 leading-relaxed">
                Matches an existing entry in this dataset (Lead ID: <span className="font-mono">{lead.duplicate_of?.substring(0, 8)}...</span>). Cross-check before initiating sales outreach.
              </p>
            </div>
          )}

          {/* Quality & Syntax Warnings */}
          {lead.warnings && lead.warnings.length > 0 && (
            <div className="space-y-1.5">
              {lead.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Criterion-Level Score Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-indigo-400" />
                <h4 className="text-xs sm:text-sm font-semibold text-white">
                  Explainable Score Breakdown
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                {lead.criteria?.length || 0} evaluated
              </span>
            </div>

            <div className="space-y-2">
              {lead.criteria && lead.criteria.map((c) => (
                <CriterionCard key={c.name} criterion={c} />
              ))}
            </div>
          </div>

          {/* Record Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={15} className="text-slate-400" />
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Record Attributes & Contact Info
              </h4>
            </div>

            <div className="glass-card-light rounded-xl p-1.5">
              <FieldItem
                icon={Building2}
                label="Company"
                value={lead.company_name}
                onCopy={(val) => copyToClipboard(val, 'company')}
                copied={copiedKey === 'company'}
              />
              <FieldItem
                icon={Globe}
                label="Domain"
                value={lead.company_domain}
                onCopy={(val) => copyToClipboard(val, 'domain')}
                copied={copiedKey === 'domain'}
              />
              <FieldItem
                icon={Briefcase}
                label="Industry"
                value={lead.industry}
              />
              <FieldItem
                icon={Users}
                label="Employees"
                value={lead.employee_count != null ? lead.employee_count.toLocaleString() : null}
              />
              <FieldItem
                icon={MapPin}
                label="Location"
                value={[lead.country, lead.state_or_region].filter(Boolean).join(', ')}
              />
              <FieldItem
                icon={UserCheck}
                label="Contact Name"
                value={lead.contact_name}
                onCopy={(val) => copyToClipboard(val, 'contact_name')}
                copied={copiedKey === 'contact_name'}
              />
              <FieldItem
                icon={Mail}
                label="Contact Email"
                value={lead.contact_email}
                warning={lead.warnings?.some(w => w.toLowerCase().includes('email')) ? 'Syntax issue' : null}
                onCopy={(val) => copyToClipboard(val, 'contact_email')}
                copied={copiedKey === 'contact_email'}
              />
              <FieldItem
                icon={Calendar}
                label="Last Updated"
                value={lead.last_updated_at}
              />
            </div>
          </div>

          {/* Missing Fields Cloud */}
          {lead.missing_fields && lead.missing_fields.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-400">
                <AlertTriangle size={13} className="text-amber-400" />
                <span>Missing Attributes in this Lead</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lead.missing_fields.map((f) => (
                  <span key={f} className="tag text-[11px] bg-amber-500/10 border-amber-500/20 text-amber-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimers */}
          <div className="glass-card-light p-3.5 rounded-xl border border-white/5 space-y-2 text-[11px] text-slate-500 leading-relaxed">
            <div className="flex items-start gap-2">
              <ShieldCheck size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Heuristic Scoring:</strong> LeadFit ICP fit scores reflect deterministic alignment against your configured profile rules and are not predictive guarantees of sales conversion or response rates.
              </span>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-white/5">
              <ShieldAlert size={14} className="text-slate-500 shrink-0 mt-0.5" />
              <span>
                External data claims (domain validity, inbox deliverability, active employment) have not been verified with third-party data vendors.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeadDetailPanel;
