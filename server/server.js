import express from 'express';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Dateipfad ermitteln zum Speicherort der Daten
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_TASKS_PATH = path.join(__dirname, '../data/tasks.json');

const app = express();
const PORT = process.env.PORT || 8080;

// JSON-Middleware
app.use(express.json());

// Middleware für Formulardaten
app.use(express.urlencoded({ extended: true }));

// Statische Dateien ausliefern (z.B. HTML, CSS, JS aus dem Ordner 'public')
app.use(express.static(path.resolve('public')));

// GET tasks------------------------------------------------------------------------------------
app.get('/api/tasks', async (req, res) => {
  try {
    // JSON-Datei lesen
    const jsonData = await fs.promises.readFile(DATA_TASKS_PATH, 'utf-8');
    const tasks = JSON.parse(jsonData);

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Datei konnte nicht gelesen werden' });
  }
});

// GET einzelne Task--------------------------------------------------------
app.get('/api/tasks/:id', async (req, res) => {
  try {
    // JSON-Datei lesen
    const jsonData = await fs.promises.readFile(DATA_TASKS_PATH, 'utf8');
    const tasks = JSON.parse(jsonData);

    const task = tasks.find(t => t.id === req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    // Gefundene Task zurückgeben
    res.json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Aufgabe konnte nicht geladen werden' });
  }
});

// POST tasks-------------------------------------------------------------------------------------
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, employee, startDate, endDate, description } = req.body;

    // Pflichtfelder prüfen
    if (!title || !employee || !startDate || !endDate || !description) {
      return res.status(400).json({ error: 'Alle Felder müssen ausgefüllt sein.' });
    }

    // Startdatum darf nicht nach Enddatum sein
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Startdatum darf nicht nach Enddatum liegen.' });
    }

    // JSON-Datei lesen
    const jsonData = await fs.promises.readFile(DATA_TASKS_PATH, 'utf-8');
    const tasks = JSON.parse(jsonData);

    const newTask = {
      id: crypto.randomUUID(),
      title,
      employee,
      startDate,
      endDate,
      description
    };

    tasks.push(newTask);

    // Datei speichern
    await fs.promises.writeFile(DATA_TASKS_PATH, JSON.stringify(tasks, null, 2));

    res.status(201).json(newTask);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Aufgabe konnte nicht gespeichert werden.' });
  }
});

// PUT tasks---------------------------------------------------------------------------
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, employee, startDate, endDate, description } = req.body;

    // Pflichtfelder prüfen
    if (!title || !employee || !startDate || !endDate || !description) {
      return res.status(400).json({ error: 'Nicht alle Felder ausgefüllt' });
    }

    // Startdatum darf nicht nach Enddatum sein
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Startdatum darf nicht nach Enddatum liegen.' });
    }

    // JSON-Datei lesen
    const jsonData = await fs.promises.readFile(DATA_TASKS_PATH, 'utf8');
    const tasks = JSON.parse(jsonData);

    // Task anhand der ID finden
    const index = tasks.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    // Task aktualisieren
    tasks[index] = {
      ...tasks[index], 
      title,
      employee,
      startDate,
      endDate,
      description
    };

    // Datei speichern
    await fs.promises.writeFile(DATA_TASKS_PATH, JSON.stringify(tasks, null, 2));

    res.json(tasks[index]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Aufgabe konnte nicht aktualisiert werden' });
  }
});

// DELETE tasks----------------------------------------------------------------------------------------------------
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    // JSON-Datei lesen
    const jsonData = await fs.promises.readFile(DATA_TASKS_PATH, 'utf8');
    const tasks = JSON.parse(jsonData);

    const idToDelete = req.params.id;

    // Task, die gelöscht werden soll finden
    const deletedTask = tasks.find(t => t.id === idToDelete);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    // Neues Array ohne die gelöschte Task
    const updatedTasks = tasks.filter(t => t.id !== idToDelete);

    // Datei speichern
    await fs.promises.writeFile(DATA_TASKS_PATH, JSON.stringify(updatedTasks, null, 2));

    res.json({ status: 'ok', deletedTask });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Aufgabe konnte nicht gelöscht werden' });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
