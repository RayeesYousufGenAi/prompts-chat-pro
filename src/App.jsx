import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Copy, Check, Sparkles, User, Code2, LayoutTemplate } from 'lucide-react';
import './index.css';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    // Load local CSV data from the public folder
    const loadData = async () => {
      try {
        const response = await fetch('/data/prompts.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Filter out empty or broken rows
            const validData = results.data.filter(item => item.act && item.prompt);
            setPrompts(validData);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Error loading prompts:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter prompts based on search term
  const filteredPrompts = useMemo(() => {
    if (!searchTerm) return prompts;
    const lowerSearch = searchTerm.toLowerCase();
    return prompts.filter(p => 
      p.act?.toLowerCase().includes(lowerSearch) || 
      p.prompt?.toLowerCase().includes(lowerSearch)
    );
  }, [prompts, searchTerm]);

  // Paginated currently visible prompts
  const visiblePrompts = filteredPrompts.slice(0, visibleCount);

  // Handle Load more
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  // Copy to clipboard
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="app-container">
      <header className="animate-fade-in">
        <h1 className="hero-title">
          Prompts Chat <span style={{ color: "var(--text-primary)" }}>PRO</span>
        </h1>
        <p className="hero-subtitle">
          The ultimate, community-driven database of AI prompts. 
          Discover {prompts.length > 0 ? prompts.length.toLocaleString() : 'thousands of'} curated prompts to supercharge your generative AI models.
        </p>
      </header>

      <div className="search-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <Search className="search-icon" size={24} />
        <input 
          type="text" 
          className="search-input"
          placeholder="Search prompts, categories, or keywords..." 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setVisibleCount(24); // Reset pagination on search
          }}
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="prompts-grid">
            {visiblePrompts.map((item, index) => (
              <div 
                key={index} 
                className="glass-panel prompt-card animate-fade-in"
                style={{ animationDelay: `${(index % 12) * 0.05}s` }}
              >
                <div className="prompt-header">
                  <h3 className="prompt-title">{item.act}</h3>
                  <div className="prompt-badges">
                    {item.for_devs === 'TRUE' && (
                      <span className="badge" title="For Developers"><Code2 size={12} style={{marginRight: 4, display: 'inline'}}/>DEV</span>
                    )}
                    {item.type && (
                      <span className="badge" style={{color: '#c4b5fd', borderColor: 'rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.1)'}}>
                        <LayoutTemplate size={12} style={{marginRight: 4, display: 'inline'}}/>{item.type}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="prompt-content" title={item.prompt}>
                  {item.prompt}
                </p>

                <div className="prompt-actions">
                  <div className="author-info">
                    <User size={14} />
                    <span>{item.contributor || 'Community'}</span>
                  </div>
                  
                  <button 
                    className={`copy-button ${copiedId === index ? 'copied' : ''}`}
                    onClick={() => handleCopy(item.prompt, index)}
                  >
                    {copiedId === index ? (
                      <><Check size={16} /> Copied</>
                    ) : (
                      <><Copy size={16} /> Copy</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < filteredPrompts.length && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button 
                onClick={handleLoadMore}
                className="glass-panel"
                style={{ 
                  color: 'white', 
                  padding: '0.75rem 2rem', 
                  fontSize: '1rem', 
                  cursor: 'pointer',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-glass)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'var(--bg-glass)'}
              >
                Load More Prompts
              </button>
            </div>
          )}

          {filteredPrompts.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h2>No prompts found for "{searchTerm}"</h2>
              <p>Try using different keywords.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
