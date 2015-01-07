/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 2:28 PM
 * To change this template use File | Settings | File Templates.
 */

var User = require('../DB/user');
var Photo = require('../DB/photo');
var async = require('async');
var redis  = require('redis');
var client = exports.client  = redis.createClient();

var PREFIX = {
    USERINFO : 'talktake:users:'

}

var TagsCache = {
    getRecommendTags : function(uid, callback){

        var filterList = [], results = [], count= 0,limit=3;

        async.waterfall([
            function(cb){
                console.log('sd')
                User.getFriends(uid, function(err, docs){

                    if(err){
                        cb(err);
                    }

                    var Ids = [];

                    for(var i=0;i<docs.length;i++){
                        Ids[i] = docs[i].follow_id;
                    }
                    cb(null, uid, Ids, filterList);
                })
            },
            function(uid, Ids, filterList, cb){
                console.log(filterList);
                  Photo.getMyFavirouteTags(uid, filterList, limit, function(err, tags){

                      if(err){
                          cb(err);
                      }

                      for(var i=0;i<tags.length;i++){
                          filterList.push(tags[i]._id.tag);
                      }
                      cb(null, uid, Ids, filterList);
                  })
            },
            function(uid, Ids, filterList, cb){
                Photo.getMyFriendsFavirouteTags(Ids, filterList, limit, function(err, tags){
                    if(err){
                        cb(err);
                    }
                    for(var i=0;i<tags.length;i++){
                        filterList.push(tags[i]._id.tag);
                    }
                    cb(null, uid, Ids, filterList);
                })
            },
            function(uid, Ids, filterList, cb){
                Photo.getTwoDimensionFavirouteTags(uid, Ids, filterList, limit, function(err, tags){
                    if(err){
                        cb(err);
                    }
                    for(var i=0;i<tags.length;i++){
                        filterList.push(tags[i]._id.tag);
                    }
                    cb(null, uid, Ids, filterList);
                })
            },
            function(uid, Ids, filterList, cb){
                Photo.getStrangerFavoriteTags(uid, Ids, filterList, limit, function(err, tags){
                    if(err){
                        cb(err);
                    }
                    for(var i=0;i<tags.length;i++){
                        filterList.push(tags[i]._id.tag);
                    }
                    cb(null, uid, Ids, filterList);
                })
            },
            function(uid, Ids, filterList, cb){
                Photo.getLatestTags(filterList, limit, function(err, tags){
                    if(err){
                        cb(err);
                    }
                    for(var i=0;i<tags.length;i++){
                        filterList.push(tags[i]._id.tag);
                    }
                    cb(null, uid, Ids, filterList);
                })
            },
            function(uid, Ids, filterList, cb){
                Photo.countTags(filterList, function(err, tags){
                    if(err){
                        cb(err);
                    }
                    cb(null, tags);
                })
            },
            function(tags, cb){
                async.map(tags, function(item, fn){
                    var tag = {};
                    tag.tagName = item._id.tag;
                    tag.count = item.count;
                    Photo.getCoverForTag(item._id.tag, function(err, doc){
                        if(err){
                            fn(err);
                        }
                        tag.cover = doc.photo_id.source_url + '?imageView2/2/w/640/format/jpg/q/50';
                        fn(null, tag);
                    })
                }, function(err, results){
                    if(err){
                        cb(err);
                    }else{
                        cb(null, results);
                    }
                })
            }
        ], function(err, results){
             if(err){
                 return callback(err,[]);
             }else{
                 return callback(null, results);

             }
        })
    },
    setRecommendTags : function(uid, tags, cb){
        try{
            console.log(uid);
            var RecTags = 'talktake:user:' + uid + ':recTags';
            client.del(RecTags);
            client.set(RecTags, JSON.stringify(tags));
            cb(null);
        }catch(e){
            cb(e);
        }

    }
}

module.exports = {
    loadRecommendTags : function(uid){
        async.waterfall([
            function(cb){
                TagsCache.getRecommendTags(uid, cb);
            },
            function(tags, cb){

                TagsCache.setRecommendTags(uid, tags, cb);
            }],
            function(err){
                if(err){
                    // log err
                }
            }
        )
    }
}


