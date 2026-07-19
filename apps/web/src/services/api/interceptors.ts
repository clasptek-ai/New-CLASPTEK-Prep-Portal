export interface RequestInterceptor {
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
}

export interface ResponseInterceptor {
  onResponse?: (response: Response) => Response | Promise<Response>;
}

export const interceptors: {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
} = {
  request: [],
  response: []
};
