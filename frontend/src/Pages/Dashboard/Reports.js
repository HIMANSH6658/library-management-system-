import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reports({ isAdmin }) {
    const [subTab, setSubTab] = useState("Books");
    const API_URL = process.env.REACT_APP_API_URL;
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let endpoint = "";
                switch (subTab) {
                    case "Books": endpoint = "api/reports/books"; break;
                    case "Movies": endpoint = "api/reports/movies"; break;
                    case "Memberships": endpoint = "api/reports/memberships"; break;
                    case "ActiveIssues": endpoint = "api/transactions/active"; break;
                    case "OverdueReturns": endpoint = "api/transactions/overdue"; break;
                    case "IssueRequests": endpoint = "api/transactions/requests"; break;
                    default: return;
                }
                const res = await axios.get(API_URL + endpoint);
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [subTab, API_URL]);

    return (
        <div>
            <h2>Reports Module</h2>
            <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <button onClick={() => setSubTab("Books")} className={`tab-btn ${subTab === 'Books' ? 'active' : ''}`}>Master List of Books</button>
                <button onClick={() => setSubTab("Movies")} className={`tab-btn ${subTab === 'Movies' ? 'active' : ''}`}>Master List of Movies</button>
                {isAdmin && <button onClick={() => setSubTab("Memberships")} className={`tab-btn ${subTab === 'Memberships' ? 'active' : ''}`}>Master List of Memberships</button>}
                <button onClick={() => setSubTab("ActiveIssues")} className={`tab-btn ${subTab === 'ActiveIssues' ? 'active' : ''}`}>Active Issues</button>
                <button onClick={() => setSubTab("OverdueReturns")} className={`tab-btn ${subTab === 'OverdueReturns' ? 'active' : ''}`}>Overdue Returns</button>
                <button onClick={() => setSubTab("IssueRequests")} className={`tab-btn ${subTab === 'IssueRequests' ? 'active' : ''}`}>Pending Issue Requests</button>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
                    <thead>
                        <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
                            {/* Dynamic headers based on subTab */}
                            {["Books", "Movies"].includes(subTab) && (
                                <><th>Serial No</th><th>Name</th><th>Author/Director</th><th>Procurement Date</th><th>Available</th></>
                            )}
                            {subTab === "Memberships" && (
                                <><th>Membership ID</th><th>Name</th><th>Contact</th><th>Aadhar</th><th>End Date</th><th>Pending Fine</th></>
                            )}
                            {["ActiveIssues", "OverdueReturns", "IssueRequests"].includes(subTab) && (
                                <><th>Book Name</th><th>Borrower</th><th>Issue Date</th><th>Target Return Date</th><th>Status</th></>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                                {["Books", "Movies"].includes(subTab) && (
                                    <>
                                        <td>{item.serialNo}</td>
                                        <td>{item.bookName}</td>
                                        <td>{item.author}</td>
                                        <td>{new Date(item.dateOfProcurement).toLocaleDateString()}</td>
                                        <td>{item.bookCountAvailable}</td>
                                    </>
                                )}
                                {subTab === "Memberships" && (
                                    <>
                                        <td>{item.membershipId}</td>
                                        <td>{item.firstName} {item.lastName}</td>
                                        <td>{item.contactNumber}</td>
                                        <td>{item.aadharCardNo}</td>
                                        <td>{new Date(item.endDate).toLocaleDateString()}</td>
                                        <td style={{ color: item.finePending > 0 ? "red" : "green" }}>${item.finePending}</td>
                                    </>
                                )}
                                {["ActiveIssues", "OverdueReturns", "IssueRequests"].includes(subTab) && (
                                    <>
                                        <td>{item.bookName}</td>
                                        <td>{item.borrowerName}</td>
                                        <td>{new Date(item.fromDate).toLocaleDateString()}</td>
                                        <td style={{ color: subTab === "OverdueReturns" ? "red" : "inherit" }}>{new Date(item.toDate).toLocaleDateString()}</td>
                                        <td>{item.transactionStatus}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No data available for this report.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Reports;
