import _ from 'lodash'

import { utils } from '../utils'
import { toGraphqlType } from '../transformer'

export default ({ model, modelTypes }) => {
  const modelConfig = utils.getModelGrapqhQLConfig(model)
  const result = {}

  const subscriptions = _.get(modelConfig, 'subscriptions', null)
  if (subscriptions) {
    _.assign(result, toGraphqlType({obj: subscriptions, modelTypes, useRoot: true}))
  }
  return result
}
