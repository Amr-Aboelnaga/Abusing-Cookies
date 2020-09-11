var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var User = require('../models/User');
var sha256 = require("sha256");
var session= require('cookie-session');

/* GET home page. */
var MongoClient = require('mongodb').MongoClient;
var usercollection;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, database) {
    if(err) { return console.dir(err); }

    var mydb = database.db('exampleDb');
    usercollection=mydb.collection('users');


});

function checkSession(req, res, next) {
    var session = req.session;
    console.log('checking session');
    console.log(session);
    if (!session || session == null || session == undefined || session.isNew) {
        return false;
    } else {
        // check db for data
        var username = session.user.username;
        var password = session.user.password;
        var token = session.user.token;
        return true;
    }
    return false;
}

router.get('/dashboard', function(req, res, next) {
    if (checkSession(req, res, next)) {
        res.render('dashboard', { title: 'Express', logged_in: true, user: req.session.user });
    } else {
        res.render('login', { title: 'Express', logged_in: false });
    }
});

router.get('/', function(req, res, next) {
    if (checkSession(req, res, next)) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});
router.get('/logout', function(req, res, next) {
    if (checkSession(req, res, next)) {
        req.session = null;
    }
    res.redirect('/login');
});


router.get('/login', function(req, res, next) {
    if (checkSession(req, res, next)) {
        res.render('dashboard', { title: 'Express', logged_in: true });
    } else {
        res.render('login', { title: 'Express', logged_in: false });
    }
});
router.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'Express', logged_in: false });
});

router.post('/search', function(req, res, next) {
    var header_option = checkSession(req, res, next);
    var query = req.body.query;
    var results = ['Hello', 'There', 'Results!'];
    res.render('search_results', {
        title: 'Express',
        query: query,
        results: results,
        logged_in: header_option,
    });
});

router.get('/changepassword', function(req, res, next) {
    var header_option = checkSession(req, res, next);
    res.render('change_password', { title: 'Express', logged_in: header_option});
});

router.post('/changepassword', function(req, res, next) {
    if (checkSession(req, res, next)) {
        // get password field
        console.log('body', req.body);
        var new_password = req.body.inputPassword;
        new_password = sha256(new_password);
        // update db
        var query = {email: req.session.user.email};
        var update = { $set: {password: new_password}};
        usercollection.updateOne(query, update, function(err, results) {
            if (err) {
                console.log('Password not updated for ' + JSON.stringify(req.session.user.email));
                res.render('password_change_result', {
                    title: 'Express',
                    logged_in: true,
                    result: false
                });
            } else {
                console.log('Password updated for ' + JSON.stringify(req.session.user.email));
                res.render('password_change_result', {
                    title: 'Express',
                    logged_in: true,
                    result: true
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/signin', function(req, res, next) {
    if (checkSession(req, res, next)) {
        res.redirect('/dashboard');
    } else {
        console.log(req.body);
        var email=req.body.email.toLowerCase();
        var password=req.body.password;
        console.log(email, password);
        if(!email){
            res.jsonp({success : false});
        }
        else if(!password) {
            res.send("enter password");
        }else{
            usercollection.find({email: email}).toArray(function (err, result) {
                if (err) throw err;
                if ((result.length > 0)) {
                    var inter = sha256(password);
                    console.log(result[0].password, inter);
                    if (result[0].password == inter) {
                        req.session.user=result[0];
                        console.log(result);
                        res.redirect('/dashboard');
                    }else{
                        console.log('Bad password or no user');
                        console.log(result);
                        res.send("bad password");
                    }
                } else {
                    console.log('Bad password or no user');
                    console.log(result);
                    res.send("bad username");
                }
            });
        }
    }
});

router.post('/signup', function(req, res, next) {
    if (checkSession(req, res, next)) {
        res.redirect('/dashboard');
    }else {
        var email=req.body.email.toLowerCase();
        var username=req.body.username;
        var password=req.body.password;
        if(!username){
            res.redirect('/signup');
        } else if(!email){
            res.redirect('/signup');
        } else if(!password) {
            res.redirect('/signup');
        } else{
            usercollection.find({email: email}).toArray(function (err, result) {
                if (err) throw err;
                if (!(result.length > 0)) {
                    var user = new User();
                    user.email = email;
                    user.password = sha256(password);
                    user.username = username;
                    user.token = Math.random();
                    console.log(user);
                    usercollection.insertOne(user);
                    req.session.user=user;
                    res.redirect('/dashboard');
                } else {
                    res.redirect('/signup');
                }        //console.log(result);
            });
        }
    }
});

module.exports = router;
