<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue'
import {
  NButton, NCard, NDivider, NIcon, NPopover, NProgress, NTabs, NTabPane
} from 'naive-ui'
import {
  AccessAlarmsOutlined,
  StarBorderRound, StarRound,
} from '@vicons/material'
import RouterCard from '@/components/subs/RouterCard.vue'
import ItemButton from '@/components/custom-controls/ItemButton.vue'
import XivFARImage from '@/components/custom-controls/XivFARImage.vue'
import { useStore } from '@/store'
import { jobMap, type JobInfo } from '@/data'
import { useNbbCal } from '@/tools/use-nbb-cal'
import type { ItemInfo } from '@/tools/item'
import type { UserConfigModel } from '@/models/user-config'
import type EorzeaTime from '@/tools/eorzea-time'

const t = inject<(text: string, ...args: any[]) => string>('t') ?? (() => { return '' })
const isMobile = inject<Ref<boolean>>('isMobile') ?? ref(false)
const userConfig = inject<Ref<UserConfigModel>>('userConfig')!
const currentET = inject<Ref<EorzeaTime>>('currentET')!

const store = useStore()
const { getLimitedGatherings } = useNbbCal()
const gatherData = computed(() => {
  const limitedGatherings = getLimitedGatherings()
  const allItems : Record<number, ItemInfo> = {}
  for (const patch in limitedGatherings) {
    limitedGatherings[patch].forEach(itemInfo => {
      allItems[itemInfo.id] = itemInfo
    })
  }

  const data : {
    title: string,
    key: string,
    items: ItemInfo[]
  }[] = []

  // 收藏的物品
  const stars : ItemInfo[] = []
  workState.value.starItems.forEach(itemID => {
    if (allItems[itemID]) {
      stars.push(allItems[itemID])
    } else {
      console.warn(`物品 ${itemID} 在采集时钟数据集中不存在`)
    }
  })
  data.push({
    title: t('收藏'),
    key: 'stars',
    items: stars
  })

  for (const patch in limitedGatherings) {
    data.push({
      title: t('版本{}', patch),
      key: patch,
      items: limitedGatherings[patch]
    })
  }

  return data
})
const uiLanguage = computed(() => {
  return userConfig.value.language_ui
})
const itemLanguage = computed(() => {
  if (userConfig.value.language_item !== 'auto') {
    return userConfig.value.language_item
  }
  return userConfig.value.language_ui
})

const workState = ref({
  patch: '7.0',
  starItems: [] as number[],
})

const disable_workstate_cache = userConfig.value.disable_workstate_cache ?? false
if (!disable_workstate_cache) {
  const cachedWorkState = userConfig.value.gatherclock_cache_work_state
  if (cachedWorkState && JSON.stringify(cachedWorkState).length > 2) {
    workState.value = cachedWorkState
  }

  // todo - 留意性能：深度侦听需要遍历被侦听对象中的所有嵌套的属性，当用于大型数据结构时，开销很大
  watch(workState, async () => {
    if (workState.value && userConfig) {
      try {
        await Promise.resolve()
        userConfig.value.gatherclock_cache_work_state = workState.value
        store.commit('setUserConfig', userConfig.value)
      } catch (error) {
        console.error('Error handling workState change:', error)
      }
    } else {
      console.warn('workState or userConfig is not defined')
    }
  }, {deep: true})
}

const dealTimeLimit = (start: string, end: string) => {
  let progressStatus : 'info' | 'warning' | 'error' = 'info'
  let progressPercentage = 0
  let canGather = false
  try {
    const parseTime = (time: string) => time.split(':').reduce((acc, val, idx) => acc + parseInt(val) * [60, 1][idx], 0)
    const s = parseTime(start)
    const e = parseTime(end)
    const c = currentET.value.hour * 60 + currentET.value.minute
    if (c >= s && c <= e) {
      canGather = true
      progressPercentage = (c - s) / (e - s) * 100
    } else {
      progressPercentage = 0
    }
  } catch (err) {
    console.error(err)
    progressStatus = 'error'; progressPercentage = 100
  }
  return {
    canGather: canGather,
    status: progressStatus,
    percentage: progressPercentage,
    text: '正在进行中'
  }
}

const handleStarButtonClick = (itemInfo : ItemInfo) => {
  if (workState.value.starItems.includes(itemInfo.id)) {
    workState.value.starItems = workState.value.starItems.filter(id => id !== itemInfo.id)
  } else {
    workState.value.starItems.push(itemInfo.id)
  }
}

const getJobName = (jobInfo: JobInfo) => {
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
const getPlaceName = (itemInfo : ItemInfo) => {
  switch (itemLanguage.value) {
    case 'ja':
      return itemInfo.gatherInfo?.placeNameJA
    case 'en':
      return itemInfo.gatherInfo?.placeNameEN
    case 'zh':
    default:
      return itemInfo.gatherInfo?.placeNameZH
  }
}
</script>

<template>
  <div id="main-container">
    <RouterCard
      id="router-card"
      :page-name="t('采集时钟')"
      :page-icon="AccessAlarmsOutlined"
    />
    <n-card embedded>
      <n-tabs v-model:value="workState.patch" type="line" animated>
        <n-tab-pane
          v-for="patch in gatherData"
          :key="patch.key"
          :name="patch.key"
          :tab="patch.title"
        >
          <div class="items-container">
            <div
              v-for="item in patch.items"
              :key="item.id"
              class="item-card"
            >
              <div class="title">
                <ItemButton
                  :item-info="item"
                  show-icon show-name
                  btn-extra-style="flex-grow: 1;"
                />
                <n-popover placement="bottom-start" :trigger="isMobile ? 'manual' : 'hover'" :keep-alive-on-hover="false">
                  <template #trigger>
                    <n-button class="btn-star" @click="handleStarButtonClick(item)">
                      <template #icon>
                        <n-icon v-if="workState.starItems.includes(item.id)" color="#F6CA45">
                          <StarRound />
                        </n-icon>
                        <n-icon v-else color="#F6CA45">
                          <StarBorderRound />
                        </n-icon>
                      </template>
                    </n-button>
                  </template>
                  <div>{{ t('点击此按钮来收藏/取消收藏这个采集品。') }}</div>
                  <div>{{ t('被收藏的采集品将在“收藏”栏目单独展示。') }}</div>
                </n-popover>
              </div>
              <n-divider class="no-margin" />
              <div class="content">
                <div class="standard-info">
                  <div class="gather-job">
                    <XivFARImage
                      class="icon"
                      :src="jobMap[item.gatherInfo.jobId].job_icon_url"
                    />
                    <p>{{ getJobName(jobMap[item.gatherInfo.jobId]) }}</p>
                  </div>
                  <div class="gather-place-name">
                    {{ getPlaceName(item) }}
                  </div>
                  <div class="gather-pos">
                    {{ t('(X:{x}, Y:{y})', { x: item.gatherInfo.posX, y: item.gatherInfo.posY }) }}
                  </div>
                </div>
                <div class="progresses">
                  <div
                    v-for="(timelimit, tlIndex) in item.gatherInfo.timeLimitInfo"
                    :key="item.id + '-' + tlIndex"
                  >
                    <div>
                      {{ timelimit.start }} ~ {{ timelimit.end }}
                      <span v-if="dealTimeLimit(timelimit.start, timelimit.end).canGather" class="green" style="margin-left: 5px;">
                        {{ t('现可采集') }}
                      </span>
                    </div>
                    <n-progress
                      type="line"
                      processing
                      :show-indicator="false"
                      :status="dealTimeLimit(timelimit.start, timelimit.end).status"
                      :percentage="dealTimeLimit(timelimit.start, timelimit.end).percentage"
                    >
                      {{ dealTimeLimit(timelimit.start, timelimit.end).text }}
                    </n-progress>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<style scoped>
/* All */
#main-container {
  max-width: 100%;
  gap: 0.6rem;
  display: flex;
  flex-direction: column;
}
.items-container {
  gap: 0.3rem;
  padding: 0.5rem;

  .item-card:hover {
    box-shadow: 0 0 10px var(--n-bar-color);
    border-color: var(--n-bar-color);
  }
  .item-card {
    border-radius: 5px;
    border: 1px solid var(--n-bar-color);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
    padding: 0.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    
    .title {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.2rem;

      .btn-star {
        padding: 0px 8px;
      }
    }
    .content {
      .standard-info {
        text-align: right;
        line-height: 1.2;
        margin: 0 0.1rem;
        --font-size: var(--n-font-size);

        .gather-job {
          position: absolute;
          font-size: var(--font-size);
          text-align: left;
          width: 70%;
          line-height: 1;

          img {
            float: left;
            height: var(--font-size);
            display: block;
            user-select: none;
          }
          p {
            font-size: var(--font-size);
            padding-left: var(--textgap-left);
          }
        }
      }
      .progresses {
        margin: 0 0.1rem;
      }
    }
  }
}

/* Desktop */
@media screen and (min-width: 768px) {
  .items-container {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    .item-card .title .btn-star {
      height: 100%;
    }
  }
}

/* Mobile */
@media screen and (max-width: 767px) {
  .items-container {
    display: flex;
    flex-direction: column;
    
    .item-card {
      width: 100%;
    }
  }
}
</style>