import { attributeFields } from 'graphql-sequelize'
import _ from 'lodash'

// 统一处理cache，解决重复定义enum类型bug
const cache = {}
export default (model, options) => {
  _.assign(options, {cache})
  return attributeFields(model, options)
}
