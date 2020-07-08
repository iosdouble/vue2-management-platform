<template>
  <div class="select_approval">

    <span>{{ routerData.nodeName }}</span>

    <el-form :model="form">
      <el-form-item label="审批人ID" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off"></el-input>
      </el-form-item>
<!--      <el-form-item label="活动区域" :label-width="formLabelWidth">-->
<!--        <el-select v-model="form.region" placeholder="请选择活动区域">-->
<!--          <el-option label="区域一" value="shanghai"></el-option>-->
<!--          <el-option label="区域二" value="beijing"></el-option>-->
<!--        </el-select>-->
<!--      </el-form-item>-->
    </el-form>



  </div>

</template>

<script>
    export default {
        name: "SelectBar",
        props:['routerData'],
        data() {
            return {
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                formLabelWidth: '120px'
            };
        },
        created(){
            this.sendMsg();
        },
        methods:{
            sendMsg(){
                this.$emit('funcs',this.from)
            },
            selectdiv(){
                console.log(this.form.name)
            }
        }
    }
</script>

<style scoped>

  .select_approval{
    margin: 5px;
    font-size: 15px;
  }
</style>
