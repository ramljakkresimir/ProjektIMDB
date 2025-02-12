const apiKey = '83e3c9dd3e6c9629df9e8f2c03312a72';
const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
const moviesContainer = document.getElementById('movies-container');


//search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');

    // Event listener za pretraživanje
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
        }
    });
    // Event listener za Enter u input polju
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });
    // Sakrij rezultate ako klik nije unutar dropdown-a i ako kliknemo
    document.addEventListener('click', (event) => {
        if (!searchResults.contains(event.target) && event.target !== searchInput) {
            searchResults.innerHTML = '';
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchResults.innerHTML = ''; // Sakrij rezultate pritiskom na Esc
        }
    });

    async function searchMovies(query) {
        try {
            
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
            const data = await response.json();
            displaySearchResults(data.results);
        } catch (error) {
            console.error('Greška prilikom pretraživanja filmova:', error);
        }
    }

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
    
        if (results.length === 0) {
            searchResults.innerHTML = '<p style="padding: 10px; color: #ddd;">Nema rezultata za vašu pretragu.</p>';
            return;
        }
    
        results.forEach(movie => {
            const resultDiv = document.createElement('div');
            resultDiv.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                <div>
                    <h5 style="margin: 0; font-size: 1.1rem; color: #ffc107;">${movie.title}</h5>
                    <p style="margin: 0; font-size: 0.9rem; color: #ddd;">${movie.release_date || 'Nepoznat datum'}</p>
                </div>
            `;
            resultDiv.addEventListener('click', () => {
                window.location.href = `film.html?id=${movie.id}`;
            });
            searchResults.appendChild(resultDiv);
        });
    }
    
});



//registracija i login
document.addEventListener('DOMContentLoaded', () => {
document.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = 'login.html';
        } else {
            alert(result.error || 'Došlo je do greške.');
        }
    } catch (error) {
        console.error('Greška prilikom registracije:', error);
        alert('Došlo je do greške.');
    }
});
document.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            alert(result.message);
            window.location.href = 'index.html';
        } else {
            alert(result.error || 'Došlo je do greške.');
        }
    } catch (error) {
        console.error('Greška prilikom prijave:', error);
        alert('Došlo je do greške.');
    }
});


//dropdown izbornik ako smo logirani
});   
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const userMenu = document.getElementById('user-menu');
    const usernamePlaceholder = document.getElementById('username-placeholder');
    const logoutButton = document.getElementById('logout-button');
    const watchlistItem = document.getElementById('watchlist-item');
    const adminPanelItem = document.getElementById('admin-panel-item');

    const token = localStorage.getItem('token');
    if (token) {
        try {
            const userData = JSON.parse(atob(token.split('.')[1]));
            usernamePlaceholder.textContent = userData.username;

            if (userData.role === 'admin') {
                adminPanelItem.style.display = 'block';
            }

            loginButton.style.display = 'none';
            userMenu.style.display = 'block';
            watchlistItem.style.display = 'block';
        } catch (error) {
            console.error('Greška prilikom dekodiranja tokena:', error);
            localStorage.removeItem('token');
        }
    } else {
        watchlistItem.style.display = 'none';
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        location.reload();
    });
});



//komentari
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        const movieId = new URLSearchParams(window.location.search).get('id');
        const commentText = document.getElementById('comment-text').value;
    
        if (!token) {
            alert('Morate biti prijavljeni da biste dodali komentar.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8000/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ movie_id: movieId, comment: commentText }),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                document.getElementById('comment-text').value = '';
                loadComments(movieId);
            } else {
                alert(result.error || 'Došlo je do greške.');
            }
        } catch (err) {
            console.error('Greška prilikom dodavanja komentara:', err);
        }
    });
    
    document.getElementById('comments-container').addEventListener('click', async (e) => {
        if (e.target.classList.contains('like-button')) {
            const token = localStorage.getItem('token');
            const commentId = e.target.dataset.commentId;
    
            if (!token) {
                alert('Morate biti prijavljeni da biste lajkali komentar.');
                return;
            }
    
            try {
                const response = await fetch(`http://localhost:8000/comments/${commentId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    loadComments(new URLSearchParams(window.location.search).get('id'));
                } else {
                    alert(result.error || 'Došlo je do greške.');
                }
            } catch (err) {
                console.error('Greška prilikom lajkanja komentara:', err);
            }
        }
        if (e.target.classList.contains('delete-button')) {
            const token = localStorage.getItem('token');
            const commentId = e.target.dataset.commentId;
    
            if (!token) {
                alert('Morate biti prijavljeni da biste obrisali komentar.');
                return;
            }
    
            const confirmDelete = confirm('Jeste li sigurni da želite obrisati ovaj komentar?');
            if (!confirmDelete) return;
    
            try {
                const response = await fetch(`http://localhost:8000/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    e.target.closest('.comment').remove();
                } else {
                    alert(result.error || 'Došlo je do greške prilikom brisanja komentara.');
                }
            } catch (err) {
                console.error('Greška prilikom brisanja komentara:', err);
            }
        }
        });
    });
    
    
//watchlist 
document.addEventListener('DOMContentLoaded', () => {
    const watchlistContainer = document.getElementById('watchlist-container');
    const token = localStorage.getItem('token');

    if (token) {
        fetch('http://localhost:8000/watchlist', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(watchlist => {
            if (watchlist.length === 0) {
                watchlistContainer.innerHTML = '<p>Vaša Watchlist je prazna.</p>';
            } else {
                watchlist.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.classList.add('watchlist-card');
                    movieCard.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                        <div class="watchlist-details">
                            <h3>${movie.title}</h3>
                            <p>${movie.overview}</p>
                            <button class="watchlist-remove-button" data-id="${movie.movie_id}">Ukloni</button>
                        </div>
                    `;
                    
                    watchlistContainer.appendChild(movieCard);
                });

                document.querySelectorAll('.watchlist-remove-button').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const movieId = e.target.getAttribute('data-id');
                        removeFromWatchlist(movieId);
                    });
                });
            }
        })
        .catch(error => console.error('Greška prilikom dohvaćanja:', error));
    } else {
        watchlistContainer.innerHTML = '<p>Morate se prijaviti da biste videli Watchlist.</p>';
    }
});

function removeFromWatchlist(movieId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            const movieCard = document.querySelector(`.watchlist-remove-button[data-id="${movieId}"]`).closest('.watchlist-card');
            if (movieCard) {
                movieCard.remove();
            }   
        } else {
            return response.json().then(result => {
                alert(result.error || 'Došlo je do greške.');
            });
        }
    })
    .catch(error => console.error('Greška prilikom uklanjanja:', error));
}




//Prkazivanje stranice o odredjenom filmu klikom na film
document.addEventListener('DOMContentLoaded', () => {
    const moviesGrid = document.getElementById('movies-grid');
    const movieDetails = document.getElementById('movie-details');
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
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
                        const item = {
                            id: data.id,
                            title: data.title,
                            poster_path: data.poster_path,
                            release_date: data.release_date,
                            overview: data.overview
                        };
                        addToWatchlist(item);
                    });
                }
            })
            .catch(error => console.error('Error fetching movie details:', error));

        
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
                        const item = {
                            id: data.id,
                            title: data.name,
                            poster_path: data.poster_path,
                            release_date: data.first_air_date,
                            overview: data.overview
                        };
                        addToWatchlist(item);
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
    const seriesId = urlParams.get('id');

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


//glumci na homepage
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
function addToWatchlist(movie) {
    const token = localStorage.getItem('token'); // JWT token

    if (token) {
        
        fetch('http://localhost:8000/watchlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                movie_id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                overview: movie.overview
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(result => {
                    throw new Error(result.error || 'Došlo je do greške.');
                });
            }
        })
        .then(result => {
            alert('Uspješno dodano u Watchlist!');
        })
        .catch(error => {
            alert(error.message);
            console.error('Greška:', error);
        });
    } else {
        alert('Morate se prijaviti da biste dodali u Watchlist!'); 
    }
}

async function loadComments(movieId) {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`http://localhost:8000/comments?movie_id=${movieId}`, {
            headers: headers
        });

        if (!response.ok) throw new Error('Greška pri dohvatu komentara');
        
        const comments = await response.json(); 
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-timestamp">${new Date(comment.timestamp).toLocaleString()}</span>
                </div>
                <p class="comment-text">${comment.comment}</p>
                <div class="comment-actions">
                    <button class="like-button" data-comment-id="${comment.id}">
                        Sviđa mi se (${comment.likes || 0})
                    </button>
                    ${comment.isUserComment ? 
                        `<button class="delete-button" data-comment-id="${comment.id}">Izbriši</button>` 
                        : ''
                    }
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
        
    } catch (err) {
        console.error('Greška prilikom dohvaćanja komentara:', err);
    }
}

// Učitavanje komentara pri učitavanju stranice
document.addEventListener('DOMContentLoaded', () => {
    const movieId = new URLSearchParams(window.location.search).get('id');
    loadComments(movieId);
});



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

fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=hr`)
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

        const watchlistButton = document.createElement('button');
        watchlistButton.textContent = '+ Watchlist';
        watchlistButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            const item = {
                id: series.id,
                title: series.name,
                poster_path: series.poster_path,
                release_date: series.first_air_date,
                overview: series.overview
            };
            addToWatchlist(item); 
        });

        actionButtons.appendChild(watchlistButton);
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
fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=hr`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        seriesData = data.results.slice(0, 20);
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
                <p>Ocjena:${movie.vote_average}</p>
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
