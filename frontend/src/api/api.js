import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL  || ""

export const api = {
  async analyze(file, icp) {
    const form = new FormData();
    form.append('file', file);
    form.append('icp', JSON.stringify(icp));
    const { data } = await axios.post(`${BASE}/leads/analyze`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async recalculate(leads, icp) {
    const { data } = await axios.post(`${BASE}/leads/recalculate`, { leads, icp });
    return data;
  },

  async exportCsv(leads, icp) {
    const res = await axios.post(`${BASE}/leads/export`, { leads, icp }, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadfit_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  },

  async health() {
    const { data } = await axios.get(`${BASE}/health`);
    return data;
  },
};

export const DEFAULT_ICP = {
  preferred_industries: [],
  min_employees: null,
  max_employees: null,
  target_countries: [],
  target_regions: [],
  required_fields: [],
  data_freshness_days: null,
  min_coverage_threshold: 40,
  industry_weight: 30,
  employee_weight: 25,
  completeness_weight: 20,
  geography_weight: 15,
  freshness_weight: 10,
  high_fit_threshold: 75,
  medium_fit_threshold: 50,
};
