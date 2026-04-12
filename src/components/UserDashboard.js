// components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { makeApiCall } from '../api';

function UserDashboard({ userData }) {
  const [userInfo, setUserInfo] = useState(userData);
  const [bills, setBills] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [newBill, setNewBill] = useState({ billNo: '', referenceName: '', amount: '' });
  const [showRedeem, setShowRedeem] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserData();
    loadGifts();
  }, []);

  const loadUserData = async () => {
    const result = await makeApiCall('getUserData', { mobileNumber: userInfo.mobileNumber });
    if (result.success) {
      setUserInfo({ ...userInfo, totalPoints: result.totalPoints });
      setBills(result.bills);
    }
  };

  const loadGifts = async () => {
    const result = await makeApiCall('getGifts', {});
    if (result.success) {
      setGifts(result.gifts);
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    const result = await makeApiCall('addBill', {
      mobileNumber: userInfo.mobileNumber,
      ...newBill,
      amount: parseFloat(newBill.amount)
    });
    
    if (result.success) {
      setMessage(`Bill added! You earned ${result.points} points. Total: ${result.totalPoints} points`);
      setNewBill({ billNo: '', referenceName: '', amount: '' });
      loadUserData();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Error adding bill');
    }
  };

  const handleRedeem = async (gift) => {
    if (userInfo.totalPoints < gift.pointsRequired) {
      setMessage(`Insufficient points! Need ${gift.pointsRequired} points`);
      return;
    }

    const result = await makeApiCall('redeemGift', {
      mobileNumber: userInfo.mobileNumber,
      giftName: gift.name,
      pointsRequired: gift.pointsRequired,
      deliveryAddress: address
    });

    if (result.success) {
      setMessage(`Successfully redeemed ${gift.name}! Remaining points: ${result.remainingPoints}`);
      setShowRedeem(false);
      setSelectedGift(null);
      setAddress('');
      loadUserData();
    } else {
      setMessage(result.error);
    }
  };

  return (
    <div className="dashboard">
      <div className="user-info">
        <h2>Welcome, {userInfo.name}</h2>
        <div className="points-card">
          <h3>Total Points: {userInfo.totalPoints}</h3>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="add-bill-section">
        <h3>Add New Bill</h3>
        <form onSubmit={handleAddBill}>
          <input
            type="text"
            placeholder="Bill Number"
            value={newBill.billNo}
            onChange={(e) => setNewBill({ ...newBill, billNo: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Reference Name"
            value={newBill.referenceName}
            onChange={(e) => setNewBill({ ...newBill, referenceName: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            required
          />
          <button type="submit">Add Bill</button>
        </form>
      </div>

      <div className="bills-section">
        <h3>Your Bills</h3>
        <div className="bills-table">
          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, index) => (
                <tr key={index}>
                  <td>{bill.billNo}</td>
                  <td>{bill.referenceName}</td>
                  <td>₹{bill.amount}</td>
                  <td>{bill.points}</td>
                  <td>{bill.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="gifts-section">
        <h3>Available Gifts</h3>
        <div className="gifts-grid">
          {gifts.map((gift, index) => (
            <div key={index} className="gift-card">
              <h4>{gift.name}</h4>
              <p>{gift.description}</p>
              <p>Points Required: {gift.pointsRequired}</p>
              <button 
                onClick={() => {
                  setSelectedGift(gift);
                  setShowRedeem(true);
                }}
                disabled={userInfo.totalPoints < gift.pointsRequired}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      {showRedeem && selectedGift && (
        <div className="modal">
          <div className="modal-content">
            <h3>Redeem {selectedGift.name}</h3>
            <p>Points Required: {selectedGift.pointsRequired}</p>
            {selectedGift.name === 'Mobile Phone' && (
              <div className="form-group">
                <label>Delivery Address:</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows="3"
                />
              </div>
            )}
            <div className="modal-buttons">
              <button onClick={() => handleRedeem(selectedGift)}>Confirm</button>
              <button onClick={() => {
                setShowRedeem(false);
                setSelectedGift(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;