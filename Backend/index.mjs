import express from "express";
//requireing both sqlite and sqlite3 packages
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { format } from 'date-fns';
import {v4 as generatePassword} from 'uuid';
import cors from "cors";

const corsOptions = {
  origin: "http://localhost:3004",
};

//setting path to database
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join( __dirname , '/taskListDatabase.db');
let db = null;

async function databaseSetup () {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(8082, () => {
            console.log("server listening on port 8082")
        });
        console.log("database connected successfully");
    } catch (e) {
        console.log(e.message);
        process.exit(1)
    }
}

databaseSetup();

const app = express();
app.use(express.json())
app.use(cors(corsOptions));

const convertSnakeCaseToCamalCase = (array) => {
    const newArray = array.map((eachItem) => {
        const {id, task_detail, last_date} = eachItem;
        const newItem = {
            id: eachItem.id,
            taskDetail: eachItem.task_detail,
            lastDate: eachItem.last_date
        }
        return newItem
    });
    return newArray;
}

app.get('/createTable', async (req, res) => {
    const createTableQuery = `
    CREATE TABLE Task (
        id varchar(50),
        task_detail text,
        last_date date
    );`;
    await db.exec(createTableQuery);
    console.log("table created successfully");
});

app.post('/insertData', async (req, res) => {
    const {taskDetail, lastDate} = req.body;
    const insertDataQuery = `
    INSERT INTO Task (id, task_detail, last_date)
    VALUES( '${generatePassword()}', '${taskDetail}', '${lastDate}');`;
    await db.exec(insertDataQuery);
    
    const bringAllQuery = `select * from Task order by last_date asc;`;
    const data = await db.all(bringAllQuery);
    const updatedData = convertSnakeCaseToCamalCase(data);
    res.json(updatedData);
});

app.get('/printTable', async (req, res) => {
    const bringAllQuery = `select * from Task order by last_date asc;`;
    const data = await db.all(bringAllQuery);
    const updatedData = convertSnakeCaseToCamalCase(data);
    res.json(updatedData);
});

app.put('/change/task/:taskId', async (req, res) => {
    const {taskId} = req.params;
    const {taskDetail, lastDate} = req.body;
    const updateTaskQuery = `
            UPDATE Task
        SET task_detail = '${taskDetail}',
            last_date = '${lastDate}'
        WHERE
            id = '${taskId}';`;
    await db.run(updateTaskQuery);

    const bringAllQuery = `select * from Task order by last_date asc;`;
    const data = await db.all(bringAllQuery);
    const updatedData = convertSnakeCaseToCamalCase(data);
    res.json(updatedData);
});

app.delete('/delete/task/:taskId', async (req, res) => {
    const {taskId} = req.params;
    const deleteTaskQuery = `
    DELETE FROM Task
    WHERE id = '${taskId}';`;
    await db.run(deleteTaskQuery);

    const bringAllQuery = `select * from Task order by last_date asc;`;
    const data = await db.all(bringAllQuery);
    const updatedData = convertSnakeCaseToCamalCase(data);
    res.json(updatedData);
});