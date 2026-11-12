# Personal website (nobuhikoshigyo.github.io)
20241009: Repository created  
20260213: Update affiliation  
20260316: Update CV.pdf  
20261108: Site redesign (no framework; shared assets/css/style.css, new Research page, resized photos in assets/img, Esri map tiles)  

## Structure
- `index.html`, `research.html`, `publications.html`, `contact.html` — the four pages (header/footer markup is repeated in each file)
- `assets/css/style.css` — all styling; colours and fonts are CSS variables at the top of the file
- `assets/js/site.js` — navigation, scroll reveal, contour lines, mycelium canvas, hero slideshow, marquee loops
- `assets/img/` — web-sized photos (long side 1800 px) used by the pages; `images/` keeps the original full-size files
- Research locations are the `sites` array near the bottom of `research.html`
