/*
mysql -h host_name -u admin -p
source database_sample.sql
*/


CREATE DATABASE IF NOT EXISTS helloworld;
USE helloworld;

CREATE TABLE IF NOT EXISTS Items (
	            ID int NOT NULL AUTO_INCREMENT,
		        NAME varchar(255) NOT NULL UNIQUE,
			    PRIMARY KEY (ID)
			);


INSERT INTO Items (NAME) VALUES ("name-001");
SELECT * FROM Items;

