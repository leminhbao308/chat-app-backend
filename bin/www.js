#!/usr/bin/env node

/**
 * Module dependencies.
 */
import App from "../src/app.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Configuration and Environment Setup
 */
const PORT = normalizePort(process.env.PORT || '3000');
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Server Initialization
 */
class Server {
    constructor(app, port) {
        this.app = app;
        this.port = port;
    }

    start() {
        // Set port on the Express app
        const expressApp = this.app.getApp();
        expressApp.set('port', this.port);

        // Use the existing HTTP server from App that already has Socket.IO attached
        this.app.listen(this.port);

        console.log(`- Server started successfully`);
        console.log(`- Listening on http://localhost:${this.port}`);
        console.log(`- Documents on http://localhost:${this.port}/api-docs`);
        console.log(`- Environment: ${NODE_ENV}`);
    }
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

// Initialize and start the server
const server = new Server(App, PORT);
server.start();
