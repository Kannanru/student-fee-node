# Razorpay Payment Integration - Fee Collection

## Overview
The fee collection component now supports **Cash** and **Online Payment** (via Razorpay) only. Other payment methods (Card, Bank Transfer, Cheque, DD) have been removed for simplicity.

## Payment Workflow

### Cash Payment
1. Select student and fee structure
2. Select fee heads to pay
3. Choose "Cash" payment mode
4. Click "Submit Payment"
5. Payment recorded immediately
6. Receipt generated

### Online Payment (Razorpay)
1. Select student and fee structure
2. Select fee heads to pay
3. Choose "Online Payment (Razorpay)" mode
4. Click "Submit Payment"
5. **Razorpay checkout modal opens**
6. User enters test card details (see test cards below)
7. Payment success → Razorpay returns payment details
8. Backend verifies payment signature
9. Payment recorded in system
10. Receipt generated

## Setup Instructions

### 1. Get Razorpay Test Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Switch to **Test Mode** (toggle in top navigation)
3. Go to **Settings** → **API Keys** → **Generate Test Key**
4. Copy the **Key ID** and **Key Secret**

### 2. Configure Backend

Update `backend/.env` file:

```properties
MONGO_URI=mongodb://localhost:27017/mgdc_fees
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxx
```

### 3. Configure Frontend

Update `frontend/src/app/components/fees/fee-collection/fee-collection.component.ts`:

Find line ~670 and replace `rzp_test_YOUR_KEY_HERE` with your actual Razorpay test key:

```typescript
const options = {
  key: 'rzp_test_xxxxxxxxxxx', // Your Razorpay test key ID
  amount: amount * 100,
  // ... rest of options
};
```

## Test Card Details

Use these test card details in Razorpay test mode:

### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

### Failed Payment
- **Card Number**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Other Test Cards
Visit [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/) for more test scenarios.

## Technical Implementation

### Frontend Changes

**File**: `frontend/src/app/components/fees/fee-collection/fee-collection.component.ts`

1. **Payment Modes Restricted**:
```typescript
paymentModes = [
  { value: 'cash', label: 'Cash', icon: 'payments' },
  { value: 'online', label: 'Online Payment (Razorpay)', icon: 'payment' }
];
```

2. **Payment Flow Modified**:
```typescript
async submitPayment(): Promise<void> {
  // ... validation
  
  const paymentMode = this.paymentForm.value.paymentMode;
  
  if (paymentMode === 'online') {
    this.initiateRazorpayPayment(); // Open Razorpay
    return;
  }
  
  // For cash, proceed directly
  this.submitting.set(true);
  // ... existing submission logic
}
```

3. **Razorpay Methods Added**:
- `initiateRazorpayPayment()`: Creates order and opens checkout
- `openRazorpayCheckout()`: Displays Razorpay modal
- `handleRazorpaySuccess()`: Verifies payment signature
- `completePaymentSubmission()`: Records payment after success

### Backend Changes

**File**: `backend/routes/razorpay.js`

Added new endpoints:
```javascript
POST /api/payments/razorpay/create-order  // Create Razorpay order
POST /api/payments/razorpay/verify-payment // Verify payment signature
```

**File**: `backend/controllers/razorpayController.js`

Updated `createOrder()` to accept orders without `feeId` (for flexible fee collection).

### Service Layer

**File**: `frontend/src/app/services/shared.service.ts`

Added methods:
```typescript
createRazorpayOrder(orderData: any): Observable<any>
verifyRazorpayPayment(verificationData: any): Observable<any>
```

## Payment Data Flow

```
Frontend                    Backend                  Razorpay
   |                           |                         |
   |--1. Create Order--------->|                         |
   |                           |--2. Create Order------->|
   |<--3. Order Details--------|<--Order Details---------|
   |                           |                         |
   |--4. Open Checkout-------->|------------------------>|
   |                           |                         |
   |<--5. Payment Success------|<--Payment Callback------|
   |                           |                         |
   |--6. Verify Payment------->|                         |
   |                           |--7. Verify Signature--->|
   |<--8. Verified-------------|<--Signature OK----------|
   |                           |                         |
   |--9. Submit Payment------->|                         |
   |<--10. Receipt-------------|                         |
```

## API Endpoints

### Create Razorpay Order
```
POST /api/payments/razorpay/create-order
Authorization: Bearer <token>

Request:
{
  "amount": 5000,           // Amount in INR
  "currency": "INR",
  "receipt": "receipt_123", // Optional
  "notes": {                // Optional
    "studentId": "...",
    "studentName": "..."
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "order_xxxxx",
    "amount": 500000,       // Amount in paise
    "currency": "INR",
    "receipt": "receipt_123",
    "status": "created"
  }
}
```

### Verify Razorpay Payment
```
POST /api/payments/razorpay/verify-payment

Request:
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_hash"
}

Response:
{
  "success": true,
  "message": "Signature verified"
}
```

## Testing Checklist

### Cash Payment
- [ ] Select student
- [ ] Select fee structure
- [ ] Select fee heads
- [ ] Choose "Cash" mode
- [ ] Submit payment
- [ ] Verify receipt number displayed
- [ ] Download receipt PDF
- [ ] Check fee heads marked as paid

### Online Payment
- [ ] Select student
- [ ] Select fee structure
- [ ] Select fee heads
- [ ] Choose "Online Payment (Razorpay)" mode
- [ ] Click "Submit Payment"
- [ ] Razorpay modal opens
- [ ] Enter test card: 4111 1111 1111 1111
- [ ] Complete payment
- [ ] Verify success message
- [ ] Verify receipt number
- [ ] Download receipt PDF
- [ ] Check fee heads marked as paid
- [ ] Verify Razorpay payment ID in backend

### Error Scenarios
- [ ] Close Razorpay modal → Shows "Payment cancelled"
- [ ] Use failed test card → Shows error message
- [ ] Backend verification failure → Shows error with payment ID

## Troubleshooting

### "Payment gateway not loaded"
**Cause**: Razorpay script not loaded in browser  
**Solution**: Check browser console, verify `index.html` has Razorpay script tag, refresh page

### "Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET"
**Cause**: Backend .env file missing credentials  
**Solution**: Add Razorpay keys to `.env` file and restart server

### "Payment verification failed"
**Cause**: Invalid signature or network error  
**Solution**: Check backend logs, verify Razorpay secret key is correct

### Payment successful but not recorded
**Cause**: Backend submission failed after Razorpay success  
**Solution**: Check browser console and backend logs, contact support with payment ID shown in error message

## Security Notes

1. **Never commit real credentials**: Use test keys in development
2. **Signature verification**: Always verify on backend (done automatically)
3. **HTTPS required**: Razorpay requires HTTPS in production
4. **Environment variables**: Store credentials in `.env`, never in code
5. **Payment validation**: Backend validates all payment data before recording

## Production Deployment

### Frontend
1. Update Razorpay key in component to production key
2. Better: Move to environment configuration:
   ```typescript
   key: environment.razorpayKey
   ```

### Backend
1. Update `.env` with production credentials
2. Ensure `.env` is in `.gitignore`
3. Set environment variables in production server
4. Enable HTTPS/SSL on server
5. Configure Razorpay webhooks for payment confirmations

## Files Modified

### Frontend
- `frontend/src/app/components/fees/fee-collection/fee-collection.component.ts` - Payment logic
- `frontend/src/app/services/shared.service.ts` - API methods
- `frontend/src/index.html` - Razorpay script

### Backend
- `backend/routes/razorpay.js` - New endpoints
- `backend/controllers/razorpayController.js` - Order creation and verification
- `backend/.env` - Razorpay credentials

## Support Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Integration Checklist](https://razorpay.com/docs/payments/payments/integration-checklist/)
- [Error Codes](https://razorpay.com/docs/api/errors/)

## Changelog

### 2024-01-XX - Initial Integration
- Restricted payment modes to Cash and Online only
- Integrated Razorpay for online payments
- Added test mode configuration
- Implemented payment verification flow
- Updated fee collection component UI
