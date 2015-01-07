/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 12:01 PM
 * To change this template use File | Settings | File Templates.
 */
    var redis = require('redis');
var client = exports.client  = redis.createClient();

//client.flushdb();

//client.zrange('talktake:users:541930ce3466dde424ce606f:follower','0','0',function(err,doc){
//    console.log(doc);
//})

//client.get('talktake:user:541930ce3466dde424ce606f:recTags',function(err,doc){
//    console.log(doc);
//})
client.set('sdf',JSON.stringify([]));
 client.get('sdf', function(err, doc){
    console.log(doc);
});


//client.zcard('talktake:users:541930ce3466dde424ce606f:follower',function(err,doc){
//    console.log(doc);
//})