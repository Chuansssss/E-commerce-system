/**
 * Created by JcShang on 2017/10/8.
 */

let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods = require('./../models/goods.js');

// Connect to the mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/de_demo');

mongoose.connection.on("connected", function() {
  console.log("Connected to the mongoDB.");
});

mongoose.connection.on("error", function() {
  console.log("Connection failed.");
});

mongoose.connection.on("disconnected", function() {
  console.log("Disconnected from the mongoDB.");
});

// Query for the goods info
router.get('/', function(request, response, next) {
  // Compute the paging
  let page = parseInt(request.param("page"));
  let pageSize = parseInt(request.param("pageSize"));
  let skip = (page - 1) * pageSize;

  // Sort by price
  let sort = parseInt(request.param("sort"));
  let params = {};

  // Sort by price range
  let priceLevel = request.param("priceLevel");
  var priceGt = '', priceLte = '';
  params = {};
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0': priceGt = 0;priceLte = 500;break;
      case '1': priceGt = 500;priceLte = 1000;break;
      case '2': priceGt = 1000;priceLte = 2000;break;
      case '3': priceGt = 2000;priceLte = 5000;break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice': sort});




  goodsModel.exec({}, function(err, doc) {
    if (err) {
      response.json({
        status: "1",
        msg: err.message
      });
    } else {
      response.json({
        status: "0",
        msg:"",
        result: {
          count: doc.length,
          list: doc
        }
      });
    }
  })
});

// Add the items to the cart
router.post("/addCart", function(req, res, next) {
  var userId = '100000077', productId = req.body.productId;
  var User = require('../models/user.js');

  User.findOne({userId: userId}, function(err, userDoc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      });
    } else {
      console.log("userDoc: " + userDoc);
      if (userDoc) {
        let goodsItem = '';
        userDoc.cartList.forEach(function (item) {
          if (item.productId == productId) {
            goodsItem = item;
            item.productNum++;
          }
        });
        if (goodsItem) {
          userDoc.save(function(err2, doc2) {
            if (err2) {
              res.json({
                status: "1",
                msg: err2.message
              });
            } else {
              res.json({
                status: '0',
                msg: 'Success Added.',
                result: 'Success.'
              });
            }
          });
        } else {
          Goods.findOne({productId: productId}, function(err, doc) {
            if (err) {
              res.json({
                status: "1",
                msg: err.message
              });
            } else {
              if (doc) {
                doc.productNum = 1; // The goods model must have this entry
                doc.checked = 1; // Whether the item is ckecked or not
                userDoc.cartList.push(doc);
                userDoc.save(function(err2, doc2) {
                  if (err2) {
                    res.json({
                      status: "1",
                      msg: err2.message
                    });
                  } else {
                    res.json({
                      status: '0',
                      msg: 'Success Added.',
                      result: 'Success.'
                    });
                  }
                });
              }
            }
          });
        }

      }
    }
  })
});

module.exports = router;
