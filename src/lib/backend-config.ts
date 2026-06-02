export function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'https://contextflow-wwa0.onrender.com/').replace(/\/$/, '')
}
