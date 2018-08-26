DROP DATABASE IF EXISTS parking_pal_db;
CREATE DATABASE parking_pal_db;

\c parking_pal_db;

CREATE TABLE parking_info (
  id SERIAL NOT NULL,
  ll_lat DOUBLE PRECISION,
  ll_lon DOUBLE PRECISION,
  ur_lat DOUBLE PRECISION,
  ur_lon DOUBLE PRECISION,
  day VARCHAR(10),
  starthour INT,
  endhour INT,
  holidays VARCHAR(1),
  weeks JSON,
  lf_fadd INT NOT NULL,
  lf_toadd INT NOT NULL,
  rt_fadd INT NOT NULL,
  rt_toadd INT NOT NULL,
  streetname VARCHAR(20) NOT NULL,
  zip_code INT,
  coordinates JSON,
  blockside VARCHAR(10)
);

CREATE TABLE user_info (
  id SERIAL NOT NULL,
  username VARCHAR(20) NOT NULL,
  pass VARCHAR(50) NOT NULL,
  is_parked BOOLEAN NOT NULL DEFAULT false,
  longitude DECIMAL,
  latitude DOUBLE PRECISION,
  expiration TIME,
  PRIMARY KEY (id)
);

COPY parking_info FROM '/Users/benc/Desktop/MVP/data/raw/streetCleaningData.tsv' DELIMITER E'\t';

CREATE INDEX on parking_info (ll_lon);
CREATE INDEX on parking_info (ll_lat);
CREATE INDEX on parking_info (ur_lon);
CREATE INDEX on parking_info (ur_lat);
