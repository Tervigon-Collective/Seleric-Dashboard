"use client";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react/dist/iconify.js";
import useReactApexChart from "@/hook/useReactApexChart";
import axios from "axios";
import config from '../../config';
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SalesStatisticOne = () => {
  let { chartOptions, chartSeries } = useReactApexChart();

  const [period, setPeriod] = React.useState('today');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [chartRevenue, setChartRevenue] = React.useState(0);
  const [currency, setCurrency] = React.useState('INR');
  const [chartData, setChartData] = React.useState({ series: [], labels: [] });

  const yearlyCacheRef = React.useRef(null);
  const YEARLY_CACHE_KEY = 'salesStatisticYearlyData';
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const fetchData = React.useCallback((selectedPeriod) => {
    setLoading(true);
    setError(null);
    axios.get(`${config.api.baseURL}/api/orders/${selectedPeriod}`)
      .then(res => {
        setTotalRevenue(res.data.totalRevenue || 0);
        setCurrency(res.data.currency || 'INR');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const fetchYearlyData = async () => {
    setLoading(true);
    setError(null);

    // ✅ Check in-memory cache first
    if (yearlyCacheRef.current) {
      const cached = yearlyCacheRef.current;
      setChartData(cached.chartData);
      setChartRevenue(cached.chartRevenue);
      setCurrency(cached.currency);
      setLoading(false);
      return;
    }

    // ✅ Check localStorage cache
    const local = localStorage.getItem(YEARLY_CACHE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const ageMs = Date.now() - (parsed.timestamp || 0);
        if (ageMs < ONE_DAY_MS) {
          // Data still valid
          yearlyCacheRef.current = parsed;
          setChartData(parsed.chartData);
          setChartRevenue(parsed.chartRevenue);
          setCurrency(parsed.currency);
          setLoading(false);
          return;
        } else {
          // Data expired
          localStorage.removeItem(YEARLY_CACHE_KEY);
        }
      } catch (e) {
        console.error('Error parsing cached data:', e);


      }
    }

    try {
      const now = new Date();
      const year = now.getFullYear();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthData = [];
      for (let m = 0; m <= now.getMonth(); m++) {
        const startDate = `${year}-${String(m + 1).padStart(2, '0')}-01`;
        const endDate = new Date(year, m + 1, 0);
        const endDateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        const res = await axios.get(`${config.api.baseURL}/api/orders/custom?startDate=${startDate}&endDate=${endDateStr}`);
        monthData.push(res.data.totalRevenue || 0);
      }

      const newChartData = {
        series: [{ name: 'Revenue', data: monthData }],
        labels: months.slice(0, now.getMonth() + 1)
      };
      const newChartRevenue = monthData.reduce((a, b) => a + b, 0);
      const newCurrency = 'INR';

      setChartData(newChartData);
      setChartRevenue(newChartRevenue);
      setCurrency(newCurrency);
      setLoading(false);


      const cacheObj = {
        chartData: newChartData,
        chartRevenue: newChartRevenue,
        currency: newCurrency,
        timestamp: Date.now()
      };
      yearlyCacheRef.current = cacheObj;
      localStorage.setItem(YEARLY_CACHE_KEY, JSON.stringify(cacheObj));

    } catch (err) {
      setError('Failed to load yearly data');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchYearlyData();
  }, []);

  React.useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  return (
    <div className='col-xxl-6 col-xl-12'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex flex-wrap align-items-center justify-content-between'>
            <h6 className='text-lg mb-0'>Sales Statistic</h6>
            <select
              className='form-select bg-base form-select-sm w-auto'
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              <option value='today'>Today</option>
              <option value='week'>Weekly</option>
              <option value='month'>Monthly</option>
              <option value='year'>Yearly</option>
            </select>
          </div>
          <div className='d-flex flex-wrap align-items-center gap-2 mt-8'>
            {loading ? (
              <h6 className='mb-0'>Loading...</h6>
            ) : error ? (
              <h6 className='mb-0 text-danger'>{error}</h6>
            ) : (
              <h6 className='mb-0'>
                {currency === 'INR' ? '₹' : '$'}{Number(totalRevenue).toLocaleString()}
              </h6>
            )}
          </div>
          <ReactApexChart
            options={{
              ...chartOptions,
              xaxis: {
                ...chartOptions.xaxis,
                categories: chartData.labels.length ? chartData.labels : chartOptions.xaxis?.categories
              },
              yaxis: {
                ...chartOptions.yaxis,
                labels: {
                  formatter: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
                }
              }
            }}
            series={chartData.series}
            type='area'
            height={264}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesStatisticOne;
