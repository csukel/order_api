/**
 * Created by l.stylianou on 27/11/2016.
 */
var database = require('./database');
var http = require('http');
var URL = require('url');
var contentType = {'Content-Type':'application/json'};
var mongo = require('mongodb');
var authenitcation = require('./authentication');


function findAllResources(resourceName,req,res){
   database.find('OrderBase',resourceName,{},function (err,resources) {
       res.writeHead(200,contentType);
       res.end(JSON.stringify(resources));
   });
};

var insertUser = function(user,req,res){
  insertResource('User',user,req,res);
};

var deleteResourceById = function(resourceName,id,req,res){
    database.delete('OrderBase',resourceName,{'_id':id},function(err,dbResponse){
        res.writeHead(200,contentType);
        res.end(JSON.stringify(dbResponse));
    })
};

var deleteProductById = function(id,req,res){
    deleteResourceById('Products',id,req,res);
}

var findResourceById = function(resourceName,id,req,res){
   //id = id.substring(0,id.length-2);
  database.find('OrderBase',resourceName,{'_id':new mongo.ObjectID(id)},function (err,resource) {
      res.writeHead(200,contentType);
      res.end(JSON.stringify(resource));
  }) ;
};

var findAllProducts = function (req,res) {
  findAllResources('Products',req,res);
};

var findProductById = function (id,req,res) {
    findResourceById('Products',id,req,res);
};

var findUserByEmail = function(query,req,res){
  database.find('OrderBase','User',{email:query.email},function(err,response){
      if (!response){
          res.writeHead(404,contentType);
          res.end(JSON.stringify({error:'User not found',message:'No user found with the specified email'}));
      }else {
          //authenticate
          authenitcation.authenticate(response[0],query.password,function(err,token){
              if (err){
                  res.writeHead(404,contentType);
                  res.end(JSON.stringify({error:'Authentication failur',message:'User email and password do not match'}));
              }else{
                  res.writeHead(200,contentType);
                  res.end(JSON.stringify(token));
              }
          });
      }
  });
};

var insertResource = function(resourceName,resource,req,res){
   database.insert('OrderBase',resourceName,resource,function(err,response){
      res.writeHead(200,contentType);
      res.end(JSON.stringify(response));
   });
};
var insertProduct = function(postJSON,req,res){
   insertResource('Products',postJSON,req,res);
};

var updateResource = function(resourceName,resource,req,res){
    database.update('OrderBase',resourceName,resource,function(err,response){
        res.writeHead(200,contentType);
        res.end(JSON.stringify(response));
    });
};
var updateProduct = function(postJSON,req,res){
    updateResource('Products',postJSON,req,res);
};

var server = http.createServer(function(req,res){
   //Break down the incoming URL into its components
    var parsedURL = URL.parse(req.url,true);

    switch (parsedURL.pathname){
        case "/api/products" :
           if (req.method === 'GET'){
               //Find and return the product with the given id
               if(parsedURL.query.id){
                   findProductById(parsedURL.query.id,req,res);
               }
               //There is no id specified, return all products
               else {
                   findAllProducts(req,res);
               }
           }else if (req.method === 'POST'){
               var body = '';
               req.on('data',function (dataChunk) {
                  body += dataChunk;
               });
               req.on('end',function () {
                   //Done pulling data from the POST body
                   var postJSON = {msgType:'E',msg:'Request body incorrect'};
                   try {
                       postJSON = JSON.parse(body);
                       insertProduct(postJSON,req,res);
                   }catch(ex){
                       res.writeHead(200,contentType);
                       res.end(JSON.stringify(postJSON));
                   }


               });
           } else if(req.method==='DELETE'){

               if(parsedURL.query.id){
                   var ProductId = null ;
                   try {
                       ProductId = new mongo.ObjectID(parsedURL.query.id);
                       deleteProductById(ProductId,req,res);
                   }catch (ex){
                       var postJSON = {msgType:'E',msg:'Id is not valid'};
                       res.writeHead(200,contentType);
                       res.end(JSON.stringify(postJSON));
                   }
               }else {
                   var postJSON = {msgType:'E',msg:'Id of the resource was not provided'};
                   res.writeHead(200,contentType);
                   res.end(JSON.stringify(postJSON));
               }
           }else if (req.method ==='PUT'){
               //Done pulling data from the POST body
               var postJSON = {msgType:'E',msg:'Request body incorrect'};
               try {
                   postJSON = JSON.parse(body);
                   updateProduct(postJSON,req,res);
               }catch(ex){
                   res.writeHead(200,contentType);
                   res.end(JSON.stringify(postJSON));
               }
           }


            break;
        case '/api/users/register':
            if (req.method ==='POST'){
                var body = '';
                req.on('data',function (dataChunk) {
                    body += dataChunk;
                });
                req.on('end',function () {
                    //Done pulling data from the POST body
                    var postJSON = {msgType:'E',msg:'Request body incorrect'};
                    try {
                        postJSON = JSON.parse(body);
                        if(postJSON.email && postJSON.password && postJSON.firstName && postJSON.lastName){
                            insertUser(postJSON,req,res);
                        }else {
                            res.writeHead(200,contentType);
                            res.end(JSON.stringify({msgType:'E',msg:'All mandatory fields must be provided'}));
                        }
                    }catch(ex){
                        res.writeHead(200,contentType);
                        res.end(JSON.stringify(postJSON));
                    }


                });
            }else {
                var postJSON = {msgType:'E',msg:'Oops something went wrong'};
                res.writeHead(200,contentType);
                res.end(JSON.stringify(postJSON));
            }
            break;

        case '/api/users/login':
            if (req.method === 'POST'){
                var body = '';
                req.on('data',function(dataChunk){
                   body += dataChunk;
                });
                req.on('end',function(){
                    //Done pulling data from the POST body
                    var postJSON = {msgType:'E',msg:'Request body incorrect'};
                    try {
                        postJSON = JSON.parse(body);
                        if(postJSON.email && postJSON.password){
                            findUserByEmail(postJSON,req,res);
                        }else {
                            res.writeHead(200,contentType);
                            res.end(JSON.stringify({msgType:'E',msg:'All mandatory fields must be provided'}));
                        }
                    }catch(ex){
                        res.writeHead(200,contentType);
                        res.end(JSON.stringify(postJSON));
                    }
                });
            }
            break;
        default:
           res.end('You shall not pass!');
    }
});

server.listen(3000);
console.log('Up, running and ready for action!');