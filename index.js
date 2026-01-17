require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(express.json());

let products = [
  { id: 1, name: 'Laptop', price: 19999, description: 'High-performance laptop' },
];

let nextId = 2;

// In-memory users
let users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    role: 'user'
  }
];

// Login (JWT Authentication)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Role-based authorization middleware
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}


// POST /products
app.post('/products', authenticateToken, authorizeRole('admin'), (req, res) => {
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
app.get('/products', authenticateToken,(req, res) => {
  res.json(products);
});

// GET /products/:id
app.get('/products/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({error: 'Product not found'});
  }
  res.json(product);
});

// PUT /products/:id
app.put('/products/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
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
app.delete('/products/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({error: 'Product not found'});
  }

  products.splice(index, 1);
  res.json({message: 'Product deleted'});
});


const PORT = process.env.PORT || 3000;

// Start listening for requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
