<template>
  <view class="voice-page">
    <view class="voice-panel tang-card">
      <view class="status-orb" :class="{ active: isRecording }" />
      <view class="title">{{ title }}</view>
      <view class="subtitle">{{ subtitle }}</view>

      <view v-if="recognizedText" class="result-text">
        {{ recognizedText }}
      </view>

      <view class="actions">
        <button
          class="primary-btn"
          :loading="isSubmitting"
          :disabled="isSubmitting || !requestId"
          @tap="toggleRecord"
        >
          {{ isRecording ? '停止录音' : recognizedText ? '重新录音' : '开始录音' }}
        </button>
        <button class="secondary-btn" :disabled="isSubmitting" @tap="cancelVoiceInput">返回</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onBackPress, onLoad, onUnload } from '@dcloudio/uni-app';
import { VOICE_API_BASE_URL } from '@/config/endpoints';

declare function setTimeout(handler: () => void, timeout?: number): number;
declare function clearTimeout(handle?: number): void;
declare const console: {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

const FALLBACK_API_BASE_URL = VOICE_API_BASE_URL;
const VOICE_CANCELLED_ERROR = '__WECHAT_VOICE_CANCELLED__';
const RECORDER_OPTIONS = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3',
  frameSize: 50,
};

const requestId = ref('');
const apiBaseUrl = ref(FALLBACK_API_BASE_URL);
const isRecording = ref(false);
const isSubmitting = ref(false);
const hasSubmittedResult = ref(false);
const recognizedText = ref('');
const title = ref('正在准备语音输入');
const subtitle = ref('请直接说话，说完后点击停止录音。');

let recorderManager: any = null;
let hasBoundRecorderEvents = false;
let ignoreNextStop = false;
let returnTimer: number | undefined;

function normalizeBaseUrl(raw?: string) {
  const value = raw ? decodeURIComponent(raw) : FALLBACK_API_BASE_URL;
  return value.replace(/\/+$/, '');
}

function getRecorderManager() {
  if (recorderManager) return recorderManager;

  recorderManager = (uni as any).getRecorderManager?.();
  if (!recorderManager) {
    throw new Error('当前平台不支持小程序录音能力');
  }
  return recorderManager;
}

function bindRecorderEvents() {
  if (hasBoundRecorderEvents) return;
  const manager = getRecorderManager();

  manager.onStart(() => {
    isRecording.value = true;
    title.value = '正在录音';
    subtitle.value = '说完后点击停止录音。';
  });

  manager.onStop((result: { tempFilePath?: string; duration?: number; fileSize?: number }) => {
    isRecording.value = false;

    if (ignoreNextStop || hasSubmittedResult.value) {
      ignoreNextStop = false;
      return;
    }

    if (!result.tempFilePath) {
      submitResult({ error: '录音文件生成失败，请重新试一次。' });
      return;
    }

    uploadAudio(result.tempFilePath, result.duration, result.fileSize);
  });

  manager.onError((error: { errMsg?: string }) => {
    isRecording.value = false;
    const message = error.errMsg || '录音失败，请稍后再试。';
    title.value = '录音失败';
    subtitle.value = message;
    submitResult({ error: message });
  });

  hasBoundRecorderEvents = true;
}

function ensureRecordPermission() {
  return new Promise<void>((resolve, reject) => {
    uni.getSetting({
      success: (settings) => {
        const recordAuth = settings.authSetting?.['scope.record'];
        if (recordAuth) {
          resolve();
          return;
        }

        uni.authorize({
          scope: 'scope.record',
          success: () => resolve(),
          fail: () => reject(new Error('请授权麦克风权限')),
        });
      },
      fail: () => reject(new Error('麦克风权限检查失败')),
    });
  });
}

function startRecord() {
  try {
    bindRecorderEvents();
    recognizedText.value = '';
    ignoreNextStop = false;
    title.value = '正在启动录音';
    subtitle.value = '请稍候...';
    getRecorderManager().start(RECORDER_OPTIONS);
  } catch (error: any) {
    submitResult({ error: error.message || '录音启动失败' });
  }
}

function toggleRecord() {
  if (isSubmitting.value) return;

  if (isRecording.value) {
    title.value = '正在结束录音';
    subtitle.value = '录音完成后会自动上传识别。';
    getRecorderManager().stop();
    return;
  }

  ensureRecordPermission()
    .then(startRecord)
    .catch((error: Error) => submitResult({ error: error.message }));
}

function parseUploadData(data: unknown) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return { detail: data };
    }
  }
  return data as Record<string, any>;
}

function uploadAudio(filePath: string, duration?: number, fileSize?: number) {
  if (!requestId.value || hasSubmittedResult.value) return;

  hasSubmittedResult.value = true;
  isSubmitting.value = true;
  title.value = '正在识别语音';
  subtitle.value = '录音已完成，正在上传到后端识别。';

  const uploadUrl = `${apiBaseUrl.value}/api/v1/voice/wechat-asr/sessions/${encodeURIComponent(requestId.value)}/audio`;
  console.info('[voice-recognizer] upload audio', {
    url: uploadUrl,
    duration,
    fileSize,
  });

  uni.uploadFile({
    url: uploadUrl,
    filePath,
    name: 'audio',
    timeout: 90000,
    formData: {
      language: 'zh',
    },
    success: (response: any) => {
      const body = parseUploadData(response.data) as any;
      if (response.statusCode >= 400) {
        const detail = body.detail || body.message || '语音识别失败，请稍后再试。';
        console.warn('[voice-recognizer] upload rejected', {
          statusCode: response.statusCode,
          detail,
        });
        title.value = '识别失败';
        subtitle.value = detail;
        returnTimer = setTimeout(goBack, 1200);
        return;
      }

      const text = String(body.text || '').trim();
      recognizedText.value = text;
      title.value = text ? '识别完成' : '没有听清';
      subtitle.value = text ? '正在把文字带回数字人页面。' : '可以重新录音，或返回后再试。';
      uni.showToast({
        title: text ? '已识别' : '没有听清',
        icon: 'none',
        duration: 650,
      });
      returnTimer = setTimeout(goBack, 700);
    },
    fail: (error: any) => {
      console.error('[voice-recognizer] upload failed', error);
      hasSubmittedResult.value = false;
      isSubmitting.value = false;
      title.value = '上传失败';
      subtitle.value = `请检查后端地址、手机网络和 request 合法域名：${apiBaseUrl.value}`;
      submitResult({ error: '语音上传失败，请检查网络后重试。' });
    },
  } as any);
}

function submitResult(payload: { text?: string; error?: string }) {
  if (!requestId.value || hasSubmittedResult.value) return;

  hasSubmittedResult.value = true;
  isSubmitting.value = true;
  const submitUrl = `${apiBaseUrl.value}/api/v1/voice/wechat-asr/sessions/${encodeURIComponent(requestId.value)}/result`;
  console.info('[voice-recognizer] submit result', {
    url: submitUrl,
    hasText: Boolean(payload.text),
    hasError: Boolean(payload.error),
  });
  uni.request({
    url: submitUrl,
    method: 'POST',
    timeout: 12000,
    header: {
      'content-type': 'application/json',
    },
    data: payload,
    success: () => {
      uni.showToast({
        title: payload.text ? '已识别' : payload.error === VOICE_CANCELLED_ERROR ? '已取消' : '已返回错误',
        icon: 'none',
        duration: 650,
      });
      returnTimer = setTimeout(goBack, 700);
    },
    fail: (error) => {
      console.error('[voice-recognizer] submit failed', error);
      hasSubmittedResult.value = false;
      isSubmitting.value = false;
      title.value = '回传失败';
      subtitle.value = `请检查后端地址、手机网络和 request 合法域名：${apiBaseUrl.value}`;
    },
  });
}

function cancelVoiceInput() {
  if (!requestId.value) {
    goBack();
    return;
  }

  title.value = '已取消语音输入';
  subtitle.value = '正在返回数字人页面。';
  submitResult({ error: VOICE_CANCELLED_ERROR });

  if (isRecording.value && recorderManager) {
    ignoreNextStop = true;
    recorderManager.stop();
  }
}

function goBack() {
  if (isRecording.value && recorderManager) {
    ignoreNextStop = true;
    recorderManager.stop();
  }

  uni.navigateBack({
    fail: () => {
      uni.navigateTo({ url: '/pages/live2d/index' });
    },
  });
}

onBackPress(() => {
  if (!hasSubmittedResult.value && requestId.value) {
    cancelVoiceInput();
    return true;
  }

  return false;
});

onLoad((query = {}) => {
  requestId.value = String(query.requestId || '');
  apiBaseUrl.value = normalizeBaseUrl(String(query.apiBaseUrl || ''));
  console.info('[voice-recognizer] loaded', {
    requestId: requestId.value,
    apiBaseUrl: apiBaseUrl.value,
  });

  if (!requestId.value) {
    title.value = '缺少语音会话';
    subtitle.value = '请回到数字人页面重新点击语音按钮。';
    return;
  }

  ensureRecordPermission()
    .then(startRecord)
    .catch((error: Error) => submitResult({ error: error.message }));
});

onUnload(() => {
  if (returnTimer !== undefined) {
    clearTimeout(returnTimer);
    returnTimer = undefined;
  }
  if (isRecording.value && recorderManager) {
    ignoreNextStop = true;
    recorderManager.stop();
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.voice-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 48rpx;
  background:
    radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.2), transparent 34%),
    linear-gradient(180deg, #2b1717, #111827);
}

.voice-panel {
  width: 100%;
  padding: 54rpx 42rpx 44rpx;
  text-align: center;
  background: rgba(255, 252, 248, 0.94);
}

.status-orb {
  width: 48rpx;
  height: 48rpx;
  margin: 0 auto 34rpx;
  border-radius: 50%;
  background: #9ca3af;
}

.status-orb.active {
  background: #ef4444;
  box-shadow: 0 0 0 18rpx rgba(239, 68, 68, 0.16);
}

.title {
  color: $shendu-red;
  font-size: 40rpx;
  font-weight: 900;
}

.subtitle {
  margin-top: 20rpx;
  color: $text-muted;
  font-size: 27rpx;
  line-height: 1.6;
}

.result-text {
  margin-top: 34rpx;
  border: 1px solid rgba(212, 175, 55, 0.26);
  border-radius: 24rpx;
  padding: 24rpx;
  color: $text-main;
  font-size: 30rpx;
  line-height: 1.55;
  text-align: left;
  background: rgba(250, 248, 245, 0.8);
}

.actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20rpx;
  margin-top: 42rpx;
}

.primary-btn,
.secondary-btn {
  height: 82rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.primary-btn {
  color: #fff;
  background: $shendu-red;
}

.secondary-btn {
  color: $shendu-red;
  background: rgba(212, 175, 55, 0.18);
}
</style>
