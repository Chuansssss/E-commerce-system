var express = require('express');
var router = express.Router();

require('./../utils/dateFormatter')

var User = require('./../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Login interface
router.post('/login', function(req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param, function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      if (doc) {
        res.cookie("userId", doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        // req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  });
});

// Logout interface
router.post("/logout", function(req, res, next) {
  res.cookie("userId", "", { // Clear the cookie
    path:'/',
    maxAge: -1
  });
  res.json({
    status: '0',
    msg: '',
    result: ''
  });
});

// Get the good list in the cart
router.get("/cartList", function(req, res, next) {
  var userId = req.cookies.userId;
  if (!userId) {
    res.json({
      status: '1',
      msg: 'Please login in',
      result:''
    })
  }

  User.findOne({userId: userId}, function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result:''
      });
    } else {
      if (doc) {
        // doc.cartList;
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        });
      }
    }
  })
});

router.post("/delItem", function(req, res, next) {
  var userId = req.cookies.userId, productId = req.body.productId;
  let productNum = '';
  User.findOne({userId: userId}, function(err, user) {
    user.cartList.forEach((item) => {
      if (item.productId == productId) {
        productNum = item.productNum;
      }
    });
  });
  User.update({userId: userId}, {$pull:
    {
      'cartList':
        {
          'productId': productId
        }
    }
  }, function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: productNum
      })
    }
  });
});

router.post('/editCart', function(req, res, next) {
  var userId = req.cookies.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  User.update({"userId": userId, "cartList.productId": productId}, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
});

router.post("/editCheckAll", function(req, res, next) {
  var userId = req.cookies.userId,
      checkAll = req.body.checkAll ? '1' : '0';

  User.findOne({"userId": userId}, function(err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (user) {
        user.cartList.forEach((item) => {
          item.checked = checkAll;
        });
        user.save(function(err1, doc) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: '',
              result: ''
            })
          }
        })
      }
    }
  })
});

// Get the address list of a user
router.get("/addressList", function(req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId: userId}, function(err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result:''
      });
    } else {
      if (user) {
        res.json({
          status: '0',
          msg: '',
          result: user.addressList
        });
      }
    }
  })
});

// Set default address
router.post("/serDefault", function(req, res, next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1003',
      msg: "Address Id invalid",
      result: ''
    })
  }

  User.findOne({userId: userId}, function(err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      var addressList = user.addressList;
      addressList.forEach((item) => {
        if (item.addressId == addressId) {
          item.isDefault = true;
        } else {
          item.isDefault = false;
        }
      });

      user.save(function(err1, doc) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: ''
          })
        }
      })
    }
  })
});

// Delete an address
router.post("/delAddress", function(req, res, next) {
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;

  User.update({
    userId: userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: ''
      })
    }
  })
})

// Create an order
router.post("/payment", function(req, res, next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId,
      orderTotal = req.body.orderTotal;

  User.findOne({userId: userId}, function(err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
      return;
    } else {
      var address = '', goodsList = [];
      // Get the address info of the current user
      user.addressList.forEach((item) => {
        if (addressId == item.addressId) {
          address = item;
        }
      });

      // Get the cart list of the current user
      user.cartList.filter((item) => {
        if (item.checked == '1') {
          goodsList.push(item);
        }
      });

      // Generate the order ID
      var platform = '12138'; // So random haha
      var r1 = Math.floor(Math.random() * 10);
      var r2 = Math.floor(Math.random() * 10);

      var systemDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');

      var orderId = platform + r1 + systemDate + r2;

      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }

      user.orderList.push(order);
      user.save(function(err1, doc) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          });
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          });
        }
      });
    }
  })
});

// Get the order detail by orderId
router.get("/orderDetail", function(req, res, next) {
  var userId = req.cookies.userId;
  var orderId = req.param("orderId");

  User.findOne({userId: userId}, function(err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      var orderList = user.orderList;
      if (orderList.length > 0) {
        var orderTotal = '';
        orderList.forEach((item) => {
          if (item.orderId == orderId) {
            orderTotal = item.orderTotal;
          }
        });
        if (orderTotal > 0){
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: '10003',
            msg: 'This user did not create such order',
            result: ''
          })
        }

      } else {
        res.json({
          status: '10002',
          msg: 'No such order',
          result: ''
        })
        return;
      }
    }
  })
});

// Check login
router.get("/checkLogin", function(req, res, next) {
  var userId = req.cookies.userId;
  if (!userId) {
    res.json({
      status: '1',
      msg: 'Not login',
      result: ''
    });
  } else {
    User.findOne({userId: userId}, function(err, user) {
      if (err) {
        res.json({
          status: '1',
          msg: 'User not found',
          result: ''
        });
      } else {
        res.json({
          status: '0',
          msg: '',
          result: user.userName
        })
      }
    })
  }
});

// Get the count of the cart list
router.get("/getCartCount", function(req, res, next) {
  var userId = req.cookies.userId;
  if (!userId) {
    res.json({
      status: '1',
      msg: 'Please login in',
      result: ''
    });
  } else {

    User.findOne({userId: userId}, function(err, user) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        var cartList = user.cartList;
        let cartCount = 0;
        cartList.map(function(item) {
          cartCount += parseInt(item.productNum);
        });
        res.json({
          status: '0',
          msg: '',
          result: cartCount
        });
      }
    })
  }
})

module.exports = router;
