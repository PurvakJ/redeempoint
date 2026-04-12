// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { makeApiCall } from '../api';

function AdminDashboard({ userData }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({ mobileNumber: '', adhaarNumber: '', startDate: '', endDate: '' });
  const [bills, setBills] = useState([]);
  const [redeemRequests, setRedeemRequests] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateBillData, setUpdateBillData] = useState({ billNo: '', newAmount: '', reason: '' });
  const [newGift, setNewGift] = useState({ name: '', pointsRequired: '', description: '' });
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    loadUsers();
    loadGifts();
    loadSettings();
    loadRedeemRequests();
  }, []);

  const loadUsers = async () => {
    const result = await makeApiCall('getAllUsers', {});
    if (result.success) {
      setUsers(result.users);
      setFilteredUsers(result.users);
    }
  };

  const loadGifts = async () => {
    const result = await makeApiCall('getGifts', {});
    if (result.success) {
      setGifts(result.gifts);
    }
  };

  const loadSettings = async () => {
    const result = await makeApiCall('getSettings', {});
    if (result.success) {
      setSettings(result.settings);
    }
  };

  const loadRedeemRequests = async () => {
    const result = await makeApiCall('getRedeemRequests', {});
    if (result.success) {
      setRedeemRequests(result.requests);
    }
  };

  const handleFilter = async () => {
    const result = await makeApiCall('getFilteredUsers', filters);
    if (result.success) {
      setFilteredUsers(result.users);
    }
  };

  const handleUpdateBill = async (e) => {
    e.preventDefault();
    const result = await makeApiCall('updateBill', {
      ...updateBillData,
      mobileNumber: selectedUser.mobileNumber,
      newAmount: parseFloat(updateBillData.newAmount)
    });
    
    if (result.success) {
      alert('Bill updated successfully!');
      setUpdateBillData({ billNo: '', newAmount: '', reason: '' });
      loadUsers();
    } else {
      alert('Error updating bill');
    }
  };

  const handleUpdateGift = async (e) => {
    e.preventDefault();
    const result = await makeApiCall('updateGift', newGift);
    if (result.success) {
      alert('Gift updated successfully!');
      loadGifts();
      setNewGift({ name: '', pointsRequired: '', description: '' });
    }
  };

  const handleUpdateSettings = async (key, value) => {
    const result = await makeApiCall('updateSettings', { settingKey: key, settingValue: value });
    if (result.success) {
      setSettings({ ...settings, [key]: value });
      alert('Settings updated!');
    }
  };

  const handleUpdateRedeemStatus = async (requestId, status) => {
    const result = await makeApiCall('updateRedeemStatus', { requestId, status, remarks: `Updated by admin` });
    if (result.success) {
      alert('Redeem request updated!');
      loadRedeemRequests();
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Users & Bills
        </button>
        <button className={activeTab === 'redeems' ? 'active' : ''} onClick={() => setActiveTab('redeems')}>
          Redeem Requests
        </button>
        <button className={activeTab === 'gifts' ? 'active' : ''} onClick={() => setActiveTab('gifts')}>
          Manage Gifts
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          Settings
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="filters">
            <h3>Filter Users</h3>
            <input
              type="text"
              placeholder="Mobile Number"
              value={filters.mobileNumber}
              onChange={(e) => setFilters({ ...filters, mobileNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="Adhaar Number"
              value={filters.adhaarNumber}
              onChange={(e) => setFilters({ ...filters, adhaarNumber: e.target.value })}
            />
            <input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
            <button onClick={handleFilter}>Apply Filters</button>
          </div>

          <div className="users-list">
            <h3>Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Mobile</th>
                  <th>Adhaar</th>
                  <th>Name</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user.mobileNumber}</td>
                    <td>{user.adhaarNumber}</td>
                    <td>{user.name}</td>
                    <td>{user.totalPoints}</td>
                    <td>
                      <button onClick={() => setSelectedUser(user)}>Update Bill</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="modal">
              <div className="modal-content">
                <h3>Update Bill for {selectedUser.mobileNumber}</h3>
                <form onSubmit={handleUpdateBill}>
                  <input
                    type="text"
                    placeholder="Bill Number"
                    value={updateBillData.billNo}
                    onChange={(e) => setUpdateBillData({ ...updateBillData, billNo: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="New Amount"
                    value={updateBillData.newAmount}
                    onChange={(e) => setUpdateBillData({ ...updateBillData, newAmount: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Reason for update"
                    value={updateBillData.reason}
                    onChange={(e) => setUpdateBillData({ ...updateBillData, reason: e.target.value })}
                    required
                  />
                  <button type="submit">Update Bill</button>
                  <button type="button" onClick={() => setSelectedUser(null)}>Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'redeems' && (
        <div className="redeems-section">
          <h3>Redeem Requests</h3>
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Mobile</th>
                <th>Gift</th>
                <th>Points</th>
                <th>Status</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redeemRequests.map((request, index) => (
                <tr key={index}>
                  <td>{request.requestId}</td>
                  <td>{request.mobileNumber}</td>
                  <td>{request.giftName}</td>
                  <td>{request.pointsRedeemed}</td>
                  <td>{request.status}</td>
                  <td>{request.deliveryAddress}</td>
                  <td>
                    {request.status === 'Pending' && (
                      <>
                        <button onClick={() => handleUpdateRedeemStatus(request.requestId, 'Approved')}>
                          Approve
                        </button>
                        <button onClick={() => handleUpdateRedeemStatus(request.requestId, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'Approved' && (
                      <button onClick={() => handleUpdateRedeemStatus(request.requestId, 'Delivered')}>
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'gifts' && (
        <div className="gifts-section">
          <h3>Manage Gifts</h3>
          <form onSubmit={handleUpdateGift}>
            <input
              type="text"
              placeholder="Gift Name"
              value={newGift.name}
              onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Points Required"
              value={newGift.pointsRequired}
              onChange={(e) => setNewGift({ ...newGift, pointsRequired: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newGift.description}
              onChange={(e) => setNewGift({ ...newGift, description: e.target.value })}
              required
            />
            <button type="submit">Add/Update Gift</button>
          </form>

          <h4>Current Gifts</h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Points</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift, index) => (
                <tr key={index}>
                  <td>{gift.name}</td>
                  <td>{gift.pointsRequired}</td>
                  <td>{gift.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="settings-section">
          <h3>System Settings</h3>
          <div className="setting-item">
            <label>Points per 1000 Rupees:</label>
            <input
              type="number"
              value={settings.PointsPerThousand || 1}
              onChange={(e) => handleUpdateSettings('PointsPerThousand', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;