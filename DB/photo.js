var Photo = require('../models').Photo;
var PhotoInfo = require('../models').PhotoInfo;


/**
 * 通过提供的用户ID组统计所有标签数
 * @param Ids
 * @param callback
 */
exports.countTagsByUserIds = function(Ids,callback){
    var o = {};
    o.map = function(){
        var arr = [];
        if(typeof(this.tags) === 'string')
            arr =   this.tags.split(',');
        else
            arr = this.tags;
        arr.forEach(function(value){
            emit(value,{count:1});
        })
    }
    o.reduce = function(k, vals){
        var total = 0;
        for ( var i=0; i<vals.length; i++ )
            total += vals[i].count;
        return { count : total };
    }
    //只提取出属于该用户发布和分享的
    //  o.query = {$and : [{'user_id':{$in:Ids}},{$or:[{'post_at' : {$ne:null}},{'share_at':{$ne:null}}]}]};
    o.query = {$or : [{'author_id':{$in:Ids}},{'forward.forwarder_id':{$in:Ids}}]};

    PhotoInfo.mapReduce(o,callback);
}

/**
 * 将所用标签降序排列
 * @param authorId
 * @param callback
 */
exports.getMyFavirouteTags = function(authorId,filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{
                '_id.author' : authorId,
                '_id.tag' : {$nin: filterList}
            }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    )
}

/**
 * 获取直接好友的常用标签
 * @param friendList
 * @param callback
 */
exports.getMyFriendsFavirouteTags = function(friendList,filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tags:'$tags',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{ $and:[
                { '_id.author' : {$in:friendList}},
                {'_id.tags' : {$nin: filterList}}
            ]
            }
        },
        {
            $group:{
                _id:{
                    tag:'$_id.tags'
                },
                count:{$sum:'$count'}
            }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    )
}

/**
 * 获取二维朋友的常用标签
 * @param friendList
 * @param callback
 */
exports.getTwoDimensionFavirouteTags = function(authorId, friendList, filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {$unwind:'$forward'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    forwarder:'$forward.forwarder_id',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{ $and:[
                { '_id.tag' : {$nin:filterList}},
                { '_id.author' : {$ne:authorId}},
                { '_id.author' : {$nin:friendList}},
                { '_id.forwarder' : {$in:friendList}}
            ]
            }
        },{
            $group:{
                _id:'$_id.tag',
                count:{$sum:'$count'}
            }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    );
}

/**
 * 获取陌生人最喜欢的标签
 * @param authorId
 * @param friendList
 * @param filterList
 * @param limit
 * @param callback
 */
exports.getStrangerFavoriteTags = function(authorId, friendList, filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    forwarder:'$forward.forwarder_id',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{ $and:[
                { '_id.tag' : {$nin:filterList}},
                { '_id.author' : {$ne:authorId}},
                { '_id.author' : {$nin:friendList}},
                { '_id.forwarder' : {$nin:friendList}}
            ]
            }
        },{
            $group:{
                _id:{tag:'$_id.tag'},
                count:{$sum:'$count'}
            }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    );
}

/**
 * 获取最新的标签
 * @param filterList
 * @param limit
 * @param callback
 */
exports.getLatestTags = function(filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    date:'$post_at'
                }
            }
        },
        {
            $sort:{'date':-1}
        },
        {
            $match:{
                '_id.tag' : {$nin:filterList}
            }
        },
        {
            $limit:limit
        },
        callback
    )
}

/**
 * 统计所有标签
 * @param tags
 * @param callback
 */
exports.countTags = function(tags, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{
                '_id.tag' : {$in:tags}
            }
        },
        callback
    )
}

/**
 * 获取标签的封面
 * @param tagName
 * @param callback
 */
exports.getCoverForTag = function(tagName, callback){
    PhotoInfo.findOne({'tags':{$all:tagName}}).populate('photo_id').exec(callback);
}