import React, { useState } from 'react'
import styled from 'styled-components'
import { useImmer } from 'use-immer'

import './styles.css'
import * as nodeTypes from './node-types'
import Background from './background'
import mouseState from './mouse-state'
import Node from './node'

const Wrapper = styled.div`
  cursor: ${props => (props.rightButtonHeld ? 'grabbing' : 'inherit')};
  height: 100vh;
  width: 100vw;
  user-select: none;
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
      const nodeDimensions = [node.x + x, node.y + y, node.x + x + node.__width, node.y + y + node.__height]
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
  const [nodes, updateNodes] = useImmer([{ id: 'n1', x: 0, y: 0, type: nodeTypes.branch }, { id: 'n2', x: 272, y: 64, type: nodeTypes.branch }])
  const [edges, updateEdges] = useImmer([{ id: 'e1', fromNode: 'n1', fromEdge: 'true', toNode: 'n2', toEdge: 'execution' }])
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
    if (lmb.startedOn === 'node') {
      deltaX = Math.round((lmb.endX - lmb.startX) / SIZE) * SIZE
      deltaY = Math.round((lmb.endY - lmb.startY) / SIZE) * SIZE
    } else if (lmb.startedOn === 'window') {
      const selectionMode = lmb.ctrlKey ? 'xor' : lmb.shiftKey ? 'add' : 'normal'
      boxDimensions = [lmb.startX, lmb.startY, lmb.endX, lmb.endY]
      const [x0, y0, x1, y1] = boxDimensions
      if (x0 !== x1 || y0 !== y1) {
        const intersectingNodes = getIntersectingNodes(nodes, boxDimensions, x, y)
        selectedDisplay = getNextSelected(intersectingNodes, selected, selectionMode)
      }
    }
  }

  return (
    <Wrapper
      rightButtonHeld={mouseState[2]}
      onMouseDown={e => {
        mouseState[e.button] = mouseState[e.button] || {}
        mouseState[e.button].startedOn = mouseState[e.button].startedOn || 'window'
        mouseState[e.button].ctrlKey = e.ctrlKey
        mouseState[e.button].altKey = e.altKey
        mouseState[e.button].shiftKey = e.shiftKey
        mouseState[e.button].startX = e.clientX
        mouseState[e.button].startY = e.clientY
        mouseState[e.button].endX = e.clientX
        mouseState[e.button].endY = e.clientY
        if (mouseState[e.button].startedOn === 'window' && e.button === 0 && !e.ctrlKey && !e.shiftKey) setSelected([])
        forceUpdate(Math.random())
      }}
      onMouseMove={e => {
        const lmb = mouseState[0]
        const rmb = mouseState[2]
        if (lmb) {
          if (!lmb.dragging && lmb.startedOn === 'node') {
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
        if (e.button === 0) {
          if (state.dragging) {
            function createEdge(fromNode, fromEdge, toNode, toEdge) {
              if (fromNode === toNode) return
              if (edges.find(e => e.fromNode === fromNode && e.fromEdge === fromEdge && e.toNode === toNode && e.toEdge === toEdge)) return
              const e1 = nodes.find(a => a.id === fromNode).type.outputs.find(a => a.id === fromEdge)
              const e2 = nodes.find(a => a.id === toNode).type.inputs.find(a => a.id === toEdge)
              if (e1.type.type !== e2.type.type) return
              if (!e1.multiple && edges.find(a => a.fromNode === fromNode && a.fromEdge === fromEdge)) return
              if (!e2.multiple && edges.find(a => a.toNode === toNode && a.toEdge === toEdge)) return
              updateEdges(draftEdges => {
                draftEdges.push({ id: `e${Math.floor(Math.random() * 999)}`, fromNode, fromEdge, toNode, toEdge })
              })
            }
            if (state.startedOn === 'node') {
              updateNodes(draft => {
                selected.forEach(nodeId => {
                  const node = draft.find(a => a.id === nodeId)
                  node.x += deltaX
                  node.y += deltaY
                })
              })
            } else if (state.startedOn === 'window') {
              setSelected(selectedDisplay)
            } else if (state.startedOn === 'outputEdge') {
              if (state.endedOn === 'inputEdge') {
                createEdge(state.startNodeId, state.startEdgeId, state.endNodeId, state.endEdgeId)
              } else if (state.endedOn === 'window') {
                // TODO:: show context menu (filtered) for creating a new node
              }
            } else if (state.startedOn === 'inputEdge') {
              if (state.endedOn === 'outputEdge') {
                createEdge(state.endNodeId, state.endEdgeId, state.startNodeId, state.startEdgeId)
              } else if (state.endedOn === 'window') {
                // TODO:: show context menu (filtered) for creating a new node
              }
            }
          } else {
            if (state.startedOn === 'node') {
              const selectionMode = state.ctrlKey ? 'xor' : state.shiftKey ? 'add' : 'normal'
              const startSelected = selectionMode === 'normal' ? [] : selected
              const nextSelected = getNextSelected([state.startNodeId], startSelected, selectionMode)
              setSelected(nextSelected)
            } else if (state.altKey && state.startedOn === 'inputEdge') {
              updateEdges(draftEdges => draftEdges.filter(edge => edge.toNode !== state.startNodeId || edge.toEdge !== state.startEdgeId))
            } else if (state.altKey && state.startedOn === 'outputEdge') {
              updateEdges(draftEdges => draftEdges.filter(edge => edge.fromNode !== state.startNodeId || edge.fromEdge !== state.startEdgeId))
            }
          }
        }
        if (e.button === 2) {
          if (state.dragging) setPosition([x, y])
          else if (state.endedOn === 'window') {
            // TODO:: show context menu for creating a new node
          }
        }
        mouseState[e.button] = null
        forceUpdate(Math.random())
      }}
    >
      <Background x={x} y={y} />
      <SVG>
        {edges.map(edge => (
          <Edge
            key={edge.id}
            x={x}
            y={y}
            deltaX={deltaX}
            deltaY={deltaY}
            selected={selected}
            from={nodes.find(a => a.id === edge.fromNode)}
            to={nodes.find(a => a.id === edge.toNode)}
            details={edge}
          />
        ))}
        {lmb && lmb.dragging && (lmb.startedOn === 'inputEdge' || lmb.startedOn === 'outputEdge') && (
          <NewEdge x={x} y={y} deltaX={lmb.endX} deltaY={lmb.endY} node={nodes.find(a => a.id === lmb.startNodeId)} edgeId={lmb.startEdgeId} />
        )}
      </SVG>
      {nodes.map(node => (
        <Node
          selected={selectedDisplay.includes(node.id)}
          key={node.id}
          details={node}
          x={x + (selected.includes(node.id) ? deltaX : 0)}
          y={y + (selected.includes(node.id) ? deltaY : 0)}
          edges={edges.filter(a => a.fromNode === node.id || a.toNode === node.id)}
          updateNode={update => {
            updateNodes(draft => {
              const draftNode = draft.find(a => a.id === node.id)
              update(draftNode)
            })
          }}
        />
      ))}
      {lmb && !lmb.startNodeId && <Box dimensions={boxDimensions} />}
    </Wrapper>
  )
}

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
`

function Edge({ x, y, from, to, details, deltaX, deltaY, selected }) {
  const fromSelected = selected.includes(from.id)
  const edge1 = from.type.outputs.find(a => a.id === details.fromEdge)
  const x0 = from.x + x + edge1.__left + (fromSelected ? deltaX : 0)
  const y0 = from.y + y + edge1.__top + (fromSelected ? deltaY : 0)
  const toSelected = selected.includes(to.id)
  const edge2 = to.type.inputs.find(a => a.id === details.toEdge)
  const x1 = to.x + x + edge2.__left + (toSelected ? deltaX : 0)
  const y1 = to.y + y + edge2.__top + (toSelected ? deltaY : 0)
  return <path d={getPath(x0, y0, x1, y1, 120)} stroke={edge1.type.color} strokeWidth={2} fill="transparent" />
}

function NewEdge({ x, y, node, edgeId, deltaX, deltaY }) {
  let reverse = false
  let edge = node.type.inputs.find(a => a.id === edgeId)
  if (!edge) {
    reverse = true
    edge = node.type.outputs.find(a => a.id === edgeId)
  }
  const x0 = node.x + x + edge.__left
  const y0 = node.y + y + edge.__top
  let x1 = deltaX
  let y1 = deltaY
  const args = reverse ? [x0, y0, x1, y1] : [x1, y1, x0, y0]
  return <path d={getPath(...args, 120)} stroke={edge.type.color} strokeWidth={2} fill="transparent" />
}

const getPath = (x0, y0, x1, y1, dist) => `M${x0},${y0}C${x0 + dist},${y0} ${x1 - dist},${y1} ${x1},${y1}`
