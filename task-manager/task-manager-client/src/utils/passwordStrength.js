export const checks = [
  { id: 'length',    label: 'At least 8 characters',       test: (p) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A-Z)',   test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter (a-z)',   test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0-9)',             test: (p) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character (!@#$…)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const getStrength = (password) => {
  const passed = checks.filter((c) => c.test(password)).length;
  if (passed <= 1) return { level: 0, label: 'Very weak',  color: '#ef4444' };
  if (passed === 2) return { level: 1, label: 'Weak',       color: '#f97316' };
  if (passed === 3) return { level: 2, label: 'Fair',       color: '#eab308' };
  if (passed === 4) return { level: 3, label: 'Strong',     color: '#22c55e' };
  return              { level: 4, label: 'Very strong', color: '#10b981' };
};
