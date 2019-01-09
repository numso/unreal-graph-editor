import React from 'react'

export const boolean = {
  type: 'BOOLEAN',
  color: '#950000',
  shape: 'circle',
  default: false,
  UI: () => <input type="checkbox" />
}

export const execution = {
  type: 'EXECUTION',
  color: 'white',
  shape: 'triangle thing; maybe should be an svg'
}
