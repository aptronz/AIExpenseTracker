let income = 0;
let expense = 0;
let fixedExpense = 0;
let history = [];

function updateUI(){
  document.getElementById("totalIncome").innerText = "Rs " + income;
  document.getElementById("totalExpense").innerText = "Rs " + expense;
  document.getElementById("fixedExpense").innerText = "Rs " + fixedExpense;

  let balance = income - (expense + fixedExpense);
  document.getElementById("balance").innerText = "Rs " + balance;
}

function addIncome(){
  let amount = prompt("Enter income amount:");
  if(!amount) return;

  income += Number(amount);
  history.push("💰 Income +Rs " + amount);
  renderHistory();
  updateUI();
}

function addExpense(){
  let amount = prompt("Enter expense amount:");
  if(!amount) return;

  expense += Number(amount);
  history.push("💸 Expense -Rs " + amount);
  renderHistory();
  updateUI();
}

function addFixedExpense(){
  let amount = prompt("Enter FIXED expense (Rent, Subscriptions):");
  if(!amount) return;

  fixedExpense += Number(amount);
  history.push("📌 Fixed Expense -Rs " + amount);
  renderHistory();
  updateUI();
}

function renderHistory(){
  const list = document.getElementById("historyList");
  list.innerHTML="";

  history.forEach(item=>{
    let li=document.createElement("li");
    li.innerText=item;
    list.appendChild(li);
  });
}
