import * as edgeTypes from './edge-types'

export const branch = {
  name: 'Branch',
  icon: '',
  color: '#616261', // more of a gradient
  inputs: [{ type: edgeTypes.execution }, { type: edgeTypes.boolean, label: 'Condition' }],
  outputs: [{ type: edgeTypes.execution, label: 'True' }, { type: edgeTypes.execution, label: 'False' }]
}
