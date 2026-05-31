<template>
  <div class="page-container">
    <div class="page-header">
      <h2>OTA渠道管理</h2>
      <el-button type="primary" @click="handleAdd">新增渠道</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="渠道名称" min-width="150">
        <template #default="{ row }">
          {{ channelNameMap[row.name] || row.name }}
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

    <el-dialog
      v-model="dialogVisible"
      title="新增渠道"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="渠道名称" prop="name">
          <el-select v-model="formData.name" placeholder="请选择渠道">
            <el-option label="抖音" value="douyin" />
            <el-option label="美团" value="meituan" />
            <el-option label="携程" value="ctrip" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
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
import { getOtaChannels, createOtaChannel } from '@/api/ota'

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

const formData = ref({
  name: '',
  status: 'active'
})

const formRules = {
  name: [{ required: true, message: '请选择渠道', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getOtaChannels()
    tableData.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取渠道列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  formData.value = {
    name: '',
    status: 'active'
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      await createOtaChannel(formData.value)
      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('新增渠道失败:', error)
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
</style>
