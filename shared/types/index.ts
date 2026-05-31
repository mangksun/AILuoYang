// 票种状态
export enum TicketStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

// 票种分组
export interface TicketGroup {
  id: number;
  name: string;
  sortOrder: number;
  status: TicketStatus;
}

// 检票次数限制（项目级别）
export interface ProjectLimit {
  projectId: number;
  maxUses: number;
}

// 票种
export interface TicketType {
  id: number;
  groupId: number;
  name: string;
  price: number;
  validDays: number;
  usableDays: number;
  totalUses: number;
  gateUses: number;
  projectLimits: ProjectLimit[];
  status: TicketStatus;
  expireDate?: string;
  purchaseLimit?: number;
  needReservation: boolean;
  needApproval: boolean;
  description?: string;
  createdAt: string;
}

// 项目/检票点
export interface Project {
  id: number;
  name: string;
  location?: string;
  status: TicketStatus;
}

// 会员卡类型
export enum MemberCardType {
  ANNUAL = 'annual',     // 年卡
  TIMES = 'times',       // 次卡
  STORED = 'stored',     // 储值卡
  TIMED = 'timed',       // 计时收费
}

export interface MemberCardTypeConfig {
  id: number;
  name: string;
  type: MemberCardType;
  price: number;
  validityDays: number;
  totalUses?: number;
  projectLimits: ProjectLimit[];
  antiFraudInterval: number; // 防作弊间隔（秒）
  swipePurchaseEnabled: boolean;
  status: TicketStatus;
}

// 会员卡实例
export interface MemberCard {
  id: number;
  cardNo: string;
  cardTypeId: number;
  userId: number;
  balance: number;
  remainingUses: number;
  activatedAt?: string;
  expireAt?: string;
  status: 'active' | 'frozen' | 'expired';
}

// 支付方式
export enum PayMethod {
  CASH = 'cash',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  MEMBER_CARD = 'member_card',
}

// 订单渠道
export enum OrderChannel {
  OFFLINE = 'offline',       // 线下收银台
  MINIAPP = 'miniapp',       // 小程序
  DOUYIN = 'douyin',         // 抖音
  MEITUAN = 'meituan',       // 美团
  CTRIP = 'ctrip',           // 携程
}

// 订单状态
export enum OrderStatus {
  PENDING = 'pending',       // 待支付
  PAID = 'paid',             // 已支付
  PARTIAL_REFUND = 'partial_refund', // 部分退款
  REFUNDED = 'refunded',     // 已退款
  CANCELLED = 'cancelled',   // 已取消
  EXPIRED = 'expired',       // 已过期
}

// 订单
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  ticketTypeId: number;
  quantity: number;
  totalAmount: number;
  payAmount: number;
  payMethod: PayMethod;
  payStatus: 'unpaid' | 'paid' | 'refunded';
  channel: OrderChannel;
  status: OrderStatus;
  refundAmount: number;
  refundedAt?: string;
  createdAt: string;
}

// 退款方式
export enum RefundMethod {
  ORIGINAL = 'original', // 原路退回
  CASH = 'cash',         // 现金退还
}

// 退款记录
export interface Refund {
  id: number;
  orderId: number;
  refundNo: string;
  amount: number;
  method: RefundMethod;
  status: 'pending' | 'success' | 'failed';
  reason?: string;
  operatorId: number;
  createdAt: string;
}

// 检票类型
export enum CheckType {
  ENTRY = 'entry',       // 入园
  PROJECT = 'project',   // 项目
}

// 检票结果
export enum CheckResult {
  SUCCESS = 'success',
  FAILED = 'failed',
}

// 检票记录
export interface CheckRecord {
  id: number;
  orderId: number;
  cardId?: number;
  projectId: number;
  gateId: number;
  checkType: CheckType;
  result: CheckResult;
  failReason?: string;
  checkedAt: string;
}

// 核销状态
export enum VerificationStatus {
  UNUSED = 'unused',
  USED = 'used',
}

// 核销记录
export interface Verification {
  id: number;
  orderId: number;
  status: VerificationStatus;
  firstVerifiedAt?: string;
  verifiedBy?: number;
}

// OTA渠道
export enum OtaChannel {
  DOUYIN = 'douyin',
  MEITUAN = 'meituan',
  CTRIP = 'ctrip',
}

// OTA产品映射
export interface OtaProductMapping {
  id: number;
  channel: OtaChannel;
  localTicketId: number;
  remoteProductId: string;
  remoteProductName: string;
  retailPrice: number;
  settlementPrice: number;
  status: TicketStatus;
}

// 用户角色
export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  CASHIER = 'cashier',
  FINANCE = 'finance',
}

// 管理员用户
export interface AdminUser {
  id: number;
  username: string;
  role: UserRole;
  merchantId: number;
  status: 'active' | 'disabled';
}

// 商户
export interface Merchant {
  id: number;
  name: string;
  config: MerchantConfig;
  status: TicketStatus;
}

// 商户配置
export interface MerchantConfig {
  swipePurchaseEnabled: boolean;
  identityVerifyEnabled: boolean;
  timedChargeEnabled: boolean;
}

// API 响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
