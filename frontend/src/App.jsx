import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, FileText, AlertCircle, CheckCircle, Clock, Users, Gavel, TrendingUp } from 'lucide-react';
import './App.css';

// API Base URL - change this when deploying to production
const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [formData, setFormData] = useState({
    court: 'delhi_hc',
    caseType: 'WP(C)',
    caseNumber: '',
    year: new Date().getFullYear().toString()
  });
  
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [causeListDate, setCauseListDate] = useState(new Date().toISOString().split('T')[0]);
  const [causeListLoading, setCauseListLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [stats, setStats] = useState({ totalSearches: 0, todaySearches: 0 });

  const caseTypes = [
    'WP(C)', 'WP(CRL)', 'CRL.A', 'CRL.M.C', 'FAO', 'MAC.APP', 
    'CS(COMM)', 'CS(OS)', 'ARB.A', 'ARB.P', 'CO.PET', 'CONT.CAS(C)'
  ];

  const courts = [
    { id: 'delhi_hc', name: 'Delhi High Court' },
    { id: 'bombay_hc', name: 'Bombay High Court (Coming Soon)', disabled: true },
    { id: 'supreme_court', name: 'Supreme Court (Coming Soon)', disabled: true }
  ];

  useEffect(() => {
    fetchRecentSearches();
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history?limit=5`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentSearches(data.history || []);
          setStats({
            totalSearches: data.history?.length || 0,
            todaySearches: data.history?.filter(h => {
              const today = new Date().toDateString();
              return new Date(h.timestamp).toDateString() === today;
            }).length || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSearch = async () => {
    if (!formData.caseNumber || !formData.year) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch case details');
      }

      if (data.success) {
        setSearchResults(data);
        fetchRecentSearches();
      } else {
        throw new Error(data.message || 'No results found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch case details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (docId, docName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${docId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docName + '.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document: ' + err.message);
    }
  };

  const handleDownloadCauseList = async () => {
    setCauseListLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cause-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          court: formData.court,
          date: causeListDate
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch cause list');
      }

      if (data.downloadUrl) {
        const downloadResponse = await fetch(`http://localhost:5000${data.downloadUrl}`);
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `causelist_${causeListDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Cause list error:', err);
      alert('Failed to download cause list: ' + err.message);
    } finally {
      setCauseListLoading(false);
    }
  };

  const loadPreviousSearch = (search) => {
    setFormData({
      court: search.court,
      caseType: search.case_type,
      caseNumber: search.case_number,
      year: search.year.toString()
    });
    handleSearch();
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'disposed': return 'status-disposed';
      case 'closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-title-section">
              <Gavel className="header-icon" />
              <div>
                <h1 className="header-title">eCourts Case Tracker</h1>
                <p className="header-subtitle">Search and download case details from Indian courts</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <TrendingUp className="stat-icon" />
                <div>
                  <p className="stat-label">Total Searches</p>
                  <p className="stat-value">{stats.totalSearches}</p>
                </div>
              </div>
              <div className="stat-card">
                <Calendar className="stat-icon" />
                <div>
                  <p className="stat-label">Today</p>
                  <p className="stat-value">{stats.todaySearches}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="sidebar">
            <div className="search-card">
              <h2 className="card-title">
                <Search className="title-icon" />
                Case Search
              </h2>
              
              <div className="form-group">
                <label className="form-label">Court</label>
                <select
                  name="court"
                  value={formData.court}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {courts.map(court => (
                    <option key={court.id} value={court.id} disabled={court.disabled}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Case Type</label>
                <select
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {caseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Case Number</label>
                <input
                  type="number"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 12345"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="YYYY"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="form-input"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="btn-icon" />
                    Search Case
                  </>
                )}
              </button>

              <div className="cause-list-section">
                <h3 className="section-title">
                  <Calendar className="title-icon-small" />
                  Daily Cause List
                </h3>
                <div className="form-group">
                  <input
                    type="date"
                    value={causeListDate}
                    onChange={(e) => setCauseListDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button
                  onClick={handleDownloadCauseList}
                  disabled={causeListLoading}
                  className="btn btn-secondary"
                >
                  {causeListLoading ? (
                    <>
                      <div className="spinner" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Download className="btn-icon" />
                      Download Cause List
                    </>
                  )}
                </button>
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className="recent-searches-card">
                <h3 className="card-title-small">Recent Searches</h3>
                <div className="recent-searches-list">
                  {recentSearches.slice(0, 5).map((search) => (
                    <button
                      key={search.id}
                      onClick={() => loadPreviousSearch(search)}
                      className="recent-search-item"
                    >
                      <p className="recent-search-case">
                        {search.case_type} {search.case_number}/{search.year}
                      </p>
                      {search.petitioner && (
                        <p className="recent-search-party">
                          {search.petitioner.substring(0, 30)}...
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="content-area">
            {error && (
              <div className="error-box">
                <AlertCircle className="error-icon" />
                <div>
                  <h3 className="error-title">Error</h3>
                  <p className="error-message">{error}</p>
                </div>
              </div>
            )}

            {!searchResults && !error && !loading && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Search className="icon-large" />
                </div>
                <h3 className="empty-state-title">Search for a Case</h3>
                <p className="empty-state-text">
                  Enter case details in the form to fetch information from eCourts portal
                </p>
              </div>
            )}

            {searchResults && searchResults.caseDetails && (
              <div className="results-container">
                <div className="case-details-card">
                  <div className="card-header card-header-blue">
                    <h2 className="card-header-title">Case Details</h2>
                    <p className="card-header-subtitle">{searchResults.caseDetails.caseNumber}</p>
                  </div>
                  
                  <div className="card-body">
                    <div className="info-grid">
                      <div className="info-item">
                        <Users className="info-icon info-icon-blue" />
                        <div>
                          <p className="info-label">Petitioner</p>
                          <p className="info-value">{searchResults.caseDetails.petitioner}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <Users className="info-icon info-icon-purple" />
                        <div>
                          <p className="info-label">Respondent</p>
                          <p className="info-value">{searchResults.caseDetails.respondent}</p>
                        </div>
                      </div>
                    </div>

                    <div className="info-grid info-grid-border">
                      <div className="info-item">
                        <Calendar className="info-icon info-icon-green" />
                        <div>
                          <p className="info-label">Filing Date</p>
                          <p className="info-value">{searchResults.caseDetails.filingDate}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <Clock className="info-icon info-icon-orange" />
                        <div>
                          <p className="info-label">Next Hearing</p>
                          <p className="info-value">{searchResults.caseDetails.nextHearing}</p>
                        </div>
                      </div>
                    </div>

                    <div className="info-grid info-grid-border">
                      <div className="info-item">
                        <Gavel className="info-icon info-icon-indigo" />
                        <div>
                          <p className="info-label">Judge</p>
                          <p className="info-value">{searchResults.caseDetails.judge}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <CheckCircle className="info-icon info-icon-blue" />
                        <div>
                          <p className="info-label">Status</p>
                          <span className={`status-badge ${getStatusClass(searchResults.caseDetails.status)}`}>
                            {searchResults.caseDetails.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {searchResults.documents && searchResults.documents.length > 0 && (
                  <div className="documents-card">
                    <div className="card-header card-header-purple">
                      <h2 className="card-header-title">
                        <FileText className="header-icon-small" />
                        Available Documents
                      </h2>
                    </div>
                    
                    <div className="card-body">
                      {searchResults.documents.map(doc => (
                        <div key={doc.id} className="document-item">
                          <div className="document-info">
                            <div className="document-icon-wrapper">
                              <FileText className="document-icon" />
                            </div>
                            <div>
                              <p className="document-name">{doc.name}</p>
                              <p className="document-meta">{doc.type} • {doc.date}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadDocument(doc.id, doc.name)}
                            className="btn btn-download"
                          >
                            <Download className="btn-icon-small" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.history && searchResults.history.length > 0 && (
                  <div className="history-card">
                    <div className="card-header card-header-pink">
                      <h2 className="card-header-title">Case History</h2>
                    </div>
                    
                    <div className="card-body">
                      {searchResults.history.map((item, idx) => (
                        <div key={idx} className="history-item">
                          <div className="timeline">
                            <div className="timeline-dot" />
                            {idx < searchResults.history.length - 1 && (
                              <div className="timeline-line" />
                            )}
                          </div>
                          <div className="history-content">
                            <p className="history-date">{item.date}</p>
                            <p className="history-event">{item.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            © 2025 eCourts Case Tracker • Data sourced from official eCourts portals • For informational purposes only
          </p>
          <p className="footer-api-status">
            API Status: <span className="status-online">Connected</span> • Server: {API_BASE_URL}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;