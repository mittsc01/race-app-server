const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Routes Endpoints', function () {
    let db

    const {
        testUsers,
        testRaces,
        testFinishers,
    } = helpers.makeFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/my-races`, () => {
        context(`Given no races`, () => {
            it(`responds with 200 and an empty list`, () => {
                const testUser = testUsers[3]
                helpers.seedUsers(db, [testUser])
                
                return supertest(app)
                    .get('/api/my-races')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context('Given there are routes in the database', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRaces,
                    testFinishers,
                )
            )

            it('responds with 200 and all of the races', () => {
                const testUser = helpers.makeUsersArray()[1]
                const expectedRoutes = testRaces
                    .filter(route => route.created_by === testUser.id)
                    .map(route => {
                        route.date_created = route.date_created.toISOString()
                        route.date_modified = route.date_modified.toISOString()
                        return route
                    })
                return supertest(app)
                    .get('/api/my-races')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRoutes)
            })
        })

    })
    describe(`POST /api/my-races`, () => {
        beforeEach('seed tables', () =>
            helpers.seedTables(
                db,
                testUsers,
                testRaces,
                testFinishers,
            )
        )

        it(`creates a route, responding with 201 and the new race`, function () {
            this.retries(3)
            const testRace = {
                name: "Race to finish",
            date: "2018-04-25",
            time: "15:00",
            city: "Flagstaff",
            state: "AZ",
            distance: "10,000 meters"
            }
            const testUser = testUsers[0]

            return supertest(app)
                .post('/api/my-races')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(testRace)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.name).to.eql(testRace.name)
                    expect(res.body.created_by).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/api/my-races/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('racedirector_races')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(testRace.name)
                            expect(row.user_id).to.eql(testUser.id)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })


    })
    describe(`DELETE api/my-races/:race-id`, () => {
        context('Given there are articles in the database', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRaces,
                    testFinishers
                )
            )

            it('responds with 204 and removes the article', () => {

                const idToRemove = testRaces[1].id
                const user = testUsers[1]
                const expectedRaces = testRaces.filter(race => race.id !== idToRemove && race.created_by === user.id)
                    .map(race => {
                        race.date_created = race.date_created.toISOString()
                        race.date_modified = race.date_modified.toISOString()
                        return race
                    })
                //console.log(expectedRoutes)
                return supertest(app)
                    .delete(`/api/my-races/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/my-races`)
                            .set('Authorization', helpers.makeAuthHeader(user))
                            .expect(expectedRaces)
                    )
            })
        })
        context(`Given route that doesn't belong to user`, () => {
            it(`responds with 404`, () => {
                const user = testUsers[0]
                const routeId = 2
                return supertest(app)
                    .delete(`/api/my-races/${routeId}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(401, { error: "Unauthorized request" })
            })
        })
    })

    describe(`PATCH /api/my-races/:route_id`, () => {
        context(`Given no matching races`, () => {
            it(`responds with 401`, () => {
                const routeId = 123456
                const user = testUsers[0]
                return supertest(app)
                    .patch(`/api/my-races/${routeId}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(401, { error: "Unauthorized request" })
            })
        })
        context('Given a matching route', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRaces,
                    testFinishers,
                )
            )
            it('responds with 204 and updates the route', () => {
                const idToUpdate = 3
                const user = testUsers[0]
                const updateRace = {
                    name: 'updated route title'
                }
                return supertest(app)
                    .patch(`/api/my-races/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .send(updateRace)
                    .expect(204)
            })
        })
        context('Given a matching route, but incorrect user', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRaces,
                    testFinishers,
                )
            )
            it('responds with 401 and unauthorized', () => {
                const idToUpdate = 2
                const user = testUsers[0]
                const updateRoute = {
                    name: 'updated route title',
                    date: '2016-01-12'
                }
                return supertest(app)
                    .patch(`/api/my-races/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .send(updateRoute)
                    .expect(401, { error: "Unauthorized request" })
            })
        })
    })
    describe('GET /api/my-races/:race_id/results/',() => {
        context('Given a matching route', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRaces,
                    testFinishers,
                )
            )
            it('responds with 200 and returns the correct finishers', () => {
                const raceId = testRaces[0].id
                const user = testUsers[0]
                
                const expectedFinishers = testFinishers
                    .filter(finisher => finisher.race_id === raceId)
                    .map(finisher => {
                        finisher.date_created = finisher.date_created.toISOString()
                        
                        return finisher
                    })
                

                
                return supertest(app)
                    .get(`/api/my-races/${raceId}/results`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(200,expectedFinishers)
            })
        })
    })
    describe(`POST /api/my-races/:race_id/results`, () => {
        beforeEach('seed tables', () =>
            helpers.seedTables(
                db,
                testUsers,
                testRaces,
                testFinishers,
            )
        )

        it(`creates a route, responding with 201 and the new race`, function () {
            this.retries(3)
            const testFinisher = {
                gender: "F",
                name: "Filobert",
                place: "4",
                time: "29:04",
                status: "Finisher",
                age: 55
              }
            

            return supertest(app)
                .post(`/api/my-races/${testRaces[0].id}/results`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(testFinisher)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.name).to.eql(testFinisher.name)
                    expect(res.body.race_id).to.eql(testRaces[0].id)
                    expect(res.headers.location).to.eql(`/api/my-races/${res.body.race_id}/results`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('racedirector_finishers')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(testFinisher.name)
                            expect(row.race_id).to.eql(testRaces[0].id)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })


    })
    describe('DELETE /api/my-races/:race_id/results/:finisher_id', () => {
        beforeEach('seed tables', () =>
            helpers.seedTables(
                db,
                testUsers,
                testRaces,
                testFinishers,
            )
        )
        it('responds with 204 and removes the article', () => {

            const idToRemove = testFinishers[1].id
            const raceId = testFinishers[1].race_id
            const user = testUsers[0]
            const expectedFinishers = testFinishers.filter(finisher => finisher.id !== idToRemove && finisher.race_id === testRaces[0].id)
                
            //console.log(expectedRoutes)
            return supertest(app)
                .delete(`/api/my-races/${raceId}/results/${idToRemove}`)
                .set('Authorization', helpers.makeAuthHeader(user))
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get(`/api/my-races/${raceId}/results`)
                        .set('Authorization', helpers.makeAuthHeader(user))
                        .expect(expectedFinishers)
                )
        })
    })

})