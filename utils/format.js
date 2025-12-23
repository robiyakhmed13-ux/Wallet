const formatUZS = (n) => {
  const amount = Number(n || 0);
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".0", "")}M`;
  return new Intl.NumberFormat("uz-UZ").format(amount).replaceAll(",", " ");
};
export { formatUZS };
