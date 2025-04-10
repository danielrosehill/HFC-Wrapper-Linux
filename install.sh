#!/bin/bash
# Installation script for HFC Alerts Wrapper

echo "Installing HFC Alerts Wrapper..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo for system-wide installation"
    exit 1
fi

# Detect the Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    echo "Could not detect Linux distribution"
    DISTRO="unknown"
fi

# Install dependencies based on distribution
case $DISTRO in
    "fedora")
        echo "Detected Fedora Linux"
        dnf install -y python3-gobject python3-cairo python3-pip python3-webkit2gtk3
        ;;
    "ubuntu"|"debian"|"pop"|"elementary"|"linuxmint")
        echo "Detected Debian-based distribution"
        apt-get update
        apt-get install -y python3-gi python3-gi-cairo python3-pip gir1.2-webkit2-4.0
        ;;
    "arch"|"manjaro")
        echo "Detected Arch-based distribution"
        pacman -S --noconfirm python-gobject python-cairo python-pip webkit2gtk
        ;;
    "opensuse"*)
        echo "Detected openSUSE"
        zypper install -y python3-gobject python3-cairo python3-pip webkit2gtk3
        ;;
    *)
        echo "Unknown distribution. Please install the following packages manually:"
        echo "- Python 3"
        echo "- PyGObject (python-gobject)"
        echo "- PyCairo (python-cairo)"
        echo "- WebKit2GTK (webkit2gtk)"
        ;;
esac

# Install Python dependencies
pip3 install -r requirements.txt

# Make the Python script executable
chmod +x hfc_alerts.py

# Create desktop entry
cat > /usr/share/applications/hfc-alerts.desktop << EOF
[Desktop Entry]
Name=HFC Alerts
Comment=Unofficial Home Front Command Alerts Wrapper
Exec=$(pwd)/hfc_alerts.py
Icon=$(pwd)/assets/icon.png
Terminal=false
Type=Application
Categories=Network;
EOF

echo "Installation complete!"
echo "You can now run the application from your applications menu or by running:"
echo "$(pwd)/hfc_alerts.py"
