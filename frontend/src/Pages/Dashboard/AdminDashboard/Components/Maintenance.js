import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Maintenance() {
    const [subTab, setSubTab] = useState("Membership");
    const [mode, setMode] = useState("Add"); // 'Add' or 'Update'
    const API_URL = process.env.REACT_APP_API_URL;
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        setErrorMsg("");
        setSuccessMsg("");
    }, [subTab, mode]);

    // Membership State
    const [membership, setMembership] = useState({
        membershipId: "", firstName: "", lastName: "", contactNumber: "", contactAddress: "",
        aadharCardNo: "", startDate: "", membershipDuration: "6m"
    });

    // Book/Movie State
    const [item, setItem] = useState({
        itemType: "Book", bookName: "", serialNo: "", author: "", dateOfProcurement: "", bookCountAvailable: 1
    });

    // User State
    const [userForm, setUserForm] = useState({
        userId: "", userFullName: "", password: "", isAdmin: false, isActive: true
    });

    const handleMembershipSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!membership.membershipId || !membership.firstName || !membership.lastName) {
            setErrorMsg("All membership fields are strictly mandatory.");
            return;
        }
        try {
            if (mode === "Add") {
                await axios.post(API_URL + "api/maintenance/membership", membership);
                setSuccessMsg("Membership added successfully!");
            } else {
                await axios.put(API_URL + `api/maintenance/membership/${membership.membershipId}`, membership);
                setSuccessMsg("Membership updated successfully!");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data || "Error processing membership");
        }
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!item.bookName || !item.author || !item.serialNo) {
            setErrorMsg("All item fields are strictly mandatory.");
            return;
        }
        try {
            if (mode === "Add") {
                await axios.post(API_URL + "api/books/addbook", { ...item, isAdmin: true });
                setSuccessMsg(`${item.itemType} added successfully!`);
            } else {
                await axios.put(API_URL + `api/books/updatebook/${item.serialNo}`, { ...item, isAdmin: true });
                setSuccessMsg(`${item.itemType} updated successfully!`);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data || "Error processing item");
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!userForm.userId || !userForm.userFullName || (!userForm.password && mode === "Add")) {
            setErrorMsg("All user fields are strictly mandatory.");
            return;
        }
        try {
            if (mode === "Add") {
                await axios.post(API_URL + "api/auth/register", userForm);
                setSuccessMsg("User added successfully!");
            } else {
                await axios.put(API_URL + `api/users/update/${userForm.userId}`, userForm);
                setSuccessMsg("User updated successfully!");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data || "Error processing user");
        }
    };


    return (
        <div>
            <h2>Maintenance Module</h2>
            <div style={{ marginBottom: "20px" }}>
                <button onClick={() => setSubTab("Membership")} className={`tab-btn ${subTab === 'Membership' ? 'active' : ''}`}>Membership</button>
                <button onClick={() => setSubTab("BooksMovies")} className={`tab-btn ${subTab === 'BooksMovies' ? 'active' : ''}`}>Books/Movies</button>
                <button onClick={() => setSubTab("UserManagement")} className={`tab-btn ${subTab === 'UserManagement' ? 'active' : ''}`}>User Management</button>
            </div>

            {errorMsg && <p style={{ color: 'var(--danger)', margin: '15px 0', padding: '10px', background: 'rgba(255,71,87,0.1)', borderRadius: '8px' }}>{errorMsg}</p>}
            {successMsg && <p style={{ color: 'var(--success)', margin: '15px 0', padding: '10px', background: 'rgba(46,213,115,0.1)', borderRadius: '8px' }}>{successMsg}</p>}

            <div style={{ margin: '15px 0', display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="mode" checked={mode === "Add"} onChange={() => setMode("Add")} /> <b>Add New</b>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="mode" checked={mode === "Update"} onChange={() => setMode("Update")} /> <b>Update Existing</b>
                </label>
            </div>

            {subTab === "Membership" && (
                <form onSubmit={handleMembershipSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '10px' }}>
                    <h3>Add/Update Membership</h3>
                    <input type="text" placeholder="Membership ID" required onChange={(e) => setMembership({...membership, membershipId: e.target.value})} />
                    <input type="text" placeholder="First Name" required onChange={(e) => setMembership({...membership, firstName: e.target.value})} />
                    <input type="text" placeholder="Last Name" required onChange={(e) => setMembership({...membership, lastName: e.target.value})} />
                    <input type="text" placeholder="Contact Number" required onChange={(e) => setMembership({...membership, contactNumber: e.target.value})} />
                    <input type="text" placeholder="Contact Address" required onChange={(e) => setMembership({...membership, contactAddress: e.target.value})} />
                    <input type="text" placeholder="Aadhar Card No" required onChange={(e) => setMembership({...membership, aadharCardNo: e.target.value})} />
                    <label>Start Date</label>
                    <input type="date" required onChange={(e) => setMembership({...membership, startDate: e.target.value})} />
                    <label>Membership Duration</label>
                    <select onChange={(e) => setMembership({...membership, membershipDuration: e.target.value})}>
                        <option value="6m">6 Months</option>
                        <option value="1y">1 Year</option>
                        <option value="2y">2 Years</option>
                    </select>
                    <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>Submit</button>
                </form>
            )}

            {subTab === "BooksMovies" && (
                <form onSubmit={handleItemSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '10px' }}>
                    <h3>Add/Update Books & Movies</h3>
                    <select onChange={(e) => setItem({...item, itemType: e.target.value})}>
                        <option value="Book">Book</option>
                        <option value="Movie">Movie</option>
                    </select>
                    <input type="text" placeholder="Name" required onChange={(e) => setItem({...item, bookName: e.target.value})} />
                    <input type="text" placeholder="Author/Director" required onChange={(e) => setItem({...item, author: e.target.value})} />
                    <input type="text" placeholder="Serial No" required onChange={(e) => setItem({...item, serialNo: e.target.value})} />
                    <label>Date of Procurement</label>
                    <input type="date" required onChange={(e) => setItem({...item, dateOfProcurement: e.target.value})} />
                    <input type="number" placeholder="Available Copies" min="1" required onChange={(e) => setItem({...item, bookCountAvailable: e.target.value})} />
                    <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>Submit</button>
                </form>
            )}

            {subTab === "UserManagement" && (
                <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '10px' }}>
                    <h3>Add/Update User</h3>
                    <input type="text" placeholder="User ID" required onChange={(e) => setUserForm({...userForm, userId: e.target.value})} />
                    <input type="text" placeholder="Full Name" required onChange={(e) => setUserForm({...userForm, userFullName: e.target.value})} />
                    <input type="password" placeholder="Password" required onChange={(e) => setUserForm({...userForm, password: e.target.value})} />
                    <label>
                        <input type="checkbox" onChange={(e) => setUserForm({...userForm, isAdmin: e.target.checked})} /> Admin privileges
                    </label>
                    <label>
                        <input type="checkbox" defaultChecked onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})} /> Account Active
                    </label>
                    <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>Submit</button>
                </form>
            )}
        </div>
    );
}

export default Maintenance;
