const express = require('express');
const cors =require('cors');
const app = express();
require('dotenv').config();
const { MongoClient,MongoRuntimeError } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hu6ur.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db("watchdb");
        const productsCollection = database.collection("products");
        const usersCollection =database.collection('users');
        const registeredUsersCollection =database.collection('registeredusers');
        const reviewsCollection=database.collection('reviews');
        

        //POST API/ to post reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        });


        //GET API to get all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // GET all users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            console.log(users);
            res.send(users);
        })
        // POST users
        app.post('/users', async(req,res)=>{
            const user = req.body;
            console.log('hit the post api',user);
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        // POST registered user info
        app.post('/registeredusers', async(req,res)=>{
            const registereduser = req.body;
            const result = await registeredUsersCollection.insertOne(registereduser);
            console.log(result);
            res.json(result);
        })

        // /////
        app.get('/registeredusers/:email',async(req,res)=>{
            const email = req.params.email;
            const query ={email:email};
            const user = await registeredUsersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin=true;
            }
            res.json({admin: isAdmin});
        })

        // 
        app.put('/registeredusers',async(req,res)=>{
            const registereduser = req.body;
            console.log('put',registereduser);
            const filter={email:registereduser.email};
            const options ={upsert:true};
            const updateDoc={$set: registereduser};
            const result=await registeredUsersCollection.updateOne(filter,updateDoc,options);
            res.json(result);
        })

        // 
        app.put('/registeredusers/admin',async(req,res)=>{
            const user=req.body;
            console.log('put',user);
            const filter={email:user.email};
            const updateDoc={$set: {role:'admin'}};
            const result=await registeredUsersCollection.updateOne(filter,updateDoc);
            res.json(result);
        })

         // DELETE API for user

            app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = usersCollection.deleteOne(query);
            console.log('delete the users by id', id)
            res.json(result)
        })
        
        
        
        
        // GET API
        app.get('/products',async(req,res)=>{
            const cursor= productsCollection.find({})
            const products=await cursor.toArray();
            res.send(products);
        })
        // GET a single data
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            console.log('Getting particular id', id)
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
            console.log(product);
        })

        // POST API
        app.post('/products',async(req,res)=>{
            const product =req.body;
            console.log('hit the post api',product);
            
            
            const result=await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        })
        // DELETE API FOR a single product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        //update API user
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateUser[0]
                }
            };
            const result = await usersCollection.updateMany(filter, updateDoc, options);
            console.log(result)
            res.send(result);


        });
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Watch shop!')
})

app.listen(port, () => {
        console.log(`listening at ${port}`)
})