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
            $('.login-container').hide();
            $('.changepwd-container').hide();
            $('.app-container').show();
            appView.setHeader();
            $('.containers[role]').hide();
            $('.containers[role=manager]').show();
            this.$('a[data-toggle="tab"]').eq(0).click();
        },

        events: function () {
            return {
                'click .confirm-room-assign': this._confirmRoomAssign
            }
        },

        // 审批课程
        _initCommitCourse: function(courses) {
            var self = this;
            if (this.coursePassTable) {
                this.coursePassTable.bootstrapTable('destroy');
            }

            var $table = this.$('.course-pass-table');
            this.coursePassTable = $table;
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
                    field: 'courseNo',
                    title: '课程代码',
                    editable: {
                        type: 'text',
                        title: '请输入课程代码',
                        validate: function (value, row, index) {
                            if (!value) {
                                return '课程代码不能为空';
                            }
                        }
                    },
                }, {
                    field: 'courseSize',
                    title: '选课人数上限'
                }, {
                    field: 'applyTime',
                    title: '上课时间',
                    formatter: function (value) {
                        return util.parseTimesToHtml(value);
                    }
                }, {
                    field: 'room',
                    title: '教室',
                    formatter: function () {
                        var html = '';
                        html = '<button class="btn btn-primary assign-room">分配教室</button>'
                        return html;
                    },
                    events: {
                        'click .assign-room': function (e, value, row, index) {
                            var data = {
                                applyTime: row.applyTime
                            };
                            self.assignRoom(data).then(function (roomsMap) {
                                self.$('.assign-room-modal .course-name').text(row.courseName);
                                self.$('.assign-room-modal').modal('show');
                                // console.log(roomsMap);
                                self._initRoomAssignTable(roomsMap);
                                // self.getCourseStudents(row.courseId).then(function (students) {
                                //     self._initCourseStudensTable(students);
                                // });
                            });
                        },
                    }
                }, {
                    field: 'courseRestrictionGrade',
                    title: '年级限制'
                }, {
                    field: 'courseRestrictionMajor',
                    title: '专业限制'
                }, {
                    field: 'course_commit',
                    title: '审批',
                    formatter: function() {
                        return [
                            '<button class="btn btn-primary pass-course">同意</button>'
                        ].join('');
                    },
                    events: {
                        'click .pass-course': function(e, value, row, index){
                            if (!row.courseNo) {
                                alert('请为课程输入课程代码。');
                                return;
                            } else if (!row.room) {
                                alert('请先为课程分配教室！');
                                return;
                            } else {
                                var data = {

                                };
                                self.passCourse(data).then(function () {
                                    $table.bootstrapTable('remove', {
                                        field: 'course_id',
                                        values: [row.course_id]
                                    });
                                });
                            }
                            
                        }
                    }
                }
            ];

            for (var i = 0; i < courses.length; i++) {
                var data = {};
                _.each(tableOptions.columns, function(column){
                    data[column.field] = courses[i][column.field];
                });
                data.courseNo = '';
                data.courseId = courses[i]['id'];
                tableOptions.data.push(data);
            }

            this.coursePassTable = $table.bootstrapTable(tableOptions);
        },

        _initRoomAssignTable: function (roomsMap) {
            var self = this;
            if (this.roomAssignTable) {
                this.roomAssignTable.bootstrapTable('destroy');
            }

            var $table = this.$('.room-assign-table');
            this.roomAssignTable = $table;
            var tableOptions = {
                columns: [],
                data: []
            };

            tableOptions.columns = [
                {
                    field: 'weekday',
                    title: '周',
                    formatter: function(value){
                        var arr = [
                            {value: 'A', title: '一'}, 
                            {value: 'B', title: '二'}, 
                            {value: 'C', title: '三'}, 
                            {value: 'D', title: '四'}, 
                            {value: 'E', title: '五'}, 
                        ];
                        var html = '<select class="form-control weekday-select" name="weekday">';
                        _.each(arr, function (e) {
                            var isSelected = e.value == value ? 'selected' : '';
                            html += '<option value="' + e.value + '" ' + isSelected + '>' + e.title + '</option>'
                        });
                        html += '</select>';
                        return html;
                    },
                    events: {
                        'change .weekday-select': function (e, value, row, index) {
                            var $e = $(e.currentTarget);
                            console.log($e.val());
                        }
                    },
                }, {
                    field: 'section',
                    title: '节次',
                    formatter: function(value){
                        var html = '<select class="form-control section-select" name="section">';
                        var num = 11;
                        while(num) {
                            var isSelected = num == value ? 'selected' : '';
                            html += '<option value="' + num + '" ' + isSelected + '>' + num + '</option>'
                            num--;
                        }
                        html += '</select>';
                        return html;
                    },
                    events: function () {
                        
                    },
                }, {
                    field: 'room',
                    title: '教室',
                    formatter: function (rooms) {
                        var html = '';
                        if (rooms.length === 0) {
                            html += '无可用教室';
                        } else {
                            html = '<select class="form-control room-select" name="room">';
                            _.each(rooms, function (room) {
                                html += '<option value="' + room.courseId + '">' + room.roomName + '</option>'
                            });
                            html += '</select>';
                        }
                        return html;
                    },
                    events: {
                        'change .room-select': function (e) {
                            
                        }
                    }
                }
            ];

            for (var time in roomsMap) {
                var data = {};

                var tinfo = util.splitTime(time);
                data.weekday = tinfo.weekday;
                data.section = tinfo.section;
                data.room = roomsMap[time];
                data.time = time;
                data.courseRoomId = '';

                tableOptions.data.push(data);
            }

            this.roomAssignTable = $table.bootstrapTable(tableOptions);
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
            api.getUncommitedCourse().then(function (courses) {
                self._initCommitCourse(courses);
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

        assignRoom: function (data) {
            var def = $.Deferred();
            var applyTime = data.applyTime;
            var times = data.applyTime.split(',');
            var requests = [];
            self.roomTimeMap = {};
            _.each(times, function (time) {
                var roomTime = {
                    roomTime: time
                };
                // var request = api.assignRoom(roomTime).then(function (rooms) {
                //     self.roomTimeMap[time] = rooms;
                // });
                // requests.push(request);

                var d = $.Deferred();
                api.assignRoom(roomTime).then(function (rooms) {
                    var rt = {};
                    rt[time] = rooms;
                    d.resolve(rt);
                });
                requests.push(d.promise());
            });

            $.when.apply($, requests).then(function () {
                console.log(arguments);
                _.each(arguments, function (roomMap) {
                    for (var time in roomMap) {
                        self.roomTimeMap[time] = roomMap[time];
                    }
                })
                def.resolve(self.roomTimeMap);
            });

            return def.promise();
        },

        passCourse: function (data) {
            var def = $.Deferred();
            api.passCourse(data).then(function (data) {
                def.resolve(data);
            });

            return def.promise();
        },

        _confirmRoomAssign: function (e) {
            if (this.roomAssignTable) {

            }
        }
    });

    return new ManagerPage();
});