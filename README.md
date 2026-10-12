# FraudGuard: Fraud Detection Dashboard

A full-stack web app where fraud analysts review payment transactions, see which ones a rule-based risk engine flagged and **why**, and investigate them as cases with notes and an audit trail.

> **Demo project.** All data is generated or comes from a public simulated dataset. No real payments, customers, or card numbers are used.


## Features

- **Risk engine:** 7 fraud rules score every transaction from 0 to 100 and record which rules fired
- **Explainable scores:** the detail page lists each triggered rule in plain English
- **Dashboard:** summary cards, a 30-day trend chart, and a chart of the most triggered rules
- **Transactions:** filter by risk level, search by transaction or customer ID, paginate
- **Case management:** open a case from a transaction, add notes, set a status (open, under review, fraud, legit)
- **Audit trail:** every case action is recorded with who did it and when
- **Authentication:** signup, login, and delete account, with JWT and bcrypt-hashed passwords
- **Roles:** analysts review data; admins can also upload CSV files and create other admins
- **UI:** responsive layout (phone to desktop) with a light and dark theme


## How it works

```
Seed script or CSV  ->  Risk engine  ->  MongoDB  ->  Express API  ->  React app
                        (7 rules)                      (JWT auth)      (analyst UI)
```

1. Transactions are generated, imported, or uploaded.
2. The risk engine checks each one against the customer's earlier history and stores the score, level, and fired rules.
3. An analyst logs in, reviews flagged transactions, and opens cases for suspicious ones.
4. Each case keeps notes and a full audit trail.

## The seven fraud rules

| Rule | Fires when | Points |
|---|---|---|
| `HIGH_AMOUNT` | Amount is more than 3x the customer's average | 25 |
| `VELOCITY` | 4 or more earlier transactions within 10 minutes | 30 |
| `LOCATION_MISMATCH` | Country differs from the customer's usual country | 20 |
| `REPEATED_FAILURES` | A success right after 3 failed attempts | 25 |
| `NEW_DEVICE` | Device never seen for this customer | 15 |
| `ODD_HOURS` | Between 1 AM and 4 AM (UTC) | 10 |
| `HIGH_RISK_MERCHANT` | Gift cards, crypto, or wire transfer | 15 |

Points add up to a maximum of 100. A score of **70 or more is high risk**, **40 to 69 is medium**, and **below 40 is low**. Each rule is a separate function in `server/riskEngine/rules.js`, so adding a rule is a few lines.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Recharts, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Atlas), Mongoose |
| Auth and security | JWT, bcrypt, Zod, Helmet, express-rate-limit, express-mongo-sanitize, CORS |
| Testing | Jest, Supertest |

## Getting started

### Prerequisites

- Node.js 20 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (you do not need to install MongoDB locally)

In Atlas, create a database user, and under **Network Access** allow your IP address.

### 1. Clone and install

```bash
git clone https://github.com/AyushKu22/fraud-dashboard.git
cd fraud-dashboard

cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@YOUR-CLUSTER.mongodb.net/frauddb?retryWrites=true&w=majority
JWT_SECRET=a-long-random-string
JWT_EXPIRES=1d
CLIENT_URL=http://localhost:5173
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Configure the client

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Load the demo data

```bash
cd server
npm run seed
```

This creates the demo users and about 10,000 generated transactions with injected fraud patterns. **It deletes existing users, transactions, and cases first.** The admin password is printed once in the terminal.

### 5. Run it

In two terminals:

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Open <http://localhost:5173>.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Analyst | `analyst@demo.com` | `Analyst@12345` |

You can also create your own account on the signup page. Public signups are always analysts.

## Optional: use a public dataset

You can load a public simulated dataset instead of generated data. Download a fraud transactions CSV such as the Kaggle "Credit Card Transactions Fraud Detection Dataset" (check its license on the dataset page), put it at `server/data/fraudTrain.csv`, then run:

```bash
cd server
npm run import:real
```

The importer replaces card numbers with hashed customer IDs, keeps only the last 4 digits, and prints precision and recall against the dataset's fraud labels. The dataset is not included in this repository and is excluded by `.gitignore`.

## Scripts

| Command (in `server/`) | Does |
|---|---|
| `npm run dev` | Starts the API with auto-restart |
| `npm start` | Starts the API |
| `npm run seed` | Resets and loads demo users and transactions |
| `npm run import:real` | Imports a public dataset CSV |
| `npm test` | Runs the Jest tests |

| Command (in `client/`) | Does |
|---|---|
| `npm run dev` | Starts the dev server |
| `npm run build` | Builds for production |

## API overview

All routes except `/health`, `/api/auth/signup`, and `/api/auth/login` need `Authorization: Bearer <token>`.

| Method and path | Access | Does |
|---|---|---|
| `GET /health` | Public | Health check |
| `POST /api/auth/signup` | Public | Create an analyst account |
| `POST /api/auth/login` | Public | Log in and receive a token |
| `GET /api/auth/me` | Logged in | Current user |
| `DELETE /api/auth/me` | Logged in | Delete your own account (password required) |
| `POST /api/auth/register` | Admin | Create a user with any role |
| `GET /api/transactions` | Logged in | List with filters, search, and pagination |
| `GET /api/transactions/:id` | Logged in | One transaction |
| `POST /api/transactions/upload` | Admin | Import a CSV, scored on upload |
| `GET /api/analytics/summary` | Logged in | Dashboard totals |
| `GET /api/analytics/trends` | Logged in | Flagged transactions per day |
| `GET /api/analytics/rules` | Logged in | How often each rule fired |
| `GET /api/cases` | Logged in | List cases, optional `?status=` |
| `POST /api/cases` | Logged in | Open a case from a transaction |
| `GET /api/cases/:id` | Logged in | One case with notes and audit trail |
| `PATCH /api/cases/:id` | Logged in | Change status |
| `POST /api/cases/:id/notes` | Logged in | Add a note |

## Security

- Passwords are hashed with bcrypt and never returned by the API
- Login failures give the same message for a wrong email or a wrong password
- Roles are checked on the server, and public signup cannot create admins
- Every request body is validated with Zod
- Rate limits on login, signup, and account deletion
- Helmet security headers, a restricted CORS origin, and NoSQL injection protection
- Only the last 4 card digits are stored

**Known trade-offs:** the login token is stored in `localStorage` (simple, but exposed to XSS; httpOnly cookies with refresh tokens would be the production choice), rate limits are in memory, and there is no email verification or password reset yet.

## Tests

```bash
cd server
npm test
```

Covers the risk rules (scoring and thresholds), protected routes rejecting anonymous requests, input validation, and security headers. The tests do not touch the database.

## Project structure

```
fraud-dashboard/
├── server/
│   ├── app.js, server.js
│   ├── config/         database connection
│   ├── models/         User, Transaction, Case
│   ├── middleware/     auth, error handler
│   ├── controllers/    auth, transactions, analytics, cases
│   ├── routes/
│   ├── riskEngine/     rules.js, index.js
│   ├── utils/          seed, data generator, importer
│   └── tests/
└── client/
    ├── public/         logo and favicon
    └── src/
        ├── pages/      Login, Signup, Dashboard, Transactions, TransactionDetail, Cases, CaseDetail, Account
        ├── components/ ProtectedRoute, RiskBadge, StatusBadge, ThemeToggle, DemoBanner
        ├── context/    AuthContext
        ├── services/   API client
        └── utils/
```

## Limitations and next steps

- The rules were written for the generated data, so on a public dataset they catch only part of the fraud. Tuning thresholds and categories against labeled data is the natural next step.
- Planned upgrades: httpOnly cookie auth, password reset and email verification, Redis caching for dashboard statistics, Docker, CI with GitHub Actions, and a machine learning model alongside the rules.
- Scaling path: stateless API behind a load balancer, MongoDB replica set and sharding, and a message queue so scoring runs in worker services.

## Data credit

If you use a public dataset, credit it here with its name, source link, and license.

## License

Released under the MIT License. See [LICENSE](LICENSE).

Copyright (c) 2026 Ayush Kumar Maravi.

## Author

**Ayush Kumar Maravi**, Bengaluru, India
GitHub: [AyushKu22](https://github.com/AyushKu22) | Email: ayushkumar08373@gmail.com
