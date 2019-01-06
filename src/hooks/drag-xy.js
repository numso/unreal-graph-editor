import { useEffect, useState } from 'react'

import useMouseButtonHeld from './mouse-button-held'

export default function useDragXY(which, initial, target, onMouseMove) {
  const [[x0, y0], setInitialPosition] = useState([0, 0])
  const [[x, y], setPosition] = useState(initial)
  const buttonHeld = useMouseButtonHeld(which, e => setInitialPosition([e.clientX, e.clientY]), target)
  useEffect(
    () => {
      if (buttonHeld) {
        const fn = e => {
          if (onMouseMove) onMouseMove(e)
          setPosition([x + (e.clientX - x0), y + (e.clientY - y0)])
          e.stopPropagation()
        }
        window.addEventListener('mousemove', fn)
        return () => window.removeEventListener('mousemove', fn)
      }
    },
    [buttonHeld]
  )
  return [x, y, setPosition, buttonHeld]
}
