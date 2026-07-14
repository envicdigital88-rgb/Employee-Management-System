export const chartColors = {
  accent: '#22d3ee',
  accentDeep: '#06b6d4',
  grid: '#262a31',
  axis: '#5b6270',
  tooltipBg: '#1a1d23',
  tooltipBorder: '#262a31'
};

export const tooltipStyle = {
  backgroundColor: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 12,
  fontSize: 12,
  color: '#f5f7fa',
  padding: '8px 12px'
};

export const axisProps = {
  tick: { fill: chartColors.axis, fontSize: 11 },
  axisLine: { stroke: chartColors.grid },
  tickLine: false
};