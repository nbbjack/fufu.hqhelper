import type { Component } from "vue"
import type { CascaderOption } from "naive-ui"
import type { UserConfigKey } from "./config-user"
import type { FuncConfigKey } from "./config-func"

export interface AppVersionJson {
  hqhelper: string;
  electron: string;
  dlink_hqhelper: string;
  dlink_electron: string;
}

export interface SettingGroup {
  key: UserConfigKey | FuncConfigKey
  icon: Component
  text: string
  children: SettingItem[]
}
export interface SettingItem {
  key: string
  label: string
  hide?: boolean
  descriptions?: {
    value: string
    class: string
    style: string
  }[]
  warnings?: {
    value: string
    class: string
    style: string
  }[]
  type: 'radio-group' | 'switch' | 'select' | 'cascader' | 'string'
  options?: CascaderOption[]
}