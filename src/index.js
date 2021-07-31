const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(express.json());

// Middleware
function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(404).json({ error: "Costumer not found!" });
  }

  req.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

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

// app.use(verifyIfExistsAccountCPF)

app.get("/statements", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  return res.status(200).json(customer.statements);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;

  const { customer } = req;

  const statementOperations = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statements.push(statementOperations);

  return res.status(201).json(statementOperations);
});

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;

  const { customer } = req;

  const balance = getBalance(customer.statements);

  if (balance < amount) {
    return res.status(400).json({ error: "Not enough funds!" });
  }

  const statementOperations = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statements.push(statementOperations);

  return res.status(201).json(statementOperations);
});

app.get("/statements/date", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statements = customer.statements.filter(
    (statement) =>
      statement.created_at.toDateString() === dateFormat.toDateString()
  );

  return res.status(200).json(statements);
});

app.put("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { name } = req.body;

  customer.name = name;

  return res.status(200).send();
});

app.get("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  return res.status(200).json(customer);
});

app.listen(3333);
