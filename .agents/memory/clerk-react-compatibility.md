---
name: Clerk React compatibility
description: Non-obvious compatibility constraint when adding Clerk to a React Vite app.
---

When adding Clerk React, align the app's React and React DOM versions with the exact supported peer range from the installed Clerk release, and keep Vite's React deduplication enabled.

**Why:** An unsupported React patch version can pass TypeScript checks but produce an invalid hook call inside ClerkProvider at runtime.

**How to apply:** Check Clerk peer dependency warnings immediately after installation; resolve them before debugging application code or shipping the auth flow.