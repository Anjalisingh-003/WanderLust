
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schemaValidation.js");

// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const mapToken = process.env.MAP_TOKEN;
// const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  return res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  return res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  return res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let response = await geoCodingClient
  //   .forwardGeocode({
  //     query: req.body.listing.location,
  //     limit: 1,
  //   })
  //   .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  // newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing created!");
   return res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you trying to edit for does not exist!");
    return res.redirect("/listings");
  }
  let imageUrl = "";
  if(listing.image && listing.image.url){
    imageUrl = listing.image.url.replace("/upload", "/upload/w_250,h_160");
  }
  return res.render("listings/edit.ejs", { listing, imageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  try{
    let { id } = req.params;

    let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing},
    {new:true
  });

  if(!updatedListing){
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if(req.file){
    updatedListing.image = {
      filename: req.file.filename,
      url: req.file.path
    };
    await updatedListing.save();
  }

  req.flash("success", "Listing updated!");
  return res.redirect(`/listings/${id}`);
  }catch(err){
    return next(err);
  }
}
  
  // let response = await geoCodingClient
  //   .forwardGeocode({
  //     query: ` ${req.body.listing.location},${req.body.listing.country}`,
  //     limit: 1,
  //   })
  //   .send();

  // req.body.listing.geometry = response.body.features[0].geometry;
  

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     updatedListing.image = { url, filename };
//     await updatedListing.save();
//   }
//   req.flash("success", "Listing updated!");
//   res.redirect(`/listings/${id}`);
// };

module.exports.filter = async (req, res, next) => {
  let { id } = req.params;
  let allListings = await Listing.find({ category: { $all: [id] } });
  if (allListings.length != 0) {
    res.locals.success = `Listings Filtered by ${id}!`;
    return res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `There is no any Listing for ${id}!`);
    return res.redirect("/listings");
  }
};

module.exports.search = async (req, res) => {
  let input = req.query.q;
  // if (input == "" || input == " " || !input || input == undefined) {
  if(!input || input.trim()===""){
    req.flash("error", "Please enter search query!");
    return res.redirect("/listings");
  }

  input = req.query.q.trim().replace(/\s+/g, " ");
  let data = input.split("");
  let element = "";
  let flag = false;
  for (let index = 0; index < data.length; index++) {
    if (index == 0 || flag) {
      element = element + data[index].toUpperCase();
    } else {
      element = element + data[index].toLowerCase();
    }
    flag = data[index] == " ";
  }

  let allListings = await Listing.find({
    title: { $regex: element, $options: "i" },
  });
  if (allListings.length != 0) {
    res.locals.success = "Listings searched by Title!";
    return res.render("listings/index.ejs", { allListings });
    
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Category!";
      return res.render("listings/index.ejs", { allListings });
      
    }
  }
  if (allListings.length == 0) {
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Country!";
      return res.render("listings/index.ejs", { allListings });
      
    }
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Location!";
      return res.render("listings/index.ejs", { allListings });
      
    }
  }

  const intValue = parseInt(element, 10);
  const intDec = Number.isInteger(intValue);

  if (allListings.length == 0 && intDec) {
    allListings = await Listing.find({ price: { $lte: element } }).sort({
      price: 1,
    });
    if (allListings.length != 0) {
      res.locals.success = `Listings searched by price less than Rs ${element}!`;
      return res.render("listings/index.ejs", { allListings });
      
    }
  }
  if (allListings.length == 0) {
    req.flash("error", "No listings found based on your search!");
    return res.redirect("/listings");
  }
};

// //new one suggested by chatgpt
// module.exports.index = async (req, res)=> {
//   let allListings = await Listing.find();
//   return res.render("./listings/index.ejs", {allListings});
// };
// module.exports.renderNewForm = (req, res)=>{
//   return res.render("listings/new.ejs");
// };

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted!");
  return res.redirect("/listings");
};

module.exports.reserveListing = async (req, res) => {
  let { id } = req.params;
  req.flash("success", "Reservation Details sent to your Email!");
  return res.redirect(`/listings/${id}`);
};
