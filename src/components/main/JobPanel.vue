<script setup lang="ts">
import { ref, inject, type Ref, computed, type PropType } from 'vue'
import { type UserConfigModel, defaultUserConfig } from '@/models/user-config'
import XivRoles from '@/assets/data/xiv-roles.json'
import XivJobs from '@/assets/data/xiv-jobs.json'
import FoldableCard from '../custom-controls/FoldableCard.vue'
import JobButton from '../custom-controls/JobButton.vue'
import GroupBox from '../custom-controls/GroupBox.vue'
import XivFARImage from '../custom-controls/XivFARImage.vue'

const t = inject<(text: string, ...args: any[]) => string>('t') ?? (() => { return '' })
const userConfig = inject<Ref<UserConfigModel>>('userConfig') ?? ref(defaultUserConfig)

const jobSelected = defineModel<number>('jobSelected', { required: true })
const affixesSelected = defineModel<any>('affixesSelected', { required: true })
defineProps({
  patchSelected: {
    type: String,
    required: true
  },
  mainHandSelections: {
    type: Object as PropType<Record<number, number>>,
    required: true
  }
})
const emit = defineEmits(['onJobButtonDupliClick'])

const cardDescription = computed(() => {
  if (!jobSelected.value) return t('还未选择')
  else return t('已选择职业: {}', getJobName(jobSelected.value))
})
const handleJobSelect = (jobId: number, role: any) => {
  if (jobSelected.value === jobId) {
    emit('onJobButtonDupliClick')
  }
  jobSelected.value = jobId
  affixesSelected.value = {
    attire: role.attire,
    accessory: role.accessory
  }
}

const uiSizePreset = userConfig.value?.ui_size_preset ?? '2k'
const uiLanguage = userConfig.value?.language_ui ?? 'zh'

const getRoleName = (role: any) => {
  switch (uiLanguage) {
    case 'ja':
      return role.role_name_ja
    case 'en':
      return role.role_name_en
    default:
      return role.role_name_zh
  }
}
const getJobName = (jobId: number) => {
  const _job = (XivJobs as any)[jobId]
  switch (uiLanguage) {
    case 'ja':
      return _job.job_name_ja
    case 'en':
      return _job.job_name_en
    default:
      return _job.job_name_zh
  }
}
const jobImageSize = computed(() => {
  switch (uiSizePreset) {
    case '2k':
      return 32
    case '4k':
      return 36
  }
  return 28 // default or 1080p
})
</script>

<template>
  <FoldableCard card-key="select-job" :description="cardDescription">
    <template #header>
      <i class="xiv square-2"></i>
      <span class="card-title-text">{{ t('选择职业') }}</span>
    </template>
    <n-alert
      v-if="!patchSelected"
      type="warning"
      style="margin-bottom: 15px;"
    >
      {{ t('请先选择版本') }}
    </n-alert>

    <n-flex :size="[10,15]">
      <GroupBox
        v-for="(role, roleIndex) in XivRoles"
        :key="roleIndex"
        :border-color="role.role_color"
        title-background-color="var(--n-color-embedded)"
      >
        <template #title>
          <XivFARImage
            :src="role.role_icon_url"
            :size="14"
          />
          <span>
            {{ getRoleName(role) }}
          </span>
        </template>
        <n-flex :size="[4,4]">
          <div
            v-for="job in role.jobs"
            :key="'job-'+job"
            :title="getJobName(job)"
          >
            <JobButton
              :selected="jobSelected === job"
              :role="roleIndex"
              :job="(XivJobs as any)[job].job_name_en"
              :job-icon="(XivJobs as any)[job].job_icon_url"
              :img-size="jobImageSize"
              :btn-color="role.role_color"
              :count="mainHandSelections?.[job] || 0"
              :class="{'selected': jobSelected === job}"
              :disabled="!patchSelected"
              @click="handleJobSelect(job, role)"
            />
          </div>
        </n-flex>
      </GroupBox>
    </n-flex>
  </FoldableCard>
</template>