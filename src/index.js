const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const customers = [];

app.use(express.json());

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(customer => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" })
  }

  const customer = {
    id: uuidv4(),
    cpf,
    name,
    statements: []
  }

  customers.push(customer);

  return res.status(201).json(customer);
});

app.listen(3333);
