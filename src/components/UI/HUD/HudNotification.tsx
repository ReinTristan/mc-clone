import { useMenuStore } from '@/store/useMenuStore'

export function HudNotification() {
  const notification = useMenuStore((state) => state.notification)
  if (!notification) return null

  // La `key` monta un elemento nuevo en cada aviso, y eso reinicia el fade.
  return (
    <span
      key={notification.id}
      className='pointer-events-none absolute top-24 left-1/2 z-10 -translate-x-1/2 animate-delay-1500 animate-fade-out font-bold text-3xl text-white [text-shadow:2px_2px_black]'
    >
      {notification.message}
    </span>
  )
}
