<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, type Ref } from 'vue'
import {
  NAlert, NButton, NCard, NIcon, NInput, NRadio
} from 'naive-ui'
import {
  UpdateSharp,
  VpnLockRound,
  SystemUpdateAltRound,
  BrowserUpdatedRound,
  SpeedRound, RefreshRound
} from '@vicons/material'
import MyModal from '../templates/MyModal.vue'
import ModalPreferences from './ModalPreferences.vue'
import FoldableCard from '../templates/FoldableCard.vue'
import type { ProcessStage, ProgressData } from 'env.electron'
import { useStore } from '@/store'
import AppStatus from '@/variables/app-status'
import { checkUrlLag } from '@/tools/web-request'
import type { AppVersionJson } from '@/models'
import { fixUserConfig, type UserConfigModel } from '@/models/config-user'
import { checkAppUpdates } from '@/tools'

const store = useStore()
const t = inject<(text: string, ...args: any[]) => string>('t') ?? (() => { return '' })
// const isMobile = inject<Ref<boolean>>('isMobile') ?? ref(false)
const userConfig = inject<Ref<UserConfigModel>>('userConfig')!

const showModal = defineModel<boolean>('show', { required: true })

onMounted(() => {
  if (window.electronAPI?.onUpdateProgress) {
    window.electronAPI.onUpdateProgress(handleProgress)
  } else {
    updateTip.titleText = t('{ver}版本以上的客户端才能查看当前更新进度。', {
      ver: 'v3'
    })
  }
  useCustomProxy.value = userConfig.value.use_custom_proxy
  customProxyUrl.value = userConfig.value.custom_proxy_url
})
const onLoad = async () => {
  if (window.electronAPI?.clientVersion) {
    currentElectronVersion.value = await window.electronAPI?.clientVersion
  }
  handleCheckUpdates()
}

const checkingUpdates = ref(false)
const updateTip = reactive({
  updating: false,
  updating_hqhelper: false,
  updating_electron: false,
  error: false,
  titleText: '',
  contentText: '',
  downloaded: '',
  total: '',
  downloadSpeed: ''
})
const versionContent = ref<AppVersionJson>()
const latestHqHelperVersion = ref<string | null>('')
const latestElectronVersion = ref<string | null>('')
const useCustomProxy = ref(false)
const customProxyUrl = ref('')
const proxyValue = ref('https://ghfast.top')
const proxyPings = ref<Record<string, number | "timeout" | "unknown" | "error">>({})
const proxyOptions = [
  { label: t('不使用加速服务'), value: '' },
  { label: 'ghfast.top', value: 'https://ghfast.top' },
  { label: 'github.moeyy.xyz', value: 'https://github.moeyy.xyz' },
  { label: 'gh.jasonzeng.dev', value: 'https://gh.jasonzeng.dev/' },
  // https://www.cnblogs.com/ting1/p/18356265
]
const currentElectronVersion = ref('UNKNOWN')
const hqhelperNeedUpdate = computed(() => {
  return latestHqHelperVersion.value && latestHqHelperVersion.value != AppStatus.Version
})
const electronNeedUpdate = computed(() => {
  return latestElectronVersion.value && latestElectronVersion.value != currentElectronVersion.value
})
const proxy = computed(() => {
  let proxy = proxyValue.value || ''
  if (useCustomProxy.value) {
    proxy = customProxyUrl.value || ''
  }
  if (proxy) proxy = `${proxy}/`
  return proxy
})

const handleShowProxySiteStatus = () => {
  window.open("https://ghproxy.link/")
}
const handleProgress = (progressData: ProgressData) => {
  const error = progressData.error
  const stage = dealProcessStage(progressData.stage)

  updateTip.error = !!error
  updateTip.downloaded = progressData.progress?.downloaded ?? "???"
  updateTip.total = progressData.progress?.total ?? "???"
  updateTip.downloadSpeed = progressData.progress?.speed ?? "???"

  updateTip.titleText = error ? t('{stage}失败', dealProcessStage(error.onstage)) : t('正在{stage}……', stage)
  if (progressData.stage === 'downloading') {
    updateTip.titleText += ' ' + t('已下载 {now} / {total} MB | 当前速度：{speed}MB/s',
      { now: updateTip.downloaded, total: updateTip.total, speed: updateTip.downloadSpeed }
    )
  }

  updateTip.contentText = ''
  if (error?.msg) {
    updateTip.contentText = error.msg
  }

  if (progressData.stage === 'end') {
    updateTip.updating_hqhelper = false
    updateTip.updating_electron = false
  }
  updateTip.updating = updateTip.updating_hqhelper || updateTip.updating_electron

  function dealProcessStage(stage: ProcessStage) {
    switch (stage) {
      case 'requesting': return t('建立连接')
      case 'downloading': return t('下载更新包')
      case 'extracting': return t('解压更新包')
      case 'replacing': return t('替换文件')
      case 'cleaning': return t('清理临时文件')
      case 'relaunching': return t('重启程序')
      case 'opening': return t('打开安装包')
      case 'end':
      default: return ''
    }
  }
}
const handleCheckUpdates = async () => {
  if (!window.electronAPI?.httpGet) {
    alert('electronAPI.httpGet is not defined'); return
  }
  checkingUpdates.value = true
  latestHqHelperVersion.value = ''
  latestElectronVersion.value = ''
  try {
    const checkUpdateResponse = await checkAppUpdates()
    if (checkUpdateResponse.success) {
      versionContent.value = checkUpdateResponse.data!
      latestHqHelperVersion.value = versionContent.value.hqhelper
      latestElectronVersion.value = versionContent.value.electron
    } else {
      dealFailure(checkUpdateResponse.message, checkUpdateResponse)
    }
  } catch (e: any) {
    dealFailure(e?.message || 'UNKNOWN ERROR', e)
  } finally {
    checkingUpdates.value = false
  }

  function dealFailure(msg: string, errdata: any) {
    console.error(errdata)
    alert(t('检查更新失败：{error}', msg))
    latestHqHelperVersion.value = null
    latestElectronVersion.value = null
  }
}

const getDoUpdateBtnText = (versionNow: string, versionLatest: string | null) => {
  if (versionLatest === '') {
    return t('检测中……')
  } else if (versionLatest === null) {
    return t('检测失败')
  } else if (versionNow === versionLatest) {
    return t('已是最新版本')
  } else {
    return t('立即更新', versionLatest)
  }
}
const hqHelperUpdateBtnText = computed(() => {
  if (updateTip.updating_hqhelper) {
    return t('正在更新')
  } else {
    return getDoUpdateBtnText(AppStatus.Version, latestHqHelperVersion.value)
  }
})
const electronUpdateBtnText = computed(() => {
  if (updateTip.updating_electron) {
    return t('正在更新')
  } else {
    return getDoUpdateBtnText(currentElectronVersion.value, latestElectronVersion.value)
  }
})

const handleProxyOptionChange = (e: Event) => {
  useCustomProxy.value = false
  proxyValue.value = (e.target as HTMLInputElement).value
}
const handlePing = async () => {
  proxyPings.value = {}
  const pingFunc = window.electronAPI?.simulatePing || checkUrlLag
  const doPing = async (proxyUrl: string) => {
    try {
      return await pingFunc(proxyUrl || 'github.com')
    } catch {
      return 'error'
    }
  }
  for (const proxyUrl of proxyOptions.map(o => o.value)) {
    proxyPings.value[proxyUrl] = await doPing(proxyUrl)
  }
  if (useCustomProxy.value && customProxyUrl.value) {
    proxyPings.value[customProxyUrl.value] = await doPing(customProxyUrl.value)
  }
}
const getProxyPingText = (proxy: string) => {
  const ping = proxyPings.value[proxy]
  if (ping === undefined) {
    return ''
  } else if (ping === 'timeout') {
    return t('超时')
  } else if (ping === 'unknown') {
    return t('未知')
  } else if (ping === 'error') {
    return t('错误')
  } else {
    return ping + 'ms'
  }
}
const getProxyPingStyle = (proxy: string) => {
  const ping = proxyPings.value[proxy]
  if (ping === undefined) {
    return 'display: none;'
  } else if (ping === 'timeout' || ping === 'error') {
    return 'color: red;'
  } else if (ping === 'unknown') {
    return 'color: royalblue;'
  } else if (ping < 200) {
    return 'color: green;'
  } else if (ping < 400) {
    return 'color: orange;'
  } else {
    return 'color: orangered;'
  }
}

const saveUpdateSettings = () => {
  const newConfig = fixUserConfig(store.state.userConfig)
  newConfig.use_custom_proxy = useCustomProxy.value
  newConfig.custom_proxy_url = customProxyUrl.value
  store.commit('setUserConfig', newConfig)
}
const handleDownloadWebPack = async () => {
  if (!window.electronAPI?.downloadUpdatePack) {
    alert('electronAPI.downloadUpdatePack is not defined'); return
  }
  if (!window.confirm(
    t('即将开始下载HqHelper更新包，可能需要一些时间。')
    + '\n' + t('更新成功后将自动重启程序。')
    + '\n' + t('如果长时间无反应，请尝试关闭程序，重新打开并调整“加速服务”的设置。')
    + '\n' + t('确认要现在开始更新吗?')
  )) {
    return
  }
  updateTip.updating_hqhelper = true

  saveUpdateSettings()
  let url = versionContent.value?.dlink_hqhelper
  if (!url) {
    alert('Update link not given. Server might be undergoing maintenance...')
  } else if (!latestHqHelperVersion.value) {
    alert('latestHqHelperVersion not given, Please retry later.')
  } else if (versionContent.value?.maintenance_webpack) {
    alert(t('服务器正在维护，暂时不能更新。') + '\n' + t('请稍等片刻。'))
  } else {
    url = url.replace('~PROXY', proxy.value)
    url = url.replace('~VERSION', latestHqHelperVersion.value)
    const err = await window.electronAPI.downloadUpdatePack(url)
    if (err) {
      alert(t('下载更新包失败：{errmsg}', err))
      updateTip.titleText = ''
    }
  }
}
const getClientDownloadLink = async () => {
  let url : string | undefined = ''
  if (window.electronAPI?.clientPlatform) {
    const platform = await window.electronAPI.clientPlatform
    if (platform === 'darwin') {
      url = versionContent.value?.dlink_electron_mac
    } else {
      url = versionContent.value?.dlink_electron
    }
  } else {
    url = versionContent.value?.dlink_electron
  }
  return url
}
const handleDownloadElectronPack = async () => {
  if (userConfig.value.update_client_builtin) {
    if (!window.electronAPI?.downloadAndOpen) {
      alert('function downloadAndOpen is not defined.\nPlease check the client version (v6+ is required).'); return
    }
    if (!window.confirm(
      t('即将开始下载新版客户端安装包，可能需要一些时间。')
      + '\n' + t('更新成功后将自动打开安装包。')
      + '\n' + t('如果长时间无反应，请尝试关闭程序，重新打开并调整“加速服务”的设置。')
      + '\n' + t('确认要现在开始更新吗?')
    )) {
      return
    }
    updateTip.updating_electron = true

    saveUpdateSettings()
    let url = await getClientDownloadLink()
    if (!url) {
      alert('Update link not given. Server might be undergoing maintenance...')
    } else if (!latestElectronVersion.value) {
      alert('latestElectronVersion not given, Please retry later.')
    } else if (versionContent.value?.maintenance_client) {
      alert(t('服务器正在维护，暂时不能更新。') + '\n' + t('请稍等片刻。'))
    } else {
      url = url.replace('~PROXY', proxy.value)
      url = url.replace('~VERSION', latestElectronVersion.value)
      const err = await window.electronAPI.downloadAndOpen(url, t('客户端更新程序') + '.exe')
      if (err) {
        alert(t('下载安装包失败：{errmsg}', err))
        updateTip.titleText = ''
      }
    }
  } else {
    if (!window.confirm(
      t('即将开始下载客户端更新包。由于客户端体积较大，将调用系统默认浏览器打开下载页。')
      + '\n' + t('下载成功后，运行下载的安装包即可将客户端更新到新版本。')
      + '\n' + t('如果下载速度过慢，请尝试取消下载，调整“加速服务”的设置后重试。')
      + '\n' + t('确认要现在开始更新吗?')
    )) {
      return
    }
    saveUpdateSettings()
    const func = window.electronAPI?.openUrlByBrowser ?? window.open
    let url = await getClientDownloadLink()
    if (!url) {
      alert('Update link not given. Server might be undergoing maintenance...')
    } else if (!latestElectronVersion.value) {
      alert('latestElectronVersion not given, Please retry later.')
    } else if (versionContent.value?.maintenance_client) {
      alert(t('服务器正在维护，暂时不能更新。') + '\n' + t('请稍等片刻。'))
    } else {
      url = url.replace('~PROXY', proxy.value)
      url = url.replace('~VERSION', latestElectronVersion.value)
      func(url)
    }
  }
}

const showPreferencesModal = ref(false)
const handleSettingButtonClick = () => {
  showPreferencesModal.value = true
}
</script>

<template>
  <MyModal
    v-model:show="showModal"
    :icon="UpdateSharp"
    :title="t('检查更新')"
    height="auto"
    @on-load="onLoad"
    show-setting
    @on-setting-button-clicked="handleSettingButtonClick"
  >
    <div class="wrapper">
      <FoldableCard class="card proxy" card-key="modal-cu-proxy" card-size="small" show-card-border>
        <template #header>
          <div class="card-title">
            <n-icon><VpnLockRound /></n-icon>
            <span class="title">{{ t('加速服务') }}</span>
            <div class="card-title-actions font-small">
              <a href="javascript:void(0)" @click="handleShowProxySiteStatus">[{{ t('服务站状况') }}]</a>
            </div>
          </div>
        </template>

        <div class="proxy-card-container">
          <div class="tip-text">
          </div>
          <div class="proxy-actions">
          </div>
          <div class="proxy-selection-container">
            <div
              class="proxy-item"
              v-for="option in proxyOptions"
              :key="'proxy-' + option.value"
            >
              <div class="proxy-option">
                <n-radio
                  name="proxy-option"
                  :checked="!useCustomProxy && proxyValue === option.value"
                  :value="option.value"
                  @change="handleProxyOptionChange"
                >
                  {{ option.label }}
                </n-radio>
              </div>
              <div class="proxy-ping" :style="getProxyPingStyle(option.value)">
                {{ getProxyPingText(option.value) }}
              </div>
            </div>
            <div class="proxy-item">
              <div class="proxy-option">
                <n-radio
                  name="proxy-option"
                  v-model:checked="useCustomProxy"
                >
                  {{ t('自定义加速服务') }}
                </n-radio>
              </div>
              <div class="proxy-ping">
                <n-input
                  size="tiny"
                  v-show="useCustomProxy"
                  v-model:value="customProxyUrl"
                  style="width: 250px;"
                >
                  <template #suffix>
                    <div class="proxy-ping" :style="getProxyPingStyle(customProxyUrl)">
                      ({{ getProxyPingText(customProxyUrl) }})
                    </div>
                  </template>
                </n-input>
              </div>
            </div>
          </div>
          <div class="edge-top-right">
            <n-button size="tiny" @click="handlePing">
              <template #icon>
                <n-icon><SpeedRound /></n-icon>
              </template>
              {{ t('连接检测') }}
            </n-button>
          </div>
        </div>
      </FoldableCard>
      <n-card class="card web-version" size="small" embedded>
        <template #header>
          <div class="card-title">
            <n-icon><SystemUpdateAltRound /></n-icon>
            <span class="title">{{ t('HqHelper版本') }}</span>
          </div>
        </template>

        <div class="version-card-container">
          <div class="versions">
            <div>{{ t('当前版本：{v}', AppStatus.Version) }}</div>
            <div>
              <span>{{ t('最新版本：') }}</span>
              <span v-if="latestHqHelperVersion">{{ latestHqHelperVersion }}</span>
              <span v-else-if="latestHqHelperVersion===''">{{ t('检测中……') }}</span>
              <span v-else>{{ t('检测失败') }}</span>
            </div>
          </div>
          <div class="edge-top-right">
            <n-button size="tiny" class="btn-recheck" :loading="checkingUpdates" @click="handleCheckUpdates">
              <template #icon>
                <n-icon><RefreshRound /></n-icon>
              </template>
              {{ t('重新检测') }}
            </n-button>
          </div>
          <div class="action">
            <n-button
              class="btn-do-update"
              :loading="updateTip.updating_hqhelper"
              :disabled="!hqhelperNeedUpdate || updateTip.updating_hqhelper"
              @click="handleDownloadWebPack"
            >
              {{ hqHelperUpdateBtnText }}
            </n-button>
          </div>
        </div>
      </n-card>
      <n-card class="card web-version" size="small" embedded>
        <template #header>
          <div class="card-title">
            <n-icon><BrowserUpdatedRound /></n-icon>
            <span class="title">{{ t('客户端版本') }}</span>
          </div>
        </template>

        <div class="version-card-container">
          <div class="versions">
            <div>{{ t('当前版本：{v}', currentElectronVersion) }}</div>
            <div>
              <span>{{ t('最新版本：') }}</span>
              <span v-if="latestElectronVersion">{{ latestElectronVersion }}</span>
              <span v-else-if="latestElectronVersion===''">{{ t('检测中……') }}</span>
              <span v-else>{{ t('检测失败') }}</span>
            </div>
          </div>
          <div class="edge-top-right">
            <n-button size="tiny" class="btn-recheck" :loading="checkingUpdates" @click="handleCheckUpdates">
              <template #icon>
                <n-icon><RefreshRound /></n-icon>
              </template>
              {{ t('重新检测') }}
            </n-button>
          </div>
          <div class="action">
            <n-button
              class="btn-do-update"
              :loading="updateTip.updating_electron"
              :disabled="!electronNeedUpdate || updateTip.updating_electron"
              @click="handleDownloadElectronPack"
            >
              {{ electronUpdateBtnText }}
            </n-button>
          </div>
        </div>
      </n-card>
      <n-alert v-if="updateTip.error" class="card upd-tip" type="error" :title="updateTip.titleText">
        {{ updateTip.contentText }}
      </n-alert>
      <n-alert v-else-if="updateTip.updating && updateTip.titleText" class="card upd-tip" type="info">
        {{ updateTip.titleText }}
      </n-alert>
    </div>

    <ModalPreferences
      v-model:show="showPreferencesModal"
      setting-group="update"
      app-show-fp
    />
  </MyModal>
</template>

<style scoped>
/* All */
.wrapper {
  gap: 1rem;
  user-select: text;
}
.proxy-card-container {
  position: relative;

  .proxy-selection-container {
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: 3px;

    .proxy-item {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 15px;
    }
  }
}
.version-card-container {
  position: relative;

  .btn-do-update {
    margin-top: 5px;
    width: 100%;
    height: 60px;
  }
}

/* Desktop */
@media screen and (min-width: 768px) {
  .wrapper {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    .card.proxy, .card.upd-tip {
      grid-column: 1 / 3;
    }
  }
}

/* Mobile */
@media screen and (max-width: 767px) {
  .wrapper {
    display: flex;
    flex-direction: column;
  }
}
</style>