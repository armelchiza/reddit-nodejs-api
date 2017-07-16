-- initial set up for database reddit
DROP SCHEMA IF EXISTS `reddit` ;
CREATE SCHEMA IF NOT EXISTS `reddit` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
USE `reddit` ;


-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
DROP TABLE IF EXISTS `reddit`.`users` ;
CREATE TABLE IF NOT EXISTS reddit.users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(60) NOT NULL, -- why 60??? ask me :)
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY username (username)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
DROP TABLE IF EXISTS `reddit`.`posts` ;
CREATE TABLE reddit.posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) DEFAULT NULL,
  url VARCHAR(2000) DEFAULT NULL,
  userId INT DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  KEY userId (userId), -- why did we add this here? ask me :)
  CONSTRAINT validUser FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
);

-- This creates the subreddits table.
DROP TABLE IF EXISTS `reddit`.`subreddits` ;
CREATE TABLE reddit.subreddits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL,
  description VARCHAR(200) DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE `reddit`.`votes` (
  userId INT,
  postId INT,
  voteDirection TINYINT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (userId, postId), -- this is called a composite key because it spans multiple columns. the combination userId/postId must be unique and uniquely identifies each row of this table.
  KEY userId (userId), -- this is required for the foreign key
  KEY postId (postId), -- this is required for the foreign key
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, -- CASCADE means also delete the votes when a user is deleted
  FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE -- CASCADE means also delete the votes when a post is deleted
);

-- ADDING A COLUMN OF SUBREDITTS AS FOREIGN KEY
ALTER TABLE reddit.posts ADD COLUMN subredditId INT;
ALTER TABLE reddit.posts ADD FOREIGN KEY (subredditId) REFERENCES subreddits (id);


-- INSERT MOCK VALUES INTO TABLES
INSERT INTO reddit.subreddits
  (name, description, createdAt, updatedAt)
  VALUES
  ('python', 'questions about code', '2017-07-10 08:15:00', '2017-07-11 08:15:00'),
  ('django', 'learning django together', '2017-08-10 08:15:00', '2017-08-11 08:15:00')
;
INSERT INTO reddit.users
  (username, password, createdAt, updatedAt)
  VALUES
  ('hercules', 'passw0rd', '2017-07-10 08:15:00', '2017-07-11 08:15:00'),
  ('batman', 'p@ssw0rd', '2017-08-10 08:15:00', '2017-08-11 08:15:00')
;
INSERT INTO reddit.posts
  (title, url, userId, createdAt, updatedAt, subredditId)
  VALUES
  ('cool thangs', 'google.com', 2, '2017-07-10 08:15:00', '2017-07-11 08:15:00', 1),
  ('cooler thangs', 'google.ca', 1, '2017-08-10 08:15:00', '2017-08-11 08:15:00', 2)
;



-- data appears
SELECT * FROM reddit.users;
SELECT * FROM reddit.posts;
SELECT * FROM reddit.subreddits;
-- UPDATE decodemtl_addressbook.Entry SET lastName='Perry' WHERE lastName='Perrier';
-- TRUNCATE decodemtl_addressbook.Entry;
