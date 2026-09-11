/**
 * Project filtering, sorting, searching, and pagination service.
 */

export const getFilterOptions = (projects = []) => {
  const sectors = new Set();
  const agencies = new Set();
  const ministries = new Set();
  const states = new Set();

  projects.forEach((p) => {
    if (p.sector) sectors.add(p.sector);
    if (p.agency) agencies.add(p.agency);
    if (p.ministry) ministries.add(p.ministry);
    if (p.state) states.add(p.state);
  });

  return {
    sectors: Array.from(sectors).sort(),
    agencies: Array.from(agencies).sort(),
    ministries: Array.from(ministries).sort(),
    states: Array.from(states).sort(),
  };
};

export const filterAndSortProjects = (projects = [], filters = {}, sortConfig = { key: 'priority_score', direction: 'desc' }) => {
  let result = [...projects];

  // Global search term (name, code, agency, state, sector, ministry)
  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    result = result.filter((p) => {
      const pcode = String(p.project_code || '');
      const pname = (p.project_name || '').toLowerCase();
      const pagency = (p.agency || '').toLowerCase();
      const pstate = (p.state || '').toLowerCase();
      const psector = (p.sector || '').toLowerCase();
      const pmin = (p.ministry || '').toLowerCase();
      return (
        pcode.includes(q) ||
        pname.includes(q) ||
        pagency.includes(q) ||
        pstate.includes(q) ||
        psector.includes(q) ||
        pmin.includes(q)
      );
    });
  }

  // Risk band filter
  if (filters.riskBand && filters.riskBand !== 'ALL') {
    result = result.filter((p) => p.risk_band === filters.riskBand);
  }

  // Sector filter
  if (filters.sector && filters.sector !== 'ALL') {
    result = result.filter((p) => p.sector === filters.sector);
  }

  // State filter
  if (filters.state && filters.state !== 'ALL') {
    result = result.filter((p) => p.state === filters.state);
  }

  // Agency filter
  if (filters.agency && filters.agency !== 'ALL') {
    result = result.filter((p) => p.agency === filters.agency);
  }

  // Ministry filter
  if (filters.ministry && filters.ministry !== 'ALL') {
    result = result.filter((p) => p.ministry === filters.ministry);
  }

  // Cost risk threshold filter
  if (filters.minCostRisk != null && filters.minCostRisk > 0) {
    result = result.filter((p) => p.cost_risk_score >= filters.minCostRisk);
  }

  // Schedule risk threshold filter
  if (filters.minTimeRisk != null && filters.minTimeRisk > 0) {
    result = result.filter((p) => p.time_risk_score >= filters.minTimeRisk);
  }

  // Risk trend filter
  if (filters.riskTrend && filters.riskTrend !== 'ALL') {
    result = result.filter((p) => p.risk_trend === filters.riskTrend);
  }

  // Sorting
  if (sortConfig.key) {
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
};

export const paginate = (items = [], page = 1, pageSize = 25) => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedItems = items.slice(startIndex, endIndex);

  return {
    items: pagedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
  };
};

export const getProjectByCode = (projects = [], code) => {
  const numCode = Number(code);
  return projects.find((p) => p.project_code === numCode) || null;
};
