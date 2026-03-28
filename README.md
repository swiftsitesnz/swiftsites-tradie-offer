# SwiftSites Tradie Offer — Landing Page

Facebook ad landing page for the "Tradie Website in 48 Hours — $299 flat" campaign.

## Stack

- Static HTML + embedded CSS/JS (zero build step)
- Vercel serverless function (`/api/contact`) for form submissions
- Resend SDK for transactional email

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in [vercel.com](https://vercel.com).
3. Add the environment variable:
   - `RESEND_API_KEY` — your Resend API key (get one at [resend.com](https://resend.com))
4. Deploy. Done.

## Local development

```bash
npm install
npx vercel dev
```

## Environment variables

| Variable         | Required | Description          |
| ---------------- | -------- | -------------------- |
| `RESEND_API_KEY`  | Yes      | Resend API key       |
