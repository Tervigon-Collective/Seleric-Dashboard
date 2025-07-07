"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import config from '../../config';

const TopPerformerOne = () => {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
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
    axios.get(`${config.api.baseURL}/api/top_skus_by_sales?n=6&start_date=${startDate}&end_date=${endDate}`)
      .then(res => {
        setSkus(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [period]);

  return (
    <div className='col-xxl-3 col-xl-12'>
      <div className='card h-100'>
        <div className='card-body'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Top Performer</h6>
            <div>
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
          <div className='mt-32'>
            {loading ? (
              <div className='text-center my-4'>Loading...</div>
            ) : error ? (
              <div className='text-danger my-4'>{error}</div>
            ) : skus.length === 0 ? (
              <div className='text-center my-4'>No data</div>
            ) : (
              skus.map((item, idx) => (
                <div className='d-flex align-items-center justify-content-between gap-3 mb-24' key={item.sku}>
                  <div className='d-flex align-items-center'>
                    <div className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden bg-primary-100 d-flex align-items-center justify-content-center' style={{ fontWeight: 700, fontSize: 16, color: '#1976d2' }}>
                      {idx + 1}
                    </div>
                    <div className='flex-grow-1'>
                      <h6 className='text-md mb-0 fw-medium'>{item.sku}</h6>
                    </div>
                  </div>
                  <span className='text-primary-light text-md fw-medium'>₹{Number(item.total_sales).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformerOne;
