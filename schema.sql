--Drops the final_app if it exists currently 
DROP DATABASE IF EXISTS final_app;
--Creates the "favorite_db" database --
CREATE DATABASE final_app;

USE final_app; 

CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(15) NULL,
	email VARCHAR(100) NULL,
	password BINARY(60) NULL,
	PRIMARY KEY (id)
);