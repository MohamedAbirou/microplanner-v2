import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema/**/*.graphql',
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../types/context#GraphQLContext',
        useIndexSignature: true,
        enumsAsTypes: true,
        avoidOptionals: {
          field: false,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
      },
    },
  },
};

export default config;
