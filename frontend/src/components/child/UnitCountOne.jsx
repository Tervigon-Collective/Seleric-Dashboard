'use client'
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import config from '../../config';
import axios from 'axios';

const UnitCountOne = () => {
    const [adSpend, setAdSpend] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [googleSpend, setGoogleSpend] = useState(0);
    const [facebookSpend, setFacebookSpend] = useState(0);
    const [totalCogs, setTotalCogs] = useState(0);
    const [googleCogs, setGoogleCogs] = useState(0);
    const [metaCogs, setMetaCogs] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [googleSales, setGoogleSales] = useState(0);
    const [metaSales, setMetaSales] = useState(0);
    const [organicSales, setOrganicSales] = useState(0);
    const [totalNetProfit, setTotalNetProfit] = useState(0);
    const [googleNetProfit, setGoogleNetProfit] = useState(0);
    const [metaNetProfit, setMetaNetProfit] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [googleQuantity, setGoogleQuantity] = useState(0);
    const [metaQuantity, setMetaQuantity] = useState(0);
    const [organicQuantity, setOrganicQuantity] = useState(0);
    const [grossRoas, setGrossRoas] = useState({ total: 0, google: 0, meta: 0 });
    const [netRoas, setNetRoas] = useState({ total: 0, google: 0, meta: 0 });
    const [beRoas, setBeRoas] = useState({ total: 0, google: 0, meta: 0 });

    // Helper to sort breakdowns by value descending
    const sortBreakdown = (arr) => arr.sort((a, b) => b.value - a.value);

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            axios.get(`${config.api.baseURL}/api/ad_spend`),
            axios.get(`${config.api.baseURL}/api/cogs`),
            axios.get(`${config.api.baseURL}/api/sales`),
            axios.get(`${config.api.baseURL}/api/net_profit`),
            axios.get(`${config.api.baseURL}/api/order_count`),
            axios.get(`${config.api.baseURL}/api/roas`)
        ])
        .then(([
            adSpendRes,
            cogsRes,
            salesRes,
            netProfitRes,
            orderCountRes,
            roasRes
        ]) => {
            setAdSpend(adSpendRes.data.totalSpend || 0);
            setGoogleSpend(adSpendRes.data.googleSpend || 0);
            setFacebookSpend(adSpendRes.data.facebookSpend || 0);
            setTotalCogs(cogsRes.data.totalCogs || 0);
            setGoogleCogs(cogsRes.data.googleCogs || 0);
            setMetaCogs(cogsRes.data.metaCogs || 0);
            setTotalSales(salesRes.data.totalSales || 0);
            setGoogleSales(salesRes.data.googleSales || 0);
            setMetaSales(salesRes.data.metaSales || 0);
            setOrganicSales(salesRes.data.organicSales || 0);
            setTotalNetProfit(netProfitRes.data.totalNetProfit || 0);
            setGoogleNetProfit(netProfitRes.data.googleNetProfit || 0);
            setMetaNetProfit(netProfitRes.data.metaNetProfit || 0);
            setTotalQuantity(orderCountRes.data.totalQuantity || 0);
            setGoogleQuantity(orderCountRes.data.googleQuantity || 0);
            setMetaQuantity(orderCountRes.data.metaQuantity || 0);
            setOrganicQuantity(orderCountRes.data.organicQuantity || 0);
            setGrossRoas({
                total: roasRes.data.total?.grossRoas || 0,
                google: roasRes.data.google?.grossRoas || 0,
                meta: roasRes.data.meta?.grossRoas || 0
            });
            setNetRoas({
                total: roasRes.data.total?.netRoas || 0,
                google: roasRes.data.google?.netRoas || 0,
                meta: roasRes.data.meta?.netRoas || 0
            });
            setBeRoas({
                total: roasRes.data.total?.beRoas || 0,
                google: roasRes.data.google?.beRoas || 0,
                meta: roasRes.data.meta?.beRoas || 0
            });
            setLoading(false);
        })
        .catch((err) => {
            setError('Failed to load data');
            setLoading(false);
        });
    }, []);

    return (
        <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
             {/* Card 1: Net Profit (with Google & Meta breakdown) */}
             <div className="col">
                <div className="card shadow-none border bg-gradient-start-10 h-100 position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Net Profit</p>
                                <h6
                                  className="mb-0 display-6 fw-bold"
                                  style={{
                                    letterSpacing: '1px',
                                    color: totalNetProfit < 0 ? '#d32f2f' : '#388e3c'
                                  }}
                                >
                                  {`Rs.${Number(loading || error ? 0 : totalNetProfit).toFixed(2)}`}
                                </h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                                <Icon
                                    icon="mdi:cash"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: googleNetProfit, color: googleNetProfit < 0 ? '#d32f2f' : '#388e3c' },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: metaNetProfit, color: metaNetProfit < 0 ? '#d32f2f' : '#388e3c' }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, minWidth: 90, color: item.color }}>Rs.{Number(item.value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
             {/* Card 2: Total Sales (with Google, Meta & Organic breakdown) */}
             <div className="col">
                <div className="card shadow-none border bg-gradient-start-8 h-100 position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Total Sales</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{`Rs.${Number(totalSales).toFixed(2)}`}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                                <Icon
                                    icon="mdi:cart"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: googleSales },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: metaSales },
                                { label: 'Organic', icon: <Icon icon="mdi:leaf" style={{ fontSize: 20, minWidth: 40, color: '#388e3c' }} />, value: organicSales }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>Rs.{Number(item.value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
            {/* Card 3: Total Ad Spend (with Google & Meta breakdown) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-6 h-100 interactive-adspend-card position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Total Ad Spend</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{loading ? 'Loading...' : `Rs.${Number(adSpend).toFixed(2)}`}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)'}}>
                                <Icon
                                    icon="mdi:currency-usd"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #f9d423 0%, #ff4e50 100%)', opacity: 0.4}}></div>
                        <div
                            className="d-flex flex-column align-items-center mt-2"
                            style={{ gap: 4, marginTop: 8 }}
                        >
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: googleSpend },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: facebookSpend }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>Rs.{Number(item.value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
            {/* Card 4: Total COGS (with Google & Meta breakdown) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-7 h-100 position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Total COGS</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{`Rs.${Number(totalCogs).toFixed(2)}`}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'}}>
                                <Icon
                                    icon="mdi:finance"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: googleCogs },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: metaCogs }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>Rs.{Number(item.value).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
           
           
            {/* Card 5: Total Orders (with Google, Meta & Organic breakdown) */}
            <div className="col">
                <div className="card shadow-none border h-100 position-relative"
                     style={{overflow: 'visible', color: '#222'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Total Orders</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{totalQuantity}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'}}>
                                <Icon
                                    icon="mdi:package-variant-closed"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: googleQuantity },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: metaQuantity },
                                { label: 'Organic', icon: <Icon icon="mdi:leaf" style={{ fontSize: 20, minWidth: 40, color: '#388e3c' }} />, value: organicQuantity }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
            {/* Card 6: Gross ROAS (with Google & Meta breakdown) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-11 h-100 position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Gross ROAS</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{grossRoas.total.toFixed(2)}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'}}>
                                <Icon
                                    icon="mdi:chart-bar"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: grossRoas.google },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: grossRoas.meta }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>{item.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
            {/* Card 7: Net ROAS (with Google & Meta breakdown) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-12 h-100 position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">Net ROAS</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{netRoas.total.toFixed(2)}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'}}>
                                <Icon
                                    icon="mdi:chart-line"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: netRoas.google },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: netRoas.meta }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>{item.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
            {/* Card 8: BE ROAS (with Google & Meta breakdown) */}
            <div className="col">
                <div className="card shadow-none border bg-gradient-start-13 h-100 position-relative" style={{overflow: 'visible'}}>
                    <div className="card-body p-20">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div>
                                <p className="fw-medium text-primary-light mb-1">BE ROAS</p>
                                <h6 className="mb-0 display-6 fw-bold" style={{letterSpacing: '1px'}}>{beRoas.total.toFixed(2)}</h6>
                            </div>
                            <div className="w-50-px h-50-px rounded-circle d-flex justify-content-center align-items-center shadow-lg"
                                 style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                                <Icon
                                    icon="mdi:chart-areaspline"
                                    className="text-white text-2xl mb-0"
                                />
                            </div>
                        </div>
                        <div className="my-3" style={{height: '1px', background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)', opacity: 0.4}}></div>
                        <div className="d-flex flex-column align-items-center mt-2" style={{ gap: 4, marginTop: 8 }}>
                            {sortBreakdown([
                                { label: 'Google', icon: <Icon icon="logos:google-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: beRoas.google },
                                { label: 'Meta', icon: <Icon icon="logos:meta-icon" style={{ fontSize: 20, minWidth: 40 }} />, value: beRoas.meta }
                            ]).map((item, idx) => (
                                <div className="d-flex align-items-center" style={{ gap: 6, minWidth: 50 }} key={item.label}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600, fontSize: 14, color: '#222', minWidth: 78 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#1976d2', minWidth: 90 }}>{item.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* card end */}
            </div>
            
        </div>
    )
}

export default UnitCountOne