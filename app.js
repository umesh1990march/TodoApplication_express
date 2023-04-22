const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => console.log("Server Started"));
  } catch (err) {
    console.log(`DB: ${err.msg}`);
    process.exit(1);
  }
};

initializeDb();

app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  //console.log(priority);
  const fetchTodoData = `select * from todo
  where 
  priority like '%${priority}%'
  and
  status like "%${status}%"
  and 
  todo like '%${search_q}%'`;
  const todoArray = await db.all(fetchTodoData);
  response.send(todoArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const fetchTodoIdDetails = `select * from todo
    where id = ${todoId};`;
  const todoDetails = await db.get(fetchTodoIdDetails);
  response.send(todoDetails);
});

app.post("/todos/", async (request, response) => {
  const todoAddDetails = request.body;
  console.log(todoAddDetails);
  const { id, todo, priority, status } = todoAddDetails;
  const addTodo = `INSERT INTO todo
(id,todo,priority,status)VALUES
(${id},"${todo}","${priority}","${status}");`;

  const res = await db.run(addTodo);
  const Id = res.lastID;
  console.log(Id);
  response.send("Todo Successfully Added");
  // console.log(res);
});

app.put("/todos/:todoId/", async (request, response) => {
  const todoUpdate = request.body;
  const { todo, priority, status } = todoUpdate;
  console.log(todoUpdate);
  const { todoId } = request.params;
  if (todo !== undefined) {
    const update = `update todo
  set 
  todo = '${todo}'
  where id = ${todoId};`;
    await db.run(update);
    response.send("Todo Updated");
  } else if (priority !== undefined) {
    const update = `update todo
  set 
  priority = '${priority}'
  where id = ${todoId};`;
    await db.run(update);
    response.send("Priority Updated");
  } else if (status !== undefined) {
    const update = `update todo
  set 
  status = '${status}'
  where id = ${todoId};`;
    await db.run(update);
    response.send("Status Updated");
  }
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `delete from todo 
                            where id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
