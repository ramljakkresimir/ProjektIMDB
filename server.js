const express = require('express');
const app = express();
const path = require('path');

app.use(express.json()); // Za rukovanje JSON tijelima
app.use(express.static(path.join(__dirname, 'public'))); // Posluži statičke datoteke

let watchlist = []; // Jednostavna pohrana za Watchlist

// Pokretanje servera
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
