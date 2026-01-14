-- Database Schema for Court Fetcher Application
-- SQLite Database

-- Drop existing tables if needed (use with caution)
-- DROP TABLE IF EXISTS documents;
-- DROP TABLE IF EXISTS parsed_data;
-- DROP TABLE IF EXISTS raw_responses;
-- DROP TABLE IF EXISTS queries;

-- Queries table: stores each search request
CREATE TABLE IF NOT EXISTS queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court TEXT NOT NULL,
    case_type TEXT NOT NULL,
    case_number TEXT NOT NULL,
    year INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_queries_court ON queries(court);
CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON queries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_queries_case ON queries(case_type, case_number, year);

-- Raw responses table: stores original HTML/JSON from court websites
CREATE TABLE IF NOT EXISTS raw_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    raw_html TEXT,
    raw_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);

-- Index for foreign key
CREATE INDEX IF NOT EXISTS idx_raw_responses_query ON raw_responses(query_id);

-- Parsed data table: stores structured case information
CREATE TABLE IF NOT EXISTS parsed_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    petitioner TEXT,
    respondent TEXT,
    filing_date TEXT,
    next_hearing TEXT,
    case_status TEXT,
    judge TEXT,
    court_number TEXT,
    case_history TEXT, -- JSON array of history events
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);

-- Index for foreign key
CREATE INDEX IF NOT EXISTS idx_parsed_data_query ON parsed_data(query_id);

-- Documents table: stores metadata for case documents
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER NOT NULL,
    doc_name TEXT NOT NULL,
    doc_type TEXT,
    doc_date TEXT,
    file_path TEXT,
    download_url TEXT,
    file_size INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);

-- Index for foreign key
CREATE INDEX IF NOT EXISTS idx_documents_query ON documents(query_id);

-- View: Complete case information with documents
CREATE VIEW IF NOT EXISTS vw_complete_cases AS
SELECT 
    q.id as query_id,
    q.court,
    q.case_type || ' ' || q.case_number || '/' || q.year as case_number,
    q.timestamp as search_timestamp,
    q.status as query_status,
    p.petitioner,
    p.respondent,
    p.filing_date,
    p.next_hearing,
    p.case_status,
    p.judge,
    p.court_number,
    p.case_history,
    COUNT(d.id) as document_count
FROM queries q
LEFT JOIN parsed_data p ON q.id = p.query_id
LEFT JOIN documents d ON q.id = d.query_id
GROUP BY q.id;

-- View: Recent searches
CREATE VIEW IF NOT EXISTS vw_recent_searches AS
SELECT 
    q.id,
    q.court,
    q.case_type || ' ' || q.case_number || '/' || q.year as case_number,
    p.petitioner,
    p.respondent,
    p.case_status,
    q.timestamp,
    q.status
FROM queries q
LEFT JOIN parsed_data p ON q.id = p.query_id
ORDER BY q.timestamp DESC
LIMIT 100;

-- Sample data insertion (for testing)
-- Uncomment to insert sample data

/*
INSERT INTO queries (court, case_type, case_number, year, status) 
VALUES ('delhi_hc', 'WP(C)', '12345', 2023, 'completed');

INSERT INTO parsed_data (query_id, petitioner, respondent, filing_date, next_hearing, case_status, judge, court_number, case_history)
VALUES (
    1,
    'Rajesh Kumar & Ors.',
    'Union of India & Anr.',
    '15/03/2023',
    '12/11/2025',
    'Pending',
    'Hon''ble Justice Suresh Kumar Kait',
    'Court No. 12',
    '[{"date":"05/10/2025","event":"Matter heard and reserved for orders"},{"date":"22/08/2025","event":"Arguments concluded"}]'
);

INSERT INTO documents (query_id, doc_name, doc_type, doc_date, download_url)
VALUES 
    (1, 'Order dated 05/10/2025', 'Order', '05/10/2025', '/uploads/order_1.pdf'),
    (1, 'Judgment dated 22/08/2025', 'Judgment', '22/08/2025', '/uploads/judgment_1.pdf');
*/

-- Analytics queries (examples)

-- Most searched case types
-- SELECT case_type, COUNT(*) as search_count 
-- FROM queries 
-- GROUP BY case_type 
-- ORDER BY search_count DESC;

-- Searches by court
-- SELECT court, COUNT(*) as search_count 
-- FROM queries 
-- GROUP BY court 
-- ORDER BY search_count DESC;

-- Average response time (if you add timing columns)
-- SELECT court, AVG(response_time_ms) as avg_response_time
-- FROM queries
-- WHERE status = 'completed'
-- GROUP BY court;

-- Failed queries analysis
-- SELECT court, case_type, COUNT(*) as failure_count
-- FROM queries
-- WHERE status = 'failed'
-- GROUP BY court, case_type
-- ORDER BY failure_count DESC;

-- Document type distribution
-- SELECT doc_type, COUNT(*) as count
-- FROM documents
-- GROUP BY doc_type
-- ORDER BY count DESC;