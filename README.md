# Race Director API

To access the live API endpoint, use the following URL: 
https://race-director.herokuapp.com
## Getting Started

1. Clone this repository and run `npm i`
2. Create local Postgresql databases (NOTE: you will need Postgresql installed locally): `race-director` and `race-director-test`
3. Run `mv example.env .env` and provide the local database locations within your `.env` file
4. Run npm run migrate and npm run migrate:test to update each database with appropriate tables
5. Run npm run dev to start server locally


## Description
*all endpoints in this section require a JWT token.  All otherwise valid requests missing the token will receive a 401 unauthorized response.

## Summary
The Race Director App is a simple app that allows the user to create races and add results.  It's as straightforward as creating an account and creating a race.  Use for your local running club or cross country team to share race information and results publicly without a lot of fuss.


### Races
* GET /api/races/
    * responds with 200 and list of all races in the database
* GET /api/races/:race_id
    * responds with 200 and race if id exists, 404 otherwise.
* GET /api/races/:race_id/results
    * reponds with 200 and list of finishers for the race with matching id.

### My Races*
* GET /api/my-races
    * responds with 200 and list of all races matching the user id
* POST /api/my-races
    * responds with 201 and the new race object. Request body field options include:
        * name (required)
        * date (required)
        * time (required)
        * city (required)
        * state (required)
        * distance (required)
* GET /api/my-races/:race_id
    * responds with 200 and race object if id exists
* DELETE /api/my-races/:race_id
    * responds with 204 and deletes race with requested id if it matches
* PATCH /api/my-races/:race_id
    * responds with 204 and updates the race with requested id if it matches
    * responds with 404 if no matching race
* GET /api/my-races/:race_id/results
    * reponds with 200 and list of finishers for the race with matching id.
* POST /api/my-races/:race_id/results
    * responds with 204 and finisher object if race_id matches.  Request body field include:
        * name (required)
        * place (required)
        * status (required)
        * gender
        * time
        * age
* DELETE api/my-races/:race_id/results/:finisher_id
    * responds with 201 and deletes the requested finisher from the results



## Technologies
* NodeJS
* Express
* PostgreSQL

# Screenshots
![Race results detail screenshot](/screenshots-race-app/results-detail.png)
![Race info screenshot](/screenshots-race-app/race-detail.png)
![Add a race view screenshot](/screenshots-race-app/add-race.png)
![Search for races screenshot](/screenshots-race-app/search-race.png)

