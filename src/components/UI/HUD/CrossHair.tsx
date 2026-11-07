// Blanca con contorno oscuro, no `mix-blend-difference`: blanco invertido sobre
// un gris medio da otro gris medio, y la mira desaparecería en piedra.
export function CrossHair() {
  return (
    <div className='absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/4 text-4xl text-white [text-shadow:-1px_0_black,1px_0_black,0_-1px_black,0_1px_black]'>
      +
    </div>
  )
}
