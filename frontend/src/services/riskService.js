/**
 * Risk intelligence helpers and formatters.
 */

export const getRiskColor = (bandOrScore) => {
  if (typeof bandOrScore === 'number') {
    if (bandOrScore >= 80) return '#DC2626'; // Red (Critical)
    if (bandOrScore >= 60) return '#EA580C'; // Orange (High)
    if (bandOrScore >= 35) return '#D97706'; // Amber (Medium)
    return '#16A34A'; // Green (Low)
  }

  const band = String(bandOrScore || '').toUpperCase();
  switch (band) {
    case 'CRITICAL':
      return '#DC2626';
    case 'HIGH':
      return '#EA580C';
    case 'MEDIUM':
      return '#D97706';
    case 'LOW':
    default:
      return '#16A34A';
  }
};

export const getRiskBgColor = (bandOrScore) => {
  if (typeof bandOrScore === 'number') {
    if (bandOrScore >= 80) return '#FEF2F2';
    if (bandOrScore >= 60) return '#FFF7ED';
    if (bandOrScore >= 35) return '#FEFCE8';
    return '#F0FDF4';
  }

  const band = String(bandOrScore || '').toUpperCase();
  switch (band) {
    case 'CRITICAL':
      return '#FEF2F2';
    case 'HIGH':
      return '#FFF7ED';
    case 'MEDIUM':
      return '#FEFCE8';
    case 'LOW':
    default:
      return '#F0FDF4';
  }
};

export const getRiskBadge = (band) => {
  const b = String(band || 'LOW').toUpperCase();
  switch (b) {
    case 'CRITICAL':
      return {
        label: 'Critical Risk',
        shortLabel: 'Critical',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-600',
      };
    case 'HIGH':
      return {
        label: 'High Risk',
        shortLabel: 'High',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
      };
    case 'MEDIUM':
      return {
        label: 'Medium Risk',
        shortLabel: 'Medium',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'LOW':
    default:
      return {
        label: 'Low Risk',
        shortLabel: 'Low',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600',
      };
  }
};

export const formatCr = (val) => {
  if (val == null || isNaN(val)) return '₹0 Cr';
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L Cr`;
  if (val >= 1000) return `₹${(val).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  return `₹${val.toFixed(2)} Cr`;
};

export const formatPct = (val) => {
  if (val == null || isNaN(val)) return '0.0%';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};

export const formatMonths = (val) => {
  if (val == null || isNaN(val)) return '0 mo';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)} mo`;
};

export const getQuadrantInfo = (costRisk, timeRisk) => {
  if (costRisk >= 60 && timeRisk >= 60) {
    return {
      quadrant: 'High Cost / High Time',
      severity: 'CRITICAL',
      color: '#DC2626',
      description: 'Dual-dimension critical risk requiring immediate executive intervention.',
    };
  }
  if (costRisk < 60 && timeRisk >= 60) {
    return {
      quadrant: 'Low Cost / High Time',
      severity: 'HIGH',
      color: '#EA580C',
      description: 'Timeline slippage without major budget expansion.',
    };
  }
  if (costRisk >= 60 && timeRisk < 60) {
    return {
      quadrant: 'High Cost / Low Time',
      severity: 'HIGH',
      color: '#D97706',
      description: 'Capital cost escalation while schedule remains relatively resilient.',
    };
  }
  return {
    quadrant: 'Low Cost / Low Time',
    severity: 'LOW',
    color: '#16A34A',
    description: 'Aligned with approved milestone parameters.',
  };
};
