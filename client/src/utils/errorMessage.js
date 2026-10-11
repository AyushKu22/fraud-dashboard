export default function errorMessage(err, fallback = 'Something went wrong') {
  const d = err.response?.data;
  return d?.errors?.[0]?.message || d?.message || (err.response ? fallback : 'Cannot reach the server');
}