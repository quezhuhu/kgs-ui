<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="表编码" prop="tableCode">
        <el-input v-model="queryParams.tableCode" placeholder="请输入表编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态：" clearable>
          <el-option v-for="dict in dict.type.collect_blocked_unblocked" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="taskList" width="120">
      <el-table-column label="表编码" align="center" prop="tableCode" width="300" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.collect_blocked_unblocked" :value="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column label="上次采集时间" align="center" prop="lastCollectTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastCollectTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="下次采集时间" align="center" prop="nextCollectTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.nextCollectTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="采集间隔(秒)" align="center" prop="collectInterval" />

      <el-table-column align="center" fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="small" type="text" icon="el-icon-view" @click="handleView(scope.row)">查看采集记录</el-button>
          <el-button size="small" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['collect:task:edit']">编辑</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改采集任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="表编码" prop="tableCode">
          <el-input readonly v-model="form.tableCode" placeholder="请输入表编码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status" disabled>
            <el-radio v-for="dict in dict.type.collect_blocked_unblocked" :key="dict.value" :label="dict.value">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上次采集时间" prop="lastCollectTime">
          <el-date-picker readonly clearable v-model="form.lastCollectTime" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择上次采集时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="下次采集时间" prop="nextCollectTime">
          <el-date-picker readonly clearable v-model="form.nextCollectTime" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择下次采集时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="采集间隔(秒)" prop="collectInterval">
          <el-input v-model="form.collectInterval" placeholder="请输入采集间隔(秒)" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTask, getTask, delTask, addTask, updateTask } from "@/api/collect/task";

export default {
  name: "Task",
  dicts: ['sys_common_status', "collect_blocked_unblocked"],
  // 监听路由变化
  watch: {
    $route() {
      this.tableCode = this.$route.query.tableCode;
      if (this.tableCode) {
        this.queryParams.tableCode = this.tableCode;
        this.handleQuery();
      } else {
        this.resetQuery();
        this.handleQuery();
      }
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 采集任务表格数据
      taskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableCode: null,
        status: null,
        lastCollectTime: null,
        nextCollectTime: null,
        collectInterval: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询采集任务列表 */
    getList() {
      this.loading = true;
      listTask(this.queryParams).then(response => {
        this.taskList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        tableCode: null,
        status: null,
        lastCollectTime: null,
        nextCollectTime: null,
        collectInterval: null,
        createUser: null,
        createTime: null,
        modifyUser: null,
        modifyTime: null,
        delStat: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加采集任务";
    },
    handleView(row) {
      this.$router.push({
        path: "/collect/record",
        query: {
          tableCode: row.tableCode
        }
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTask(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改采集任务";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTask(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTask(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除采集任务编号为"' + ids + '"的数据项？').then(function () {
        return delTask(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('collect/task/export', {
        ...this.queryParams
      }, `task_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
