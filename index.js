const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// Application middleware
app.use(cors());
app.use(express.json());

// app.use(body)
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.wijwg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    client.connect(() => {
      console.log("DB CONNECTED");
    });
    //DATABASE Or Database Collections
    const database = client.db("car_shop");
    const userCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const extraCareCollection = database.collection("extra_care");
    const carCollection = database.collection("car");
    const reviewCollection = database.collection("review");

    // route api
    app.get("/", async (req, res) => {
      res.send(
        `<h1 style='color:#99bbf2;font-size:70px; margin-top:20%; text-align:center'> car shop server side</h1>`
      );
    });
    //Post all orders data to Database
    app.post("/car", async (req, res) => {
      const orders = req.body;
      const result = await carCollection.insertOne(orders);
      res.json(result);
    });
    //  GET API  Load Car  data
    app.get("/car", async (req, res) => {
      const cursor = carCollection.find({});
      const car = await cursor.toArray();
      res.send(car);
    });

    // GET Single data
    app.get("/car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await carCollection.findOne(query);
      console.log(cursor);
      res.json(cursor);
    });

    //Post all orders data to Database
    app.post("/orders", async (req, res) => {
      const query = req.body;
      // console.log(query.car_id);
      const order = await ordersCollection.findOne({ car_id: query.car_id });

      if (!order) {
        const result = await ordersCollection.insertOne(query);
        return res.json({ result, message: "Order Created successfully" });
      } else {
        return res.json({ message: "Order Added previous" });
      }
    });

    //get orders data from server
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      console.log(orders);
      res.send(orders);
    });

    //Post user info in server
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //Post user info in server
    app.post("/review", async (req, res) => {
      const user = req.body;
      const result = await reviewCollection.insertOne(user);
      res.json(result);
    });

    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const user = await cursor.toArray();
      res.json(user);
    });
    //Post user info in server

    //Create admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const query = req?.body.email;
      console.log(query);
      if (query) {
        const requesterAccount = await userCollection.findOne({ email: query });
        console.log(requesterAccount, 149);
        const filter = { email: user.email };
        const updateUser = { $set: { role: "admin" } };
        const result = await userCollection.updateOne(filter, updateUser);
        res.json(result);
      } else {
        res.status(403).json({ message: "You don't have access" });
      }
    });

    // Change Order Status
    app.put("/updateStatue/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await ordersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.json(result);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = await ordersCollection.deleteOne({ _id: ObjectId(id) });
      console.log(query);
      res.status(200).json(query);
    });
  } finally {
    // client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
