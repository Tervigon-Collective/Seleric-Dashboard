import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/api/api";

const TimeframeDataContext = createContext();

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const TimeframeDataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("timeframeData");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if timestamp is within 1 day
        if (parsed.timestamp && Date.now() - parsed.timestamp < ONE_DAY_MS) {
          return parsed.data;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("timeframeData");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if timestamp is within 1 day
        if (parsed.timestamp && Date.now() - parsed.timestamp < ONE_DAY_MS) {
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }
    }
    // If no valid localStorage, fetch from API
    setLoading(true);
    Promise.all([
      apiClient.get("/api/net_sales/year"),
      apiClient.get("/api/net_sales/month"),
      apiClient.get("/api/net_sales/week"),
    ]).then(([year, month, week]) => {
      const result = {
        Year: year.data,
        Month: month.data,
        Week: week.data,
      };
      setData(result);
      localStorage.setItem(
        "timeframeData",
        JSON.stringify({ data: result, timestamp: Date.now() })
      );
      setLoading(false);
    });
  }, []);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      apiClient.get("/api/net_sales/year"),
      apiClient.get("/api/net_sales/month"),
      apiClient.get("/api/net_sales/week"),
    ]).then(([year, month, week]) => {
      const result = {
        Year: year.data,
        Month: month.data,
        Week: week.data,
      };
      setData(result);
      localStorage.setItem(
        "timeframeData",
        JSON.stringify({ data: result, timestamp: Date.now() })
      );
      setLoading(false);
    });
  };

  return (
    <TimeframeDataContext.Provider value={{ data, loading, refresh }}>
      { children}
    </TimeframeDataContext.Provider>
  );
};

export const useTimeframeData = () => useContext(TimeframeDataContext); 