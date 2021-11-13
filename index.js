require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

const app = express();
app.use(cors()); //middleware
app.use(express.json());

const uri = `mongodb+srv://${process.env.REACT_APP_USERNAME}:${process.env.REACT_APP_PASSWORD}@cluster0.ce7h0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("rh-london");
        const allCollections = database.collection("collections");
        const reviewCollections = database.collection("reviews");
        const orderCollections = database.collection("orders");

        //Get Api for collections
        app.get('/collections', async (req, res) => {
            const cursor = allCollections.find({});
            const collections = await cursor.toArray();
            res.send(collections);
        })

        //Get Api for reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollections.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

         //Get Api for orders
         app.get('/orders', async (req, res) => {
            const cursor = orderCollections.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //Single Get Api for collections
        app.get('/service-details/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const query = { _id: ObjectId(orderId) };
            const details = await allCollections.findOne(query);
            res.send(details);
        })

        //Post Api for orders
        app.post('/place-order', async(req, res) => {
            const order = req.body; 
            const result = await orderCollections.insertOne(order);

            console.log('An order was inserted:', result);
            res.json(result); //output on client site as a json
        })

        //Post Api for offers
        app.post('/add-collection', async(req, res) => {
            const collection = req.body; //console.log(req.body);
            const result = await allCollections.insertOne(collection);

            console.log('An offer was inserted:', result);
            res.json(result); //output on client site as a json
        })

        //Post Api for reviews
        app.post('/add-review', async(req, res) => {
            const review = req.body; //console.log(req.body);
            const result = await reviewCollections.insertOne(review);

            console.log('An offer was inserted:', result);
            res.json(result); //output on client site as a json
        })

    } finally {
    //   await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is loading!');
})

app.listen(port, () => console.log('Server is loading at port@5000'));