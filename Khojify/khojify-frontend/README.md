# KHOJIFY – Smart Campus Lost & Found (frontend)

React + TypeScript + Vite + Tailwind + Lucide. Palette: beige / brown / caramel.

    npm install
    cp .env.example .env
    npm run dev

## Demo mode vs your FastAPI backend
`VITE_USE_DEMO=true` (default) runs `src/services/demoData.ts`, a browser-side stand-in that mirrors the backend contract.
Set `VITE_USE_DEMO=false` and `VITE_API_URL` to call your server instead. Every call is in `src/services/api.ts`.

Endpoints the backend must provide (existing ones kept, new ones marked *):
- POST /reports/lost, POST /reports/found, GET /reports, GET /matches/{id}, PATCH /reports/{id}/reunited, GET /analytics (add per-location `locations`)
- *GET /matches/search?q=  (free-text smart search)   *GET /matches/preview   *POST /uploads (multipart -> {url})
- *GET /notifications, GET /notifications/unread-count, PATCH /notifications/{id}/read, PATCH /notifications/read-all
- *POST /claims (server generates KHOJ-xxxxx), GET /claims -> {mine,toReview}, PATCH /claims/{id}/review {action: approve|reject|more_info, note}

The matching algorithm (synonyms, 30/20/15/15/10/10 weights, breakdown, labels) is in `demoData.ts` (`scorePair`).
Port it to Python as the real implementation; the frontend only displays the score the API returns.
Claim review, role checks and approval MUST be enforced by the backend (token via `khojify_token`).
Demo sign-in is NOT secure authentication and the demo moderator toggle is for testing only.
