# Plan: Spotify music for the girls (request from Max, 2026-11-12) — PARKED by Max (2026-11-12): do not build until he answers the questions below

**Request:** the girls can listen to music on the tablet through Max's Spotify account. He logs in once as the parent. Each kid has her own music area. **Design (updated 2026-11-12):** one playlist per kid, named exactly **"Hazel"** and **"Violet"** in Max's Spotify (he adds songs to them in Spotify). Hazel's area plays "Hazel", Violet's plays "Violet". Simple, kid-friendly screen.

## Approach (from memory; Spotify docs could not be read from the sandbox, verify first)
- The app is a web app (PWA in Chrome), so Spotify's Android SDKs do not apply.
- **Option B (preferred): remote control.** The app finds the playlist named after the kid via the Web API and tells the **Spotify Android app on the tablet** to play it (Connect). Needs Premium, the Spotify app installed and logged in on the tablet. Audio continues while our app stays pinned.
- **Option A: Web Playback SDK** (the app itself is the player). Needs Premium and a recent Chrome with Widevine; the tablet's Chrome (older than 88) probably cannot do it.
- Login: Authorization Code with PKCE in the Grown-up area (no server), Client ID from a free Spotify developer app, redirect `https://max-clouatre.github.io/hazelwood-os/`. Tokens stay in that tablet's localStorage.
- Match playlists by exact name (case-insensitive) among the account's playlists; folders are not needed.
- Parental limits: the app's play-time limit and break screen pause Spotify (best effort); explicit filter lives on the Spotify account.
- Rule exception: the app is offline/private by design. This is an **opt-in online feature**, Grown-up switch, off by default, nothing from Spotify loads until it is switched on (D-28 when built).
- Testing: build against a mock Spotify; real login and playback can only be verified on the tablet.

## Waiting for Max
1. Spotify app installable on the tablet? Premium? 2. Allow `developer.spotify.com` in the environment network so docs can be verified. 3. Client ID (public) from a Spotify developer app. 4. Confirm option B.
