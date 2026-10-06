# Setup guide

1. Install Node.js 18+ and have a MongoDB database (local or Atlas).
2. `npm run install:all`
3. Copy `server/.env.example` to `server/.env` and set:
   - `MONGO_URI`
   - `JWT_SECRET` (required, 32+ characters). Generate one:
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
4. Copy `client/.env.example` to `client/.env`.
5. `npm run seed` loads sample categories and products.
6. `npm run dev` starts the API (http://localhost:5000) and the site (http://localhost:5173).
7. Email is optional in development: without SMTP settings, verification and password-reset links are printed in the server terminal.
8. Create the owner's admin account: `npm run create-admin -- "Your Name" you@example.com YourPassword1` (run inside `server/`, or `npm run create-admin --prefix server -- ...`).

## Checkout and payments (Phase 4)
- **Cash on delivery** works with no extra setup (on by default).
- **Online payment**: create a free Razorpay account, open Dashboard > Settings > API Keys in **Test mode**, and put the keys in `server/.env`:
  `RAZORPAY_KEY_ID=rzp_test_...` and `RAZORPAY_KEY_SECRET=...`. Restart the server. Without keys the "Pay online" option is hidden.
  Razorpay's test card/UPI details are listed in their docs ("Test Card Details").
- **Webhook (optional)**: the payment is confirmed by the browser even without it. To add it, set a secret in Razorpay (Settings > Webhooks), enable `payment.captured` and `payment.failed`, point it to `https://YOUR-API/api/payments/webhook`, and put the secret in `RAZORPAY_WEBHOOK_SECRET`. Razorpay cannot reach `localhost`; use a tunnel such as ngrok to try it locally.
- **Email verification** is required before ordering. In development you can set `REQUIRE_VERIFIED_EMAIL=false` in `server/.env`.
- Run `npm run seed` again to get the sample coupons `WELCOME10` and `FLAT100`.

## Admin dashboard (Phase 5)
1. **Create the admin account** (once): `npm run create-admin --prefix server -- "Owner Name" owner@example.com StrongPassword1`.
   It works as a normal login. After logging in, an **Admin** button appears in the site header and opens `/admin`. Customers who open `/admin` are sent home, and the server checks the role on every admin request.
2. **Photos need Cloudinary** (free): sign up at cloudinary.com, open the Dashboard, and copy the three values into `server/.env`:
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Restart the server. Without them everything else works, but photo uploads show a clear "not set up yet" message.
3. **Adding a product**: Admin > Products > Add product. Fill in the details, choose photos (the first one is the main photo), and save. Photos can be added, removed or re-ordered later on the product's edit page.
4. **Prices and discounts**: type the price, and a lower discount price if there is an offer. Leave the discount empty for no offer.
5. **Stock**: edit it on the product page, or type a new number straight in the Products list and press Save. Products with options (sizes, carats) keep stock per option.
6. **Orders**: Admin > Orders > open an order > choose the next status. Add courier and tracking number when you mark it Shipped.
7. **Refunds**: after a paid online order is cancelled, or a return is approved, open the order and press **Refund via Razorpay**. For cash-on-delivery orders, pay the customer back yourself and then mark the order Refunded.
8. **Hiding vs deleting**: untick "Visible in the shop" to hide a product but keep it; Delete removes it and its photos for good (past orders keep their own copy of the details).
- Optional settings in `server/.env`: `LOW_STOCK_THRESHOLD` (default 5) and `RETURN_WINDOW_DAYS` (default 7).
