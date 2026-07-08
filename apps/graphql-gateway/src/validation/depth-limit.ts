import {
  GraphQLError,
  Kind,
  type ASTVisitor,
  type ValidationContext,
  type FieldNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
} from 'graphql';

/**
 * Query depth-limiting validation rule (no external dependency).
 *
 * Rejects operations whose selection set nests deeper than `maxDepth`. This is
 * the primary defense against a crafted query that walks
 * task → subtasks → dependencies → dependentTask → subtasks → … to fan out an
 * unbounded number of REST calls (each field resolver hits the api-gateway).
 *
 * Fragments are resolved so `...on` spreads count toward depth.
 */
export function depthLimit(maxDepth: number) {
  return (context: ValidationContext): ASTVisitor => {
    const fragments: Record<string, FragmentDefinitionNode> = {};
    const operations: OperationDefinitionNode[] = [];

    return {
      FragmentDefinition(node) {
        fragments[node.name.value] = node;
      },
      OperationDefinition(node) {
        operations.push(node);
      },
      Document: {
        leave() {
          for (const operation of operations) {
            const depth = nodeDepth(operation, fragments, context, new Set());
            if (depth > maxDepth) {
              context.reportError(
                new GraphQLError(
                  `Query exceeds maximum depth of ${maxDepth} (got ${depth}).`,
                  { nodes: [operation] },
                ),
              );
            }
          }
        },
      },
    };
  };
}

function nodeDepth(
  node: OperationDefinitionNode | FieldNode | FragmentDefinitionNode,
  fragments: Record<string, FragmentDefinitionNode>,
  context: ValidationContext,
  visitedFragments: Set<string>,
  current = 0,
): number {
  const selections = node.selectionSet?.selections;
  if (!selections || selections.length === 0) return current;

  let max = current;
  for (const selection of selections) {
    if (selection.kind === Kind.FIELD) {
      // Introspection meta-fields don't count toward user query depth.
      if (selection.name.value.startsWith('__')) continue;
      const childDepth = nodeDepth(
        selection,
        fragments,
        context,
        visitedFragments,
        current + 1,
      );
      max = Math.max(max, childDepth);
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      const childDepth = nodeDepth(
        selection as unknown as FieldNode,
        fragments,
        context,
        visitedFragments,
        current,
      );
      max = Math.max(max, childDepth);
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const name = selection.name.value;
      // Guard against recursive fragment cycles.
      if (visitedFragments.has(name)) continue;
      const fragment = fragments[name];
      if (!fragment) continue;
      const nextVisited = new Set(visitedFragments).add(name);
      const childDepth = nodeDepth(
        fragment,
        fragments,
        context,
        nextVisited,
        current,
      );
      max = Math.max(max, childDepth);
    }
  }
  return max;
}
