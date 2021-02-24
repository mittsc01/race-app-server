const xss = require('xss')

const RacesService = {
  getAllRaces(db) {
    return db
      .from('racedirector_races')
      .select('*')

  },
  getMyRaces(db,userId) {
  return db
    .from('racedirector_races AS race')
    .select('*')
    .where('race.created_by',userId)
    
    

},
insertRace(db,race){
    return db
        .insert(race)
        .into('racedirector_races')
        .returning('*')
        .then(rows=>rows[0])
},
deleteRace(db,id){
    return db
        .from('racedirector_races')
        .where({id})
        .delete()

},
updateRace(db,raceFields,id){
    return db
        .from('racedirector_races')
        .where({id})
        .update(raceFields)
},

  getById(db, id) {
    return RacesService.getAllRaces(db)
      .from('racedirector_races AS race')
      .where('race.id', id)
      .first()
  },

  getFinishersByRace(db, race_id) {
    return db
      .from('racedirector_finishers AS finisher')
      .select('*')
      .where('finisher.race_id', race_id)
  },

  serializeRace(race) {
    
    return {
      id: race.id,
      name: xss(race.name),
      date: race.date,
      time: race.time,
      city: race.city,
      state: race.state,
      distance: race.distance,
      date_created: new Date(race.date_created),
      date_modified: new Date(race.date_modified),
      created_by: race.created_by


    }
  },
  insertFinisher(db,finisher){
    return db
    .insert(finisher)
    .into('racedirector_finishers')
    .returning('*')
    .then(rows=>rows[0])
  },
  
  serializeFinisher(finisher){
      return {
          id: finisher.id,
          race_id: finisher.race_id,
          place: finisher.place,
          name: finisher.name,
          time: finisher.time,
          status: finisher.status,
          gender: finisher.gender,
          age: finisher.age,
          date_created: finisher.date_created,
      }
  },
  deleteFinisher(db,id){
    return db
    .from('racedirector_finishers')
    .where({id})
    .delete()
  }
}

module.exports = RacesService