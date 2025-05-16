import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

// Content for How to Use
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
  const [logoSize, setLogoSize] = useState(0.15); // Default logo size
  const [logoNaturalWidth, setLogoNaturalWidth] = useState<number | null>(null);
  const [logoNaturalHeight, setLogoNaturalHeight] = useState<number | null>(null);
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
  const [faqExpanded, setFaqExpanded] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setQrLogo(reader.result);
          const img = new Image();
          img.onload = () => {
            setLogoNaturalWidth(img.naturalWidth);
            setLogoNaturalHeight(img.naturalHeight);
          };
          img.src = reader.result;
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

  const shareQRCode = async () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      try {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "qreasy-code.png", { type: "image/png" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: "My QR Code from QReasy",
                text: "Check out this QR Code I made!",
              });
            } else {
              alert("Web Share API is not supported in your browser, or cannot share files. Please download the QR code to share it.");
              // Fallback: Trigger download if sharing is not possible but was attempted
              downloadQRCode(); 
            }
          }
        }, "image/png");
      } catch (error) {
        console.error("Error sharing QR Code:", error);
        alert("Could not share QR Code. Please try downloading instead.");
      }
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

  const renderMarkdown = (markdown: string, isNumberedList = false) => {
  let html = '';
  const lines = markdown.split('\n');

  let inOl = false;
  let inNestedOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Pre-process for bold and br tags universally
    line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/<br \/>/g, '<br />');

    if (line.match(/^### (.*)/)) {
      if (inNestedOl) { html += '</ol></li>'; inNestedOl = false; }
      if (inOl) { html += '</li></ol>'; inOl = false; }
      html += line.replace(/^### (.*)/, '<h3>$1</h3>');
    } else if (isNumberedList && line.match(/^\d+\.\s+.*/)) { // Main list item
      if (inNestedOl) { html += '</ol></li>'; inNestedOl = false; } // Close nested list if open
      if (!inOl) { html += '<ol>'; inOl = true; }
      else { html += '</li>'; } // Close previous main li
      html += `<li>${line.replace(/^\d+\.\s+/, '')}`;
    } else if (isNumberedList && line.match(/^\s{4}\d+\.\s+.*/)) { // Nested list item
      if (!inNestedOl) {
        html += '<ol style="margin-left: 20px; margin-top: 5px;">';
        inNestedOl = true;
      } else {
        html += '</li>'; // Close previous nested li
      }
      html += `<li>${line.replace(/^\s{4}\d+\.\s+/, '')}`;
    } else { // Plain text or non-list items
      if (line.trim() !== '') { // Only close lists if the line has content and is not part of list continuation
        if (inNestedOl) { html += '</ol></li>'; inNestedOl = false; }
        if (inOl) { html += '</li></ol>'; inOl = false; }
      }
      html += line;
    }
    if (i < lines.length - 1 || (i === lines.length -1 && line.trim() !== '')) { // Add newline if not the truly last empty line
        html += '\n';
    }
  }

  // Close any open lists at the end
  if (inNestedOl) { html += '</ol></li>'; }
  if (inOl) { html += '</li></ol>'; }

  return { __html: html.trim() }; // Trim to remove any leading/trailing whitespace including newlines from the final HTML string
};
  
  const getLogoDimensions = () => {
    if (!qrLogo || !logoNaturalWidth || !logoNaturalHeight) {
      return { width: 0, height: 0 };
    }
    const qrCanvasSize = 256;
    const maxLogoDimension = qrCanvasSize * logoSize;
    let width, height;

    if (logoNaturalWidth > logoNaturalHeight) {
      width = maxLogoDimension;
      height = (logoNaturalHeight / logoNaturalWidth) * maxLogoDimension;
    } else {
      height = maxLogoDimension;
      width = (logoNaturalWidth / logoNaturalHeight) * maxLogoDimension;
    }
    return { width, height };
  };

  const logoDimensions = getLogoDimensions();

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
        {/* FAQ button removed from header */}
      </header>

      {/* New Intro Section */}
      <div className="intro-section-container">
        <div className="intro-text">
          <h2>Our Free and Easy QR Code Generator</h2>
          <p>Reach new clients with a free QR code. Ideal for marketing and sales teams. You can use it for accessing your contact details, your website, your event, your menu, your wi-fi code.</p>
        </div>
        <div className="intro-image">
          {/* Placeholder for mobile phone with QR code image - to be added in next step */}
          <img src="/images/mobile_qr_intro.jpeg" alt="Mobile phone creating a QR code" />
        </div>
      </div>

      <div className="main-content-wrapper">
        <aside className="sidebar-content">
          <section className="info-section guide-section" dangerouslySetInnerHTML={renderMarkdown(howToUseContent, true)} />
          {/* FAQ Section moved to full-width section below */}
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
                  <label htmlFor="logoSize">Logo Size (Max 10% to 30% of QR Area):</label>
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
            <div className="action-buttons">
              <button onClick={downloadQRCode} className="download-btn">Download QR Code</button>
              <button onClick={shareQRCode} className="share-btn">Share QR Code</button>
            </div>
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
                    imageSettings={qrLogo && logoDimensions.width > 0 ? {
                        src: qrLogo,
                        height: logoDimensions.height,
                        width: logoDimensions.width,
                        excavate: true,
                    } : undefined}
                    />
                ) : (
                    <p>Enter data to generate QR code</p>
                )}
                <p className="privacy-note">Your data is processed locally. We don't store or track your QR codes.</p>
              </div>
              
              {/* Example Images Section - Moved next to preview */}
              <section className="example-images-section">
                <h4>QR Codes in Action</h4>
                <div className="example-image-container">
                  <img src="/images/mobile_qr_intro.jpeg" alt="Mobile phone creating a QR code" />
                  <img src="/images/qr_brochure_example.jpeg" alt="QR code on a brochure example" />
                </div>
              </section>
          </div>
        </main>
      </div>
      {/* FAQ section is now permanently displayed in the sidebar */}
      
      {/* Full-width FAQ Section */}
      <div className="faq-section-container">
        <div className="faq-header" onClick={() => setFaqExpanded(!faqExpanded)}>
          <h3>Your questions, answered</h3>
          <div className={`faq-toggle-icon ${faqExpanded ? 'open' : ''}`}>
            {faqExpanded ? '▲' : '▼'}
          </div>
        </div>
        <div className={`faq-content ${faqExpanded ? 'open' : ''}`}>
          <div className="faq-items">
            <div className="faq-item">
              <h4>What is a QR code and how do they work?</h4>
              <p>A QR (Quick Response) code is a type of 2D barcode that stores information in a square pattern of black modules on a white background. Unlike traditional barcodes, QR codes can be scanned from any orientation and can store much more information. They work by translating the arrangement of these squares into data that can be easily read by smartphone cameras and QR scanners.</p>
            </div>
            
            <div className="faq-item">
              <h4>What are the benefits of using a QR code?</h4>
              <p>QR codes offer numerous benefits including:</p>
              <ul>
                <li>Quick and easy access to digital content from physical materials</li>
                <li>Contactless information sharing (especially important in health-conscious environments)</li>
                <li>Ability to store more information than traditional barcodes</li>
                <li>Versatility for marketing, payments, authentication, and more</li>
                <li>Cost-effective way to connect offline audiences to online experiences</li>
              </ul>
            </div>
            
            <div className="faq-item">
              <h4>Is QReasy's QR code generator really free?</h4>
              <p>Yes! QReasy is 100% free to use with no hidden fees. You can create unlimited QR codes with full customization options including colors and logo embedding. The service is supported by non-intrusive advertisements that appear on the website.</p>
            </div>
            
            <div className="faq-item">
              <h4>Will my QR code expire?</h4>
              <p>No, the QR codes you create with QReasy are static codes that never expire. They will continue to work indefinitely as long as the content they link to (such as your website) remains active. Unlike dynamic QR codes that require subscription services, our static QR codes are permanent and maintenance-free.</p>
            </div>
            
            <div className="faq-item">
              <h4>How do I scan a QR code?</h4>
              <p>Most modern smartphones can scan QR codes directly through their camera apps. Simply open your camera, point it at the QR code, and hold steady for a moment. A notification should appear that you can tap to access the content. If this doesn't work, you may need to download a dedicated QR code scanner app from your app store.</p>
            </div>
            
            <div className="faq-item">
              <h4>Can I customize my QR code's appearance?</h4>
              <p>Absolutely! QReasy allows you to fully customize your QR codes. You can change the foreground and background colors, choose from color palettes, and even embed your logo in the center of the QR code. This helps you create QR codes that match your brand identity while remaining functional.</p>
            </div>
            
            <div className="faq-item">
              <h4>What types of content can I create QR codes for?</h4>
              <p>QReasy supports multiple QR code types including:</p>
              <ul>
                <li>Website URLs</li>
                <li>Plain text</li>
                <li>Wi-Fi network credentials</li>
                <li>Event details</li>
                <li>Restaurant menus</li>
              </ul>
            </div>
            
            <div className="faq-item">
              <h4>Are my QR codes tracked or monitored?</h4>
              <p>No. QReasy generates static QR codes that work independently once downloaded. We don't track, store, or monitor the QR codes you create or their usage. Your data and privacy are respected at all times.</p>
            </div>
          </div>
        </div>
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

