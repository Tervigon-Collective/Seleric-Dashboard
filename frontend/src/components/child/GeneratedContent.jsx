"use client";
import useReactApexChart from "@/hook/useReactApexChart";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { useTimeframeData } from "@/helper/TimeframeDataContext";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});


const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const GeneratedContent = () => {
  const [timeframe, setTimeframe] = useState("Year");
  const { data, loading } = useTimeframeData();
  let { paymentStatusChartSeries, paymentStatusChartOptions } = useReactApexChart();

  // Prepare chart data from context
  const { chartSeries, chartOptions } = useMemo(() => {
    if (!data || !data[timeframe]) {
      return { chartSeries: [], chartOptions: {} };
    }
    const raw = data[timeframe];
    let categories;
    if (timeframe === "Month") {
      categories = raw.map((item) => item.date || "");
    } else {
      categories = raw.map((item) => item.month || item.day || item.date || "");
    }
    const adSpend = raw.map((item) => item.spend);
    const totalRevenue = raw.map((item) => item.totalSales - item.cancelledAmount);
    const isMonth = timeframe === "Month";
    return {
      chartSeries: [
        { name: "Ad Spend", data: adSpend },
        { name: "Total Revenue", data: totalRevenue },
      ],
      chartOptions: {
        chart: { type: "bar", height: 350, toolbar: { show: false } },
        plotOptions: {
          bar: {
            borderRadius: 6,
            horizontal: false,
            columnWidth: isMonth ? '40%' : 24,
            endingShape: "rounded",
            grouped: true,
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            style: { fontSize: '11px' },
          },
        },
        yaxis: {
          labels: {
            formatter: (value) => {
              if (value >= 1000) {
                return `Rs ${(value / 1000).toFixed(0)}k`;
              }
              return `Rs ${value}`;
            },
            style: { fontSize: '13px' },
            offsetY: 54,
          },
          title: {
            text: 'Rs',
            style: { fontWeight: 600, fontSize: '15px' },
          },
          tickAmount: 6,
        },
        fill: { opacity: 1 },
        colors: ["#487FFF", "#FFC107"],
        legend: { show: false },
        grid: { padding: { left: 60, right: 10 } },
      },
    };
  }, [data, timeframe]);

  return (
    <div className='col-xxl-12'>
      <div className='card' style={{ padding: 24 }}>
        <div className='card-body'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Generated Content</h6>
            <select
              className='form-select form-select-sm w-auto bg-base border text-secondary-light'
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
            >
              <option value='Year'>Year</option>
              <option value='Month'>Month</option>
              <option value='Week'>Week</option>
            </select>
          </div>
          {/* Custom legend above chart */}
          <div className='d-flex align-items-center gap-4 mt-3 mb-2'>
            <div className='d-flex align-items-center gap-1'>
              <span className='w-12-px h-12-px rounded-circle' style={{ background: '#487FFF' }} />
              <span className='fw-semibold text-sm'>Ad Spend</span>
            </div>
            <div className='d-flex align-items-center gap-1'>
              <span className='w-12-px h-12-px rounded-circle' style={{ background: '#FFC107' }} />
              <span className='fw-semibold text-sm'>Total Revenue</span>
            </div>
          </div>
          <div className='mt-40'>
            {/* Make chart horizontally scrollable if too many dates */}
            <div className='margin-16-minus' style={{ overflowX: 'auto' }}>
              {loading ? (
                <Loader />
              ) : (
                <div style={{ minWidth: timeframe === 'Month' ? 900 : 'auto' }}>
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type='bar'
                    height={350}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedContent;
