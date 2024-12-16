import React, { useState } from 'react';

// Initial students data
const initialStudents = [
  {
    id: 1,
    name: "John Doe",
    enrollmentNumber: "2021BCS001",
    department: "Computer Science",
    phoneNumber: "9876543210",
    email: "john.doe@school.edu"
  },
  {
    id: 2,
    name: "Jane Smith",
    enrollmentNumber: "2021BEE015",
    department: "Electrical Engineering",
    phoneNumber: "9876543211",
    email: "jane.smith@school.edu"
  },
  // Add more sample students as needed
];

function StudentsPage({ 
  students, 
  setStudents, 
  inventory, 
  issuanceHistory, 
  onReturnItem,
  onBack 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding new student
  const handleAddStudent = (newStudent) => {
    const newId = Math.max(...students.map(s => s.id)) + 1;
    setStudents(prev => [...prev, { ...newStudent, id: newId }]);
    setIsAddingStudent(false);
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get student's history
  const getStudentHistory = (studentId) => {
    return issuanceHistory
      .filter(history => history.studentId === studentId)
      .map(history => ({
        ...history,
        itemName: inventory.find(item => item.id === history.itemId)?.name || 'Unknown Item'
      }));
  };

  // Add this function to generate and download CSV
  const downloadStudentHistory = (student) => {
    // Get student's history
    const studentHistory = getStudentHistory(student.id);
    
    // Create CSV header
    const csvHeader = ['Item Name', 'Quantity', 'Issue Date', 'Status', 'Return Date'];
    
    // Create CSV rows
    const csvRows = studentHistory.map(history => [
      history.itemName,
      history.quantity,
      new Date(history.date).toLocaleString(),
      history.status,
      history.returnDate ? new Date(history.returnDate).toLocaleString() : 'N/A'
    ]);
    
    // Combine header and rows
    const csvContent = [
      csvHeader,
      ...csvRows
    ].map(row => row.join(',')).join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${student.name}_issuance_history.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add function to handle student deletion
  const handleDeleteStudents = () => {
    // Check if any selected student has unreturned items
    const hasUnreturnedItems = Array.from(selectedStudents).some(studentId => {
      return issuanceHistory.some(history => 
        history.studentId === studentId && 
        history.status !== 'Returned'
      );
    });

    if (hasUnreturnedItems) {
      alert("Cannot delete students with unreturned items.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedStudents.size} student(s)?`)) {
      setStudents(prev => prev.filter(student => !selectedStudents.has(student.id)));
      setSelectedStudents(new Set());
    }
  };

  // Add function to handle student edit
  const handleEditStudent = (updatedStudent) => {
    setStudents(prev => prev.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    ));
    setEditingStudent(null);
  };

  // Add function to handle checkbox selection
  const handleSelect = (id) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  // Add function to handle select all
  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

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
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", color: "#1e293b", margin: 0, fontWeight: "600" }}>
            Students List
          </h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "12px 16px",
                width: "300px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                backgroundColor: "#f8fafc",
              }}
            />
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
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => setIsAddingStudent(true)}
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
              marginBottom: "24px",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#4f5aa9"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#5c6ac4"}
          >
            + Add Student
          </button>

          {selectedStudents.size > 0 && (
            <button
              onClick={handleDeleteStudents}
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
              onMouseOver={(e) => e.target.style.backgroundColor = "#fecaca"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#fee2e2"}
            >
              Delete Selected ({selectedStudents.size})
            </button>
          )}
        </div>

        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0",
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={tableHeaderStyle}>
                <input
                  type="checkbox"
                  checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
              </th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Enrollment No.</th>
              <th style={tableHeaderStyle}>Department</th>
              <th style={tableHeaderStyle}>Phone Number</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
              >
                <td style={tableCellStyle}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => handleSelect(student.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                </td>
                <td style={tableCellStyle}>{student.name}</td>
                <td style={tableCellStyle}>{student.enrollmentNumber}</td>
                <td style={tableCellStyle}>{student.department}</td>
                <td style={tableCellStyle}>{student.phoneNumber}</td>
                <td style={tableCellStyle}>{student.email}</td>
                <td style={tableCellStyle}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setSelectedStudentHistory(student)}
                      style={{
                        backgroundColor: "#5c6ac4",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      View History
                    </button>
                    <button
                      onClick={() => setEditingStudent(student)}
                      style={{
                        backgroundColor: "#5c6ac4",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {selectedStudentHistory && (
        <div style={modalStyle}>
          <div style={{
            ...modalContentStyle,
            width: "600px",
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ margin: 0 }}>Issuance History - {selectedStudentHistory.name}</h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => downloadStudentHistory(selectedStudentHistory)}
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
                    <path 
                      d="M8 12L3 7H6V1H10V7H13L8 12Z" 
                      fill="currentColor"
                    />
                    <path 
                      d="M14 14H2V11H4V12H12V11H14V14Z" 
                      fill="currentColor"
                    />
                  </svg>
                  Download History
                </button>
                <button
                  onClick={() => setSelectedStudentHistory(null)}
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
              maxHeight: "400px", 
              overflowY: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={historyHeaderStyle}>Item</th>
                    <th style={historyHeaderStyle}>Quantity</th>
                    <th style={historyHeaderStyle}>Issue Date</th>
                    <th style={historyHeaderStyle}>Status</th>
                    <th style={historyHeaderStyle}>Return Date</th>
                    <th style={historyHeaderStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getStudentHistory(selectedStudentHistory.id).map((history) => (
                    <tr key={history.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={historyCellStyle}>{history.itemName}</td>
                      <td style={historyCellStyle}>{history.quantity}</td>
                      <td style={historyCellStyle}>{formatDate(history.date)}</td>
                      <td style={{
                        ...historyCellStyle,
                        color: history.status === 'Returned' ? '#059669' : '#dc2626'
                      }}>
                        {history.status}
                      </td>
                      <td style={historyCellStyle}>
                        {history.returnDate ? formatDate(history.returnDate) : 'N/A'}
                      </td>
                      <td style={historyCellStyle}>
                        {history.status !== 'Returned' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Return ${history.quantity} ${history.itemName}(s)?`)) {
                                onReturnItem(history);
                              }
                            }}
                            style={{
                              backgroundColor: "#10B981",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {getStudentHistory(selectedStudentHistory.id).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ ...historyCellStyle, textAlign: "center" }}>
                        No items issued yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddingStudent && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>Add New Student</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddStudent({
                name: e.target.name.value,
                enrollmentNumber: e.target.enrollmentNumber.value,
                department: e.target.department.value,
                phoneNumber: e.target.phoneNumber.value,
                email: e.target.email.value,
              });
            }}>
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
              {/* Add similar input fields for other student details */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Enrollment Number
                  <input
                    type="text"
                    name="enrollmentNumber"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Department
                  <input
                    type="text"
                    name="department"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Phone Number
                  <input
                    type="tel"
                    name="phoneNumber"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Email
                  <input
                    type="email"
                    name="email"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
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

      {/* Add Edit Student Modal */}
      {editingStudent && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>Edit Student</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditStudent({
                ...editingStudent,
                name: e.target.name.value,
                enrollmentNumber: e.target.enrollmentNumber.value,
                department: e.target.department.value,
                phoneNumber: e.target.phoneNumber.value,
                email: e.target.email.value,
              });
            }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Name
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingStudent.name}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Enrollment Number
                  <input
                    type="text"
                    name="enrollmentNumber"
                    defaultValue={editingStudent.enrollmentNumber}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Department
                  <input
                    type="text"
                    name="department"
                    defaultValue={editingStudent.department}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Phone Number
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editingStudent.phoneNumber}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Email
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingStudent.email}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
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
    </div>
  );
}

const tableHeaderStyle = {
  padding: "16px",
  textAlign: "left",
  fontWeight: "500",
  color: "#4a5568",
  borderBottom: "2px solid #e2e8f0",
};

const tableCellStyle = {
  padding: "16px",
  color: "#2d3748",
};

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
  width: "500px",
  maxWidth: "90%",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "15px",
  marginTop: "8px",
};

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

export default StudentsPage; 