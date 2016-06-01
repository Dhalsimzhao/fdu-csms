define(function(require, exports, module) {
    var Backbone = require('backbone');
    var $ = require('jquery');
    var xk = require('biz/xk');
    var api = require('api');

    var AppRouter = Backbone.Router.extend({
        
        execute: function(callback, args, name) {
            // console.log('router execute');
            if (!xk.role) {
                var self = this;
                this.getRole().then(function(data){
                    // data = {role: '' || 'teacher' || 'student' || 'manager' };
                    if (!data.isLogin) {
                        goToLogin();
                        if (callback) callback.apply(self, args);
                    } else {
                        xk.role = data.loginType;
                        if (callback) callback.apply(self, args);
                    }
                }, function(err){
                    console.log(err);
                });
            } else {
                if (callback) callback.apply(self, args);
            }
        },

        addRoutes: function(obj){
            this.routes = this.routes || {};
            for(var key in obj) {
                this.routes[key] = obj[key];
            }
        },

        start: function(){
            this._bindRoutes();
            Backbone.history.start();
        },

        goto: function(route, opts) {
            opts = $.extend(true, opts || {}, {trigger: true});
            Backbone.history.navigate(route, opts);
        },

        getRole: function(){

            return api.getRole();
        }
    });
    
    var appRouter = new AppRouter();

    function goToLogin () {
        appRouter.goto('login');
    }

    return appRouter;
});