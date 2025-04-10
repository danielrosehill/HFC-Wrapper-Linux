#!/usr/bin/env python3
"""
HFC Alerts Wrapper - Python Version
A simple desktop wrapper for the Home Front Command emergency alerts system.
"""

import os
import signal
import webbrowser
import gi

# Set GTK versions before importing
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.0')
# Import GTK modules
from gi.repository import Gtk, WebKit2

# Constants
VERSION = "1.0.0"
HFC_URL = 'https://www.oref.org.il/eng/alerts-history'

class HFCAlertsApp:
    def __init__(self):
        # Create the main window
        self.window = Gtk.Window()
        self.window.set_title(f"HFC Alerts (Unofficial) v{VERSION}")
        self.window.set_default_size(1000, 800)
        self.window.connect("delete-event", self.on_delete_event)
        
        # Try to load icon if it exists
        icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "icon.png")
        if os.path.exists(icon_path):
            self.window.set_icon_from_file(icon_path)
        
        # Create a vertical box to hold our components
        self.vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        self.window.add(self.vbox)
        
        # Create the WebView
        self.webview = WebKit2.WebView()
        self.webview.load_uri(HFC_URL)
        
        # Enable audio
        settings = self.webview.get_settings()
        settings.set_enable_webaudio(True)
        settings.set_enable_media_stream(True)
        settings.set_media_playback_requires_user_gesture(False)
        self.webview.set_settings(settings)
        
        # Create a scrolled window for the webview
        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.add(self.webview)
        self.vbox.pack_start(scrolled_window, True, True, 0)
        
        # Create a horizontal box for buttons
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_box.set_margin_top(10)
        button_box.set_margin_bottom(10)
        button_box.set_margin_start(10)
        button_box.set_margin_end(10)
        
        # Create a button to open in browser
        self.open_button = Gtk.Button(label="Open in Browser")
        self.open_button.connect("clicked", self.open_in_browser)
        button_box.pack_start(self.open_button, True, False, 0)
        
        # Create a refresh button
        self.refresh_button = Gtk.Button(label="Refresh")
        self.refresh_button.connect("clicked", self.refresh_page)
        button_box.pack_start(self.refresh_button, True, False, 0)
        
        # Add button box to main vbox
        self.vbox.pack_start(button_box, False, False, 0)
        
        # Create a label for the disclaimer
        self.disclaimer = Gtk.Label()
        self.disclaimer.set_markup("<b>DISCLAIMER:</b> This is NOT an official Home Front Command utility. It is provided merely as an additional way to receive notifications. No warranty is offered. Do NOT rely upon this as your sole means of alert - always rely on official channels first.")
        self.disclaimer.set_line_wrap(True)
        self.disclaimer.set_justify(Gtk.Justification.CENTER)
        self.disclaimer.set_margin_top(10)
        self.disclaimer.set_margin_bottom(10)
        self.disclaimer.set_margin_start(20)
        self.disclaimer.set_margin_end(20)
        
        # Add disclaimer to main vbox
        self.vbox.pack_start(self.disclaimer, False, False, 0)
        
        # Add version info
        version_label = Gtk.Label()
        version_label.set_markup(f"<small>Version {VERSION}</small>")
        version_label.set_margin_bottom(5)
        self.vbox.pack_start(version_label, False, False, 0)
        
        # Create the status icon (system tray)
        self.create_tray_icon()
        
        # Show all elements
        self.window.show_all()
    
    def create_tray_icon(self):
        # Create the status icon
        self.status_icon = Gtk.StatusIcon()
        self.status_icon.set_tooltip_text(f"HFC Alerts (Unofficial) v{VERSION}")
        
        # Try to load icon if it exists
        icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "icon.png")
        if os.path.exists(icon_path):
            self.status_icon.set_from_file(icon_path)
        else:
            self.status_icon.set_from_stock(Gtk.STOCK_INFO)
        
        # Connect signals
        self.status_icon.connect("activate", self.on_tray_icon_activate)
        self.status_icon.connect("popup-menu", self.on_tray_icon_popup_menu)
    
    def on_tray_icon_activate(self, widget):
        # Show/hide the window when clicking on the tray icon
        if self.window.get_visible():
            self.window.hide()
        else:
            self.window.show()
            self.window.present()
    
    def on_tray_icon_popup_menu(self, widget, button, time):
        # Create the popup menu
        menu = Gtk.Menu()
        
        # Create menu items
        show_item = Gtk.MenuItem(label="Show/Hide")
        show_item.connect("activate", self.on_tray_icon_activate)
        
        refresh_item = Gtk.MenuItem(label="Refresh")
        refresh_item.connect("activate", self.refresh_page)
        
        open_browser_item = Gtk.MenuItem(label="Open in Browser")
        open_browser_item.connect("activate", self.open_in_browser)
        
        quit_item = Gtk.MenuItem(label="Quit")
        quit_item.connect("activate", self.quit)
        
        # Add items to menu
        menu.append(show_item)
        menu.append(refresh_item)
        menu.append(open_browser_item)
        menu.append(Gtk.SeparatorMenuItem())
        menu.append(quit_item)
        
        # Show the menu
        menu.show_all()
        menu.popup(None, None, None, self.status_icon, button, time)
    
    def on_delete_event(self, widget, event):
        # Hide the window instead of closing it
        self.window.hide()
        return True
    
    def open_in_browser(self, widget=None):
        # Open the URL in the default browser
        webbrowser.open(HFC_URL)
    
    def refresh_page(self, widget=None):
        # Refresh the webpage
        self.webview.reload()
    
    def quit(self, widget=None):
        # Quit the application
        Gtk.main_quit()

def main():
    # Print version info
    print(f"HFC Alerts Wrapper v{VERSION}")
    print("Unofficial Home Front Command Alerts Wrapper")
    print(f"Monitoring URL: {HFC_URL}")
    
    # Initialize GTK
    HFCAlertsApp()
    
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    
    # Start the GTK main loop
    Gtk.main()

if __name__ == "__main__":
    main()
