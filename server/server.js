'use Strict';

import express from 'express';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});