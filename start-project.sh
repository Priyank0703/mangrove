#!/bin/bash

echo "Starting Community Mangrove Watch..."
echo

echo "Starting Backend Server..."
cd backend
gnome-terminal --title="Backend Server" -- bash -c "npm run dev; exec bash" &
# For macOS, use: open -a Terminal "npm run dev"
# For other Linux distros, you might need to adjust the terminal command

echo
echo "Starting Frontend Server..."
cd ../frontend
gnome-terminal --title="Frontend Server" -- bash -c "npm run dev; exec bash" &
# For macOS, use: open -a Terminal "npm run dev"
# For other Linux distros, you might need to adjust the terminal command

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Make sure MongoDB is running before starting the backend!"
echo
echo "Press any key to continue..."
read -n 1
