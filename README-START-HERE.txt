RIWAAYAT-E-SOHAN — AUTOMATIC WEBSITE ORDER SUBMISSION

WHAT IT DOES
Customer fills checkout and clicks Place Order. The order is saved to private-data/orders.json on the server. Admin can see orders at /admin.html. No WhatsApp app, prefilled link or customer Send step required.

IMPORTANT: THIS DOES NOT AUTOMATICALLY SEND A WHATSAPP MESSAGE OR PHONE NOTIFICATION. For that you need an approved WhatsApp Business Platform/API integration, or a separate authorized notification provider. The server must be deployed and running for real customer orders.

LOCAL SETUP (WINDOWS / VS CODE)
1. Install Node.js 18+ from nodejs.org.
2. Open this project folder in VS Code.
3. In PowerShell terminal enter:
   $env:ADMIN_KEY="choose-a-long-random-private-secret"
   node server.js
4. Open http://localhost:3000 (NOT Live Server 5500).
5. Test an order of at least 2 KG.
6. Open http://localhost:3000/admin.html, enter your ADMIN_KEY, click View Orders.
7. Orders persist in private-data/orders.json. BACK UP THIS FOLDER SECURELY.

SECURITY / PRODUCTION
Use HTTPS and reliable Node.js hosting with persistent disk, backups, firewall, and secret ADMIN_KEY environment variable. Do not upload private-data to public hosting. This is a small-business starter; before public launch add spam protection, proper admin login/session authentication, privacy notice, data retention/deletion procedures and monitoring. Do not host as static-only HTML/Live Server: the API will not work.

PAYMENTS
No COD. TCS cost and final payable amount confirmed manually. Payment is NOT collected or verified automatically. Product prices are provisional pending supplier confirmation.

PRODUCT FILES
Product JSON: assests/json/products.json (the spelling assests matches this bundled version). Replace placeholders with licensed images later.
