#!/bin/bash
# Run script for HFC Alerts Wrapper
# This script detects which version to run based on available dependencies

echo "HFC Alerts Wrapper Launcher"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "hfc_alerts.py" ] || [ ! -f "main.js" ]; then
    echo "Error: Please run this script from the HFC-Wrapper-Linux directory"
    exit 1
fi

# Check if Node.js is installed for Electron version
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing Node.js dependencies..."
        npm install
    fi
    
    echo "Starting Electron version..."
    npm start
    exit 0
fi

# If Node.js not available, try Python version
if command -v python3 &> /dev/null; then
    # Check for GTK dependencies
    if python3 -c "import gi; gi.require_version('Gtk', '3.0'); gi.require_version('WebKit2', '4.0'); from gi.repository import Gtk, WebKit2" &> /dev/null; then
        echo "Starting Python GTK version..."
        ./hfc_alerts.py
        exit 0
    else
        echo "Error: Python GTK dependencies not installed"
        echo "Please install the required packages:"
        echo "For Fedora: sudo dnf install python3-gobject python3-cairo python3-webkit2gtk3"
        echo "For Ubuntu/Debian: sudo apt-get install python3-gi python3-gi-cairo gir1.2-webkit2-4.0"
        echo "For Arch: sudo pacman -S python-gobject python-cairo webkit2gtk"
        echo "Or run the installer: sudo ./install.sh"
        exit 1
    fi
else
    echo "Error: Neither Node.js nor Python with GTK found"
    echo "Please install either:"
    echo "1. Node.js and npm for the Electron version"
    echo "2. Python 3 with GTK bindings for the Python version"
    echo "Or run one of the installers: sudo ./install.sh or sudo ./install-electron.sh"
    exit 1
fi
