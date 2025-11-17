export function getYoutubeEmbedLink(youtubeId: string, startSeconds: number, endSeconds: number) {
  return `https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(startSeconds)}&end=${Math.floor(endSeconds)}&autoplay=1&mute=1&rel=0&enablejsapi=1`;
}
