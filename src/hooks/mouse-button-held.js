import { useState, useEffect } from 'react'

export default function useMouseButtonHeld(button, bindToWindow, onDown) {
  const [buttonHeld, setButtonHeld] = useState(false)
  const downHandler = e => {
    if (e.button === button) {
      if (onDown) onDown(e)
      setButtonHeld(true)
      e.stopPropagation()
    }
  }
  useEffect(() => {
    const upHandler = e => {
      if (e.button === button) setButtonHeld(false)
    }
    window.addEventListener('mouseup', upHandler)
    if (bindToWindow) window.addEventListener('mousedown', downHandler)
    return () => {
      window.removeEventListener('mouseup', upHandler)
      if (bindToWindow) window.removeEventListener('mousedown', downHandler)
    }
  }, [])
  return [buttonHeld, downHandler]
}
