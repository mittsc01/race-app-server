# Race Director API

This is a boilerplate project used for starting new projects!

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Description
*all endpoints in this section require a JWT token.  All otherwise valid requests missing the token will receive a 401 unauthorized response.

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



Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's main branch.
