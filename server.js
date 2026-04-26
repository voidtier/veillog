const dotenv = require("dotenv");
const connectToDB = require("./backend/config/db.js");
const app = require("./backend/app.js");
dotenv.config();

async function startServer() {
  try {
    await connectToDB();
    app.listen(process.env.PORT, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("server could start", error);
  }
}

startServer();
