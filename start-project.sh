#!/bin/bash

echo "Starting Inventory Management System..."
echo

# Make script executable
chmod +x start-project.sh

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed! Please install Node.js from https://nodejs.org/"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing dependencies!"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Start the development server
echo "Starting development server..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    open http://localhost:3000 &
fi
npm start 