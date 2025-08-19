const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require('ejs-mate');
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine('ejs', ejsMate);
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});



// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });



//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  console.log(allListings);
  res.render("listings/index", { allListings  });
});


//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});


//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
// app.put("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//   res.redirect(`/listings/${id}`);
// });
// Update Route
app.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listingData = req.body.listing;
    
    // First find the existing listing
    const existingListing = await Listing.findById(id);
    
    // If image URL wasn't provided in the form, keep the existing one
    if (!listingData.image?.url && existingListing.image?.url) {
      listingData.image = existingListing.image;
    }
    
    // Update the listing while preserving any missing fields
    const updatedListing = await Listing.findByIdAndUpdate(
      id, 
      { $set: listingData },  // Only updates the fields that are present
      { new: true }          // Returns the updated document
    );
    
    res.redirect(`/listings/${updatedListing._id}`);
        // res.redirect(`/listings`);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating listing");
  }
});


//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});



app.listen(8080, () => {
  console.log("server is listening to port 8080");
});





