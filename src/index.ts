import OpenAI, { ClientOptions } from 'openai';
import { Agent } from 'openai/_shims/index.mjs';
import { APIClient, APIPromise, AbstractPage, DefaultQuery, FinalRequestOptions, Headers, PagePromise, RequestClient } from 'openai/core.mjs';
import { APIError } from 'openai/error.mjs';
import { ChatCompletion } from 'openai/resources/index.mjs';

// Extract the public interface from OpenAI, including both properties and methods
type PublicInterface<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : T[K];
};

export class LLM implements PublicInterface<OpenAI> {

  // TODO(later): i don't think you should create a new openai etc object every time `create` is called.

  opts: ClientOptions;

  apiKey: string;
  organization: string | null;
  project: string | null;
  completions: OpenAI.Completions;
  chat: OpenAI.Chat
  embeddings: OpenAI.Embeddings;
  files: OpenAI.Files;
  images: OpenAI.Images;
  audio: OpenAI.Audio;
  moderations: OpenAI.Moderations;
  models: OpenAI.Models;
  fineTuning: OpenAI.FineTuning;
  beta: OpenAI.Beta;
  batches: OpenAI.Batches;
  baseURL: string;
  maxRetries: number;
  timeout: number;
  httpAgent: Agent | undefined;

  openai: OpenAI // TODO

  constructor({
    ...opts
  }: ClientOptions = {}) {
    this.opts = opts;
    this.openai = new OpenAI(opts)
    this.chat = this.openai.chat
  }

  protected defaultQuery(): DefaultQuery | undefined {
    throw new Error('Method not implemented.');
  }
  protected defaultHeaders(opts: FinalRequestOptions<unknown>): Headers {
    throw new Error('Method not implemented.');
  }
  protected authHeaders(opts: FinalRequestOptions<unknown>): Headers {
    throw new Error('Method not implemented.');
  }
  protected idempotencyHeader?: string | undefined;
  protected validateHeaders(headers: Headers, customHeaders: Headers): void {
    throw new Error('Method not implemented.');
  }
  protected defaultIdempotencyKey(): string {
    throw new Error('Method not implemented.');
  }
  get<Req, Rsp>(path: string, opts?: (OpenAI.RequestOptions<Req> | Promise<OpenAI.RequestOptions<Req>>) | undefined): APIPromise<Rsp> {
    throw new Error('Method not implemented.');
  }
  post<Req, Rsp>(path: string, opts?: (OpenAI.RequestOptions<Req> | Promise<OpenAI.RequestOptions<Req>>) | undefined): APIPromise<Rsp> {
    throw new Error('Method not implemented.');
  }
  patch<Req, Rsp>(path: string, opts?: (OpenAI.RequestOptions<Req> | Promise<OpenAI.RequestOptions<Req>>) | undefined): APIPromise<Rsp> {
    throw new Error('Method not implemented.');
  }
  put<Req, Rsp>(path: string, opts?: (OpenAI.RequestOptions<Req> | Promise<OpenAI.RequestOptions<Req>>) | undefined): APIPromise<Rsp> {
    throw new Error('Method not implemented.');
  }
  delete<Req, Rsp>(path: string, opts?: (OpenAI.RequestOptions<Req> | Promise<OpenAI.RequestOptions<Req>>) | undefined): APIPromise<Rsp> {
    throw new Error('Method not implemented.');
  }
  getAPIList<Item, PageClass extends AbstractPage<Item> = AbstractPage<Item>>(path: string, Page: new (...args: any[]) => PageClass, opts?: OpenAI.RequestOptions<any> | undefined): PagePromise<PageClass, Item> {
    throw new Error('Method not implemented.');
  }
  buildRequest<Req>(options: FinalRequestOptions<Req>): { req: RequestInit; url: string; timeout: number; } {
    throw new Error('Method not implemented.');
  }
  protected prepareOptions(options: FinalRequestOptions<unknown>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected prepareRequest(request: RequestInit, { url, options }: { url: string; options: FinalRequestOptions<unknown>; }): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected parseHeaders(headers: HeadersInit | null | undefined): Record<string, string> {
    throw new Error('Method not implemented.');
  }
  protected makeStatusError(status: number | undefined, error: Object | undefined, message: string | undefined, headers: Headers | undefined): APIError {
    throw new Error('Method not implemented.');
  }
  request<Req, Rsp>(options: FinalRequestOptions<Req> | Promise<FinalRequestOptions<Req>>, remainingRetries?: number | null | undefined): APIPromise<Rsp> {
    throw new Error('Method not implemented.');
  }
  requestAPIList<Item = unknown, PageClass extends AbstractPage<Item> = AbstractPage<Item>>(Page: new (client: APIClient, response: Response, body: unknown, options: FinalRequestOptions<unknown>) => PageClass, options: FinalRequestOptions<unknown>): PagePromise<PageClass, Item> {
    throw new Error('Method not implemented.');
  }
  buildURL<Req>(path: string, query: Req | null | undefined): string {
    throw new Error('Method not implemented.');
  }
  protected stringifyQuery(query: Record<string, unknown>): string {
    throw new Error('Method not implemented.');
  }
  fetchWithTimeout(url: RequestInfo, init: RequestInit | undefined, ms: number, controller: AbortController): Promise<Response> {
    throw new Error('Method not implemented.');
  }
  protected getRequestClient(): RequestClient {
    throw new Error('Method not implemented.');
  }
}