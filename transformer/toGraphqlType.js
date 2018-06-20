import toGraphQLFieldConfig from './toGraphqlFieldConfig'
import toGraphQLInputFieldMap from './toGraphQLInputFieldMap'
import _ from "lodash"

export default ({obj, modelTypes, useRoot = false}) => {
  const result = {}
  _.forOwn(obj, (value, key) => {
    let { type, args } = value
    value.name = key
    value.args = toGraphQLInputFieldMap(key, args)
    value.type = toGraphQLFieldConfig(key, '', value.$type, null, modelTypes).type
    result[key] = {
      ...value,
      resolve: (_, _ref, context, info) => {
        // modelTypes塞入context, connection查询使用
        context.modelTypes = modelTypes
        return useRoot ? value.resolve(_, _ref, context, info) : value.resolve(_ref, context, info)
      }
    }
  })
  return result
}
