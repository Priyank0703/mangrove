#!/bin/bash

echo "Starting Community Mangrove Watch Project..."

echo
echo "Step 1: Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies"
    exit 1
fi

echo
echo "Step 2: Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    exit 1
fi

echo
echo "Step 3: Starting Backend Server..."
cd ../backend
gnome-terminal --title="Backend Server" -- bash -c "npm run dev; exec bash" &
# Alternative for different terminals:
# xterm -title "Backend Server" -e "npm run dev" &
# konsole --title "Backend Server" -e bash -c "npm run dev; exec bash" &

echo
echo "Step 4: Starting Frontend Server..."
cd ../frontend
gnome-terminal --title="Frontend Server" -- bash -c "npm run dev; exec bash" &
# Alternative for different terminals:
# xterm -title "Frontend Server" -e "npm run dev" &
# konsole --title "Frontend Server" -e bash -c "npm run dev; exec bash" &

echo
echo "Both servers are starting..."
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo
echo "IMPORTANT: Make sure you have created the .env file in the backend directory!"
echo
read -p "Press Enter to continue..."
