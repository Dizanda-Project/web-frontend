// Base URL of the Dizanda admin API (see /dizanda-backend). The public site
// reads content from here so admin edits show up live; if the admin API is
// not running, callers fall back to the hard-coded defaults shipped with
// each page instead of breaking.
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5000/api';

export async function fetchAdminContent(path) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${ADMIN_API_URL}${path}`, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Sends a customer quote/order request to the admin panel's Orders inbox.
// Unlike fetchAdminContent, callers need real success/failure feedback so
// the checkout UI can show an error instead of silently discarding the request.
export async function submitOrder(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${ADMIN_API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || 'Could not send your request. Please try again.');
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Uploads a customer reference image to Cloudinary via the backend public
// upload endpoint. Returns the Cloudinary URL string on success.
export async function uploadReferenceImage(file) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${ADMIN_API_URL}/upload/public`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || 'Image upload failed. Please try again.');
    }

    const data = await res.json();
    return data.url;
  } finally {
    clearTimeout(timeoutId);
  }
}
