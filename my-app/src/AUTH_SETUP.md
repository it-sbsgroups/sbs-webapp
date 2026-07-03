# Admin Panel Authentication — Setup Notes

This document explains the authentication system added to protect `/admin/*`.

## 1. Install required packages

```bash
npm install jose bcryptjs
```

- `jose` — signs/verifies the session JWT. Works in both Node (API routes) and Edge (middleware).
- `bcryptjs` — verifies the admin password hash. Pure JS, no native build step.

## 2. Set your JWT secret

1. Copy `.env.local.example` to `.env.local`.
2. Generate a strong random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
3. Paste it as the value of `JWT_SECRET` in `.env.local`.
4. Make sure `.env.local` is in `.gitignore` (Next.js adds this by default).

## 3. Dummy login credentials (for now)

Stored (as a bcrypt hash) in `data/users.js`:

- **Email:** `admin@sbsgroups.co.in`
- **Password:** `SbsAdmin@2026`

🔒 Change this password before going live — generate a new hash with:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourNewPassword', 10))"
```
and paste the result into `data/users.js`.

## 4. How it works

- `middleware.js` — runs on every request to `/admin/*` and `/login`. Checks for a valid
  session cookie. No valid cookie + `/admin/*` → redirect to `/login`. Valid cookie +
  `/login` → redirect to `/admin/dashboard`. **This is the real security boundary.**
- `app/api/auth/login/route.js` — checks email/password against `data/users.js`,
  issues a signed JWT in an `httpOnly` cookie (`sbs_admin_session`).
- `app/api/auth/logout/route.js` — clears the cookie.
- `app/api/auth/me/route.js` — returns the logged-in user's (sanitized) profile, used by
  the admin UI to show the name/initials and to power the logout button.
- `context/AuthContext.jsx` — client-side React context (`useAuth()`) exposing
  `{ user, loading, logout }` to anything inside `/admin`.
- `lib/auth.js` — JWT sign/verify helpers.
- `lib/userRepository.js` — the ONLY file that knows where user data lives. Currently
  reads `data/users.js`. This is where you'll plug in the NestJS API later.

## 5. Migrating to the NestJS API later

You only need to change **`lib/userRepository.js`**:

```js
export async function findUserByEmail(email) {
  const res = await fetch(`${process.env.API_BASE_URL}/admin-users/by-email?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  return res.json();
}
```

Everything else — middleware, cookies, JWT signing/verification, the login page,
`AuthContext` — stays exactly the same, because they all depend on this abstraction,
not on `data/users.js` directly.

## 6. Removed: `/secure-onboarding`

The public page `app/(public)/secure-onboarding/page.js` was **removed**. It was
publicly accessible (no real auth), used a hardcoded OTP (`123456`), and didn't
actually save anything — it only logged to the browser console. Anyone who found
that URL could "unlock" the form. If you want a real "executive self-update profile
link" feature later, build it as:

- A server-generated, single-use, expiring token (random UUID stored server-side
  with an expiry timestamp).
- A route that validates the token server-side (not a hardcoded OTP).
- Marks the token as used after one successful submission.

The admin page `app/(admin)/admin/about-onboarding/page.js` (which generated links
to `/secure-onboarding`) is still there — it's now safely behind `/admin` login, but
it's still just a UI mockup (console.log, no real token storage). Treat it as a
placeholder until the real flow above is built.
