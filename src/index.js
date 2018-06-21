import getSchema from './getSchema';
import { getModelTypes, graphqlModel } from './graphql';
import ModelRef from './ModelRef';
import Connection from './Connection';

export default {
  getSchema,
  getModelTypes,
  graphqlModel,
  modelRef: function modelRef(name) {
    return new ModelRef(name);
  },
  Connection
}
