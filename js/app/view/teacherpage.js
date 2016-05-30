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
                            self.createCourse();
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

        show: function() {
            this.render();
            this._initPlugins();
            $('.login-container').hide();
            $('.app-container').show();
            appView.setHeader();
            $('.containers[role]').hide();
            $('.containers[role=teacher]').show();
            this.$('a[data-toggle="tab"]').eq(0).click();
        },

        _initPlugins() {
            var self = this;
            // init field tokens
            this.$('.restriction-grade').tokenfield({
              autocomplete: {
                source: enums.grade_string,
                delay: 100
              },
              showAutocompleteOnFocus: true
            });
            this.$('.restriction-major').tokenfield({
              autocomplete: {
                source: enums.major,
                delay: 100
              },
              showAutocompleteOnFocus: true
            });
        },

        _initTeacherCourse(json) {
            var self = this;

            if (this.teacherCourseTable) {
                this.teacherCourseTable.bootstrapTable('destroy');
            }

            // init table
            var $table = this.$('.course-members-table');
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
                    field: 'stu_no',
                    title: '学号'
                }, {
                    field: 'stu_name',
                    title: '姓名'
                }, {
                    field: 'stu_gender',
                    title: '性别'
                }, {
                    field: 'stu_grade',
                    title: '年级'
                }, {
                    field: 'stu_major',
                    title: '专业'
                }, {
                    field: 'stucourse_score',
                    title: '成绩',
                    editable: {
                        type: 'text',
                        title: '请输入成绩',
                        validate: function (value) {
                            value = +$.trim(value);
                            if (isNaN(value)) {
                                return '请输入一个数字';
                            };
                            var datas = $table.bootstrapTable('getData'),
                                index = $(this).parents('tr').data('index'),
                                data = datas[index];

                            // console.log(data);

                            self.submitScore(data);
                        }
                    },
                }
            ];

            for (var i = 0; i < json.data.length; i++) {
                var data = {};
                data.course_id = json.data[i].course_id;
                data.course_name = json.data[i].course_name;
                data.stu_no = json.data[i].stu_no;
                data.stu_name = json.data[i].stu_name;
                data.stu_gender = enums.genderMap[json.data[i].stu_gender];
                data.stu_grade = json.data[i].stu_grade;
                data.stu_major = json.data[i].stu_major;
                data.stucourse_score = json.data[i].stucourse_score || 0;
                tableOptions.data.push(data);
            }
            
            this.teacherCourseTable = $table.bootstrapTable(tableOptions);
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

        createCourse: function () {
            
        },

        submitScore: function(data) {
            api.submitScore(data).then(function(){
                alert('提交成功');
            });
        },

        getTeacherCourse: function () {
            var self = this;
            api.getTeacherCourse().then(function (json) {
                self._initTeacherCourse(json);
            });
        }
    });

    return new TeacherPage();
});