const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv=require("dotenv")
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
dotenv.config();


const middlewares = require('./middlewares');  

const app = express();

app.use(morgan('dev'));      
app.use(helmet());           
app.use(cors());


app.use(express.json());     


const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);


app.get("/", (req, res) => {
    res.json({
        message: 'on',
    });
});


app.get("/api/login", async (req, res) => {

    const nombreUsuario = req.query.usuario;
    const contraseñaUsuario = req.query.contraseña;
      try {
        await client.connect();
        const database = client.db("restaurante");
        const usuarios = database.collection("usuarios");
        const user = await usuarios.findOne({nombre: nombreUsuario,password:contraseñaUsuario});  
    
        if (!user) {
          return res.status(401).json({ error: "❌ Usuario no encontrado" });
        }
        res.json({ message: "✅ Login exitoso", user });
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ error: "Error al obtener los usuarios" });
      }
  });
  app.post("/api/registro", async (req, res) => {
    let usuarionuevo=req.body
    try {
      const database = client.db("restaurante");
      const usuarios = database.collection("usuarios");
      await usuarios.insertOne(usuarionuevo);
      res.json({usuarionuevo})
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  });
  

//Listar mesas
app.get("/api/mesas", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("restaurante");
    const mesas = database.collection("mesas");
    
    const lista_mesas = await mesas.find({}).toArray();

    res.json(lista_mesas);
  } catch (error) {
    console.error("Error al obtener las mesas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Reservar Mesa
app.put("/api/mesas/reservar", async (req, res) => {
  const { nombreMesa, nombreReserva } = req.body;
  try {
    await client.connect();
    const database = client.db("restaurante");
    const mesas = database.collection("mesas");
    const result = await mesas.updateOne(
      { nombreMesa: nombreMesa },
      { $set: { estado: "Ocupada", nombreReserva: nombreReserva } }
    );
    res.json({ message: "Mesa reservada", result });
  } catch (error) {
    console.error("Error al reservar la mesa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Borrar reserva
app.put("/api/mesas/borrarReserva", async (req, res) => {
  const { nombreMesa } = req.body;
  try {
    await client.connect();
    const database = client.db("restaurante");
    const mesas = database.collection("mesas");
    const result = await mesas.updateOne(
      { nombreMesa: nombreMesa },
      { 
        $set: { estado: "Libre" },
        $unset: { nombreReserva: "" }
      }
    );
    res.json({ message: "Reserva borrada exitosamente", result });
  } catch (error) {
    console.error("Error al borrar la reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Listar pedidos
app.get("/api/pedidos", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("restaurante");
    const pedidos = database.collection("pedidos");
    
    const lista_pedidos = await pedidos.find({}).toArray();

    res.json(lista_pedidos);
  } catch (error) {
    console.error("Error al obtener las mesas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Hacer pedidos
app.post("/api/pedidos", async (req, res) => {
  const { nombreCliente, direccion, telefono, items, total } = req.body;
  try {
    await client.connect();
    const database = client.db("restaurante");
    const pedidos = database.collection("pedidos");
    
    // Insertar el pedido en la base de datos
    const result = await pedidos.insertOne({
      nombreCliente,
      direccion,
      telefono,
      items,
      total,
      fecha: new Date()  
    });
    res.json({ message: "Pedido insertado exitosamente", result });
  } catch (error) {
    console.error("Error al insertar el pedido:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Borrar pedidos
app.delete("/api/pedidos/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await client.connect();
    const database = client.db("restaurante");
    const pedidos = database.collection("pedidos");
    const result = await pedidos.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Pedido eliminado exitosamente", result });
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//listar platos
app.get("/api/platos", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("restaurante");
    const platos = database.collection("platos");
    
    const lista_platos = await platos.find({}).toArray();

    res.json(lista_platos);
  } catch (error) {
    console.error("Error al obtener los platos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});




app.use(middlewares.notFound);
app.use(middlewares.errorHandler);


module.exports = app;
