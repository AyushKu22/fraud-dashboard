export default (t) =>
  new Intl.NumberFormat(t.currency === 'USD' ? 'en-US' : 'en-IN', { style: 'currency', currency: t.currency || 'INR' }).format(t.amount);