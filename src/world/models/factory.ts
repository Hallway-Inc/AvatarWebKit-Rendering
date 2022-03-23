import { Model, ModelType } from '../../types'
import { EmojiModel } from './emoji'
import { MozillaModel } from './mozilla'
import { ReadyPlayerMeModel } from './readyPlayerMe'

export const modelFactory = (type: ModelType, url?: string): Promise<Model> => {
  switch (type) {
    case 'emoji':
      return EmojiModel.init()
    case 'readyPlayerMe':
      return ReadyPlayerMeModel.init(url)
    case 'mozilla':
      return MozillaModel.init(url)
    default:
      return Promise.reject(`Unknown model type: ${type}`)
  }
}
