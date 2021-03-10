const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',

      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
    
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
   
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      user_name: 'test-user-4',
      full_name: 'Test user 4',
    
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeRoutesArray(users) {
    return [
      {
        id: 1,
        title: 'First test post!',
        created_by: users[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 2,
        title: 'First test post!',
        created_by: users[1].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 3,
        title: 'First test post!',
        created_by: users[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 4,
        title: 'First test post!',
        created_by: users[2].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
    ]
  }

  function makePointsArray(routes) {
    return [
      {
        id: 1,
        lat: "20",
        lng: "-50",
        index: 1,
        route_id: routes[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified:new Date('2029-01-24T16:28:32.615Z')
      },
      {
        id: 2,
        lat: "20",
        lng: "-50",
        index: 2,
        route_id: routes[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified:new Date('2029-01-24T16:28:32.615Z')
      },
      {
        id: 3,
        lat: "20",
        lng: "-50",
        index: 1,
        route_id: routes[1].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified:new Date('2029-01-24T16:28:32.615Z')
      },
      {
        id: 4,
        lat: "20",
        lng: "-50",
        index: 2,
        route_id: routes[1].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified:new Date('2029-01-24T16:28:32.615Z')
      },
    
    ];
  }
  function makeRunsArray(routes) {
    return [
      {
        id: 1,
        date: "2021-02-26",
        title: 'First test post!',
        created_by: 1,
        route_id: routes[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 2,
        date: "2021-02-26",
        title: 'First test post!',
        created_by: 1,
        route_id: routes[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 3,
        date: "2021-02-26",
        title: 'First test post!',
        created_by: 1,
        route_id: routes[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 4,
        date: "2021-02-26",
        title: 'First test post!',
        created_by: 1,
        route_id: routes[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
    ]
  }



function makeMaliciousArticle(user) {
  const maliciousArticle = {
    id: 911,
    style: 'How-to',
    date_created: new Date(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    author_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedArticle = {
    ...makeExpectedArticle([user], maliciousArticle),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousArticle,
    expectedArticle,
  }
}

function makeFixtures() {
  const testUsers = makeUsersArray()
  const testRoutes = makeRoutesArray(testUsers)
  const testPoints = makePointsArray(testRoutes)
  const testRuns = makeRunsArray(testRoutes)
  return { testUsers, testRoutes, testPoints, testRuns }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        ts_runs,
        ts_points,
        ts_routes,
        ts_users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE ts_runs_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE ts_points_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE ts_routes_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('ts_users_id_seq', 1)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('ts_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('ts_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedTables(db, users, routes, points, runs) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('ts_routes').insert(routes)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('ts_routes_id_seq', ?)`,
      [routes[routes.length - 1].id],
    )
    // only insert points if there are some, also update the sequence counter
    if (points.length) {
      await trx.into('ts_points').insert(points)
      await trx.raw(
        `SELECT setval('ts_points_id_seq', ?)`,
        [points[points.length - 1].id],
      )
    }
    if (runs.length) {
        await trx.into('ts_runs').insert(runs)
        await trx.raw(
          `SELECT setval('ts_runs_id_seq', ?)`,
          [runs[runs.length - 1].id],
        )
      }
  })
}

function seedMaliciousArticle(db, user, article) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('blogful_articles')
        .insert([article])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeRoutesArray,

  makeFixtures,
  cleanTables,
  seedTables,
  seedMaliciousArticle,
  makeAuthHeader,
  seedUsers,
}