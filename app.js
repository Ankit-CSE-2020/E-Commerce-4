const express=require('express');
const fs=require('fs');
const session = require('express-session');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


const app=express();


let userData=[];
let addProToCart=[];
let addProduct=[];

app.use(session({
  secret: 'keyboard cat cat',
  resave: true,
  saveUninitialized: true,
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')

app.use(upload.single("pic"));

app.use(express.static("public"));
app.use(express.static("uploads"))



app.get('/',(req,res)=>{
  res.render('homepage')
})

app.get('/dashboard',(req,res)=>{
        
        res.render('dashboard',{loginOrNot:req.session.isLogedIn,name:req.session.username})
 
    
})

app.post('/dashboard',(req,res)=>{

     let data=req.body;
     saveToCart(data,function (error) {
      if (error) {
        res.status(500);
        res.send("error in save data to cart  ")
      }
      else{
        res.status(200);
        res.send()
      }
     })
})

app.get('/products.json', (req, res) => {
  const products = require('./product.json');
  res.json(products);
});

app.get('/cart',function(req,res){
  res.render('cart',{name:req.session.username});
})


app.get('/cartproducts.json',(req,res)=>{
  const products=require('./cart.json');
  res.json(products);
})


app.get('/admin',(req,res)=>{
  if(req.session.isLogedIn){
    if (req.session.email==='ankitbirania990@gmail.com' && req.session.password==='123') {
        res.render('admin');
    }
    else{
      res.send('Not authorized to use this page')
    }
  }
  else{
    res.redirect('/login')
  }
})

app.post('/admin',(req,res)=>{
  let productName=req.body.pname
  let productDescription=req.body.pdescription
  let productPrice=req.body.pprice
  let productPic=req.body.pimg;

  let newProduct={
    title:productName,
    description:productDescription,
    price:productPrice,
    thumbnail:productPic
  }
  console.log(newProduct);

  saveToProduct(newProduct,function(error){
    if (error) {
      res.send('Product not save succ...')
    }
    else{
      res.send('Product save succ...')
    }
  })
  
})


app.get('/signup',(req,res)=>{
  res.render('signup');
})

app.post('/signup',(req,res)=>{
  const name=req.body.username
  const email=req.body.useremail
  const password=req.body.userpassword

  saveUserInfo(name,email,password,function(error){
    if (error) {
        res.status(403);
        res.send("user info not save succ..");
    }
    else{
        res.redirect('/login')

    }
})
  
})



app.get('/login',(req,res)=>{
  res.render('login');
})

app.post('/login',(req,res)=>{
  const name=req.body.username
  const email=req.body.useremail
  const password=req.body.userpassword

  getUserInfo(email,password,function(error){
      if (error) {
        res.send('user not able to login..something wrong')
      }
      else{
          req.session.isLogedIn=true;
          req.session.username=name;
          req.session.email=email;
          req.session.password=password;
          res.redirect('/dashboard')
      }
  })
})


app.listen(3000,()=>{
  console.log('server run at port 3000');

})






function getUserInfo(email,password,callback){
  fs.readFile('userinfo.text','utf-8',function (error,data) {
        if (error) {
          callback(error);
        }
        else{
          
            let userDataBase=JSON.parse(data);
 
            const user=userDataBase.find((user)=>{
             if(user.email===email && user.password===password){
               return user;
              }
            })
 
            if (user) {
              callback();
            }
            else{
              callback('user not found');
            }
 
        }
       
  })
 }




function saveUserInfo(name,email1,password1,callback) {
  fs.readFile('userinfo.text','utf-8',function (error,data) {
      if (error) {
          callback(error);
      }
      else{
           
       if(data.length===0){
         data='[]';
     }
 
            let userDataBase=JSON.parse(data);
        
          const user=userDataBase.filter((user)=>{
              if(user.email===email1 && user.password===password1){
               return user;
              }
                               
            })
          
            if (user.length===1) {
              callback('user exist')
            }
            else{
              
              let uinfo={name:name,email:email1,password:password1}
 
               userData.push(userDataBase);
               userData.push(uinfo)
                fs.writeFile('userinfo.text',JSON.stringify(userData),function(error){
                  if (error) {
                      callback(error);
                  }
                  else{
                      callback();
                  }
                })
            }
    
      }  
  })
 }




function saveToCart(pThumbnail,callback){
  fs.readFile('product.json','utf-8',function(error,data){
    if (error) {
      callback(error);
    }
    else{
      if (data.length===0) {
        data='[]';
      }

      let alldata=JSON.parse(data);
      let userProduct=alldata.find((product)=>{
        if(product.thumbnail===pThumbnail.thumbnail){
          return product;
        }
      })
      
     if (userProduct.length===0) {
      callback('error')
     }
     else{

          fs.readFile('cart.json','utf-8',function(err,data){
            if(err){
              callback(err);
            }
            else{
              if (data.length===0) {
                data='[]';
              }
             
              // let allCartProduct=JSON.parse(data);
              
              // addProToCart.push(allCartProduct);
              addProToCart.push({title:userProduct.title,thumbnail:userProduct.thumbnail,price:userProduct.price,description:userProduct.description});

              fs.writeFile('cart.json',JSON.stringify(addProToCart),function (error) {
                if (error) {
                  callback(error);
                }
                else{
                  callback();
                }
              })
            }
          })
     }
    }
  })
}


function saveToProduct(newProduct,callback){
  fs.readFile('product.json','utf-8',function (error,data) {
    if(error){
      callback(error);
    }
    else{
      let allProduct=JSON.parse(data);
      console.log('-------------------');
       allProduct.push(newProduct);
     // console.log('items',addProduct);
      //  addProduct.push(newProduct)
      console.log('items',allProduct);
      

       fs.writeFile('product.json',JSON.stringify(allProduct),function (error) {
        if (error) {
          callback(error);
        }
        else{
          callback();
        }
      })
      
    }
  })
}