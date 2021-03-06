// Expecting '#ffffff'
export type ColorValue = string

export enum ModelSettingType {
  color,
  boolean
}

type ValueType<T extends ModelSettingType> = T extends ModelSettingType.color
  ? ColorValue
  : T extends ModelSettingType.boolean
  ? boolean
  : undefined

export type ModelSetting<T extends ModelSettingType> = {
  name: string
  type: T
  value: ValueType<T>
}

export type ModelColorSetting = ModelSetting<ModelSettingType.color>
export type ModelBooleanSetting = ModelSetting<ModelSettingType.boolean>

export type ModelSettings = Record<string, ModelSetting<any>>

export interface EmojiModelSettings extends ModelSettings {
  faceColor: ModelColorSetting
  eyeColor: ModelColorSetting
}

export type MozillaModelSettings = ModelSettings

export type ReadyPlayerMeModelSettings = ModelSettings

export interface VoidModelSettings extends ModelSettings {
  hideExtraAssets: ModelBooleanSetting
}
