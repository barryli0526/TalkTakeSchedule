/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 10:15 AM
 * To change this template use File | Settings | File Templates.
 */

var db = require('../DB/user');

db.getAllUser(function(err, data){
    console.log(data);
})