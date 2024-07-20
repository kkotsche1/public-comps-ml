import React from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Box,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatCurrency } from "../utils/utils";

const CompanyList = ({ companies }) => {
  const renderCard = (title, data) => {
    return (
      <Grid item xs={12} sm={6}>
        <Card sx={{ mb: 2, height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {data.map((item, index) =>
              item.value ? (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  <strong>{item.label}:</strong>{" "}
                  {item.label.includes("Revenue") ||
                  item.label.includes("Market Capitalization") ||
                  item.label.includes("Enterprise Value") ||
                  item.label.includes("EBITDA") ||
                  item.label.includes("Total Debt") ||
                  item.label.includes("Free Cash Flow") ||
                  item.label.includes("Operating Cash Flow")
                    ? formatCurrency(item.value)
                    : item.value}
                </Typography>
              ) : null
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container>
      {companies.length === 0 ? (
        <Typography variant="body1" align="center">
          No results found.
        </Typography>
      ) : (
        companies.map((company, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  {company.name} ({company.exchange}: {company.ticker})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {company.company_description}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {renderCard("Valuation Metrics", [
                    {
                      label: "Market Capitalization",
                      value: company.market_cap,
                    },
                    {
                      label: "Enterprise Value",
                      value: company.enterprise_value,
                    },
                    {
                      label: "Price to Earnings Ratio (Trailing)",
                      value: company.trailing_pe,
                    },
                    {
                      label: "Price to Earnings Ratio (Forward)",
                      value: company.forward_pe,
                    },
                    {
                      label: "Price to Sales Ratio (Trailing 12 Months)",
                      value: company.price_to_sales_trailing12mo,
                    },
                    {
                      label: "Price to Book Ratio",
                      value: company.price_to_book,
                    },
                    { label: "PEG Ratio", value: company.peg_ratio },
                    {
                      label: "Trailing PEG Ratio",
                      value: company.trailing_peg_ratio,
                    },
                  ])}
                  {renderCard("Profitability Metrics", [
                    { label: "Revenue", value: company.revenue },
                    { label: "Revenue Growth", value: company.revenue_growth },
                    { label: "Gross Margin", value: company.gross_margin },
                    { label: "EBITDA Margin", value: company.ebitda_margin },
                    {
                      label: "Operating Margin",
                      value: company.operating_margin,
                    },
                    { label: "EBITDA", value: company.ebitda },
                    {
                      label: "Earnings Growth",
                      value: company.earnings_growth,
                    },
                  ])}
                  {renderCard("Earnings and Dividends", [
                    {
                      label: "Earnings Per Share (Trailing)",
                      value: company.trailing_eps,
                    },
                    {
                      label: "Earnings Per Share (Forward)",
                      value: company.forward_eps,
                    },
                    {
                      label: "Forward Dividend Rate",
                      value: company.forward_dividend,
                    },
                    {
                      label: "Forward Dividend Yield",
                      value: company.forward_dividend_yield
                        ? `${company.forward_dividend_yield}%`
                        : null,
                    },
                  ])}
                  {renderCard("Financial Health Metrics", [
                    { label: "Total Debt", value: company.total_debt },
                    {
                      label: "Debt to Equity Ratio",
                      value: company.debt_to_equity,
                    },
                    { label: "Quick Ratio", value: company.quick_ratio },
                    { label: "Current Ratio", value: company.current_ratio },
                    { label: "Free Cash Flow", value: company.free_cash_flow },
                    {
                      label: "Operating Cash Flow",
                      value: company.operating_cashflow,
                    },
                  ])}
                  {renderCard("Company Information", [
                    {
                      label: "Full Time Employees",
                      value: company.full_time_employees,
                    },
                    {
                      label: "",
                      value: company.ir_website_link ? (
                        <a
                          href={company.ir_website_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Investor Relations Website
                        </a>
                      ) : null,
                    },
                  ])}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))
      )}
    </Container>
  );
};

export default CompanyList;
