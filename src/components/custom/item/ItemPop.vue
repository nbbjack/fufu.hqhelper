<script lang="ts" setup>
import { computed, inject, ref, type Ref } from 'vue'
import {
  NButton, NDivider, NIcon, NPopover,
  useMessage
} from 'naive-ui'
import {
  OpenInNewFilled,
  RefreshOutlined
} from '@vicons/material'
import ItemSpan from './ItemSpan.vue'
import ItemRemark from './ItemRemark.vue'
import XivFARImage from '../general/XivFARImage.vue'
import LocationSpan from '../map/LocationSpan.vue'
import {
  XivItemRemarks,
  XivJobs, type XivJob,
  XivAttributes
} from '@/assets/data'
import { useStore } from '@/store'
import { getItemInfo, getItemPriceInfo, type ItemInfo } from '@/tools/item'
import type { UserConfigModel } from '@/models/config-user'
import { fixFuncConfig, type FuncConfigModel, type ItemPriceType } from '@/models/config-func'
import type EorzeaTime from '@/tools/eorzea-time'
import UseConfig from '@/tools/use-config'

const store = useStore()
const NAIVE_UI_MESSAGE = useMessage()
const t = inject<(text: string, ...args: any[]) => string>('t') ?? (() => { return '' })
const isMobile = inject<Ref<boolean>>('isMobile') ?? ref(false)
const userConfig = inject<Ref<UserConfigModel>>('userConfig')!
const funcConfig = inject<Ref<FuncConfigModel>>('funcConfig')!
const currentET = inject<Ref<EorzeaTime>>('currentET')!
// const appMode = inject<Ref<"overlay" | "" | undefined>>('appMode') ?? ref('')

const {
  uiLanguage, itemLanguage, itemServer,
} = UseConfig(userConfig, funcConfig)

interface ItemPopProps {
  /** 道具信息 */
  itemInfo: ItemInfo

  /** 悬浮窗使用自定义宽度 */
  popUseCustomWidth?: boolean;
  /** 悬浮窗的自定义宽度，必须同时设置`popUseCustomWidth`才能生效 */
  popCustomWidth?: number;
  /** 悬浮窗的最大宽度 */
  popMaxWidth?: string;
  /** 手动指定悬浮窗的触发方式 */
  popTrigger?: 'hover' | 'click' | 'manual'

  /** 是否禁用物品信息提示框(可选,默认false) */
  disablePop?: boolean;

  /** 物品按钮所处容器的ID，在模态框等场景时必须传递，否则无法正常复制物品名 */
  containerId?: string
}
const props = defineProps<ItemPopProps>()

const getJobName = (jobInfo: XivJob) => {
  switch (uiLanguage.value) {
    case 'ja':
      return jobInfo?.job_name_ja || t('未知')
    case 'en':
      return jobInfo?.job_name_en || t('未知')
    case 'zh':
    default:
      return jobInfo?.job_name_zh || t('未知')
  }
}

const getItemName = () => {
  switch (itemLanguage.value) {
    case 'zh':
      return props.itemInfo.name_zh || '未翻译的物品'
    default:
      return props.itemInfo[`name_${itemLanguage.value}`]
  }
}
/** 获取物品副名称(即其他语言的名称) */
const getItemSubName = () => {
  switch (itemLanguage.value) {
    case 'ja':
      return props.itemInfo.name_en
    case 'en':
      return props.itemInfo.name_ja
    case 'zh':
    default:
      return props.itemInfo.name_ja + ' / ' + props.itemInfo.name_en
  }
}
const getItemDescriptions = () => {
  let description = ''
  switch (itemLanguage.value) {
    case 'ja':
      description = props.itemInfo.descJA; break
    case 'en':
      description = props.itemInfo.descEN; break
    case 'zh':
    default:
      description = props.itemInfo.descZH
  }

  // * 处理特殊字符(好像只有E端有)
  // 处理颜色字符
  description = description.replace(/\{\{color\|id=(\d+)\|([^}]+)\}\}/g, (match, id, text) => {
    let color = ''
    if (id == 504) color = 'orange'

    if (color) {
      return `<span style="color: ${color}">${text}</span>`
    } else {
      return text
    }
  })
  // 处理斜体
  description = description.replace(/\{\{Italic\|([^}]*)\}\}/g, '<span class="italic">$1</span>')

  const descs = description.split('<br>')
  return `<p>${descs.join('</p><p>')}</p>`
}
const getItemTypeName = () => {
  switch (itemLanguage.value) {
    case 'ja':
      return props.itemInfo.uiTypeNameJA
    case 'en':
      return props.itemInfo.uiTypeNameEN
    case 'zh':
    default:
      return props.itemInfo.uiTypeNameZH
  }
}
const getAttrName = (attrId: number) => {
  const attr = XivAttributes[attrId]
  if (!attr) {
    return t('未知')
  }
  return attr[`name_${uiLanguage.value}`]
}
const getPlaceName = () => {
  switch (itemLanguage.value) {
    case 'ja':
      return props.itemInfo.gatherInfo?.placeNameJA
    case 'en':
      return props.itemInfo.gatherInfo?.placeNameEN
    case 'zh':
    default:
      return props.itemInfo.gatherInfo?.placeNameZH
  }
}
const itemHasHQ = computed(() => {
  if (props.itemInfo.tempAttrsProvided?.length) {
    return props.itemInfo.tempAttrsProvided.every(subArr => subArr.length >= 5)
  } else {
    return props.itemInfo.attrsProvided.every(subArr => subArr[2] > 0)
  }
})
const itemCraftRequires = computed(() => {
  const requires : {
    id: number;
    count: number;
  }[] = []
  if (userConfig.value.item_pop_craft_show_crystals) {
    requires.push(...props.itemInfo.craftRequireCrystals)
  }
  requires.push(...props.itemInfo.craftRequires)
  return requires
})
const itemTailDescriptions = computed(() => {
  const descriptions : string[] = []
  if (itemLanguage.value === 'zh') {
    if (props.itemInfo.usedZHTemp) {
      descriptions.push(t('该物品国服尚未实装，中文名为临时译名。'))
    } else if (props.itemInfo.chsOffline) {
      descriptions.push(t('该物品国服尚未实装。'))
    }
  }
  return descriptions
})
const itemTradeCost = computed(() => {
  return itemServer.value === 'chs' ? props.itemInfo.tradeInfo?.costCHS : props.itemInfo.tradeInfo?.costGlobal
})
const timeCanGather = (timeLimit: {start: string, end: string}) => {
  try {
    const parseTime = (time: string) => time.split(':').reduce((acc, val, idx) => acc + parseInt(val) * [60, 1][idx], 0)
    const s = parseTime(timeLimit.start)
    const e = parseTime(timeLimit.end)
    const c = currentET.value.hour * 60 + currentET.value.minute
    if (c >= s && c <= e) {
      return t('进行中')
    }
  } catch (err) {
    console.error(err)
  }
  return ''
}

const openInMomola = () => {
  window.open(`https://fish.ffmomola.com/#/wiki?fishId=${props.itemInfo.id}`)
}
const openInAngler = () => {
  let lang : string = itemLanguage.value
  switch (lang) {
    case 'zh': lang = 'cn'; break
    case 'ja': lang = 'jp'; break
  }
  let name = getItemName()
  if (props.itemInfo.chsOffline) {
    lang = 'en'
    name = props.itemInfo.name_en
  }
  const domain = `https://${lang}.ff14angler.com/`
  window.open(`${domain}?search=${name}`)
}

const openInBestCraft = () => {
  window.open(`https://tnze.yyyy.games/#/recipe?recipeId=${props.itemInfo?.craftInfo?.recipeId}`)
}

const itemPriceInfo = computed(() => {
  const priceInfo = funcConfig.value.cache_item_prices[props.itemInfo.id]
  const havePrice = !!priceInfo

  // 计算上次更新时间
  let lastUpdate = t('从未'); let priceExpired = false
  if (priceInfo) {
    const lastUpdateTS = priceInfo.updateTime
    const diff = Math.floor((Date.now() - lastUpdateTS) / 1000)
    if (diff < 60) {
      lastUpdate = t('刚刚')
    } else if (diff < 3600) {
      lastUpdate = t('{minutes}分钟前', Math.floor(diff / 60))
    } else if (diff < 86400) {
      lastUpdate = t('{hours}小时前', Math.floor(diff / 3600))
    } else {
      lastUpdate = t('{days}天前', Math.floor(diff / 86400))
    }
    priceExpired = (Date.now() - lastUpdateTS) > funcConfig.value.universalis_expireTime
  }

  // 组装各个类型的价格
  const prices = funcConfig.value.universalis_poppricetypes.map(priceType => {
    const priceNq = Math.floor(priceInfo?.[`${priceType}NQ`] ?? 0) || '???'
    const priceHq = Math.floor(priceInfo?.[`${priceType}HQ`] ?? 0) || '???'
    const tooltipForNoPrice = t('没有价格。') + '\n' + t('可能原因：未获取过价格/物品未实装或不存在此品质/交易数据不足')
    const styleForNoPrice = 'cursor: help; text-decoration: underline dashed gray;'
    let tipNq = '', tipHq = '', styleNq = '', styleHq = ''
    if (priceNq === '???') {
      tipNq = tooltipForNoPrice; styleNq = styleForNoPrice
    }
    if (priceHq === '???') {
      tipHq = tooltipForNoPrice; styleHq = styleForNoPrice
    }
    return {
      name: getPriceTypeName(priceType),
      priceNq, tipNq, styleNq,
      priceHq, tipHq, styleHq
    }
    function getPriceTypeName(ptype: ItemPriceType) {
      switch (ptype) {
        case 'averagePrice': return t('平均价格')
        case 'currentAveragePrice': return t('当前平均价格')
        case 'minPrice': return t('最低价格')
        case 'maxPrice': return t('最高价格')
        case 'purchasePrice': return t('近期成交价格')
        case 'marketLowestPrice': return t('当前寄售最低价')
        case 'marketPrice': return t('当前寄售平均价')
        default: return t('未知')
      }
    }
  })

  return {
    havePrice, lastUpdate, priceExpired, prices
  }
})
const refreshingItemPrice = ref(false)
const refreshItemPrice = async () => {
  if (refreshingItemPrice.value) {
    NAIVE_UI_MESSAGE.info(t('正在刷新价格'))
    return
  }
  refreshingItemPrice.value = true
  try {
    const itemPrices = await getItemPriceInfo(props.itemInfo.id, funcConfig.value.universalis_server)
    const newConfig = funcConfig.value
    Object.keys(itemPrices).forEach(id => {
      const itemID = Number(id)
      newConfig.cache_item_prices[itemID] = itemPrices[itemID]
    })
    await store.commit('setFuncConfig', fixFuncConfig(newConfig, store.state.userConfig))
    funcConfig.value = newConfig
    NAIVE_UI_MESSAGE.success(t('更新价格成功'))
  } catch (err: any) {
    const errMsg = t('更新价格失败') + '\n' + err.message
    console.error(errMsg, '\n', err)
    NAIVE_UI_MESSAGE.error(errMsg)
  }
  refreshingItemPrice.value = false
}

const innerPopTrigger = computed(() => {
  if (!isMobile.value && userConfig.value.click_to_show_pop_in_span) {
    return 'click'
  } else {
    return undefined
  }
})
</script>

<template>
  <n-popover
    v-if="itemInfo.id && !disablePop"
    :trigger="popTrigger || (isMobile ? 'click' : 'hover')"
    :placement="isMobile ? 'bottom' : 'right-start'"
    :width="popUseCustomWidth ? popCustomWidth : (isMobile ? 'trigger' : undefined)"
    :style="{ maxWidth: popMaxWidth ?? (isMobile ? 'unset' : '290px') }"
  >
    <template #trigger>
      <slot />
    </template>
    <div class="item-popover">
      <div class="base-info">
        <XivFARImage
          class="item-icon"
          :src="itemInfo.iconUrl"
          :size="35"
        />
        <div class="item-names">
          <div class="main">
            <span>{{ getItemName() }}</span>
            <span class="extra-name" v-if="itemLanguage === 'zh' && itemInfo.usedZHTemp">
              {{ t('(暂译)') }}
            </span>
          </div>
          <div class="sub">{{ getItemSubName() }}</div>
        </div>
      </div>
      <div class="item-level">{{ t('物品品级 {ilv}', itemInfo.itemLevel) }}</div>
      <n-divider class="item-divider" />
      <div class="item-descriptions">
        <div class="item-attributes">
          <div class="item-type">
            <XivFARImage
              class="item-icon"
              :src="itemInfo.uiTypeIconUrl"
              :size="14"
            />
            <p>{{ getItemTypeName() }}</p>
          </div>
          <p>{{ t('[{patch}版本] [{id}]', { patch: itemInfo.patch, id: itemInfo.id }) }}</p>
        </div>
        <div class="main-descriptions" v-html="getItemDescriptions()"></div>
        <div class="description-block" v-if="itemInfo.attrsProvided.length">
          <div class="title">{{ t('装备属性') }}</div>
          <n-divider class="item-divider" />
          <div class="content armor" v-if="itemHasHQ">
            <div
              class="item"
              v-for="(attr, index) in itemInfo.attrsProvided"
              :key="'attr-hq' + index"
            >
              <div>{{ `${getAttrName(attr[0])} +${attr[2]}` }}</div>
            </div>
          </div>
          <div class="content" v-else>
            <div
              class="item"
              v-for="(attr, index) in itemInfo.attrsProvided"
              :key="'attr-nq' + index"
            >
              <div>{{ `${getAttrName(attr[0])} +${attr[1]}` }}</div>
            </div>
          </div>
          <div class="content extra">
            {{ t('※ 此处仅展示物品的{NQorHQ}属性', itemHasHQ ? 'HQ' : 'NQ') }}
          </div>
        </div>
        <div class="description-block" v-if="itemInfo.tempAttrsProvided.length">
          <div class="title">{{ t('效果') }}</div>
          <n-divider class="item-divider" />
          <div class="content" v-if="itemHasHQ">
            <div
              class="item"
              v-for="(attr, index) in itemInfo.tempAttrsProvided"
              :key="'temp-attr-hq' + index"
            >
              <div>{{ `${getAttrName(attr[0])} +${attr[4]}% ${t('(上限{})', attr[5])}` }}</div>
            </div>
          </div>
          <div class="content" v-else>
            <div
              class="item"
              v-for="(attr, index) in itemInfo.tempAttrsProvided"
              :key="'temp-attr-nq' + index"
            >
              <div>{{ `${getAttrName(attr[0])} +${attr[2]}% ${t('(上限{})', attr[3])}` }}</div>
            </div>
          </div>
          <div class="content extra">
            {{ t('※ 此处仅展示物品的{NQorHQ}属性', itemHasHQ ? 'HQ' : 'NQ') }}
          </div>
        </div>
        <div class="description-block" v-if="itemInfo.canReduceFrom?.length || itemInfo.canReduceTo">
          <div class="title">{{ t('精选') }}</div>
          <n-divider class="item-divider" />
          <div class="content" v-if="itemInfo.canReduceFrom?.length">
            <div>{{ t('该物品可以通过精选以下道具获得：') }}</div>
            <div class="item" v-for="(reduce, reduceIndex) in itemInfo.canReduceFrom" :key="'reduce-' + reduceIndex">
              <ItemSpan :item-info="getItemInfo(reduce)" :container-id="containerId" />
            </div>
          </div>
          <div class="content" v-else-if="itemInfo.canReduceTo">
            <div>{{ t('精选收藏品形态的该物品可能获得：') }}</div>
            <div class="item">
              <ItemSpan :item-info="getItemInfo(itemInfo.canReduceTo)" :container-id="containerId" hide-pop-icon />
            </div>
          </div>
        </div>
        <div class="description-block" v-if="uiLanguage === 'zh' && XivItemRemarks[itemInfo.id]?.length">
          <div class="title">笔记</div>
          <n-divider class="item-divider" />
          <div class="content">
            <ItemRemark
              :remarks="XivItemRemarks[itemInfo.id]"
              style="line-height: 1.2;"
              :pop-trigger="innerPopTrigger"
            />
          </div>
        </div>
        <div class="description-block" v-if="itemInfo.gatherInfo || itemInfo.isFishingItem">
          <div class="title">
            {{ t('采集') }}
            <div v-if="itemInfo.gatherInfo" class="extra">
              <XivFARImage
                class="icon"
                :src="XivJobs[itemInfo.gatherInfo.jobId].job_icon_url"
              />
              <p>{{ getJobName(XivJobs[itemInfo.gatherInfo.jobId]) }}</p>
            </div>
            <div v-if="itemInfo.isFishingItem" class="extra">
              <XivFARImage
                class="icon"
                :src="XivJobs[18].job_icon_url"
              />
              <p>{{ getJobName(XivJobs[18]) }}</p>
            </div>
            <div v-if="itemInfo.gatherInfo?.[`gntype_${uiLanguage}`]" class="extra">
              {{ ' - ' }}
              {{ itemInfo.gatherInfo[`gntype_${uiLanguage}`] }}
            </div>
          </div>
          <n-divider class="item-divider" />
          <div class="content" v-if="itemInfo.gatherInfo">
            <div>{{ t('该物品可以在以下位置采集：') }}</div>
            <div class="item">
              <LocationSpan
                :place-id="itemInfo.gatherInfo.placeID"
                :place-name="getPlaceName()"
                :coordinate-x="itemInfo.gatherInfo.posX"
                :coordinate-y="itemInfo.gatherInfo.posY"
                :pop-trigger="innerPopTrigger"
              />
            </div>
            <div class="other-attrs" v-if="itemInfo.gatherInfo.recommAetheryte" style="margin-left: 1em;">
              ※ 
              {{ t('推荐传送点') + ' - ' }}
              {{ itemInfo.gatherInfo.recommAetheryte?.[`name_${itemLanguage}`] }}
            </div>
          </div>
          <div class="content" v-if="itemInfo.gatherInfo?.timeLimitInfo?.length">
            <div>{{ t('该物品只能在以下ET内采集：') }}</div>
            <div
              class="item"
              v-for="(timeLimit, timeLimitIndex) in itemInfo.gatherInfo?.timeLimitInfo"
              :key="'time-limit-' + timeLimitIndex"
            >
              <div>{{ timeLimit.start }} ~ {{ timeLimit.end }}</div>
              <div class="green">{{ timeCanGather(timeLimit) }}</div>
            </div>
          </div>
          <div class="content" v-if="itemInfo.gatherInfo?.folkloreId">
            <div>{{ t('采集条件：') }}</div>
            <div class="item small-font" v-if="itemInfo.gatherInfo?.folkloreId">
              {{ t('需要习得') }}
              <ItemSpan span-max-width="180px" :img-size="12" :item-info="getItemInfo(itemInfo.gatherInfo.folkloreId)" :container-id="containerId" />
            </div>
          </div>
          <div class="content" v-if="itemInfo.isFishingItem">
            <div>{{ t('可以在以下网站中查询该物品的采集方法：') }}</div>
            <div class="item actions">
              <n-button size="small" @click="openInAngler">
                <template #icon>
                  <n-icon><OpenInNewFilled /></n-icon>
                </template>
                {{ t('在饥饿的猫中搜索') }}
              </n-button>
              <n-button v-show="false" size="small" @click="openInMomola">
                <template #icon>
                  <n-icon><OpenInNewFilled /></n-icon>
                </template>
                {{ t('在鱼糕中打开') }}
              </n-button>
            </div>
          </div>
          <div v-show="false" class="content extra" v-if="itemInfo.isFishingItem">
            {{ t('※ 国服未实装的道具可能在部分网站中没有数据。') }}
          </div>
        </div>
        <div class="description-block" v-if="itemInfo.tradeInfo && itemTradeCost">
          <div class="title">{{ t('兑换') }}</div>
          <n-divider class="item-divider" />
          <div class="content">
            <div>{{ t('该物品可以通过兑换获得：') }}</div>
            <div class="item">
              <ItemSpan span-max-width="230px" :item-info="getItemInfo(itemTradeCost.costId)" :amount="itemTradeCost.costCount" show-amount :container-id="containerId" />
            </div>
            <div class="item" v-if="itemInfo.tradeInfo.receiveCount > 1">
              {{ t('每次兑换可获得{receive}个', itemInfo.tradeInfo.receiveCount) }}
            </div>
          </div>
        </div>
        <div class="description-block" v-if="itemInfo.craftRequires.length">
          <div class="title">
            {{ t('制作') }}
            <div class="extra">
              <XivFARImage
                class="icon"
                :src="XivJobs[itemInfo.craftInfo?.jobId].job_icon_url"
              />
              <p>
                {{ t('{lv}级{star}{job}配方', {
                  lv: itemInfo.craftInfo?.craftLevel,
                  star: '★'.repeat(itemInfo.craftInfo?.starCount || 0),
                  job: getJobName(XivJobs[itemInfo.craftInfo?.jobId])
                }) }}
              </p>
            </div>
          </div>
          <n-divider class="item-divider" />
          <div class="content">
            <div class="other-attrs">
              {{ t('耐久{dur} / 难度{pro} / 品质{qua}', {
                dur: itemInfo.craftInfo?.durability,
                pro: itemInfo.craftInfo?.progress,
                qua: itemInfo.craftInfo?.quality
              }) }}
              <a
                v-if="itemInfo?.craftInfo?.recipeId"
                style="padding: 0; display: flex; align-items: center; line-height: 1.2; cursor: pointer;"
                :title="t('在BestCraft中模拟制作')"
                @click="openInBestCraft"
              >
                <n-icon :size="12"><OpenInNewFilled /></n-icon>
                {{ t('模拟制作') }}
              </a>
            </div>
            <div
              class="item"
              v-for="(item, index) in itemCraftRequires"
              :key="'recipe-' + index"
            >
              <ItemSpan :item-info="getItemInfo(item.id)" :amount="item.count" show-amount :container-id="containerId" />
            </div>
            <div class="other-attrs" v-if="(itemInfo.craftInfo?.yields || 1) > 1">
              {{ t('每次制作会产出{yields}个成品', itemInfo.craftInfo?.yields) }}
            </div>
            <div v-if="itemInfo.craftInfo?.thresholds?.craftsmanship && itemInfo.craftInfo?.thresholds?.control">
              <div>{{ t('制作条件：') }}</div>
              <div class="item small-font">
                <div v-if="itemInfo.craftInfo?.thresholds?.craftsmanship">
                  {{ t('作业精度{value}', itemInfo.craftInfo?.thresholds?.craftsmanship) }}
                </div>
                <div v-if="itemInfo.craftInfo?.thresholds?.control">
                  {{ t('加工精度{value}', itemInfo.craftInfo?.thresholds?.control) }}
                </div>
              </div>
              <div class="item small-font" v-if="itemInfo.craftInfo?.masterRecipeId">
                {{ t('需要习得') }}
                <ItemSpan span-max-width="180px" :img-size="12" :item-info="getItemInfo(itemInfo.craftInfo.masterRecipeId)" :container-id="containerId" />
              </div>
            </div>
            <div class="other-attrs">
              <div v-if="!itemInfo.craftInfo?.qsable" class="red">{{ t('无法进行简易制作') }}</div>
              <div v-if="!itemInfo.craftInfo?.hqable" class="red">{{ t('无法制作优质道具') }}</div>
            </div>
          </div>
        </div>
        <div class="description-block" v-if="funcConfig.universalis_showpriceinpop && itemInfo.tradable">
          <div class="title">
            {{ t('价格') }}
            <div class="extra flex">
              <div>
                {{ t('上次更新: {}', itemPriceInfo.lastUpdate) }}
              </div>
              <div v-if="itemPriceInfo.priceExpired" class="red">
                ({{ t('已过期') }})
              </div>
              <a
                :disabled="refreshingItemPrice"
                style="padding: 0; margin-left: 3px; display: flex; line-height: 1;"
                :style="refreshingItemPrice ? 'cursor: not-allowed; color: gray;' : 'cursor: pointer;'"
                @click="refreshItemPrice"
              >
                <n-icon :size="12"><RefreshOutlined /></n-icon>
                {{ refreshingItemPrice ? t('正在刷新...') : t('刷新') }}
              </a>
            </div>
          </div>
          <n-divider class="item-divider" />
          <div class="content">
            <div v-if="itemPriceInfo.prices.length" class="content-item-prices">
              <div></div>
              <div class="font-center">[NQ]</div>
              <div v-if="itemInfo.hqable" class="font-center">[HQ]</div>
              <div v-else />
              <template
                v-for="(price, index) in itemPriceInfo.prices"
                :key="'price-' + index"
              >
                <div>{{ price.name }}</div>
                <div class="font-center" :style="price.styleNq" :title="price.tipNq">{{ price.priceNq }}</div>
                <div v-if="itemInfo.hqable" class="font-center" :style="price.styleHq" :title="price.tipHq">{{ price.priceHq }}</div>
                <div v-else />
              </template>
            </div>
            <div v-else style="text-indent: 1em;">
              {{ t('还没有设置要显示哪些价格类型。请在偏好设置的“{option}”设置项中进行配置。', t('在物品悬浮窗中显示的类型')) }}
            </div>
          </div>
        </div>
        <slot name="extra-descriptions" />
        <div class="tail-descriptions">
          <p v-for="(desc, index) in itemTailDescriptions" :key="'tail-descriptions' + index">
            {{ t('注{}：', itemTailDescriptions.length === 1 ? '' : index + 1) }}{{ desc }}
          </p>
        </div>
      </div>
      <!-- <n-flex v-show="false" class="item-actions">
        <n-button size="small" @click="openInHuijiWiki()">
          {{ t('在灰机wiki中打开') }}
        </n-button>
        <n-button size="small" @click="openInGarland()">
          {{ t('在Garland中打开') }}
        </n-button>
        <slot name="extra-actions" />
      </n-flex> -->
    </div>
  </n-popover>
  <slot v-else />
</template>

<style scoped>
.small-font {
  font-size: calc(var(--n-font-size) - 2px);
}
.item-popover {
  user-select: text;
  
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
  .item-level {
    line-height: 1.2;
    margin-top: 3px;
  }
  .item-divider {
    margin: 0 2px;
  }
  .item-descriptions {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .item-attributes {
      display: flex;
      align-items: center;
      gap: 3px;
      line-height: 1.2;
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
        display: flex;
        align-items: baseline;
        --size-small: calc(var(--n-font-size) - 2px);
        --textgap-left: calc(var(--n-font-size) - 1px);

        .extra {
          margin-left: 3px;
          font-weight: normal;
          font-size: var(--size-small);
          line-height: 1;

          img {
            float: left;
            height: var(--size-small);
            display: block;
          }
          p {
            font-size: var(--size-small);
            padding-left: var(--textgap-left);
          }
        }
        .extra::after {
          content: '';
          clear: both;
          display: block;
        }
      }
      .content .item {
        margin-left: 1em;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 3px;
      }
      .content .item.actions {
        margin: 3px 1em;
        flex-direction: column;

        button {
          width: 100%;
        }
      }
      .content.armor {
        width: fit-content;
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        column-gap: 5px;
      }
      .content .content-item-prices {
        display: grid;
        grid-template-columns: repeat(3, auto);
        column-gap: 8px;
        width: fit-content;
        margin-left: 1em;
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