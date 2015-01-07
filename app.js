/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 9:39 AM
 * To change this template use File | Settings | File Templates.
 */

var redis  = require('redis');

var client = exports.client  = redis.createClient();