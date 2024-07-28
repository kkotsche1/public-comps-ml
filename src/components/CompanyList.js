import React, { useState, useEffect, useRef } from "react";
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
  Button,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CSVLink } from "react-csv";
import {
  headers,
  columnKeyMap,
  formatValue,
  generateCSVData,
  exportToXLSX,
} from "../utils/CompanyListUtils";
import "./CompanyList.css"; // Import the CSS file
import * as d3 from "d3";

const CompanyList = ({ companies: initialCompanies, userSelectedCompany }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [companies, setCompanies] = useState(initialCompanies);
  const [metrics, setMetrics] = useState({});

  const topTableRef = useRef(null);
  const bottomTableRef = useRef(null);

  const syncScroll = (source, target) => {
    if (target.current) {
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  useEffect(() => {
    const handleTopScroll = () => syncScroll(topTableRef, bottomTableRef);
    const handleBottomScroll = () => syncScroll(bottomTableRef, topTableRef);

    if (topTableRef.current) {
      topTableRef.current.addEventListener("scroll", handleTopScroll);
    }
    if (bottomTableRef.current) {
      bottomTableRef.current.addEventListener("scroll", handleBottomScroll);
    }

    return () => {
      if (topTableRef.current) {
        topTableRef.current.removeEventListener("scroll", handleTopScroll);
      }
      if (bottomTableRef.current) {
        bottomTableRef.current.removeEventListener(
          "scroll",
          handleBottomScroll
        );
      }
    };
  }, []);

  useEffect(() => {
    const calculateMetrics = () => {
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
      setMetrics(stats);
    };
    calculateMetrics();
  }, [companies]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRemoveCompany = (ticker) => {
    setCompanies(companies.filter((company) => company.ticker !== ticker));
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

  const renderTable = (companies) => {
    const flatColumns = headers.flatMap((header) => header.columns);
    return (
      <TableContainer
        component={Paper}
        className="table-container"
        ref={topTableRef}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={1}
                align="center"
                className="sticky-header sticky-top-left"
                sx={{
                  minWidth: "200px",
                  position: "sticky",
                  top: 0,
                  zIndex: 3,
                }} // Ensure the same width as the left header in the bottom chart
              ></TableCell>
              {headers.map((header, idx) => (
                <TableCell
                  key={idx}
                  colSpan={header.columns.length}
                  align="center"
                  className="sticky-header"
                  sx={{ position: "sticky", top: 0, zIndex: 3 }}
                >
                  {header.group}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell
                align="center"
                className="sticky-subheader sticky-top-left"
                sx={{
                  minWidth: "200px",
                  position: "sticky",
                  top: 36,
                  zIndex: 3,
                }} // Ensure the same width as the left header in the bottom chart
              >
                Company Name
              </TableCell>
              {flatColumns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  className="sticky-subheader"
                  sx={{
                    minWidth: "150px",
                    position: "sticky",
                    top: 36,
                    zIndex: 3,
                  }} // Ensure all cells have the same width
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
          </TableHead>
          {userSelectedCompany && (
            <TableHead>
              <TableRow
                className="fixed-row green-cell"
                sx={{
                  position: "sticky",
                  top: 115, // Adjust this value based on your header height
                  zIndex: 2, // Ensure it stays above other rows
                  backgroundColor: "#dff0d8", // Adjust as needed for visibility
                }}
              >
                <TableCell
                  align="center"
                  className="sticky-left green-cell"
                  sx={{ minWidth: "200px" }}
                >
                  <Tooltip
                    title={userSelectedCompany.company_description}
                    sx={{ maxWidth: "600px" }} // Adjust this value to increase the width
                  >
                    <Box>
                      <Button>{userSelectedCompany?.name}</Button>
                    </Box>
                  </Tooltip>
                </TableCell>
                {flatColumns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    align="center"
                    className="green-cell"
                    sx={{ minWidth: "150px" }}
                  >
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
            </TableHead>
          )}
          <TableBody>
            {companies.map((company, idx) => (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor:
                    idx % 2 === 0 ? "white" : alpha("#add8e6", 0.3),
                }}
              >
                <TableCell
                  align="center"
                  className="sticky-left gray-cell"
                  sx={{ minWidth: "200px" }}
                >
                  <Tooltip
                    title={company.company_description}
                    sx={{ maxWidth: "600px" }} // Adjust this value to increase the width
                  >
                    <Box>
                      <Button>{company.name}</Button>
                      {userSelectedCompany?.ticker !== company.ticker && (
                        <Typography
                          variant="caption"
                          sx={{
                            cursor: "pointer",
                            textDecoration: "underline",
                            color: "white",
                            fontSize: "0.8rem",
                            display: "block",
                            mt: -0.5, // Reduce vertical spacing
                          }}
                          onClick={() => handleRemoveCompany(company.ticker)}
                        >
                          remove
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>
                {flatColumns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    align="center"
                    sx={{ minWidth: "150px" }}
                  >
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

  const renderMetricsTable = () => {
    const flatColumns = headers.flatMap((header) => header.columns);
    const metricOrder = ["mean", "low", "high", "median"];
    const metricLabels = {
      mean: "Average",
      low: "Low",
      high: "High",
      median: "Median",
    };

    return (
      <TableContainer
        component={Paper}
        className="table-container"
        ref={bottomTableRef}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={1}
                align="center"
                className="sticky-header sticky-top-left"
                sx={{ minWidth: "200px" }} // Ensure the same width as the company name cells in the top chart
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
                sx={{ minWidth: "200px" }} // Ensure the same width as the company name cells in the top chart
              >
                Metric
              </TableCell>
              {flatColumns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  className="sticky-subheader"
                  sx={{ minWidth: "150px" }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {metricOrder.map((metric, idx) => (
              <TableRow key={idx}>
                <TableCell
                  align="center"
                  className="sticky-left gray-cell"
                  sx={{ minWidth: "200px", fontWeight: "bold" }} // Bold formatting for metric column elements
                >
                  {metricLabels[metric]}
                </TableCell>
                {flatColumns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    align="center"
                    sx={{ minWidth: "150px" }} // Regular formatting for other elements
                  >
                    {metrics[col]
                      ? formatValue(columnKeyMap[col], metrics[col][metric])
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => exportToXLSX(companies)}
          style={{ marginRight: "10px" }}
        >
          Export as XLSX
        </Button>
        <CSVLink
          data={generateCSVData(companies)}
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
        <>
          {renderTable(finalCompaniesList)}
          <Box mt={4}>{renderMetricsTable()}</Box>
        </>
      )}
    </Container>
  );
};

export default CompanyList;
