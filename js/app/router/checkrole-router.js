define(function(require, exports, module) {
    var Backbone = require('backbone');
    var api = require('api');
    var appRouter = require('router/approuter');

    function checkRole () {
        api.getRole().then(function(json){
        	// if (json.role) {
        		appRouter.goto(json.role || 'login');
        	// }
        });
    }

    return {
        '': checkRole
    }
});