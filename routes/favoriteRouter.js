const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');
const User = require('../models/users');
const Favorites = require('../models/favorites');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((favorites) => {
        if(favorites != null){
            //found a favorites document, add dishes to the favorite
            for(let i in req.body){
                if(favorites.dishes.indexOf(req.body[i]._id) === -1){
                    favorites.dishes.push(req.body[i]);
                }
            }
            favorites.save()
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }else{
            //Did not found favorite document, create favorite document, then add dishes to the favorites
            Favorites.create({user: req.user, dishes: req.body})
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
            })
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((favorites) => {
        if(favorites != null){
            //found a favorites document, add dishes to the favorite
            if(favorites.dishes.indexOf(req.params.dishId) === -1){
                favorites.dishes.push(req.params.dishId);
            }
            
            favorites.save()
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }else{
            //Did not found favorite document, create favorite document, then add dishes to the favorites
            Favorites.create({user: req.user, dishes: [req.params.dishId]})
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
            })
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((favorites) => {
        if(favorites != null){
            const dishIndex = favorites.dishes.indexOf(req.params.dishId);
            if(dishIndex !== -1){
                favorites.dishes.splice(dishIndex, 1);
                favorites.save()
                .then((favorites) => {
                    Favorites.findOne({user: req.user})
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    });                
                }, (err) => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});


module.exports = favoriteRouter;