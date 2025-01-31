import express from 'express';
import loadConfig from './config/loadConfig.js';
import connectToDatabase from './config/db.js';
import routes from './routes/index.js';

const startServer = async () => {
    const config = await loadConfig();

    await loadConfig();
    const app = express();

    app.use(express.json());

    await connectToDatabase(config.DB_URI);

    app.use('/', routes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();