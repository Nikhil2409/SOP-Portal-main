const express = require('express')
const path = require('path')
require('dotenv').config();
require('./controllers/db');
const AuthRouter = require('./routes/auth')
const studentRouter = require('./routes/student')
const facultyRouter = require('./routes/faculty')
const {studentMiddleware,facultyMiddleware} = require('./controllers/middleware')
const session = require('express-session')
const passport = require('passport')

const cors = require('cors')

const app = express()

app.use(cors())

app.use(session({
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', AuthRouter)

app.use('/api/student',studentMiddleware,studentRouter)

app.use('/api/faculty',facultyMiddleware,facultyRouter);

// Serve the statically exported Next.js frontend from the same origin as the API.
// `extensions` maps /student -> student.html, so page refreshes work without a Next.js server.
const FRONTEND_DIR = process.env.FRONTEND_DIR || path.join(__dirname, '..', 'frontend', 'out')
app.use(express.static(FRONTEND_DIR, { extensions: ['html'] }))

// Unknown API routes return JSON; any other unknown path gets the exported 404 page.
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }))
app.use((req, res) => res.status(404).sendFile(path.join(FRONTEND_DIR, '404.html')))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
});