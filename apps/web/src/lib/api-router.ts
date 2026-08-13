import { NextRequest, NextResponse } from 'next/server';

export type RouteHandler = (
  req: NextRequest,
  params: Record<string, string>
) => Promise<NextResponse> | NextResponse;

export interface RegisteredRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  pattern: string;
  handler: RouteHandler;
  paramKeys: string[];
  regex: RegExp;
}

export class ApiRouter {
  private routes: RegisteredRoute[] = [];

  public register(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    pattern: string,
    handler: RouteHandler
  ) {
    const paramKeys: string[] = [];
    const regexPattern = pattern
      .replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        paramKeys.push(key);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    this.routes.push({ method, pattern, handler, paramKeys, regex });
  }

  public get(pattern: string, handler: RouteHandler) {
    this.register('GET', pattern, handler);
  }

  public post(pattern: string, handler: RouteHandler) {
    this.register('POST', pattern, handler);
  }

  public put(pattern: string, handler: RouteHandler) {
    this.register('PUT', pattern, handler);
  }

  public patch(pattern: string, handler: RouteHandler) {
    this.register('PATCH', pattern, handler);
  }

  public delete(pattern: string, handler: RouteHandler) {
    this.register('DELETE', pattern, handler);
  }

  public async dispatch(req: NextRequest, slug: string[]): Promise<NextResponse> {
    const method = req.method.toUpperCase() as any;
    
    // Construct pathname from slug array (ignoring query strings)
    const rawPath = '/' + slug.join('/');
    const pathname = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;

    let pathMatched = false;

    for (const route of this.routes) {
      const match = pathname.match(route.regex);
      if (match) {
        pathMatched = true;
        if (route.method === method) {
          const params: Record<string, string> = {};
          route.paramKeys.forEach((key, idx) => {
            params[key] = decodeURIComponent(match[idx + 1]);
          });
          return route.handler(req, params);
        }
      }
    }

    if (pathMatched) {
      return NextResponse.json(
        { success: false, error: `Method ${method} Not Allowed on ${pathname}` },
        { status: 405 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Route ${method} ${pathname} Not Found` },
      { status: 404 }
    );
  }
}

export const apiRouter = new ApiRouter();
