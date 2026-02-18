import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  role: string;
  tenant_id?: string | number;
  [key: string]: unknown;
}

interface LoginDetails {
  email?: string;
  username?: string;
}

interface AuthState {
  user: User;
  accessToken: string;
  refreshToken: string;
  otpTokenId: string;
  loginDetails: LoginDetails;
  office: Record<string, unknown>;
  permission: string[];
}

const INITIAL_USER: AuthState = {
  user: { role: "" },
  accessToken: "",
  refreshToken: "",
  otpTokenId: "",
  loginDetails: { email: "" },
  office: {},
  permission: [],
};

interface LoginPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
  username: string;
  permission?: string[];
}

interface SignUpPayload {
  otpTokenId: string;
  role?: string;
  accessToken: string;
  refreshToken: string;
  email: string;
}

interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState: INITIAL_USER,
  reducers: {
    handleLoginSlice: (state, action: PayloadAction<LoginPayload>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loginDetails = { username: action.payload.username };
      state.permission = action.payload.permission ?? [];
    },
    handleLogoutSlice: () => INITIAL_USER,
    handleSignUpSlice: (state, action: PayloadAction<SignUpPayload>) => {
      state.otpTokenId = action.payload.otpTokenId;
      state.user = { role: action.payload.role ?? "" };
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loginDetails = { email: action.payload.email };
    },
    handleRefreshToken: (state, action: PayloadAction<RefreshTokenPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    handleUserUpdate: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
    },
    handleOfficeUpdate: (
      state,
      action: PayloadAction<Record<string, unknown>>,
    ) => {
      state.office = action.payload;
    },
    handleTenantUpdate: (state, action: PayloadAction<string | number>) => {
      state.user = { ...state.user, tenant_id: action.payload };
    },
  },
});

export type { AuthState };

export const {
  handleLoginSlice,
  handleLogoutSlice,
  handleSignUpSlice,
  handleRefreshToken,
  handleUserUpdate,
  handleOfficeUpdate,
  handleTenantUpdate,
} = authSlice.actions;

export default authSlice.reducer;
