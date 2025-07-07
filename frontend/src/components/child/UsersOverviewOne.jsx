"use client";
import useReactApexChart from "@/hook/useReactApexChart";
import dynamic from "next/dynamic";
import React from "react";
import axios from "axios";
import config from '../../config';
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const UsersOverviewOne = () => {
  const [series, setSeries] = React.useState([]);
  const [labels, setLabels] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [period, setPeriod] = React.useState('today');

  React.useEffect(() => {
    setLoading(true);
    const now = new Date();
    let startDate, endDate;
    if (period === 'today') {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      startDate = endDate = `${yyyy}-${mm}-${dd}`;
    } else if (period === 'week') {
      const end = new Date(now);
      const start = new Date(now);
      start.setDate(end.getDate() - 6);
      const yyyy1 = start.getFullYear();
      const mm1 = String(start.getMonth() + 1).padStart(2, '0');
      const dd1 = String(start.getDate()).padStart(2, '0');
      const yyyy2 = end.getFullYear();
      const mm2 = String(end.getMonth() + 1).padStart(2, '0');
      const dd2 = String(end.getDate()).padStart(2, '0');
      startDate = `${yyyy1}-${mm1}-${dd1}`;
      endDate = `${yyyy2}-${mm2}-${dd2}`;
    } else if (period === 'month') {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      startDate = `${yyyy}-${mm}-01`;
      // Get last day of month
      const lastDay = new Date(yyyy, now.getMonth() + 1, 0).getDate();
      endDate = `${yyyy}-${mm}-${String(lastDay).padStart(2, '0')}`;
    } else if (period === 'year') {
      const yyyy = now.getFullYear();
      startDate = `${yyyy}-01-01`;
      endDate = `${yyyy}-12-31`;
    }
    axios.get(`${config.api.baseURL}/api/order_sales_by_province?start_date=${startDate}&end_date=${endDate}`)
      .then(res => {
        setData(res.data);
        setSeries(res.data.map(item => item.total_sales));
        setLabels(res.data.map(item => item.province));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [period]);

  const donutChartOptions = {
    chart: { type: 'donut' },
    labels: labels,
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val) => `₹${val.toLocaleString()}`,
      },
    },
    plotOptions: {
      pie: {
        donut: { labels: { show: false } },
      },
    },
    colors: [
      '#1976d2', '#43cea2', '#f7971e', '#ffd200', '#388e3c', '#d32f2f', '#764ba2', '#11998e', '#ff4e50', '#185a9d'
    ],
  };

  return (
    <div className='col-xxl-3 col-xl-6'>
      <div className='card h-100 radius-8 border-0 overflow-hidden'>
        <div className='card-body p-24'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg'>Sale by Region</h6>
            <div className=''>
              <select
                className='form-select form-select-sm w-auto bg-base border text-secondary-light'
                value={period}
                onChange={e => setPeriod(e.target.value)}
              >
                <option value='today'>Today</option>
                <option value='week'>Weekly</option>
                <option value='month'>Monthly</option>
                <option value='year'>Yearly</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className='text-center my-4'>Loading...</div>
          ) : error ? (
            <div className='text-danger my-4'>{error}</div>
          ) : (
            <ReactApexChart
              options={donutChartOptions}
              series={series}
              type='donut'
              height={264}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersOverviewOne;
