/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum Roles {
  Employee = 0,
  Accountant = 1,
  SystemOwner = 2,
}

export enum RequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

export enum HolidayAccount {
  Week1To5 = 0,
  Week6 = 1,
}

export interface LoginResponse {
  token?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface HealthResponse {
  status?: string;
  /** @format date-time */
  serverTime?: string;
}

export interface HolidayRequestSummary {
  requestId?: string;
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  account?: HolidayAccount;
  /** @format decimal */
  hours?: number;
  status?: RequestStatus;
  reason?: string | null;
}

export interface CreateHolidayRequest {
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  account?: HolidayAccount;
}

export interface PendingRequest {
  requestId?: string;
  userName?: string;
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  account?: HolidayAccount;
  /** @format decimal */
  hours?: number;
}

export interface RejectHolidayRequest {
  reason?: string;
}

export interface ScheduleVersion {
  /** @format date */
  effectiveFrom?: string | null;
  /** @format date */
  validUntil?: string | null;
  hours?: ScheduleHours;
}

export interface ScheduleHours {
  /** @format decimal */
  monday?: number;
  /** @format decimal */
  tuesday?: number;
  /** @format decimal */
  wednesday?: number;
  /** @format decimal */
  thursday?: number;
  /** @format decimal */
  friday?: number;
  /** @format decimal */
  saturday?: number;
  /** @format decimal */
  sunday?: number;
}

export interface UserSummary {
  userId?: string;
  userName?: string;
  email?: string;
  role?: Roles;
  isActive?: boolean;
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string | null;
}

export interface CreateUserRequest {
  userName?: string;
  password?: string;
  email?: string;
  role?: Roles;
}

export interface WeekDto {
  /** @format int32 */
  week?: number;
  /** @format int32 */
  year?: number;
  /** @format date */
  monday?: string;
  /** @format date */
  sunday?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:5221";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Business Esbjerg Holiday API
 * @version 1.0.0
 * @baseUrl http://localhost:5221
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthLogin
     * @request POST:/api/Auth/Login
     * @secure
     */
    authLogin: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<LoginResponse, any>({
        path: `/api/Auth/Login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  health = {
    /**
     * No description
     *
     * @tags Health
     * @name HealthGet
     * @request GET:/api/Health
     * @secure
     */
    healthGet: (params: RequestParams = {}) =>
      this.request<HealthResponse, any>({
        path: `/api/Health`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  holidayRequest = {
    /**
     * No description
     *
     * @tags HolidayRequest
     * @name HolidayRequestCreate
     * @request POST:/api/holiday-requests
     * @secure
     */
    holidayRequestCreate: (
      data: CreateHolidayRequest,
      params: RequestParams = {},
    ) =>
      this.request<HolidayRequestSummary, any>({
        path: `/api/holiday-requests`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags HolidayRequest
     * @name HolidayRequestGetPending
     * @request GET:/api/holiday-requests/pending
     * @secure
     */
    holidayRequestGetPending: (params: RequestParams = {}) =>
      this.request<PendingRequest[], any>({
        path: `/api/holiday-requests/pending`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags HolidayRequest
     * @name HolidayRequestApprove
     * @request POST:/api/holiday-requests/{id}/approve
     * @secure
     */
    holidayRequestApprove: (id: string, params: RequestParams = {}) =>
      this.request<Blob, any>({
        path: `/api/holiday-requests/${id}/approve`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags HolidayRequest
     * @name HolidayRequestReject
     * @request POST:/api/holiday-requests/{id}/reject
     * @secure
     */
    holidayRequestReject: (
      id: string,
      data: RejectHolidayRequest,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/holiday-requests/${id}/reject`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags HolidayRequest
     * @name HolidayRequestGetMine
     * @request GET:/api/holiday-requests/mine
     * @secure
     */
    holidayRequestGetMine: (params: RequestParams = {}) =>
      this.request<HolidayRequestSummary[], any>({
        path: `/api/holiday-requests/mine`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  schedule = {
    /**
     * No description
     *
     * @tags Schedule
     * @name ScheduleGet
     * @request GET:/api/users/{userId}/schedule
     * @secure
     */
    scheduleGet: (
      userId: string,
      query?: {
        /** @format date */
        date?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ScheduleVersion, any>({
        path: `/api/users/${userId}/schedule`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Schedule
     * @name ScheduleGetHistory
     * @request GET:/api/users/{userId}/schedule/history
     * @secure
     */
    scheduleGetHistory: (userId: string, params: RequestParams = {}) =>
      this.request<ScheduleVersion[], any>({
        path: `/api/users/${userId}/schedule/history`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Schedule
     * @name ScheduleSave
     * @request PUT:/api/users/{userId}/schedule/{effectiveFrom}
     * @secure
     */
    scheduleSave: (
      userId: string,
      effectiveFrom: string,
      data: ScheduleHours,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/users/${userId}/schedule/${effectiveFrom}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Schedule
     * @name ScheduleDelete
     * @request DELETE:/api/users/{userId}/schedule/{effectiveFrom}
     * @secure
     */
    scheduleDelete: (
      userId: string,
      effectiveFrom: string,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/users/${userId}/schedule/${effectiveFrom}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags User
     * @name UserCreate
     * @request POST:/api/users
     * @secure
     */
    userCreate: (data: CreateUserRequest, params: RequestParams = {}) =>
      this.request<UserSummary, any>({
        path: `/api/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserGetAll
     * @request GET:/api/users
     * @secure
     */
    userGetAll: (params: RequestParams = {}) =>
      this.request<UserSummary[], any>({
        path: `/api/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserDelete
     * @request DELETE:/api/users/{id}
     * @secure
     */
    userDelete: (id: string, params: RequestParams = {}) =>
      this.request<Blob, any>({
        path: `/api/users/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserUpdate
     * @request PUT:/api/users/{id}
     * @secure
     */
    userUpdate: (
      id: string,
      query?: {
        userName?: string;
        role?: Roles;
      },
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/users/${id}`,
        method: "PUT",
        query: query,
        secure: true,
        ...params,
      }),
  };
  week = {
    /**
     * No description
     *
     * @tags Week
     * @name WeekGet
     * @request GET:/api/weeks
     * @secure
     */
    weekGet: (
      query?: {
        /** @format date */
        date?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<WeekDto, any>({
        path: `/api/weeks`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
