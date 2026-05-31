<template>
  <div class="page-container">
    <div class="page-header">
      <h2>OTA对账</h2>
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
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 300px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="channel" label="渠道" width="100">
        <template #default="{ row }">
          {{ channelNameMap[row.channel] || row.channel }}
        </template>
      </el-table-column>
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="verifiedCount" label="核销张数" width="120" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            :loading="row.syncing"
            @click="handleSync(row)"
          >
            手动同步
          </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOtaReconciliation, syncOtaStatus } from '@/api/ota'

const channelNameMap = {
  douyin: '抖音',
  meituan: '美团',
  ctrip: '携程'
}

const loading = ref(false)
const tableData = ref([])

const filters = ref({
  channel: '',
  dateRange: []
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
      channel: filters.value.channel,
      startDate: filters.value.dateRange?.[0] || '',
      endDate: filters.value.dateRange?.[1] || ''
    }
    const res = await getOtaReconciliation(params)
    tableData.value = res.list.map(item => ({
      ...item,
      syncing: false
    }))
    pagination.value.total = res.total
  } catch (error) {
    console.error('获取对账数据失败:', error)
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
    channel: '',
    dateRange: []
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

const handleSync = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要同步 ${channelNameMap[row.channel] || row.channel} ${row.date} 的数据吗？`,
      '确认同步',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    row.syncing = true
    await syncOtaStatus({
      channel: row.channel,
      date: row.date
    })
    ElMessage.success('同步成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步失败:', error)
    }
  } finally {
    row.syncing = false
  }
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
