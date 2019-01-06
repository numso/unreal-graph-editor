import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  background: #262626;
`

const getLineColor = (root, separator) => {
  // if (root) return '#000000'
  // if (separator) return '#161616'
  // return '#343434'
  if (root) return '#000000'
  if (separator) return '#00000077'
  return '#ffffff11'
}

const VerticalLine = styled.div.attrs(({ root, separator, pos }) => ({
  style: { left: `${pos}px` },
  color: getLineColor(root, separator)
}))`
  background: ${props => props.color};
  position: absolute;
  top: 0;
  height: 100vh;
  width: 1px;
`

const HorizontalLine = styled.div.attrs(({ root, separator, pos }) => ({
  style: { top: `${pos}px` },
  color: getLineColor(root, separator)
}))`
  background: ${props => props.color};
  position: absolute;
  left: 0;
  width: 100vw;
  height: 1px;
`

const Label = styled.div`
  position: absolute;
  font-size: 60px;
  font-weight: bold;
  font-family: sans-serif;
  color: #ffffff33;
  text-transform: uppercase;
  right: 10px;
  bottom: 10px;
`

const SIZE = 16
const NUM_ROWS = Math.ceil(window.innerHeight / SIZE) + 2
const NUM_COLS = Math.ceil(window.innerWidth / SIZE) + 2
const rowArr = [...new Array(NUM_ROWS)]
const colArr = [...new Array(NUM_COLS)]

const fix = num => (num < 0 ? Math.ceil(num / SIZE) : Math.floor(num / SIZE))

export default function Background({ x, y }) {
  const offsetY = y % SIZE
  const offsetX = x % SIZE
  return (
    <Wrapper>
      {rowArr.map((_, i) => (
        <HorizontalLine key={`row-${i}`} pos={i * SIZE + offsetY} root={i - fix(y) === 0} separator={(i - fix(y)) % 8 === 0} />
      ))}
      {colArr.map((_, i) => (
        <VerticalLine key={`col-${i}`} pos={i * SIZE + offsetX} root={i - fix(x) === 0} separator={(i - fix(x)) % 8 === 0} />
      ))}
      <Label>Blueprint</Label>
    </Wrapper>
  )
}

/*
 * TODO::
 * - [ ] support scaling
 * - [ ] fix colors (ever so slightly off) by using z-order instead of transparency
 *  */
