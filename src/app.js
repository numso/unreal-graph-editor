import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import './styles.css'
import * as nodeTypes from './node-types'
import Background from './background'
import mouseState from './mouse-state'
import Node from './node'

const Wrapper = styled.div`
  cursor: ${props => (props.rightButtonHeld ? 'grabbing' : 'inherit')};
  height: 100vh;
  width: 100vw;
`

const Box = styled.div.attrs(({ dimensions: [x0, y0, x1, y1] }) => ({
  style: {
    top: `${Math.min(y0, y1)}px`,
    left: `${Math.min(x0, x1)}px`,
    width: `${Math.abs(x0 - x1)}px`,
    height: `${Math.abs(y0 - y1)}px`
  }
}))`
  position: absolute;
  border: 2px dashed white;
`

function intersects([x1, y1, w1, h1], [x2, y2, w2, h2]) {
  return x1 < w2 && x2 < w1 && y1 < h2 && y2 < h1
}

function getIntersectingNodes(nodes, [x0, y0, x1, y1], x, y) {
  const boxDimensions = [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)]
  return nodes
    .filter(node => {
      const nodeDimensions = [node.x + x, node.y + y, node.x + x + node.w, node.y + y + node.h]
      return intersects(boxDimensions, nodeDimensions)
    })
    .map(node => node.id)
}

function getNextSelected(nodesToAdd, selected, selectionMode) {
  const nextSelected = [...selected]
  nodesToAdd.forEach(node => {
    if (!nextSelected.includes(node)) return nextSelected.push(node)
    if (selectionMode === 'xor') nextSelected.splice(nextSelected.findIndex(a => a === node), 1)
  })
  return nextSelected
}

const SIZE = 16

export default function App() {
  const [, forceUpdate] = useState(0)
  const [[_x, _y], setPosition] = useState([270, 270])
  const [nodes, setNodes] = useState([{ id: 1, x: 0, y: 0, type: nodeTypes.branch }, { id: 2, x: 272, y: 64, type: nodeTypes.branch }])
  let x = _x
  let y = _y
  if (mouseState[2]) {
    x += mouseState[2].endX - mouseState[2].startX
    y += mouseState[2].endY - mouseState[2].startY
  }
  const [selected, setSelected] = useState([])
  const lmb = mouseState[0]
  let boxDimensions = null
  let selectedDisplay = selected
  let deltaX = 0
  let deltaY = 0
  if (lmb) {
    if (!lmb.startNodeId) {
      const selectionMode = lmb.ctrlKey ? 'xor' : lmb.shiftKey ? 'add' : 'normal'
      boxDimensions = [lmb.startX, lmb.startY, lmb.endX, lmb.endY]
      const [x0, y0, x1, y1] = boxDimensions
      if (x0 !== x1 || y0 !== y1) {
        const intersectingNodes = getIntersectingNodes(nodes, boxDimensions, x, y)
        selectedDisplay = getNextSelected(intersectingNodes, selected, selectionMode)
      }
    } else {
      deltaX = Math.round((lmb.endX - lmb.startX) / SIZE) * SIZE
      deltaY = Math.round((lmb.endY - lmb.startY) / SIZE) * SIZE
    }
  }
  return (
    <Wrapper
      rightButtonHeld={mouseState[2]}
      onMouseDown={e => {
        if (!mouseState[e.button]) {
          mouseState[e.button] = {
            startNodeId: null,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            startX: e.clientX,
            startY: e.clientY,
            endX: e.clientX,
            endY: e.clientY
          }
          if (e.button === 0 && !e.ctrlKey && !e.shiftKey) setSelected([])
        }
        forceUpdate(Math.random())
      }}
      onMouseMove={e => {
        const lmb = mouseState[0]
        const rmb = mouseState[2]
        if (lmb) {
          if (!lmb.dragging && lmb.startNodeId) {
            if (!selected.includes(lmb.startNodeId)) {
              const selectionMode = lmb.ctrlKey || lmb.shiftKey ? 'add' : 'normal'
              const startSelected = selectionMode === 'normal' ? [] : selected
              const nextSelected = getNextSelected([lmb.startNodeId], startSelected, selectionMode)
              setSelected(nextSelected)
            }
          }
          lmb.dragging = true
          lmb.endX = e.clientX
          lmb.endY = e.clientY
        }

        if (rmb) {
          rmb.dragging = true
          rmb.endX = e.clientX
          rmb.endY = e.clientY
        }
        forceUpdate(Math.random())
      }}
      onMouseUp={e => {
        if (!mouseState[e.button]) return
        const state = mouseState[e.button]
        if (!state.dragging) {
          if (state.startNodeId) {
            const selectionMode = lmb.ctrlKey ? 'xor' : lmb.shiftKey ? 'add' : 'normal'
            const startSelected = selectionMode === 'normal' ? [] : selected
            const nextSelected = getNextSelected([state.startNodeId], startSelected, selectionMode)
            setSelected(nextSelected)
          }
        }
        if (e.button === 0 && mouseState[0].dragging) {
          if (!mouseState[0].startNodeId) setSelected(selectedDisplay)
          else {
            selected.forEach(nodeId => {
              const node = nodes.find(a => a.id === nodeId)
              node.x += deltaX
              node.y += deltaY
            })
            setNodes(nodes)
          }
        }
        if (e.button === 2) {
          setPosition([x, y])
        }
        mouseState[e.button] = null
        forceUpdate(Math.random())
      }}
    >
      <Background x={x} y={y} />
      {nodes.map((node, i) => (
        <Node
          selected={selectedDisplay.includes(node.id)}
          key={node.id}
          details={node}
          x={x + (selected.includes(node.id) ? deltaX : 0)}
          y={y + (selected.includes(node.id) ? deltaY : 0)}
          updateDimensions={(w, h) => {
            node.w = w
            node.h = h
            setNodes(nodes)
          }}
        />
      ))}
      {lmb && !lmb.startNodeId && <Box dimensions={boxDimensions} />}
    </Wrapper>
  )
}
