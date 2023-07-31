const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new MongoClient(process.env.DB_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        const productCollection = client
            .db("ComponentXperts")
            .collection("products");

        const catagoryCollection = client
            .db("ComponentXperts")
            .collection("catagories");

        const buildCollection = client
            .db("ComponentXperts")
            .collection("builds");

        // load all products
        app.get("/api/products", async (req, res) => {
            try {
                const products = await productCollection.find({}).toArray();
                res.json(products);
            } catch (error) {
                console.error("Error fetching products:", error);
                res.status(500).json({ error: "Failed to fetch products" });
            }
        });

        // load one product
        app.get("/api/products/:productId", async (req, res) => {
            const { productId } = req.params;
            try {
                const product = await productCollection.findOne({
                    _id: new ObjectId(productId),
                });
                if (!product) {
                    return res.status(404).json({ error: "Product not found" });
                }
                res.json(product);
            } catch (error) {
                console.error("Error fetching product by id:", error);
                res.status(500).json({ error: "Failed to fetch product" });
            }
        });

        // load all catagories
        app.get("/api/categories", async (req, res) => {
            try {
                const categories = await catagoryCollection.find({}).toArray();
                res.json(categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                res.status(500).json({ error: "Failed to fetch categories" });
            }
        });

        // load one catagory
        app.get("/api/categories/:category", async (req, res) => {
            const { category } = req.params;
            try {
                const products = await productCollection
                    .find({ category: category })
                    .toArray();
                res.json(products);
            } catch (error) {
                console.error("Error fetching products by category:", error);
                res.status(500).json({
                    error: "Failed to fetch products by category",
                });
            }
        });

        // post pc build
        app.post("/api/pc-build", async (req, res) => {
            const pcBuild = req.body;
            try {
                await buildCollection.insertOne(pcBuild);
                res.status(201).json({
                    message: "PC build saved successfully",
                });
            } catch (error) {
                console.error("Error saving PC build:", error);
                res.status(500).json({ error: "Failed to save PC build" });
            }
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("ComponentXperts backend server is running");
});

app.listen(port, () => {
    console.log(`ComponentXperts app is listening on port ${port}`);
});
