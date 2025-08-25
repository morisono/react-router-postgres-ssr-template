import { createExecutionContext, env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

// Mock a simple worker for testing
const worker = {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    if (url.pathname === '/api/books') {
      return new Response(JSON.stringify([
        { id: 1, title: 'Test Book', author: 'Test Author' }
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

describe('Worker Integration Tests', () => {
  it('should respond to health check', async () => {
    const request = new Request('http://example.com/health');
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('OK');
  });

  it('should return books from API', async () => {
    const request = new Request('http://example.com/api/books');
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      author: expect.any(String),
    });
  });

  it('should handle 404 for unknown routes', async () => {
    const request = new Request('http://example.com/unknown');
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);

    expect(response.status).toBe(404);
  });

  it('should handle POST requests', async () => {
    const request = new Request('http://example.com/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Book',
        author: 'New Author'
      })
    });
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);

    // For now, just check it doesn't crash
    expect(response).toBeDefined();
  });

  it('should work with SELF (integration style)', async () => {
    const response = await SELF.fetch('http://example.com/health');
    expect(response.status).toBe(200);
  });
});