const express = require('express');
const multer = require('multer');
const { checkAuthenticated, checkResellOwnerShip } = require('../middleware/auth');
const Comment = require('../models/comments.model');
const router = express.Router();
const Resell = require('../models/resells.model');
const path = require('path');
const { storage } = require("../cloudinary/index");
const upload = multer({ storage }).array('image');


router.post('/', checkAuthenticated, upload, async (req, res, next) => {
    let desc = req.body.desc;
    let price = req.body.price;
    let image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    let status = req.body.status;

    Resell.create({
        image: image,
        description: desc,
        author: {
            id: req.user._id,
            username: req.user.username,
            hometown: req.user.hometown
        },
        price: price,
        status: status
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
    Resell.find()
        .populate('comments')
        .sort({ createdAt: -1 })
        .exec((err, resells) => {
            if (err) {
                console.log(err);
            } else {
                res.render('resells', {
                    resells: resells,
                });
            }
        })
})

router.get('/:id/edit', checkResellOwnerShip, (req, res) => {
    res.render('resells/edit', {
        resell: req.resell
    })
})

router.put('/:id', checkResellOwnerShip, async (req, res) => {
    // 체크박스의 값이 'on'인 경우 true, 그렇지 않으면 false
    const updatedData = {
        ...req.body,
        status: req.body.status === 'on'
    };

    Resell.findByIdAndUpdate(req.params.id, updatedData, (err, _) => {
        if (err) {
            req.flash('error', '게시물을 수정하는데 오류가 발생했습니다.');
            res.redirect('/resells');
        } else {
            req.flash('success', '게시물 수정을 완료했습니다.');
            res.redirect('/resells');
        }
    })
})

router.delete('/:id', checkResellOwnerShip, async (req, res) => {
    Resell.findByIdAndDelete(req.params.id, (err, _) => {
        if (err) {
            req.flash('error', '게시물을 지우는데 실패했습니다.');
        } else {
            req.flash('success', '게시물을 지우는데 성공했습니다.');
        }
        res.redirect('/resells');
    })
})

module.exports = router;