#!/bin/bash
# Installation script for HFC Alerts Wrapper (Electron version)

echo "Installing HFC Alerts Wrapper (Electron version)..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo for system-wide installation"
    exit 1
fi

# Check if npm and node are installed
if ! command -v npm &> /dev/null || ! command -v node &> /dev/null; then
    echo "Node.js and npm are required but not installed."
    
    # Detect the Linux distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    else
        echo "Could not detect Linux distribution"
        DISTRO="unknown"
    fi
    
    # Suggest installation command based on distribution
    case $DISTRO in
        "fedora")
            echo "Install with: sudo dnf install -y nodejs npm"
            ;;
        "ubuntu"|"debian"|"pop"|"elementary"|"linuxmint")
            echo "Install with: sudo apt-get install -y nodejs npm"
            ;;
        "arch"|"manjaro")
            echo "Install with: sudo pacman -S --noconfirm nodejs npm"
            ;;
        "opensuse"*)
            echo "Install with: sudo zypper install -y nodejs npm"
            ;;
        *)
            echo "Please install Node.js and npm manually"
            ;;
    esac
    
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the AppImage
echo "Building AppImage..."
npm run make:appimage

# Check if build was successful
if [ ! -d "./dist" ] || [ -z "$(find ./dist -name '*.AppImage')" ]; then
    echo "Failed to build AppImage. Please check for errors."
    exit 1
fi

APPIMAGE_PATH=$(find ./dist -name '*.AppImage' | head -n 1)
echo "AppImage created at: $APPIMAGE_PATH"

# Make the AppImage executable
chmod +x "$APPIMAGE_PATH"

# Create installation directories
mkdir -p /usr/local/bin
mkdir -p /usr/local/share/hfc-alerts
mkdir -p /usr/share/applications

# Copy the AppImage to /usr/local/bin
cp "$APPIMAGE_PATH" /usr/local/bin/hfc-alerts
chmod +x /usr/local/bin/hfc-alerts

# Copy assets to /usr/local/share/hfc-alerts
cp -r assets /usr/local/share/hfc-alerts/

# Copy desktop entry
cp hfc-alerts.desktop /usr/share/applications/

echo "Installation complete!"
echo "You can now run HFC Alerts from your applications menu or by running:"
echo "hfc-alerts"
