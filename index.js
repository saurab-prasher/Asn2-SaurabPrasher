// Import necessary modules
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const fs = require("fs");
const router = express.Router();

// Define the port where the server will listen
const port = process.env.PORT || 3000;

const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Register a Handlebars helper function to change "0" to "zero"
const zeroIfZero = (value) => {
  return value === 0 ? "zero" : value;
};

// Register a Handlebars helper function to check if two values are equal
const isEqual = (a, b) => {
  if (a === b) return this;
};

// Set up Handlebars as the view engine with a custom file extension
app.engine(
  ".hbs",
  hbs.engine({
    extname: ".hbs",
    helpers: {
      isEqual: isEqual,
      zeroIfZero,
    },
    partialsDir: ["views/partials/"],
    defaultLayout: "main",
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");

// Define a route for the root URL ("/")
app.get("/", function (req, res) {
  // Render the "index" view with a title of "Express"
  res.render("index", { title: "Express" });
});

app.get("/data", (req, res) => {
  // Read the JSON file
  fs.readFile("SuperSales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Error reading JSON file");
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);
    console.log(jsonData);

    // Log the data to the console
    console.log("JSON data is loaded and ready:");
    // console.log(jsonData);
    // const { jsonData } = jsonData;
    const slicedData = jsonData.slice(0, 11);

    // Send a response to the client
    res.status(200).render("data", {
      data: slicedData,
      length: slicedData.length,
      dataPage: true,
    });
  });
});

app.get("/data/invoiceNo/:index", (req, res) => {
  // Read the JSON file
  fs.readFile("SuperSales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Error reading JSON file");
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Get the index from the route parameter
    const index = parseInt(req.params.index);
    console.log(index);

    // Check if the index is valid
    if (isNaN(index) || index < 0 || index >= jsonData.length) {
      res.status(400).send("Invalid index value");
      return;
    }

    // Get the related InvoiceNo
    const invoiceNo = jsonData[index].InvoiceNo;
    console.log(invoiceNo);

    // Send the InvoiceNo as the response
    res.render("displaySale", { sale: jsonData[index] });
  });
});

app.get("/search/invoiceNo", (req, res) => {
  res.render("invoiceSearchForm", { invoiceSearchForm: true });
});
// Define a route for "/users"
app.get("/users", function (req, res) {
  // Send a simple response
  res.send("respond with a resource");
});

app.post("/search/invoiceNo", urlencodedParser, (req, res) => {
  fs.readFile("SuperSales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Error reading JSON file");
      return;
    }
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    const invoiceNo = req.body.invoiceNo;
    // Check if the index is valid

    const filteredCarSale = jsonData.filter(
      (value) => value["Invoice ID"] === invoiceNo
    );
    console.log(filteredCarSale);

    if (filteredCarSale.length <= 0) {
      res.render("saleNotFound", {
        heading: "Sale not found, please check the invoice number.",
      });
      return;
    }

    res.render("displaySale", { sale: filteredCarSale[0] });
  });
});

app.get("/search/productline", (req, res) => {
  res.render("productLineForm", { manufacturerForm: true });
});

app.post("/search/productline", urlencodedParser, (req, res) => {
  fs.readFile("SuperSales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Error reading JSON file");
      return;
    }
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    console.log(req.body.productline);
    const productline = req.body.productline.toLowerCase();
    console.log(productline);

    const filterProductLinie = jsonData.filter((value) =>
      value["Product line"].toLowerCase().includes(productline)
    );
    console.log(filterProductLinie);

    if (filterProductLinie.length <= 0) {
      res.render("saleNotFound", {
        heading: "Product Line not found.",
      });
      return;
    }

    res.render("displayProductLine", {
      sale: filterProductLinie,
    });
  });
});

// Define a route to display all sales data
app.get("/viewData", (req, res) => {
  fs.readFile("SuperSales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Error reading JSON file");
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Render the "viewData" view with the sales data
    res.render("viewData", {
      title: "All Sales Data",

      sales: jsonData,
    });
  });
});

// Update the Express route and endpoint
app.get("/viewName", function (req, res) {
  fs.readFile("SuperSales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Error reading JSON file");
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    const filteredSales = jsonData.filter((sale) => sale.Rating != 0);

    // Render the "viewData" view with the sales data
    res.render("viewData", {
      title: "All Sales Data",
      sales: filteredSales,
    });
  });
});
// Define a catch-all route for any other URL
app.get("*", function (req, res) {
  // Render the "error" view with a title of "Error" and an error message
  res.render("error", { title: "Error", message: "Wrong Route" });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
