const moviesContainer = document.getElementById('movies-container');

// Prikazivanje stranice o određenom filmu klikom na film
document.addEventListener('DOMContentLoaded', () => {
    const moviesGrid = document.getElementById('movies-grid');
    const movieDetails = document.getElementById('movie-details');
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewForm = document.getElementById('review-form');

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        // Dohvati podatke o filmu s backend-a
        fetch(`/api/movie/${movieId}`)
            .then(response => response.json())
            .then(data => {
                if (movieDetails) {
                    movieDetails.innerHTML = `
                        <div class="movie-header">
                            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
                            <div>
                                <h1>${data.title}</h1>
                                <p>${data.overview}</p>
                                <p><strong>Ocjena:</strong> ${data.vote_average}</p>
                                <p><strong>Žanr:</strong> ${data.genres.map(genre => genre.name).join(', ')}</p>
                                <p><strong>Datum izlaska:</strong> ${data.release_date}</p>
                                <button id="add-to-watchlist" class="btn btn-warning mt-3">Dodaj na popis za gledanje</button>
                            </div>
                        </div>
                    `;
                    const addToWatchlistButton = document.getElementById('add-to-watchlist');
                    addToWatchlistButton.addEventListener('click', () => {
                        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
                        if (!watchlist.includes(movieId)) {
                            watchlist.push(movieId);
                            localStorage.setItem('watchlist', JSON.stringify(watchlist));
                            alert('Film je dodan na popis za gledanje!');
                        } else {
                            alert('Film je već na popisu za gledanje!');
                        }
                    });
                }
            })
            .catch(error => console.error('Error fetching movie details:', error));
    }

    // Dohvati trendove filmova
    fetch('/api/trending/movies')
        .then(response => response.json())
        .then(data => {
            moviesData = data.results.slice(0, 10);
            updateMoviesToShow();
            loadMovies();
        })
        .catch(error => console.error('Error fetching trending movies:', error));
});

// Prikazivanje TV serija
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/trending/tv')
        .then(response => response.json())
        .then(data => {
            const tvSeriesContainer = document.getElementById('tv-series-container');
            tvSeriesContainer.innerHTML = data.results.map(series => `
                <div class="tv-series-card">
                    <img src="https://image.tmdb.org/t/p/w500${series.poster_path}" alt="${series.name}">
                    <h3>${series.name}</h3>
                    <p>Ocjena: ${series.vote_average}</p>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error fetching TV series:', error));
});
