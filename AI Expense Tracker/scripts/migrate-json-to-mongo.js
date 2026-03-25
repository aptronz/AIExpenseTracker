/**
 * One-time migration: data/*.json → MongoDB
 * Run: node scripts/migrate-json-to-mongo.js
 * (Backup your data folder first.)
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function migrate() {
  await connectDB();

  const usersPath = path.join(DATA_DIR, 'users.json');
  const expensesPath = path.join(DATA_DIR, 'expenses.json');
  const incomePath = path.join(DATA_DIR, 'income.json');

  if (!fs.existsSync(usersPath)) {
    console.log('No data/users.json found — nothing to migrate.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8') || '[]');
  const expenses = JSON.parse(
    fs.existsSync(expensesPath) ? fs.readFileSync(expensesPath, 'utf8') : '[]'
  );
  const incomes = JSON.parse(
    fs.existsSync(incomePath) ? fs.readFileSync(incomePath, 'utf8') : '[]'
  );

  const idMap = {}; // old string id -> new ObjectId string

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      idMap[u.id] = existing._id.toString();
      console.log('Skip existing user:', u.email);
      continue;
    }
    const created = await User.create({
      username: u.username,
      email: u.email,
      password: u.password,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
    });
    idMap[u.id] = created._id.toString();
    console.log('Migrated user:', u.email);
  }

  for (const e of expenses) {
    const newUserId = idMap[e.userId];
    if (!newUserId) {
      console.warn('Skip expense (unknown userId):', e.id);
      continue;
    }
    const dup = await Expense.findOne({
      userId: newUserId,
      category: e.category,
      amount: e.amount,
      date: new Date(e.date)
    });
    if (dup) continue;
    await Expense.create({
      userId: newUserId,
      category: e.category || 'Other',
      amount: e.amount,
      description: e.description || '',
      isFixed: !!e.isFixed,
      date: new Date(e.date)
    });
  }
  console.log('Migrated expenses.');

  for (const i of incomes) {
    const newUserId = idMap[i.userId];
    if (!newUserId) {
      console.warn('Skip income (unknown userId):', i.id);
      continue;
    }
    await Income.create({
      userId: newUserId,
      source: i.source,
      amount: i.amount,
      description: i.description || '',
      date: new Date(i.date)
    });
  }
  console.log('Migrated income.');
  console.log('Done. You can archive or remove data/*.json after verifying in MongoDB Compass.');

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
