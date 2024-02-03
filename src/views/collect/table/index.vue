<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="表编码" prop="tableCode">
        <el-input
          v-model="queryParams.tableCode"
          placeholder="请输入表编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表名" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入表名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表标签" prop="tableTags">
        <el-input
          v-model="queryParams.tableTags"
          placeholder="请输入表标签"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标准表" prop="standardTableFlag">
        <el-select v-model="queryParams.standardTableFlag" placeholder="请选择标准表" clearable>
          <el-option
            v-for="dict in dict.type.collect_table_standard_yes_no"
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


    <el-table v-loading="loading" :data="tableList">
      <el-table-column label="表编码" align="center" prop="tableCode" />
      <el-table-column label="表名" align="center" prop="tableName" />
      <el-table-column label="数据表标签" align="center" prop="tableTags" />
      <!-- <el-table-column label="实体类别编码" align="center" prop="entityCategoryCode" /> -->
      <el-table-column label="实体类别名称" align="center" prop="entityCategoryName" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="连接编码" align="center" prop="connectionKey" />
      <el-table-column label="数据源类型" align="center" prop="datasourceType" />
      <el-table-column label="数据源ID" align="center" prop="datasourceId" />
      <el-table-column label="数据库名称" align="center" prop="databaseName" />
      <el-table-column label="标准表标识" align="center" prop="standardTableFlag">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.collect_table_standard_yes_no" :value="scope.row.standardTableFlag"/>
        </template>
      </el-table-column>

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
          >查看采集任务</el-button>
      </template>
    </el-table-column>

    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import { listTable, getTable, delTable, addTable, updateTable } from "@/api/collect/table";

export default {
  name: "Table",
  dicts:['collect_table_standard_yes_no'],
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
      // 表基本信息表格数据
      tableList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableCode: null,
        tableName: null,
        tableTags: null,
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
    /** 查询表基本信息列表 */
    getList() {
      this.loading = true;
      listTable(this.queryParams).then(response => {
        this.tableList = response.rows;
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
        tableName: null,
        tableTags: null,
        entityCategoryCode: null,
        entityCategoryName: null,
        description: null,
        connectionKey: null,
        datasourceType: null,
        datasourceId: null,
        databaseName: null,
        standardTableFlag: null,
        createUser: null,
        createTime: null,
        modifyUser: null,
        modifyTime: null,
        delStat: null
      };
      this.resetForm("form");
    },
    handleView(row) {
      this.$router.push({
        path: "/collect/task",
        query: {
          tableCode: row.tableCode
        }
      });
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加表基本信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTable(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改表基本信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTable(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTable(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除表基本信息编号为"' + ids + '"的数据项？').then(function() {
        return delTable(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('collect/table/export', {
        ...this.queryParams
      }, `table_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
