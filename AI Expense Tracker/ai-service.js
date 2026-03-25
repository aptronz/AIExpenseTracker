/**
 * AI Service for Expense Tracker
 * Provides intelligent expense categorization and suggestions
 */

// Category keywords mapping for rule-based AI categorization
const CATEGORY_KEYWORDS = {
  'Food & Dining': ['restaurant', 'food', 'cafe', 'coffee', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast', 'grocery', 'supermarket', 'market', 'eat', 'meal', 'snack', 'delivery', 'takeout'],
  'Transportation': ['uber', 'taxi', 'bus', 'train', 'metro', 'subway', 'gas', 'fuel', 'petrol', 'parking', 'ticket', 'flight', 'airline', 'car', 'vehicle', 'transport', 'ride'],
  'Shopping': ['store', 'shop', 'mall', 'amazon', 'online', 'purchase', 'buy', 'clothing', 'clothes', 'shoes', 'electronics', 'gadget'],
  'Bills & Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'mobile', 'utility', 'bill', 'payment', 'subscription', 'netflix', 'spotify'],
  'Entertainment': ['movie', 'cinema', 'theater', 'concert', 'game', 'gaming', 'streaming', 'entertainment', 'fun', 'activity'],
  'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health', 'clinic', 'dentist', 'prescription'],
  'Education': ['school', 'tuition', 'course', 'book', 'education', 'learning', 'university', 'college'],
  'Rent & Housing': ['rent', 'apartment', 'house', 'mortgage', 'housing', 'home', 'lease'],
  'Personal Care': ['haircut', 'salon', 'spa', 'beauty', 'gym', 'fitness', 'personal'],
  'Travel': ['hotel', 'travel', 'vacation', 'trip', 'booking', 'accommodation'],
  'Other': [] // Default category
};

/**
 * AI-powered expense categorization
 * Analyzes description and amount to suggest the best category
 */
function categorizeExpense(description, amount) {
  if (!description || description.trim() === '') {
    return 'Other';
  }

  const desc = description.toLowerCase();
  let bestMatch = { category: 'Other', score: 0 };

  // Score each category based on keyword matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    
    // Check for keyword matches
    keywords.forEach(keyword => {
      if (desc.includes(keyword)) {
        score += 1;
      }
    });

    // Boost score for exact matches
    if (keywords.some(keyword => desc === keyword || desc.startsWith(keyword + ' ') || desc.endsWith(' ' + keyword))) {
      score += 2;
    }

    if (score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }

  return bestMatch.category;
}

/**
 * Smart suggestions based on spending patterns
 * Analyzes user's expense history to provide insights
 */
function generateSpendingInsights(expenses) {
  if (!expenses || expenses.length === 0) {
    return {
      totalExpenses: 0,
      topCategory: null,
      averageExpense: 0,
      insights: ['Start tracking expenses to get personalized insights!']
    };
  }

  // Calculate category totals
  const categoryTotals = {};
  let totalAmount = 0;

  expenses.forEach(expense => {
    const category = expense.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    totalAmount += expense.amount;
  });

  // Find top spending category
  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0];

  const averageExpense = totalAmount / expenses.length;

  // Generate insights
  const insights = [];
  
  if (topCategory) {
    const percentage = ((topCategory[1] / totalAmount) * 100).toFixed(1);
    insights.push(`You spend most on ${topCategory[0]} (${percentage}% of total expenses)`);
  }

  if (averageExpense > 100) {
    insights.push(`Your average expense is Rs ${averageExpense.toFixed(2)} - consider reviewing larger purchases`);
  }

  const fixedExpenses = expenses.filter(e => e.isFixed).length;
  if (fixedExpenses > 0) {
    insights.push(`You have ${fixedExpenses} fixed/recurring expenses`);
  }

  return {
    totalExpenses: expenses.length,
    topCategory: topCategory ? topCategory[0] : null,
    topCategoryAmount: topCategory ? topCategory[1] : 0,
    averageExpense,
    insights
  };
}

/**
 * Actionable "where to save money" tips based on spending patterns
 */
function generateSavingsTips({
  expenses,
  totalIncome,
  totalExpenses,
  balance,
  fixedExpensesAmount,
  prediction,
  insights
}) {
  const tips = [];

  if (!expenses || expenses.length === 0) {
    tips.push('Start logging expenses — we’ll show personalised savings ideas once we see your spending patterns.');
    return tips;
  }

  const topCat = insights.topCategory || '';
  const topAmt = insights.topCategoryAmount || 0;
  const sharePct = totalExpenses > 0 ? (topAmt / totalExpenses) * 100 : 0;
  const cat = topCat.toLowerCase();

  // Biggest category → targeted advice
  if (sharePct >= 25 && topCat) {
    if (cat.includes('food') || cat.includes('dining') || cat.includes('grocery')) {
      tips.push(`**Food:** You spend a large share on "${topCat}". Cook more at home, limit food delivery, and set a weekly dining-out cap to cut this category.`);
    } else if (cat.includes('transport')) {
      tips.push(`**Transport:** "${topCat}" is a major cost. Use buses/metro where possible, batch errands, and review cab vs public transport for regular routes.`);
    } else if (cat.includes('shopping')) {
      tips.push(`**Shopping:** "${topCat}" stands out. Wait 24 hours before non-essential buys and track wants vs needs to reduce impulse spending.`);
    } else if (cat.includes('bill') || cat.includes('utilit') || cat.includes('subscription')) {
      tips.push(`**Bills & utilities:** Review "${topCat}" — compare internet/mobile plans, cancel unused subscriptions, and check for duplicate streaming services.`);
    } else if (cat.includes('entertain')) {
      tips.push(`**Entertainment:** "${topCat}" adds up. Share family plans, use free events, or swap one paid outing a month for a low-cost alternative.`);
    } else if (cat.includes('travel')) {
      tips.push(`**Travel:** "${topCat}" is significant. Book early, use fare alerts, and mix budget stays with splurge nights to stretch your travel budget.`);
    } else if (cat.includes('rent') || cat.includes('hous')) {
      tips.push(`**Housing:** "${topCat}" is fixed for many — still worth reviewing roommates, refinancing talk with bank, or energy-saving habits to lower related costs.`);
    } else {
      tips.push(`**Focus area:** Most spending is in "${topCat}" (${sharePct.toFixed(0)}% of expenses). Review that category first for cuts or cheaper alternatives.`);
    }
  }

  // Income vs expenses
  if (totalIncome > 0 && totalExpenses > 0) {
    const spendRate = (totalExpenses / totalIncome) * 100;
    if (spendRate > 100) {
      tips.push('**Alert:** Spending exceeds income. Pause non-essential expenses and list fixed costs to see what can be reduced or deferred.');
    } else if (spendRate > 85) {
      tips.push(`**Savings rate:** You’re using about ${spendRate.toFixed(0)}% of income. Aim to keep spending under ~80% and automate a small transfer to savings on payday.`);
    } else if (spendRate < 60 && balance > 0) {
      tips.push('**Good habit:** You’re spending well below income. Consider increasing emergency fund or investments with the surplus.');
    }
  }

  if (balance < 0) {
    tips.push('**Balance:** Expenses beat income in your tracker. Prioritise essentials, delay large purchases, and add income sources if possible.');
  }

  // Fixed / recurring
  const fixedCount = expenses.filter(e => e.isFixed).length;
  if (fixedCount >= 3 && fixedExpensesAmount > 0) {
    tips.push(`**Recurring:** You have ${fixedCount} fixed expenses (Rs ${fixedExpensesAmount.toFixed(2)} total). Audit each — gym, apps, memberships — and cancel what you don’t use.`);
  }

  // Average ticket size
  if (insights.averageExpense > 500) {
    tips.push(`**Large transactions:** Average expense is Rs ${insights.averageExpense.toFixed(2)}. Split big buys into planned monthly amounts or compare 2–3 quotes before paying.`);
  }

  // Prediction
  if (prediction && prediction.predictedTotal > 0 && totalIncome > 0) {
    if (prediction.predictedTotal > totalIncome * 0.95) {
      tips.push(`**Forecast:** Next month’s spending may reach ~Rs ${prediction.predictedTotal.toFixed(2)}. That’s tight vs income — plan cuts in your top category now.`);
    } else {
      tips.push(`**Forecast:** Estimated next month ~Rs ${prediction.predictedTotal.toFixed(2)}. If that feels high, trim variable spending in "${topCat || 'your top category'}".`);
    }
  }

  // Generic if still few tips
  if (tips.length < 2) {
    tips.push('**General:** Track every expense for a month, then set a simple weekly limit for “fun” spending — small limits compound into real savings.');
  }

  return tips;
}

/**
 * Detect if expense might be a fixed/recurring expense
 * Based on category and description patterns
 */
function detectFixedExpense(category, description) {
  const fixedKeywords = ['rent', 'mortgage', 'subscription', 'monthly', 'bill', 'utility', 'insurance', 'phone', 'internet'];
  const desc = (description || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Check if category suggests fixed expense
  const fixedCategories = ['rent & housing', 'bills & utilities'];
  if (fixedCategories.some(fc => cat.includes(fc))) {
    return true;
  }

  // Check description for fixed expense keywords
  return fixedKeywords.some(keyword => desc.includes(keyword));
}

/**
 * Predict next month's expenses based on historical data
 */
function predictNextMonthExpenses(expenses) {
  if (!expenses || expenses.length === 0) {
    return { predictedTotal: 0, confidence: 'low' };
  }

  // Calculate average monthly spending
  const monthlyTotals = {};
  const now = new Date();
  
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }
    monthlyTotals[monthKey] += expense.amount;
  });

  const monthlyValues = Object.values(monthlyTotals);
  const averageMonthly = monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;

  // Calculate fixed expenses
  const fixedTotal = expenses
    .filter(e => e.isFixed)
    .reduce((sum, e) => sum + e.amount, 0);

  const predictedTotal = averageMonthly + fixedTotal;
  const confidence = expenses.length > 10 ? 'high' : expenses.length > 5 ? 'medium' : 'low';

  return {
    predictedTotal: Math.round(predictedTotal * 100) / 100,
    confidence,
    fixedExpenses: fixedTotal,
    variableExpenses: averageMonthly - fixedTotal
  };
}

/**
 * Average monthly savings from dated income & expense records (per calendar month).
 */
function computeAverageMonthlySavings(incomeRecords, expenseRecords) {
  const monthlyIncome = {};
  const monthlyExpense = {};

  (incomeRecords || []).forEach((i) => {
    const d = new Date(i.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyIncome[key] = (monthlyIncome[key] || 0) + Number(i.amount);
  });

  (expenseRecords || []).forEach((e) => {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyExpense[key] = (monthlyExpense[key] || 0) + Number(e.amount);
  });

  const allKeys = new Set([
    ...Object.keys(monthlyIncome),
    ...Object.keys(monthlyExpense)
  ]);

  if (allKeys.size === 0) {
    return { averageMonthlySavings: 0, monthsCounted: 0 };
  }

  let sumSavings = 0;
  allKeys.forEach((key) => {
    sumSavings += (monthlyIncome[key] || 0) - (monthlyExpense[key] || 0);
  });

  return {
    averageMonthlySavings: Math.round((sumSavings / allKeys.size) * 100) / 100,
    monthsCounted: allKeys.size
  };
}

/**
 * Educational investment ideas (India-focused: SIP, MF, etc.) from avg savings — not financial advice.
 */
function generateInvestmentSuggestions({
  averageMonthlySavings,
  monthsCounted,
  totalIncome,
  totalExpenses,
  balance
}) {
  const tips = [];
  const disclaimer =
    '**Disclaimer:** Ideas for learning only — not financial advice. Check SEBI-registered advisors and your risk profile before investing.';

  if (!totalIncome || totalIncome <= 0) {
    tips.push('**Income:** Add your income entries so we can estimate savings and suggest how much you might invest each month.');
    tips.push(disclaimer);
    return { tips, averageMonthlySavings: 0, monthsCounted: monthsCounted || 0 };
  }

  const avg = averageMonthlySavings;

  if (avg < 0) {
    tips.push(
      `**Priority:** On average you’re spending about Rs ${Math.abs(avg).toFixed(2)} more than you earn per month (across ${monthsCounted} month(s) in your data). Focus on an **emergency buffer** and **high-interest debt** before SIPs or mutual funds.`
    );
    tips.push(
      '**When stable:** Start with a small **recurring deposit (RD)** or **liquid mutual fund** only after monthly cash flow turns positive.'
    );
    tips.push(disclaimer);
    return { tips, averageMonthlySavings: avg, monthsCounted };
  }

  if (avg === 0 && monthsCounted === 0) {
    tips.push(
      '**Track longer:** Log income and expenses across at least one full month to see your **average monthly savings** and get SIP / mutual fund suggestions.'
    );
    tips.push(disclaimer);
    return { tips, averageMonthlySavings: 0, monthsCounted: 0 };
  }

  if (avg === 0 && monthsCounted > 0) {
    tips.push(
      '**Break-even:** On average your income matches spending each month in the data you logged. If you still hold cash, you could start a small **SIP (from Rs 500)** or **recurring deposit** with any surplus.'
    );
    tips.push(
      '**Next step:** Try to free **Rs 500–2,000/month** via one category cut — that’s enough to begin a disciplined **mutual fund SIP**.'
    );
    tips.push(disclaimer);
    return { tips, averageMonthlySavings: 0, monthsCounted };
  }

  // Rough “investable” slice: suggest putting part of avg savings, not 100%
  const sipStarter = Math.max(500, Math.round(avg * 0.15));
  const sipModerate = Math.round(avg * 0.25);
  const sipComfort = Math.round(avg * 0.35);

  tips.push(
    `**Your trend:** About **Rs ${avg.toFixed(2)} per month** saved on average (${monthsCounted} month(s) in your data). Current overall balance in tracker: **Rs ${balance.toFixed(2)}**.`
  );

  if (avg < 2000) {
    tips.push(
      `**Small steps:** Even **Rs ${sipStarter.toFixed(0)}–${Math.min(2000, Math.round(avg * 0.5)).toFixed(0)} per month** in a **SIP** (e.g. index or large-cap mutual fund) builds habit. Many AMCs allow SIPs from **Rs 500**.`
    );
    tips.push(
      '**Safety first:** Keep **1–2 months of expenses** in a **savings account** or **liquid mutual fund** before locking money in equity MFs.'
    );
  } else if (avg < 10000) {
    tips.push(
      `**SIP:** Consider **Rs ${sipModerate.toFixed(0)}–${sipComfort.toFixed(0)} per month** split across **2 funds** — e.g. one **large-cap/index** and one **flexi-cap** — via registered platforms (AMC / MF distributor / RIA).`
    );
    tips.push(
      '**Tax saving:** If you use Section 80C, explore **ELSS** (tax-saving mutual fund) with a **3-year lock-in** — still market-linked risk.'
    );
    tips.push(
      '**Fixed income:** Part of savings can go to **PPF**, **EPF (via employer)**, or **short-duration debt funds** for lower volatility than pure equity.'
    );
  } else if (avg < 50000) {
    tips.push(
      `**Scale SIPs:** With ~Rs ${avg.toFixed(0)} per month surplus, you could plan **Rs ${sipComfort.toFixed(0)}+** in SIPs and still add **debt** (debt MFs, FD ladders) for balance.`
    );
    tips.push(
      '**Goals:** Use separate SIPs or buckets for **emergency (liquid MF)** vs **long-term goals (equity MFs)**. Review once or twice a year, not daily.'
    );
    tips.push(
      '**NPS / retirement:** If it fits your tax and lock-in needs, **NPS** adds a disciplined retirement layer (mixed equity + debt, long horizon).'
    );
  } else {
    tips.push(
      `**Higher surplus (~Rs ${avg.toFixed(0)} per month):** Build a written **asset mix** (equity MF / debt / gold / real estate as suits you) with a **SEBI-registered investment adviser** or certified planner.`
    );
    tips.push(
      '**SIP + lumpsum:** Continue **SIPs** for discipline; use **STP** (systematic transfer) from debt to equity for large amounts instead of timing the market.'
    );
    tips.push(
      '**Direct equity** only if you can research or delegate; most salaried investors do well with **mutual funds** and low costs.'
    );
  }

  if (balance > avg * 3 && avg > 0) {
    tips.push(
      `**Idle cash:** You show **Rs ${balance.toFixed(2)}** in surplus vs expenses logged — if that’s real cash, consider moving **excess** above your emergency fund into **short-duration debt MF** or **FD** until you deploy into long-term SIPs.`
    );
  }

  tips.push(
    '**SIP basics:** Same amount every month → **rupee cost averaging**. Longer horizon (5+ years) suits **equity**; shorter goals → **debt** or **hybrid** funds.'
  );
  tips.push(disclaimer);

  return { tips, averageMonthlySavings: avg, monthsCounted };
}

module.exports = {
  categorizeExpense,
  generateSpendingInsights,
  generateSavingsTips,
  generateInvestmentSuggestions,
  computeAverageMonthlySavings,
  detectFixedExpense,
  predictNextMonthExpenses
};
