require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
// const ObjectId = require('mongodb').ObjectId;
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

        //Get Api for offers
        app.get('/collections', async (req, res) => {
            const cursor = allCollections.find({});
            const collections = await cursor.toArray();
            res.send(collections);
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