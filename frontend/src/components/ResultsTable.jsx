import { useMemo, useState } from 'react';
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Download,
  Filter, RefreshCw, ChevronRight, AlertTriangle,
  Copy, BarChart2, TrendingUp, CheckCircle2, XCircle,
  Eye, PieChart as PieChartIcon, Layers, Building2,
  ExternalLink, Sparkles
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const PRIORITY_CONFIG = {
  'High fit': {
    className: 'badge-high',
    dot: 'bg-emerald-400',
    bar: '#10b981',
    hex: '#10b981'
  },
  'Medium fit': {
    className: 'badge-medium',
    dot: 'bg-amber-400',
    bar: '#f59e0b',
    hex: '#f59e0b'
  },
  'Low fit': {
    className: 'badge-low',
    dot: 'bg-rose-400',
    bar: '#f43f5e',
    hex: '#f43f5e'
  },
  'Insufficient data': {
    className: 'badge-insufficient',
    dot: 'bg-slate-400',
    bar: '#64748b',
    hex: '#64748b'
  },
};

function ScoreBar({ score, priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Low fit'];
  const safeScore = typeof score === 'number' ? score : 0;

  return (
    <div className="flex items-center gap-2.5 min-w-[110px]">
      <div className="score-bar-track flex-1 h-2">
        <div
          className="score-bar-fill h-full"
          style={{ width: `${Math.min(100, Math.max(0, safeScore))}%`, background: cfg.bar }}
        />
      </div>
      <span className="font-mono-num font-semibold text-xs sm:text-sm text-white w-9 text-right">
        {safeScore.toFixed(1)}
      </span>
    </div>
  );
}

function CoverageMeter({ coverage }) {
  const safeCoverage = typeof coverage === 'number' ? coverage : 0;
  const filledBars = Math.round(safeCoverage / 20);

  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-3.5 rounded-sm transition-colors ${
              i < filledBars ? 'bg-indigo-400' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className="font-mono-num text-xs text-slate-400">
        {safeCoverage.toFixed(0)}%
      </span>
    </div>
  );
}

function SummaryStats({ summary, results }) {
  const [showCharts, setShowCharts] = useState(true);

  // Compute aggregated stats
  const totalCount = results.length || summary.processed_rows || 1;
  const avgScore = results.length > 0
    ? (results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length).toFixed(1)
    : '0.0';

  const avgCoverage = results.length > 0
    ? (results.reduce((acc, r) => acc + (r.coverage || 0), 0) / results.length).toFixed(0)
    : '0';

  const highFitRatio = Math.round(((summary.high_fit || 0) / totalCount) * 100);

  // Chart data for priority breakdown
  const pieData = [
    { name: 'High fit', value: summary.high_fit || 0, color: '#10b981' },
    { name: 'Medium fit', value: summary.medium_fit || 0, color: '#f59e0b' },
    { name: 'Low fit', value: summary.low_fit || 0, color: '#f43f5e' },
    { name: 'Insufficient data', value: summary.insufficient_data || 0, color: '#64748b' },
  ].filter(d => d.value > 0);

  // Top industries breakdown
  const industryCounts = useMemo(() => {
    const map = {};
    results.forEach(r => {
      const ind = r.industry || 'Unknown';
      map[ind] = (map[ind] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.length > 14 ? name.substring(0, 14) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [results]);

  return (
    <div className="mb-6 fade-in-up space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Leads
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono-num">
              {summary.processed_rows}
            </span>
            <span className="text-[11px] text-slate-500">
              {summary.input_rows} raw
            </span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              High Fit
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {highFitRatio}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono-num">
              {summary.high_fit}
            </span>
            <span className="text-[11px] text-slate-400">priority</span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Medium Fit
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono-num">
              {summary.medium_fit}
            </span>
            <span className="text-[11px] text-slate-400">nurture</span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg ICP Score
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-300 font-mono-num">
              {avgScore}
            </span>
            <span className="text-[11px] text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg Coverage
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono-num">
              {avgCoverage}%
            </span>
            <span className="text-[11px] text-slate-500">data health</span>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">
              Duplicates
            </span>
            {summary.duplicate_candidates > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-orange-400 font-mono-num">
              {summary.duplicate_candidates}
            </span>
            <span className="text-[11px] text-slate-500">flagged</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Bar */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/6">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">
              Pipeline Fit Intelligence & Distribution
            </h3>
          </div>
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-white transition-colors"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? 'Hide Visuals' : 'Show Visuals'}
          </button>
        </div>

        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution Chart */}
            <div className="glass-card-light p-4 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Fit Classification Breakdown
                </span>
                <span className="text-[11px] text-slate-500">By qualification tier</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="glass-card-elevated p-2 text-xs border border-white/10">
                              <p className="font-semibold text-white">{data.name}</p>
                              <p className="text-slate-300 mt-0.5">
                                {data.value} leads ({Math.round((data.value / totalCount) * 100)}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-400">{d.name}</span>
                    <span className="font-mono text-white">({d.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Industries Chart */}
            <div className="glass-card-light p-4 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Lead Volume by Industry
                </span>
                <span className="text-[11px] text-slate-500">Top 5 sectors in dataset</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryCounts} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card-elevated p-2 text-xs border border-white/10">
                              <p className="font-semibold text-white">{payload[0].payload.name}</p>
                              <p className="text-indigo-300 mt-0.5">{payload[0].value} leads</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
                <span>Evaluated across active firmographic criteria</span>
                <span className="text-indigo-400 font-medium">{results.length} leads</span>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Metadata Footer */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 mt-3 border-t border-white/5 text-xs text-slate-400">
          {summary.rejected_empty > 0 && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Rejected empty rows: <strong className="text-slate-200">{summary.rejected_empty}</strong></span>
            </div>
          )}

          {summary.most_missing_fields && summary.most_missing_fields.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-300">
              <AlertTriangle size={12} className="text-amber-400 shrink-0" />
              <span>
                Commonly missing fields: <strong className="text-amber-200">{summary.most_missing_fields.join(', ')}</strong>
              </span>
            </div>
          )}

          {summary.unmapped_columns && summary.unmapped_columns.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Unmapped columns: {summary.unmapped_columns.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsTable({ results, onSelectLead, onExport, onRecalculate, loading }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDuplicates, setFilterDuplicates] = useState(false);
  const [filterIncomplete, setFilterIncomplete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Compute filter counts
  const counts = useMemo(() => {
    return {
      all: results.length,
      high: results.filter(r => r.priority === 'High fit').length,
      medium: results.filter(r => r.priority === 'Medium fit').length,
      low: results.filter(r => r.priority === 'Low fit').length,
      insufficient: results.filter(r => r.priority === 'Insufficient data').length,
      duplicates: results.filter(r => r.is_duplicate).length,
      incomplete: results.filter(r => r.missing_fields && r.missing_fields.length > 0).length,
    };
  }, [results]);

  const filtered = useMemo(() => {
    let data = results;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(r =>
        (r.company_name || '').toLowerCase().includes(q) ||
        (r.company_domain || '').toLowerCase().includes(q) ||
        (r.contact_name || '').toLowerCase().includes(q) ||
        (r.contact_email || '').toLowerCase().includes(q) ||
        (r.industry || '').toLowerCase().includes(q) ||
        (r.country || '').toLowerCase().includes(q)
      );
    }

    if (filterPriority) {
      data = data.filter(r => r.priority === filterPriority);
    }

    if (filterDuplicates) {
      data = data.filter(r => r.is_duplicate);
    }

    if (filterIncomplete) {
      data = data.filter(r => r.missing_fields && r.missing_fields.length > 0);
    }

    data = [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      aVal = aVal ?? (sortDir === 'asc' ? Infinity : -Infinity);
      bVal = bVal ?? (sortDir === 'asc' ? Infinity : -Infinity);

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [results, search, sortField, sortDir, filterPriority, filterDuplicates, filterIncomplete]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (field !== sortField) {
      return <ArrowUpDown size={12} className="opacity-30 ml-1 inline" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp size={12} className="text-indigo-400 ml-1 inline" />
    ) : (
      <ArrowDown size={12} className="text-indigo-400 ml-1 inline" />
    );
  };

  const handleRowClick = (lead) => {
    setSelectedId(lead.id);
    onSelectLead(lead);
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilterPriority('');
    setFilterDuplicates(false);
    setFilterIncomplete(false);
  };

  const hasActiveFilters = Boolean(
    search || filterPriority || filterDuplicates || filterIncomplete
  );

  return (
    <div className="fade-in-up">
      {/* Interactive Toolbar */}
      <div className="glass-card p-4 mb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="input-field pl-10 pr-8 py-2 text-sm"
              placeholder="Search companies, domains, contacts, industries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Action CTAs: Recalculate & Export */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              className="btn-secondary text-xs sm:text-sm py-2 px-3.5"
              onClick={onRecalculate}
              disabled={loading}
              title="Recalculate lead fit with current ICP weights"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-indigo-400' : ''} />
              <span>{loading ? 'Recalculating...' : 'Recalculate'}</span>
            </button>

            <button
              type="button"
              className="btn-success text-xs sm:text-sm py-2 px-3.5"
              onClick={onExport}
              title="Export all analyzed results to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/6 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              className={`filter-chip ${filterPriority === '' ? 'active' : ''}`}
              onClick={() => setFilterPriority('')}
            >
              All Leads <span className="opacity-70 font-mono text-[11px]">({counts.all})</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${filterPriority === 'High fit' ? 'active' : ''}`}
              onClick={() => setFilterPriority(filterPriority === 'High fit' ? '' : 'High fit')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              High Fit <span className="opacity-70 font-mono text-[11px]">({counts.high})</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${filterPriority === 'Medium fit' ? 'active' : ''}`}
              onClick={() => setFilterPriority(filterPriority === 'Medium fit' ? '' : 'Medium fit')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Medium Fit <span className="opacity-70 font-mono text-[11px]">({counts.medium})</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${filterPriority === 'Low fit' ? 'active' : ''}`}
              onClick={() => setFilterPriority(filterPriority === 'Low fit' ? '' : 'Low fit')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Low Fit <span className="opacity-70 font-mono text-[11px]">({counts.low})</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${filterPriority === 'Insufficient data' ? 'active' : ''}`}
              onClick={() => setFilterPriority(filterPriority === 'Insufficient data' ? '' : 'Insufficient data')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Insufficient Data <span className="opacity-70 font-mono text-[11px]">({counts.insufficient})</span>
            </button>

            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

            <button
              type="button"
              className={`filter-chip ${filterDuplicates ? 'active' : ''}`}
              onClick={() => setFilterDuplicates(!filterDuplicates)}
            >
              <Copy size={11} className="text-orange-400" />
              Duplicates <span className="opacity-70 font-mono text-[11px]">({counts.duplicates})</span>
            </button>

            <button
              type="button"
              className={`filter-chip ${filterIncomplete ? 'active' : ''}`}
              onClick={() => setFilterIncomplete(!filterIncomplete)}
            >
              <AlertTriangle size={11} className="text-amber-400" />
              Incomplete Data <span className="opacity-70 font-mono text-[11px]">({counts.incomplete})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Showing <strong className="text-white font-mono">{filtered.length}</strong> of{' '}
              <span className="font-mono">{results.length}</span> records
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300 underline font-medium ml-1"
                onClick={clearAllFilters}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card overflow-hidden">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('company_name')} className="cursor-pointer">
                  Company & Domain <SortIcon field="company_name" />
                </th>
                <th onClick={() => handleSort('industry')} className="cursor-pointer">
                  Industry <SortIcon field="industry" />
                </th>
                <th onClick={() => handleSort('employee_count')} className="cursor-pointer">
                  Headcount <SortIcon field="employee_count" />
                </th>
                <th onClick={() => handleSort('country')} className="cursor-pointer">
                  Geography <SortIcon field="country" />
                </th>
                <th onClick={() => handleSort('score')} className="cursor-pointer min-w-[130px]">
                  ICP Fit Score <SortIcon field="score" />
                </th>
                <th onClick={() => handleSort('coverage')} className="cursor-pointer">
                  Data Coverage <SortIcon field="coverage" />
                </th>
                <th onClick={() => handleSort('priority')} className="cursor-pointer">
                  Priority <SortIcon field="priority" />
                </th>
                <th className="w-16 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-slate-500">
                        <Filter size={22} />
                      </div>
                      <p className="text-sm font-semibold text-white">No matching leads found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No leads match your current search queries or filter constraints. Try adjusting or clearing your filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          className="btn-secondary text-xs mt-2 py-1.5 px-3"
                          onClick={clearAllFilters}
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  const cfg = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG['Low fit'];
                  const isSelected = selectedId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleRowClick(lead)}
                      className={`${isSelected ? 'selected' : ''}`}
                    >
                      {/* Company Name & Domain */}
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
                              <span>{lead.company_name}</span>
                              {lead.is_duplicate && (
                                <span className="badge badge-duplicate text-[10px] py-0 px-1.5">
                                  <Copy size={9} /> Duplicate
                                </span>
                              )}
                            </div>
                            {lead.company_domain ? (
                              <span className="text-xs text-slate-400 flex items-center gap-1 hover:text-indigo-300">
                                {lead.company_domain}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-600 italic">No domain</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td>
                        <span className="text-xs text-slate-300">
                          {lead.industry ? (
                            <span className="px-2 py-0.5 rounded bg-white/4 border border-white/6 text-slate-200">
                              {lead.industry}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs italic">Unspecified</span>
                          )}
                        </span>
                      </td>

                      {/* Employee Count */}
                      <td>
                        <span className="text-xs font-mono-num text-slate-300">
                          {lead.employee_count != null ? (
                            lead.employee_count.toLocaleString()
                          ) : (
                            <span className="text-slate-600 italic">—</span>
                          )}
                        </span>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="text-xs text-slate-300">
                          {[lead.country, lead.state_or_region].filter(Boolean).join(', ') || (
                            <span className="text-slate-600 italic">—</span>
                          )}
                        </span>
                      </td>

                      {/* ICP Fit Score */}
                      <td>
                        <ScoreBar score={lead.score} priority={lead.priority} />
                      </td>

                      {/* Data Coverage */}
                      <td>
                        <CoverageMeter coverage={lead.coverage} />
                      </td>

                      {/* Priority Badge */}
                      <td>
                        <span className={`badge ${cfg.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {lead.priority}
                        </span>
                      </td>

                      {/* Inspect Action */}
                      <td className="text-right">
                        <button
                          type="button"
                          className="w-7 h-7 rounded-lg bg-white/4 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 inline-flex items-center justify-center transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(lead);
                          }}
                          title="Inspect Lead Details"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { SummaryStats, ResultsTable };
