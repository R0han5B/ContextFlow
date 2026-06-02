export function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ||
    process.env.PYTHON_BACKEND_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '')
}
