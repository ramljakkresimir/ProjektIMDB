const apiKey = '83e3c9dd3e6c9629df9e8f2c03312a72';
const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
const moviesContainer = document.getElementById('movies-container');


//Prkazivanje stranice o odredjenom filmu klikom na film
document.addEventListener('DOMContentLoaded', () => {
    const moviesGrid = document.getElementById('movies-grid');
    const movieDetails = document.getElementById('movie-details');
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewForm = document.getElementById('review-form');

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        // Dohvati podatke o filmu
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=hr`)
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

        function loadReviews() {
            const reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
            if (reviewsContainer) {
                reviewsContainer.innerHTML = reviews.map(review => `<p>${review}</p>`).join('');
            }
        }

        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const reviewText = document.getElementById('review-text').value;

                const reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
                reviews.push(reviewText);
                localStorage.setItem(`reviews-${movieId}`, JSON.stringify(reviews));

                loadReviews();
                reviewForm.reset();
            });
        }

        loadReviews();
        
    }
});



//Prkazivanje stranice o odredjenoj seriji klikom na seriju
document.addEventListener('DOMContentLoaded', () => {
    const seriesGrid = document.getElementById('series-grid');
    const seriesDetails = document.getElementById('series-details');
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewForm = document.getElementById('review-form');

    const urlParams = new URLSearchParams(window.location.search);
    const seriesId = urlParams.get('id');

    if (seriesId) {
        // Dohvati podatke o seriji
        fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}&language=hr`)
            .then(response => response.json())
            .then(data => {
                if (seriesDetails) {
                    seriesDetails.innerHTML = `
                        <div class="series-header">
                            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.name}">
                            <div>
                                <h1>${data.name}</h1>
                                <p>${data.overview}</p>
                                <p><strong>Ocjena:</strong> ${data.vote_average}</p>
                                <p><strong>Žanr:</strong> ${data.genres.map(genre => genre.name).join(', ')}</p>
                                <p><strong>Datum prve epizode:</strong> ${data.first_air_date}</p>
                                <button id="add-to-watchlist" class="btn btn-warning mt-3">Dodaj na popis za gledanje</button>
                            </div>
                        </div>
                    `;
                    const addToWatchlistButton = document.getElementById('add-to-watchlist');
                    addToWatchlistButton.addEventListener('click', () => {
                        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

                        if (!watchlist.includes(seriesId)) {
                            watchlist.push(seriesId);
                            localStorage.setItem('watchlist', JSON.stringify(watchlist));
                            alert('Serija je dodana na popis za gledanje!');
                        } else {
                            alert('Serija je već na popisu za gledanje!');
                        }
                    });
                }
            })
            .catch(error => console.error('Error fetching series details:', error));

        function loadReviews() {
            const reviews = JSON.parse(localStorage.getItem(`reviews-${seriesId}`)) || [];
            if (reviewsContainer) {
                reviewsContainer.innerHTML = reviews.map(review => `<p>${review}</p>`).join('');
            }
        }

        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const reviewText = document.getElementById('review-text').value;

                const reviews = JSON.parse(localStorage.getItem(`reviews-${seriesId}`)) || [];
                reviews.push(reviewText);
                localStorage.setItem(`reviews-${seriesId}`, JSON.stringify(reviews));

                loadReviews();
                reviewForm.reset();
            });
        }

        loadReviews();
    }
});


//Prkazivanje stranice o glumcu klikom na sliku glumca
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const actorId = urlParams.get('id');
    const actorDetails = document.getElementById('actor-details');
    const popularMoviesContainer = document.getElementById('popular-movies');
    const filmographyTable = document.querySelector('#filmography tbody');

    if (actorId) {
        // Dohvati osnovne informacije o glumcu
        fetch(`https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}&language=hr`)
            .then(response => response.json())
            .then(actor => {
                document.getElementById('actor-photo').src = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
                document.getElementById('actor-name').textContent = actor.name;
                document.getElementById('actor-biography').textContent = actor.biography || 'Nema dostupnih informacija.';
                document.getElementById('actor-department').textContent = actor.known_for_department;
                document.getElementById('actor-birthday').textContent = actor.birthday || 'Nepoznato';
                document.getElementById('actor-place').textContent = actor.place_of_birth || 'Nepoznato';
                document.getElementById('actor-popularity').textContent = actor.popularity.toFixed(1);
            });

        // Dohvati popularne uloge
        fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}&language=hr`)
            .then(response => response.json())
            .then(credits => {
                credits.cast.slice(0, 6).forEach(movie => {
                    const img = document.createElement('img');
                    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                    img.alt = movie.title;
                    img.title = movie.title;
                    popularMoviesContainer.appendChild(img);
                });

                // Filmografija
                credits.cast.forEach(movie => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${movie.release_date ? movie.release_date.split('-')[0] : 'Nepoznato'}</td>
                        <td>${movie.title}</td>
                        <td>${movie.character || 'Nepoznato'}</td>
                    `;
                    filmographyTable.appendChild(row);
                });
            });
    }
});


//GLUMCI
let actorsData = [];
let actorsStartIndex = 0;
let actorsToShow = 5;
const actorsContainer = document.getElementById("actors-container");

function updateActorsToShow() {
    if (window.innerWidth <= 768) {
        actorsToShow = 3; 
    } else if (window.innerWidth <= 1024) {
        actorsToShow = 5; 
    } else {
        actorsToShow = 7; 
    }
}
function loadActors() {
    actorsContainer.innerHTML = '';
    for (let i = 0; i < actorsToShow; i++) {
        const actorIndex = (actorsStartIndex + i) % actorsData.length;
        const actor = actorsData[actorIndex];

        const name = actor.name;
        const profilePath = actor.profile_path;
        const popularity = actor.popularity.toFixed(1);
        const fullProfileUrl = profilePath
            ? `https://image.tmdb.org/t/p/w500${profilePath}`
            : 'slike/default-profile.png';

        const actorCard = document.createElement('div');
        actorCard.classList.add('actor-card');

        // Slika glumca
        const imgElement = document.createElement('img');
        imgElement.src = fullProfileUrl;
        imgElement.alt = name;

        // Preusmjeravanje klikom na sliku
        imgElement.addEventListener('click', () => {
            window.location.href = `actor.html?id=${actor.id}`;
        });

        actorCard.appendChild(imgElement);

        const actorInfo = document.createElement('div');
        actorInfo.classList.add('actor-info');

        // Ime glumca
        const nameElement = document.createElement('h3');
        nameElement.classList.add('actor-name');
        nameElement.textContent = name;

        // Preusmjeravanje klikom na ime
        nameElement.addEventListener('click', () => {
            window.location.href = `actor.html?id=${actor.id}`;
        });

        actorInfo.appendChild(nameElement);

        actorCard.appendChild(actorInfo);
        actorsContainer.appendChild(actorCard);
    }
}
function leftArrowActors() {
    actorsStartIndex = (actorsStartIndex - actorsToShow + actorsData.length) % actorsData.length;
    loadActors();
}
function rightArrowActors() {
    actorsStartIndex = (actorsStartIndex + actorsToShow) % actorsData.length;
    loadActors();
}
window.addEventListener('resize', () => {
    updateActorsToShow();
    loadActors();
});
// Dohvacanje gluamca
fetch(`https://api.themoviedb.org/3/person/popular?api_key=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        actorsData = data.results.slice(0, 20);
        updateActorsToShow();
        loadActors();
    })
    .catch(error => console.error('Error fetching popular actors:', error));



//registracija
document.addEventListener('DOMContentLoaded', () => {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.style.display = 'none';
        loginBox.style.display = 'block';
    });
});



//Top 10 najpopularnijih filmova ovaj tjedan
let moviesData = [];
let startIndex = 0;
let moviesToShow = 7; 
function updateMoviesToShow() {
    if (window.innerWidth <= 768) {
        moviesToShow = 3; 
    } else if (window.innerWidth <= 1024) {
        moviesToShow = 5; 
    } else {
        moviesToShow = 7; 
    }
}
function loadMovies() {
    moviesContainer.innerHTML = '';

    const endIndex = Math.min(startIndex + moviesToShow, 10);
    moviesData.slice(startIndex, endIndex).forEach((movie, index) => {
        const title = movie.title;
        const posterPath = movie.poster_path;
        const rating = movie.vote_average;
        const fullPosterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.setAttribute('data-movie-id', movie.id);

        const imgElement = document.createElement('img');
        imgElement.src = fullPosterUrl;
        imgElement.alt = title;
        
        movieCard.appendChild(imgElement);

        const movieInfo = document.createElement('div');
        movieInfo.classList.add('movie-info');

        const titleElement = document.createElement('h3');
        titleElement.classList.add('movie-title');
        titleElement.textContent = `${startIndex + index + 1}. ${title}`;
        movieInfo.appendChild(titleElement);

        const ratingElement = document.createElement('div');
        ratingElement.classList.add('movie-rating');
        ratingElement.innerHTML = `<i class="fas fa-star"></i> ${rating}`;
        movieInfo.appendChild(ratingElement);

        movieCard.appendChild(movieInfo);

        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons');

        const watchlistButton = document.createElement('button');
        watchlistButton.textContent = '+ Watchlist';
        watchlistButton.addEventListener('click', (event) => {
            event.stopPropagation();
            addToWatchlist(movie); 
        });

        actionButtons.appendChild(watchlistButton);
        movieCard.appendChild(actionButtons);

        // klik na film -> film.html
        movieCard.addEventListener('click', () => {
            window.location.href = `film.html?id=${movie.id}`;
        });

        moviesContainer.appendChild(movieCard);
    });
}
function leftArrow() {
    startIndex = Math.max(0, startIndex - moviesToShow);
    loadMovies();
}
function rightArrow() {
    startIndex = Math.min(10 - moviesToShow, startIndex + moviesToShow); 
    loadMovies();
}
window.addEventListener('resize', () => {
    updateMoviesToShow();
    loadMovies();
});
fetch(url)
    .then(response => response.json())
    .then(data => {
        moviesData = data.results.slice(0, 10);
        updateMoviesToShow();
        loadMovies();
    })
    .catch(error => console.error('Error fetching trending movies:', error));



//Istraži nove TV serije   
let seriesData = [];
let seriesStartIndex = 0;
let seriesToShow = 5;
const tvSeriesContainer = document.getElementById("tv-series-container");

function updateSeriesToShow() {
    if (window.innerWidth <= 768) {
        seriesToShow = 2;
    } else if (window.innerWidth <= 1024) {
        seriesToShow = 4;
    } else {
        seriesToShow = 7;
    }
}
function loadSeries() {
    tvSeriesContainer.innerHTML = '';

    for (let i = 0; i < seriesToShow; i++) {
        const seriesIndex = (seriesStartIndex + i) % seriesData.length;
        const series = seriesData[seriesIndex];
        const title = series.name;
        const posterPath = series.poster_path;
        const rating = series.vote_average;
        const fullPosterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

        const seriesCard = document.createElement('div');
        seriesCard.classList.add('tv-series-card');

        const imgElement = document.createElement('img');
        imgElement.src = fullPosterUrl;
        imgElement.alt = title;
        imgElement.classList.add('series-poster');
        imgElement.addEventListener('click', () => {
            // Preusmjeri na stranicu detalja serije
            window.location.href = `series-details.html?id=${series.id}`;
        });
        seriesCard.appendChild(imgElement);

        const seriesInfo = document.createElement('div');
        seriesInfo.classList.add('tv-series-info');

        const titleElement = document.createElement('h3');
        titleElement.classList.add('tv-series-title');
        titleElement.textContent = `${title}`;
        seriesInfo.appendChild(titleElement);

        const ratingElement = document.createElement('div');
        ratingElement.classList.add('tv-series-rating');
        ratingElement.innerHTML = `<i class="fas fa-star"></i> ${rating}`;
        seriesInfo.appendChild(ratingElement);

        seriesCard.appendChild(seriesInfo);

        const actionButtons = document.createElement('div');
        actionButtons.classList.add('tv-series-buttons');
        actionButtons.innerHTML = `<button>+ Watchlist</button>`;
        seriesCard.appendChild(actionButtons);

        tvSeriesContainer.appendChild(seriesCard);
        titleElement.addEventListener('click', () => {
            window.location.href = `series-details.html?id=${series.id}`;
        });

        seriesInfo.appendChild(titleElement);
    }
}

function rightArrowSeries() {
    seriesStartIndex = (seriesStartIndex + 3) % seriesData.length;
    loadSeries();
}
function leftArrowSeries() {
    seriesStartIndex = (seriesStartIndex - 3 + seriesData.length) % seriesData.length;
    loadSeries();
}
window.addEventListener('resize', () => {
    updateSeriesToShow();
    loadSeries();
});
fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        seriesData = data.results.slice(0, 20); // Ograničava na prvih 20 serija
        updateSeriesToShow();
        loadSeries();
    })
    .catch(error => console.error('Error fetching trending TV series:', error));




//FILMOVI U FILMOVI.HTML
let page = 1;
let genreFilter = 'all';
let sortBy = 'desc';
const moviesGrid = document.getElementById('movies-grid');
const showMoreBtn = document.getElementById('show-more');
    
    async function fetchMovies() {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=vote_average.${sortBy}&vote_count.gte=1000`;
    
        if (genreFilter !== 'all') {
            url += `&with_genres=${genreFilter}`;
        }
    
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            renderMovies(data.results);
            page++;
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    function renderMovies(movies) {
        movies.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie-item');
            movieDiv.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>Ocjena: ${movie.vote_average}</p>
            `;
            movieDiv.setAttribute('data-movie-id', movie.id);
            movieDiv.addEventListener('click', () => {
                window.location.href = `film.html?id=${movie.id}`;
            });
    
            moviesGrid.appendChild(movieDiv);
        });
    }
    
    showMoreBtn.addEventListener('click', () => {
        fetchMovies();
    });
    
    document.getElementById('genre').addEventListener('change', (e) => {
        genreFilter = e.target.value;
        resetMovies();
        fetchMovies();
    });

    document.getElementById('rating').addEventListener('change', (e) => {
        sortBy = e.target.value;
        resetMovies();
        fetchMovies();
    });

    function resetMovies() {
        moviesGrid.innerHTML = '';
        page = 1;
    }
    fetchMovies();

//SERIJE U SERIJE.HTML
let tvPage = 1;
let tvGenreFilter = 'all';
let tvSortBy = 'desc';
const tvSeriesGrid = document.getElementById('series-grid');
const tvShowMoreBtn = document.getElementById('show-more');

    async function fetchTVSeries() {
        let url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${tvPage}&sort_by=vote_average.${tvSortBy}&vote_count.gte=100`;

        if (tvGenreFilter !== 'all') {
            url += `&with_genres=${tvGenreFilter}`;
        }
    
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            renderTVSeries(data.results);
            tvPage++;
        } catch (error) {
            console.error('Error fetching TV series:', error);
        }
    }

    function renderTVSeries(series) {
        series.forEach(show => {
            const showDiv = document.createElement('div');
            showDiv.classList.add('tv-series-item');
            showDiv.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}">
                <h3>${show.name}</h3>
                <p>Ocjena: ${show.vote_average}</p>
            `;
            showDiv.addEventListener('click', () => {
                window.location.href = `series-details.html?id=${show.id}`;
            });
            tvSeriesGrid.appendChild(showDiv);
        });
    }

    tvShowMoreBtn.addEventListener('click', () => {
        fetchTVSeries();
    });

    document.getElementById('genre').addEventListener('change', (e) => {
        tvGenreFilter = e.target.value;
        resetTVSeries();
        fetchTVSeries();
    });

    document.getElementById('rating').addEventListener('change', (e) => {
        tvSortBy = e.target.value;
        resetTVSeries();
        fetchTVSeries();
    });

    function resetTVSeries() {
        tvSeriesGrid.innerHTML = '';
        tvPage = 1;
    }

    fetchTVSeries();

