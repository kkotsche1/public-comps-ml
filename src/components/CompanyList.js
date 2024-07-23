import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Button,
  TableSortLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatCurrency } from "../utils/utils";
import { alpha } from "@mui/material/styles";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import "./CompanyList.css"; // Import the CSS file

const CompanyList = ({ companies, userSelectedCompany }) => {
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");

  const handleOpen = (company) => {
    setSelectedCompany(company);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCompany(null);
  };

  const headers = [
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
      columns: [
        "Trailing EPS",
        "Forward EPS",
        "Dividend Rate",
        "Dividend Yield",
      ],
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

  const columnKeyMap = {
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedCompanies = React.useMemo(() => {
    if (!orderBy) return companies;
    return [...companies].sort((a, b) => {
      const aValue = a[columnKeyMap[orderBy]] || 0;
      const bValue = b[columnKeyMap[orderBy]] || 0;
      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
  }, [companies, order, orderBy]);

  const finalCompaniesList = React.useMemo(() => {
    if (userSelectedCompany) {
      return sortedCompanies.filter(
        (company) => company.ticker !== userSelectedCompany.ticker
      );
    }
    return sortedCompanies;
  }, [sortedCompanies, userSelectedCompany]);

  const formatValue = (key, value) => {
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

  const renderTable = (companies) => {
    const flatColumns = headers.flatMap((header) => header.columns);
    return (
      <TableContainer component={Paper} className="table-container">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={1}
                align="center"
                className="sticky-header sticky-top-left"
              ></TableCell>
              {headers.map((header, idx) => (
                <TableCell
                  key={idx}
                  colSpan={header.columns.length}
                  align="center"
                  className="sticky-header"
                >
                  {header.group}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell
                align="center"
                className="sticky-subheader sticky-top-left"
              >
                Company Name
              </TableCell>
              {flatColumns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  className="sticky-subheader"
                >
                  <TableSortLabel
                    active={orderBy === col}
                    direction={orderBy === col ? order : "asc"}
                    onClick={() => handleRequestSort(col)}
                  >
                    {col}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
            {userSelectedCompany && (
              <TableRow className="fixed-row green-cell">
                <TableCell align="center" className="sticky-left green-cell">
                  <Button onClick={() => handleOpen(userSelectedCompany)}>
                    {userSelectedCompany?.name}
                  </Button>
                </TableCell>
                {flatColumns.map((col, colIdx) => (
                  <TableCell key={colIdx} align="center" className="green-cell">
                    {columnKeyMap[col] === "ir_website_link" &&
                    userSelectedCompany?.[columnKeyMap[col]] ? (
                      <a
                        href={userSelectedCompany[columnKeyMap[col]]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        IR Website
                      </a>
                    ) : (
                      formatValue(
                        columnKeyMap[col],
                        userSelectedCompany?.[columnKeyMap[col]]
                      )
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {companies.map((company, idx) => (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor:
                    idx % 2 === 0 ? "white" : alpha("#add8e6", 0.3),
                }}
              >
                <TableCell align="center" className="sticky-left gray-cell">
                  <Button onClick={() => handleOpen(company)}>
                    {company.name}
                  </Button>
                </TableCell>
                {flatColumns.map((col, colIdx) => (
                  <TableCell key={colIdx} align="center">
                    {columnKeyMap[col] === "ir_website_link" &&
                    company[columnKeyMap[col]] ? (
                      <a
                        href={company[columnKeyMap[col]]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        IR Website
                      </a>
                    ) : (
                      formatValue(columnKeyMap[col], company[columnKeyMap[col]])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderModal = () => (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        {selectedCompany && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" gutterBottom>
                {selectedCompany.name} ({selectedCompany.exchange}:{" "}
                {selectedCompany.ticker})
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedCompany.company_description}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );

  const generateCSVData = () => {
    const flatColumns = headers.flatMap((header) => header.columns);
    const csvData = companies.map((company) => {
      const row = { "Company Name": company.name };
      flatColumns.forEach((col) => {
        row[col] = formatValue(columnKeyMap[col], company[columnKeyMap[col]]);
      });
      return row;
    });
    return csvData;
  };

  const exportToXLSX = () => {
    const flatColumns = headers.flatMap((header) => header.columns);
    const wsData = [
      ["Company Name", ...flatColumns],
      ...companies.map((company) => {
        return [
          company.name,
          ...flatColumns.map((col) =>
            formatValue(columnKeyMap[col], company[columnKeyMap[col]])
          ),
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(wb, "comps.xlsx");
  };

  return (
    <Container>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={exportToXLSX}
          style={{ marginRight: "10px" }}
        >
          Export as XLSX
        </Button>
        <CSVLink
          data={generateCSVData()}
          filename={"comps.csv"}
          className="btn btn-primary"
        >
          <Button variant="outlined" color="primary">
            Export as CSV
          </Button>
        </CSVLink>
      </Box>
      {companies.length === 0 ? (
        <Typography variant="body1" align="center">
          No results found.
        </Typography>
      ) : (
        renderTable(finalCompaniesList)
      )}
      {renderModal()}
    </Container>
  );
};

export default CompanyList;
