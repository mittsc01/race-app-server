const express = require('express')
const RacesService = require('../races/races-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()

const myRacesRouter = express.Router()

myRacesRouter
    .route('/')
    .all(requireAuth, jsonParser)
    .get((req, res, next) => {

        const id = req.user.id
        console.log(id)
        RacesService.getMyRaces(req.app.get('db'), id)
            .then(races => {

                res.json(races.map(RacesService.serializeRace))
            })
            .catch(next)
    })
    .post((req, res, next) => {
        const { name, date, time, city, state } = req.body
        const newRace = { name, date, time, city, state }


        for (const [key, value] of Object.entries(newRace)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }
        newRace.created_by = req.user.id


        RacesService.insertRace(
            req.app.get('db'),
            newRace

        )
            .then(race => {
                res
                    .status(201)
                    .location(`/api/my-races/${race.id}`)
                    .json(race)
            })
            .catch(next)




    })

myRacesRouter
    .route('/:race_id')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        RacesService.getById(knexInstance, req.params.race_id)
            .then(race => {
                if (!race) {
                    return res.status(404).json({
                        error: {
                            message: `Race doesn't exist`
                        }
                    })
                }
                //only allow patch request from race creator
                if (race.created_by !== req.user.id) {
                    return res.status(404).json({
                        error: {
                            message: `No race at this endpoint for current user`
                        }
                    })
                }
                res.race = race
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({ ...res.race })
    })
    .patch((req, res, next) => {
        const { name, date, time, city, state } = req.body
        const updatedRace = { name, date, time, city, state }
        const numberOfValues = Object.values(updatedRace).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of the following: 'name', 'date', 'time', 'city', 'state'`
                }
            })
        }

        updatedRace.date_modified = new Date()
        RacesService.updateRace(
            req.app.get('db'),
            updatedRace,
            req.params.race_id

        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        const raceId = res.race.id
        RacesService.deleteRace(
            req.app.get('db'),
            raceId
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)

    })
myRacesRouter.route('/:race_id/results/')
    .all(requireAuth, jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        RacesService.getById(knexInstance, req.params.race_id)
            .then(race => {
                if (!race) {
                    return res.status(404).json({
                        error: {
                            message: `Race doesn't exist`
                        }
                    })
                }
                //only allow request from race creator
                if (race.created_by !== req.user.id) {
                    return res.status(404).json({
                        error: {
                            message: `No race at this endpoint for current user`
                        }
                    })
                }
                res.race = race
                next()
            })
            .catch(next)
    })
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
    .post((req, res, next) => {
        const { name, time, age, gender, place, status } = req.body
        console.log(req.body)
        const newFinisher = { name, place, status }


        for (const [key, value] of Object.entries(newFinisher)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }
        newFinisher.time = time,
            newFinisher.age = age,
            newFinisher.gender = gender,
            newFinisher.race_id = req.params.race_id


        RacesService.insertFinisher(req.app.get('db'), newFinisher)
            .then(finisher => {
                res
                    .status(201)
                    .location(`/api/my-races/${finisher.race_id}/results`)
                    .json(finisher)
            })
            .catch(next)
    })
myRacesRouter.route('/:race_id/results/:finisher_id')
    .all(requireAuth, jsonParser, (req, res, next) => {
        console.log(req.params.race_id,req.params.finisher_id)
        const knexInstance = req.app.get('db')
        RacesService.getById(knexInstance, req.params.race_id)
            .then(race => {
                if (!race) {
                    return res.status(404).json({
                        error: {
                            message: `Race doesn't exist`
                        }
                    })
                }
                //only allow request from race creator
                if (race.created_by !== req.user.id) {
                    return res.status(404).json({
                        error: {
                            message: `No race at this endpoint for current user`
                        }
                    })
                }
                res.race = race
                next()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        
        const finisherId = req.params.finisher_id
        RacesService.deleteFinisher(
            req.app.get('db'),
            finisherId
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)

    })




module.exports = myRacesRouter