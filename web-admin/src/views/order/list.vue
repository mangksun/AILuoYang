<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <div class="filter-bar">
      <el-select v-model="filters.channel" placeholder="渠道" clearable style="width: 140px">
        <el-option label="线下" value="offline" />
        <el-option label="小程序" value="miniapp" />
        <el-option label="抖音" value="douyin" />
        <el-option label="美团" value="meituan" />
        <el-option label="携程" value="ctrip" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px">
        <el-option label="待支付" value="pending" />
        <el-option label="已支付" value="paid" />
        <el-option label="部分退款" value="partial_refund" />
        <el-option label="已退款" value="refunded" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 280px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
      <el-table-column prop="ticketTypeId" label="票种ID" min-width="120" show-overflow-tooltip />
      <el-table-column prop="quantity" label="数量" width="80" align="center" />
      <el-table-column prop="totalAmount" label="总金额" width="100" align="right">
        <template #default="{ row }">
          {{ formatMoney(row.totalAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="payMethod" label="支付方式" width="100" align="center">
        <template #default="{ row }">
          {{ payMethodMap[row.payMethod] || row.payMethod }}
        </template>
      </el-table-column>
      <el-table-column prop="payStatus" label="支付状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.payStatus)" size="small">
            {{ statusMap[row.payStatus] || row.payStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="channel" label="渠道" width="90" align="center">
        <template #default="{ row }">
          {{ channelMap[row.channel] || row.channel }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleViewDetail(row)">
            详情
          </el-button>
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
        background
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="票种ID">{{ detail.ticketTypeId }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detail.quantity }}</el-descriptions-item>
        <el-descriptions-item label="总金额">{{ formatMoney(detail.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ payMethodMap[detail.payMethod] || detail.payMethod }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="statusTagType(detail.payStatus)" size="small">
            {{ statusMap[detail.payStatus] || detail.payStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="渠道">{{ channelMap[detail.channel] || detail.channel }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)" size="small">
            {{ statusMap[detail.status] || detail.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="退款时间">{{ detail.refundedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detail.userId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template v-if="detail.refunds && detail.refunds.length">
        <h4 style="margin: 20px 0 10px">退款记录</h4>
        <el-table :data="detail.refunds" border size="small">
          <el-table-column prop="refundNo" label="退款单号" />
          <el-table-column prop="amount" label="退款金额" align="right">
            <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
          </el-table-column>
          <el-table-column prop="method" label="退款方式" align="center">
            <template #default="{ row }">
              {{ row.method === 'original' ? '原路退回' : '现金' }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="退款原因" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="退款时间" width="170" />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getOrders, getOrder } from '@/api/order';

const payMethodMap: Record<string, string> = {
  cash: '现金',
  wechat: '微信',
  alipay: '支付宝',
  member_card: '会员卡',
};

const channelMap: Record<string, string> = {
  offline: '线下',
  miniapp: '小程序',
  douyin: '抖音',
  meituan: '美团',
  ctrip: '携程',
};

const statusMap: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  partial_refund: '部分退款',
  refunded: '已退款',
  cancelled: '已取消',
  active: '正常',
  disabled: '禁用',
  frozen: '冻结',
  expired: '过期',
};

function statusTagType(status: string) {
  const map: Record<string, string> = {
    active: 'success',
    paid: 'success',
    disabled: 'info',
    frozen: 'warning',
    pending: 'warning',
    refunded: 'danger',
    expired: 'danger',
    cancelled: 'info',
    partial_refund: 'warning',
  };
  return map[status] || 'info';
}

function formatMoney(val: number | string | undefined) {
  if (val === undefined || val === null) return '0.00';
  return Number(val).toFixed(2);
}

const loading = ref(false);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const detail = ref<any>({});

const filters = reactive({
  channel: '',
  status: '',
  dateRange: null as string[] | null,
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

async function handleSearch() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (filters.channel) params.channel = filters.channel;
    if (filters.status) params.status = filters.status;
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0];
      params.endDate = filters.dateRange[1];
    }
    const res = await getOrders(params);
    tableData.value = res.list || res.records || [];
    pagination.total = res.total || 0;
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  filters.channel = '';
  filters.status = '';
  filters.dateRange = null;
  pagination.page = 1;
  handleSearch();
}

async function handleViewDetail(row: any) {
  try {
    const res = await getOrder(row.id);
    detail.value = res;
    detailVisible.value = true;
  } catch {
    // error handled by interceptor
  }
}

handleSearch();
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 20px;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
