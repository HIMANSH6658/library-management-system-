import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext.js';

function Transactions({ isAdmin }) {
    const { user } = useContext(AuthContext);
    const [subTab, setSubTab] = useState("Availability");
    const API_URL = process.env.REACT_APP_API_URL;
    
    const [books, setBooks] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [activeTransactions, setActiveTransactions] = useState([]);
    
    // Availability Search State
    const [searchQuery, setSearchQuery] = useState({ bookName: "", author: "", category: "" });
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState("");

    // Issue State
    const [issueForm, setIssueForm] = useState({
        bookId: "", borrowerId: "", transactionType: "Issued", fromDate: new Date().toISOString().split('T')[0]
    });
    const [issueError, setIssueError] = useState("");

    // Return State
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [fineCalculated, setFineCalculated] = useState(0);
    const [finePaid, setFinePaid] = useState(false);
    const [returnError, setReturnError] = useState("");
    const [issueSuccess, setIssueSuccess] = useState("");
    const [returnSuccess, setReturnSuccess] = useState("");
    const [payFineSuccess, setPayFineSuccess] = useState("");

    useEffect(() => {
        setSearchError("");
        setIssueError("");
        setReturnError("");
        setIssueSuccess("");
        setReturnSuccess("");
        setPayFineSuccess("");

        if (subTab === "Issue" && !issueForm.bookId) {
            setSubTab("Availability");
            setSearchError("Select a book to proceed with issuing");
            return;
        }
        if (subTab === "PayFine" && !selectedTransaction) {
            setSubTab("Return");
            setReturnError("Select an active issue to initiate return clearing");
            return;
        }
        fetchData();
    }, [API_URL, isAdmin, subTab]);

    const fetchData = async () => {
        try {
            const bookRes = await axios.get(API_URL + "api/books/allbooks");
            setBooks(bookRes.data);
            
            if (isAdmin) {
                const memRes = await axios.get(API_URL + "api/reports/memberships");
                setMemberships(memRes.data);
            }

            const transRes = await axios.get(API_URL + "api/transactions/all-transactions");
            // Filter active issued books
            const active = transRes.data.filter(t => t.transactionStatus === 'ISSUED' || t.transactionStatus === 'FINE_PENDING');
            setActiveTransactions(active);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    // --- availability search ---
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.bookName && !searchQuery.author && !searchQuery.category) {
            setSearchError("At least one field is required to search");
            return;
        }
        setSearchError("");
        
        const filtered = books.filter(b => {
            const matchName = searchQuery.bookName ? b.bookName.toLowerCase().includes(searchQuery.bookName.toLowerCase()) : true;
            const matchAuthor = searchQuery.author ? b.author.toLowerCase().includes(searchQuery.author.toLowerCase()) : true;
            const matchCat = searchQuery.category ? b.category?.toLowerCase().includes(searchQuery.category.toLowerCase()) : true;
            return matchName && matchAuthor && matchCat;
        });
        setSearchResults(filtered);
    };

    const handleBookSelect = (book) => {
        setIssueForm({
            ...issueForm,
            bookId: book._id,
            bookName: book.bookName
        });
        setSubTab("Issue");
    };

    // --- book issue ---
    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        setIssueError("");

        if (!issueForm.bookId || !issueForm.borrowerId) {
            setIssueError("Book and Member selection are mandatory.");
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        const chosenDate = new Date(issueForm.fromDate);

        if (chosenDate < today) {
            setIssueError("Issue Date cannot be earlier than today");
            return;
        }

        try {
            const selectedBook = books.find(b => b._id === issueForm.bookId);
            let borrowerId = issueForm.borrowerId;
            let borrowerName = "";

            if (!isAdmin) {
                borrowerId = user._id || user.id;
                borrowerName = user.userFullName || user.username;
            } else {
                const borrower = memberships.find(m => m._id === issueForm.borrowerId);
                borrowerName = borrower ? `${borrower.firstName} ${borrower.lastName}` : "Unknown Member";
            }

            await axios.post(API_URL + "api/transactions/add-transaction", {
                bookId: issueForm.bookId,
                borrowerId: borrowerId,
                bookName: selectedBook.bookName,
                borrowerName: borrowerName,
                transactionType: issueForm.transactionType,
                fromDate: issueForm.fromDate
            });
            
            setIssueSuccess("Book Issued Successfully!");
            setIssueForm({ bookId: "", borrowerId: "", transactionType: "Issued", fromDate: new Date().toISOString().split('T')[0] });
        } catch (err) {
            console.error(err);
            setIssueError(err.response?.data || "Failed to issue book");
        }
    };

    // --- return book ---
    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        setReturnError("");

        if (!selectedTransaction) {
            setReturnError("Please select a transaction to return");
            return;
        }

        try {
            const res = await axios.put(API_URL + `api/transactions/update-transaction/${selectedTransaction._id}`, {
                transactionStatus: 'RETURN_INITIATED',
                actualReturnDate: actualReturnDate,
                isAdmin: true
            });

            // ALWAYS route to PayFine regardless of fineCalculated being 0 or > 0
            setFineCalculated(res.data.fineCalculated || 0);
            setSelectedTransaction(res.data);
            setSubTab("PayFine");
        } catch (err) {
            console.error(err);
            setReturnError(err.response?.data || "Error returning book");
        }
    };

    // --- pay fine ---
    const handlePayFineSubmit = async (e) => {
        e.preventDefault();
        setReturnError("");

        if (!finePaid && fineCalculated > 0) {
            setReturnError("Checkbox 'Fine Paid' must be selected to complete transaction");
            return;
        }

        try {
            await axios.put(API_URL + `api/transactions/update-transaction/${selectedTransaction._id}`, {
                transactionStatus: 'COMPLETED',
                finePaid: true,
                isAdmin: true
            });
            setPayFineSuccess("Transaction Completed Successfully!");
        } catch (err) {
            console.error(err);
            setReturnError(err.response?.data || "Error settling fine");
        }
    };

    const selectedBookDetails = books.find(b => b._id === issueForm.bookId);

    return (
        <div className="transactions-container">
            <h2>Transactions Module</h2>
            <div className="tab-bar">
                <button onClick={() => setSubTab("Availability")} className={`tab-btn ${subTab === 'Availability' ? 'active' : ''}`}>Book Availability</button>
                <button onClick={() => setSubTab("Issue")} className={`tab-btn ${subTab === 'Issue' ? 'active' : ''}`}>Issue Book</button>
                <button onClick={() => setSubTab("Return")} className={`tab-btn ${subTab === 'Return' ? 'active' : ''}`}>Return Book</button>
                <button onClick={() => setSubTab("PayFine")} className={`tab-btn ${subTab === 'PayFine' ? 'active' : ''}`}>Pay Fine</button>
            </div>

            {subTab === "Availability" && (
                <div className="card">
                    <h3>Check Availability</h3>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        <input type="text" placeholder="Book Name" value={searchQuery.bookName} onChange={(e) => setSearchQuery({...searchQuery, bookName: e.target.value})} className="signin-textbox" style={{flex: 1}} />
                        <input type="text" placeholder="Author" value={searchQuery.author} onChange={(e) => setSearchQuery({...searchQuery, author: e.target.value})} className="signin-textbox" style={{flex: 1}} />
                        <input type="text" placeholder="Category" value={searchQuery.category} onChange={(e) => setSearchQuery({...searchQuery, category: e.target.value})} className="signin-textbox" style={{flex: 1}} />
                        <button type="submit" className="signin-button" style={{padding: '10px 20px'}}>Search</button>
                    </form>
                    {searchError && <p style={{color: 'var(--danger)', margin: '10px 0'}}>{searchError}</p>}
                    
                    {searchResults.length > 0 && (
                        <table className="modern-table" style={{width: '100%'}}>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Book Name</th>
                                    <th>Author</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map(b => (
                                    <tr key={b._id}>
                                        <td>
                                            <input 
                                                type="radio" 
                                                name="selectedBook" 
                                                checked={issueForm.bookId === b._id} 
                                                onChange={() => handleBookSelect(b)}
                                                disabled={b.bookCountAvailable <= 0}
                                            />
                                        </td>
                                        <td>{b.bookName}</td>
                                        <td>{b.author}</td>
                                        <td>
                                            {b.bookCountAvailable > 0 ? 
                                                <span style={{color: 'var(--success)'}}>Available ({b.bookCountAvailable})</span> : 
                                                <span style={{color: 'var(--danger)'}}>Out of Stock</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {subTab === "Issue" && (
                <form onSubmit={handleIssueSubmit} className="card" style={{ maxWidth: '500px' }}>
                    <h3>Issue Book</h3>
                    {issueError && <p style={{color: 'var(--danger)', margin: '10px 0'}}>{issueError}</p>}
                    {issueSuccess && <p style={{color: 'var(--success)', margin: '10px 0'}}>{issueSuccess}</p>}
                    
                    <label><b>Book Name</b></label>
                    <input type="text" value={selectedBookDetails?.bookName || "Select a book from availability tab first"} readOnly className="signin-textbox" />

                    <label><b>Author Name</b></label>
                    <input type="text" value={selectedBookDetails?.author || ""} readOnly className="signin-textbox" />

                    {isAdmin && (
                        <>
                            <label><b>Select Member</b></label>
                            <select required className="signin-textbox" value={issueForm.borrowerId} onChange={(e) => setIssueForm({...issueForm, borrowerId: e.target.value})}>
                                <option value="">Select Member...</option>
                                {memberships.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.membershipId})</option>)}
                            </select>
                        </>
                    )}
                    
                    <label><b>Issue Date</b></label>
                    <input type="date" value={issueForm.fromDate} readOnly className="signin-textbox" />

                    <label><b>Return Date (Standard 15 days limit)</b></label>
                    <input 
                        type="date" 
                        value={new Date(new Date(issueForm.fromDate).setDate(new Date(issueForm.fromDate).getDate() + 15)).toISOString().split('T')[0]} 
                        readOnly 
                        className="signin-textbox" 
                    />
                    
                    <button type="submit" className="signin-button" style={{marginTop: '15px'}}>Confirm Issue</button>
                </form>
            )}

            {subTab === "Return" && (
                <form onSubmit={handleReturnSubmit} className="card" style={{ maxWidth: '500px' }}>
                    <h3>Return Book</h3>
                    {returnError && <p style={{color: 'var(--danger)', margin: '10px 0'}}>{returnError}</p>}
                    
                    <label><b>Select Active Transaction</b></label>
                    {activeTransactions.length > 0 ? (
                        <table className="modern-table" style={{width: '100%', marginBottom: '15px'}}>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Book Name</th>
                                    <th>Borrower</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTransactions.map(t => (
                                    <tr key={t._id}>
                                        <td>
                                            <input 
                                                type="radio" 
                                                name="returnTransaction" 
                                                checked={selectedTransaction?._id === t._id} 
                                                onChange={() => setSelectedTransaction(t)} 
                                            />
                                        </td>
                                        <td>{t.bookName}</td>
                                        <td>{t.borrowerName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{color: 'var(--text-muted)', marginBottom: '15px'}}>No active issued transactions found</p>
                    )}

                    {selectedTransaction && (
                        <>
                            <label><b>Date of Issue</b></label>
                            <input type="text" value={new Date(selectedTransaction.fromDate).toLocaleDateString()} readOnly className="signin-textbox" />

                            <label><b>Target Date of Return</b></label>
                            <input type="text" value={new Date(selectedTransaction.toDate).toLocaleDateString()} readOnly className="signin-textbox" />
                        </>
                    )}

                    <label><b>Actual Return Date</b></label>
                    <input type="date" value={actualReturnDate} onChange={(e) => setActualReturnDate(e.target.value)} className="signin-textbox" />
                    
                    <button type="submit" className="signin-button" style={{marginTop: '15px'}}>Confirm Return</button>
                </form>
            )}

            {subTab === "PayFine" && (
                <form onSubmit={handlePayFineSubmit} className="card" style={{ maxWidth: '500px' }}>
                    <h3>Fine Payment Clearance</h3>
                    {returnError && <p style={{color: 'var(--danger)', margin: '10px 0'}}>{returnError}</p>}
                    {payFineSuccess && <p style={{color: 'var(--success)', margin: '10px 0'}}>{payFineSuccess}</p>}
                    
                    <label><b>Calculated Penalty Fine</b></label>
                    <input type="text" value={`$${fineCalculated}`} readOnly className="signin-textbox" style={{color: 'var(--danger)', fontWeight: 'bold'}} />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' }}>
                        <input type="checkbox" checked={finePaid} onChange={(e) => setFinePaid(e.target.checked)} style={{ transform: 'scale(1.2)' }} /> 
                        <b>Fine Cleared and Paid</b>
                    </label>

                    <button type="submit" className="signin-button" style={{ background: finePaid ? 'var(--success)' : 'var(--text-muted)' }}>Complete Transaction</button>
                </form>
            )}
        </div>
    );
}

export default Transactions;
