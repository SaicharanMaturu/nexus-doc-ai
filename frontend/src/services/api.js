const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_auth_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token, user, rememberMe = false) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function getAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401) {
    // If unauthorized, notify window for automatic session management
    window.dispatchEvent(new CustomEvent('nexus:session-expired'));
  }
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch {
      // Use fallback error message
    }
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// -----------------------------------------------------------------------------
// Authentication APIs
// -----------------------------------------------------------------------------

export async function loginUser(email, password, rememberMe = false) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, remember_me: rememberMe }),
  });
  const data = await handleResponse(res);
  if (data?.session?.token && data?.user) {
    setStoredSession(data.session.token, data.user, rememberMe);
  }
  return data;
}

export async function registerUser({ email, password, name, organization }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, organization }),
  });
  const data = await handleResponse(res);
  if (data?.session?.token && data?.user) {
    setStoredSession(data.session.token, data.user, false);
  }
  return data;
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // Gracefully handle logout network issues
  } finally {
    clearStoredSession();
  }
  return { success: true };
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function confirmPasswordReset(email, token, newPassword) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, new_password: newPassword }),
  });
  return handleResponse(res);
}

// -----------------------------------------------------------------------------
// Existing Document & Verification APIs (Preserved & Protected)
// -----------------------------------------------------------------------------

export async function getDocuments() {
  const res = await fetch(`${API_BASE}/documents`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function getDocumentById(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function uploadInvoiceFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

export async function submitHumanVerification(id, updateData) {
  const res = await fetch(`${API_BASE}/documents/${id}/verify`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updateData),
  });
  return handleResponse(res);
}

export async function runOcrComparison(id) {
  const res = await fetch(`${API_BASE}/documents/${id}/ocr-compare`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export function getReportDownloadUrl(id) {
  return `${API_BASE}/documents/${id}/report`;
}

export function getCsvExportUrl(id) {
  return `${API_BASE}/documents/${id}/export/csv`;
}

export function getExcelExportUrl(id) {
  return `${API_BASE}/documents/${id}/export/excel`;
}

export function getTallyExportUrl(id) {
  return `${API_BASE}/documents/${id}/export/tally`;
}

export async function getBenchmarkMetrics() {
  const res = await fetch(`${API_BASE}/evaluation/benchmark`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function getDashboardMetrics() {
  const res = await fetch(`${API_BASE}/metrics`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function reseedSampleData() {
  const res = await fetch(`${API_BASE}/documents/seed`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
