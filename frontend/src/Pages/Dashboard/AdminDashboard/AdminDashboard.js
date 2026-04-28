import React, { useState } from 'react';
import './AdminDashboard.css';
// Placeholder imports for sub-components
import Maintenance from './Components/Maintenance';
import Transactions from '../Transactions';
import Reports from '../Reports';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("Maintenance");

    const renderContent = () => {
        switch(activeTab) {
            case "Maintenance":
                return <Maintenance />;
            case "Reports":
                return <Reports isAdmin={true} />;
            case "Transactions":
                return <Transactions isAdmin={true} />;
            default:
                return <div>Select a module</div>;
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-sidebar">
                <h3 className="sidebar-title">Admin Controls</h3>
                <div className="sidebar-menu">
                    <button 
                        className={`sidebar-btn ${activeTab === 'Maintenance' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('Maintenance')}
                    >
                        Maintenance
                    </button>
                    <button 
                        className={`sidebar-btn ${activeTab === 'Reports' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('Reports')}
                    >
                        Reports
                    </button>
                    <button 
                        className={`sidebar-btn ${activeTab === 'Transactions' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('Transactions')}
                    >
                        Transactions
                    </button>
                </div>
            </div>
            <div className="dashboard-main">
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminDashboard;