CREATE TABLE racedirector_finishers (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  race_id INTEGER
    REFERENCES racedirector_races(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  time TEXT,
  place TEXT,
  status TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  date_created TIMESTAMP DEFAULT now() NOT NULL,
  date_modified TIMESTAMP
);