CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    movie_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    poster_path VARCHAR(255),
    release_date VARCHAR(50),
    overview TEXT,
    UNIQUE (username, movie_id) -- Sprečava duplikate za istog korisnika i film
);
