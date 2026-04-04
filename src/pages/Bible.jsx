import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Calendar, Star, Copy, Share2, Volume2, ArrowRight, Globe } from 'lucide-react';
import '../styles/Bible.css';

const Bible = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [availableVersions, setAvailableVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('en-kjv');
  const [verseOfDay, setVerseOfDay] = useState({
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    translation: 'KJV'
  });
  const [readingPlans, setReadingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bibleFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
    
    // Load saved Bible version preference
    const savedVersion = localStorage.getItem('bibleVersion');
    if (savedVersion) {
      setSelectedVersion(savedVersion);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('bibleFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch available Bible versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch('/api/bible/versions');
        if (response.ok) {
          const data = await response.json();
          setAvailableVersions(data);
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };
    fetchVersions();
  }, []);

  // Save selected version to localStorage and refetch verse of day
  useEffect(() => {
    localStorage.setItem('bibleVersion', selectedVersion);
    fetchVerseOfDay();
  }, [selectedVersion]);

  // Fetch verse of the day
  useEffect(() => {
    fetchVerseOfDay();
  }, []);

  // Fetch reading plans
  useEffect(() => {
    fetchReadingPlans();
  }, []);

  const fetchVerseOfDay = async () => {
    try {
      const response = await fetch(`/api/bible/verse-of-day?version=${selectedVersion}`);
      if (response.ok) {
        const data = await response.json();
        setVerseOfDay(data);
      } else {
        // Fallback if API fails
        setVerseOfDay({
          reference: 'John 3:16',
          text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
          translation: selectedVersion.toUpperCase()
        });
      }
    } catch (error) {
      console.error('Error fetching verse of the day:', error);
      // Fallback verse
      setVerseOfDay({
        reference: 'John 3:16',
        text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        translation: selectedVersion.toUpperCase()
      });
    }
  };

  const fetchReadingPlans = async () => {
    try {
      const response = await fetch('/api/bible/reading-plans');
      if (response.ok) {
        const data = await response.json();
        setReadingPlans(data);
      }
    } catch (error) {
      console.error('Error fetching reading plans:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMessage('Please enter a search term');
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setMessage('');
    try {
      const response = await fetch(`/api/bible/search?q=${encodeURIComponent(searchQuery)}&version=${selectedVersion}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data || []);
        if (data.length === 0) {
          setMessage(`No verses found for "${searchQuery}". Try keywords like "love", "faith", "John 10:17", etc.`);
        } else {
          setMessage(`Found ${data.length} verse(s)`);
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Error searching verses. Please try again.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      setMessage('Unable to search verses. Please check your connection and try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = (verse) => {
    const isFavorited = favorites.some((v) => v.reference === verse.reference);
    if (isFavorited) {
      setFavorites(favorites.filter((v) => v.reference !== verse.reference));
      setMessage('Removed from favorites');
    } else {
      setFavorites([...favorites, verse]);
      setMessage('Added to favorites');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard');
    setTimeout(() => setMessage(''), 2000);
  };

  const shareVerse = (verse) => {
    const text = `${verse.reference}\n\n"${verse.text}"\n\nFrom Kingdom Impact Ministries`;
    if (navigator.share) {
      navigator.share({
        title: verse.reference,
        text: text
      });
    } else {
      copyToClipboard(text);
    }
  };

  const speakVerse = (verse) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${verse.reference}. ${verse.text}`);
      speechSynthesis.speak(utterance);
    }
  };

  const isFavorited = (verse) => {
    return favorites.some((v) => v.reference === verse.reference);
  };

  return (
    <main className="bible-main">
      {/* Header */}
      <section className="bible-hero">
        <div className="container">
          <div className="hero-content">
            <BookOpen className="hero-icon" size={48} />
            <h1 className="bible-title">Bible Hub</h1>
            <p className="bible-subtitle">Scripture Search, Reading Plans & Daily Verses</p>
          </div>
        </div>
      </section>

      {/* Verse of the Day */}
      {verseOfDay && (
        <section className="votd-section">
          <div className="container">
            <div className="votd-card">
              <div className="votd-header">
                <Star size={24} style={{ color: 'var(--accent-main)' }} />
                <h2>Verse of the Day</h2>
              </div>
              <p className="votd-text">"{verseOfDay.text}"</p>
              <p className="votd-reference">— {verseOfDay.reference}</p>
              <div className="votd-actions">
                <button
                  className="votd-btn"
                  onClick={() => speakVerse(verseOfDay)}
                  title="Listen"
                >
                  <Volume2 size={18} /> Listen
                </button>
                <button
                  className="votd-btn"
                  onClick={() => copyToClipboard(verseOfDay.text)}
                  title="Copy"
                >
                  <Copy size={18} /> Copy
                </button>
                <button
                  className="votd-btn"
                  onClick={() => shareVerse(verseOfDay)}
                  title="Share"
                >
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Message Notification */}
      {message && (
        <div className={`notification-message ${message.toLowerCase().includes('error') || message.toLowerCase().includes('unable') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <section className="tabs-section">
        <div className="container">
          <div className="tabs-header">
            {/* Bible Version Selector */}
            <div className="version-selector">
              <label htmlFor="bible-version">
                <Globe size={18} /> Version:
              </label>
              <select
                id="bible-version"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="version-dropdown"
              >
                {availableVersions.map((version) => (
                  <option key={version.code} value={version.code}>
                    {version.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Buttons */}
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                <Search size={20} /> Scripture Search
              </button>
              <button
                className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                <Calendar size={20} /> Reading Plans
              </button>
              <button
                className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <Star size={20} /> My Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bible-content">
        <div className="container">
          {/* Scripture Search Tab */}
          {activeTab === 'search' && (
            <div className="tab-content fade-in">
              <div className="search-section">
                <h2>Search Scripture</h2>

                {/* Search Format Guide */}
                <div className="search-format-guide">
                  <p className="format-guide-title">📖 How to search:</p>
                  <div className="format-examples">
                    <div className="format-example" onClick={() => setSearchQuery('John 3:16')}>
                      <span className="format-label">Single verse:</span>
                      <code>John 3:16</code>
                    </div>
                    <div className="format-example" onClick={() => setSearchQuery('Hebrews 5:1-7')}>
                      <span className="format-label">Verse range:</span>
                      <code>Hebrews 5:1-7</code>
                    </div>
                    <div className="format-example" onClick={() => setSearchQuery('love')}>
                      <span className="format-label">Keyword:</span>
                      <code>love</code>
                    </div>
                  </div>
                  <p className="format-tip">💡 <strong>Tip:</strong> Use the format <code>Book Chapter:Verse</code> — e.g. <code>Romans 8:28</code> or <code>Genesis 1:1-5</code>. Make sure to include a space between the book name and chapter number.</p>
                </div>

                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-input-group">
                    <input
                      type="text"
                      placeholder="e.g. Hebrews 5:1-7"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="results-section">
                    <h3>Search Results ({searchResults.length})</h3>
                    <div className="verses-list">
                      {searchResults.map((verse, idx) => (
                        <div key={idx} className="verse-card">
                          <div className="verse-header">
                            <p className="verse-reference">{verse.reference}</p>
                            <div className="verse-actions">
                              <button
                                className={`action-btn ${isFavorited(verse) ? 'favorited' : ''}`}
                                onClick={() => addToFavorites(verse)}
                                title="Add to favorites"
                              >
                                <Star size={18} />
                              </button>
                              <button
                                className="action-btn"
                                onClick={() => speakVerse(verse)}
                                title="Listen"
                              >
                                <Volume2 size={18} />
                              </button>
                              <button
                                className="action-btn"
                                onClick={() => copyToClipboard(verse.text)}
                                title="Copy"
                              >
                                <Copy size={18} />
                              </button>
                              <button
                                className="action-btn"
                                onClick={() => shareVerse(verse)}
                                title="Share"
                              >
                                <Share2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="verse-text">"{verse.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !loading && (
                  <div className="no-results">
                    <p>No verses found. Try a different search term.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reading Plans Tab */}
          {activeTab === 'plans' && (
            <div className="tab-content fade-in">
              <div className="plans-section">
                <h2>Reading Plans</h2>
                <div className="plans-grid">
                  {readingPlans.length > 0 ? (
                    readingPlans.map((plan, idx) => (
                      <div
                        key={idx}
                        className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="plan-icon">
                          <Calendar size={32} />
                        </div>
                        <h3>{plan.name}</h3>
                        <p className="plan-description">{plan.description}</p>
                        <p className="plan-duration">
                          {plan.duration} days • {plan.passages.length} passages
                        </p>
                        <button className="plan-btn">Start Plan</button>
                      </div>
                    ))
                  ) : (
                    <p>No reading plans available.</p>
                  )}
                </div>

                {/* Selected Plan Details */}
                {selectedPlan && (
                  <div className="plan-details">
                    <h3>{selectedPlan.name}</h3>
                    <p>{selectedPlan.description}</p>
                    <div className="passages-list">
                      <h4>Daily Passages:</h4>
                      {selectedPlan.passages.map((passage, idx) => (
                        <div key={idx} className="passage-item">
                          <span className="passage-day">Day {idx + 1}</span>
                          <span className="passage-ref">{passage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="tab-content fade-in">
              <div className="favorites-section">
                <h2>My Favorite Verses</h2>
                {favorites.length > 0 ? (
                  <div className="verses-list">
                    {favorites.map((verse, idx) => (
                      <div key={idx} className="verse-card">
                        <div className="verse-header">
                          <p className="verse-reference">{verse.reference}</p>
                          <div className="verse-actions">
                            <button
                              className="action-btn favorited"
                              onClick={() => addToFavorites(verse)}
                              title="Remove from favorites"
                            >
                              <Star size={18} fill="currentColor" />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => speakVerse(verse)}
                              title="Listen"
                            >
                              <Volume2 size={18} />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => copyToClipboard(verse.text)}
                              title="Copy"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => shareVerse(verse)}
                              title="Share"
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        </div>
                        <p className="verse-text">"{verse.text}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No favorite verses yet. Start searching and add verses to your favorites!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Bible;
