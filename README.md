# Hassan Deep Cleaning Services — Website

Static front-end website (HTML + CSS + JS, no backend, no build step).
All bookings go to WhatsApp **+91 63602 92394** with the customer's details pre-filled.

## Preview
Double-click `index.html`, or run a local server for the most accurate result:

```
python -m http.server 8000
```
then open http://localhost:8000

## Files
```
index.html              the whole page
assets/css/style.css    design / theme (colours are at the top under :root)
assets/js/main.js       menu, videos, gallery, WhatsApp booking form
assets/media/img/       photos (from Instagram)
assets/media/video/     customer reviews + Instagram reels (compressed for web)
assets/media/poster/    video preview images
ig/                     original Instagram downloads (not used by the site)
```

## Change the WhatsApp number
- Booking form: `WHATSAPP_NUMBER` at the top of `assets/js/main.js`
- Buttons/links: search `index.html` for `916360292394` and replace

## Put it online (free)
Upload the folder (everything except `ig/` and the original `WhatsApp Video ... .mp4` files) to any static host:
- **Netlify** — drag and drop the folder at app.netlify.com/drop
- **GitHub Pages**, **Cloudflare Pages**, or any normal web hosting (upload via File Manager)
