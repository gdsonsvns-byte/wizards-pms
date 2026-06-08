# Wizards Websites — Agency PMS

Internal Project Management System for Wizards Websites agency.

## Stack
- **Next.js 14** (Static Export)
- **TypeScript**
- **Deployed on Vercel**

## Data
All agency data lives in `/data/*.json`:
- `clients.json` — Client accounts
- `tasks.json` — Tasks & action items
- `seo.json` — SEO activity log
- `domains.json` — Domain/hosting/SSL tracker
- `schedule.json` — Events & meetings

Data is updated automatically via Claude AI in the agency project chat.

## Deployment
Auto-deploys to Vercel on every push to `main`.
