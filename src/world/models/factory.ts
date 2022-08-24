import { Model, ModelType } from '../../types'

import { EmojiModel } from './emoji'
import { ModelSettings } from './modelSettings'
import { MozillaModel } from './mozilla'
import { ReadyPlayerMeModel } from './readyPlayerMe'
import { VoidModel } from './void'
import { ChibModel } from './chib'
import { AlienBoyModel } from './alienBoy'
import { ZuckModel } from './zuck'
import { GLBModel } from './glb'

export const modelFactory = (type: ModelType, url?: string): Promise<Model> => {
  switch (type) {
    case 'emoji':
      return EmojiModel.init()
    case 'readyPlayerMe':
      return ReadyPlayerMeModel.init(url)
    case 'mozilla':
      return MozillaModel.init(url)
    case 'void':
      return VoidModel.init(url)
    case 'chib':
      return ChibModel.init(url)
    case 'alienBoy':
      return AlienBoyModel.init(url)
    case 'zuck':
      return ZuckModel.init(url)
    case 'glb':
      return GLBModel.init(url)
    default:
      return Promise.reject(`Unknown model type: ${type}`)
  }
}

export const modelSettingsFactory = (type: ModelType): ModelSettings => {
  switch (type) {
    case 'emoji':
      return EmojiModel.defaultSettings
    case 'readyPlayerMe':
      return ReadyPlayerMeModel.defaultSettings
    case 'mozilla':
      return MozillaModel.defaultSettings
    case 'void':
      return VoidModel.defaultSettings
    case 'chib':
      return ChibModel.defaultSettings
    case 'alienBoy':
      return AlienBoyModel.defaultSettings
    case 'zuck':
      return ZuckModel.defaultSettings
    case 'glb':
      return GLBModel.defaultSettings
    default:
      return {}
  }
}
