const express = require('express');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const PORT = 2500;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.MONGO_DB_SERVER}:${process.env.MONGO_DB_KEY}@cluster0.ufqnoyu.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {

    try {

        await client.connect();
        const dataBase = client.db('assetDB');
        const usersCollection = dataBase.collection('usersCollection')
        const assetCollection = dataBase.collection('assetCollection')
        const requestCollection = dataBase.collection('requestCollection')


        app.post('/user-employee', async (req, res) => {
            const EmplyeeData = req.body;

            if (EmplyeeData) {
                userData.role = 'Employee'
                const result = await usersCollection.insertOne(EmplyeeData);
                res.send(result);
            }
        })



        // HR apis

        app.post('/user-HR', async (req, res) => {
            const HRData = req.body;

            if (HRData) {
                HRData.role = 'HR'
                HRData.packageLimit = 5
                HRData.currentEmployees = 0
                HRData.subscription = 'basic'

                const result = await usersCollection.insertOne(HRData);
                res.send(result);
            }
        })

        app.post('/add-product', async (req, res) => {
            const product = req.body;
            const result = await assetCollection.insertOne(product)
            res.send(result)
        })

        app.get('/all-asset', async (req, res) => {
            const search = req.query.search?.trim();


            let query = {};

            if (search) {
                query = {
                    name: { $regex: search }
                };

            }

            const result = await assetCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/all-asset/:id', async (req, res) => {
            const { id } = req.params;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid ID" });
            }
            const query = { _id: new ObjectId(id) }
            const result = await assetCollection.findOne(query);
            res.send(result);

        })

        app.delete('/all-asset/delete/:id', async (req, res) => {
            const id = req.params.id;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid ID" });
            }
            const query = { _id: new ObjectId(id) }
            const result = await assetCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/all-asset/edit/:id', async (req, res) => {
            const { id } = req.params;
            const editedProduct = req.body

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid ID" });
            }

            const query = { _id: new ObjectId(id) };
            const update = { $set: editedProduct }
            const result = await assetCollection.updateOne(query, update);
            res.send(result);
        })

        app.get('/all-requests', async (req, res) => {
            const result = await requestCollection.find().toArray();
            res.send(result);
        })

        app.patch('/asset-approval/:id', async (req, res) => {
            const requestStatus = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const update = { $set: requestStatus }
            const result = await requestCollection.updateOne(query, update);
            res.send(result);

        })

        app.patch('/asset-reject/:id', async (req, res) => {
            const requestStatus = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const update = { $set: requestStatus }
            const result = await requestCollection.updateOne(query, update);
            res.send(result);

        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {


    }
}
run().catch(console.dir);


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})