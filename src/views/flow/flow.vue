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
            prop="createTime"
            label="创建时间"
            width="180">
          </el-table-column>
          <el-table-column
            prop="systemType"
            label="提交系统">
          </el-table-column>
          <el-table-column label="状态" class-name="status-col" width="100">
            <template slot-scope="{row}">
              <el-tag :type="row.dealState | statusFilter">
                {{ row.dealState== 0 ? "未开启" :(row.dealState == 1?"流程中":(row.dealState==2?"已完成":"被拒绝")) }}


              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row}">
<!--              <el-button type="primary" size="small" @click="handleEdit(scope.$index, scope.row)">审批</el-button>-->
<!--              <el-button type="danger" size="small" @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
              <el-button v-if="row.dealState== 0" type="primary" size="small" @click="startFlow(row)">开启流程</el-button>

              <el-button type="success" size="small" @click="showApplyOrderDetail(row)">工单内容</el-button>
              <el-button v-if="row.dealState== 0" type="danger" size="small" @click="deleteApplyOrder(row)">废除工单</el-button>

              <el-button v-if="row.dealState== 1" type="primary" size="small" @click="getFlowDetail(row)">流程详情</el-button>

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
    <el-dialog title="请选择审批人" :visible="startApprovalPersonVisible" size="tiny" :before-close="handleDialogClose">
      <select-bar :routerData = "item" v-for="item in items" @funcs="getValueSon" ref="selectBarChild"></select-bar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="startApprovalPersonVisible = false">取消</el-button>
        <el-button type="primary"  @click="startApplyOrderFlow">开启工单</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改个人信息" :visible="dialogFormVisible" size="tiny">
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

    <el-dialog title="查看流程详情" :visible="flowDetialVisible" size="tiny" :before-close="handleDialogCloseFlow">
      <show-flow-history :routerData = "item" v-for="item in show_datas"  ref="selectBarChild"></show-flow-history>
    </el-dialog>
  </section>
</template>
<script type="text/ecmascript-6">
    import { getApprovalList } from '../../api/index'
    import { startFlow } from '../../api/index'
    import SelectBar from "../../components/base/SelectBar";
    import ShowFlowHistory from "../../components/base/ShowFlowHistory";
  const ERR_OK = 200;
  export default {
      components:{ShowFlowHistory, SelectBar },
      filters: {
          statusFilter(status) {
              const statusMap = {
                  3: 'danger',
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
        startApprovalPersonVisible: false,
        items:{},
        tableData: [],
        options: [],
        places: [],
        personId: {
          approvalUserId: '',
          approvalOrder: '',
          nodeId: ''
        },
        user:[],
        flowDetialVisible: false,
        dialogFormVisible: false,
        editLoading: false,
        applyDetail:'',
        form: {
          name: '',
          address: '',
          date: '',
        },
        show_datas:[],
        currentPage: 4,
        table_index: 999,

          post_data:{
              applyId: 0,
              approvalUserVoList : [
                  {
                      approvalOrder: 0,
                      approvalUserId: 0,
                      nodeId: 0
                  }
              ],
              processId: 0
          }
      };
    },

    created () {
      this.$http.get('/apis/getStartList').then((response) => {
        console.log(response)
        if (response.status === ERR_OK) {
          this.tableData = response.data.data.list;
        }
      });
      this.$http.get('/api/getOptions').then((response) => {
        response = response.data;
        if (response.code === ERR_OK) {
          this.options = response.datas;
          this.places = response.places;
        }
      });
    },
    methods: {
      startFlow(row){
        this.startApprovalPersonVisible = true;

          getApprovalList().then(response=>{
              console.log(response)
              this.post_data.applyId = row.applyOrderDetailId;
              this.post_data.processId = response.data[0].processId;
              this.items = response.data;
          }).catch(err=>{

          })
      },
      showApplyOrderDetail(row){
         this.flowDetialVisible = true;
         console.log(row)
         this.$http.get("/apis/getApplyOrderDetail?orderId="+row.applyOrderDetailId).then((response)=>{
            console.log(response)
            this.applyDetail = response.data.data.applyOrderDetail;
          })
      },
      deleteApplyOrder(row){
          console.log(row)
          this.$http.delete("/apis/endTask?applyId="+row.applyOrderDetailId).then((response)=>{
             console.log(response)
          })
        },
      getValueSon(data){
        console.log("======",data)
      },
      startApplyOrderFlow(row){
        console.log("点击开启")
        console.log(this.$refs.selectBarChild[0]._props.routerData)
        for (let i = 0; i <this.$refs.selectBarChild.length ; i++) {
            this.personId.approvalUserName = this.$refs.selectBarChild[i].form.name;
            this.personId.approvalOrder = this.$refs.selectBarChild[i]._props.routerData.nodeOrder;
            this.personId.nodeId = this.$refs.selectBarChild[i]._props.routerData.nodeId;
            this.user[i] = this.personId;
            this.post_data.approvalUserVoList[i] = this.personId;
            this.personId = {};
        }

        startFlow(this.post_data).then(response=>{
            console.log(response)
        }).catch(err=>{

        })
        console.log(this.user)
      },

      getFlowDetail(row){

          this.flowDetialVisible = true;
          console.log(row)
          this.$http.get("/apis/getApprovalFlow?applyid="+row.applyOrderDetailId).then((response)=>{
              console.log(response)
              this.show_datas = response.data.data;
          })
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
      handleEdit (index, row) {
        this.dialogFormVisible = true;
        this.form = Object.assign({}, row);
        this.table_index = index;
      },
      handleSave () {
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
//          this.tableData[this.table_index] = this.form;
          this.tableData.splice(this.table_index, 1, this.form);
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
        this.startApprovalPersonVisible = false;
      },
      handleDialogCloseFlow(){
        this.flowDetialVisible = false;
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
