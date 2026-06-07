<template>
  <div class="page-container">
    <div class="page-header">
      <h2>退款管理</h2>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" @submit.prevent="handleSearchOrder">
        <el-form-item label="订单号">
          <el-input
            v-model="searchOrderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearchOrder"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" @click="handleSearchOrder">
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="orderInfo.id">
      <el-card shadow="never" style="margin-top: 16px">
        <template #header>
          <span>订单信息</span>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="订单号">{{ orderInfo.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="票种ID">{{ orderInfo.ticketTypeId }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ orderInfo.quantity }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            {{ formatMoney(orderInfo.payAmount) }} 元
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ payMethodMap[orderInfo.payMethod] || orderInfo.payMethod }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(orderInfo.status)" size="small">
              {{ statusMap[orderInfo.status] || orderInfo.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已退款金额">
            {{ formatMoney(orderInfo.refundAmount) }} 元
          </el-descriptions-item>
          <el-descriptions-item label="可退款金额">
            {{ formatMoney(refundableAmount) }} 元
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ orderInfo.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" style="margin-top: 16px">
        <template #header>
          <span>退款操作</span>
        </template>
        <el-form
          ref="refundFormRef"
          :model="refundForm"
          :rules="refundRules"
          label-width="100px"
          style="max-width: 500px"
        >
          <el-form-item label="退款金额" prop="amount">
            <el-input-number
              v-model="refundForm.amount"
              :min="0.01"
              :max="refundableAmount"
              :precision="2"
              :step="1"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="退款方式" prop="method">
            <el-radio-group v-model="refundForm.method">
              <el-radio value="original">原路退回</el-radio>
              <el-radio value="cash">现金</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="退款原因" prop="reason">
            <el-input
              v-model="refundForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入退款原因"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="refundLoading"
              :disabled="refundableAmount <= 0"
              @click="handleRefund"
            >
              提交退款
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { getOrders, refundOrder } from '@/api/order';
import { useUserStore } from '@/stores/user';

const payMethodMap: Record<string, string> = {
  cash: '现金',
  wechat: '微信',
  alipay: '支付宝',
  member_card: '会员卡',
};

const statusMap: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  partial_refund: '部分退款',
  refunded: '已退款',
  cancelled: '已取消',
};

function statusTagType(status: string) {
  const map: Record<string, string> = {
    paid: 'success',
    pending: 'warning',
    refunded: 'danger',
    cancelled: 'info',
    partial_refund: 'warning',
  };
  return map[status] || 'info';
}

function formatMoney(val: number | string | undefined) {
  if (val === undefined || val === null) return '0.00';
  return Number(val).toFixed(2);
}

const userStore = useUserStore();
const searchOrderNo = ref('');
const searchLoading = ref(false);
const orderInfo = ref<any>({});

const refundableAmount = computed(() => {
  const total = Number(orderInfo.value.payAmount) || 0;
  const refunded = Number(orderInfo.value.refundAmount) || 0;
  return Math.max(0, total - refunded);
});

const refundFormRef = ref<FormInstance>();
const refundLoading = ref(false);
const refundForm = reactive({
  amount: 0,
  method: 'original',
  reason: '',
});

const refundRules = {
  amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
  ],
  method: [
    { required: true, message: '请选择退款方式', trigger: 'change' },
  ],
  reason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' },
  ],
};

async function handleSearchOrder() {
  if (!searchOrderNo.value.trim()) {
    ElMessage.warning('请输入订单号');
    return;
  }
  searchLoading.value = true;
  try {
    const res = await getOrders({ orderNo: searchOrderNo.value.trim(), page: 1, pageSize: 1 });
    const list = res.list || res.records || [];
    if (list.length > 0) {
      orderInfo.value = list[0];
      refundForm.amount = refundableAmount.value;
    } else {
      orderInfo.value = {};
      ElMessage.warning('未找到该订单');
    }
  } catch {
    orderInfo.value = {};
  } finally {
    searchLoading.value = false;
  }
}

async function handleRefund() {
  const valid = await refundFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  if (refundForm.amount > refundableAmount.value) {
    ElMessage.warning('退款金额不能超过可退款金额');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认对订单 ${orderInfo.value.orderNo} 退款 ${formatMoney(refundForm.amount)} 元？`,
      '退款确认',
      { type: 'warning' }
    );
  } catch {
    return;
  }

  refundLoading.value = true;
  try {
    await refundOrder(orderInfo.value.id, {
      amount: refundForm.amount,
      method: refundForm.method,
      reason: refundForm.reason,
      operatorId: Number(userStore.userId) || 0,
    });
    ElMessage.success('退款成功');
    handleSearchOrder();
    refundForm.reason = '';
  } catch {
    // error handled by interceptor
  } finally {
    refundLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 20px;
  }
}

.search-card {
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}
</style>
