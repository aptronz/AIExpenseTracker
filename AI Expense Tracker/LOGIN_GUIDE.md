# Login Guide - AI Expense Tracker

## How to Login

### First Time Users

Since this is a new application, you need to **register first** before you can login.

#### Step 1: Register a New Account

1. Open the application in your browser (http://localhost:3000)
2. Click on the **"Register"** tab
3. Fill in the registration form:
   - **Username**: Choose a unique username
   - **Email**: Enter your email address (this will be your login email)
   - **Password**: Create a secure password
4. Click **"Register"** button
5. You will be automatically logged in after successful registration

#### Step 2: Login (For Returning Users)

1. Open the application in your browser (http://localhost:3000)
2. Make sure the **"Login"** tab is selected (it's selected by default)
3. Enter your credentials:
   - **Email**: The email you used during registration
   - **Password**: Your account password
4. Click **"Login"** button
5. You will be redirected to the dashboard

### Login Details

**Login Requirements:**
- Valid email address (must match the one used during registration)
- Correct password (case-sensitive)

**What Happens After Login:**
- You'll be redirected to the dashboard
- Your username will be displayed in the header
- You can start tracking your income and expenses
- Your session will be saved (you'll stay logged in even after closing the browser)

### Test Credentials

If you've run the `create-test-user.js` script, you can use these credentials:

```
Email: test@example.com
Password: test123
```

### Troubleshooting

**"Invalid credentials" error:**
- Make sure you're using the correct email address
- Check that your password is correct (passwords are case-sensitive)
- Ensure you've registered an account first

**"User already exists" error (during registration):**
- This email is already registered
- Try logging in instead, or use a different email

**Can't access the application:**
- Make sure the server is running (`npm start`)
- Check that you're accessing `http://localhost:3000`
- Verify your browser console for any errors

### Security Features

- Passwords are securely hashed using bcrypt
- JWT tokens are used for authentication
- Sessions are stored in browser localStorage
- All API requests require authentication tokens

### Logout

To logout:
1. Click the **"Logout"** button in the top-right corner of the dashboard
2. You'll be redirected back to the login page
3. Your session will be cleared

### Password Requirements

Currently, there are no strict password requirements, but for security:
- Use at least 8 characters
- Include a mix of letters, numbers, and special characters
- Don't use easily guessable passwords

---

**Note:** All user data is stored locally in JSON files in the `data/` folder. Make sure to backup this folder if you want to preserve user accounts and data.
