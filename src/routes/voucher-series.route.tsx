import type { RouteObject } from "react-router-dom";
import { VoucherSeriesPage } from "@/src/modules/Administration/VoucherSeries/voucher-series-page";
import { MODULES } from "@/src/constants/modules";

export const voucherSeriesRoute: RouteObject = {
  path: MODULES.VOUCHER_SERIES,
  element: <VoucherSeriesPage />,
};
