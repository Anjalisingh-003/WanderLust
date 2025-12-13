if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  //to add owner to the initData object which is initialized in data.js
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "65f498de938bbbafdcf350b8",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
// require("dotenv").config();
// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");
// // const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// // const mapToken = process.env.MAP_TOKEN;
// // const geoCodingClient = mbxGeocoding({ accessToken: mapToken });

// const mongoUrl = process.env.ATLASDB_URL;

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(mongoUrl);
// }

// const initDB = async () => {
//   try {
//     await Listing.deleteMany({});

//     const updatedData = await Promise.all(
//       initData.data.map(async (obj) => {
//         let response;
//         try {
//           response = await geoCodingClient
//             .forwardGeocode({
//               query: `${obj.location}, ${obj.country}`,
//               limit: 1,
//             })
//             .send();
//         } catch (error) {
//           console.error(
//             `Geocoding failed for ${obj.location}, ${obj.country}:`,
//             error
//           );
//           return { ...obj, owner: "66567b03fda820235197b582", geometry: null };
//         }

//         const geometry = response.body.features[0].geometry || null;

//         return {
//           ...obj,
//           owner: "66567b03fda820235197b582",
//           geometry,
//         };
//       })
//     );

//     await Listing.insertMany(updatedData);
//     console.log("DB is initialized");
//   } catch (error) {
//     console.error("Error initializing DB:", error);
//   }
// };

// initDB();
