<script lang="ts" setup>
import { computed, h, inject, nextTick, ref, type Component, type Ref } from 'vue'
import {
  NButton, NDropdown, NIcon,
  useMessage
} from 'naive-ui'
import {
  FileCopyOutlined,
  LanguageOutlined,
  OpenInNewFilled
} from '@vicons/material'
import XivFARImage from './XivFARImage.vue'
import ItemPop from './ItemPop.vue'
import { type ItemInfo } from '@/tools/item'
import type { UserConfigModel } from '@/models/user-config'
import { CopyToClipboard } from '@/tools'

const NAIVE_UI_MESSAGE = useMessage()

const t = inject<(text: string, ...args: any[]) => string>('t') ?? (() => { return '' })
// const isMobile = inject<Ref<boolean>>('isMobile') ?? ref(false)
const userConfig = inject<Ref<UserConfigModel>>('userConfig')!

const itemLanguage = computed(() => {
  if (userConfig.value.language_item !== 'auto') {
    return userConfig.value.language_item
  }
  return userConfig.value.language_ui
})

interface ItemButtonProps {
  /** 道具信息 */
  itemInfo: ItemInfo

  /** 按钮宽度 */
  btnWidth?: string | number;
  /** 按钮高度 */
  btnHeight?: number;
  /** 按钮颜色 */
  btnColor?: string;
  /** 按钮额外样式。
   * * 注意：启用此项将覆盖 `btnWidth` 与 `btnHeight` */
  btnExtraStyle?: string;
  /** 按钮额外类名 */
  btnExtraClass?: string;

  /** 悬浮窗使用自定义宽度 */
  popUseCustomWidth?: boolean;
  /** 悬浮窗的自定义宽度，必须同时设置`popUseCustomWidth`才能生效 */
  popCustomWidth?: number;
  /** 悬浮窗的最大宽度 */
  popMaxWidth?: string;

  /** 是否显示物品图标(可选,默认false) */
  showIcon?: boolean;
  /** 是否显示物品名称(可选,默认false) */
  showName?: boolean;
  /** 是否显示物品数量(可选,默认false) */
  showAmount?: boolean;
  /** 按钮是否禁用(可选,默认false) */
  disabled?: boolean;
  /** 是否禁用物品信息提示框(可选,默认false) */
  disablePop?: boolean;
}
const props = defineProps<ItemButtonProps>()

const getItemName = () => {
  switch (itemLanguage.value) {
    case 'ja':
      return props.itemInfo.nameJA
    case 'en':
      return props.itemInfo.nameEN
    case 'zh':
    default:
      return props.itemInfo.nameZH || '未翻译的物品'
  }
}

const iconSize = computed(() => {
  return (props.btnHeight || 34) - 7
})
const btnWidthVal = computed(() => {
  const _w = props.btnWidth
  if (!_w) return 'auto'
  if (typeof _w === 'string') return _w
  return `${_w}px`
})
const btnHeightVal = computed(() => {
  const _h = props.btnHeight
  if (!_h) return 'auto'
  return `${_h}px`
})

// #region 右键菜单相关
const options = [
  {
    label: t('复制道具名'),
    key: 'copy-item-name',
    icon: renderIcon(FileCopyOutlined),
    children: [
      {
        label: t('中文名'),
        key: 'copy-zh',
        icon: renderIcon(LanguageOutlined)
      },
      {
        label: t('日文名'),
        key: 'copy-ja',
        icon: renderIcon(LanguageOutlined)
      },
      {
        label: t('英文名'),
        key: 'copy-en',
        icon: renderIcon(LanguageOutlined)
      }
    ]
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: t('在灰机维基中打开'),
    key: 'open-in-hjwiki',
    icon: renderIcon(OpenInNewFilled),
    click: () => {
      window.open(`https://ff14.huijiwiki.com/wiki/物品:${props.itemInfo.nameZH}`)
    }
  },
  {
    label: t('在花环数据库中打开'),
    key: 'open-in-garland',
    icon: renderIcon(OpenInNewFilled),
    click: () => {
      window.open(`https://www.garlandtools.org/db/#item/${props.itemInfo.id}`)
    }
  },
  {
    label: t('在Universalis中打开'),
    key: 'open-in-universalis',
    icon: renderIcon(OpenInNewFilled),
    click: () => {
      window.open(`https://universalis.app/market/${props.itemInfo.id}`)
    }
  },
]
function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

const showDropdownRef = ref(false)
const xRef = ref(0)
const yRef = ref(0)
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  showDropdownRef.value = false
  nextTick().then(() => {
    showDropdownRef.value = true
    xRef.value = e.clientX
    yRef.value = e.clientY
  })
}
const handleSelect = async (key: string | number, option: any) => {
  showDropdownRef.value = false
  console.log(key)
  if (option?.click) {
    option.click()
  } else {
    if (key === 'copy-zh') {
      await handleCopy(props.itemInfo.nameZH)
    } else if (key === 'copy-ja') {
      await handleCopy(props.itemInfo.nameJA)
    } else if (key === 'copy-en') {
      await handleCopy(props.itemInfo.nameEN)
    } else {
      console.log('[开发提示] 未分配点击事件', key, option)
    }
  }
}
const handleCopy = async (content: string, successMessage?: string) => {
  const response = await CopyToClipboard(content)
  if (response) {
    NAIVE_UI_MESSAGE.error(t('复制失败：发生意外错误'))
  } else {
    NAIVE_UI_MESSAGE.success(successMessage ?? t('已复制到剪贴板'))
  }
}
const onClickoutside = () => {
  showDropdownRef.value = false
}

// * 移动端通过长按来弹出右键菜单
// 注：这些事件也只会在移动端触发，不用担心在电脑端的兼容性
const touchTimeoutEvent = ref<number | undefined>(undefined)
const handleItemButtonTouchStart = (e: TouchEvent) => {
  touchTimeoutEvent.value = setTimeout(() => {
    if (e?.touches?.length) {
      xRef.value = e.touches[0].clientX
      yRef.value = e.touches[0].clientY
      showDropdownRef.value = true
    } else {
      console.error('No touches found in handleItemButtonTouchStart. event:', e)
    }
  }, 500) // 长按500毫秒触发长按事件
}
const handleItemButtonTouchMove = (/*e: TouchEvent*/) => {
  // 如果有移动则取消所有事件
  clearTimeout(touchTimeoutEvent.value)
  touchTimeoutEvent.value = 0
}
const handleItemButtonTouchEnd = (/*e: TouchEvent*/) => {
  // 按下时长不足以触发长按事件时,触发点击事件
  clearTimeout(touchTimeoutEvent.value)
  if (touchTimeoutEvent.value !== 0) {
    // do click if event added later
  }
}

// #endregion

const handleItemButtonClick = async () => {
  const action = userConfig.value.item_button_click_event
  const itemName = getItemName()
  let copyContent = ''
  if (action === 'copy_name') {
    copyContent = itemName
  } else if (action === 'copy_isearch') {
    copyContent = `/isearch "${itemName}"`
  } else {
    // do nothing
  }

  if (copyContent) {
    await handleCopy(copyContent, t('已复制 {content}', copyContent))
  }
}
</script>

<template>
  <ItemPop
    :item-info="itemInfo"
    :pop-use-custom-width="popUseCustomWidth"
    :pop-custom-width="popCustomWidth"
    :pop-max-width="popMaxWidth"
    :disable-pop="disablePop"
  >
    <n-button
      class="item-button"
      :class="btnExtraClass"
      :style="btnExtraStyle ?? { width: btnWidthVal, height: btnHeightVal }"
      :disabled="disabled"
      :color="btnColor"
      @contextmenu="handleContextMenu"
      @touchstart.passive="handleItemButtonTouchStart" 
      @touchmove.passive="handleItemButtonTouchMove" 
      @touchend.passive="handleItemButtonTouchEnd"
      @click="handleItemButtonClick"
    >
      <slot>
        <div class="item-container">
          <div v-if="showIcon" class="item-icon">
            <XivFARImage
              :src="itemInfo.iconUrl"
              :size="iconSize"
            />
          </div>

          <div v-if="showName" class="item-info">
            <div class="item-name">
              {{ getItemName() }}
            </div>
            <div v-if="showAmount" class="item-amount">
              x {{ itemInfo.amount }}
            </div>
          </div>
        </div>
      </slot>

      <n-dropdown
        size="small"
        placement="bottom-start"
        trigger="manual"
        :x="xRef"
        :y="yRef"
        :options="options"
        :show="showDropdownRef"
        :on-clickoutside="onClickoutside"
        @select="handleSelect"
      />
    </n-button>
  </ItemPop>
</template>

<style scoped>
:deep(.n-button__content){
  width: 100%;
  height: 100%;
}
.small-font {
  font-size: calc(var(--n-font-size) - 2px);
}
.item-button {
  padding: 1px;

  .item-container {
    width: 100%;
    height: 100%;
    padding: 5px;
    display: flex;
    align-items: center;
    gap: 5px;

    .item-icon {
      display: flex;
    }
    .item-info {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .item-name {
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      div {
        text-align: end;
      }
    }
  }
}
.item-popover {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .base-info {
    display: flex;
    align-items: flex-start;
    gap: 5px;
    margin-top: 2%;

    .item-names {
      .main span {
        line-height: 1;
        font-size: calc(var(--n-font-size) + 2px);
      }
      .sub,
      .main span.extra-name {
        line-height: 1;
        font-size: calc(var(--n-font-size) - 2px);
      }
    }
  }
  .item-divider {
    margin: 0 2px;
  }
  .item-descriptions {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .item-attributes {
      display: flex;
      align-items: center;
      gap: 3px;
      line-height: 1;
      flex-wrap: wrap;

      .item-type {
        display: flex;
        align-items: center;
        gap: 1px;
      }
      .item-type::before { content: "["; }
      .item-type::after { content: "]"; }
    }
    .main-descriptions {
      text-indent: 1em;
      line-height: 1.2;
    }
    .temp-attr-descriptions {
      line-height: 1.2;

      .title {
        margin-top: 2px;
      }
      .content {
        margin-left: 1em;
      }
      .content .block p::before {
        content: "· ";
      }
      .extra {
        font-size: calc(var(--n-font-size) - 2px);
        margin: 2px 0 5px 0;
      }
    }
    .description-block {
      line-height: 1.2;

      .title {
        font-weight: bold;

        .extra {
          margin-left: 3px;
          font-weight: normal;
          font-size: calc(var(--n-font-size) - 2px);
        }
      }
      .content .item {
        margin-left: 1em;
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .content .other-attrs,
      .content.extra {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        font-size: calc(var(--n-font-size) - 2px);
      }
    }
    .tail-descriptions {
      margin-top: 5px;
      font-size: calc(var(--n-font-size) - 2px);
      line-height: 1;
    }
  }
}
</style>