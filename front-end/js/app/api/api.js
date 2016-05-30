define(function(require, exports, module){
    var debug = true;
    var $ = require('jquery');

    $.ajaxSetup({
        beforeSend: function(){
            $('.body-loading-box').show();
        },
        complete: function(){
            $('.body-loading-box').hide();
        }
    });

    // $.ajaxSend(function(event, xhr, settings) {
    //     $('.body-loading-box').show();
    // });

    // $.ajaxComplete(function(event, xhr, settings) {
    //     $('.body-loading-box').hide();
    // });
    
    function API () {
        this._urlprefix = '/';
    }

    API.prototype.fake = function(fakeData) {
        var def = $.Deferred();
        $('.body-loading-box').show();
        setTimeout(function(){
            $('.body-loading-box').hide();
            def.resolve(fakeData);
        }, 300);

        return def.promise();
    }

    API.prototype.getRole = function() {

        if (debug) {
            return this.fake({
                role: ''
            });
        } else {
            var def = $.Deferred();

            var url = '/getRole';
            $.get(url, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.login = function(data) {
        if (debug) {
            var role = $('.user-role > select').val();
            return this.fake({
                role: role
            });
        } else {
            var def = $.Deferred();
            var url = '/login';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        } 
    }

    API.prototype.logout = function(data) {
        if (debug) {
            return this.fake({});
        } else {
            var def = $.Deferred();
            var url = '/logout';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        } 
    }

    API.prototype.getProfile = function(data) {
        if (debug) {
            return this.fake({
                username: '费曼先生',
                gender: 'M',
                grade: 2
            });
        } else {
            var def = $.Deferred();
            var url = '/submitprofile';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.submitProfile = function(data) {
        if (debug) {
            return this.fake({});
        } else {
            var def = $.Deferred();
            var url = '/submitprofile';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }
    
    // teacher api
    API.prototype.createCourse = function(data) {
        if (debug) {
            return this.fake({
                
            });
        } else {
            var def = $.Deferred();
            var url = '/course';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.submitScore = function() {
        if (debug) {
            return this.fake({
                
            });
        } else {
            var def = $.Deferred();
            var url = '/submitscore';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.getTeacherCourse = function() {
        if (debug) {
            return this.fake({
                data: [
                    {
                        course_id: 'id1',
                        course_name: '课程名称1',
                        stu_no: '062458',
                        stu_name: '陈博',
                        stu_gender: 'M',
                        stu_grade: 2,
                        stu_major: 'major_XY',
                    },
                    {
                        course_id: 'id2',
                        course_name: '课程名称2',
                        stu_no: '062500',
                        stu_name: '陈博雅',
                        stu_gender: 'F',
                        stu_grade: 2,
                        stu_major: 'major_XX',
                    },
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/teachercourse';
            $.get(url, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    // student api
    API.prototype.getStudentCourse = function() {
        if (debug) {
            return this.fake({
                data: [
                    {
                        course_id: 'id1',
                        course_name: '课程名称1',
                        course_size: 40,
                        course_time: ['A2', 'D7'],
                        course_room: '250',
                        stucourse_status: 0
                    },
                    {
                        course_id: 'id2',
                        course_name: '课程名称2',
                        course_size: 30,
                        course_time: ['A4', 'B2'],
                        course_room: '052',
                        stucourse_status: 1
                    },
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/teachercourse';
            $.get(url, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.chooseCourse = function(data) {
        if (debug) {
            return this.fake({
                
            });
        } else {
            var def = $.Deferred();
            var url = '/choosecourse';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.cancleCourse = function(data) {
       if (debug) {
           return this.fake({
               
           });
       } else {
           var def = $.Deferred();
           var url = '/canclecourse';
           $.post(url, data, function(data){
               def.resolve(data);
           }, function(err){
               def.reject(err);
           });

           return def.promise();
       }
    }
    
    API.prototype.getStudentChoosedCourse = function() {
        if (debug) {
            return this.fake({
                data: [
                    {
                        course_id: 'id1',
                        course_name: '课程名称1',
                        course_size: 60,
                        course_time: ['A2', 'D7'],
                        course_restriction_grade: [1, 2],
                        course_restriction_major: ['major_a', 'major_x'],
                    },
                    {
                        course_id: 'id2',
                        course_name: '课程名称2',
                        course_size: 59,
                        course_time: ['B4', 'E5'],
                        course_restriction_grade: [3],
                        course_restriction_major: ['major_d', 'major_c'],
                    },
                    {
                        course_id: 'id3',
                        course_name: '课程名称3',
                        course_size: 59,
                        course_time: ['C10', 'D3'],
                        course_restriction_grade: [3],
                        course_restriction_major: ['major_d', 'major_c'],
                    }
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/stuchoosedcourse';
            $.get(url, {}, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    // manager api
    API.prototype.getUncommitedCourse = function() {
        if (debug) {
            return this.fake({
                data: [
                    {
                        course_id: 'id1',
                        course_name: '课程名称1',
                        course_size: 60,
                        course_time: ['A2', 'D7'],
                        course_restriction_grade: [1, 2],
                        course_restriction_major: ['major_a', 'major_x'],
                    },
                    {
                        course_id: 'id2',
                        course_name: '课程名称2',
                        course_size: 59,
                        course_time: ['B4', 'E5'],
                        course_restriction_grade: [3],
                        course_restriction_major: ['major_d', 'major_c'],
                    }
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/stucourse';
            $.get(url, { groupBy: 'courseId'}, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    API.prototype.modifyCourse = function(data) {
        if (debug) {
            return this.fake({
                
            });
        } else {
            var def = $.Deferred();
            var url = '/modifyCourse';
            $.ajax({
                url: '',
                data: data,
                method: 'PATCH',
                success: function (json) {
                    def.resolve(data);
                },
                error: function (err) {
                    console.log(err);
                    def.reject(err);
                }
            });

            return def.promise();
        }
    }

    API.prototype.getCommitedCourse = function(data) {
        if (debug) {
            return this.fake({
                data: [
                    {
                        course_id: 'id1',
                        course_name: '课程名称1',
                        course_size: 60,
                        course_time: ['A2', 'D7'],
                        course_room: '205',
                        course_restriction_grade: [1, 2],
                        course_restriction_major: ['major_a', 'major_x'],
                    },
                    {
                        course_id: 'id2',
                        course_name: '课程名称2',
                        course_size: 59,
                        course_time: ['B4', 'E5'],
                        course_room: '303',
                        course_restriction_grade: [3],
                        course_restriction_major: ['major_d', 'major_c'],
                    }
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/commitedcourse';
            $.ajax({
                url: '',
                data: data,
                method: 'GET',
                success: function (json) {
                    def.resolve(data);
                },
                error: function (err) {
                    console.log(err);
                    def.reject(err);
                }
            });

            return def.promise();
        }
    }

    API.prototype.getAllCourse = function(data) {
        if (debug) {
            return this.fake({
                data: [
                    {
                        course_id: 'id1',
                        course_name: '课程名称1',
                        course_stuname: '学生姓名1',
                        course_stucomment: 90,
                        course_stuscore: 100,
                    },
                    {
                        course_id: 'id2',
                        course_name: '课程名称2',
                        course_stuname: '学生姓名2',
                        course_stucomment: 70,
                        course_stuscore: 00,
                    }
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/allcourse';
            $.ajax({
                url: '',
                data: data,
                method: 'GET',
                success: function (json) {
                    def.resolve(data);
                },
                error: function (err) {
                    console.log(err);
                    def.reject(err);
                }
            });

            return def.promise();
        }
    }
    
    API.prototype.getAllStuCourse = function(data) {
        if (debug) {
            return this.fake({
                data: [
                    {
                        stu_id: 'sid1',
                        stu_name: '学生姓名1',
                        course_name: '课程名称1',
                        course_stuscore: 60,
                    },
                    {
                        stu_id: 'sid1',
                        stu_name: '学生姓名1',
                        course_name: '课程名称2',
                        course_stuscore: 90,
                    },
                    {
                        stu_id: 'sid2',
                        stu_name: '学生姓名2',
                        course_name: '课程名称4',
                        course_stuscore: 80,
                    }
                ]
            });
        } else {
            var def = $.Deferred();
            var url = '/stucourse';
            $.ajax({
                url: '',
                data: data,
                method: 'GET',
                success: function (json) {
                    def.resolve(data);
                },
                error: function (err) {
                    console.log(err);
                    def.reject(err);
                }
            });

            return def.promise();
        }
    }

    API.prototype.debug = function() {
        if (debug) {
            return this.fake({
                role: ''
            });
        } else {
            var def = $.Deferred();
            var url = '/login';
            $.post(url, data, function(data){
                def.resolve(data);
            }, function(err){
                def.reject(err);
            });

            return def.promise();
        }
    }

    return new API();
});