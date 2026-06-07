<template>
  <div class="page-container">
    <div class="page-header">
      <h2>OTA产品映射</h2>
      <el-button type="primary" @click="handleAdd">新增映射</el-button>
    </div>

    <div class="filter-bar">
      <el-select
        v-model="filters.channel"
        placeholder="渠道"
        clearable
        style="width: 150px"
      >
        <el-option label="抖音" value="douyin" />
        <el-option label="美团" value="meituan" />
        <el-option label="携程" value="ctrip" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="channel" label="渠道" width="100">
        <template #default="{ row }">
          {{ channelNameMap[row.channel?.name] || row.channel?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="localTicketId" label="本地票种ID" width="120" />
      <el-table-column prop="remoteProductId" label="远程产品ID" width="130" />
      <el-table-column prop="remoteProductName" label="远程产品名称" min-width="150" />
      <el-table-column prop="retailPrice" label="零售价" width="100">
        <template #default="{ row }">
          {{ formatPrice(row.retailPrice) }}
        </template>
      </el-table-column>
      <el-table-column prop="settlementPrice" label="结算价" width="100">
        <template #default="{ row }">
          {{ formatPrice(row.settlementPrice) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="新增映射"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="渠道" prop="channel">
          <el-select v-model="formData.channel" placeholder="请选择渠道">
            <el-option label="抖音" value="douyin" />
            <el-option label="美团" value="meituan" />
            <el-option label="携程" value="ctrip" />
          </el-select>
        </el-form-item>
        <el-form-item label="本地票种ID" prop="localTicketId">
          <el-input v-model="formData.localTicketId" placeholder="请输入本地票种ID" />
        </el-form-item>
        <el-form-item label="远程产品ID" prop="remoteProductId">
          <el-input v-model="formData.remoteProductId" placeholder="请输入远程产品ID" />
        </el-form-item>
        <el-form-item label="远程产品名称" prop="remoteProductName">
          <el-input v-model="formData.remoteProductName" placeholder="请输入远程产品名称" />
        </el-form-item>
        <el-form-item label="零售价" prop="retailPrice">
          <el-input-number
            v-model="formData.retailPrice"
            :precision="2"
            :min="0"
            :step="0.01"
            placeholder="请输入零售价"
          />
        </el-form-item>
        <el-form-item label="结算价" prop="settlementPrice">
          <el-input-number
            v-model="formData.settlementPrice"
            :precision="2"
            :min="0"
            :step="0.01"
            placeholder="请输入结算价"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOtaMappings, createOtaMapping } from '@/api/ota'

const channelNameMap = {
  douyin: '抖音',
  meituan: '美团',
  ctrip: '携程'
}

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const filters = ref({
  channel: ''
})

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = ref({
  channel: '',
  localTicketId: '',
  remoteProductId: '',
  remoteProductName: '',
  retailPrice: 0,
  settlementPrice: 0
})

const formRules = {
  channel: [{ required: true, message: '请选择渠道', trigger: 'change' }],
  localTicketId: [{ required: true, message: '请输入本地票种ID', trigger: 'blur' }],
  remoteProductId: [{ required: true, message: '请输入远程产品ID', trigger: 'blur' }],
  remoteProductName: [{ required: true, message: '请输入远程产品名称', trigger: 'blur' }],
  retailPrice: [{ required: true, message: '请输入零售价', trigger: 'blur' }],
  settlementPrice: [{ required: true, message: '请输入结算价', trigger: 'blur' }]
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    }
    const res = await getOtaMappings(params)
    tableData.value = res.list
    pagination.value.total = res.total
  } catch (error) {
    console.error('获取映射列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchData()
}

const handleReset = () => {
  filters.value = {
    channel: ''
  }
  pagination.value.page = 1
  fetchData()
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.page = 1
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.value.page = val
  fetchData()
}

const handleAdd = () => {
  formData.value = {
    channel: '',
    localTicketId: '',
    remoteProductId: '',
    remoteProductName: '',
    retailPrice: 0,
    settlementPrice: 0
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      await createOtaMapping({
        ...formData.value,
        localTicketId: Number(formData.value.localTicketId),
        retailPrice: Number(formData.value.retailPrice),
        settlementPrice: Number(formData.value.settlementPrice)
      })
      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('新增映射失败:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
