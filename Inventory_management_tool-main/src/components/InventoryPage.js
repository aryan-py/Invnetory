import React, { useState } from "react";

function InventoryPage({ 
  inventory, 
  setInventory, 
  onNavigateToIssue, 
  onNavigateToStudents,
  issuanceHistory,
  getIssuedQuantity,
  students,
  onLogout
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [csvError, setCsvError] = useState("");

  // Filter inventory based on search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle item editing
  const handleEditItem = (updatedItem) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditingItem(null);
  };

  // Handle adding new item
  const handleAddItem = (newItem) => {
    const newId = Math.max(...inventory.map(item => item.id)) + 1;
    setInventory(prev => [...prev, { ...newItem, id: newId }]);
    setIsAddingItem(false);
  };

  // Handle checkbox selection
  const handleSelect = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === filteredInventory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredInventory.map(item => item.id)));
    }
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    setInventory(prev => prev.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  // Add/Edit Modal shared styles
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "16px",
    width: "450px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "15px",
    marginTop: "8px",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  // Add this function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Add this function to get student name
  const getStudentName = (studentId) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown Student';
  };

  // Add this function to get item name
  const getItemName = (itemId) => {
    return inventory.find(i => i.id === itemId)?.name || 'Unknown Item';
  };

  // Add this function to download global history
  const downloadGlobalHistory = () => {
    // Create CSV header
    const csvHeader = ['Date', 'Student Name', 'Item Name', 'Quantity', 'Status', 'Return Date'];
    
    // Create CSV rows
    const csvRows = issuanceHistory.map(history => [
      new Date(history.date).toLocaleString(),
      getStudentName(history.studentId),
      getItemName(history.itemId),
      history.quantity,
      history.status,
      history.returnDate ? new Date(history.returnDate).toLocaleString() : 'N/A'
    ]);
    
    // Combine header and rows
    const csvContent = [
      csvHeader,
      ...csvRows
    ].map(row => row.join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'complete_issuance_history.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add function to handle CSV file import
  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setCsvError("Please upload a valid CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].toLowerCase().trim().split(',');
        
        // Validate headers
        const requiredHeaders = ['name', 'quantity'];
        const hasRequiredHeaders = requiredHeaders.every(header => 
          headers.includes(header)
        );

        if (!hasRequiredHeaders) {
          setCsvError("CSV must contain 'name' and 'quantity' columns");
          return;
        }

        // Get column indices
        const nameIndex = headers.indexOf('name');
        const quantityIndex = headers.indexOf('quantity');

        // Parse items
        const newItems = rows.slice(1)
          .filter(row => row.trim()) // Skip empty rows
          .map(row => {
            const columns = row.split(',');
            const name = columns[nameIndex].trim();
            const quantity = parseInt(columns[quantityIndex]);

            if (!name || isNaN(quantity) || quantity < 0) {
              throw new Error(`Invalid data: ${row}`);
            }

            return {
              name,
              quantity
            };
          });

        // Generate new IDs and add items
        const maxId = Math.max(0, ...inventory.map(item => item.id));
        const itemsWithIds = newItems.map((item, index) => ({
          ...item,
          id: maxId + index + 1
        }));

        setInventory(prev => [...prev, ...itemsWithIds]);
        setCsvError("");
        event.target.value = ''; // Reset file input
      } catch (error) {
        setCsvError("Error processing CSV file. Please check the format.");
        console.error(error);
      }
    };

    reader.onerror = () => {
      setCsvError("Error reading file");
    };

    reader.readAsText(file);
  };

  return (
    <div
      className="inventory-container"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        className="inventory-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        }}
      >
        <h1 style={{ 
          fontSize: "28px", 
          color: "#1e293b",
          margin: 0,
          fontWeight: "600" 
        }}>
          Electronics Lab Inventory
        </h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "12px 16px",
              width: "300px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "15px",
              backgroundColor: "#f8fafc",
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#5c6ac4"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
          <button
            onClick={onNavigateToIssue}
            style={{
              backgroundColor: "#5c6ac4",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#4f5aa9"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#5c6ac4"}
          >
            Issue Item
          </button>
          <button
            onClick={onNavigateToStudents}
            style={{
              backgroundColor: "#5c6ac4",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#4f5aa9"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#5c6ac4"}
          >
            Students
          </button>
          <button
            onClick={() => setShowHistory(true)}
            style={{
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#10B981"}
          >
            History
          </button>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#b91c1c"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#dc2626"}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "12px", 
        marginBottom: "24px",
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
      }}>
        <button
          onClick={() => setIsAddingItem(true)}
          style={{
            backgroundColor: "#5c6ac4",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#4f5aa9"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#5c6ac4"}
        >
          <span style={{ fontSize: "20px" }}>+</span> Add Item
        </button>

        {/* Add CSV Import Button */}
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            style={{ display: 'none' }}
            id="csv-input"
          />
          <label
            htmlFor="csv-input"
            style={{
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#10B981"}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "4px" }}
            >
              <path 
                d="M8 1L3 6H6V12H10V6H13L8 1Z" 
                fill="currentColor"
              />
            </svg>
            Import CSV
          </label>
        </div>

        {selectedItems.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#fecaca";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#fee2e2";
            }}
          >
            Delete Selected ({selectedItems.size})
          </button>
        )}
      </div>

      {/* Add Error Message Display */}
      {csvError && (
        <div style={{
          padding: "12px",
          backgroundColor: "#fee2e2",
          color: "#dc2626",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "14px",
        }}>
          {csvError}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: "1" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0",
              backgroundColor: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ ...tableHeaderStyle, width: "40px", padding: "16px" }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredInventory.length && filteredInventory.length > 0}
                    onChange={handleSelectAll}
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                </th>
                <th style={{ ...tableHeaderStyle, padding: "16px" }}>Name</th>
                <th style={{ ...tableHeaderStyle, padding: "16px" }}>Total Quantity</th>
                <th style={{ ...tableHeaderStyle, padding: "16px" }}>Issued Items</th>
                <th style={{ ...tableHeaderStyle, padding: "16px" }}>Available Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const issuedCount = getIssuedQuantity(item.id);
                const availableCount = item.quantity;
                
                return (
                  <tr 
                    key={item.id} 
                    style={{
                      ...tableRowStyle,
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                  >
                    <td style={{ ...tableCellStyle, width: "40px", padding: "16px" }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelect(item.id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                    </td>
                    <td style={{ ...tableCellStyle, padding: "16px" }}>{item.name}</td>
                    <td style={{ ...tableCellStyle, padding: "16px" }}>{availableCount + issuedCount}</td>
                    <td style={{ ...tableCellStyle, padding: "16px" }}>{issuedCount}</td>
                    <td style={{ ...tableCellStyle, padding: "16px" }}>{availableCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ width: "100px", paddingTop: "64px" }}>
          {filteredInventory.map((item) => (
            <button
              key={item.id}
              onClick={() => setEditingItem(item)}
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "white",
                color: "#5c6ac4",
                border: "1px solid #5c6ac4",
                padding: "8px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "18px",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                height: "36px",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#5c6ac4";
                e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "#5c6ac4";
              }}
            >
              Edit
            </button>
          ))}
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div
          style={modalStyle}
        >
          <div
            style={modalContentStyle}
          >
            <h2>Add New Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItem({
                  name: e.target.name.value,
                  quantity: parseInt(e.target.quantity.value),
                });
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Name
                  <input
                    type="text"
                    name="name"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Quantity
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div
          style={modalStyle}
        >
          <div
            style={modalContentStyle}
          >
            <h2>Edit Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditItem({
                  ...editingItem,
                  name: e.target.name.value,
                  quantity: parseInt(e.target.quantity.value),
                });
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Name
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingItem.name}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Quantity
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={editingItem.quantity}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Global History Modal */}
      {showHistory && (
        <div style={modalStyle}>
          <div style={{
            ...modalContentStyle,
            width: "800px",
            maxWidth: "90vw",
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ margin: 0 }}>Global Issuance History</h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={downloadGlobalHistory}
                  style={{
                    backgroundColor: "#10B981",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#10B981"}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginRight: "4px" }}
                  >
                    <path d="M8 12L3 7H6V1H10V7H13L8 12Z" fill="currentColor"/>
                    <path d="M14 14H2V11H4V12H12V11H14V14Z" fill="currentColor"/>
                  </svg>
                  Download History
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ 
              maxHeight: "600px", 
              overflowY: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={historyHeaderStyle}>Date</th>
                    <th style={historyHeaderStyle}>Student</th>
                    <th style={historyHeaderStyle}>Item</th>
                    <th style={historyHeaderStyle}>Quantity</th>
                    <th style={historyHeaderStyle}>Status</th>
                    <th style={historyHeaderStyle}>Return Date</th>
                  </tr>
                </thead>
                <tbody>
                  {issuanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).map((history) => (
                    <tr key={history.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={historyCellStyle}>{formatDate(history.date)}</td>
                      <td style={historyCellStyle}>{getStudentName(history.studentId)}</td>
                      <td style={historyCellStyle}>{getItemName(history.itemId)}</td>
                      <td style={historyCellStyle}>{history.quantity}</td>
                      <td style={{
                        ...historyCellStyle,
                        color: history.status === 'Returned' ? '#059669' : '#dc2626'
                      }}>
                        {history.status}
                      </td>
                      <td style={historyCellStyle}>
                        {history.returnDate ? formatDate(history.returnDate) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {issuanceHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ ...historyCellStyle, textAlign: "center" }}>
                        No issuance history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles for table
const tableHeaderStyle = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
};

const tableRowStyle = {
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "12px",
};

// Add these styles if not already present
const historyHeaderStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: "500",
  backgroundColor: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const historyCellStyle = {
  padding: "12px 16px",
  color: "#2d3748",
};

export default InventoryPage;
