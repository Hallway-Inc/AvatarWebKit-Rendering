export const hallwayPublicCDNUrl = (path = ''): string => {
  return `${process.env.HALLWAY_PUBLIC_CDN}/${path}`
}
