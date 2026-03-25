# AI Expense Tracker

A full-stack web application for tracking income and expenses with user authentication.

## Features

- 🔐 **User Authentication**: Secure login and registration system
- 💰 **Income Tracking**: Add and manage your income sources
- 💸 **Expense Tracking**: Track your expenses with categories
- 📊 **Fixed Expenses**: Mark recurring expenses as fixed
- 📈 **Dashboard**: View summary of income, expenses, and balance
- 🎨 **Modern UI**: Beautiful and responsive design

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Database**: MongoDB (Mongoose ODM)

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** running locally, **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### Local MongoDB

- Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Start the service (default port **27017**)
- Default app connection: `mongodb://127.0.0.1:27017/ai-expense-tracker`

### Optional: `.env`

Copy `.env.example` to `.env` and set `MONGODB_URI` if you use Atlas or a non-default URL.

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB** (if using local database)

3. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Create Test User (Optional)**
   ```bash
   npm run create-test-user
   ```
   This creates a test account in MongoDB:
   - Email: `test@example.com`
   - Password: `test123`

5. **Migrate old JSON data (Optional)**  
   If you used the app before MongoDB, run once:
   ```bash
   npm run migrate-json
   ```

6. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ai-expense-tracker/
├── server.js              # Express server and API routes
├── config/
│   └── database.js        # MongoDB connection
├── models/                # Mongoose models (User, Expense, Income)
├── scripts/
│   └── migrate-json-to-mongo.js  # Optional JSON → MongoDB migration
├── package.json
├── .env.example           # Sample environment variables
└── public/                # Frontend (HTML, CSS, JS)
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses (requires auth)
- `POST /api/expenses` - Add new expense (requires auth)
- `DELETE /api/expenses/:id` - Delete expense (requires auth)

### Income
- `GET /api/income` - Get all income (requires auth)
- `POST /api/income` - Add new income (requires auth)
- `DELETE /api/income/:id` - Delete income (requires auth)

### Dashboard
- `GET /api/dashboard` - Get summary statistics (requires auth)

## Login Instructions

### First Time Setup

**Option 1: Create Test User (Quick Start)**
```bash
node create-test-user.js
```
Then login with:
- Email: `test@example.com`
- Password: `test123`

**Option 2: Register New Account**
1. Open `http://localhost:3000` in your browser
2. Click the **"Register"** tab
3. Fill in:
   - Username
   - Email (this will be your login email)
   - Password
4. Click **"Register"** - you'll be automatically logged in

### Login Process

1. Open `http://localhost:3000` in your browser
2. Enter your **Email** and **Password**
3. Click **"Login"** button
4. You'll be redirected to the dashboard

**Note:** Your session is saved in the browser, so you'll stay logged in even after closing the browser.

For detailed login information, see [LOGIN_GUIDE.md](./LOGIN_GUIDE.md)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Income**: Click "💰 Add Income" button and fill in the details
3. **Add Expenses**: Click "💸 Add Expense" button, fill details, and mark as fixed if it's a recurring expense
4. **View Summary**: Dashboard shows total income, expenses, fixed expenses, and balance
5. **Manage Records**: Delete income or expenses by clicking the delete button

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- **Important**: Change the `JWT_SECRET` in `server.js` for production use

## Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- Expense categories with icons
- Monthly/yearly reports and charts
- Export data to CSV/PDF
- Budget planning features
- AI-powered expense categorization

## License

ISC
