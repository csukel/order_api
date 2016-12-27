/**
 * Created by l.stylianou on 27/11/2016.
 */
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

var assert = require('assert');

var connect = function (databaseName, callback) {
    var url = 'mongodb://localhost:27017/' + databaseName;

    MongoClient.connect(url, function (error, database) {
        assert.equal(null, error);
        console.log("Successfully connected to MongoDB instance!");
        callback(database);
    });
};
exports.find = function (databaseName, collectionName, query, callback) {
    connect(databaseName, function (database) {
        // The collection we want to find documents from
        var collection = database.collection(collectionName);
        // Search the given collection in the given database for
        // all documents which match the criteria, convert them to
        // an array, and finally execute a callback on them.
        collection.find(query).toArray(
            // Callback method
            function (err, documents) {
                // Make sure nothing went wrong
                assert.equal(err, null);
                // Print all the documents that we found, if any
                console.log("MongoDB returned the following documents:");
                console.dir(documents);
                // Close the database connection to free resources
                database.close();
                //respond to the response callback
                if (documents && documents.length>0){
                    callback(null,documents);
                }else{
                    callback(err,null);
                }
            });
    });
};

exports.insert = function(databaseName,collectionName,query,response){
    connect(databaseName, function (database) {
        // The collection we want to find documents from
        var collection = database.collection(collectionName);
        // Search the given collection in the given database for
        // all documents which match the criteria, convert them to
        // an array, and finally execute a callback on them.
        if (query instanceof Array){
            collection.insertMany(query, function (err, result) {
                console.log(JSON.stringify(result.result));
                database.close();
                response(err,result.result);
            });
        }else {
            collection.insertOne(query, function (err, result) {
                console.log(JSON.stringify(result.result));
                database.close();
                response(err,result.result);
            });
        }

    });
};

exports.delete = function(databaseName,collectionName,query,response){
  connect(databaseName,function(database){
      var collection = database.collection(collectionName);
      collection.deleteOne(query,function(err,result){
          console.log(JSON.stringify(result.result));
          database.close();
          response(err,result.result);
      });
  });
};

exports.update = function(databaseName,collectionName,query,response){
    connect(databaseName, function (database) {
        // The collection we want to find documents from
        var collection = database.collection(collectionName);
        // Search the given collection in the given database for
        // all documents which match the criteria, convert them to
        // an array, and finally execute a callback on them.
        if (query instanceof Array){
            collection.updateMany(query, function (err, result) {
                console.log(JSON.stringify(result.result));
                database.close();
                response(err,result.result);
            });
        }else {
            var id = new mongo.ObjectID(query._id);
            query._id = id;
            collection.updateOne(query,query, function (err, result) {
                console.log(JSON.stringify(result.result));
                database.close();
                response(err,result.result);
            });
        }

    });
};