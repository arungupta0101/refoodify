# 🍽️ ReFoodify

> **Reducing food waste by connecting surplus food with those who need it.**

🌐 **Live Demo:** https://refoodify-blue.vercel.app/

---

## 📖 About

**ReFoodify** is a full-stack web application built to tackle food waste by providing a platform where users can share, discover, and access surplus food. The application promotes sustainability by encouraging food redistribution instead of disposal.

Whether it's excess homemade food, restaurant leftovers, or surplus groceries, ReFoodify helps ensure that edible food reaches people instead of landfills.

---

## ✨ Features

* 🍱 Share surplus food listings
* 🔍 Browse available food items
* 👤 User authentication and authorization
* 📍 Food listing management
* ♻️ Promote food reuse and sustainability
* 📱 Fully responsive design
* ⚡ Fast and user-friendly interface

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS / Tailwind CSS *(Update if applicable)*

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Other Tools

* JWT Authentication *(if used)*
* Git & GitHub
* Vercel (Frontend Deployment)

---

## 📂 Project Structure

```text
refoodify/
│
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│
├── server/                 # Node.js Backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### Clone the repository

```bash
git clone https://github.com/your-username/refoodify.git
cd refoodify
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## ▶️ Run the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm start
```

The application will be available at:

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:5000`

---

## 🎯 Future Enhancements

* Email notifications
* Food pickup scheduling
* Google Maps integration
* Search & Filters
* User ratings and reviews
* Image upload
* Admin dashboard
* Donation analytics

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request
---

## 👨‍💻 Developer

Developed by **Arun Gupta**

🌐 Live Project: https://refoodify-blue.vercel.app/

---

### ⭐ If you like this project, don't forget to give it a star on GitHub!
