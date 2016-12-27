/**
 * Created by l.stylianou on 28/11/2016.
 */
var database = require('./database');

database.insert('OrderBase','Products',{"name":"Test","price":2});
database.insert('OrderBase','Products',[{"name":"Test","price":3},{"name":"Test","price":4}]);