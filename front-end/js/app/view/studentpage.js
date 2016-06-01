define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');
    
    var xk = require('biz/xk');
    var enums = require('biz/enums');
    var tokenfield = require('tokenfield');
    var bstable = require('bs-table-zh');
    var api = require('api');
    var appView = require('view/appview'); 

    var StudentPage = Backbone.View.extend({
        template: _.template($('#student-template').html()),
        render: function() {
            var self = this;
            if (!this.hasRendered) {
                this.$el.html(this.template);
                $('.containers[role=student]').append(this.$el);
                this.hasRendered = true;

                this.$('a[data-toggle="tab"]').on('show.bs.tab', function(e){
                    var $e = $(e.currentTarget),
                        act = $e.attr('act');

                    switch(act){
                        case 'profile':
                            self.getProfile();
                            break;
                        case 'choosecourse':
                            self.getStudentCourse();
                            break;
                        // case 'getchoosedcourse':
                        //     self.getChoosedCourse();
                        //     break;
                        case 'schedule':
                            self.genSchedule();
                            break;
                        default:
                            ;
                    }
                });
            }
        },

        events: function () {
            return {
                'click .save-btn': this.submitProfile
            }
        },

        show: function() {
            this.render();
            $('.login-container').hide();
            $('.changepwd-container').hide();
            $('.app-container').show();
            appView.setHeader();
            $('.containers[role]').hide();
            $('.containers[role=student]').show();
            this.$('a[data-toggle="tab"]').eq(0).click();
        },

        submitProfile: function () {
            // 只有manager可以修改信息
            // student
            var data = {
                id: 10002,
                name: 'tom',
                gender: 'M',
                grade: 1,
                major: 'test'
            };

            // teacher manager
            var data = {
                id: 10001,
                name: 'mary'
            };
            api.submitProfile(data).then(function () {
                alert('提交成功');
            });
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
            this.$('.user-grade select').val(json.grade);
        },

        getStudentCourse: function () {
            var self = this;
            api.getStudentCourse({role: xk.role}).then(function (json) {
                self.initStuCourseTable(json);
            });
        },

        initStuCourseTable: function (json) {
            var self = this;
            if (this.stuCourseTable) {
                this.stuCourseTable.bootstrapTable('destroy');
            }

            var $table = this.$('.course-choose-table');
            this.stuCourseTable = $table;
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
                    field: 'course_time',
                    title: '上课时间'
                },  {
                    field: 'course_room',
                    title: '教室'
                }, 
                // {
                //     field: 'course_restriction_grade',
                //     title: '年级限制'
                // }, {
                //     field: 'course_restriction_major',
                //     title: '专业限制'
                // }, 
                {
                    field: 'stucourse_status',
                    title: '选/退课',
                    formatter: function(value, row, index) {
                        var html;
                        if (!value) {
                            html ='<button class="btn btn-primary choose-course">选课</button>';
                        } else {
                            html ='<button class="btn btn-danger cancle-course">退课</button>';
                        }
                        return html;
                    },
                    events: {
                        'click .choose-course': function(e, value, row, index){
                            // console.log(arguments);
                            self.chooseCourse().then(function () {
                                row.stucourse_status = !row.stucourse_status;
                                $table.bootstrapTable('updateRow', {index: index, row: row});
                            });
                        },
                        'click .cancle-course': function(e, value, row, index){
                            console.log(arguments);
                            self.cancleCourse().then(function () {
                                row.stucourse_status = !row.stucourse_status;
                                $table.bootstrapTable('updateRow', {index: index, row: row});
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
                data.course_time = json.data[i].course_time;
                data.course_room = json.data[i].course_room;
                data.stucourse_status = json.data[i].stucourse_status;
                // data.course_restriction_grade = json.data[i].course_restriction_grade;
                // data.course_restriction_major = json.data[i].course_restriction_major;

                tableOptions.data.push(data);
            }

            this.stuCourseTable = $table.bootstrapTable(tableOptions);
        },

        // getChoosedCourse: function () {
            
        // },

        chooseCourse: function () {
            return api.chooseCourse();
        },

        cancleCourse: function () {
            return api.cancleCourse();
        },

        genSchedule: function () {
            var self = this;
            api.getStudentChoosedCourse().then(function (json) {
                self.initScheduleTable(json);
            });
        },

        initScheduleTable: function (json) {
            var self = this;
            if (this.stuCourseTable) {
                this.stuCourseTable.bootstrapTable('destroy');
            }

            var $table = this.$('.stucourse-schedule');
            this.stuCourseTable = $table;
            var tableOptions = {
                height: 500,
                columns: [],
                data: []
            };

            tableOptions.columns = [
                {
                    field: 'section',
                    title: '节次'
                }, {
                    field: 'wd1',
                    title: '周一'
                }, {
                    field: 'wd2',
                    title: '周二'
                }, {
                    field: 'wd3',
                    title: '周三'
                }, {
                    field: 'wd4',
                    title: '周四'
                }, {
                    field: 'wd5',
                    title: '周五'
                }
            ];

            var courses = [];
            for (var i = 0; i < json.data.length; i++) {
                var course = json.data[i];
                for (var j = 0; j < course.course_time.length; j++) {
                    var time = course.course_time[j];
                    var wd = time.substring(0, 1),
                        section = time.substring(1);
                    courses.push({
                        course_name: course.course_name,
                        course_time: time,
                        course_wd: wd,
                        course_section: section
                    });
                }
            }

            var groupedCourses = _.groupBy(courses, function(course){
                return course.course_section;
            });

            var rows = [], wds = enums.weekdays;
            for (var i = 1; i <= 11; i++) {
                groupedCourses[i] = groupedCourses[i] || [];
                var groupedCourse = groupedCourses[i];
                var row = {
                    section: i,
                    wd1: '',
                    wd2: '',
                    wd3: '',
                    wd4: '',
                    wd5: ''
                };
                for (var j = 0; j < groupedCourse.length; j++) {
                    var wd = groupedCourse[j]['course_wd'];
                    row['wd' + (wds.indexOf(wd) + 1)] = groupedCourse[j]['course_name'];
                }
                rows.push(row);
            }
            tableOptions.data = rows;

            this.stuCourseTable = $table.bootstrapTable(tableOptions);
        }
    });

    return new StudentPage();
});