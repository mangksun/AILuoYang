<template>
  <div class="dashboard">
    <h2>工作台</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon size="28"><Ticket /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">--</div>
            <div class="stat-label">今日售票</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon size="28"><Finished /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">--</div>
            <div class="stat-label">今日检票</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon size="28"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">--</div>
            <div class="stat-label">今日收入</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon size="28"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">--</div>
            <div class="stat-label">待处理退款</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="quick-actions" shadow="never">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="4">
          <el-button class="action-btn" @click="$router.push('/ticket/types')">
            <el-icon size="24"><Ticket /></el-icon>
            <span>票种管理</span>
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button class="action-btn" @click="$router.push('/order/list')">
            <el-icon size="24"><List /></el-icon>
            <span>订单查询</span>
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button class="action-btn" @click="$router.push('/check/records')">
            <el-icon size="24"><Finished /></el-icon>
            <span>检票记录</span>
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button class="action-btn" @click="$router.push('/ota/mappings')">
            <el-icon size="24"><Link /></el-icon>
            <span>OTA映射</span>
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button class="action-btn" @click="$router.push('/finance/reconciliation')">
            <el-icon size="24"><PieChart /></el-icon>
            <span>财务对账</span>
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button class="action-btn" @click="$router.push('/system/merchants')">
            <el-icon size="24"><Setting /></el-icon>
            <span>系统设置</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.dashboard {
  h2 {
    margin-bottom: 20px;
  }
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.quick-actions {
  .action-btn {
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
  }
}
</style>
