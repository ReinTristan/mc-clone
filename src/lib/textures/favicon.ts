/**
 * Apunta el `<link rel="icon">` del documento a `url`. Reusa el que ya trae
 * `index.html` (un `data:,` vacío mientras cargan las texturas) y solo lo crea
 * si no existe, así que llamarla dos veces nunca duplica el link.
 */
export function setFavicon(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.append(link)
  }
  link.type = 'image/png'
  link.href = url
}
