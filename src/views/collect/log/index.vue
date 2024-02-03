<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="表编码" prop="tableCode">
        <el-input v-model="queryParams.tableCode" placeholder="请输入表编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker clearable v-model="queryParams.startTime" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker clearable v-model="queryParams.endTime" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择结束时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="采集结果" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择采集结果" clearable>
          <el-option
            v-for="dict in dict.type.collect_success_failure"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['collect:log:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['collect:log:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['collect:log:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['collect:log:export']"
        >导出</el-button>
      </el-col> -->
    <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table v-loading="loading" :data="logList" >

      <el-table-column label="表索引编码" align="center" prop="tableIndexCode" />
      <el-table-column label="表编码" align="center" prop="tableCode" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="采集结果" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.collect_success_failure" :value="scope.row.status"/>
        </template>
      </el-table-column>


      <!-- <el-table-column label="报错信息" align="center" prop="errorMessage" /> -->
      <el-table-column label="本次任务采集的总行数" align="center" prop="collectTotalRows" />
      <!-- <el-table-column label="已经执行的批次" align="center" prop="batchesProceeded" /> -->
      <el-table-column label="批次大小" align="center" prop="batchSize" />
      <el-table-column label="增量采集标识" align="center" prop="incrementalFlag">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.collect_incremental_flag" :value="scope.row.incrementalFlag"/>
        </template>
      </el-table-column>
      

      <el-table-column label="执行节点 ip" align="center" prop="execIp" />

      <el-table-column
      align="center"
      fixed="right"
      label="操作"
      width="120">
      <template slot-scope="scope">
        <el-button
            size="small"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >查看详情</el-button>
      </template>
    </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

          <!-- 操作日志详细 -->
    <el-dialog title="日志详细" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="表编码：">{{ form.tableCode }} </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表索引编码：">{{ form.tableIndexCode }} </el-form-item>
          </el-col>
   
          <el-col :span="12">
            <el-form-item label="开始时间：">{{ parseTime(form.endTime) }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间：">{{ parseTime(form.startTime) }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采集结果：">
              <div v-if="form.status === 'SUCCESS'">成功</div>
              <div v-else-if="form.status === 'FAILURE'">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 'FAILURE'">{{ form.errorMessage }}</el-form-item>
          </el-col>
        </el-row>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listLog, getLog, delLog, addLog, updateLog, getLogByTableCode } from "@/api/collect/log";

export default {
  name: "Log",
  dicts: ['collect_success_failure','collect_incremental_flag'],
  // 监听路由变化
  watch: {
    $route() {
      this.tableCode = this.$route.query.tableCode;
      if(this.tableCode) {
        this.getLogByTableCode()
      }else {
        this.getList();
      }
    }
  },
  data() {
    return {
      tableCode: null,
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
      // 数据采集日志表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableIndexCode: null,
        tableCode: null,
        startTime: null,
        endTime: null,
        status: null,
        errorMessage: null,
        collectTotalRows: null,
        batchesProceeded: null,
        batchSize: null,
        incrementalFlag: null,
        execIp: null,
        createUser: null,
        modifyUser: null,
        modifyTime: null,
        delStat: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        status: [
          { required: true, message: "采集任务的状态，可以是成功不能为空", trigger: "change" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        modifyTime: [
          { required: true, message: "修改时间不能为空", trigger: "blur" }
        ],
        delStat: [
          { required: true, message: "0：正常 1：删除不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getLogByTableCode() {
      this.loading = true;
      getLogByTableCode(this.tableCode)
        .then(response => {
        this.logList = response.rows;
        this.total = response.total;
        this.loading = false;
        })
        .catch(error => {
          console.error(error)
        })
    },
    /** 查询数据采集日志列表 */
    getList() {
      this.loading = true;
      listLog(this.queryParams).then(response => {
        this.logList = response.rows;
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
        tableIndexCode: null,
        tableCode: null,
        startTime: null,
        endTime: null,
        status: null,
        errorMessage: null,
        collectTotalRows: null,
        batchesProceeded: null,
        batchSize: null,
        incrementalFlag: null,
        execIp: null,
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
      this.title = "添加数据采集日志";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getLog(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据采集日志";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLog(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLog(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除数据采集日志编号为"' + ids + '"的数据项？').then(function () {
        return delLog(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
        /** 详细按钮操作 */
        handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('collect/log/export', {
        ...this.queryParams
      }, `log_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
