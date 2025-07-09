"use client";
import { TimeframeDataProvider } from "@/helper/TimeframeDataContext";

export default function ClientProvider({ children }) {
  return <TimeframeDataProvider>{children}</TimeframeDataProvider>;
} 