# How to Register - AI Expense Tracker

## Step-by-Step Registration Guide

### Prerequisites
1. Make sure the server is running:
   ```bash
   npm start
   ```
2. Open your browser and go to: `http://localhost:3000`

### Registration Steps

#### Step 1: Access the Registration Form
- When you open the application, you'll see a login/register page
- Click on the **"Register"** tab at the top of the form
- The Register tab will be highlighted in purple (indicating it's active)

#### Step 2: Fill in Your Information

You need to provide three pieces of information:

1. **Username** 📝
   - Enter your desired username
   - Example: "JohnDoe", "JaneSmith", "MyUsername"
   - This will be displayed in the dashboard

2. **Email** 📧
   - Enter your email address
   - Example: "user@example.com"
   - **Important**: This email will be used for login
   - Must be a valid email format

3. **Password** 🔒
   - Create a secure password
   - Choose a strong password (recommended: at least 8 characters)
   - This password will be encrypted and stored securely

#### Step 3: Submit Registration
- Click the **"Register"** button at the bottom of the form
- The button has a purple gradient background

#### Step 4: Automatic Login
- After successful registration, you'll be **automatically logged in**
- You'll be redirected to the dashboard
- Your username will appear in the top-right corner

## Visual Guide

```
┌─────────────────────────────────┐
│  💰 AI Expense Tracker          │
├─────────────────────────────────┤
│  [Login] [Register] ← Click here │
├─────────────────────────────────┤
│  Username: [____________]       │
│  Email:    [____________]       │
│  Password: [____________]        │
│                                 │
│  [    Register Button    ]      │
└─────────────────────────────────┘
```

## Example Registration

**Username:** `JohnDoe`  
**Email:** `john.doe@email.com`  
**Password:** `SecurePass123!`

## What Happens After Registration?

✅ Your account is created  
✅ You're automatically logged in  
✅ You can start tracking expenses immediately  
✅ Your data is saved securely  

## Troubleshooting

### "User already exists" Error
- This email is already registered
- Try logging in instead, or use a different email address

### Form Validation Errors
- **Username**: Required field, cannot be empty
- **Email**: Must be a valid email format (e.g., user@example.com)
- **Password**: Required field, cannot be empty

### Server Not Running
- Make sure you've started the server with `npm start`
- Check that the server is running on `http://localhost:3000`

## Security Notes

- ✅ Passwords are securely hashed (never stored in plain text)
- ✅ Your email is used for authentication
- ✅ All data is stored locally in JSON files
- ✅ JWT tokens are used for secure sessions

## Quick Start Alternative

If you want to test the app quickly without registering:

1. Run the test user creation script:
   ```bash
   npm run create-test-user
   ```

2. Login with:
   - **Email:** `test@example.com`
   - **Password:** `test123`

---

**Ready to register?** Follow the steps above and start tracking your expenses! 💰
