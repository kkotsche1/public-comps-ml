import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import axios from "axios";
import SearchForm from "./components/SearchForm";
import CompanyList from "./components/CompanyList";

function App() {
  const [companies, setCompanies] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearchSubmit = async (searchData) => {
    console.log("Search data:", searchData);
    setLoading(true);

    try {
      let response;

      // Check if searchData contains the 'company' attribute
      if (searchData.company) {
        const requestData = {
          ticker: searchData.company.value,
        };
        response = await axios.post(
          "http://localhost:5000/search_ticker",
          requestData
        );
      } else {
        response = await axios.post("http://localhost:5000/search", searchData);
      }

      setCompanies(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error making API call:", error);
      alert("There was an error fetching the data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setCompanies([]);
    setSubmitted(false);
  };

  return (
    <Container
      sx={{
        backgroundColor: (theme) => theme.palette.background.offWhite,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: submitted ? "flex-start" : "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        pt: submitted ? 8 : 0,
        pb: 8,
      }}
    >
      <Typography variant="h2" gutterBottom align="center">
        Comparables Finder
      </Typography>
      <Box sx={{ width: "80%", maxWidth: "800px" }}>
        <SearchForm
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          submitted={submitted}
        />
      </Box>
      {submitted && (
        <Container
          sx={{
            width: "100vw",
            maxWidth: "100%",
            mx: "auto",
            mt: 5,
          }}
        >
          {companies.length > 0 ? (
            <CompanyList companies={companies} />
          ) : (
            <Typography variant="body1" align="center">
              No matching companies found.
            </Typography>
          )}
        </Container>
      )}
      {loading && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Container>
  );
}

export default App;
