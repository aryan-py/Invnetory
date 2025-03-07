import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import InventoryPage from "./components/InventoryPage";
import IssuePage from "./components/IssuePage";
import StudentsPage from './components/StudentsPage';

// Move initial inventory data to App.js
const initialInventory = [
  { id: 1, name: "Breadboard", quantity: 15 },
  { id: 2, name: "Arduino Uno", quantity: 10 },
  { id: 3, name: "Jumper Wires", quantity: 100 },
  { id: 4, name: "Resistor Kit", quantity: 5 },
  { id: 5, name: "Oscilloscope", quantity: 3 },
];

// Add initial students data
const initialStudents = [

];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('inventory');
  const [inventory, setInventory] = useState(() => {
    const savedInventory = localStorage.getItem('inventory');
    return savedInventory ? JSON.parse(savedInventory) : initialInventory;
  });
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem('students');
    return savedStudents ? JSON.parse(savedStudents) : initialStudents;
  });
  const [issuanceHistory, setIssuanceHistory] = useState(() => {
    const savedHistory = localStorage.getItem('issuanceHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Add new state for tracking last download date
  const [lastHistoryDownload, setLastHistoryDownload] = useState(() => {
    return localStorage.getItem('lastHistoryDownload') || null;
  });

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('issuanceHistory', JSON.stringify(issuanceHistory));
  }, [issuanceHistory]);

  // Add function to check and download monthly history
  const checkAndDownloadMonthlyHistory = () => {
    const now = new Date();
    const lastDownload = lastHistoryDownload ? new Date(lastHistoryDownload) : null;
    
    // Check if we need to download (if never downloaded or if it's a new month)
    if (!lastDownload || 
        lastDownload.getMonth() !== now.getMonth() || 
        lastDownload.getFullYear() !== now.getFullYear()) {
      
      // Create CSV header
      const csvHeader = ['Date', 'Student Name', 'Item Name', 'Quantity', 'Status', 'Return Date'];
      
      // Create CSV rows
      const csvRows = issuanceHistory.map(history => {
        const studentName = students.find(s => s.id === history.studentId)?.name || 'Unknown Student';
        const itemName = inventory.find(i => i.id === history.itemId)?.name || 'Unknown Item';
        
        return [
          new Date(history.date).toLocaleString(),
          studentName,
          itemName,
          history.quantity,
          history.status,
          history.returnDate ? new Date(history.returnDate).toLocaleString() : 'N/A'
        ];
      });
      
      // Combine header and rows
      const csvContent = [
        csvHeader,
        ...csvRows
      ].map(row => row.join(',')).join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Format filename with month and year
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const filename = `inventory_history_${year}_${month}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update last download date
      const newDownloadDate = now.toISOString();
      setLastHistoryDownload(newDownloadDate);
      localStorage.setItem('lastHistoryDownload', newDownloadDate);
    }
  };

  // Add effect to check for monthly download when app loads
  useEffect(() => {
    if (isLoggedIn) {
      checkAndDownloadMonthlyHistory();
    }
  }, [isLoggedIn]); // Only run when login status changes

  // Add effect to check for monthly download periodically
  useEffect(() => {
    if (isLoggedIn) {
      // Check every hour if we need to download
      const interval = setInterval(() => {
        checkAndDownloadMonthlyHistory();
      }, 3600000); // 1 hour in milliseconds
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, issuanceHistory]); // Re-run if login status or history changes

  // Add the function to localStorage effects
  useEffect(() => {
    localStorage.setItem('lastHistoryDownload', lastHistoryDownload);
  }, [lastHistoryDownload]);

  const handleLogin = (success) => {
    setIsLoggedIn(success);
  };

  // Add logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('inventory'); // Reset to inventory page for next login
  };

  const handleIssueItem = (issueData) => {
    // Update inventory when item is issued
    setInventory(prev => prev.map(item => {
      if (item.id === parseInt(issueData.itemId)) {
        return {
          ...item,
          quantity: item.quantity - issueData.quantity
        };
      }
      return item;
    }));

    // Add to issuance history with status
    const newIssuance = {
      id: Math.max(0, ...issuanceHistory.map(h => h.id)) + 1,
      studentId: parseInt(issueData.studentId),
      itemId: parseInt(issueData.itemId),
      quantity: issueData.quantity,
      date: issueData.date,
      status: 'Issued'  // Add status field
    };
    setIssuanceHistory(prev => [...prev, newIssuance]);
    setCurrentPage('inventory');
  };

  const handleReturnItem = (historyItem) => {
    // Increase inventory quantity
    setInventory(prev => prev.map(item => {
      if (item.id === historyItem.itemId) {
        return {
          ...item,
          quantity: item.quantity + historyItem.quantity
        };
      }
      return item;
    }));

    // Instead of removing, mark as returned in issuance history
    setIssuanceHistory(prev => prev.map(h => {
      if (h.id === historyItem.id) {
        return {
          ...h,
          returnDate: new Date().toISOString(),
          status: 'Returned'
        };
      }
      return h;
    }));
  };

  const handleAddStudent = (newStudent) => {
    const newId = Math.max(...students.map(s => s.id)) + 1;
    setStudents(prev => [...prev, { ...newStudent, id: newId }]);
  };

  // Update this function to only count unreturned items
  const getIssuedQuantity = (itemId) => {
    return issuanceHistory.reduce((total, issue) => {
      if (issue.itemId === itemId && issue.status !== 'Returned') {
        return total + issue.quantity;
      }
      return total;
    }, 0);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {currentPage === 'inventory' ? (
        <InventoryPage 
          inventory={inventory}
          setInventory={setInventory}
          onNavigateToIssue={() => setCurrentPage('issue')}
          onNavigateToStudents={() => setCurrentPage('students')}
          issuanceHistory={issuanceHistory}
          getIssuedQuantity={getIssuedQuantity}
          students={students}
          onLogout={handleLogout}
        />
      ) : currentPage === 'issue' ? (
        <IssuePage 
          inventory={inventory}
          students={students}  // Pass students data
          onIssueItem={handleIssueItem}
          onBack={() => setCurrentPage('inventory')}
        />
      ) : (
        <StudentsPage 
          students={students}
          setStudents={setStudents}
          inventory={inventory}  // Pass inventory to show item names
          issuanceHistory={issuanceHistory}
          onReturnItem={handleReturnItem}
          onBack={() => setCurrentPage('inventory')}
        />
      )}
    </div>
  );
}

export default App;
