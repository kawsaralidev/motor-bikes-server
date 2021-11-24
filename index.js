const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// meadle ware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fzu0z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('motor_bike')
        const productsCollection = database.collection('products')
        const reviewsCollection = database.collection('reviews')
        const usersCollection = database.collection('booking')
        const bookUserCollection = database.collection('bookuser')

        app.get('/booking', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query)
            const cursor = usersCollection.find(query)
            const bookings = await cursor.toArray()
            res.json(bookings)
        })
        // get all products 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const products = await cursor.toArray();
            res.json(products)
        })
        // add product post 
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            console.log(result)
            res.json(result)
        })
        // get all reviews 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray();
            res.json(reviews)
        })
        // add review 
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            console.log(result)
            res.json(result)
        })
        // booking collection post 
        app.post('/booking', async (req, res) => {
            const bookings = req.body;
            const result = await usersCollection.insertOne(bookings)
            console.log(result)
            res.json(result)
        })
        // add admin role 
        app.put('/bookuser/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await bookUserCollection.updateOne(filter, updateDoc);
            console.log(result)
            res.json(result)
        })
        // update user 
        app.put('/bookuser', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await bookUserCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        // users collection post
        app.post('/bookuser', async (req, res) => {
            const bookuser = req.body;
            const result = await bookUserCollection.insertOne(bookuser)
            res.json(result)
        })
        // find admin 
        app.get('/bookuser/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
        // delete booking 
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            console.log('deleting user with id', result)
            res.json(result)
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello motor bike!')
})

app.listen(port, () => {
    console.log(`listenning to port ${port}`)
})