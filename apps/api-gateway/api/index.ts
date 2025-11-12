// Vercel serverless wrapper for pre-built NestJS bundle
// This loads the webpack bundle from dist/main.js
import { IncomingMessage, ServerResponse } from 'http';

let handler: any = null;

// Load the bundled app
async function getHandler() {
  if (handler) return handler;

  // Import the compiled bundle
  const bundle = await import('../dist/main.js');

  // The bundle exports a serverless-compatible handler
  handler = bundle.default || bundle;

  return handler;
}

// Vercel serverless function
export default async function (req: IncomingMessage, res: ServerResponse) {
  try {
    const h = await getHandler();

    // If handler is a function, call it
    if (typeof h === 'function') {
      return h(req, res);
    }

    // Otherwise it might be an express app
    return h.handle(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}

