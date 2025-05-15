import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

// Content for How to Use and FAQ
const howToUseContent = `
### How to Use QReasy:

1.  **Select QR Type**: Choose the type of QR code you want to create from the dropdown menu (e.g., URL, Text, Wi-Fi, Event, Menu).
2.  **Enter Your Data**: Fill in the required information for your chosen QR code type in the fields that appear.
3.  **Customize (Optional)**: 
    1.  Pick a color for your QR code (use a preset palette or choose a custom color).
    2.  Choose a background color (use a preset palette or choose a custom color).
    3.  Upload a logo to embed in the center (make sure it's clear and not too complex!).
    4.  Adjust the logo size using the slider.
4.  **Preview**: See your QR code update in real-time in the preview window.
5.  **Download**: Once you're happy, click the "Download QR Code" button. It will save as a PNG image file.

That's it! Simple, fast, and free.
`;

const faqContent = `
### Frequently Asked Questions (FAQ)

**Q1: Is QReasy completely free to use?**
<br />A1: Yes! QReasy is 100% free for generating all types of static QR codes with full customization options. The website is supported by advertisements.

**Q2: Do I need to create an account to use the QR code generator?**
<br />A2: No account is needed. You can start creating QR codes right away.

**Q3: What types of QR codes can I create?**
<br />A3: You can create QR codes for URLs (website links), plain text, Wi-Fi network access, basic event details (like a calendar reminder), and direct links to online menus.

**Q4: Can I customize the appearance of my QR codes?**
<br />A4: Absolutely! You can customize the QR code color, background color, and even embed your own logo in the center. You can also adjust the logo size.

**Q5: What format is the QR code downloaded in?**
<br />A5: QR codes are downloaded as high-quality PNG image files, which are suitable for both digital use and printing.

**Q6: Are the QR codes I create tracked? What about privacy?**
<br />A6: We prioritize your privacy. The static QR codes generated on QReasy are not tracked. Once you download your QR code, it works independently and does not send any data back to us.

**Q7: Will my QR codes expire?**
<br />A7: No, the static QR codes you create with QReasy do not expire. As long as the data encoded (like a website URL) remains valid, your QR code will continue to work indefinitely.

**Q8: What is the optimal size for a logo in the QR code?**
<br />A8: While you can adjust the logo size, it's best to keep it relatively small (the tool allows up to 30% of the QR code area) to ensure the QR code remains easily scannable. A clear, simple logo works best.

**Q9: My QR code isn't scanning. What could be wrong?**
<br />A9: 
    *   Ensure the contrast between your QR code color and background color is high enough.
    *   If you added a logo, try making it smaller or removing it to see if that helps.
    *   Make sure the data you entered (e.g., URL) is correct and not too long for a QR code to handle reliably without becoming too dense.
    *   Test with different QR code scanning apps and devices.

**Q10: How does this website make money if it's free?**
<br />A10: QReasy is supported by the advertisements displayed on the website. This allows us to offer the QR code generation service for free to all users.
`;

const colorPalettes = {
  default: ['#000000', '#FFFFFF', '#4A90E2', '#F5A623', '#D0021B', '#7ED321'],
  vintage: ['#5D4037', '#D7CCC8', '#8D6E63', '#A1887F', '#EFEBE9'],
  ocean: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#ADE8F4'],
  sunset: ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'],
  grayscale: ['#212121', '#616161', '#9E9E9E', '#E0E0E0', '#FAFAFA'],
};

function App() {
  const [qrValue, setQrValue] = useState('https://manus.ai');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrLogo, setQrLogo] = useState<string>('');
  const [logoSize, setLogoSize] = useState(0.1);
  const [qrType, setQrType] = useState('url');

  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');

  const [eventName, setEventName] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [menuUrl, setMenuUrl] = useState('');
  const [textValue, setTextValue] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);

  const [selectedPalette, setSelectedPalette] = useState<keyof typeof colorPalettes>('default');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setQrLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQrValue = () => {
    switch (qrType) {
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'event':
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
      downloadLink.download = 'qreasy-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const currentQrValue = generateQrValue();

  const renderMarkdown = (markdown: string) => {
    let html = markdown;
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/### (.*)/g, '<h3>$1</h3>');
    html = html.replace(/<br \/>/g, '<br />');
    // Numbered lists (updated for 1. and 1. 1. format)
    html = html.replace(/^(\d+\.)\s+(.*)/gm, '<li>$2</li>'); // Main numbered list item
    html = html.replace(/^\s{4}(\d+\.)\s+(.*)/gm, '<li style="margin-left: 20px;">$2</li>'); // Nested numbered list item
    
    // Wrap list items in ol - this is a simplification and might need adjustment for nested lists
    if (html.includes('<li>')) {
      // This simple regex won't handle nested lists correctly for ol/ul structure.
      // For proper nested lists, a more robust parser or component structure would be needed.
      // For now, it wraps all found <li> in a single <ol>.
      const listItems = html.match(/<li>.*?<\/li>/g)?.join('') || '';
      html = html.replace(/<li>.*?<\/li>/g, ''); // Remove individual li for now
      html = html + `<ol>${listItems}</ol>`; // Append the list
    }
    return { __html: html };
  };

  const ColorPaletteChooser = ({ setColor }: { setColor: (color: string) => void }) => (
    <div className="palette-chooser">
      <label>Choose from Palette:</label>
      <select onChange={(e) => setSelectedPalette(e.target.value as keyof typeof colorPalettes)} value={selectedPalette} className="palette-select">
        {Object.keys(colorPalettes).map(name => (
          <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
        ))}
      </select>
      <div className="color-swatches">
        {colorPalettes[selectedPalette].map(color => (
          <div 
            key={color} 
            className="color-swatch"
            style={{ backgroundColor: color }}
            onClick={() => setColor(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>QReasy: Free QR Code Generator</h1>
        <p>Create custom QR codes for free. User-friendly and privacy-focused.</p>
      </header>

      <div className="main-content-wrapper">
        <aside className="sidebar-content">
          <section className="info-section guide-section" dangerouslySetInnerHTML={renderMarkdown(howToUseContent)} />
          <section className="info-section faq-section" dangerouslySetInnerHTML={renderMarkdown(faqContent)} />
        </aside>

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
              <label htmlFor="qrColor">QR Code Color (Custom):</label>
              <input type="color" id="qrColor" value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
              <ColorPaletteChooser setColor={setQrColor} />
            </div>
            <div className="control-group">
              <label htmlFor="qrBgColor">Background Color (Custom):</label>
              <input type="color" id="qrBgColor" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} />
              <ColorPaletteChooser setColor={setQrBgColor} />
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

          <div className="preview-area">
              <div className="qr-preview" ref={qrRef}>
              <h2>Preview</h2>
              {currentQrValue ? (
                  <QRCodeCanvas 
                  value={currentQrValue} 
                  size={256} 
                  fgColor={qrColor}
                  bgColor={qrBgColor}
                  level={"H"} 
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
              <div className="ad-placeholder-side">
                  <p>Advertisement</p>
                  {/* Example: <img src="https://via.placeholder.com/300x250.png?text=Ad+Space+Side" alt="Advertisement" /> */}
              </div>
          </div>

        </main>
      </div>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} QReasy. All rights reserved.</p>
        <div className="ad-placeholder ad-placeholder-footer">
            <p>Advertisement</p>
            {/* Example: <img src="https://via.placeholder.com/728x90.png?text=Ad+Space+Footer" alt="Advertisement" /> */}
        </div>
      </footer>
    </div>
  );
}

export default App;

