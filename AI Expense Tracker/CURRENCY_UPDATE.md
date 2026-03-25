# Currency Update: Dollars ($) to Rupees (Rs)

## Changes Made

The application currency has been updated from **US Dollars ($)** to **Indian Rupees (Rs)** throughout the application.

### Files Updated:

1. **public/index.html**
   - Changed all default currency displays from `$0.00` to `Rs 0.00`
   - Updated form labels from "Amount ($)" to "Amount (Rs)"

2. **public/app.js**
   - Updated currency formatting in `updateSummary()` function
   - Changed expense display from `-$XX.XX` to `-Rs XX.XX`
   - Changed income display from `+$XX.XX` to `+Rs XX.XX`

3. **ai-service.js**
   - Updated AI insights to show Rupees instead of Dollars

4. **Documentation Files**
   - Updated examples in `HOW_AI_IS_USED.md`
   - All currency references now use Rs

## What Changed:

### Before:
- `$100.00`
- `Amount ($)`
- `-$50.00`
- `+$200.00`

### After:
- `Rs 100.00`
- `Amount (Rs)`
- `-Rs 50.00`
- `+Rs 200.00`

## Display Format:

All amounts are now displayed as:
- **Income**: `Rs 1,000.00`
- **Expenses**: `-Rs 500.00`
- **Balance**: `Rs 500.00`

## Notes:

- The currency symbol appears **before** the amount (Rs 100.00)
- Decimal places remain at 2 digits (.00)
- All calculations remain the same, only the display format changed
- No database migration needed - existing amounts will display in Rs

---

**Currency**: Indian Rupees (Rs)  
**Format**: Rs XXX.XX  
**Updated**: All currency displays throughout the application
