/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 9:55 AM
 * To change this template use File | Settings | File Templates.
 */

var User = require('../models').User;
var UserRelation = require('../models').UserRelation;

module.exports  = {
    getAllUser : function(cb){
        User.find(cb);
    },

    getFollowers : function(uid,limit, cb){
        if(limit instanceof Function){
            cb = limit;
            limit = 1000;
        }

        UserRelation.find({'user_id' : uid,$or:[{'status':1},{'status':3}]})
            .populate('follow_id')
            .sort('create_at')
            .limit(limit)
            .exec(cb);
    },

    getFriends : function(uid,cb){

        UserRelation.find({'user_id':uid,'status' : 3},'follow_id', cb);
    }
}