require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const aiService = require('./ai-service');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/** Plain objects for AI helpers (expects date ISO string) */
function expenseDocsToPlain(docs) {
  return docs.map((e) => ({
    id: e._id ? e._id.toString() : e.id,
    userId: e.userId ? e.userId.toString() : e.userId,
    category: e.category,
    amount: e.amount,
    description: e.description || '',
    isFixed: !!e.isFixed,
    date: e.date instanceof Date ? e.date.toISOString() : e.date
  }));
}

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
    res.json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET);
    res.json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user expenses
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses.map((e) => e.toJSON()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add expense
app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { category, amount, description, isFixed } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    let finalCategory = category;
    if (!finalCategory && description) {
      finalCategory = aiService.categorizeExpense(description, amount);
    }

    let finalIsFixed = isFixed;
    if (!finalIsFixed && description) {
      finalIsFixed = aiService.detectFixedExpense(finalCategory, description);
    }

    const expense = await Expense.create({
      userId: req.user.id,
      category: finalCategory || 'Other',
      amount: parseFloat(amount),
      description: description || '',
      isFixed: !!finalIsFixed,
      date: new Date()
    });

    res.json(expense.toJSON());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const result = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user income
app.get('/api/income', authenticateToken, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(income.map((i) => i.toJSON()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add income
app.post('/api/income', authenticateToken, async (req, res) => {
  try {
    const { source, amount, description } = req.body;

    if (!source || !amount) {
      return res.status(400).json({ error: 'Source and amount are required' });
    }

    const income = await Income.create({
      userId: req.user.id,
      source: source.trim(),
      amount: parseFloat(amount),
      description: description || '',
      date: new Date()
    });

    res.json(income.toJSON());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete income
app.delete('/api/income/:id', authenticateToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Income not found' });
    }

    const result = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!result) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const [expenseDocs, incomeDocs] = await Promise.all([
      Expense.find({ userId: req.user.id }).lean(),
      Income.find({ userId: req.user.id }).lean()
    ]);

    const userExpenses = expenseDocsToPlain(expenseDocs);
    const userIncome = incomeDocs.map((i) => ({
      amount: i.amount,
      date: i.date instanceof Date ? i.date.toISOString() : i.date
    }));

    const totalIncome = incomeDocs.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenseDocs.reduce((sum, e) => sum + e.amount, 0);
    const fixedExpenses = expenseDocs
      .filter((e) => e.isFixed)
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const insights = aiService.generateSpendingInsights(userExpenses);
    const prediction = aiService.predictNextMonthExpenses(userExpenses);
    const savingsTips = aiService.generateSavingsTips({
      expenses: userExpenses,
      totalIncome,
      totalExpenses,
      balance,
      fixedExpensesAmount: fixedExpenses,
      prediction,
      insights
    });

    const incomeForSavings = incomeDocs.map((i) => ({
      amount: i.amount,
      date: i.date instanceof Date ? i.date.toISOString() : i.date
    }));
    const { averageMonthlySavings, monthsCounted } = aiService.computeAverageMonthlySavings(
      incomeForSavings,
      userExpenses
    );
    const investmentPlan = aiService.generateInvestmentSuggestions({
      averageMonthlySavings,
      monthsCounted,
      totalIncome,
      totalExpenses,
      balance
    });

    res.json({
      totalIncome,
      totalExpenses,
      fixedExpenses,
      balance,
      expenseCount: userExpenses.length,
      incomeCount: userIncome.length,
      insights: insights.insights,
      topCategory: insights.topCategory,
      prediction,
      savingsTips,
      investmentProfile: {
        averageMonthlySavings: investmentPlan.averageMonthlySavings,
        monthsAnalyzed: investmentPlan.monthsCounted,
        tips: investmentPlan.tips
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/ai/suggest-category', authenticateToken, (req, res) => {
  try {
    const { description, amount } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const suggestedCategory = aiService.categorizeExpense(description, amount);
    const isFixed = aiService.detectFixedExpense(suggestedCategory, description);

    res.json({
      category: suggestedCategory,
      isFixed,
      confidence: 'high'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
