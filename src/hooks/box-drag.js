import { useEffect, useState } from 'react'

import useMouseButtonHeld from './mouse-button-held'

export default function useBoxDrag() {
  const [positions, setPositions] = useState([0, 0, 0, 0])
  const [selectionMode, setSelectionMode] = useState('normal')
  const [buttonHeld] = useMouseButtonHeld(0, true, e => {
    if (e.ctrlKey) setSelectionMode('xor')
    else if (e.shiftKey) setSelectionMode('add')
    else setSelectionMode('normal')
    setPositions([e.clientX, e.clientY, e.clientX, e.clientY])
  })
  useEffect(
    () => {
      if (buttonHeld) {
        const fn = e => {
          setPositions(state => [state[0], state[1], e.clientX, e.clientY])
        }
        window.addEventListener('mousemove', fn)
        return () => window.removeEventListener('mousemove', fn)
      }
    },
    [buttonHeld]
  )
  return [positions, buttonHeld, selectionMode]
}
