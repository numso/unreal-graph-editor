import * as edgeTypes from './edge-types'

export const branch = {
  name: 'Branch',
  icon: '',
  color: '#616261', // more of a gradient
  inputs: [{ id: 'execution', type: edgeTypes.execution, multiple: true }, { id: 'condition', type: edgeTypes.boolean, label: 'Condition' }],
  outputs: [{ id: 'true', type: edgeTypes.execution, label: 'True' }, { id: 'false', type: edgeTypes.execution, label: 'False' }]
}
