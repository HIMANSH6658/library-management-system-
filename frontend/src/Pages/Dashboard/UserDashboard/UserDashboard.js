import React, { useState } from 'react';
import './UserDashboard.css';

import Transactions from '../Transactions';
import Reports from '../Reports';

function UserDashboard() {
    const [activeTab, setActiveTab] = useState("Reports");

    const renderContent = () => {
        switch(activeTab) {
            case "Reports":
                return <Reports isAdmin={false} />;
            case "Transactions":
                return <Transactions isAdmin={false} />;
            default:
                return <div>Select a module</div>;
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-sidebar">
                <h3 className="sidebar-title">User Controls</h3>
                <div className="sidebar-menu">
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

export default UserDashboard;
