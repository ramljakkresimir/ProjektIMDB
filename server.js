const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const jwt = require('jsonwebtoken');


app.use(express.json()); // Za rukovanje JSON tijelima
app.use(express.static(path.join(__dirname, 'public'))); // Posluži statičke datoteke

const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'userdb',
    user: 'postgres', // Zamijenite sa svojim korisničkim imenom
    password: 'pikaso', // Zamijenite sa svojom lozinkom
});

let watchlist = []; // Jednostavna pohrana za Watchlist

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Hashiraj lozinku
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Ubaci korisnika u bazu
      await db.none(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        [username, email, hashedPassword]
      );
  
      res.status(201).json({ message: 'Korisnik uspješno registriran!' });
    } catch (err) {
      if (err.code === '23505') {
        res.status(400).json({ error: 'Korisničko ime ili email već postoji.' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Greška prilikom registracije.' });
      }
    }
});
  

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

        if (user && (await bcrypt.compare(password, user.password))) {
            // Generiraj JWT
            const token = jwt.sign({ username: user.username, email: user.email }, 'tajni_kljuc', { expiresIn: '1h' });
            
            res.status(200).json({ message: 'Prijava uspješna!', token });
        } else {
            res.status(401).json({ error: 'Neispravno korisničko ime ili lozinka.' });
        }
    } catch (err) {
        console.error('Greška prilikom prijave:', err);
        res.status(500).json({ error: 'Greška prilikom prijave.' });
    }
});

app.post('/watchlist', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
        }

        const decoded = jwt.verify(token, 'tajni_kljuc'); // Koristite vaš tajni ključ
        const { username } = decoded; // Dohvatite korisničko ime iz tokena
        const { movie_id, title, poster_path, release_date, overview } = req.body;

        // Dodajte film u Watchlist
        await db.none(
            'INSERT INTO watchlist (username, movie_id, title, poster_path, release_date, overview) VALUES ($1, $2, $3, $4, $5, $6)',
            [username, movie_id, title, poster_path, release_date, overview]
        );
        
        res.status(200).json({ message: 'Film/serija je uspješno dodan/a u Watchlist!' });
    } catch (err) {
        if (err.code === '23505') { // Greška za duplikat
            res.status(400).json({ error: 'Ovaj film/serija je već u Watchlist-u!' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Došlo je do greške.' });
        }
    }
});
app.get('/watchlist', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
        }

        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded;

        // Dohvati sve filmove iz Watchlist-a korisnika
        const movies = await db.any('SELECT * FROM watchlist WHERE username = $1', [username]);

        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Došlo je do greške prilikom dohvaćanja Watchlist-a.' });
    }
});
app.delete('/watchlist/:movie_id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
        }

        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded;
        const { movie_id } = req.params;

        // Ukloni film iz Watchlist-a korisnika
        await db.none('DELETE FROM watchlist WHERE username = $1 AND movie_id = $2', [username, movie_id]);

        res.status(200).json({ message: 'Film/serija je uspješno uklonjen/a iz Watchlist-a!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Došlo je do greške prilikom uklanjanja filma.' });
    }
});


// Pokretanje servera
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
