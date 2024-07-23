import React, { useState, useRef, useEffect } from "react";
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
  const [userSelectedCompany, setUserSelectedCompany] = useState(null);
  const companyListRef = useRef(null);

  useEffect(() => {
    // Set the document title when the component mounts
    document.title = "Comparables Finder";
  }, []);

  const handleSearchSubmit = async (searchData) => {
    console.log("Search data:", searchData);
    setLoading(true);
    setUserSelectedCompany(null); // Reset the user selected company
    setSubmitted(false); // Clear the previous results by hiding the CompanyList

    try {
      let response;

      // Check if searchData contains the 'company' attribute
      if (searchData.company) {
        const requestData = {
          ticker: searchData.company.value,
        };
        response = await axios.post(
          //"http://localhost:5000/search_ticker",
          "https://search-ticker-htv2wlstgq-uc.a.run.app",
          requestData
        );

        console.log(response.status);
        console.log(response);

        // Set the user selected company separately
        setUserSelectedCompany(
          response.data.find(
            (company) => company.ticker === searchData.company.value
          )
        );
      } else {
        response = await axios.post(
          //"http://localhost:5000/search",
          "https://search-description-htv2wlstgq-uc.a.run.app",
          searchData
        );
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
    setUserSelectedCompany(null); // Reset the user selected company
  };

  useEffect(() => {
    if (submitted && companyListRef.current) {
      companyListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [submitted, companies]);

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
          ref={companyListRef}
          sx={{
            width: "100vw",
            maxWidth: "100%",
            mx: "auto",
            mt: 5,
          }}
        >
          {companies.length > 0 ? (
            <CompanyList
              companies={companies}
              userSelectedCompany={userSelectedCompany}
            />
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
