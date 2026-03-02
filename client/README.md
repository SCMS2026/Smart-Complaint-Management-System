# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

## Additional Project Notes

### Google Authentication

This application supports Google Sign-In on the client side using Google's
Identity Services library. To enable it, add a `.env` file to the `client`
directory with:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

The ID must match a credential created in the Google Cloud Console. The
`VITE_` prefix is required for Vite to expose the variable to the browser.

When the user clicks the Google login button on the `/login` page, the
library provides an ID token, which the client sends to the server
(`POST /auth/google`). The server verifies the token with Google's API,
ensures a corresponding user record exists in the database, and then
returns a JWT that the client stores under `localStorage.user_token`.

A fallback redirect-based flow using `/auth/google` and `/auth/google/callback`
is still available for environments where the JS button can't load.
