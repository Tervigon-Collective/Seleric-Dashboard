const axios = require('axios');
const ShopifyOrderService = require('../services/ShopifyOrderService');

// --- Helper Functions ---
async function fetchTotalSales(startDate, endDate) {
    const shopifyDomain = process.env.SHOPIFY_STORE;
    const shopifyToken = process.env.SHOPIFY_PASSWORD;
    const metaSources = ['facebook', 'instagram', 'meta', 'fb', 'ig', '{{site_source_name}}'];
    let metaSales = 0;
    let googleSales = 0;
    let organicSales = 0;
    let totalSales = 0;
    let hasNextPage = true;
    let endCursor = null;
    const toISOStringWithTZ = (date, endOfDay = false) => `${date}T${endOfDay ? '23:59:59' : '00:00:00'}+05:30`;
    while (hasNextPage) {
        const query = `query {\n  orders(\n    first: 50,\n    after: ${endCursor ? `\"${endCursor}\"` : 'null'},\n    reverse: true,\n    query: \"created_at:>='${toISOStringWithTZ(startDate)}' AND created_at<'${toISOStringWithTZ(endDate, true)}'\"\n  ) {\n    pageInfo { hasNextPage endCursor }\n    edges {\n      node {\n        id\n        name\n        createdAt\n        customerJourney {\n          moments {\n            ... on CustomerVisit {\n              utmParameters {\n                source\n                medium\n                campaign\n                content\n                term\n              }\n            }\n          }\n        }\n        lineItems(first: 10) {\n          edges {\n            node {\n              sku\n              quantity\n              originalUnitPriceSet { shopMoney { amount currencyCode } }\n              discountedUnitPriceSet: discountedUnitPriceAfterAllDiscountsSet { shopMoney { amount currencyCode } }\n              variant {\n                id\n                sku\n                inventoryItem { unitCost { amount currencyCode } }\n                selectedOptions { name value }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}`;
        const response = await axios.post(
            `https://${shopifyDomain}/admin/api/2023-10/graphql.json`,
            { query, variables: {} },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': shopifyToken
                }
            }
        );
        const orders = response.data.data.orders.edges;
        const pageInfo = response.data.data.orders.pageInfo;
        hasNextPage = pageInfo.hasNextPage;
        endCursor = pageInfo.endCursor;
        for (const orderEdge of orders) {
            const order = orderEdge.node;
            let utmSource = null;
            if (order.customerJourney && order.customerJourney.moments) {
                for (const moment of order.customerJourney.moments) {
                    if (moment.utmParameters && moment.utmParameters.source) {
                        utmSource = moment.utmParameters.source.toLowerCase();
                        break;
                    }
                }
            }
            for (const lineItemEdge of order.lineItems.edges) {
                const lineItem = lineItemEdge.node;
                const discountedAmount = Number(lineItem.discountedUnitPriceSet?.shopMoney?.amount) || 0;
                const quantity = Number(lineItem.quantity) || 1;
                const sales = discountedAmount * quantity;
                totalSales += sales;
                if (utmSource && metaSources.includes(utmSource)) {
                    metaSales += sales;
                } else if (utmSource === 'google') {
                    googleSales += sales;
                } else {
                    organicSales += sales;
                }
            }
        }
    }
    return { metaSales, googleSales, organicSales, totalSales };
}

async function fetchTotalCogs(startDate, endDate) {
    const shopifyDomain = process.env.SHOPIFY_STORE;
    const shopifyToken = process.env.SHOPIFY_PASSWORD;
    const metaSources = ['facebook', 'instagram', 'meta', 'fb', 'ig', '{{site_source_name}}'];
    let metaCogs = 0;
    let googleCogs = 0;
    let totalCogs = 0;
    let hasNextPage = true;
    let endCursor = null;
    const toISOStringWithTZ = (date, endOfDay = false) => `${date}T${endOfDay ? '23:59:59' : '00:00:00'}+05:30`;
    while (hasNextPage) {
        const query = `query {\n  orders(\n    first: 50,\n    after: ${endCursor ? `\"${endCursor}\"` : 'null'},\n    reverse: true,\n    query: \"created_at:>='${toISOStringWithTZ(startDate)}' AND created_at<'${toISOStringWithTZ(endDate, true)}'\"\n  ) {\n    pageInfo { hasNextPage endCursor }\n    edges {\n      node {\n        id\n        name\n        createdAt\n        customerJourney {\n          moments {\n            ... on CustomerVisit {\n              utmParameters {\n                source\n                medium\n                campaign\n                content\n                term\n              }\n            }\n          }\n        }\n        lineItems(first: 10) {\n          edges {\n            node {\n              sku\n              quantity\n              originalUnitPriceSet { shopMoney { amount currencyCode } }\n              discountedUnitPriceSet: discountedUnitPriceAfterAllDiscountsSet { shopMoney { amount currencyCode } }\n              variant {\n                id\n                sku\n                inventoryItem { unitCost { amount currencyCode } }\n                selectedOptions { name value }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}`;
        const response = await axios.post(
            `https://${shopifyDomain}/admin/api/2023-10/graphql.json`,
            { query, variables: {} },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': shopifyToken
                }
            }
        );
        const orders = response.data.data.orders.edges;
        const pageInfo = response.data.data.orders.pageInfo;
        hasNextPage = pageInfo.hasNextPage;
        endCursor = pageInfo.endCursor;
        for (const orderEdge of orders) {
            const order = orderEdge.node;
            let utmSource = null;
            if (order.customerJourney && order.customerJourney.moments) {
                for (const moment of order.customerJourney.moments) {
                    if (moment.utmParameters && moment.utmParameters.source) {
                        utmSource = moment.utmParameters.source.toLowerCase();
                        break;
                    }
                }
            }
            for (const lineItemEdge of order.lineItems.edges) {
                const lineItem = lineItemEdge.node;
                const unitCost = Number(lineItem.variant?.inventoryItem?.unitCost?.amount) || 0;
                const quantity = Number(lineItem.quantity) || 1;
                totalCogs += unitCost * quantity;
                if (utmSource && metaSources.includes(utmSource)) {
                    metaCogs += unitCost * quantity;
                } else if (utmSource === 'google') {
                    googleCogs += unitCost * quantity;
                }
            }
        }
    }
    return { metaCogs, googleCogs, totalCogs };
}

async function fetchAllAdSpend(startDate, endDate) {
    // Fetch Google Ads access token dynamically
    const getGoogleAccessTokenInternal = async () => {
        const params = new URLSearchParams();
        params.append('client_id', process.env.GOOGLE_CLIENT_ID);
        params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', process.env.GOOGLE_REFRESH_TOKEN);
        const response = await axios.post(
            'https://oauth2.googleapis.com/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    };
    const googleAccessToken = await getGoogleAccessTokenInternal();
    // Google Ads query for date range
    const googleQuery = `SELECT metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'`;
    // Google Ads API call
    const googleAdsPromise = axios.post(
        `https://googleads.googleapis.com/v20/customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:search`,
        {
            query: googleQuery
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
                'login-customer-id': process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
                'Authorization': `Bearer ${googleAccessToken}`
            }
        }
    ).then(response => {
        let costMicros = 0;
        const data = response.data;
        if (data && data.results && data.results.length > 0) {
            costMicros = data.results[0].metrics?.costMicros || data.results[0].metrics?.cost_micros || 0;
        }
        return Number(costMicros) / 1000000;
    });
    // Facebook API call for date range
    const facebookUrl = `https://graph.facebook.com/v19.0/act_${process.env.FB_AD_ACCOUNT_ID}/insights?fields=spend&level=account&time_range=%7B%22since%22%3A%22${startDate}%22%2C%22until%22%3A%22${endDate}%22%7D&access_token=${process.env.FB_ACCESS_TOKEN}`;
    const facebookPromise = axios.get(facebookUrl).then(response => {
        let spend = 0;
        const data = response.data;
        if (data && data.data && data.data.length > 0) {
            spend = Number(data.data[0].spend) || 0;
        }
        return spend;
    });
    // Wait for both API calls
    const [googleSpend, facebookSpend] = await Promise.all([googleAdsPromise, facebookPromise]);
    const totalSpend = googleSpend + facebookSpend;
    return { googleSpend, facebookSpend, totalSpend };
}

// Helper to get date range for a timeframe
function getDateRange(timeframe, req) {
    const today = new Date(new Date().toISOString().split("T")[0]);
    let start, end;
    switch (timeframe) {
        case 'today':
            start = today;
            end = new Date(today);
            end.setDate(today.getDate() + 1);
            break;
        case 'week':
            start = new Date(today);
            start.setDate(today.getDate() - today.getDay() + 1);
            end = new Date(start);
            end.setDate(start.getDate() + 7); // exclusive
            break;
        case 'month':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 1); // exclusive
            break;
        case 'year':
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear() + 1, 0, 1); // exclusive
            break;
        case 'custom':
            // expects req.query.startDate and req.query.endDate (inclusive)
            console.log(req.query.startDate , req.query.endDate)
            start = new Date(req.query.startDate);
            end = new Date(req.query.endDate);
            end.setDate(end.getDate()); // make end exclusive
            console.log(start , end)
            break;
        default:
            start = today;
            end = new Date(today);
            end.setDate(today.getDate() + 1);
    }
    const pad = n => n.toString().padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return { startDate: fmt(start), endDate: fmt(end) };
}

// GET /orders/:timeframe
// If timeframe is 'custom', expects req.query.startDate and req.query.endDate (YYYY-MM-DD)
const getOrdersByTimeframe = async (req, res) => {
    try {
        const { timeframe } = req.params;
        const { startDate, endDate } = getDateRange(timeframe, req);
        const stats = await ShopifyOrderService.getOrderStats(startDate, endDate);
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch order stats', details: error.message });
    }
};

// --- Controllers ---
const getTotalSales = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const today = new Date().toISOString().slice(0, 10);
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;
        const result = await fetchTotalSales(startDate, endDate);
        res.json(result);
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: 'Failed to fetch Sales', details: error.message });
    }
};

const getTotalCogs = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const today = new Date().toISOString().slice(0, 10);
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;
        const result = await fetchTotalCogs(startDate, endDate);
        res.json(result);
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: 'Failed to fetch COGS', details: error.message });
    }
};

const getAllAdSpend = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const today = new Date().toISOString().slice(0, 10);
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;
        const result = await fetchAllAdSpend(startDate, endDate);
        res.json(result);
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: 'Failed to fetch Ad Spend', details: error.message });
    }
};

const getNetProfit = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const today = new Date().toISOString().slice(0, 10);
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;
        const salesRes = await fetchTotalSales(startDate, endDate);
        const cogsRes = await fetchTotalCogs(startDate, endDate);
        const adSpendRes = await fetchAllAdSpend(startDate, endDate);
        const metaNetProfit = (salesRes.metaSales || 0) - (cogsRes.metaCogs || 0) - (adSpendRes.facebookSpend || 0);
        const googleNetProfit = (salesRes.googleSales || 0) - (cogsRes.googleCogs || 0) - (adSpendRes.googleSpend || 0);
        const totalNetProfit = (salesRes.totalSales || 0) - (cogsRes.totalCogs || 0) - (adSpendRes.totalSpend || 0);
        res.json({
            metaNetProfit,
            googleNetProfit,
            totalNetProfit
        });
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: 'Failed to calculate net profit', details: error.message });
    }
};

const getOrderCount = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const today = new Date().toISOString().slice(0, 10);
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;

        const shopifyDomain = process.env.SHOPIFY_STORE;
        const shopifyToken = process.env.SHOPIFY_PASSWORD;
        let orderCount = 0;
        let totalQuantity = 0;
        let metaQuantity = 0;
        let googleQuantity = 0;
        let organicQuantity = 0;
        let hasNextPage = true;
        let endCursor = null;
        const metaSources = ['facebook', 'instagram', 'meta', 'fb', 'ig', '{{site_source_name}}'];
        const toISOStringWithTZ = (date, endOfDay = false) => `${date}T${endOfDay ? '23:59:59' : '00:00:00'}+05:30`;

        while (hasNextPage) {
            const query = `query {\n  orders(\n    first: 50,\n    after: ${endCursor ? `\"${endCursor}\"` : 'null'},\n    reverse: true,\n    query: \"created_at:>='${toISOStringWithTZ(startDate)}' AND created_at<'${toISOStringWithTZ(endDate, true)}'\"\n  ) {\n    pageInfo { hasNextPage endCursor }\n    edges {\n      node {\n        id\n        customerJourney {\n          moments {\n            ... on CustomerVisit {\n              utmParameters {\n                source\n              }\n            }\n          }\n        }\n        lineItems(first: 100) {\n          edges {\n            node {\n              quantity\n            }\n          }\n        }\n      }\n    }\n  }\n}`;

            const response = await axios.post(
                `https://${shopifyDomain}/admin/api/2023-10/graphql.json`,
                { query, variables: {} },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': shopifyToken
                    }
                }
            );
            const orders = response.data.data.orders.edges;
            const pageInfo = response.data.data.orders.pageInfo;
            hasNextPage = pageInfo.hasNextPage;
            endCursor = pageInfo.endCursor;

            orderCount += orders.length;
            for (const orderEdge of orders) {
                const order = orderEdge.node;
                let utmSource = null;
                if (order.customerJourney && order.customerJourney.moments) {
                    for (const moment of order.customerJourney.moments) {
                        if (moment.utmParameters && moment.utmParameters.source) {
                            utmSource = moment.utmParameters.source.toLowerCase();
                            break;
                        }
                    }
                }
                for (const lineItemEdge of order.lineItems.edges) {
                    const lineItem = lineItemEdge.node;
                    const quantity = Number(lineItem.quantity) || 0;
                    totalQuantity += quantity;
                    if (utmSource && metaSources.includes(utmSource)) {
                        metaQuantity += quantity;
                    } else if (utmSource === 'google') {
                        googleQuantity += quantity;
                    } else {
                        organicQuantity += quantity;
                    }
                }
            }
        }

        res.json({ orderCount, totalQuantity, metaQuantity, googleQuantity, organicQuantity });
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: 'Failed to fetch order count', details: error.message });
    }
};

const getRoas = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        const today = new Date().toISOString().slice(0, 10);
        if (!startDate) startDate = today;
        if (!endDate) endDate = today;

        // Fetch all required values
        const salesRes = await fetchTotalSales(startDate, endDate);
        const cogsRes = await fetchTotalCogs(startDate, endDate);
        const adSpendRes = await fetchAllAdSpend(startDate, endDate);

        // Meta
        const metaRevenue = salesRes.metaSales || 0;
        const metaCogs = cogsRes.metaCogs || 0;
        const metaAdSpend = adSpendRes.facebookSpend || 0;
        // Google
        const googleRevenue = salesRes.googleSales || 0;
        const googleCogs = cogsRes.googleCogs || 0;
        const googleAdSpend = adSpendRes.googleSpend || 0;
        // Total
        const totalRevenue = salesRes.totalSales || 0;
        const totalCogs = cogsRes.totalCogs || 0;
        const totalAdSpend = adSpendRes.totalSpend || 0;

        // Helper for safe division
        const safeDiv = (num, denom) => denom !== 0 ? num / denom : null;

        // Meta ROAS
        const metaGrossRoas = safeDiv(metaRevenue, metaAdSpend);
        const metaNetRoas = safeDiv(metaRevenue - metaCogs, metaAdSpend);
        const metaBeRoas = safeDiv(metaCogs + metaAdSpend, metaAdSpend);
        // Google ROAS
        const googleGrossRoas = safeDiv(googleRevenue, googleAdSpend);
        const googleNetRoas = safeDiv(googleRevenue - googleCogs, googleAdSpend);
        const googleBeRoas = safeDiv(googleCogs + googleAdSpend, googleAdSpend);
        // Total ROAS
        const totalGrossRoas = safeDiv(totalRevenue, totalAdSpend);
        const totalNetRoas = safeDiv(totalRevenue - totalCogs, totalAdSpend);
        const totalBeRoas = safeDiv(totalCogs + totalAdSpend, totalAdSpend);

        res.json({
            meta: {
                grossRoas: metaGrossRoas,
                netRoas: metaNetRoas,
                beRoas: metaBeRoas
            },
            google: {
                grossRoas: googleGrossRoas,
                netRoas: googleNetRoas,
                beRoas: googleBeRoas
            },
            total: {
                grossRoas: totalGrossRoas,
                netRoas: totalNetRoas,
                beRoas: totalBeRoas
            }
        });
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: 'Failed to calculate ROAS', details: error.message });
    }
};

module.exports = { getAllAdSpend, getTotalCogs, getNetProfit, getTotalSales, getOrderCount, getRoas, getOrdersByTimeframe };