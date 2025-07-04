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
  const [currency, setCurrency] = React.useState('INR');
  const [chartData, setChartData] = React.useState({ series: [], labels: [] });

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
        const endDate = new Date(year, m + 1, 0); // last day of month
        const endDateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        const res = await axios.get(`${config.api.baseURL}/api/orders/custom?startDate=${startDate}&endDate=${endDateStr}`);
        monthData.push(res.data.totalRevenue || 0);
      }
      setChartData({
        series: [{ name: 'Revenue', data: monthData }],
        labels: months.slice(0, now.getMonth() + 1)
      });
      setTotalRevenue(monthData.reduce((a, b) => a + b, 0));
      setCurrency('INR');
      setLoading(false);
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
            {/* You can keep or update the rest of the stat info as needed */}
            {/* <span className='text-sm fw-semibold rounded-pill bg-success-focus text-success-main border br-success px-8 py-4 line-height-1 d-flex align-items-center gap-1'>
              10% <Icon icon='bxs:up-arrow' className='text-xs' />
            </span>
            <span className='text-xs fw-medium'>+ $1500 Per Day</span> */}
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
