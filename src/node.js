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

const Edge = ({ type, label, input }) => {
  return (
    <EdgeWrapper input={input}>
      <EdgeHook>
        <Circle color={type.color} filled={false} />
        <Triangle color={type.color} />
      </EdgeHook>
      <div>{label}</div>
      {input && type.UI && <type.UI />}
    </EdgeWrapper>
  )
}

export default function Node({ details, x, y, updateDimensions, selected }) {
  const ref = useRef(null)
  useEffect(() => updateDimensions(ref.current.offsetWidth, ref.current.offsetHeight), [])
  return (
    <InnerBox
      ref={ref}
      onMouseDown={e => {
        mouseState[e.button] = {
          startNodeId: details.id,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          startX: e.clientX,
          startY: e.clientY,
          endX: e.clientX,
          endY: e.clientY
        }
      }}
      onMouseUp={e => {
        if (!mouseState[e.button]) return
        mouseState[e.button].endNodeId = details.id
      }}
      x={details.x + x}
      y={details.y + y}
      selected={selected}
    >
      <Header color={details.type.color}>{details.type.name}</Header>
      <Flex>
        <Edges>
          {details.type.inputs.map((input, i) => (
            <Edge input {...input} key={i} />
          ))}
        </Edges>
        <Edges>
          {details.type.outputs.map((output, i) => (
            <Edge {...output} key={i} />
          ))}
        </Edges>
      </Flex>
    </InnerBox>
  )
}
