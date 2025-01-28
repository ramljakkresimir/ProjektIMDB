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

app.post('/comments', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
    }

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded; // Dohvati username iz tokena
        const { movie_id, comment } = req.body;

        if (!movie_id || !comment) {
            return res.status(400).json({ error: 'Morate unijeti ID filma i komentar.' });
        }

        // Dodaj komentar koristeći username
        await db.none(
            `INSERT INTO comments (username, movie_id, comment) 
             VALUES ($1, $2, $3)`,
            [username, movie_id, comment]
        );

        res.status(201).json({ message: 'Komentar uspješno dodan!' });
    } catch (err) {
        console.error('Greška prilikom dodavanja komentara:', err);
        res.status(500).json({ error: 'Došlo je do greške prilikom dodavanja komentara.' });
    }
});

// Endpoint za dohvaćanje komentara za film
app.get('/comments', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let username = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, 'tajni_kljuc');
            username = decoded.username;
        } catch (err) {
            console.error('Neispravan token:', err);
        }
    }

    const { movie_id } = req.query;

    if (!movie_id) {
        return res.status(400).json({ error: 'ID filma je obavezan.' });
    }

    try {
        const comments = await db.any(
            `SELECT c.id, c.comment, c.timestamp, c.username,
       (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS likes,
       CASE WHEN c.username = $2 THEN TRUE ELSE FALSE END AS "isUserComment"
FROM comments c
WHERE c.movie_id = $1
ORDER BY c.timestamp DESC; `,
            [movie_id, username]
        );

        res.status(200).json(comments);
    } catch (err) {
        console.error('Greška prilikom dohvaćanja komentara:', err);
        res.status(500).json({ error: 'Došlo je do greške prilikom dohvaćanja komentara.' });
    }
});


// Endpoint za lajkanje komentara
app.post('/comments/:id/like', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
    }

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded; // Dohvati username iz tokena
        const { id: comment_id } = req.params;

        // Provjera je li korisnik već lajkao komentar
        const existingLike = await db.oneOrNone(
            `SELECT * FROM comment_likes 
             WHERE comment_id = $1 AND username = $2`,
            [comment_id, username]
        );

        if (existingLike) {
            return res.status(400).json({ error: 'Već ste lajkali ovaj komentar.' });
        }

        // Dodaj lajk za komentar
        await db.none(
            `INSERT INTO comment_likes (comment_id, username) 
             VALUES ($1, $2)`,
            [comment_id, username]
        );

        res.status(200).json({ message: 'Komentar uspješno lajkan!' });
    } catch (err) {
        console.error('Greška prilikom lajkanja komentara:', err);
        res.status(500).json({ error: 'Došlo je do greške prilikom lajkanja komentara.' });
    }
});
app.delete('/comments/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
    }

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded; // Dohvati username iz tokena
        const { id: comment_id } = req.params;

        // Provjera je li korisnik autor komentara
        const comment = await db.oneOrNone(
            `SELECT c.id 
             FROM comments c
             WHERE c.id = $1 AND c.username = $2`,
            [comment_id, username]
        );

        if (!comment) {
            return res.status(403).json({ error: 'Nemate pravo brisati ovaj komentar.' });
        }

        // Brisanje komentara iz baze
        await db.none('DELETE FROM comments WHERE id = $1', [comment_id]);

        res.status(200).json({ message: 'Komentar je uspješno obrisan.' });
    } catch (err) {
        console.error('Greška prilikom brisanja komentara:', err);
        res.status(500).json({ error: 'Došlo je do greške prilikom brisanja komentara.' });
    }
});


// Pokretanje servera
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
