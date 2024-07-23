from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv
import yfinance as yf

load_dotenv(dotenv_path=r"C:\Users\Admin\PycharmProjects\public-comps\.env")

app = Flask(__name__)
CORS(app)


# Instantiating OpenAI Client
openai_client = OpenAI(
    api_key = os.environ.get("OPENAI_API_KEY")
)

# Function to create an embedding from the submitted description
def create_embedding(text):
    response = openai_client.embeddings.create(
      model="text-embedding-3-large",
      input=text
    )
    return response.data[0].embedding

# Instantiating pinecone index via the pinecone client
pinecone_index = Pinecone(
    api_key = os.environ.get("PINECONE_API_KEY")
).Index(host=os.environ.get("PINECONE_INDEX_HOST"))


@app.route('/search', methods=['POST'])
def search():
    data = request.json

    submitted_description = data["description"]
    submitted_country_list = data["countries"]
    submitted_sector_list = data["sectors"]

    ## Not using the following options to filter as they are dynamic and we need to first figure out a way to keep that info up to date in our 
    ## Pinecone index in order to make the filtering accurate 

    # submitted_min_marketcap = data["marketCapMin"]
    # submitted_max_marketcap = data["marketCapMax"]
    # submitted_min_revenue = data["revenueMin"]
    # submitted_max_revenue = data["revenueMax"]
    # submitted_min_employees = data["employeesMin"]
    # submitted_max_employees = data["employeesMax"]


    # Generating an encoding for the submitted company description
    submitted_description_encoding = create_embedding(submitted_description)

    # Generating a list of metadata filters which we will use to query pinecone
    query_filters = {}
    if submitted_country_list:
        query_filters["country"] = {"$in": submitted_country_list}
    if submitted_sector_list:
        query_filters["sector"] = {"$in": submitted_sector_list}

    print("Query filters:", query_filters)

    # Querying our pinecone index to find matches
    query_response = pinecone_index.query(
       vector=submitted_description_encoding,
       include_metadata=True, 
       top_k=15,
       filter= query_filters
    )

    print("RESPONSE:", query_response)

    companies = []

    for match in query_response["matches"]:
        print(match)
        ticker = match["metadata"]["company_ticker"]
        yf_ticker = yf.Ticker(ticker=ticker)
        ticker_info = yf_ticker.get_info()

        company_data = {
            "name": match["metadata"]["company_name"],
            "exchange": match["metadata"]["company_exchange"],
            "ticker": match["metadata"]["company_ticker"],
            "country": match["metadata"]["country"],
            "industry": match["metadata"]["industry"],
            "sector": match["metadata"]["sector"],
            "full_time_employees": ticker_info.get("fullTimeEmployees"),
            "ir_website_link": ticker_info.get("irWebsite"),
            "forward_dividend": ticker_info.get("dividendRate"),
            "forward_dividend_yield": round(float(ticker_info.get("dividendYield", 0)) * 100, 2) if ticker_info.get("dividendYield") else None,
            "trailing_pe": ticker_info.get("trailingPE"),
            "forward_pe": ticker_info.get("forwardPE"),
            "market_cap": ticker_info.get("marketCap"),
            "price_to_sales_trailing12mo": ticker_info.get("priceToSalesTrailing12Months"),
            "enterprise_value": ticker_info.get("enterpriseValue"),
            "price_to_book": ticker_info.get("priceToBook"),
            "trailing_eps": ticker_info.get("trailingEps"),
            "forward_eps": ticker_info.get("forwardEps"),
            "peg_ratio": ticker_info.get("pegRatio"),
            "ebitda": ticker_info.get("ebitda"),
            "total_debt": ticker_info.get("totalDebt"),
            "quick_ratio": ticker_info.get("quickRatio"),
            "current_ratio": ticker_info.get("currentRatio"),
            "revenue": ticker_info.get("totalRevenue"),
            "debt_to_equity": ticker_info.get("debtToEquity"),
            "revenue_per_share": ticker_info.get("revenuePerShare"),
            "free_cash_flow": ticker_info.get("freeCashFlow"),
            "operating_cashflow": ticker_info.get("operatingCashflow"),
            "earnings_growth": ticker_info.get("earningsGrowth"),
            "revenue_growth": ticker_info.get("revenueGrowth"),
            "gross_margin": ticker_info.get("grossMargins"),
            "ebitda_margin": ticker_info.get("ebitdaMargins"),
            "operating_margin": ticker_info.get("operatingMargins"),
            "trailing_peg_ratio": ticker_info.get("trailingPegRatio"),
            "company_description": ticker_info.get("longBusinessSummary")
        }
        print("Rev Growth", ticker_info.get("revenueGrowth"))
        companies.append(company_data)

    return jsonify(companies)


@app.route('/search_ticker', methods=['POST'])
def search_ticker():
    data = request.json

    ticker_value = data["ticker"]
    yf_ticker = yf.Ticker(ticker_value)
    ticker_info = yf_ticker.get_info()

    long_business_summary = ticker_info.get("longBusinessSummary")
    print(long_business_summary)

    # Generating an encoding for the long business summary
    summary_encoding = create_embedding(long_business_summary)

    # Querying our pinecone index to find matches
    query_response = pinecone_index.query(
       vector=summary_encoding,
       include_metadata=True,
       top_k=15
    )

    companies = []

    for match in query_response["matches"]:
        ticker = match["metadata"]["company_ticker"]
        yf_ticker = yf.Ticker(ticker=ticker)
        ticker_info = yf_ticker.get_info()

        company_data = {
            "name": match["metadata"]["company_name"],
            "exchange": match["metadata"]["company_exchange"],
            "ticker": match["metadata"]["company_ticker"],
            "country": match["metadata"]["country"],
            "industry": match["metadata"]["industry"],
            "sector": match["metadata"]["sector"],
            "full_time_employees": ticker_info.get("fullTimeEmployees"),
            "ir_website_link": ticker_info.get("irWebsite"),
            "forward_dividend": ticker_info.get("dividendRate"),
            "forward_dividend_yield": round(float(ticker_info.get("dividendYield", 0)) * 100, 2) if ticker_info.get("dividendYield") else None,
            "trailing_pe": ticker_info.get("trailingPE"),
            "forward_pe": ticker_info.get("forwardPE"),
            "market_cap": ticker_info.get("marketCap"),
            "price_to_sales_trailing12mo": ticker_info.get("priceToSalesTrailing12Months"),
            "enterprise_value": ticker_info.get("enterpriseValue"),
            "price_to_book": ticker_info.get("priceToBook"),
            "trailing_eps": ticker_info.get("trailingEps"),
            "forward_eps": ticker_info.get("forwardEps"),
            "peg_ratio": ticker_info.get("pegRatio"),
            "ebitda": ticker_info.get("ebitda"),
            "total_debt": ticker_info.get("totalDebt"),
            "quick_ratio": ticker_info.get("quickRatio"),
            "current_ratio": ticker_info.get("currentRatio"),
            "revenue": ticker_info.get("totalRevenue"),
            "debt_to_equity": ticker_info.get("debtToEquity"),
            "revenue_per_share": ticker_info.get("revenuePerShare"),
            "free_cash_flow": ticker_info.get("freeCashFlow"),
            "operating_cashflow": ticker_info.get("operatingCashflow"),
            "earnings_growth": ticker_info.get("earningsGrowth"),
            "revenue_growth": ticker_info.get("revenueGrowth"),
            "gross_margin": ticker_info.get("grossMargins"),
            "ebitda_margin": ticker_info.get("ebitdaMargins"),
            "operating_margin": ticker_info.get("operatingMargins"),
            "trailing_peg_ratio": ticker_info.get("trailingPegRatio"),
            "company_description": ticker_info.get("longBusinessSummary")
        }
        companies.append(company_data)

    return jsonify(companies)

if __name__ == '__main__':
    app.run(debug=True)
