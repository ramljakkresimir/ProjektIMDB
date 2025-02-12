const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'userdb',
    user: 'postgres',
    password: 'pikaso', 
});

let watchlist = [];

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

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
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.banned) {
                return res.status(403).json({ error: 'Vaš račun je banovan. Obratite se administratoru.' });
            }
            const token = jwt.sign(
                { username: user.username, email: user.email, role: user.role },
                'tajni_kljuc',
                { expiresIn: '1h' }
            );
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

        const decoded = jwt.verify(token, 'tajni_kljuc');
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [decoded.username]);

        if (user.banned) {
            return res.status(403).json({ error: 'Vaš račun je banovan.' });
        }
        const { username } = decoded;
        const { movie_id, title, poster_path, release_date, overview } = req.body;

        await db.none(
            'INSERT INTO watchlist (username, movie_id, title, poster_path, release_date, overview) VALUES ($1, $2, $3, $4, $5, $6)',
            [username, movie_id, title, poster_path, release_date, overview]
        );
        
        res.status(200).json({ message: 'Film/serija je uspješno dodan/a u Watchlist!' });
    } catch (err) {
        if (err.code === '23505') {
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
        const { username } = decoded;
        const { movie_id, comment } = req.body;

        if (!movie_id || !comment) {
            return res.status(400).json({ error: 'Morate unijeti ID filma i komentar.' });
        }

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
            `SELECT 
                c.id, 
                c.comment, 
                c.timestamp, 
                c.username,
                (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS likes,
                $2 IS NOT NULL AND c.username = $2 AS "isUserComment"
             FROM comments c
             WHERE c.movie_id = $1
             ORDER BY c.timestamp DESC`,
            [movie_id, username] 
        );

        res.status(200).json(comments);
    } catch (err) {
        console.error('Greška prilikom dohvaćanja komentara:', err);
        res.status(500).json({ error: 'Došlo je do greške prilikom dohvaćanja komentara.' });
    }
});

app.post('/comments/:id/like', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
    }

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded; 
        const { id: comment_id } = req.params;

        const existingLike = await db.oneOrNone(
            `SELECT * FROM comment_likes 
             WHERE comment_id = $1 AND username = $2`,
            [comment_id, username]
        );

        if (existingLike) {
            return res.status(400).json({ error: 'Već ste lajkali ovaj komentar.' });
        }

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

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Niste autorizirani. Prijavite se.' });
    }

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Nemate administratorska prava.' });
        }
        next();
    } catch (err) {
        console.error('Greška prilikom provjere tokena:', err);
        res.status(401).json({ error: 'Neispravan token.' });
    }
};
app.get('/admin/comments', isAdmin, async (req, res) => {
    try {
        const comments = await db.any(`
            SELECT c.*, COUNT(cl.comment_id) AS likes 
            FROM comments c
            LEFT JOIN comment_likes cl ON c.id = cl.comment_id
            GROUP BY c.id
            ORDER BY c.timestamp DESC
        `);
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Greška pri dohvatu komentara' });
    }
});
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await db.any('SELECT id, username, email, role, banned FROM users');
        res.status(200).json(users);
    } catch (err) {
        console.error('Greška prilikom dohvaćanja korisnika:', err);
        res.status(500).json({ error: 'Greška prilikom dohvaćanja korisnika.' });
    }
});
app.post('/admin/ban/:username', isAdmin, async (req, res) => {
    const { username } = req.params;

    try {
        await db.none('UPDATE users SET banned = TRUE WHERE username = $1', [username]);
        res.status(200).json({ message: 'Korisnik je uspješno banovan.' });
    } catch (err) {
        console.error('Greška prilikom banovanja korisnika:', err);
        res.status(500).json({ error: 'Greška prilikom banovanja korisnika.' });
    }
});
app.delete('/comments/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Niste autorizirani' });

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { id: commentId } = req.params;

        const comment = await db.oneOrNone('SELECT * FROM comments WHERE id = $1', [commentId]);
        if (!comment) return res.status(404).json({ error: 'Komentar ne postoji' });

        if (decoded.role !== 'admin' && decoded.username !== comment.username) {
            return res.status(403).json({ error: 'Nemate ovlaštenje za brisanje' });
        }

        await db.none('DELETE FROM comments WHERE id = $1', [commentId]);
        res.status(200).json({ message: 'Komentar obrisan' });
    } catch (err) {
        console.error('Greška pri brisanju:', err);
        res.status(500).json({ error: 'Interna server greška' });
    }
});
app.put('/admin/role/:username', isAdmin, async (req, res) => {
    const { username } = req.params;
    const { role } = req.body;

    try {
        await db.none('UPDATE users SET role = $1 WHERE username = $2', [role, username]);
        res.status(200).json({ message: 'Uloga ažurirana' });
    } catch (err) {
        res.status(500).json({ error: 'Greška pri ažuriranju uloge' });
    }
});
app.post('/admin/unban/:username', isAdmin, async (req, res) => {
    const { username } = req.params;

    try {
        await db.none('UPDATE users SET banned = FALSE WHERE username = $1', [username]);
        res.status(200).json({ message: 'Korisnik debanovan' });
    } catch (err) {
        res.status(500).json({ error: 'Greška pri debanovanju' });
    }
});
app.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Niste autorizirani' });

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded;

        const user = await db.oneOrNone('SELECT username, bio FROM users WHERE username = $1', [username]);
        if (!user) return res.status(404).json({ error: 'Korisnik nije pronađen' });

        res.status(200).json(user);
    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ error: 'Interna server greška' });
    }
});
app.post('/update-profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Niste autorizirani' });

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded;
        const { bio } = req.body;

        await db.none('UPDATE users SET bio = $1 WHERE username = $2', [bio, username]);
        res.status(200).json({ message: 'Profil ažuriran' });
    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ error: 'Interna server greška' });
    }
});
app.get('/user-comments', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Niste autorizirani' });

    try {
        const decoded = jwt.verify(token, 'tajni_kljuc');
        const { username } = decoded;

        const comments = await db.any('SELECT * FROM comments WHERE username = $1 ORDER BY timestamp DESC', [username]);
        res.status(200).json(comments);
    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ error: 'Interna server greška' });
    }
});
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
