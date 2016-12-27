/**
 * Created by l.stylianou on 26/12/2016.
 */

var db = require('./database');

module.exports = {
  database: 'OrderBase',
    collection:'AccessToken',
    generateToken: function(user,callback){
      var token = {
        userID: user._id
      };
      db.insert(this.database,this.collection,token,function(err,res){
          if (err){
              callback(err,null);
          }else {
             callback(null,res);
          }
      });
    },
    authenticate: function(user,password,callback){
        if (user.password === password ){
            //create a new token for the user
            this.generateToken(user,function(err,res){
               callback(null,res);
            });
        }else {
            callback({error:'Authentication Error',message:'Incorrect username or password'},null);
        }
    }
};