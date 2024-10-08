<script setup lang="ts">
import { inject, ref, watch, type Ref } from 'vue'
import {
  NButton, NCard, NCollapse, NCollapseItem, NIcon, NModal, NPopover, NRadioButton, NRadioGroup, NSelect, NSwitch, NTabs, NTabPane
} from 'naive-ui'
import { useStore } from '@/store/index'
import { type UserConfigModel, fixUserConfig } from '@/models/user-config'
import {
  HelpOutlineRound,
  SettingsSharp,
  TravelExploreRound,
  TrendingUpRound,
  ColorLensRound,
  MemoryRound,
  UpdateRound,
  // WifiRound,
  SaveOutlined
} from '@vicons/material'
import { deepCopy } from '@/tools'

const store = useStore()
const t = inject<(text: string, ...args: any[]) => string>('t') ?? (() => { return '' })
const isMobile = inject<Ref<boolean>>('isMobile') ?? ref(false)

const showModal = defineModel<boolean>('show', { required: true })
const emit = defineEmits(['close', 'afterSubmit'])

// #region data
interface UserPreferenceGroup {
  key: string
  icon: typeof TravelExploreRound
  text: string
  children: UserPreferenceItem[]
}
interface UserPreferenceItem {
  key: string
  label: string
  hide?: boolean
  descriptions: {
    value: string
    class: string
    style: string
  }[]
  warnings: {
    value: string
    class: string
    style: string
  }[]
  type: 'radio-group' | 'switch' | 'select'
  options: {
    value: string
    label: string
  }[]
}
const UserPreferenceGroups : UserPreferenceGroup[] = [
  /* General */
  {
    key: 'general',
    icon: TravelExploreRound,
    text: t('通用'),
    children: [
      {
        key: 'language_ui',
        label: t('界面语言'),
        descriptions: [],
        warnings: [],
        type: 'radio-group',
        options: [
          { value: 'zh', label: '简体中文' },
          { value: 'en', label: 'English' },
          { value: 'ja', label: '日本語' }
        ]
      },
      {
        key: 'language_item',
        label: t('物品语言'),
        descriptions: [
          {
            value: t('选择程序中道具的语言。此设置还会影响一部分其他信息(例如地图名)的语言。'),
            class: '',
            style: ''
          },
          {
            value: t('如果选择“自动”，物品语言将跟随“界面语言”的设置。'),
            class: '',
            style: ''
          }
        ],
        warnings: [],
        type: 'radio-group',
        options: [
          { value: 'auto', label: t('自动') },
          { value: 'zh', label: '简体中文' },
          { value: 'en', label: 'English' },
          { value: 'ja', label: '日本語' }
        ]
      },
      {
        key: 'item_server',
        label: t('服务器'),
        descriptions: [
          {
            value: t('选择您游戏账号所属的服务器。此设置还会影响一部分统计数据(例如点数道具的兑换价格)的计算方式。'),
            class: '',
            style: ''
          },
          {
            value: t('如果选择“自动”，程序会根据您在“界面语言”的设置自动判断。'),
            class: '',
            style: ''
          }
        ],
        warnings: [],
        type: 'radio-group',
        options: [
          { value: 'auto', label: t('自动') },
          { value: 'chs', label: t('国服') },
          { value: 'global', label: t('国际服') }
        ]
      },
    ]
  },
  /* Appearance */
  {
    key: 'appearance',
    icon: ColorLensRound,
    text: t('外观'),
    children: [
      {
        key: 'theme',
        label: t('主题'),
        descriptions: [],
        warnings: [],
        type: 'radio-group',
        options: [
          { value: 'system', label: t('跟随系统') },
          { value: 'light', label: t('浅色') },
          { value: 'dark', label: t('深色') }
        ]
      }
    ]
  },
  /* Enhancements */
  {
    key: 'enhancements',
    icon: TrendingUpRound,
    text: t('增强'),
    children: [
      {
        key: 'disable_patchcard_autofold',
        label: t('禁用选择版本后自动折叠'),
        hide: !isMobile.value,
        descriptions: [
          {
            value: t('"选择版本"在手机端有些太占地方，而且一般也不会被高频率地修改，所以我们默认在你选择版本之后就自动折叠它。'),
            class: '',
            style: ''
          },
          {
            value: t('如果你觉得不自动折叠会更好，请打开此选项。'),
            class: '',
            style: ''
          }
        ],
        warnings: [],
        type: 'switch',
        options: []
      },
      {
        key: 'disable_jobbtn_doubleclick',
        label: t('禁用重复点击已选择的职业按钮时添加主副手'),
        descriptions: [
          {
            value: t('在选择了职业之后再度点击职业按钮，将会默认添加一套主副手武器或工具。'),
            class: '',
            style: ''
          },
          {
            value: t('这一功能在第一代HqHelper是默认关闭的，而本代默认开启。如果这与您的习惯相悖，请打开此选项。'),
            class: '',
            style: ''
          }
        ],
        warnings: [],
        type: 'switch',
        options: []
      },
      {
        key: 'macro_direct_copy',
        label: t('点击“复制宏”时直接复制'),
        descriptions: [
          {
            value: t('在默认情况下，每次您点击“复制宏”按钮，程序都会弹窗询问您要复制哪种宏。'),
            class: '',
            style: ''
          },
          {
            value: t('如果您希望提升效率，可以启用此选项，让程序直接按照默认的宏前缀来复制宏。'),
            class: '',
            style: ''
          }
        ],
        warnings: [],
        type: 'switch',
        options: []
      },
      {
        key: 'macro_copy_prefix',
        label: t('默认宏前缀'),
        descriptions: [],
        warnings: [],
        type: 'select',
        options: [
          { value: '', label: t('直接复制(无前缀)') },
          { value: '/e ', label: t('自提醒宏(/e)') },
          { value: '/p ', label: t('小队宏(/p)') },
          { value: '/fc ', label: t('部队宏(/fc)') },
          { value: '/b ', label: t('新频宏(/b)') },
        ]
      },
      {
        key: 'item_button_click_event',
        label: t('点击物品按钮时的行为'),
        descriptions: [
          {
            value: t('决定鼠标左键单击物品按钮时要如何做。'),
            class: '',
            style: ''
          }
        ],
        warnings: [],
        type: 'select',
        options: [
          { value: 'none', label: t('什么都不做') },
          { value: 'copy_name', label: t('复制物品名') },
          { value: 'copy_isearch', label: t('复制物品检索宏') },
        ]
      },
    ]
  },
  /* Performance */
  {
    key: 'performance',
    icon: MemoryRound,
    text: t('性能'),
    children: [
      {
        key: 'disable_workstate_cache',
        label: t('禁用工作状态记忆'),
        descriptions: [
          {
            value: t('应用默认记录您的版本、职业和部件选择，从而让应用长期保持上次关闭时的的工作状态。'),
            class: '',
            style: ''
          },
          {
            value: t('如果您希望每次打开应用都从头开始，或是在使用过程中出现较严重的卡顿，则可以考虑打开此选项。'),
            class: '',
            style: ''
          }
        ],
        warnings: [
          {
            value: t('注意：禁用工作状态记忆后，已记录的工作状态将被立即删除！'),
            class: 'font-center red',
            style: ''
          }
        ],
        type: 'switch',
        options: []
      }
    ]
  },
  /* Network */
  /*
  {
    key: 'network',
    icon: WifiRound,
    text: t('网络'),
    children: [
    ]
  }
  */
  /* Update */
  {
    key: 'update',
    icon: UpdateRound,
    text: t('更新'),
    children: [
      {
        key: 'disable_auto_update',
        label: t('禁用自动更新'),
        descriptions: [
          {
            value: t('我们默认在您启动应用时检查一次最新版本，并提示您进行更新。'),
            class: '',
            style: ''
          },
          {
            value: t('如果您不希望接收到更新提示，则可以考虑打开此选项。'),
            class: '',
            style: ''
          },
          {
            value: t('如果您使用的是网页端，浏览器会因为缓存而自动更新，开启此选项只能让您收到提示的频率减少。'),
            class: 'color-info',
            style: ''
          }
        ],
        warnings: [],
        type: 'switch',
        options: []
      }
    ]
  }
]
const getGroupName = (key: string) => {
  for (const group of UserPreferenceGroups) {
    if (group.key === key) {
      return group.text
    }
  }
  return ''
}
// #endregion

const handleClose = () => {
  showModal.value = false
}

const currentTab = ref('general')
const formData = ref<UserConfigModel>(deepCopy(fixUserConfig(store.state.userConfig)))

watch(showModal, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    formData.value = deepCopy(fixUserConfig(store.state.userConfig))
  }
})

const handleSave = () => {
  formData.value.theme ??= 'system'
  formData.value.language_ui ??= 'zh'
  formData.value.language_item ??= 'auto'
  formData.value.disable_workstate_cache ??= false

  if (formData.value.disable_workstate_cache) {
    formData.value.cache_work_state = {}
    formData.value.fthelper_cache_work_state = {}
    formData.value.gatherclock_cache_work_state = {}
  }

  const newConfig = fixUserConfig(formData.value)
  store.commit('setUserConfig', newConfig)

  emit('afterSubmit')
}
</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      closable
      role="dialog"
      class="no-select"
      style="width: 98%; max-width: 650px;"
      :style="{ height: isMobile ? '450px' : '395px' }"
      @close="handleClose"
    >
      <template #header>
        <div class="card-title">
          <n-icon><SettingsSharp /></n-icon>
          <span class="title">{{ t('偏好设置') }}</span>
          <span class="description">[{{ getGroupName(currentTab) }}]</span>
        </div>
      </template>
      <n-tabs
        animated
        type="line"
        :placement="isMobile ? 'top' : 'left'"
        default-value="general"
        style="height: 100%;"
        v-model:value="currentTab"
      >
        <n-tab-pane
          v-for="(group, index) in UserPreferenceGroups"
          :key="index"
          :name="group.key"
        >
          <template #tab>
            <div class="tab-title">
              <n-icon :size="isMobile ? 20 : 14"><component :is="group.icon" /></n-icon>
              <span v-if="!isMobile">{{ group.text }}</span>
            </div>
          </template>
          <div class="items-container" :style="{ maxHeight: isMobile ? '225px' : '220px' }">
            <div class="items" v-for="item in group.children" :key="item.key" v-show="!item.hide">
              <n-collapse arrow-placement="right">
                <n-collapse-item>
                  <template #header>
                    <div class="item-title">{{ item.label }}</div>
                  </template>
                  <template #arrow>
                    <n-icon v-if="item.descriptions.length" :title="t('点击以展开或折叠此设置项的描述')"><HelpOutlineRound /></n-icon>
                    <n-icon v-else></n-icon>
                  </template>

                  <div class="item-descriptions">
                    <p
                      v-for="(description, index) in item.descriptions"
                      :key="item.key + '-description-' + index"
                      :class="description.class"
                      :style="description.style"
                    >
                      {{ description.value }}
                    </p>
                  </div>
                </n-collapse-item>
              </n-collapse>
              <div class="item-input">
                <n-popover
                  v-if="item.warnings.length"
                  :trigger="isMobile ? 'click' : 'hover'"
                  placement="bottom"
                  :style="item.type === 'switch' ? 'max-width: 300px;' : ''"
                >
                  <template #trigger>
                    <n-switch
                      v-if="item.type ==='switch'"
                      v-model:value="(formData as any)[item.key]"
                    />
                    <n-radio-group
                      v-if="item.type === 'radio-group'"
                      v-model:value="(formData as any)[item.key]"
                      :name="item.key"
                    >
                      <n-radio-button
                        v-for="(option, index) in item.options"
                        :key="item.key + '-option-' + index"
                        :value="option.value"
                        :label="option.label"
                      />
                    </n-radio-group>
                    <n-select
                      v-if="item.type === 'select'"
                      v-model:value="(formData as any)[item.key]"
                      :options="item.options"
                      :style="{ width: isMobile ? '65%' : '50%' }"
                    />
                  </template>
                  <div class="flex-column flex-center">
                    <p
                      v-for="(warning, index) in item.warnings"
                      :key="item.key + '-warning-' + index"
                      :class="warning.class"
                      :style="warning.style"
                    >
                      {{ warning.value }}
                    </p>
                  </div>
                </n-popover>
                <div v-else>
                  <n-switch
                    v-if="item.type ==='switch'"
                    v-model:value="(formData as any)[item.key]"
                  />
                  <n-radio-group
                    v-if="item.type === 'radio-group'"
                    v-model:value="(formData as any)[item.key]"
                    :name="item.key"
                  >
                    <n-radio-button
                      v-for="(option, index) in item.options"
                      :key="item.key + '-option-' + index"
                      :value="option.value"
                      :label="option.label"
                    />
                  </n-radio-group>
                  <n-select
                    v-if="item.type === 'select'"
                    v-model:value="(formData as any)[item.key]"
                    :options="item.options"
                    :style="{ width: isMobile ? '65%' : '50%' }"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
      <template #action>
        <div class="submit-container">
          <n-button type="primary" size="large" @click="handleSave">
            <template #icon>
              <n-icon><SaveOutlined /></n-icon>
            </template>
            {{ t('保存') }}
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
:deep(.n-tabs-pane-wrapper) {
  height: 100%;
  .n-tab-pane {
    height: 100%;
  }
}
:deep(.n-collapse-item__content-inner) {
  padding-top: 0 !important;
}
.items-container {
  max-width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.items {

  .item-title {
    font-weight: bold;
  }
  .item-input {
    margin-top: 5px;
  }
}
.submit-container {
  display: flex;
  justify-content: flex-end;
}
</style>