<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="表编码" prop="tableCode">
        <el-input v-model="queryParams.tableCode" placeholder="请输入表编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="采集时间" prop="finishCollectTime">
        <el-date-picker clearable v-model="queryParams.finishCollectTime" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择完成采集时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态：" clearable>
          <el-option v-for="dict in dict.type.collect_record_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
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
          v-hasPermi="['collect:record:add']"
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
          v-hasPermi="['collect:record:edit']"
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
          v-hasPermi="['collect:record:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['collect:record:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->

    <el-table v-loading="loading" :data="recordList">
      <el-table-column label="表编码" align="center" prop="tableCode" />
      <el-table-column label="上次采集时间" align="center" prop="lastCollectTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastCollectTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前采集时间" align="center" prop="currentCollectTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.currentCollectTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成采集时间" align="center" prop="finishCollectTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.finishCollectTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.collect_record_status" :value="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="small" type="text" icon="el-icon-view" @click="handleView(scope.row)"
            >查看采集日志</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script>
import { listRecord, getRecord, delRecord, addRecord, updateRecord } from "@/api/collect/record";

export default {
  name: "Record",
  dicts: ['collect_record_status'],
  // 监听路由变化
  watch: {
    $route() {
      this.tableCode = this.$route.query.tableCode;
      if(this.tableCode) {
        this.queryParams.tableCode = this.tableCode;
        this.handleQuery();
      }else {
        this.resetQuery();
        this.handleQuery();
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
      // 数据采集记录表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableCode: null,
        lastCollectTime: null,
        currentCollectTime: null,
        finishCollectTime: null,
        status: null,
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
          { required: true, message: "状态不能为空", trigger: "change" }
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
    /** 查询数据采集记录列表 */
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows;
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
        lastCollectTime: null,
        currentCollectTime: null,
        finishCollectTime: null,
        status: null,
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
      this.title = "添加数据采集记录";
    },
    // 查看日志:跳转至表编码一样的日志页面
    handleView(row) {
      this.$router.push({
        path: `/collect/log`,
        query: {
          tableCode: row.tableCode
        }
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据采集记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRecord(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除数据采集记录编号为"' + ids + '"的数据项？').then(function () {
        return delRecord(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('collect/record/export', {
        ...this.queryParams
      }, `record_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
