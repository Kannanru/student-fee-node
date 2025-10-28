# Quick Start: Test Razorpay Payment Integration

## Step 1: Get Razorpay Test Keys (5 minutes)

1. Go to https://dashboard.razorpay.com/signup
2. Sign up with email (or use existing account)
3. Switch to **Test Mode** (toggle at top)
4. Click **Settings** → **API Keys** → **Generate Test Key**
5. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (hidden, click "Show" to copy)

## Step 2: Configure Backend (.env)

Open `backend/.env` and add your keys:

```properties
MONGO_URI=mongodb://localhost:27017/mgdc_fees
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_FROM_DASHBOARD
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_FROM_DASHBOARD
```

**Restart backend server** for changes to take effect.

## Step 3: Configure Frontend (Component)

Open `frontend/src/app/components/fees/fee-collection/fee-collection.component.ts`

Find line ~670 (in `openRazorpayCheckout` method) and replace the key:

```typescript
const options = {
  key: 'rzp_test_YOUR_KEY_ID_FROM_DASHBOARD', // ← Paste your Key ID here
  amount: amount * 100,
  currency: 'INR',
  // ... rest stays the same
};
```

## Step 4: Test Payment

### Start Application
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
ng serve
```

### Test Cash Payment
1. Login as admin
2. Go to **Fees** → **Fee Collection**
3. Search and select a student
4. Select fee structure
5. Check fee heads to pay
6. Choose **"Cash"** payment mode
7. Click **"Submit Payment"**
8. ✅ Should see success message immediately

### Test Online Payment
1. Follow steps 1-4 above
2. Choose **"Online Payment (Razorpay)"** mode
3. Click **"Submit Payment"**
4. 🎉 **Razorpay modal should open**
5. Use test card:
   - **Card Number**: `4111 1111 1111 1111`
   - **CVV**: `123`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **Name**: `Test User`
6. Click **"Pay"**
7. ✅ Should see success message with receipt number

## Expected Results

### Cash Payment Success:
```
✅ Payment successful! Receipt: RCP-20240115-001
Would you like to download the receipt? [Download]
```

### Online Payment Success:
```
🔄 Opening Razorpay payment gateway...
[Razorpay Modal Opens]
✅ Payment successful! Receipt: RCP-20240115-002
Would you like to download the receipt? [Download]
```

## Troubleshooting

### Razorpay modal doesn't open
- **Check browser console** for errors
- Verify Razorpay script is loaded (should see in Network tab)
- Refresh the page

### "Missing RAZORPAY_KEY_ID"
- Check `.env` file has correct keys
- **Restart backend server** after editing .env
- Verify keys are not wrapped in quotes

### Payment succeeds but not recorded
- Check backend terminal for errors
- Verify MongoDB is running
- Check Razorpay dashboard for payment details

## Test Cards Reference

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | 4111 1111 1111 1111 | ✅ Payment successful |
| Failure | 4000 0000 0000 0002 | ❌ Payment failed |
| 3D Secure | 4000 0027 6000 3184 | 🔐 Requires OTP (use 1234) |

**CVV**: Any 3 digits  
**Expiry**: Any future date

## Next Steps

1. ✅ Test both payment modes (Cash and Online)
2. ✅ Download and verify receipt PDF
3. ✅ Check payment history in student records
4. 📝 Read full documentation in `RAZORPAY_INTEGRATION_GUIDE.md`
5. 🚀 Ready for production? Replace test keys with live keys

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check backend terminal logs
3. Verify MongoDB is running (`mongod` service)
4. Review `RAZORPAY_INTEGRATION_GUIDE.md` for detailed troubleshooting

---

**Security Note**: Never commit your `.env` file to Git. Test keys are shown here for demonstration only.
