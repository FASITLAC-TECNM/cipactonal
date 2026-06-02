import dotenv from 'dotenv';
import app from './app.js';
import { iniciarCronFaltas } from './jobs/faltasCron.js';
import { iniciarCronSalidasNoCumplidas } from './jobs/salidasCron.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    const line = '─'.repeat(45);
    logger.info(`📦 ${process.env.NODE_ENV}`);
    logger.info(`🛠️  http://localhost:${PORT}`);
    logger.info(`🕓 ${new Date().toLocaleString()}`);
    logger.info(`${line}\n`);

    // Iniciar tareas programadas
    iniciarCronFaltas();
    iniciarCronSalidasNoCumplidas();
});