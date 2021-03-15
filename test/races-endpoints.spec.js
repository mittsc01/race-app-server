const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Races Endpoints', function () {
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

    describe(`GET /api/races`, () => {
        context(`Given no races`, () => {
            it(`responds with 200 and an empty list`, () => {
                const testUser = testUsers[3]
                helpers.seedUsers(db, [testUser])
                
                return supertest(app)
                    .get('/api/races')
                    //.set('Authorization', helpers.makeAuthHeader(testUser))
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
                    //.filter(route => route.created_by === testUser.id)
                    .map(route => {
                        route.date_created = route.date_created.toISOString()
                        route.date_modified = route.date_modified.toISOString()
                        return route
                    })
                return supertest(app)
                    .get('/api/races')
                    //.set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRoutes)
            })
        })

    })
    describe(`GET /api/races/:race_id`, () => {
        

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
                
                const expectedRace = testRaces[0]
                    //.filter(route => route.created_by === testUser.id)
                //expectedRace.date_created = expectedRace.date_created.toISOString()
                
                return supertest(app)
                    .get(`/api/races/1`)
                    //.set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRace)
            })
        })

    })
    describe(`GET /api/races/:race_id/results`, () => {
        

        context('Given there are routes in the database', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRaces,
                    testFinishers,
                )
            )

            it('responds with 200 and all of the finishers', () => {
                
                const expectedFinishers = testFinishers.filter(item => item.race_id===1)
                .map(route => {
                    route.date_created = route.date_created.toISOString()
                    //route.date_modified = route.date_modified.toISOString()
                    return route
                })
                    //.filter(route => route.created_by === testUser.id)
                //expectedRace.date_created = expectedRace.date_created.toISOString()
                
                return supertest(app)
                    .get(`/api/races/1/results`)
                    //.set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedFinishers)
            })
        })

    })
})