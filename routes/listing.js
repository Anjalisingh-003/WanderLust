
// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const { isLoggedIn, isOwner, validateListing } = require("../middlewares.js");
// const listingController = require("../controllers/listings.js");
// const multer = require("multer");
// const { storage } = require("../cloudConfig.js");
// const upload = multer({ storage }); //to store image files in storage named destination

// //to group together the common paths for different requests
// router
//   .route("/")
//   .get(wrapAsync(listingController.index))
//   //to use multer to store images
//   .post(
//     isLoggedIn,
//     upload.single("listing[image]"),
//     validateListing,
//     wrapAsync(listingController.createListing)
//   );

// router.get("/new", isLoggedIn, listingController.renderNewForm);

// router
//   .route("/:id")
//   .get(wrapAsync(listingController.showListing))
//   //to update image
//   .put(
//     isLoggedIn,
//     isOwner,
//     upload.single("listing[image]"),
//     validateListing,
//     wrapAsync(listingController.updateListing)
//   )
//   .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// // Edit Route

// router.get(
//   "/:id/edit",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.renderEditForm)
// );

// module.exports = router;
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middlewares.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.get("/filter/:id", wrapAsync(listingController.filter));
router.get("/search", listingController.search);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

router.get(
  "/:id/reservelisting",
  isLoggedIn,
  wrapAsync(listingController.reserveListing)
);

module.exports = router;
