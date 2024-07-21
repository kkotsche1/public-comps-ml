import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Switch,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import debounce from "lodash.debounce";
import {
  countriesList,
  sectorsList,
  industriesList,
} from "../data/filterLists";

const animatedComponents = makeAnimated();

const SearchForm = ({ onSubmit, onClear, submitted }) => {
  const [description, setDescription] = useState("");
  const [countries, setCountries] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [marketCapMin, setMarketCapMin] = useState("");
  const [marketCapMax, setMarketCapMax] = useState("");
  const [revenueMin, setRevenueMin] = useState("");
  const [revenueMax, setRevenueMax] = useState("");
  const [employeesMin, setEmployeesMin] = useState("");
  const [employeesMax, setEmployeesMax] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSearchingByCompany, setIsSearchingByCompany] = useState(true); // Default to company search
  const [companyOptions, setCompanyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    // Fetch company data
    const fetchCompanies = async () => {
      setIsLoading(true);
      const response = await fetch("/companies.json");
      const data = await response.json();
      setCompanyOptions(
        data.map((company) => ({
          value: company.ticker,
          label: `${company.name} (${company.ticker} - ${company.exchange})`,
        }))
      );
      setIsLoading(false);
    };

    fetchCompanies();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      isNaN(marketCapMin) ||
      isNaN(marketCapMax) ||
      isNaN(revenueMin) ||
      isNaN(revenueMax) ||
      isNaN(employeesMin) ||
      isNaN(employeesMax)
    ) {
      alert(
        "Please enter valid numbers for market cap, revenue, and number of employees."
      );
      return;
    }

    if (isSearchingByCompany && selectedCompany) {
      onSubmit({
        company: selectedCompany,
        countries: countries.map((country) => country.value),
        sectors: sectors.map((sector) => sector.value),
        industries: industries.map((industry) => industry.value),
        marketCapMin,
        marketCapMax,
        revenueMin,
        revenueMax,
        employeesMin,
        employeesMax,
      });
    } else if (!isSearchingByCompany && description) {
      onSubmit({
        description,
        countries: countries.map((country) => country.value),
        sectors: sectors.map((sector) => sector.value),
        industries: industries.map((industry) => industry.value),
        marketCapMin,
        marketCapMax,
        revenueMin,
        revenueMax,
        employeesMin,
        employeesMax,
      });
    } else {
      alert("Please provide either a company or a description.");
    }
  };

  const handleClear = () => {
    setDescription("");
    setSelectedCompany(null);
    setCountries([]);
    setSectors([]);
    setIndustries([]);
    setMarketCapMin("");
    setMarketCapMax("");
    setRevenueMin("");
    setRevenueMax("");
    setEmployeesMin("");
    setEmployeesMax("");
    onClear();
  };

  const convertToSelectOptions = (list) => {
    return list.map((item) => ({ value: item, label: item }));
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const handleCompanyChange = (selectedOption) => {
    console.log("Selected company:", selectedOption);
    setSelectedCompany(selectedOption);
  };

  const filterCompanies = (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }
    return companyOptions.filter((company) =>
      company.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const debouncedFilterCompanies = useCallback(
    debounce((inputValue) => {
      setSearchInput(inputValue);
      filterCompanies(inputValue);
    }, 300),
    [companyOptions]
  );

  return (
    <Container>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 3, textAlign: "center", maxWidth: 600, margin: "auto" }}
      >
        <Typography variant="body1" gutterBottom>
          You can search for comparables either by providing a description for a
          company, or by searching for the company from the dropdown.
        </Typography>
        <FormGroup row sx={{ justifyContent: "center", mb: 2 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ lineHeight: "32px", mr: 1 }}
          >
            Description
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isSearchingByCompany}
                onChange={() => setIsSearchingByCompany(!isSearchingByCompany)}
                color="primary"
              />
            }
            label=""
            sx={{ m: 0 }}
          />
          <Typography
            variant="body1"
            gutterBottom
            sx={{ lineHeight: "32px", ml: 1 }}
          >
            Company
          </Typography>
        </FormGroup>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            {isSearchingByCompany ? (
              <>
                <Typography variant="body1" gutterBottom>
                  Select a company:
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Select
                    components={animatedComponents}
                    options={filterCompanies(searchInput)}
                    isLoading={isLoading}
                    value={selectedCompany}
                    onInputChange={debouncedFilterCompanies}
                    onChange={handleCompanyChange}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    placeholder="Start typing company name, ticker, or exchange"
                    styles={customStyles}
                    menuPortalTarget={document.body} // Ensures the menu is not constrained by the parent
                    menuPosition="fixed"
                    noOptionsMessage={() =>
                      searchInput.length < 2
                        ? "Enter at least 2 characters"
                        : "No options"
                    }
                  />
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body1" gutterBottom>
                  Provide a description of the company you would like to find
                  comparables for:
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Company Description"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        <Accordion
          sx={{ backgroundColor: (theme) => theme.palette.background.offWhite }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Filtering Options</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box mb={2}>
              <Select
                components={animatedComponents}
                isMulti
                options={convertToSelectOptions(countriesList)}
                value={countries}
                onChange={setCountries}
                placeholder="Select countries"
                styles={customStyles}
              />
            </Box>
            <Box mb={2}>
              <Select
                components={animatedComponents}
                isMulti
                options={convertToSelectOptions(sectorsList)}
                value={sectors}
                onChange={setSectors}
                placeholder="Select sectors"
                styles={customStyles}
              />
            </Box>
            <Box mb={2}>
              <Select
                components={animatedComponents}
                isMulti
                options={convertToSelectOptions(industriesList)}
                value={industries}
                onChange={setIndustries}
                placeholder="Select industries"
                styles={customStyles}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Market Cap Min (in millions)"
                  fullWidth
                  value={marketCapMin}
                  onChange={(e) => setMarketCapMin(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Market Cap Max (in millions)"
                  fullWidth
                  value={marketCapMax}
                  onChange={(e) => setMarketCapMax(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Revenue Min (in millions)"
                  fullWidth
                  value={revenueMin}
                  onChange={(e) => setRevenueMin(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Revenue Max (in millions)"
                  fullWidth
                  value={revenueMax}
                  onChange={(e) => setRevenueMax(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Employees Min"
                  fullWidth
                  value={employeesMin}
                  onChange={(e) => setEmployeesMin(e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Employees Max"
                  fullWidth
                  value={employeesMax}
                  onChange={(e) => setEmployeesMax(e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Note: Only one of the two entry methods (company or description) will
          be used in the search.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 3,
            mb: 5,
          }}
        >
          <Button type="submit" variant="outlined" color="primary">
            Submit
          </Button>
          {submitted && (
            <Button variant="outlined" color="secondary" onClick={handleClear}>
              Clear Search
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SearchForm;
