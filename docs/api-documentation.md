# API (Phase 2)

Base URL: `http://localhost:5000/api`

| Method | Route | Purpose |
|---|---|---|
| GET | /health | API + database status |
| GET | /categories | All active categories (sub-categories have `parent`) |
| GET | /products | List products. Query: `search, category (slug), minPrice, maxPrice, rating, inStock, onSale, featured, bestSeller, sort (newest, price_asc, price_desc, popularity, rating), page, limit` |
| GET | /products/suggestions?q= | Up to 6 name matches for the search box |
| GET | /products/:slug | Product detail + parent category + related products |
| POST | /newsletter | `{ email }` |
| POST | /contact | `{ name, email, phone?, message }` |

A parent category slug (e.g. `rudraksh`) also returns its sub-categories' products.
Prices filter on the effective price (discount price when present).

# API (Phase 3)

Login uses an httpOnly cookie named `token` (the browser sends it automatically). Routes marked **login** return 401 without it.

| Method | Route | Auth | Body / notes |
|---|---|---|---|
| POST | /auth/register | - | `name, email, phone?, password` (min 8 chars, letter + number). Sends a verification email |
| POST | /auth/login | - | `email, password`. Max 10 failed tries per 15 min |
| POST | /auth/logout | - | Clears the cookie |
| GET | /auth/me | login | Current user |
| POST | /auth/forgot-password | - | `email`. Same reply whether or not the account exists |
| POST | /auth/reset-password | - | `token, password`. Link valid 1 hour; logs the user in |
| POST | /auth/verify-email | - | `token`. Link valid 24 hours |
| POST | /auth/resend-verification | login | |
| PUT | /users/profile | login | `name, phone` |
| PUT | /users/password | login | `currentPassword, newPassword`. Signs out other devices |
| GET/POST | /users/addresses | login | Up to 10 per user |
| PUT/DELETE | /users/addresses/:id | login | |
| GET | /cart | login | Items, itemCount, subtotal, hasIssues (prices and stock are read fresh every time) |
| POST | /cart/add | login | `productId, variantId?, quantity` |
| PUT | /cart/update | login | `productId, variantId?, quantity` |
| DELETE | /cart/remove/:productId?variantId= | login | |
| GET/POST | /wishlist | login | POST body `{ productId }` |
| DELETE | /wishlist/:productId | login | |

Cart rules: max 10 per line, never more than stock; a product with variants needs a `variantId`; a variant with its own price replaces the product price (no discount applied to it).

# API (Phase 4)

| Method | Route | Auth | Body / notes |
|---|---|---|---|
| GET | /settings/public | - | `codEnabled, onlinePaymentsEnabled, freeShippingAbove, shippingCharge, requireVerifiedEmail` |
| POST | /orders/quote | login | `couponCode?` -> `subtotal, discount, shippingCharge, total, coupon`. Saves nothing |
| POST | /orders | login | `addressId, paymentMethod ('cod' or 'razorpay'), couponCode?`. Takes stock, snapshots items + address |
| GET | /orders/my-orders | login | Your orders, newest first (max 50) |
| GET | /orders/:id | login | One of your orders |
| PATCH | /orders/:id/cancel | login | Only while status is Pending or Confirmed. Returns stock and the coupon use |
| POST | /payments/create-order | login | `orderId`. Creates (or reuses) the Razorpay order for that saved order. Amount is read from the database |
| POST | /payments/verify | login | `orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature`. Signature checked on the server |
| POST | /payments/webhook | Razorpay signature | Raw body, `X-Razorpay-Signature`. Handles `payment.captured` and `payment.failed`. Duplicate events ignored |

## Order flow
1. **Place order** (`POST /orders`): prices and stock are re-read from the database; stock is taken atomically; the order is saved as `Pending`.
2. **Cash on delivery**: the cart is cleared at once. The store confirms the order later from the admin dashboard.
3. **Online**: the browser calls `create-order`, opens Razorpay, then calls `verify`. A valid signature moves the order to `Confirmed` / `paid` and clears the cart. The webhook does the same if the browser never reports back. Whichever arrives first wins; the other does nothing.
4. **Unpaid online orders** are cancelled after 30 minutes (checked every 10 minutes) and their stock and coupon use are returned. If a payment still arrives for a cancelled order, the order is flagged `refundRequired` for the store.

## Money rules
- Shipping: free at or above `FREE_SHIPPING_ABOVE` (default 999), otherwise `SHIPPING_CHARGE` (default 79). Based on the subtotal before the coupon.
- Coupons: percent (optional cap) or fixed amount; minimum order, start and expiry dates, total usage limit, per-user limit. Shipping is never discounted.
- Sample coupons from `npm run seed`: `WELCOME10` (10%, up to Rs. 500, min Rs. 999, once per user) and `FLAT100` (Rs. 100 off, min Rs. 1,500).

# API (Phase 5: admin)

Every route below needs a logged-in **admin** (401 if logged out, 403 for customers). Product, category and banner changes are admin-only too; their public GET routes stay open.

| Method | Route | Notes |
|---|---|---|
| GET | /admin/dashboard | revenue, orders, customers, products, pending orders, low-stock list, recent orders, 30-day sales, orders by status |
| GET | /admin/products | `search, category, status (active/hidden), stock (low/out), page`. Includes hidden products |
| GET | /admin/products/:id | one product (for the edit form) |
| POST | /products | create (JSON). Photos are added afterwards |
| PUT | /products/:id | send only the fields that changed (also used by the quick toggles and stock box) |
| DELETE | /products/:id | also removes its photos from Cloudinary and tidies carts and wishlists. Past orders keep their own copy |
| PATCH | /products/:id/stock | `stock` and/or `variants: [{ _id, stock }]` |
| POST | /products/:id/images | multipart, field `images` (JPG/PNG/WebP, 5 MB each, 8 per product). All or nothing |
| DELETE | /products/:id/images/:imageId | |
| PATCH | /products/:id/images/:imageId/primary | makes it the main photo |
| GET | /admin/categories | includes hidden ones, with product counts |
| POST / PUT / DELETE | /categories, /categories/:id | two levels only. Cannot delete a category that has products or sub-categories |
| GET | /admin/orders | `status, paymentStatus, paymentMethod, q (order number, customer name or email), page` |
| GET | /admin/orders/:id | order + `allowedNext` (the moves the server will accept) + refund info |
| PATCH | /admin/orders/:id/status | `status, note?, courier?, trackingId?, restock?` |
| POST | /admin/orders/:id/refund | `amount?` (empty = everything left). Sends the refund to Razorpay |
| GET | /admin/customers, /admin/customers/:id | customers only, no password data |
| PATCH | /admin/customers/:id/status | `{ isActive }`. A blocked customer is logged out on their next request |
| GET/POST | /admin/coupons | |
| PUT/DELETE | /admin/coupons/:id | a used coupon keeps its code and cannot be deleted (switch it off instead) |
| GET/POST | /admin/banners, PUT/DELETE /admin/banners/:id | multipart (`image` + text fields). Links must be pages on this site |
| GET/PATCH | /admin/settings | `{ codEnabled }` |
| GET | /banners | public: active banners for the home page |
| POST | /orders/:id/return | customer: `{ reason }`, only for Delivered orders inside `RETURN_WINDOW_DAYS` |

## Order status moves (enforced on the server)
```
Pending -> Confirmed | Cancelled          Confirmed -> Processing | Cancelled
Processing -> Shipped | Cancelled         Shipped -> Out for Delivery | Delivered
Out for Delivery -> Delivered             Return Requested -> Returned (approve) | Delivered (decline)
Returned -> Refunded (cash-on-delivery orders only; online orders are refunded with the Refund button)
```
- An online order that is not paid can never be confirmed.
- Delivering a cash-on-delivery order marks it paid (cash collected).
- Cancelling returns stock and the coupon use. If the order was already paid it is flagged, and the dashboard shows the refund owed.
- Refunds: a lock stops a double-click from sending two refunds; partial refunds are allowed; if Razorpay refuses, nothing changes and the message is shown.
