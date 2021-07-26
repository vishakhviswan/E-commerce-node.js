const { response } = require('express');
var express = require('express');
const { USER_COLLECTION } = require('../config/collections');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount });
  })
});
router.get('/signup', (req, res) => {
  res.render('user/user-signup')
});
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/user-login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    //console.log(response);

    req.session.user = response
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {

      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr = true
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.user = null
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  // console.log('***'+products);
  
  res.render('user/cart', { products, totalValue, user: req.session.user, cartCount })


});

router.get('/add-to-cart/:id', (req, res) => {
  //console.log('api call');
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
    // res.redirect('/')
  })
})
router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/remove-product', (req, res, next) => {
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let user = await userHelpers.getUser(req.session.user._id)
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)

  res.render('user/place-order', { total, user: req.session.user, cartCount, user })
});
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })

    }

  })
  console.log(req.body);
})

router.get('/orders', verifyLogin, async (req, res) => {
  let orderDetails = await userHelpers.getOrders(req.session.user._id)
  res.render('user/orders', { orderDetails, user: req.session.user })
});

router.get('/order-success', (req, res) => {

  res.render('user/order-success', { user: req.session.user })
});

router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  // let total=await userHelpers.getTotalOrderAmt(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })
});

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment Successfull");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/product-details/:id', async(req, res) => {
  let product = await userHelpers.getViewProducts(req.params.id)
  res.render('user/product-details', { user: req.session.user,product })
  
});

router.get('/user-profile',verifyLogin,async(req, res) => {
  let user = await userHelpers.getUser(req.session.user._id)
  res.render('user/user-profile', { user: req.session.user,user })
  
});
router.get('/create-profile',verifyLogin,async(req, res) => {
 // let user = await userHelpers.getUser(req.session.user._id)
  res.render('user/create-profile', { user: req.session.user})
  
});

router.post('/create-profile', (req, res) => {
  userHelpers.doCreatePro(req.body,req.session.user._id).then(()=>{
    res.redirect('/user-profile')
    // if(req.files.Image){
    //          let image=req.files.Image
    //          image.mv('./public/product-images/' + id + ".jpg")
  })
  
})

module.exports = router;

