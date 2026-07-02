<template>
  <div class="page-container">
    <div class="page-header">
      <h2>核销记录</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.orderId"
        placeholder="订单ID"
        clearable
        style="width: 180px"
      />
      <el-select
        v-model="filters.status"
        placeholder="状态"
        clearable
        style="width: 120px"
      >
        <el-option label="未使用" value="unused" />
        <el-option label="已使用" value="used" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="订单号" width="180">
        <template #default="{ row }">
          {{ row.orderNo || row.orderId }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'used' ? 'success' : 'info'">
            {{ row.status === 'used' ? '已使用' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="firstVerifiedAt" label="首次核销时间" width="180" />
      <el-table-column label="核销人" min-width="120">
        <template #default="{ row }">
          {{ row.verifierName || '-' }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVerifications } from '@/api/check'

const loading = ref(false)
const tableData = ref([])

const filters = ref({
  orderId: '',
  status: ''
})

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    }
    const res = await getVerifications(params)
    tableData.value = res.list
    pagination.value.total = res.total
  } catch (error) {
    console.error('获取核销记录失败:', error)
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
    orderId: '',
    status: ''
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
