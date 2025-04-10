// This script will be injected into the webpage to add our custom UI elements
const APP_VERSION = '1.0.0';

// Create and inject custom CSS
const style = document.createElement('style');
style.textContent = `
  .hfc-wrapper-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
    padding: 10px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .hfc-wrapper-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .hfc-wrapper-button {
    background-color: #0d6efd;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .hfc-wrapper-button:hover {
    background-color: #0b5ed7;
  }
  
  .hfc-wrapper-disclaimer {
    font-weight: bold;
    color: #dc3545;
    text-align: center;
    margin: 0;
    font-size: 0.9rem;
    max-width: 80%;
  }
  
  .hfc-wrapper-version {
    font-size: 0.8rem;
    color: #6c757d;
    margin-top: 5px;
  }
  
  .hfc-wrapper-status {
    font-size: 0.8rem;
    color: #198754;
    margin-top: 5px;
  }
`;
document.head.appendChild(style);

// Create and add our custom controls
const controlsDiv = document.createElement('div');
controlsDiv.className = 'hfc-wrapper-controls';

// Create buttons container
const buttonsDiv = document.createElement('div');
buttonsDiv.className = 'hfc-wrapper-buttons';

// Add "Open in Browser" button
const openButton = document.createElement('button');
openButton.className = 'hfc-wrapper-button';
openButton.textContent = 'Open in Browser';
openButton.addEventListener('click', () => {
  window.api.openInBrowser();
});
buttonsDiv.appendChild(openButton);

// Add "Refresh" button
const refreshButton = document.createElement('button');
refreshButton.className = 'hfc-wrapper-button';
refreshButton.textContent = 'Refresh';
refreshButton.addEventListener('click', () => {
  location.reload();
});
buttonsDiv.appendChild(refreshButton);

// Add buttons container to controls
controlsDiv.appendChild(buttonsDiv);

// Add disclaimer text
const disclaimer = document.createElement('p');
disclaimer.className = 'hfc-wrapper-disclaimer';
disclaimer.textContent = 'DISCLAIMER: This is NOT an official Home Front Command utility. It is provided merely as an additional way to receive notifications. No warranty is offered. Do NOT rely upon this as your sole means of alert - always rely on official channels first.';
controlsDiv.appendChild(disclaimer);

// Add version info
const versionInfo = document.createElement('p');
versionInfo.className = 'hfc-wrapper-version';
versionInfo.textContent = `Version ${APP_VERSION}`;
controlsDiv.appendChild(versionInfo);

// Add connection status
const statusInfo = document.createElement('p');
statusInfo.className = 'hfc-wrapper-status';
statusInfo.textContent = 'Connection active';
controlsDiv.appendChild(statusInfo);

// Add the controls to the page
document.body.appendChild(controlsDiv);

// Function to ensure audio is enabled
function enableAudio() {
  // Find all audio elements and ensure they can play
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    audio.muted = false;
    
    // Try to play any paused audio that might be alerts
    if (audio.paused && audio.currentTime === 0) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Auto-play prevented by browser policy:', error);
        });
      }
    }
  });
  
  // Update connection status
  statusInfo.textContent = `Connection active - Last check: ${new Date().toLocaleTimeString()}`;
}

// Run enableAudio periodically to ensure alerts are heard
setInterval(enableAudio, 5000);

// Also run when the page changes
const observer = new MutationObserver(mutations => {
  enableAudio();
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Initial run
enableAudio();
