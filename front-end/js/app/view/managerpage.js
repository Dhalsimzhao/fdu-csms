define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');
    
    var enums = require('biz/enums');
    var bstable = require('bs-table-zh');
    var api = require('api');
    var appView = require('view/appview');
    var util = require('util');


    var ManagerPage = Backbone.View.extend({
        template: _.template($('#manager-template').html()),
        render: function() {
            var self = this;
            if (!this.hasRendered) {
                this.$el.html(this.template);
                $('.containers[role=manager]').append(this.$el);
                this.hasRendered = true;

                this.$('a[data-toggle="tab"]').on('show.bs.tab', function(e){
                    // debugger;
                    var $e = $(e.currentTarget),
                        act = $e.attr('act');

                    switch(act){
                        case 'commitcourse':
                            self.getUncommitedCourse();
                            break;
                        case 'modifycourse':
                            self.getCommitedCourse();
                            break;
                        case 'getallcourse':
                            self.getAllCourse();
                            break;
                        case 'getallstucourse':
                            self.getAllStuCourse();
                            break;
                        default:
                            ;
                    }
                });
            }
        },
        show: function() {
            this.render();
            this._initPlugins();
            $('.login-container').hide();
            $('.changepwd-container').hide();
            $('.app-container').show();
            appView.setHeader();
            $('.containers[role]').hide();
            $('.containers[role=manager]').show();
            this.$('a[data-toggle="tab"]').eq(0).click();
        },

        _initPlugins: function() {
            var self = this;
        },

        // 审批课程
        _initCommitCourse: function(json) {
            var self = this;
            if (this.commitCourseTable) {
                this.commitCourseTable.bootstrapTable('destroy');
            }

            var $table = this.$('.course-commit-table');
            this.commitCourseTable = $table;
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };

            tableOptions.columns = [
                {
                    field: 'course_name',
                    title: '课程名称'
                }, {
                    field: 'course_size',
                    title: '选课人数上限'
                }, {
                    field: 'course_restriction_grade',
                    title: '年级限制'
                }, {
                    field: 'course_restriction_major',
                    title: '专业限制'
                }, {
                    field: 'course_commit',
                    title: '审批',
                    formatter: function() {
                        return [
                            '<button class="btn btn-primary apply-course">同意</button>'
                        ].join('');
                    },
                    events: {
                        'click .apply-course': function(e, value, row, index){
                            console.log(arguments);
                            $table.bootstrapTable('remove', {
                                field: 'course_id',
                                values: [row.course_id]
                            });
                        }
                    }
                }
            ];

            for (var i = 0; i < json.data.length; i++) {
                var data = {};
                data.course_id = json.data[i].course_id;
                data.course_name = json.data[i].course_name;
                data.course_size = json.data[i].course_size;
                // data.course_time = json.data[i].course_time;
                // data.course_room = json.data[i].course_room;
                data.course_restriction_grade = json.data[i].course_restriction_grade;
                data.course_restriction_major = json.data[i].course_restriction_major;
                tableOptions.data.push(data);
            }

            this.commitCourseTable = $table.bootstrapTable(tableOptions);
        },

        // 修改课程
        _initModifyCourse: function(json){
            var self = this;
            if (this.modifyCourseTable) {
                this.modifyCourseTable.bootstrapTable('destroy');
            }
            var $table = this.$('.course-modify-table');
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };
            tableOptions.columns = [
                {
                    field: 'course_name',
                    title: '课程名称'
                }, {
                    field: 'course_size',
                    title: '选课人数上限',
                    editable: {
                        type: 'text',
                        validate: function (value) {
                            value = +$.trim(value);
                            if (isNaN(value)) {
                                return '请输入一个数字';
                            };
                            var datas = $table.bootstrapTable('getData'),
                                index = $(this).parents('tr').data('index'),
                                data = datas[index];
                            self.modifyCourse(data);
                        }
                    }
                }, {
                    field: 'course_time',
                    title: '上课时间',
                    editable: {
                        type: 'text',
                        // type: 'select',
                        validate: function (value) {
                            var datas = $table.bootstrapTable('getData'),
                                index = $(this).parents('tr').data('index'),
                                data = datas[index];
                            self.modifyCourse(data);
                        }
                    }
                }, {
                    field: 'course_room',
                    title: '上课地点',
                    editable: {
                        type: 'text',
                        validate: function (value) {
                            value = +$.trim(value);
                            if (isNaN(value)) {
                                return '请输入一个数字';
                            };
                            var datas = $table.bootstrapTable('getData'),
                                index = $(this).parents('tr').data('index'),
                                data = datas[index];
                            self.modifyCourse(data);
                        }
                    }
                }, {
                    field: 'course_restriction_grade',
                    title: '年级限制',
                    editable: {
                        type: 'text',
                        validate: function (value) {
                            
                            self.modifyCourse(data);
                        }
                    }
                }, {
                    field: 'course_restriction_major',
                    title: '专业限制',
                    editable: {
                        type: 'text',
                        validate: function (value) {
                            
                            self.modifyCourse(data);
                        }
                    }
                }
            ]

            for (var i = 0; i < json.data.length; i++) {
                var data = {};
                data.course_id = json.data[i].course_id;
                data.course_name = json.data[i].course_name;
                data.course_size = json.data[i].course_size;
                data.course_time = json.data[i].course_time;
                data.course_room = json.data[i].course_room;
                data.course_restriction_grade = json.data[i].course_restriction_grade;
                data.course_restriction_major = json.data[i].course_restriction_major;
                tableOptions.data.push(data);
            }

            this.modifyCourseTable = $table.bootstrapTable(tableOptions);
        },

        // 查看课程详情
        _initAllCourse: function(json){
            var self = this;
            if (this.allCourseTable) {
                this.allCourseTable.bootstrapTable('destroy');
            }
            var $table = this.$('.course-all-table');
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };
            tableOptions.columns = [
                {
                    field: 'course_name',
                    title: '课程名称'
                }, {
                    field: 'course_stuname',
                    title: '学生姓名',
                }, {
                    field: 'course_stucomment',
                    title: '评教成绩',
                }, {
                    field: 'course_stuscore',
                    title: '成绩',
                }
            ]

            for (var i = 0; i < json.data.length; i++) {
                var data = {};
                data.course_id = json.data[i].course_id;
                data.course_name = json.data[i].course_name;
                data.course_stuname = json.data[i].course_stuname;
                data.course_stucomment = json.data[i].course_stucomment;
                data.course_stuscore = json.data[i].course_stuscore;
                tableOptions.data.push(data);
            }

            this.allCourseTable = $table.bootstrapTable(tableOptions);
        },

        // 查看选课详情
        _initAllStuCourse: function(json){
            var self = this;
            if (this.allStuCourseTable) {
                this.allStuCourseTable.bootstrapTable('destroy');
            }
            var $table = this.$('.stucourse-all-table');
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };
            tableOptions.columns = [
                {
                    field: 'stu_name',
                    title: '学生姓名'
                }, {
                    field: 'course_name',
                    title: '所选课程'
                }, {
                    field: 'course_stuscore',
                    title: '成绩',
                }
            ]

            for (var i = 0; i < json.data.length; i++) {
                var data = {};
                data.stu_id = json.data[i].stu_id;
                data.stu_name = json.data[i].stu_name;
                data.course_name = json.data[i].course_name;
                data.course_stuscore = json.data[i].course_stuscore;
                tableOptions.data.push(data);
            }

            this.allStuCourseTable = $table.bootstrapTable(tableOptions);
        },

        getUncommitedCourse: function(){
            var self = this;
            api.getUncommitedCourse().then(function (json) {
                self._initCommitCourse(json);
            });
        },

        getCommitedCourse: function(){
            var self = this;
            api.getCommitedCourse().then(function (json) {
                self._initModifyCourse(json);
            });
        },

        getAllCourse: function () {
            var self = this;
            api.getAllCourse().then(function (json) {
                self._initAllCourse(json);
            });
        },

        getAllStuCourse: function () {
            var self = this;
            api.getAllStuCourse().then(function (json) {
                self._initAllStuCourse(json);
            });
        },

        modifyCourse: function (data) {
            api.modifyCourse(data);
        }
    });

    return new ManagerPage();
});