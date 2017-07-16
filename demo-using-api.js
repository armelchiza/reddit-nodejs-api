// load the mysql library
var mysql = require('promise-mysql');

// create a connection to our Cloud9 server
var connection = mysql.createPool({
    host     : 'localhost',
    user     : 'root', // CHANGE THIS :)
    password : 'root',
    database: 'reddit',
    connectionLimit: 10
});

// load our API and pass it the connection
var RedditAPI = require('./reddit');

var myReddit = new RedditAPI(connection);

// We call this function to create a new user to test our API
// The function will return the newly created user's ID in the callback
myReddit.createUser({
    username: 'PM_ME_CUTES5',
    password: 'abc123'
})
    .then(newUserId => {
        // Now that we have a user ID, we can use it to create a new post
        // Each post should be associated with a user ID
        console.log('New user created! ID=' + newUserId);

        return myReddit.createPost({
            title: 'Hello Reddit! This is my first post',
            url: 'http://www.digg.com',
            userId: newUserId, // need to also provide a subreddit !!!
            subredditId: 1 // MITIGATES THE ERROR THROWN WHEN NO SUB IS PROV'D
        });
    })
    .then(newPostId => {
        // If we reach that part of the code, then we have a new post. We can print the ID
        console.log('New post created! ID=' + newPostId);
        connection.end();
    })
    .catch(error => {
        console.log('\n\n line 41 \n\n');
        console.log(error.stack);
    });

myReddit.createVote({postId: 1, userId: 1, voteDirection:1}).then(console.log('yay')); // tester getAllSubs
