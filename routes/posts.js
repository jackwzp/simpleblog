//============================
//      Dependencies
//============================       

var express = require('express');
var router = express.Router();
var multer = require('multer');
var Post = require('../model/post');
var Category = require('../model/category');

var upload = multer({dest: './public/images/uploads'}); 


//============================
//      Post Home Page
//============================       

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/users/login');
    }
}

/* GET posts home page. */
router.get('/', checkAuthentication, function(req, res, next) {
    Post.find( {author: req.user.name}, {title: 1, date: 1}, function(err, posts) {
        if(err) console.error(err);
        //console.log(posts);
        res.render('posts/posts', { 
            title: 'Posts',
            posts: posts 
        });
    });
});

//============================
//      Add New Post
//============================       

// Get add post view
router.get('/newpost', checkAuthentication, function(req,res) {
    Category.find({author: req.user.name}, {title: 1}, function(err, categories) {
        if (err) console.error(err);      
        res.render('posts/newpost', {
            title: 'New Post',
            categories: categories
        });
    });
    
});


// Add new post to DB
router.post('/newpost', function(req,res) {
    // get form values
    var title = req.body.title;
    var content = req.body.content;
    var category = req.body.category;

    var newPost = new Post({
        title: title, 
        content: content,
        author: req.user.name,
        category: category
    });

    // the post param in callback is returned by mongoose
    Post.createPost(newPost, function(err, post) {
        if(err) throw err;
        console.log(post);        
    });
    
    // Success flash message
    req.flash('success', 'Post Created Successfully!');
    res.redirect('/posts');
});



//============================
//      Edit Post
//============================

// edit post page
router.get('/edit', checkAuthentication, function(req, res) {
    res.render('posts/edit');
});

// insert modified post into db
router.put('/:id', checkAuthentication, function(req, res) {
    res.send('editing single post');
});

//============================
//      Delete Post
//============================       


//============================
//      Add New Category
//============================              

router.get('/newcategory', checkAuthentication, function(req, res) {
    res.render('posts/newcategory', {title: 'Category'});
});

// add new category to DB
router.post('/newcategory', checkAuthentication, function(req, res) {
    var title = req.body.title;

    Category.findOne({author: req.user.name, title: title}, {title: 1}, function(err, data) {
        console.log(data);
        // Category doesn't exist...create new one
        if (data == null) {
            var newcategory = new Category({
                title: title,
                author: req.user.name
            });

            Category.createCategory(newcategory, function(err, category) {
                if (err) throw err;
                console.log(category);
            });

            // Success flash message
            req.flash('success', title + ' Created Successfully!');
            res.redirect('/posts/newcategory');

        }
        else { // Category already exists...display error
            // Success flash message
            req.flash('error', title + ' already exists...try another one.');
            res.redirect('/posts/newcategory');
        }
    });
});



/*
 * This Needs to be placed at the end in order to render other routes before it.
 * Since this route will redirect any /posts/<any string> to this route. If we place
 * this before say /edit route, then it will use this route instead of edit route.
*/
//============================
//      Individual Post View
//============================       
router.get('/:id', checkAuthentication, function(req,res) {
    res.send('requesting single post view');
});

//============================
//      Export Modules (Always Do this)
//============================       

module.exports = router;


