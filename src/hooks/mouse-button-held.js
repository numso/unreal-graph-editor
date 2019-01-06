import { useState, useEffect } from 'react'

export default function useMouseButtonHeld(which, onDown, target = window) {
  const [buttonHeld, setButtonHeld] = useState(false)
  useEffect(
    () => {
      if (!target) return
      const downHandler = e => {
        if (e.which === which) {
          if (onDown) onDown(e)
          setButtonHeld(true)
          e.stopPropagation()
        }
      }
      const upHandler = e => {
        if (e.which === which) setButtonHeld(false)
      }
      window.addEventListener('mouseup', upHandler)
      target.addEventListener('mousedown', downHandler)
      return () => {
        window.removeEventListener('mouseup', upHandler)
        target.removeEventListener('mousedown', downHandler)
      }
    },
    [target]
  )
  return buttonHeld
}
