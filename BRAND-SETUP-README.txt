RIWAAYAT-E-SOHAN - SHOP BY BRAND UPDATE

Added Shop by Brand: Al-Khair, Rewari, Hafiz.
Homepage, header, sidebar and new brand pages now link to supplier collections.

IMPORTANT: All 43 existing products have "brand": null because supplier assignments were not supplied. They remain visible in Shop All, and brand pages will show a coming-soon message until mapped.

To assign a product, open assests/json/products.json and change its brand field to exactly one of:
"al-khair"
"rewari"
"hafiz"

If the same sweet comes from more than one supplier, create separate product records with UNIQUE id values and supplier-specific image and price. Do not duplicate ids.

Product image paths remain unchanged. Cart, order API, admin, and private data remain untouched.

Run npm start and open http://localhost:3000/brands.html
