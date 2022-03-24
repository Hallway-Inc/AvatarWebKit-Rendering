export const hallwayPublicCDNUrl = (path: string = ''): string => {
  return `${process.env.HALLWAY_PUBLIC_CDN}/${path}`
}
