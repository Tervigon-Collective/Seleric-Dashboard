"use client";
import useReactApexChart from "@/hook/useReactApexChart";
import { Icon } from "@iconify/react/dist/iconify.js";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import axios from "axios";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
import config from '../../config';
const TotalSubscriberOne = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestNetProfit, setLatestNetProfit] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`${config.api.baseURL}/api/net_profit_daily?n=7`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setLoading(false);
      });
    // Fetch latest net profit for stat
    axios.get(`${config.api.baseURL}/api/net_profit`)
      .then((res) => {
        setLatestNetProfit(res.data.totalNetProfit || 0);
      })
      .catch(() => {
        setLatestNetProfit(0);
      });
  }, []);

  // Prepare chart data
  const chartLabels = data.map((d) => {
    const date = new Date(d.date);
    // Remove any trailing .0 from day string
    return date.toLocaleDateString("en-US", { weekday: "short" }).replace(/\.0$/, "");
  });
  const chartSeries = [
    {
      name: "Net Profit",
      data: data.map((d) => Number(d.net_profit)),
    },
  ];
  // Bar colors: green for profit, red for loss
  const barColors = data.map((d) => (Number(d.net_profit) >= 0 ? "#388e3c" : "#d32f2f"));

  // Latest value (today or most recent)
  const latest = latestNetProfit !== null ? Number(latestNetProfit) : 0;
  const latestColor = latest >= 0 ? "#388e3c" : "#d32f2f";
  const formatK = (val) => {
    const n = Math.abs(val);
    return (n >= 1000 ? (val / 1000).toFixed(1) + "k" : val.toFixed(2));
  };

  // Chart options
  const barChartOptions = {
    chart: { type: "bar", toolbar: { show: false }, offsetY: 10 },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "80%",
        colors: {
          ranges: [
            { from: 0, to: Number.MAX_VALUE, color: "#388e3c" }, // green for profit
            { from: -Number.MAX_VALUE, to: -0.01, color: "#d32f2f" }, // red for loss
          ],
        },
      },
    },
    colors: ["#388e3c"], // fallback
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartLabels,
      labels: {
        style: { fontWeight: 600, fontSize: '12px' },
        rotate: -30,
        minHeight: 20,
        maxHeight: 40,
        trim: true,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${formatK(val)}`,
        style: { fontWeight: 600 },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `₹${formatK(val)}`,
      },
    },
    grid: { strokeDashArray: 4 },
    legend: { show: false }, // HIDE LEGEND
  };

  return (
    <div className='col-xxl-3 col-xl-6'>
      <div className='card h-100 radius-8 border'>
        <div className='card-body p-24'>
          <h6 className='mb-12 fw-semibold text-lg mb-16'>Net Profit (Last 7 Days)</h6>
          <div className='d-flex align-items-center gap-2 mb-20'>
            {loading ? (
              <h6 className='fw-semibold mb-0'>Loading...</h6>
            ) : error ? (
              <h6 className='fw-semibold mb-0 text-danger'>{error}</h6>
            ) : (
              <h6 className='fw-semibold mb-0' style={{ color: latestColor }}>
                ₹{formatK(latest)}
              </h6>
            )}
          </div>
          <ReactApexChart
            options={barChartOptions}
            series={chartSeries}
            type='bar'
            height={260}
          />
        </div>
      </div>
    </div>
  );
};

export default TotalSubscriberOne;
