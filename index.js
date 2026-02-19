const express = require('express');
const app = express()
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');



// middle wares
app.use(cors())
app.use(express.json())
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    const token = authHeader.split(' ')[1];


    if (!token) return res.status(401).send({ message: 'unauthorized access' })

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }

        req.token_email = decoded.email
        next()
    });
};





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

        // await client.connect();
        const dataBase = client.db('assetDB');
        const usersCollection = dataBase.collection('usersCollection')
        const assetCollection = dataBase.collection('assetCollection')
        const assetRequestCollection = dataBase.collection('assetRequestCollection')
        const packageCollection = dataBase.collection('packageCollection')
        const employeeRequestsCollection = dataBase.collection('employeeRequestsCollection')

        // role verification
        const verifyHR = async (req, res, next) => {
            const email = req.token_email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'HR') {
                return res.status(403).send({ message: 'Access Forbidden: Only HR can perform this action' });
            }

            next();
        };

        const verifyEmployee = async (req, res, next) => {
            const email = req.token_email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'Employee') {
                return res.status(403).send({ message: 'Access Forbidden: Only employee can perform this action' });
            }

            next();
        };


        // jwt token generation
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_SECRET, {
                expiresIn: '1h'
            })

            res.send({ token })
        });


        // employee apis
        app.post('/user-employee', async (req, res) => {
            const EmplyeeData = req.body;
            if (EmplyeeData) {
                EmplyeeData.role = 'Employee'
                const result = await usersCollection.insertOne(EmplyeeData);
                res.send(result);
            }
        })

        app.get('/employee-assets', verifyToken, verifyEmployee, async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.requesterEmail = email
            }
            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })
            result = await assetRequestCollection.find(query).toArray()
            res.send(result)
        })

        app.put('/employee-assets-return/:id', verifyToken, verifyEmployee, async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const query = {}
            if (id) {
                query._id = new ObjectId(id)
            }
            update = { $set: status }
            result = await assetRequestCollection.updateOne(query, update)
            res.send(result);
        })


        app.post('/employee-join', verifyToken, verifyEmployee, async (req, res) => {
            const user = req.body;
            const result = await employeeRequestsCollection.insertOne(user)
            res.send(result)
        })

        app.get('/employee-assets-request', verifyToken, verifyEmployee, async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.employeeEmail = email;
            }
            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })

            const result = await employeeRequestsCollection.find(query).toArray()
            const companyNames = result.map(ele => ele.companyName)
            const assets = await assetCollection.find({ companyName: { $in: companyNames } }).toArray()

            res.send(assets)
        })

        app.post('/employee-add-request', verifyToken, verifyEmployee, async (req, res) => {
            const productData = req.body;
            const result = await assetRequestCollection.insertOne(productData)
            res.send(result)
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

        app.post('/add-product', verifyToken, verifyHR, async (req, res) => {
            const product = req.body;
            const result = await assetCollection.insertOne(product)
            res.send(result)
        })

        app.get('/all-asset', verifyToken, verifyHR, async (req, res) => {
            const email = req.query.email;
            const search = req.query.search?.trim();
            let query = { hrEmail: email };
            if (search) {
                query.productName = { $regex: search };
            }

            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })

            const result = await assetCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/all-asset/:id', verifyToken, verifyHR, async (req, res) => {
            const { id } = req.params;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid ID" });
            }
            const query = { _id: new ObjectId(id) }
            const result = await assetCollection.findOne(query);
            res.send(result);

        })

        app.delete('/all-asset/delete/:id', verifyToken, verifyHR, async (req, res) => {
            const id = req.params.id;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid ID" });
            }
            const query = { _id: new ObjectId(id), hrEmail: req.token_email }
            const result = await assetCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/all-asset/edit/:id', verifyToken, verifyHR, async (req, res) => {
            const { id } = req.params;
            const editedProduct = req.body

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid ID" });
            }

            const query = { _id: new ObjectId(id), hrEmail: req.token_email };
            const update = { $set: editedProduct }
            const result = await assetCollection.updateOne(query, update);
            res.send(result);
        })

        app.get('/all-requests', verifyToken, verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.hrEmail = email
            }
            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })
            const result = await assetRequestCollection.find(query).toArray();
            res.send(result);
        })

        app.put('/asset-approval/:id', verifyToken, verifyHR, async (req, res) => {
            const { requestStatus, productId } = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id), hrEmail: req.token_email };
            const update = {
                $set: {
                    requestStatus: requestStatus,
                    approvalDate: new Date()
                }
            }
            const productQuery = {
                _id: new ObjectId(productId),
                productQuantity: { $gt: 0 }
            };
            const assetCountUpdate = await assetCollection.updateOne(productQuery, { $inc: { productQuantity: -1 } })
            console.log(productQuery);


            const result = await assetRequestCollection.updateOne(query, update);
            res.send(result);


        })

        app.put('/asset-reject/:id', verifyToken, verifyHR, async (req, res) => {
            const requestStatus = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id), hrEmail: req.token_email };
            const update = { $set: requestStatus }
            const result = await assetRequestCollection.updateOne(query, update);
            res.send(result);

        })

        app.put('/employee-approval/:id', verifyToken, verifyHR, async (req, res) => {
            const { status, companyName } = req.body;

            const id = req.params.id;
            const query = { _id: new ObjectId(id), hrEmail: req.token_email };
            const LatestUpdate = {
                $set: {
                    status: status,
                    approvalDate: new Date(),
                    companyName: companyName
                }
            }
            const result = await employeeRequestsCollection.updateMany(query, LatestUpdate);
            res.send(result);

        })

        app.put('/employee-reject/:id', verifyToken, verifyHR, async (req, res) => {
            const status = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id), hrEmail: req.token_email };
            const update = { $set: status }
            const result = await employeeRequestsCollection.updateOne(query, update);
            res.send(result);


        })


        app.get('/user-data', verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }
            const options = {
                projection: { password: 0 }
            }

            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })
            const result = await usersCollection.findOne(query, options);
            res.send(result)

        })

        app.get('/employee-request', verifyToken, verifyHR, async (req, res) => {
            const email = req.query.email;

            const query = {}
            if (email) {
                query.hrEmail = email;
            }
            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })
            const result = await employeeRequestsCollection.find(query).toArray()
            res.send(result)

        })

        app.get('/employee-list', verifyToken, verifyHR, async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.hrEmail = email;
                query.status = 'approved';
            }
            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })
            const result = await employeeRequestsCollection.find(query).toArray()
            res.send(result)

        })

        app.delete('/employee-delete/:id', verifyToken, verifyHR, async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { hrEmail: req.token_email }
            if (id) {
                query._id = new ObjectId(id)
            }
            result = await employeeRequestsCollection.deleteOne(query)
            res.send(result);
        })

        app.put('/employee-company', verifyToken, async (req, res) => {
            const { companyName } = req.body
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }
            update = {
                $set: {
                    companyName: companyName
                }
            }
            if (email !== req.token_email) return res.status(403).send({ message: 'forbidden access' })
            result = await usersCollection.updateOne(query, update);
            res.send(result)
        })



        app.post('/profile-update', async (req, res) => {
            const email = req.query.email;
            const userData = req.body
            const query = {}
            if (email) {
                query.email = email
            }
            console.log(email, userData);
            const update = {
                $set: userData
            }
            const result = await usersCollection.updateMany(query, update)
            res.send(result)
        })

        // package api

        app.get('/upgrade-package', async (req, res) => {
            const result = await packageCollection.find().toArray()
            res.send(result)
        })

        // payment apis 

        app.post('/create-checkout-session', verifyToken, verifyHR, async (req, res) => {
            const { id, email } = req.body;
            if (!id || !email) return res.status(404).send({ message: 'Not Found' })

            const query = { _id: new ObjectId(id) }
            const packageData = await packageCollection.findOne(query)
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'USD',
                            unit_amount: packageData.price * 100,
                            product_data: {
                                name: packageData.name
                            }
                        },
                        quantity: 1
                    },
                ],
                metadata: {
                    packageName: packageData.name,
                    packageLimit: packageData.employeeLimit
                },
                customer_email: email,
                mode: 'payment',
                success_url: `${process.env.SITE_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.SITE_DOMAIN}/payment-cancel`,
            });

            res.send({ url: session.url })
        });

        app.get('/payment-status', verifyToken, verifyHR, async (req, res) => {
            const sessionId = req.query.session_id
            if (sessionId) {
                const session = await stripe.checkout.sessions.retrieve(sessionId)

                const paymentData = {
                    userName: session.customer_details.name,
                    userEmail: session.customer_details.email,
                    paymentStatus: session.payment_status,
                    packageName: session.metadata.packageName,
                    packageLimit: parseInt(session.metadata.packageLimit),
                    packageAmount: session.amount_total,
                    transactionId: session.payment_intent
                }


                if (session.payment_status === 'paid') {
                    const query = {
                        email: session.customer_details.email,
                        processedSessions: { $ne: sessionId }
                    }

                    const update = {
                        $inc: { packageLimit: parseInt(session.metadata.packageLimit) },
                        $set: { subscription: session.metadata.packageName },
                        $push: { processedSessions: sessionId }
                    }
                    const updateLimit = await usersCollection.updateOne(query, update)

                }
                res.send(paymentData)
            }
        })



        app.get('/', (req, res) => {
            res.send('Asset Server is running...');
        });




        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {


    }
}
run().catch(console.dir);

app.listen(process.env.PORT)

