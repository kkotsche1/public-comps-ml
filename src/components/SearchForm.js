import React, { useState } from "react";
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
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Select from "react-select";
import makeAnimated from "react-select/animated";
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
  };

  const handleClear = () => {
    setDescription("");
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

  return (
    <Container>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 3, textAlign: "center" }}
      >
        <Typography variant="body1" gutterBottom>
          Provide a description of the company you would like to find
          comparables for.
        </Typography>
        <TextField
          label="Company Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
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
