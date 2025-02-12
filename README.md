# IMDb-like Movie Review Web Application

## 📌 Overview
This is a full-stack web application that allows users to browse, review, and manage movies, similar to IMDb. Users can create accounts, leave comments, like or delete comments, add movies to their watchlist, and search for films. Admin users have additional functionalities to manage users and comments.

## ✨ Features
- **User Authentication:** Users can register and log in to their accounts.
- **Movie Browsing:** Fetches movie details from TMDB API.
- **Commenting System:** Users can comment on movies, like comments, and delete their own comments.
- **Watchlist Feature:** Add and remove movies from a personal watchlist (stored in local database).
- **Search & Filtering:** Search for movies using TMDB API.
- **Admin Dashboard:** Admins can manage users and moderate comments.
- **Responsive UI:** Works across various devices (mobile, tablet, and desktop).

## 🛠️ Tech Stack
### **Frontend:**
- HTML, CSS, JavaScript
- API Integration: TMDB API for movie data

### **Backend:**
- Node.js with Express.js
- Database: PostgreSQL
- Authentication: JWT for secure user sessions
- API: RESTful API for handling user data

## 🚀 Installation & Setup
### Prerequisites
- Node.js & npm installed
- PostgreSQL set up

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/ramljakkresimir/ProjektIMDB.git
cd ProjektIMDB
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file and add:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key
```

### **4️⃣ Start the Backend Server**
```bash
npm run server
```

### **5️⃣ Start the Frontend**
```bash
npm start
```

## 📌 API Endpoints
### **User Authentication**
- `POST /register` → Register new user
- `POST /login` → Log in user

### **Movies (TMDB API Integration)**
- `GET /movies` → Fetch movies from TMDB API
- `GET /movies/:id` → Fetch specific movie details from TMDB API

### **Reviews & Comments**
- `POST /comments` → Add a comment to a movie
- `GET /comments?movie_id=xyz` → Fetch comments for a specific movie
- `DELETE /comments/:id` → Delete a comment (user or admin only)
- `POST /comments/:id/like` → Like a comment

### **Watchlist**
- `POST /watchlist` → Add a movie to the watchlist (stored in local DB)
- `GET /watchlist` → Get user’s watchlist
- `DELETE /watchlist/:id` → Remove a movie from the watchlist

### **Admin Endpoints**
- `GET /admin/comments` → Fetch all comments (admin only)
- `GET /admin/users` → Fetch all users (admin only)
- `POST /admin/ban/:username` → Ban a user
- `POST /admin/unban/:username` → Unban a user
- `DELETE /comments/:id` → Delete any comment (admin only)
- `PUT /admin/role/:username` → Update user role

### **User Profile**
- `GET /profile` → Fetch user profile
- `POST /update-profile` → Update user bio
- `GET /user-comments` → Fetch all comments made by the user

## 🎯 Future Improvements
- Implementing a recommendation system based on user preferences
- Adding user profiles with avatars and bio
- Enabling movie rating system
- Optimizing performance with caching mechanisms

## 📝 License
This project is licensed under the MIT License.

---

💡 **Contributions are welcome!** Feel free to submit issues or pull requests to improve the project. 🚀

