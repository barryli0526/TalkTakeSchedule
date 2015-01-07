/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 4:14 PM
 * To change this template use File | Settings | File Templates.
 */

module.exports = {
    userInfo : function(uid){
        return "talktake:user:" + uid;
    },
    recTags : function(uid){
        return "talktake:user:" + uid + ":recTags";
    }
}

