<template>
  <section>
    <el-row>
      <el-col :span="24">
        <!--表单-->
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="姓名">
            <el-input v-model="formInline.user.name" placeholder="姓名" style="width: 140px;"></el-input>
          </el-form-item>
          <el-form-item label="年份">
            <el-date-picker
              v-model="formInline.user.date"
              align="right"
              type="year"
              placeholder="选择年份">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="地址">
            <el-cascader expand-trigger="hover" :options="options" v-model="formInline.user.address"></el-cascader>
          </el-form-item>
          <el-form-item label="籍贯">
            <el-select v-model="formInline.user.place" placeholder="请选择">
              <el-option
                v-for="item in places"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <a href="javascript:;" id="download" style="background-color:#409EFF;color: #fff;padding: 12px 10px!important;margin-left: 10px!important;border-radius:4px " @click="download()" download="download.csv">导出数据</a>
        </el-form>
        <!--表格-->
        <el-table
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column type="selection">
          </el-table-column>
          <el-table-column
            prop="applyOrderDetailId"
            label="工单号"
            width="180">
          </el-table-column>
          <el-table-column
            prop="nextNodeId"
            label="下个节点"
            width="180">
          </el-table-column>
          <el-table-column
            prop="submitterId"
            label="提交人">
          </el-table-column>
<!--          <el-table-column-->
<!--            prop="processNodeTotalnumber"-->
<!--            label="流程总节点数">-->
<!--          </el-table-column>-->
          <el-table-column label="状态" class-name="status-col" width="100">
            <template slot-scope="{row}">
              <el-tag :type="row.processFinishStatus | statusFilter">
                {{ row.processFinishStatus==1 ? "完成" :"未完成" }}

              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row}">
              <el-button  type="primary" size="small" @click="dealApplyOrder(row)">操作工单</el-button>
              <el-button  type="danger" size="small" @click="disAbleProcess(row)">撤回工单</el-button>
              <el-button  type="success" size="small" @click="showFlowDetail(row)">查看详情</el-button>
<!--              <el-button  type="success" size="small" @click="showFlow(row)">查看流程</el-button>-->
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="100"
            layout="prev, pager, next, jumper"
            :total="1000">
          </el-pagination>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="修改个人信息" :visible="dialogFormVisible" size="tiny" >
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.date" style="width: 100%;" ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="editLoading">修改</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="查看流程详情" :visible="flowDetialVisible" size="tiny" :before-close="handleDialogClose">
      <p> {{applyDetail}} </p>
    </el-dialog>


    <el-dialog title="查看流程详情" :visible="flowHistoryVisible" size="tiny" :before-close="handleDialogClose">
      <show-flow-history :routerData = "item" v-for="item in historyData"></show-flow-history>
    </el-dialog>

    <el-dialog title="操作工单" :visible="dealApplyOrderDetialVisible" size="tiny" :before-close="handleDialogClose">

      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="工单号">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="审批内容显示">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave(1)" :loading="editLoading">审批</el-button>
          <el-button type="danger" @click="handleSave(0)" :loading="editLoading">拒绝</el-button>
          <el-button @click="dealApplyOrderDetialVisible = false">取消</el-button>
        </el-form-item>
      </el-form>

    </el-dialog>
  </section>
</template>
<script type="text/ecmascript-6">
  import { approvalTask } from '../../api/index'
  import ShowFlowHistory from "../../components/base/ShowFlowHistory";
  const ERR_OK = 200;
  export default {
      components: {ShowFlowHistory},
      filters: {
          statusFilter(status) {
              const statusMap = {
                2: 'info',
                1: 'success',
                  0: 'danger'
              }
              return statusMap[status]
          }
      },
    data () {
      return {
        formInline: {
          user: {
            name: '',
            date: '',
            address: [],
            place: ''
          }
        },
        stepDatas: [],
        orderStatus: 0,
        tableData: [],
        options: [],
        places: [],
        historyData:[],
        applyDetail:'',
        dialogFormVisible: false,
        flowDetialVisible: false,
        dealApplyOrderDetialVisible: false,
        flowHistoryVisible: false,
        editLoading: false,
        form: {
          name: '',
          address: '',
          date: '',
        },
        currentPage: 4,
        table_index: 999,
        approval_data:{
            applyOrderId : 0,
            currentNode : 0,
            nextNode : 0,
            dealUserId : 0,
            opinion : '',
            processId: 0,
            status: 0
        }

       };
    },
    activated(){
      this.getList();
    },
    created () {
      this.getList();
      this.$http.get('/api/getOptions').then((response) => {
        response = response.data;
        if (response.code === ERR_OK) {
          this.options = response.datas;
          this.places = response.places;
        }
      });
    },
    methods: {
      getList(){
          this.$http.get('/apis/getTaskList').then((response) => {
              console.log(response)
              if (response.status === ERR_OK) {
                  this.tableData = response.data.list;
              }
          });
      },
      onSubmit () {
        this.$message('模拟数据，这个方法并不管用哦~');
      },
      handleDelete (index, row) {
        this.tableData.splice(index, 1);
        this.$message({
          message: "操作成功！",
          type: 'success'
        });
      },
      disAbleProcess(row){
          this.$http.get("/apis/startProcessUnuseAble?processId="+row.processId).then((response)=>{
              console.log(response)
          })
          this.getList();
      },
      enableProcess(row){
          this.$http.get("/apis/startProcessUseable?processId="+row.processId).then((response)=>{
              console.log(response)
          })
          this.getList()

      },
      dealApplyOrder(row){
        this.dealApplyOrderDetialVisible = true;
        this.form.name = row.applyOrderDetailId;
        this.approval_data.applyOrderId= row.applyOrderDetailId;
        this.approval_data.processId = row.processId;
        this.approval_data.currentNode = row.currentNodeId;
        this.approval_data.nextNode = row.nextNodeId;
      },
      showFlowDetail(row){
        this.flowDetialVisible = true;
        console.log(row)
        this.$http.get("/apis/getApplyOrderDetail?orderId="+row.applyOrderDetailId).then((response)=>{
            console.log(response)
            this.stepDatas = response.data
            this.orderStatus = response.data.length;
            this.applyDetail = response.data.data.applyOrderDetail;
        })
      },
      showFlow(row){
        this.flowHistoryVisible = true;
        console.log(row)
        this.$http.get("/apis/getApprovalFlow?applyid="+row.applyOrderDetailId).then((response)=>{
            console.log(response);
            this.historyData = response.data.data;
        })
      },
      handleEdit (index, row) {
        this.dialogFormVisible = true;
        this.form = Object.assign({}, row);
        this.table_index = index;
      },
      handleSave (state) {
        this.$confirm('确认提交吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          cancelButtonClass: 'cancel'
        }).then(() => {
          this.editLoading = true;
          let date = this.form.date;
          if (typeof date === "object") {
            date = [date.getFullYear(), (date.getMonth() + 1), (date.getDate())].join('-');
            this.form.date = date
          }
          this.approval_data.opinion = this.form.address;
          this.approval_data.status = state;
          approvalTask(this.approval_data).then(response=>{
              console.log(response)
          }).catch(err=>{

          })
//          this.tableData[this.table_index] = this.form;
//           this.tableData.splice(this.table_index, 1, this.form);
          this.$message({
            message: "操作成功！",
            type: 'success'
          });
          this.editLoading = false;
          this.dialogFormVisible = false;
        }).catch(() => {

        });
      },
      download: function() {
        console.log("xiazai")
        var obj = document.getElementById('download');
        var str = "姓名,出生日期,地址\n";
        for (var i = 0; i < this.tableData.length; i++) {
          var item = this.tableData[i];
          str += item.name + ',' + item.date + ',' + item.address;
          str += "\n";
        }
        console.log(obj)
        str = encodeURIComponent(str);
        console.log(str)
        obj.href = "data:text/csv;charset=utf-8,\ufeff" + str;
        obj.download = "download.csv";
      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        console.log(`当前页: ${val}`);
      },
      handleDialogClose(){
          this.flowDetialVisible = false;
          this.dealApplyOrderDetialVisible = false;
          this.flowHistoryVisible = false;
      }
    }
  };
</script>
<style>
  .el-pagination {
    text-align: center;
    margin-top: 30px;
  }
  .el-message-box__btns .cancel {
    float: right;
    margin-left: 10px;
  }
</style>
