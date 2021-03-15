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

function makeRacesArray(users) {
    return [
      {
        id: 1,
        name: 'First test post!',
        date: '2021-11-03',
        time: '19:00',
        created_by: users[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        distance: '10 miles',
        city: 'Waukon',
        state: "IA",
        date_modified: new Date(),
      },
      {
        id: 2,
        date: '2021-11-03',
        time: '19:00',
        name: 'First test post!',
        created_by: users[1].id,
        distance: '10 miles',
        city: 'Waukon',
        state: "IA",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 3,
        date: '2021-11-03',
        time: '19:00',
        name: 'First test post!',
        created_by: users[0].id,
        distance: '10 miles',
        city: 'Waukon',
        state: "IA",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
      {
        id: 4,
        name: 'First test post!',
        date: '2021-11-03',
        time: '19:00',
        created_by: users[2].id,
        distance: '10 miles',
        city: 'Waukon',
        state: "IA",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        date_modified: new Date(),
      },
    ]
  }

  function makeFinishersArray(races) {
    return [
      {
        id: 1,
        gender: "F",
        name: "Filbert",
        place: "1",
        time: "29:00",
        status: "Finisher",
        race_id: races[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        age: 57
      },
      {
        id: 2,
        gender: "F",
        time: "20:00",
        name: "Filo",
        place: "2",
        status: "Finisher",
        race_id: races[0].id,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
        age: 29
      },
      {
        id: 3,
        gender: "M",
        time: "18:37",
        name: "Filb",
        place: "3",
        status: "Finisher",
        race_id: races[1].id,
        date_created: new Date('2029-01-20T16:28:32.615Z'),
        age: 22
      },
      {
        id: 4,
        gender: "M",
        time: "19:22",
        name: "bert",
        place: "5",
        status: "Finisher",
        race_id: races[1].id,
        date_created: new Date('2029-01-21T16:28:32.615Z'),
        age: 14
      },
    
    ];
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
  const testRaces = makeRacesArray(testUsers)
  const testFinishers = makeFinishersArray(testRaces)
  return { testUsers, testRaces, testFinishers}
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        racedirector_finishers,
        racedirector_races,
        racedirector_users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE racedirector_finishers_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE racedirector_races_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('racedirector_users_id_seq', 1)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('racedirector_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('racedirector_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedTables(db, users, races, finishers) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('racedirector_races').insert(races)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('racedirector_races_id_seq', ?)`,
      [races[races.length - 1].id],
    )
    // only insert finishers if there are some, also update the sequence counter
    if (finishers.length) {
      await trx.into('racedirector_finishers').insert(finishers)
      await trx.raw(
        `SELECT setval('racedirector_finishers_id_seq', ?)`,
        [finishers[finishers.length - 1].id],
      )
    }

  })
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
  makeRacesArray,

  makeFixtures,
  cleanTables,
  seedTables,
  makeAuthHeader,
  seedUsers,
}