require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const authRouter = require('../src/auth/auth-router')
const { requireAuth } = require('./middleware/jwt-auth')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router')
const racesRouter = require('./races/races-router')
const myRacesRouter = require('./my-races/my-races-router')
const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.get('/api',requireAuth, (req, res) => {
    res.json(req.user)
})
app.use('/api/auth', authRouter)
app.use('/api/users',usersRouter)
app.use('/api/races',racesRouter)
app.use('/api/my-races',myRacesRouter)


app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app