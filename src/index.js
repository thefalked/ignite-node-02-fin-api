const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(express.json());

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" });
  }

  const customer = {
    id: uuidv4(),
    cpf,
    name,
    statements: [],
  };

  customers.push(customer);

  return res.status(201).json(customer);
});

app.get("/statements", (req, res) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(404).json({ error: "Costumer not found!" });
  }

  return res.status(200).json(customer.statements);
});

app.listen(3333);
