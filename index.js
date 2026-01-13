const express = require('express');
const app = express();

app.use(express.json());

let products = [
  { id: 1, name: 'Laptop', price: 19999, description: 'High-performance laptop' },
];

let nextId = 3;

// POST /products
app.post('/products', (req, res) => {
  const { name, price, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({error: 'Name and price are required'});
  }

  const newProduct = {
    id: nextId,
    name,
    price,
    description: description || ''
  };

  products.push(newProduct);
  nextId++;
  res.status(201).json(newProduct);
});

// GET /products
app.get('/products', (req, res) => {
  res.json(products);
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({error: 'Product not found'});
  }
  res.json(product);
});

// PUT /products/:id
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({error: 'Product not found'});
  }

  const { name, price, description } = req.body;

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (description !== undefined) product.description = description;
  res.json(product);
});

// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({error: 'Product not found'});
  }

  const deletedProduct = products.splice(index, 1);
  res.json({message: 'Product deleted'});
});


const PORT = process.env.PORT || 3000;

// Start listening for requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
