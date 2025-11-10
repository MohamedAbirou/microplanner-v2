import { readFileSync } from 'fs';
import { join } from 'path';
import gql from 'graphql-tag';

// Load all GraphQL schema files
const scalarsSchema = readFileSync(join(__dirname, 'scalars.graphql'), 'utf-8');
const indexSchema = readFileSync(join(__dirname, 'index.graphql'), 'utf-8');
const userSchema = readFileSync(join(__dirname, 'user.graphql'), 'utf-8');
const goalSchema = readFileSync(join(__dirname, 'goal.graphql'), 'utf-8');
const taskSchema = readFileSync(join(__dirname, 'task.graphql'), 'utf-8');
const projectSchema = readFileSync(join(__dirname, 'project.graphql'), 'utf-8');
const productivitySchema = readFileSync(join(__dirname, 'productivity.graphql'), 'utf-8');

// Combine all schemas
export const typeDefs = gql`
  ${scalarsSchema}
  ${indexSchema}
  ${userSchema}
  ${goalSchema}
  ${taskSchema}
  ${projectSchema}
  ${productivitySchema}
`;
