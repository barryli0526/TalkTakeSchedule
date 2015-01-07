/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */

var task = require('./tasks/user');

function Sync(){
    console.log('sync between redis and mongodb');
    task.syncUserInfo(function(err){
        if(err){
            //log and
        }else{
            setTimeout(function(){
               Sync();
            }, 2*60*60*1000)
        }
    })
}

Sync();


