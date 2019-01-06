import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import './styles.css'
import * as nodeTypes from './node-types'
import Background from './background'
import Node from './node'
import ErrorBoundary from './error-boundary'
import useDragXY from './hooks/drag-xy'
import useBoxDrag from './hooks/box-drag'

const Wrapper = styled.div`
  cursor: ${props => (props.rightButtonHeld ? 'grabbing' : 'inherit')};
  height: 100vh;
  width: 100vw;
`

window.addEventListener('contextmenu', e => {
  e.preventDefault()
  return false
})

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
      const nodeDimensions = [node.x + x, node.y + y, node.x + x + 170, node.y + y + 100]
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

function App() {
  const [nodes, setNodes] = useState([{ id: 1, x: 0, y: 0, type: nodeTypes.branch }, { id: 2, x: 272, y: 64, type: nodeTypes.branch }])
  const [x, y, , rightButtonHeld] = useDragXY(3, [270, 270])
  const [boxDimensions, leftButtonHeld, selectionMode] = useBoxDrag()
  const [selected, setSelected] = useState([])
  useEffect(
    () => {
      if (leftButtonHeld && selectionMode === 'normal') setSelected([])
    },
    [leftButtonHeld]
  )
  useEffect(
    () => {
      if (!leftButtonHeld) {
        const [x0, y0, x1, y1] = boxDimensions
        if (x0 !== x1 || y0 !== y1) {
          const intersectingNodes = getIntersectingNodes(nodes, boxDimensions, x, y)
          const nextSelected = getNextSelected(intersectingNodes, selected, selectionMode)
          setSelected(nextSelected)
        }
      }
    },
    [leftButtonHeld]
  )

  let selectedDisplay = selected
  if (leftButtonHeld) {
    const [x0, y0, x1, y1] = boxDimensions
    if (x0 !== x1 || y0 !== y1) {
      const intersectingNodes = getIntersectingNodes(nodes, boxDimensions, x, y)
      selectedDisplay = getNextSelected(intersectingNodes, selected, selectionMode)
    }
  }
  return (
    <Wrapper
      rightButtonHeld={rightButtonHeld}
      onDoubleClick={e => {
        nodes.push({
          id: Math.floor(Math.random() * 99999),
          x: e.clientX,
          y: e.clientY,
          type: nodeTypes.branch
        })
        setNodes(nodes)
      }}
    >
      <Background x={x} y={y} />
      {nodes.map((node, i) => (
        <Node
          selected={selectedDisplay.includes(node.id)}
          select={e => {
            const selectionMode = e.ctrlKey ? 'xor' : e.shiftKey ? 'add' : 'normal'
            let nextSelected
            if (selectionMode === 'normal') nextSelected = [node.id]
            else nextSelected = getNextSelected([node.id], selected, selectionMode)
            setSelected(nextSelected)
          }}
          key={node.id}
          details={node}
          x={x}
          y={y}
          updateXY={(x, y) => {
            node.x = x
            node.y = y
            setNodes(nodes)
          }}
        />
      ))}
      {leftButtonHeld && <Box dimensions={boxDimensions} />}
    </Wrapper>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  rootElement
)
