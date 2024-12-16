import React, { useState } from 'react';

function IssuePage({ inventory, students, onIssueItem, onBack }) {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Find selected item to check quantity
    const item = inventory.find(i => i.id === parseInt(selectedItem));
    
    if (!item) {
      setError('Please select an item');
      return;
    }

    if (parseInt(quantity) > item.quantity) {
      setError(`Only ${item.quantity} ${item.name}(s) available`);
      return;
    }

    if (parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setError('');
    onIssueItem({
      itemId: selectedItem,
      quantity: parseInt(quantity),
      studentId: selectedStudent,
      date: new Date().toISOString(),
    });
  };

  // Find the selected item for max quantity
  const selectedItemDetails = inventory.find(i => i.id === parseInt(selectedItem));
  
  // Find the selected student for display
  const student = students.find(s => s.id === parseInt(selectedStudent));

  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", color: "#1e293b", margin: 0, fontWeight: "600" }}>
            Issue Item
          </h1>
          <button
            onClick={onBack}
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
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#4f5aa9"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#5c6ac4"}
          >
            Back to Inventory
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Select Item
              <select
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value);
                  setError('');
                  // Reset quantity when item changes
                  setQuantity(1);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  marginTop: "8px",
                }}
                required
              >
                <option value="">Select an item</option>
                {inventory.map(item => (
                  <option 
                    key={item.id} 
                    value={item.id}
                    disabled={item.quantity === 0}
                  >
                    {item.name} (Available: {item.quantity})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Select Student
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  marginTop: "8px",
                }}
                required
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.enrollmentNumber})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {student && (
            <div style={{
              marginBottom: "20px",
              padding: "12px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              fontSize: "14px"
            }}>
              <p style={{ margin: "4px 0" }}><strong>Department:</strong> {student.department}</p>
              <p style={{ margin: "4px 0" }}><strong>Email:</strong> {student.email}</p>
              <p style={{ margin: "4px 0" }}><strong>Phone:</strong> {student.phoneNumber}</p>
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Quantity
              <input
                type="number"
                min="1"
                max={selectedItemDetails?.quantity || 1}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError('');
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  marginTop: "8px",
                }}
                required
              />
            </label>
            {selectedItemDetails && (
              <p style={{ 
                margin: "4px 0 0", 
                fontSize: "14px", 
                color: "#666" 
              }}>
                Maximum available: {selectedItemDetails.quantity}
              </p>
            )}
          </div>

          {error && (
            <div style={{
              padding: "12px",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              width: "100%",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
          >
            Issue Item
          </button>
        </form>
      </div>
    </div>
  );
}

export default IssuePage; 