const express = require('express')
const RacesService = require('./races-service')
const { requireAuth } = require('../middleware/jwt-auth')

const racesRouter = express.Router()


racesRouter
  .route('/')
  .get((req, res, next) => {
      //console.log('hello')
    RacesService.getAllRaces(req.app.get('db'))
      .then(races => {
          console.log(races)
        res.json(races.map(RacesService.serializeRace))
      })
      .catch(next)
  })

racesRouter
  .route('/:race_id')
  .all(checkRaceExists)
  .get((req, res, next) => {
      console.log('hello')
    res.json(RacesService.serializeRace(res.race))
  })

racesRouter.route('/:race_id/results/')
  .all(checkRaceExists)
  .get((req, res, next) => {
    RacesService.getFinishersByRace(
      req.app.get('db'),
      req.params.race_id
    )
      .then(finishers => {
        res.json(finishers.map(RacesService.serializeFinisher))
      })
      .catch(next)
  })

  


/* async/await syntax for promises */
async function checkRaceExists(req, res, next) {
  try {
    const race = await RacesService.getById(
      req.app.get('db'),
      req.params.race_id
    )

    if (!race)
      return res.status(404).json({
        error: `Race doesn't exist`
      })

    res.race = race
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = racesRouter