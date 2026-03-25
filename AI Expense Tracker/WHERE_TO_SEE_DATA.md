# Where to See Your Project's Data

The app uses **MongoDB** as the database (via **Mongoose**). Data is **not** in JSON files anymore unless you still have an old `data/` folder from before migration.

---

## MongoDB Compass (recommended)

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) (or use MongoDB Atlas).
2. Start MongoDB (default: `localhost:27017`).
3. Open **MongoDB Compass** → connect to `mongodb://127.0.0.1:27017`
4. Open database: **`ai-expense-tracker`**
5. Collections:
   - **`users`** — accounts (passwords are hashed)
   - **`expenses`** — expense documents
   - **`incomes`** — income documents (Mongoose pluralizes `Income` → `incomes`)

---

## Connection string

Default (no `.env` file):

```
mongodb://127.0.0.1:27017/ai-expense-tracker
```

Custom: create a `.env` file (see `.env.example`):

```
MONGODB_URI=mongodb://127.0.0.1:27017/ai-expense-tracker
```

---

## Migrating old JSON data

If you previously used `data/users.json`, etc.:

```bash
npm run migrate-json
```

Then verify in Compass and you can archive the `data` folder.

---

## Summary

| Question | Answer |
|----------|--------|
| Where is the database? | MongoDB, database name **`ai-expense-tracker`** |
| How to browse? | **MongoDB Compass** → connect → open collections |
| Old JSON files? | Optional migration with `npm run migrate-json` |
