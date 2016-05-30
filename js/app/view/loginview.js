define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    var api = require('api');
    var xk = require('biz/xk');
    var appRouter = require('router/approuter');

    var LoginView = Backbone.View.extend({
        template: _.template($('#login-template').html()),
        render: function() {
            if (!this.hasRendered) {
                this.$el.html(this.template);
                $('.login-container').append(this.$el);
                this.hasRendered = true;
            }
        },

        afterRender: function() {
            
        },

        show: function() {
            this.render();
            $('.app-container').hide();
            $('.login-container').show();
        },

        events: function() {
            return {
                'change .user-role select': this._onRoleChange,
                'click .login-btn': this._login,
            }
        },

        _onRoleChange: function(e) {
            var $e = $(e.currentTarget);
            var role = $e.val();
            if (role === 'student') {
                this.$('.user-id label').text('学号');
            } else {
                this.$('.user-id label').text('工号');
            }
        },

        _login: function (e) {
            e.preventDefault();
            api.login().then(function(data){
                xk.isLogin = true;
                xk.role = data.role;
                appRouter.goto(xk.role);
            });
        }
    });

    return new LoginView();
});