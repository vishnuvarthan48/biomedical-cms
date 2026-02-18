import { apiInstance } from "../apiInstance";

interface AirTicketData {
  [key: string]: unknown;
}

const AirTicket = apiInstance.injectEndpoints({
  endpoints: (builder) => ({
    getListAirTicket: builder.query<unknown, string>({
      query: (id) => ({
        url: `/air-ticket/get-all?tenantId=${id}`,
        method: "GET",
      }),
    }),

    createAirTicket: builder.mutation<unknown, AirTicketData>({
      query: (data) => ({
        url: "/air-ticket/save",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetListAirTicketQuery, useCreateAirTicketMutation } =
  AirTicket;
