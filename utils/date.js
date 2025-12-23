const todayISO = () => new Date().toISOString().slice(0, 10);

const startOfWeekISO = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday=0
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
};

const monthPrefix = () => new Date().toISOString().slice(0, 7);

export { todayISO, startOfWeekISO, monthPrefix };
