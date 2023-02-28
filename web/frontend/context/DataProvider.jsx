import React, { createContext, useContext, useState } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

const DataContext = createContext();

export function AccessInfo() {
  const {
    data: AccessInfom,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/plan/info",
    reactQueryOptions: {
      onSuccess: () => {
        //setIsLoading(false);
      },
    },
  });
  return AccessInfom || {};
}
export const DataProvider = ({ children }) => {
  const [data, setData] = useState({ mountedSort: false });

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};
