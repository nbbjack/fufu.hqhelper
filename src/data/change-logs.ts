export interface PatchNote {
  /**
   * 版本号
   */
  version: string;
  /**
   * 发布日期
   */
  date: string;
  /**
   * 改动内容
   * * `key`: 改动类型
   * * `value`: 改动内容
   */
  changes: PatchChangeGroup[];
  /**
   * 是否为重要更新
   */
  important?: boolean;
}
export interface PatchChangeGroup {
  name: string;
  changes: string[];
}

import { t } from '@/languages'
const emBlock = '<span style="display:inline-block;width:1em;"></span>'
export const getChangelogs = (
  ui_lang: 'zh' | 'ja' | 'en'
) => {
  const groupName = {
    bugfix: t('问题修复'),
    feature: t('功能更新'),
    breaking: t('重要变更')
  }
  const isZh = ui_lang === 'zh'
  return [
    {
      version: '2.0.11',
      date: '2024-10-27',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('专业版制作报表追加了功能“{f}”。', {
              f: t('推荐流程')
            })
              + '<br>'
              + t('推荐流程会自动根据报表中填写的已有素材计算仍需准备的素材，并按采集/制作职业、类型等归类，最终总结出有序步骤。')
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了部分实际上无法通过捕鱼人采集获取的道具会在物品按钮悬浮窗中显示采集提示的问题。'),
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('优化了专业版制作报表中物品信息的显示逻辑。'),
            t('新增了设置项“{f}”。', t('点击物品信息图标时的行为')),
            t('优化了应用标题栏和各个素材统计区域标题/提示图标的显示效果。')
          ]
        }
      ]
    },
    {
      version: '2.0.10',
      date: '2024-10-24',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('实装了专业版的“{f}”。', {
              f: t('制作报表')
            })
              + '<br>'
              + t('专业版制作报表为每个物品提供更详细的信息，包括制作职业、配方等级、采集职业、来源、兑换总价等。')
              + '<br>'
              + t('不仅如此，专业版制作报表还允许你填写已经准备的素材数量，并根据输入值动态计算还需要筹备的素材。')
              + '<br>'
              + t('点击主界面或食药计算器的“{f}”按钮，即可查看专业版制作报表。', t('查看报表'))
              + '<br> ※ '
              + t('如果还是更喜欢旧版本的制作报表，可以在“{f1}”的“{f2}”选项卡中勾选“{f3}”。', {
                f1: t('偏好设置'),
                f2: t('增强'),
                f3: t('使用旧版本制作报表')
              })
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了采集时钟会将采集时间刚好结束的采集品判断为现可采集的问题。'),
            t('修正了部分国际化翻译。')
          ]
        },
        {
          name: groupName.feature,
          changes: [
            isZh
              ? '追加了灵砂鱼的采集信息。<br>相关资料来自<a target="_blank" href="https://bbs.nga.cn/read.php?tid=41277468">7.0灵砂鱼和工票鱼信息整理和钓法 by plas_g</a><br> ※ 仅限在“界面语言”设置为简体中文时可以查看。'
              : '',
            t('新增了设置项“{f}”。', t('手动控制二级悬浮窗')),
            t('根据特设站公布的信息，更新了{v}版本的logo与背景图。', '7.1')
              + '<br> ※ '
              + t('相关数据仍须等待版本正式上线后才能更新。'),
            t('优化了选择版本区域按钮文字的显示效果。')
          ]
        }
      ]
    },
    {
      version: '2.0.9',
      date: '2024-10-22',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('国服数据库更新至{ver}。', {
              ver: '7.01'
            })
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('现在可以在“{f1}”的“{f2}”选项卡中调整程序/网站使用的字体及字体大小。', {
              f1: t('偏好设置'),
              f2: t('外观')
            }),
            t('现在“{f}”还会在当前可采集道具的采集卡片中显示现实世界的剩余时间。', {
              f: t('采集时钟')
            })
          ]
        }
      ]
    },
    {
      version: '2.0.8',
      date: '2024-10-18',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('实装了7.0的采集地图。')
              + '<br>'
              + t('现在物品按钮悬浮窗和采集时钟等区域的采集位置右侧将显示地图按钮。将光标悬停在地图按钮上，即可查看采集位置的示意图和距离采集位置最近的以太之光传送点名称。')
              + '<br>'
              + t('出于页面和更新包大小的考虑，地图文件经过较为严重的压缩。如果希望查看更高清的地图，可以在地图按钮悬浮窗中点击“{f}”来跳转到FFCAFE提供的互动地图页面。', {
                f: t('在FFCAFE互动地图中打开')
              })
              + '<br> ※ '
              + t('仅实装了7.0的六张野外地图，因此旧版本的可采集道具不会适用上述更改。')
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了网页端“{f}”中物品信息图标右键菜单的复制功能没有正确工作的问题。', {
              f: t('成本/收益预估')
            }),
            t('修正了部分国际化翻译。')
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('“{f}”实装了下述更改：', {
              f: t('采集时钟')
            })
              + '<br>' + emBlock
              + t('① 道具分组逻辑有所变更。现在7.0灵砂精选道具会和7.0传承录星级采集品区分开；')
              + '<br>' + emBlock
              + t('② 采集品卡片中增加了地图按钮和推荐传送点(距离采集位置最近的以太之光名称)；')
              + '<br>' + emBlock
              + t('③ 现在时钟的配置区域可以折叠；')
              + '<br>' + emBlock
              + t('④ 增加了“{f}”配置项，开启后可以在采集品卡片中直接展示地图；', t('展示采集地图'))
              + '<br>' + emBlock
              + t('⑤ 增加了“{f}”配置项，可以快速批量收藏或取消收藏整个分组的采集品；', t('快速操作'))
              + '<br>' + emBlock
              + t('⑥ “收藏”选项卡更名为“已收藏”；')
              + '<br>' + emBlock
              + t('⑦ 调整了部分界面元素，提升了选项卡区域的辨识度。')
            ,
            t('“{f1}”的“{f2}”现在还可以设置为“{o1}”、“{o2}”或“{o3}”。', {
              f1: t('成本/收益预估'),
              f2: t('物品价格类型'),
              o1: t('近期成交价格'),
              o2: t('当前寄售最低价'),
              o3: t('当前寄售平均价')
            })
              + '<br>'
              + t('可以在 “{f1}”→“{f2}”→“{f3}” 设置和查看详细说明。', {
                f1: t('偏好设置'),
                f2: t('特殊'),
                f3: t('物品价格类型')
              })
              + '<br> ※ '
              + t('由于进行了数据类型调整，旧版本获取到的物品价格缓存在更新后需要重新获取。')
            ,
            t('现在物品按钮悬浮窗的精选栏目除了会展示“可以通过什么道具精选出此物品”还会显示“精选此物品有可能获得什么道具(限灵砂)”。')
              + '<br> ※ '
              + t('为了避免物品按钮悬浮窗的无限跳转，后者不会展示可以打开悬浮窗的信息图标。')
          ]
        }
      ]
    },
    {
      version: '2.0.7',
      date: '2024-10-14',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('实装了“{f}”功能。', {
              f: t('成本/收益预估')
            })
              + '<br>※ '
              + t('需要在“{f1}”的“{f2}”选项卡中进行设置。', {
                f1: t('偏好设置'),
                f2: t('特殊')
              })
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了右键物品按钮时，弹出菜单对应的物品不正确的问题。'),
            t('修复了“{f}”的输入框在特定尺寸显示器上可能溢出容器的问题', {
              f: t('食药计算器')
            }),
            t('修正了部分物品按钮悬浮窗在移动端的显示效果。')
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('为“{f}”添加了排序、{f1}和{f2}的功能。', {
              f: t('采集时钟'),
              f1: t('将现可采集的物品置顶'),
              f2: t('禁用物品按钮悬浮窗')
            }),
            t('现在点数统计的兑换道具顺序与兑换商店的顺序保持一致。'),
            isZh ? '根据国服目前的文本更新了部分7.05版本道具的中文暂译。' : '',
            t('现在“{f}”还会同时导出灵砂统计。', {
              f: t('导出Excel')
            }),
            t('优化了“{f1}”中“{f2}”的显示效果。', {
              f1: t('食药计算器'),
              f2: t('挑选食药')
            }),
            t('优化了部分国际化翻译。')
          ]
        }
      ]
    },
    {
      version: '2.0.6',
      date: '2024-10-09',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('实装了“{f}”功能。', {
              f: t('导出Excel')
            })
              + '<br>'
              + t('在主界面选定装备之后，点击“{f1}”右侧的“{f2}”按钮，即可将统计导出成Excel文件。', {
                f1: t('查看统计'),
                f2: t('导出Excel')
              })
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了网页端“{f}”中物品按钮的复制功能没有正确工作的问题。', {
              f: t('查看报表')
            }),
            t('修复了初次打开页面时“{f}”会意外消失的问题。', {
              f: t('选择部件')
            }),
            t('修复了{lang}设置为日语/英语时，更新日志的部分更新项会对只有一条的更新组显示序号的问题。', {
              lang: t('界面语言')
            })
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('符合条件的物品按钮现在会在物品名前显示对应的生产/采集职业图标。')
              + '<br>※ '
              + t('伴随这一改动，“{f}”的“{f1}”选项卡增加了“{f2}”设置项。', {
                f: t('偏好设置'),
                f1: t('外观'),
                f2: t('隐藏物品按钮的职业图标')
              }),
            t('现在主界面的点数统计还能统计双色宝石兑换物。可以在点数按钮的悬浮窗内控制开关。'),
            t('现在食药计算器也可以使用“{f}”功能。', {
              f: t('查看报表')
            }),
            t('现在物品按钮悬浮窗中的子物品也可以通过右键蓝色信息图标的方式展开操作菜单。')
              + '<br>※ '
              + t('此功能暂不支持移动端。'),
            t('调整了各个素材统计区域的标题文本，并添加了提示图标和提示语。'),
            t('优化了“{f1}”中“{f2}”的显示效果。', {
              f1: t('查看统计'),
              f2: t('灵砂统计')
            }),
            t('物品按钮的右键菜单现在还可以选择“{f}”。', {
              f: t('在GamerEscape中打开')
            }),
            t('现在移动端顶部菜单会在特定场合显示“{f}”按钮。', {
              f: t('返回首页')
            }),
            t('优化了部分国际化翻译。')
          ]
        }
      ]
    },
    {
      version: '2.0.5',
      date: '2024-09-29',
      changes: [
        {
          name: groupName.bugfix,
          changes: [
            isZh ? '修正地名与物品类型的中文文本未更新7.0国服译名的问题。' : '',
            t('修复客户端在更新HqHelper版本后可能无法通过拖拽顶部区域移动窗口位置的问题。')
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('现在“{f}”区域的部件图标悬浮窗还会显示已选职业在此部件上对应的装备道具信息。', {
              f: t('选择部件')
            })
          ]
        }
      ]
    },
    {
      version: '2.0.4',
      date: '2024-09-26',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('国服数据库更新至{ver}。', {
              ver: '7.0'
            }),
            t('压缩了部分内置图片的尺寸，清理了一部分无用代码，从而大幅度地降低更新时需要下载的更新包体积、初次访问页面的加载时长和托管服务器的带宽压力。'),
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了{lang}设置为日语/英语时，部分应当没有内容的区域可能出现无意义数字的问题。', {
              lang: t('界面语言')
            })
          ]
        },
        {
          name: groupName.feature,
          changes: [
            isZh ? '增加了“参考资料”菜单项 (仅在界面语言设置为简体中文的电脑上会显示)。' : '',
            t('物品按钮悬浮窗现在还会显示装备类道具的属性。'),
            t('优化了“{f}”界面物品按钮悬浮窗的显示效果。', {
              f1: t('制作报表')
            }),
            t('客户端现在在下载HqHelper更新时会显示下载进度和速度 (仅限v3及更高版本的客户端)。'),
            t('调整了客户端在检查更新时可以选择的加速服务列表。'),
            t('优化了部分国际化翻译。')
          ]
        }
      ]
    },
    {
      version: '2.0.3',
      date: '2024-09-17',
      changes: [
        {
          name: groupName.bugfix,
          changes: [
            t('修复了“{f1}”中，“{f2}”按钮在移动端的高度不正常的问题。', {
              f1: t('采集时钟'), f2: t('收藏')
            }),
            t('修复了“{f}”中部分文本未正确适配国际化翻译的问题。', {
              f: t('更新日志')
            }),
            t('修复了{lang}设置为日语/英语时，“{f}”中的更新项序号可能不连贯的问题。', {
              lang: t('界面语言'),
              f: t('更新日志')
            })
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('调整了移动端顶部菜单按钮的顺序。'),
            t('现在“{f1}”中的“{f2}”按钮在移动端不再会弹出提示悬浮窗。', {
              f1: t('采集时钟'), f2: t('收藏')
            }),
            t('优化了部分国际化翻译。')
          ]
        }
      ]
    },
    {
      version: '2.0.2',
      date: '2024-09-11',
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('实装了“{f}”功能。', {
              f: t('采集时钟')
            }),
            t('实装了“{f}”功能。', {
              f: t('更新日志')
            }),
          ]
        },
        {
          name: groupName.bugfix,
          changes: [
            t('修复了自动更新提示不会展示最新版本版本号的问题。'),
            t('修复了客户端的安装更新按钮在已是最新版本时仍旧可以点击的问题。'),
            t('修复了启用“禁用工作状态记忆”后，食药计算器的工作状态缓存不会被清除的问题。'),
            t('修复了移动端点击空白区域关闭{}的悬浮窗后，无法正常再次打开该悬浮窗的问题。', t('“选择部件”栏目中当前[主副手/防具/首饰]')),
            isZh ? '修正了部分道具的中文译名。' : ''
          ]
        },
        {
          name: groupName.feature,
          changes: [
            t('现在可以在“偏好设置”中自定义点击物品按钮时的行为。'),
            t('重制了移动端“已选部件”弹窗的显示效果。'),
            isZh ? '根据国服7.0特设站公布的新消息更新了职业名。' : '',
            t('优化了部分场景下物品按钮悬浮窗的显示效果。'),
            t('更新了“关于本作”中创作者的信息。')
          ]
        }
      ]
    },
    {
      version: '2.0.0',
      date: '2024-09-01',
      important: true,
      changes: [
        {
          name: groupName.breaking,
          changes: [
            t('HqHelper正式发布。')
          ]
        }
      ]
    }
  ] as PatchNote[]
}