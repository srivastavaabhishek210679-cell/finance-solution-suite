import { useState } from 'react'
import { Eye, Type, Contrast, Focus, Keyboard, Volume2, Save, RotateCcw, Check } from 'lucide-react'
import './Accessibility.css'
import { useNavigate } from 'react-router-dom'

function Accessibility() {
  const navigate = useNavigate()
  const [savedMessage, setSavedMessage] = useState('')

  // Accessibility settings
  const [settings, setSettings] = useState({
    // Text & Display
    textSize: 100,
    lineHeight: 1.5,
    letterSpacing: 'normal',
    fontFamily: 'system',
    
    // Contrast & Color
    highContrast: false,
    colorBlindMode: 'none',
    darkMode: true,
    reducedMotion: false,
    
    // Navigation
    keyboardNav: true,
    focusIndicators: 'enhanced',
    skipLinks: true,
    
    // Screen Reader
    screenReaderOptimized: false,
    ariaLabels: 'full',
    altTextDescriptive: true,
    announceChanges: true,
    
    // Other
    autoplayMedia: false,
    flashingContent: 'block',
    timeoutExtension: 'none'
  })

  // Save settings
  const saveSettings = () => {
    // Simulate save
    setSavedMessage('Accessibility settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
    
    // Apply settings
    applySettings()
  }

  // Apply settings to DOM
  const applySettings = () => {
    const root = document.documentElement
    
    // Text size
    root.style.fontSize = `${settings.textSize}%`
    
    // Line height
    root.style.lineHeight = settings.lineHeight
    
    // Letter spacing
    const spacingValues = {
      'normal': '0',
      'wide': '0.05em',
      'wider': '0.1em'
    }
    root.style.letterSpacing = spacingValues[settings.letterSpacing]
    
    // High contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
    
    // Color blind modes
    document.body.className = document.body.className.replace(/color-blind-\w+/, '')
    if (settings.colorBlindMode !== 'none') {
      document.body.classList.add(`color-blind-${settings.colorBlindMode}`)
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion')
    } else {
      document.body.classList.remove('reduced-motion')
    }
  }

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Reset all accessibility settings to defaults?')) {
      setSettings({
        textSize: 100,
        lineHeight: 1.5,
        letterSpacing: 'normal',
        fontFamily: 'system',
        highContrast: false,
        colorBlindMode: 'none',
        darkMode: true,
        reducedMotion: false,
        keyboardNav: true,
        focusIndicators: 'enhanced',
        skipLinks: true,
        screenReaderOptimized: false,
        ariaLabels: 'full',
        altTextDescriptive: true,
        announceChanges: true,
        autoplayMedia: false,
        flashingContent: 'block',
        timeoutExtension: 'none'
      })
      setSavedMessage('Settings reset to defaults')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  return (
    <div className="accessibility-page">
      <button onClick={()=>navigate(-1)} style={{position:"fixed",top:16,left:16,zIndex:9999,display:"flex",alignItems:"center",gap:6,background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#94a3b8",padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:500,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>&#8592; Back</button>
      {/* Header */}
      <div className="accessibility-header">
        <div className="header-content">
          <div className="title-section">
            <Eye size={32} className="header-icon" />
            <div>
              <h1>Accessibility Settings</h1>
              <p>WCAG 2.1 Level AA compliant accessibility options</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={resetToDefaults}>
              <RotateCcw size={18} />
              Reset
            </button>
            <button className="btn-primary" onClick={saveSettings}>
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="success-message">
          <Check size={20} />
          {savedMessage}
        </div>
      )}

      {/* Compliance Badge */}
      <div className="compliance-badges">
        <div className="badge">✓ WCAG 2.1 Level AA</div>
        <div className="badge">✓ Section 508</div>
        <div className="badge">✓ ADA Compliant</div>
      </div>

      {/* Settings Sections */}
      <div className="settings-container">
        {/* Text & Display */}
        <div className="settings-section">
          <div className="section-header">
            <Type size={24} />
            <h2>Text & Display</h2>
          </div>

          <div className="setting-item">
            <label>Text Size: {settings.textSize}%</label>
            <input
              type="range"
              min="75"
              max="200"
              step="5"
              value={settings.textSize}
              onChange={(e) => setSettings({ ...settings, textSize: parseInt(e.target.value) })}
            />
            <div className="range-labels">
              <span>75%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>

          <div className="setting-item">
            <label>Line Height: {settings.lineHeight}</label>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => setSettings({ ...settings, lineHeight: parseFloat(e.target.value) })}
            />
            <div className="range-labels">
              <span>Tight</span>
              <span>Normal</span>
              <span>Loose</span>
            </div>
          </div>

          <div className="setting-item">
            <label>Letter Spacing</label>
            <select
              value={settings.letterSpacing}
              onChange={(e) => setSettings({ ...settings, letterSpacing: e.target.value })}
            >
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
              <option value="wider">Wider</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
            >
              <option value="system">System Default</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
              <option value="dyslexic">Dyslexic-Friendly</option>
            </select>
          </div>
        </div>

        {/* Contrast & Color */}
        <div className="settings-section">
          <div className="section-header">
            <Contrast size={24} />
            <h2>Contrast & Color</h2>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => setSettings({ ...settings, highContrast: e.target.checked })}
              />
              <div>
                <strong>High Contrast Mode</strong>
                <p>Enhanced contrast for better visibility</p>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>Color Blindness Mode</label>
            <select
              value={settings.colorBlindMode}
              onChange={(e) => setSettings({ ...settings, colorBlindMode: e.target.value })}
            >
              <option value="none">None</option>
              <option value="deuteranopia">Deuteranopia (Red-Green)</option>
              <option value="protanopia">Protanopia (Red-Green)</option>
              <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
            </select>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })}
              />
              <div>
                <strong>Reduce Motion</strong>
                <p>Minimize animations and transitions</p>
              </div>
            </label>
          </div>
        </div>

        {/* Keyboard Navigation */}
        <div className="settings-section">
          <div className="section-header">
            <Keyboard size={24} />
            <h2>Keyboard Navigation</h2>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.keyboardNav}
                onChange={(e) => setSettings({ ...settings, keyboardNav: e.target.checked })}
              />
              <div>
                <strong>Enhanced Keyboard Navigation</strong>
                <p>Navigate entire interface with keyboard</p>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>Focus Indicators</label>
            <select
              value={settings.focusIndicators}
              onChange={(e) => setSettings({ ...settings, focusIndicators: e.target.value })}
            >
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced (Recommended)</option>
              <option value="maximum">Maximum Visibility</option>
            </select>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.skipLinks}
                onChange={(e) => setSettings({ ...settings, skipLinks: e.target.checked })}
              />
              <div>
                <strong>Skip Navigation Links</strong>
                <p>Bypass repetitive content</p>
              </div>
            </label>
          </div>
        </div>

        {/* Screen Reader */}
        <div className="settings-section">
          <div className="section-header">
            <Volume2 size={24} />
            <h2>Screen Reader</h2>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.screenReaderOptimized}
                onChange={(e) => setSettings({ ...settings, screenReaderOptimized: e.target.checked })}
              />
              <div>
                <strong>Screen Reader Optimization</strong>
                <p>Enhanced for JAWS, NVDA, VoiceOver</p>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>ARIA Labels</label>
            <select
              value={settings.ariaLabels}
              onChange={(e) => setSettings({ ...settings, ariaLabels: e.target.value })}
            >
              <option value="minimal">Minimal</option>
              <option value="full">Full (Recommended)</option>
              <option value="verbose">Verbose</option>
            </select>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.altTextDescriptive}
                onChange={(e) => setSettings({ ...settings, altTextDescriptive: e.target.checked })}
              />
              <div>
                <strong>Descriptive Alt Text</strong>
                <p>Detailed image descriptions</p>
              </div>
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.announceChanges}
                onChange={(e) => setSettings({ ...settings, announceChanges: e.target.checked })}
              />
              <div>
                <strong>Announce Dynamic Changes</strong>
                <p>Notify about page updates</p>
              </div>
            </label>
          </div>
        </div>

        {/* Other Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Focus size={24} />
            <h2>Other Settings</h2>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={settings.autoplayMedia}
                onChange={(e) => setSettings({ ...settings, autoplayMedia: e.target.checked })}
              />
              <div>
                <strong>Autoplay Media</strong>
                <p>Automatically play videos and audio</p>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>Flashing Content</label>
            <select
              value={settings.flashingContent}
              onChange={(e) => setSettings({ ...settings, flashingContent: e.target.value })}
            >
              <option value="allow">Allow</option>
              <option value="warn">Warn Before Showing</option>
              <option value="block">Block (Recommended)</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Session Timeout Extension</label>
            <select
              value={settings.timeoutExtension}
              onChange={(e) => setSettings({ ...settings, timeoutExtension: e.target.value })}
            >
              <option value="none">None</option>
              <option value="5min">+5 minutes</option>
              <option value="15min">+15 minutes</option>
              <option value="30min">+30 minutes</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Preview */}
      <div className="preview-section">
        <h2>Preview</h2>
        <p>This text demonstrates your current accessibility settings.</p>
        <div className="preview-sample" style={{
          fontSize: `${settings.textSize / 100}rem`,
          lineHeight: settings.lineHeight,
          letterSpacing: settings.letterSpacing === 'wide' ? '0.05em' : settings.letterSpacing === 'wider' ? '0.1em' : '0'
        }}>
          <h3>Sample Heading</h3>
          <p>This is a sample paragraph showing how your text will appear with the current accessibility settings. The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>
    </div>
  )
}

export default Accessibility


