<template>
  <div class="page-container">
    <div class="page-header">
      <h2>财务对账</h2>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filter.channel" placeholder="选择渠道" clearable style="width: 160px">
        <el-option label="全部" value="" />
        <el-option label="线下" value="offline" />
        <el-option label="小程序" value="miniapp" />
        <el-option label="抖音" value="douyin" />
        <el-option label="美团" value="meituan" />
        <el-option label="携程" value="ctrip" />
      </el-select>
      <el-date-picker
        v-model="filter.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 320px"
      />
      <el-button type="primary" @click="loadData">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="channel" label="渠道" width="100" align="center">
          <template #default="{ row }">
            {{ channelMap[row.channel] || row.channel }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100" align="center" />
        <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="localAmount" label="本地金额" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.localAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="platformAmount" label="平台金额" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.platformAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="diffAmount" label="差异金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="{ 'diff-amount': row.diffAmount !== 0 }">
              {{ formatMoney(row.diffAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'matched' ? 'success' : 'warning'">
              {{ row.status === 'matched' ? '已核对' : '未核对' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Download, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getReconciliation } from '@/api/order';

interface ReconciliationItem {
  id: number;
  date: string;
  channel: string;
  orderCount: number;
  totalAmount: number;
  localAmount: number;
  platformAmount: number;
  diffAmount: number;
  status: string;
}

const channelMap: Record<string, string> = {
  offline: '线下',
  miniapp: '小程序',
  douyin: '抖音',
  meituan: '美团',
  ctrip: '携程',
};

const loading = ref(false);
const tableData = ref<ReconciliationItem[]>([]);

const filter = reactive({
  channel: '',
  dateRange: null as [string, string] | null,
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

function formatMoney(value: number): string {
  return value?.toFixed(2) ?? '0.00';
}

async function loadData() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (filter.channel) {
      params.channel = filter.channel;
    }
    if (filter.dateRange) {
      params.startDate = filter.dateRange[0];
      params.endDate = filter.dateRange[1];
    }
    const res = await getReconciliation(params);
    tableData.value = Array.isArray(res) ? res : res?.list || [];
    pagination.total = res?.total || 0;
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  filter.channel = '';
  filter.dateRange = null;
  pagination.page = 1;
  loadData();
}

function handleExport() {
  ElMessage.success('报表导出成功（模拟）');
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.diff-amount {
  color: #f56c6c;
  font-weight: 600;
}
</style>
