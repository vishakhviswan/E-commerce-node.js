var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  let admin = req.session.admin
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { products,admin, adminHeader:true });
  })

});
router.get('/add-product', (req, res) => {
  res.render('admin/add-product',{adminHeader:true})
})
router.post('/add-product', (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + ".jpg", (err) => {
      if (!err) {
        res.render("admin/add-product")
      } else {
        console.log(err);
      }
    })
    res.render("admin/add-product")
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
    
  })
  })
// method 1 (id passing)
// router.get('/delete-product/',(req,res)=>{
// let proId=req.query.id
// console.log(proId);
// })

router.get('/edit-product/:id',async (req,res)=>{
    let product=await productHelpers.getProductDetails(req.params.id)
    console.log(product);
    res.render("admin/edit-product",{product})
  
  })
  router.post('/edit-product/:id',(req,res)=>{
    let id=req.params.id
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin')
      if(req.files.Image){
        let image=req.files.Image
        image.mv('./public/product-images/' + id + ".jpg")
      }
    })
  })

  router.get('/orders',async(req,res)=>{
    let allOrders = await adminHelpers.getAllOrders()
    res.render("admin/all-orders",{allOrders,adminHeader:true})
    
   
  })

  router.get('/users',async(req,res)=>{
    let users = await adminHelpers.getAllUsers([])
    res.render("admin/all-users",{users,adminHeader:true})
  })


module.exports = router;
