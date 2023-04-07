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
        const database = client.db("E24NewsStore");
        const allCollections = database.collection("collections");
        const reviewCollections = database.collection("reviews");
        const orderCollections = database.collection("orders");
        const userCollections = database.collection("users");

        //Get Api for collections
        app.get('/api/collections', async (req, res) => {
            const filter = {};
            const page = req.query.page;
            const size = parseInt(req.query.size);
            
            // Check if the 'addedBy' query parameter is present in the request
            if (req.query.addedBy) {
              filter.addedBy = req.query.addedBy;
            }
          
            const cursor = allCollections.find(filter);
            const count = await cursor.count();
          
            let collections;
            if (page) {
              collections = await cursor.skip(page * size).limit(size).toArray();
            } else {
              collections = await cursor.toArray();
            }
          
            res.send({
              count,
              collections
            });
          });

        //Get Api for reviews
        app.get('/api/reviews', async (req, res) => {
            const cursor = reviewCollections.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

         //Get Api for users
         app.get('/api/all-users', async (req, res) => {
            const cursor = userCollections.find({});
            const users = await cursor.toArray();
            res.send(users);
        })

         //Get Api for orders
         app.get('/api/orders', async (req, res) => {
            const cursor = orderCollections.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // Get Api for my orders
        app.get('/api/my-orders/:orderOwner', async (req, res) => {
            const orderOwner = req.params.orderOwner;
            const query = { email: orderOwner };

            const cursor = orderCollections.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        })

        //Single Get Api for collections
        app.get('/api/service-details/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const query = { _id: ObjectId(orderId) };
            const details = await allCollections.findOne(query);
            res.send(details);
        })

        //Single Get Api for user email
        app.get('/api/users/:email', async (req, res) => {
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
        app.post('/api/place-order', async(req, res) => {
            const order = req.body; 
            const result = await orderCollections.insertOne(order);
            console.log('Order inserted:', result);
            res.json(result); //output on client site as a json
        })

        //Post Api for offers
        app.post('/api/add-collection', async(req, res) => {
            const collection = req.body; 
            const result = await allCollections.insertOne(collection);
            res.json(result); 
        })

        //Post Api for reviews
        app.post('/api/add-review', async(req, res) => {
            const review = req.body;
            const result = await reviewCollections.insertOne(review);
            res.json(result);
        })

         //Post Api for users
         app.post('/api/users', async(req, res) => {
            const user = req.body;
            const result = await userCollections.insertOne(user);
            res.json(result); 
        })

         //Put Api for users - upsert
         app.put('/api/users', async(req, res) => {
            const user = req.body; 
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };

            const result = await userCollections.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //Put Api for admin
        app.put('/api/users/admin', async(req, res) => {
            const user = req.body; 
            const filter = { email: user.email };
            const updateDoc = { $set: {role: 'admin'} };

            const result = await userCollections.updateOne(filter, updateDoc);
            res.json(result);
        })

        //Delete Api for collections
        app.delete('/api/delete-collection/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allCollections.deleteOne(query);

            res.json(result);
        })

        //Delete Api for reviews
        app.delete('/api/delete-review/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollections.deleteOne(query);

            res.json(result); //output on client site as a json
        })

        //Delete Api for orders
        app.delete('/api/delete-order/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollections.deleteOne(query);

            res.json(result); //output on client site as a json
        })

        //Delete Api for users
        app.delete('/api/delete-user/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollections.deleteOne(query);

            res.json(result);
        })

        //Update Api for orders
        app.put('/api/update-order/:orderId', async(req, res) => {
            const orderId = req.params.orderId;
            const updatedOrder = req.body;
            updatedOrder.status = false;
            const status = updatedOrder.status;
            const query = { _id: ObjectId(orderId) };

            const updateDoc = {
                $set: {
                  status: status
                },
            };
            const result = await orderCollections.updateOne(query, updateDoc);

            res.json(result);
        })

    } finally {
    //   await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is loading on vercel!');
})

app.listen(port, () => console.log('Server is loading at port@5000'));