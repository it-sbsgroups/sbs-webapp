// Shared image upload helper → POST /uploads/image (Cloudinary, WebP).
// Returns the hosted image URL to store on a record (slide, client logo, etc.).

function apiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }
  return 'http://localhost:4000/api';
}

export async function uploadImage(file, folder = 'misc') {
  const form = new FormData();
  form.append('file', file);
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('sbs_auth_token') : null;

  const res = await fetch(
    `${apiBase()}/uploads/image?folder=${encodeURIComponent(folder)}`,
    {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Image upload failed');
  }
  const data = await res.json();
  return data.url; // also exposes { bytes, width, height }
}

export default uploadImage;
