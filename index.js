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
        const userCollections = database.collection("users");

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

         //Get Api for users
         app.get('/all-users', async (req, res) => {
            const cursor = userCollections.find({});
            const users = await cursor.toArray();
            res.send(users);
        })

         //Get Api for orders
         app.get('/orders', async (req, res) => {
            const cursor = orderCollections.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // Get Api for my orders
        app.get('/my-orders/:orderOwner', async (req, res) => {
            const orderOwner = req.params.orderOwner;
            const query = { email: orderOwner };

            const cursor = orderCollections.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        })

        //Single Get Api for collections
        app.get('/service-details/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const query = { _id: ObjectId(orderId) };
            const details = await allCollections.findOne(query);
            res.send(details);
        })

        //Single Get Api for user email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollections.findOne(query);

            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

        //Post Api for orders
        app.post('/place-order', async(req, res) => {
            const order = req.body; 
            const result = await orderCollections.insertOne(order);
            console.log('Order inserted:', result);
            res.json(result); //output on client site as a json
        })

        //Post Api for offers
        app.post('/add-collection', async(req, res) => {
            const collection = req.body; 
            const result = await allCollections.insertOne(collection);
            res.json(result); 
        })

        //Post Api for reviews
        app.post('/add-review', async(req, res) => {
            const review = req.body;
            const result = await reviewCollections.insertOne(review);
            res.json(result);
        })

         //Post Api for users
         app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await userCollections.insertOne(user);
            res.json(result); 
        })

         //Put Api for users - upsert
         app.put('/users', async(req, res) => {
            const user = req.body; 
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };

            const result = await userCollections.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //Put Api for admin
        app.put('/users/admin', async(req, res) => {
            const user = req.body; 
            const filter = { email: user.email };
            const updateDoc = { $set: {role: 'admin'} };

            const result = await userCollections.updateOne(filter, updateDoc);
            res.json(result);
        })

        //Delete Api for collections
        app.delete('/delete-collection/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allCollections.deleteOne(query);

            res.json(result);
        })

        //Delete Api for reviews
        app.delete('/delete-review/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollections.deleteOne(query);

            res.json(result); //output on client site as a json
        })

        //Delete Api for orders
        app.delete('/delete-order/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollections.deleteOne(query);

            res.json(result); //output on client site as a json
        })

        //Delete Api for users
        app.delete('/delete-user/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollections.deleteOne(query);

            res.json(result);
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