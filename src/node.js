import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import mouseState from './mouse-state'

const InnerBox = styled.div.attrs(({ x, y }) => ({
  style: { left: `${x}px`, top: `${y}px` }
}))`
  font-family: sans-serif;
  font-size: 13px;
  position: absolute;
  min-width: 140px;
  min-height: 80px;
  background: #000000bb;
  border: ${props => (props.selected ? '3px solid #f1b000' : '1px solid black')};
  border-radius: 7px;
  cursor: move;
`

const Header = styled.div`
  background: ${props => props.color};
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  color: white;
  padding: 3px;
`

const Flex = styled.div`
  display: flex;
  justify-content: space-between;
`

const Edges = styled.div`
  padding: 5px 10px;
`

const EdgeWrapper = styled.div`
  display: flex;
  flex-direction: ${props => (props.input ? 'row' : 'row-reverse')}
  padding: 5px 0;
  margin: 5px 0;
  color: white;

  &:hover {
    background: #ffffff44;
  }
`

const Circle = styled.div`
  border: 1px solid ${props => props.color};
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background: ${props => (props.filled ? props.color : 'inherit')};
`

const Triangle = styled.div`
  width: 0;
  height: 0;
  border: 4px solid transparent;
  border-left: 4px solid ${props => props.color};
`

const EdgeHook = styled.div`
  cursor: crosshair;
  display: flex;
  align-items: center;
`

const Edge = ({ id, type, label, input, updateEdge, filled }) => {
  const ref = useRef(null)
  useEffect(() => {
    updateEdge(draftEdge => {
      draftEdge.__top = ref.current.offsetTop + 14
      draftEdge.__left = ref.current.offsetLeft + (input ? 7 : ref.current.offsetWidth - 13)
    })
  }, [])
  return (
    <EdgeWrapper
      ref={ref}
      input={input}
      onMouseDown={e => {
        mouseState[e.button] = mouseState[e.button] || {}
        mouseState[e.button].startedOn = mouseState[e.button].startedOn || (input ? 'inputEdge' : 'outputEdge')
        mouseState[e.button].startEdgeId = id
      }}
      onMouseUp={e => {
        mouseState[e.button] = mouseState[e.button] || {}
        mouseState[e.button].endedOn = mouseState[e.button].endedOn || (input ? 'inputEdge' : 'outputEdge')
        mouseState[e.button].endEdgeId = id
      }}
    >
      <EdgeHook>
        <Circle color={type.color} filled={filled} />
        <Triangle color={type.color} />
      </EdgeHook>
      <div>{label}</div>
      {input && type.UI && <type.UI />}
    </EdgeWrapper>
  )
}

export default function Node({ details, x, y, updateNode, selected, edges }) {
  const ref = useRef(null)
  useEffect(() => {
    updateNode(draftNode => {
      draftNode.__width = ref.current.offsetWidth
      draftNode.__height = ref.current.offsetHeight
    })
  }, [])
  return (
    <InnerBox
      ref={ref}
      onMouseDown={e => {
        mouseState[e.button] = mouseState[e.button] || {}
        mouseState[e.button].startedOn = mouseState[e.button].startedOn || 'node'
        mouseState[e.button].startNodeId = details.id
      }}
      onMouseUp={e => {
        mouseState[e.button] = mouseState[e.button] || {}
        mouseState[e.button].endedOn = mouseState[e.button].endedOn || 'node'
        mouseState[e.button].endNodeId = details.id
      }}
      x={details.x + x}
      y={details.y + y}
      selected={selected}
    >
      <Header color={details.type.color}>{details.type.name}</Header>
      <Flex>
        <Edges>
          {details.type.inputs.map(input => (
            <Edge
              input
              {...input}
              filled={edges.find(a => a.toNode === details.id && a.toEdge === input.id)}
              updateEdge={update => {
                updateNode(draftNode => {
                  const edge = draftNode.type.inputs.find(a => a.id === input.id)
                  update(edge)
                })
              }}
              key={input.id}
            />
          ))}
        </Edges>
        <Edges>
          {details.type.outputs.map(output => (
            <Edge
              {...output}
              filled={edges.find(a => a.fromNode === details.id && a.fromEdge === output.id)}
              updateEdge={update => {
                updateNode(draftNode => {
                  const edge = draftNode.type.outputs.find(a => a.id === output.id)
                  update(edge)
                })
              }}
              key={output.id}
            />
          ))}
        </Edges>
      </Flex>
    </InnerBox>
  )
}
