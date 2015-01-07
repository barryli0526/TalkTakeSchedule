/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 10:38 AM
 * To change this template use File | Settings | File Templates.
 */

var User = require('../DB/user');
var async = require('async');
var redis  = require('redis');
var client = exports.client  = redis.createClient();
var tagTask = require('./tag');

var PREFIX = {
    USERINFO : 'talktake:users:'

}

var expireTime = 60;//2小时


var CacheUser = {
    setUserInfo : function(user){
//        console.log(user._id);
        client.set(PREFIX.USERINFO+user._id, user.toString());
    },
    setUserFollowers : function(uid){

        var FOLLOWER = PREFIX.USERINFO+uid+':follower',
            FOLLOWING = PREFIX.USERINFO+uid+':following';
        //获取关注者，默认1000条
        User.getFollowers(uid, function(err, followersRelation){
            //清空集合
            client.del(FOLLOWER);

            var multi = client.multi(),
                score = 0;
            async.eachSeries(followersRelation,
                function(item, callback){

                    var follower = {};
                    var followerInfo = item.follow_id;
                    follower.userId = followerInfo._id;
                    follower.name = item.remark_name ? item.remark_name : followerInfo.showName;
                    follower.avatar = followerInfo.avatar;
                    //添加前1000位关注者
                    multi.zadd(FOLLOWER, score++ , JSON.stringify(follower));
//                    multi.expire(FOLLOWER,expireTime);

                    callback(null);
                },
                function(err){
                    multi.exec();
                }
            )
        })
    }
}


module.exports = {
    syncUserInfo : function(callback){
        User.getAllUser(function(err, users){

            async.map(users, function(user, cb){

                //update user info
                async.parallel([
                    //获取
                    CacheUser.setUserInfo(user),
                    tagTask.loadRecommendTags(user._id)
//                    CacheUser.setUserFollowers(user._id)
                ])
                 cb(null);
            },function(err){
                callback(err);
            })
        })
    }
}