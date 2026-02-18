import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { v4 as uuidv4 } from "uuid";
import { handleLogoutSlice, handleRefreshToken } from "./slice/authSlice";
import { toast } from "sonner";
import type { RootState } from "./store";

export const BASE_API_URL = import.meta.env.VITE_SERVICE_URL;
export const BASE_AUTH_URL = import.meta.env.VITE_SERVICE_URL;

/* -------------------- ERROR HANDLER -------------------- */
const handleApiError = (
  error: FetchBaseQueryError,
  api: { dispatch: (action: unknown) => void },
): FetchBaseQueryError | void => {
  const status = error?.status;
  const data = error?.data as { message?: string } | undefined;
  const message = data?.message ?? "Request failed";

  if (status === 404) return error;

  if (status === 401) {
    api.dispatch(handleLogoutSlice());
    toast.error(message + " Please login again.");
  }
};

/* -------------------- PREPARE HEADERS -------------------- */
const prepareHeaders = (
  headers: Headers,
  { getState }: { getState: () => unknown },
): Headers => {
  const token = (getState() as RootState).auth?.accessToken;
  if (token) headers.set("authorization", `Bearer ${token}`);
  headers.set("requestId", uuidv4());
  return headers;
};

const rawBaseQueryApi = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders,
});

const rawBaseQueryAuth = fetchBaseQuery({
  baseUrl: BASE_AUTH_URL,
  prepareHeaders,
});

type BaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

/* -------------------- TRIM BODY WRAPPER -------------------- */
const trimWrapper =
  (baseQuery: BaseQuery): BaseQuery =>
  async (args, api, extra) => {
    const trim = (obj: unknown): unknown => {
      if (typeof obj === "string") return obj.trim();
      if (Array.isArray(obj)) return obj.map(trim);
      if (obj && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
            k,
            trim(v),
          ]),
        );
      }
      return obj;
    };

    if (
      args &&
      typeof args === "object" &&
      "body" in args &&
      (args as FetchArgs).body &&
      !((args as FetchArgs).body instanceof FormData)
    ) {
      args = { ...(args as FetchArgs), body: trim((args as FetchArgs).body) };
    }

    return baseQuery(args, api, extra);
  };

/* -------------------- REAUTH WRAPPER -------------------- */
const reauthWrapper =
  (baseQuery: BaseQuery): BaseQuery =>
  async (args, api, extra) => {
    let result = await baseQuery(args, api, extra);

    if (result.error?.status === 401) {
      const refreshToken = (api.getState() as RootState).auth?.refreshToken;

      // First attempt: retry with refresh token as Bearer token
      const retryResult = await fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
          if (refreshToken)
            headers.set("authorization", `Bearer ${refreshToken}`);
          headers.set("requestId", uuidv4());
          return headers;
        },
      })(args, api, extra);

      if (!retryResult.error) {
        return retryResult;
      }

      // Second attempt: call refresh token API if first retry also fails with 401
      if (retryResult.error?.status === 401) {
        const refreshResult = await rawBaseQueryAuth(
          {
            url: "/oauth/refresh",
            method: "PUT",
            body: { token: refreshToken, grantType: "user" },
          },
          api,
          extra,
        );

        const refreshData = refreshResult.data as
          | { accessToken?: string; refreshToken?: string }
          | undefined;

        if (refreshData?.accessToken) {
          api.dispatch(
            handleRefreshToken(
              refreshData as { accessToken: string; refreshToken: string },
            ),
          );
          result = await baseQuery(args, api, extra);
        } else {
          api.dispatch(handleLogoutSlice());
        }
      } else {
        return retryResult;
      }
    }
    return result;
  };

/* -------------------- ERROR WRAPPER -------------------- */
const errorWrapper =
  (baseQuery: BaseQuery): BaseQuery =>
  async (args, api, extra) => {
    const result = await baseQuery(args, api, extra);
    if (result.error) {
      handleApiError(result.error, api);
    }
    return result;
  };

/* -------------------- API GENERATOR -------------------- */
interface MakeApiInstanceOptions {
  reducerPath: string;
  baseQuery: BaseQuery;
  tagTypes: string[];
}

export const makeApiInstance = ({
  reducerPath,
  baseQuery,
  tagTypes,
}: MakeApiInstanceOptions) =>
  createApi({
    reducerPath,
    baseQuery,
    tagTypes,
    endpoints: () => ({}),
  });

/* ----------- FINAL API EXPORTS ------------ */
export const authApiInstance = makeApiInstance({
  reducerPath: "authApi",
  baseQuery: errorWrapper(rawBaseQueryAuth),
  tagTypes: ["auth"],
});

export const apiInstance = makeApiInstance({
  reducerPath: "api",
  baseQuery: errorWrapper(trimWrapper(reauthWrapper(rawBaseQueryApi))),
  tagTypes: [
    "ShiftMaster",
    "Employee",
    "Office",
    "User",
    "UserPermissions",
    "PayrollPeriod",
    "PayrollConfig",
    "Role",
    "Designation",
    "GradeLevel",
    "privilege-menu",
    "pay-cycle-rule",
  ],
});
