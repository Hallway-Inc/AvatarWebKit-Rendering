export function nameForModelType(modelType: string) {
  if (modelType === 'rpm') {
    return 'rpmModel'
  } else if (modelType === 'chib') {
    return 'chibModel'
  }
}
