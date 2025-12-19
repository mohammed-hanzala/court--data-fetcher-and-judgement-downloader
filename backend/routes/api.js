// routes/api.js
const express = require('express');
const router = express.Router();
const delhiHCFetcher = require('../services/fetchers/delhiHC');
const fs = require('fs');
const path = require('path');

// Search case by case number
router.post('/search', async (req, res) => {
  const { court, caseType, caseNumber, year } = req.body;
  const db = req.app.locals.db;

  // Validate input
  if (!court || !caseType || !caseNumber || !year) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['court', 'caseType', 'caseNumber', 'year']
    });
  }

  try {
    // Insert query record
    const queryId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO queries (court, case_type, case_number, year, status) VALUES (?, ?, ?, ?, ?)',
        [court, caseType, caseNumber, year, 'processing'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Fetch case data based on court
    let result;
    if (court === 'delhi_hc') {
      result = await delhiHCFetcher.searchCase(caseType, caseNumber, year);
    } else {
      throw new Error('Court not supported yet');
    }

    // Store raw response
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO raw_responses (query_id, raw_html, raw_json) VALUES (?, ?, ?)',
        [queryId, result.rawHtml || '', JSON.stringify(result.rawData || {})],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Store parsed data
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO parsed_data 
        (query_id, petitioner, respondent, filing_date, next_hearing, case_status, judge, court_number, case_history) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          queryId,
          result.caseDetails.petitioner,
          result.caseDetails.respondent,
          result.caseDetails.filingDate,
          result.caseDetails.nextHearing,
          result.caseDetails.status,
          result.caseDetails.judge,
          result.caseDetails.courtNumber,
          JSON.stringify(result.history || [])
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Store document metadata
    if (result.documents && result.documents.length > 0) {
      const stmt = db.prepare(
        'INSERT INTO documents (query_id, doc_name, doc_type, doc_date, download_url) VALUES (?, ?, ?, ?, ?)'
      );

      for (const doc of result.documents) {
        stmt.run(queryId, doc.name, doc.type, doc.date, doc.downloadUrl || '');
      }
      stmt.finalize();
    }

    // Update query status
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE queries SET status = ? WHERE id = ?',
        ['completed', queryId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      queryId,
      caseDetails: result.caseDetails,
      documents: result.documents,
      history: result.history
    });

  } catch (error) {
    console.error('Search error:', error);
    
    // Update query status to failed if queryId exists
    if (error.queryId) {
      db.run('UPDATE queries SET status = ? WHERE id = ?', ['failed', error.queryId]);
    }

    res.status(500).json({
      error: 'Failed to fetch case details',
      message: error.message
    });
  }
});

// Download document
router.get('/download/:documentId', async (req, res) => {
  const { documentId } = req.params;
  const db = req.app.locals.db;

  try {
    // Get document info
    const doc = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM documents WHERE id = ?',
        [documentId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('Document not found'));
          else resolve(row);
        }
      );
    });

    // If file already exists, serve it
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      return res.download(doc.file_path);
    }

    // Otherwise, fetch it
    const filePath = await delhiHCFetcher.downloadDocument(doc.download_url, documentId);

    // Update document record with file path
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE documents SET file_path = ? WHERE id = ?',
        [filePath, documentId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.download(filePath);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download document',
      message: error.message
    });
  }
});

// Get cause list
router.post('/cause-list', async (req, res) => {
  const { court, date } = req.body;

  if (!court || !date) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['court', 'date']
    });
  }

  try {
    let result;
    if (court === 'delhi_hc') {
      result = await delhiHCFetcher.getCauseList(date);
    } else {
      throw new Error('Court not supported yet');
    }

    res.json({
      success: true,
      date,
      court,
      filePath: result.filePath,
      downloadUrl: `/api/download-cause-list/${path.basename(result.filePath)}`
    });

  } catch (error) {
    console.error('Cause list error:', error);
    res.status(500).json({
      error: 'Failed to fetch cause list',
      message: error.message
    });
  }
});

// Download cause list file
router.get('/download-cause-list/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get query history
router.get('/history', (req, res) => {
  const db = req.app.locals.db;
  const limit = parseInt(req.query.limit) || 50;

  db.all(
    `SELECT q.*, p.petitioner, p.respondent, p.case_status 
     FROM queries q 
     LEFT JOIN parsed_data p ON q.id = p.query_id 
     ORDER BY q.timestamp DESC 
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, history: rows });
    }
  );
});

// Get specific query details
router.get('/query/:queryId', (req, res) => {
  const { queryId } = req.params;
  const db = req.app.locals.db;

  db.get(
    `SELECT q.*, p.*, 
     (SELECT json_group_array(json_object('id', d.id, 'name', d.doc_name, 'type', d.doc_type, 'date', d.doc_date))
      FROM documents d WHERE d.query_id = q.id) as documents
     FROM queries q
     LEFT JOIN parsed_data p ON q.id = p.query_id
     WHERE q.id = ?`,
    [queryId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Query not found' });
      }

      // Parse JSON fields
      if (row.documents) {
        row.documents = JSON.parse(row.documents);
      }
      if (row.case_history) {
        row.case_history = JSON.parse(row.case_history);
      }

      res.json({ success: true, data: row });
    }
  );
});

module.exports = router;