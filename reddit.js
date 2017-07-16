var bcrypt = require('bcrypt-as-promised');
var mysql = require('promise-mysql');
var HASH_ROUNDS = 10;

class RedditAPI {
    constructor(conn) {
        this.conn = conn;
    }
// test ..
    createUser(user) {
        /*
        first we have to hash the password. we will learn about hashing next week.
        the goal of hashing is to store a digested version of the password from which
        it is infeasible to recover the original password, but which can still be used
        to assess with great confidence whether a provided password is the correct one or not
         */
        return bcrypt.hash(user.password, HASH_ROUNDS)
            .then(hashedPassword => {
                return this.conn.query('INSERT INTO users (username,password, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [user.username, hashedPassword]);
            })
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                // Special error handling for duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    throw new Error('A user with this username already exists');
                }
                else {
                    throw error;
                }
            });
    }

    createPost(post) {
      if (post.subredditId == null){
        throw new Error('Subreddit section has to be provided');
      } else {
        return this.conn.query(
            `
            INSERT INTO posts (userId, title, url, createdAt, updatedAt, subredditId)
            VALUES (?, ?, ?, NOW(), NOW(), ?);
            `,
            [post.userId, post.title, post.url, post.subredditId]
        )
            .then(result => {
                return result.insertId;
            });
      }
    }

    getAllPosts() {
        /*
        strings delimited with ` are an ES2015 feature called "template strings".
        they are more powerful than what we are using them for here. one feature of
        template strings is that you can write them on multiple lines. if you try to
        skip a line in a single- or double-quoted string, you would get a syntax error.

        therefore template strings make it very easy to write SQL queries that span multiple
        lines without having to manually split the string line by line.
         */
        return this.conn.query(
            `
            SELECT posts.id,
              posts.title,
              posts.url,
              posts.id,
              posts.createdAt AS postCA,
              posts.updatedAt AS postUA,
              posts.userId,
              users.username,
              users.createdAt AS userCA,
              users.updatedAt AS userUA,
              subreddits.name AS subreddit_name,
              subreddits.description AS subreddit_description,
              subreddits.createdAt AS subredditCA,
              subreddits.updatedAt AS subredditUA,
              SUM(voteDirection) AS votescasted
            FROM posts JOIN users ON users.id = posts.userId
            JOIN subreddits ON posts.subredditID = subreddits.id
            JOIN votes ON votes.postId = posts.id GROUP BY votes.postId
            ORDER BY votescasted DESC, posts.createdAt DESC
            LIMIT 25;`
        ).then(function(rows){
          //Now that we have voting, we need to add the voteScore of each post by doing an extra
          // JOIN to the votes table, grouping by postId, and doing a SUM on the voteDirection column.
          //To make the output more interesting, we need to ORDER the posts by the highest voteScore
          // first instead of creation time.
          console.log(rows);
          return rows.map(row =>
            {
              return {
              id: row.id ,
              title: row.title,
              url: row.url,
              createdAt: row.postCA,
              updatedAt: row.postUA,
              subredditID: row.subredditID,
              user: {
                id: row.userId,
                username: row.username,
                createdAt: row.userCA,
                updatedAt: row.userUA
              },
              subreddit_name : row.subreddit_name,
              subreddit_description : row.subreddit_description,
              subredditCA : row.subredditCA,
              subredditUA : row.subredditUA,
              // votes : row.votescasted
            } // object
            // console.log("hello");
          } // => function
        ); // closing the map
      }); // closing the then
    }
    createSubreddit(subreddit){
      // function takes in name and description of a subreddit object
      //this.conn.query

      var subname = subreddit.name;
      var subdescription = subreddit.description;

      return this.conn.query(`
        INSERT INTO reddit.subreddits
          (name, description, createdAt, updatedAt)
          VALUES
          (?, ?, NOW(), NOW());`,
          [subname, subdescription])
        .catch(error => {
            // Special error handling for duplicate entry
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A user with this username already exists');
            }
            else {
                throw error;
            }
        });
    }
    getAllSubreddits() {

        return this.conn.query(`SELECT * FROM subreddits ORDER BY subreddits.createdAt DESC;`);
    }

    createVote(vote){ // postId, userId, voteDirection
      // console.log('hello');
      return this.conn.query(`INSERT INTO votes SET postId=?,
        userId=?, voteDirection=? ON DUPLICATE KEY UPDATE voteDirection=?`,
      [vote.postId, vote.userId, vote.voteDirection, vote.voteDirection]);
    }
  }

module.exports = RedditAPI;
