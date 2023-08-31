const express = require("express");
const { Sequelize, QueryTypes, DataTypes } = require("sequelize");
const cors = require("cors");
const app = express();

const sequelize = new Sequelize(
  "mysql://sergey:sergey@localhost:3306/photo_app"
);

const task = sequelize.define("tasks", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  text: {
    type: DataTypes.STRING,
  },
  completed: {
    type: DataTypes.BOOLEAN,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

app.use(express.json());
app.use(cors());

app.get("/tasks", async function (req, res) {
  const tasks = await task.findAll();
  res.json(tasks);
});

app.post("/tasks", async function (req, res) {
  try {
    const newText = req.body.text;
    const newTask = await task.create({
      text: newText,
      completed: false,
    });
    res.json(newTask);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/tasks/:id", async function (req, res) {
  const taskToUpdate = await task.findByPk(req.params.id);
  if (!taskToUpdate) {
    return res.status(404).send();
  }
  try {
    await task.update(
      {
        completed: !taskToUpdate.completed,
      },
      {
        where: { id: req.params.id },
      }
    );
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});
app.delete("/tasks/:id", async function (req, res) {
  try {
    await task.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

const run = async () => {
  try {
    sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  app.listen(4000);
  console.log(`Server is running on port 4000`);
};
run();
