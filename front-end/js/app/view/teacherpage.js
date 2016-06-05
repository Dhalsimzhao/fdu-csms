define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');
    
    var xk = require('biz/xk');    
    var enums = require('biz/enums');
    var util = require('util');
    var tokenfield = require('tokenfield');
    var bstable = require('bs-table-zh');
    var api = require('api');
    var appView = require('view/appview'); 
    var appRouter = require('router/approuter');

    var TeacherPage = Backbone.View.extend({
        template: _.template($('#teacher-template').html()),
        render: function() {
            var self = this;
            if (!this.hasRendered) {
                this.$el.html(this.template);
                $('.containers[role=teacher]').append(this.$el);
                this.hasRendered = true;

                this.$('a[data-toggle="tab"]').on('show.bs.tab', function(e){
                    // debugger;
                    var $e = $(e.currentTarget),
                        act = $e.attr('act');

                    switch(act){
                        case 'profile':
                            self.getProfile();
                            break;
                        case 'createcourse':
                            self.showCreateCourse();
                            break;
                        case 'getteachercourse':
                            self.getTeacherCourse();
                            break;
                        default:
                            ;
                    }
                });
            }
        },

        events: function () {
            return {
                'click .change-pwd': function(){
                    appRouter.goto('changepwd');
                },
                'click .apply-btn': this.createCourse,
            }
        },

        show: function() {
            this.render();
            $('.login-container').hide();
            $('.changepwd-container').hide();
            $('.app-container').show();
            appView.setHeader();
            $('.containers[role]').hide();
            $('.containers[role=teacher]').show();
            this.$('a[data-toggle="tab"]').eq(0).click();
        },

        _initTeacherCourse: function (courses) {
            var self = this;
            if (this.teacherCourseTable) {
                this.teacherCourseTable.bootstrapTable('destroy');
            }

            // init table
            var $table = this.$('.teacher-courses-table');
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };
            tableOptions.columns = [
                {
                    field: 'courseName',
                    title: '课程名称'
                }, {
                    field: 'courseSize',
                    title: '人数上限'
                }, {
                    field: 'courseRestrictionGrade',
                    title: '年级限制'
                }, {
                    field: 'courseRestrictionMajor',
                    title: '专业限制'
                }, {
                    field: 'courseCredits',
                    title: '学分'
                }, {
                    field: 'coursePeriod',
                    title: '学时'
                }, {
                    field: 'courseStatus',
                    title: '审核状态'
                }, {
                    field: 'courseEnrollment',
                    title: '已选人数'
                }, {
                    field: 'applyTime',
                    title: '上课时间',
                    formatter: function (times) {
                        return util.parseTimesToHtml(times);
                    }
                }, {
                    field: 'viewStudents',
                    title: '选课详情',
                    formatter: function(value, row, index) {
                        var html;
                        html ='<button class="btn btn-primary view-students">查看</button>';
                        return html;
                    },
                    events: {
                        'click .view-students': function(e, value, row, index){
                            // debugger;
                            self.$('.course-students-modal .course-name').text(row.courseName);
                            self.getCourseStudents(row.courseId).then(function (students) {
                                self._initCourseStudensTable(students);
                                self.$('.course-students-modal').modal('show');
                            });
                        }
                    }
                }
            ];

            for (var i = 0; i < courses.length; i++) {
                var data = {};
                _.each(tableOptions.columns, function(column){
                    data[column.field] = courses[i][column.field];
                });
                data.courseId = courses[i]['id'];
                tableOptions.data.push(data);
            }
            
            this.teacherCourseTable = $table.bootstrapTable(tableOptions);
        },

        _initCourseStudensTable: function (students) {
            var self = this;

            if (this.courseStudensTable) {
                this.courseStudensTable.bootstrapTable('destroy');
            }

            // init table
            var $table = this.$('.course-students-table');
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };
            tableOptions.columns = [
                {
                    field: 'studentNo',
                    title: '学号'
                }, {
                    field: 'studentName',
                    title: '姓名'
                }, {
                    field: 'studentGender',
                    title: '性别',
                    formatter: function (value) {
                        return enums.genderMap[value];
                    }
                }, {
                    field: 'studentGrade',
                    title: '年级'
                }, {
                    field: 'studentMajor',
                    title: '专业'
                }, {
                    field: 'courseGrade',
                    title: '成绩',
                    formatter: function (value) {
                        return value === -1 ? '暂无成绩' : value;
                    },
                    editable: {
                        type: 'text',
                        title: '请输入成绩',
                        validate: function (value, row, index) {
                            value = +$.trim(value);
                            if (isNaN(value) || value < 0) {
                                return '请输入一个大于0的数字！';
                            };
                            var datas = $table.bootstrapTable('getData'),
                                index = $(this).parents('tr').data('index'),
                                data = datas[index];

                            self.submitScore({
                                id: data.studentCourseId,
                                grade: value
                            });
                        }
                    },
                }
            ];

            for (var i = 0; i < students.length; i++) {
                var data = {};
                _.each(tableOptions.columns, function(column){
                    data[column.field] = students[i][column.field];
                });
                data.studentCourseId = students[i]['id'];
                tableOptions.data.push(data);
            }
            
            this.courseStudensTable = $table.bootstrapTable(tableOptions);
        },

        getProfile: function () {
            var self = this;
            api.getProfile({role: xk.role}).then(function (json) {
                self.initProfile(json);
            });
        },

        initProfile: function (json) {
            this.$('.user-name input').val(json.username);
            this.$('.user-gender select').val(json.gender.toLowerCase());
        },

        showCreateCourse: function () {
            var self = this;
            // init field tokens
            if (!this._initedTokenField) {
                this.$('.restriction-grade').tokenfield({
                  autocomplete: {
                    source: enums.grade_string,
                    delay: 100
                  },
                  showAutocompleteOnFocus: true
                });
                this.$('.restriction-grade').on('tokenfield:createtoken', function (event) {
                    var existingTokens = $(this).tokenfield('getTokens');
                    $.each(existingTokens, function(index, token) {
                        if (token.value === event.attrs.value)
                            event.preventDefault();
                    });
                });
                this.$('.restriction-major').tokenfield({
                  autocomplete: {
                    source: enums.major,
                    delay: 100
                  },
                  showAutocompleteOnFocus: true
                });
                this.$('.restriction-major').on('tokenfield:createtoken', function (event) {
                    var existingTokens = $(this).tokenfield('getTokens');
                    $.each(existingTokens, function(index, token) {
                        if (token.value === event.attrs.value)
                            event.preventDefault();
                    });
                });
                this._initedTokenField = true;
            } else {
                this.$('.restriction-grade').tokenfield('setTokens', []);
                this.$('.restriction-major').tokenfield('setTokens', []);
            }
        },

        createCourse: function (e) {
            e.preventDefault();
            var restrictionGrades = this.$('.restriction-grade').tokenfield('getTokens');
            var restrictionMajors = this.$('.restriction-major').tokenfield('getTokens');

            var data = {
                teacherNo: xk.id,
                courseName: this.$('.course-name input').val(),
                courseSize: this.$('.course-size input').val(),
                courseCredits: this.$('.course-credit input').val(),
                coursePeriod: this.$('.course-period input').val(),
                applyTime: ['A3', 'D4'], // todo~~
                courseRestrictionGrade: _.pluck(restrictionGrades, 'value'),
                courseRestrictionMajor: _.pluck(restrictionMajors, 'value')
            };

            console.log(data);
            api.createCourse(data).then(function () {
                alert('提交成功');
            });
        },

        submitScore: function(data) {
            console.log(data);
            api.submitScore(data).then(function(){
                alert('提交成功');
            });
        },

        getTeacherCourse: function () {
            var self = this;
            api.getTeacherCourse().then(function (course) {
                self._initTeacherCourse(course);
            });
        },

        getCourseStudents: function (courseId) {
            var self = this;
            var def = $.Deferred();
            api.getCourseStudents(courseId).then(function (students) {
                def.resolve(students);
            });

            return def.promise();
        }
    });

    return new TeacherPage();
});