const express = require('express');
const multer = require('multer');
const { checkAuthenticated, checkPostOwnerShip } = require('../middleware/auth');
const Comment = require('../models/comments.model');
const router = express.Router();
const Post = require('../models/posts.model');
const path = require('path');
const { storage } = require("../cloudinary/index");
const upload = multer({ storage }).array('image');


router.post('/', checkAuthenticated, upload, async (req, res, next) => {
    let desc = req.body.desc;
    let image = req.files.map(f => ({ url: f.path, filename: f.filename }));

    Post.create({
        image: image,
        description: desc,
        author: {
            id: req.user._id,
            username: req.user.username,
            hometown: req.user.hometown
        },
    }, (err, _) => {
        if (err) {
            req.flash('error', '포스트 생성 실패');
            res.redirect("back");

            // next(err);
        } else {
            req.flash('success', '포스트 생성 성공');
            res.redirect("back");
        }
    })

})


router.get('/', checkAuthenticated, (req, res) => {
    Post.find()
        .populate('comments')
        .sort({ createdAt: -1 })
        .exec((err, posts) => {
            if (err) {
                console.log(err);
            } else {
                res.render('posts', {
                    posts: posts,
                });
            }
        })
})

router.get('/:id/edit', checkPostOwnerShip, (req, res) => {
    res.render('posts/edit', {
        post: req.post
    })
})

router.put('/:id', checkPostOwnerShip, async (req, res) => {
    Post.findByIdAndUpdate(req.params.id, req.body, (err, _) => {
        if (err) {
            req.flash('error', '게시물을 수정하는데 오류가 발생했습니다.');
            res.redirect('/posts');
        } else {
            req.flash('success', '게시물 수정을 완료했습니다.');
            res.redirect('/posts');
        }
    })
})

router.delete('/:id', checkPostOwnerShip, async (req, res) => {
    Post.findByIdAndDelete(req.params.id, (err, _) => {
        if (err) {
            req.flash('error', '게시물을 지우는데 실패했습니다.');
        } else {
            req.flash('success', '게시물을 지우는데 성공했습니다.');
        }
        res.redirect('/posts');
    })
})

module.exports = router;