// CompanyListUtils.js
import * as d3 from "d3";
import * as XLSX from "xlsx";

export const headers = [
  {
    group: "Valuation Metrics",
    columns: [
      "Market Cap",
      "Enterprise Value",
      "P/E Ratio (Trailing)",
      "P/E Ratio (Forward)",
      "Price to Sales",
      "Price to Book",
      "PEG Ratio",
    ],
  },
  {
    group: "Profitability Metrics",
    columns: [
      "Revenue",
      "Revenue Growth",
      "Gross Margin",
      "EBITDA Margin",
      "Operating Margin",
      "EBITDA",
      "Earnings Growth",
    ],
  },
  {
    group: "Earnings and Dividends",
    columns: ["Trailing EPS", "Forward EPS", "Dividend Rate", "Dividend Yield"],
  },
  {
    group: "Financial Health Metrics",
    columns: [
      "Total Debt",
      "Debt to Equity Ratio",
      "Quick Ratio",
      "Current Ratio",
      "Free Cash Flow",
      "Operating Cash Flow",
    ],
  },
  {
    group: "Company Information",
    columns: ["Full Time Employees", "IR Website"],
  },
];

export const columnKeyMap = {
  "Market Cap": "market_cap",
  "Enterprise Value": "enterprise_value",
  "P/E Ratio (Trailing)": "trailing_pe",
  "P/E Ratio (Forward)": "forward_pe",
  "Price to Sales": "price_to_sales_trailing12mo",
  "Price to Book": "price_to_book",
  "PEG Ratio": "peg_ratio",
  Revenue: "revenue",
  "Revenue Growth": "revenue_growth",
  "Gross Margin": "gross_margin",
  "EBITDA Margin": "ebitda_margin",
  "Operating Margin": "operating_margin",
  EBITDA: "ebitda",
  "Earnings Growth": "earnings_growth",
  "Trailing EPS": "trailing_eps",
  "Forward EPS": "forward_eps",
  "Dividend Rate": "forward_dividend",
  "Dividend Yield": "forward_dividend_yield",
  "Total Debt": "total_debt",
  "Debt to Equity Ratio": "debt_to_equity",
  "Quick Ratio": "quick_ratio",
  "Current Ratio": "current_ratio",
  "Free Cash Flow": "free_cash_flow",
  "Operating Cash Flow": "operating_cashflow",
  "Full Time Employees": "full_time_employees",
  "IR Website": "ir_website_link",
};

export const formatValue = (key, value) => {
  if (value == null) return "N/A";

  const floatValue = parseFloat(value);

  if (
    key.includes("margin") ||
    key.includes("growth") ||
    key === "forward_dividend_yield"
  ) {
    return `${(floatValue * 100).toFixed(2)}%`;
  }

  if (
    key.includes("revenue") ||
    key.includes("market_cap") ||
    key.includes("enterprise_value") ||
    key.includes("ebitda") ||
    key.includes("total_debt") ||
    key.includes("free_cash_flow") ||
    key.includes("operating_cashflow")
  ) {
    return formatCurrency(floatValue);
  }

  if (key.includes("eps")) {
    return "$" + floatValue.toString();
  }

  if (key.includes("price_to")) {
    return floatValue.toFixed(2).toString() + "x";
  }

  return floatValue.toFixed(2);
};

export const generateCSVData = (companies) => {
  const flatColumns = headers.flatMap((header) => header.columns);
  const metrics = calculateMetrics(companies);

  const csvData = companies.map((company) => {
    const row = {
      "Company Name": company.name,
      "Company Description": company.company_description,
    };
    flatColumns.forEach((col) => {
      if (col === "IR Website") {
        row[col] = company[columnKeyMap[col]] || "N/A";
      } else {
        row[col] = formatValue(columnKeyMap[col], company[columnKeyMap[col]]);
      }
    });
    return row;
  });

  // Add metrics to CSV data
  ["mean", "low", "high", "median"].forEach((metric) => {
    const metricRow = {
      "Company Name": metric.charAt(0).toUpperCase() + metric.slice(1),
    };
    flatColumns.forEach((col) => {
      metricRow[col] = metrics[col]
        ? formatValue(columnKeyMap[col], metrics[col][metric])
        : "N/A";
    });
    csvData.push(metricRow);
  });

  return csvData;
};

const calculateMetrics = (companies) => {
  const flatColumns = headers.flatMap((header) => header.columns);
  const stats = flatColumns.reduce((acc, col) => {
    const values = companies
      .map((company) => parseFloat(company[columnKeyMap[col]]))
      .filter((val) => !isNaN(val));
    if (values.length > 0) {
      acc[col] = {
        low: d3.min(values),
        high: d3.max(values),
        median: d3.median(values),
        mean: d3.mean(values),
      };
    } else {
      acc[col] = {
        low: "N/A",
        high: "N/A",
        median: "N/A",
        mean: "N/A",
      };
    }
    return acc;
  }, {});
  return stats;
};

export const exportToXLSX = (companies) => {
  const flatColumns = headers.flatMap((header) => header.columns);
  const metrics = calculateMetrics(companies);

  const wsData = [
    ["Company Name", "Company Description", ...flatColumns],
    ...companies.map((company) => {
      return [
        company.name,
        company.company_description,
        ...flatColumns.map((col) =>
          col === "IR Website"
            ? company[columnKeyMap[col]] || "N/A"
            : formatValue(columnKeyMap[col], company[columnKeyMap[col]])
        ),
      ];
    }),
  ];

  // Add metrics to XLSX data
  ["mean", "low", "high", "median"].forEach((metric) => {
    const metricRow = [
      metric.charAt(0).toUpperCase() + metric.slice(1),
      "",
      ...flatColumns.map((col) =>
        metrics[col]
          ? formatValue(columnKeyMap[col], metrics[col][metric])
          : "N/A"
      ),
    ];
    wsData.push(metricRow);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Companies");
  XLSX.writeFile(wb, "comps.xlsx");
};

export const formatCurrency = (number) => {
  if (number == null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};
