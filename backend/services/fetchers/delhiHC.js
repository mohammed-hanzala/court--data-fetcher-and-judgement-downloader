// backend/services/fetchers/delhiHC.js

async function searchCase(caseType, caseNumber, year) {
  return {
    rawHtml: "<html>Mock Delhi HC HTML</html>",
    rawData: {
      caseType,
      caseNumber,
      year
    },
    caseDetails: {
      petitioner: "ABC Pvt Ltd",
      respondent: "XYZ Ltd",
      filingDate: "01-01-2023",
      nextHearing: "15-10-2025",
      status: "Pending",
      judge: "Hon. Justice Sharma",
      courtNumber: "Court No. 5"
    },
    documents: [
      {
        name: "Order dated 01-01-2023",
        type: "Order",
        date: "01-01-2023",
        downloadUrl: "https://example.com/order.pdf"
      }
    ],
    history: [
      {
        date: "01-01-2023",
        description: "Case filed"
      },
      {
        date: "15-03-2024",
        description: "Hearing conducted"
      }
    ]
  };
}

async function downloadDocument(url, documentId) {
  const filePath = `backend/uploads/document_${documentId}.pdf`;
  return filePath;
}

async function getCauseList(date) {
  const filePath = `backend/uploads/cause_list_${date}.pdf`;
  return { filePath };
}

module.exports = {
  searchCase,
  downloadDocument,
  getCauseList
};
