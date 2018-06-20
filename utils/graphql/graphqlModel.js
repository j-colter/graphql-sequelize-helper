import _ from 'lodash'

import { utils } from '../utils'
import { getQueries } from "../query"
import { getMutations } from '../mutation'
import { getSubscriptions } from '../subscription'

export default ({ model, modelTypes, schemaConfig }) => {
  const modelConfig = utils.getModelGrapqhQLConfig(model)

  const result = {
    queries: getQueries({model, modelTypes, schemaConfig}),
    mutations: getMutations({model, modelTypes}),
    subscriptions: getSubscriptions({model, modelTypes})
  }

  // 绑定静态方法和实例方法
  const methods = _.get(modelConfig, 'methods', null)
  if (methods) {
    _.forOwn(methods, (value, key) => {
      model.prototype[key] = value
    })
  }
  const statics = _.get(modelConfig, 'statics', null)
  if (statics) {
    _.forOwn(statics, (value, key) => {
      model[key] = value
    })
  }

  return result
}
