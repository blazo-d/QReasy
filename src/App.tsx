import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

function App() {
  const [qrValue, setQrValue] = useState('https://manus.ai');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrLogo, setQrLogo] = useState('');
  const [logoSize, setLogoSize] = useState(0.1);
  const [qrType, setQrType] = useState('url'); // url, wifi, event, menu, text

  // Specific fields for different QR types
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA'); // WPA, WEP, nopass

  const [eventName, setEventName] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [menuUrl, setMenuUrl] = useState('');
  const [textValue, setTextValue] = useState('');

  const qrRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQrValue = () => {
    switch (qrType) {
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'event':
        // Basic event structure, can be expanded (e.g., iCalendar format)
        return `BEGIN:VEVENT\nSUMMARY:${eventName}\nDTSTART:${eventStartDate.replace(/-/g, '')}T000000\nDTEND:${eventEndDate.replace(/-/g, '')}T000000\nLOCATION:${eventLocation}\nDESCRIPTION:${eventDescription}\nEND:VEVENT`;
      case 'menu':
        return menuUrl;
      case 'text':
        return textValue;
      case 'url':
      default:
        return qrValue;
    }
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const currentQrValue = generateQrValue();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Free QR Code Generator</h1>
        <p>Create custom QR codes for free. User-friendly and privacy-focused.</p>
      </header>
      <main className="container">
        <div className="controls">
          <h2>Customize Your QR Code</h2>
          
          <div className="control-group">
            <label htmlFor="qrType">QR Code Type:</label>
            <select id="qrType" value={qrType} onChange={(e) => setQrType(e.target.value)}>
              <option value="url">URL</option>
              <option value="text">Text</option>
              <option value="wifi">Wi-Fi</option>
              <option value="event">Event (Basic)</option>
              <option value="menu">Menu (URL)</option>
            </select>
          </div>

          {qrType === 'url' && (
            <div className="control-group">
              <label htmlFor="qrValue">Website URL:</label>
              <input 
                type="text" 
                id="qrValue" 
                value={qrValue} 
                onChange={(e) => setQrValue(e.target.value)} 
                placeholder="e.g., https://www.example.com"
              />
            </div>
          )}

          {qrType === 'text' && (
            <div className="control-group">
              <label htmlFor="textValue">Text:</label>
              <textarea 
                id="textValue" 
                value={textValue} 
                onChange={(e) => setTextValue(e.target.value)} 
                placeholder="Enter your text here"
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <>
              <div className="control-group">
                <label htmlFor="wifiSsid">Network Name (SSID):</label>
                <input type="text" id="wifiSsid" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} />
              </div>
              <div className="control-group">
                <label htmlFor="wifiPassword">Password:</label>
                <input type="password" id="wifiPassword" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} />
              </div>
              <div className="control-group">
                <label htmlFor="wifiEncryption">Encryption:</label>
                <select id="wifiEncryption" value={wifiEncryption} onChange={(e) => setWifiEncryption(e.target.value)}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </div>
            </>
          )}

          {qrType === 'event' && (
            <>
              <div className="control-group">
                <label htmlFor="eventName">Event Name:</label>
                <input type="text" id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              </div>
              <div className="control-group">
                <label htmlFor="eventStartDate">Start Date (YYYY-MM-DD):</label>
                <input type="date" id="eventStartDate" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
              </div>
              <div className="control-group">
                <label htmlFor="eventEndDate">End Date (YYYY-MM-DD):</label>
                <input type="date" id="eventEndDate" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
              </div>
              <div className="control-group">
                <label htmlFor="eventLocation">Location:</label>
                <input type="text" id="eventLocation" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
              </div>
              <div className="control-group">
                <label htmlFor="eventDescription">Description:</label>
                <textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
              </div>
            </>
          )}

          {qrType === 'menu' && (
            <div className="control-group">
              <label htmlFor="menuUrl">Menu URL:</label>
              <input type="text" id="menuUrl" value={menuUrl} onChange={(e) => setMenuUrl(e.target.value)} placeholder="e.g., https://www.restaurant.com/menu" />
            </div>
          )}

          <div className="control-group">
            <label htmlFor="qrColor">QR Code Color:</label>
            <input type="color" id="qrColor" value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
          </div>
          <div className="control-group">
            <label htmlFor="qrBgColor">Background Color:</label>
            <input type="color" id="qrBgColor" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} />
          </div>
          <div className="control-group">
            <label htmlFor="qrLogo">Upload Logo (optional):</label>
            <input type="file" id="qrLogo" accept="image/*" onChange={handleLogoUpload} />
          </div>
          {qrLogo && (
             <div className="control-group">
                <label htmlFor="logoSize">Logo Size (10% to 30%):</label>
                <input 
                    type="range" 
                    id="logoSize" 
                    min="0.1" 
                    max="0.3" 
                    step="0.01" 
                    value={logoSize} 
                    onChange={(e) => setLogoSize(parseFloat(e.target.value))} 
                />
            </div>
          )}
          <button onClick={downloadQRCode} className="download-btn">Download QR Code</button>
        </div>

        <div className="qr-preview" ref={qrRef}>
          <h2>Preview</h2>
          {currentQrValue ? (
            <QRCodeCanvas 
              value={currentQrValue} 
              size={256} 
              fgColor={qrColor}
              bgColor={qrBgColor}
              level={"H"} // High error correction for logo
              imageSettings={qrLogo ? {
                src: qrLogo,
                height: 256 * logoSize,
                width: 256 * logoSize,
                excavate: true,
              } : undefined}
            />
          ) : <p>Please enter data to generate QR code.</p>}
          <p className="privacy-note">We respect your privacy. Static QR codes generated here are not tracked.</p>
        </div>
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Your QR Code Generator. All rights reserved (or specify your chosen license).</p>
        {/* Placeholder for ad - to be implemented carefully for user experience */}
        <div className="ad-placeholder">
            <p>Advertisement</p>
            {/* Example: <img src="https://via.placeholder.com/728x90.png?text=Ad+Space" alt="Advertisement" /> */}
        </div>
      </footer>
    </div>
  );
}

export default App;

