package edu.fdu.csms.service.manager;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.alogic.idu.util.IDUBase;
import com.anysoft.util.Properties;
import com.anysoft.util.PropertiesConstants;
import com.logicbus.backend.Context;
import com.logicbus.backend.ServantException;
import com.logicbus.backend.message.JsonMessage;
import com.logicbus.dbcp.processor.Preprocessor;
import com.logicbus.dbcp.sql.DBTools;
import com.logicbus.models.servant.ServiceDescription;

/**
 * 查询指定学生所选课程列表
 * 
 * @author limf
 */
public class ListCourseByStudent extends IDUBase {

	@Override
	protected void onCreate(ServiceDescription sd, Properties p) throws ServantException {
		rootName = PropertiesConstants.getString(p, "data.root", rootName);
	}

	@Override
	protected void doIt(Context ctx, JsonMessage msg, Connection conn) throws Exception {
		String studentNo = getArgument("studentNo", ctx);

		sqlQuery = "SELECT c.course_id AS courseId,c.course_no AS courseNo,c.course_name AS courseName,sc.evaluation_grade AS evaluationGrade,sc.course_grade AS courseGrade FROM student_course_list sc JOIN course c ON sc.course_id = c.course_id WHERE sc.student_no = "
				+ studentNo;

		processor = new Preprocessor(sqlQuery);

		List<Object> data = new ArrayList<Object>();

		String sql = processor.process(ctx, data);
		List<Map<String, Object>> result = null;

		if (data.size() <= 0) {
			result = DBTools.listAsObject(conn, sql);
		} else {
			result = DBTools.listAsObject(conn, sql, data.toArray());
		}

		msg.getRoot().put(rootName, result);
	}

	protected String rootName = "data";

	protected String sqlQuery = "";

	protected Preprocessor processor = null;
}
