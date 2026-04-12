// ================= React Frontend - AdminDashboard.js (Optimized & Fixed) =================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab]= useState("pending");
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [redeems, setRedeems] = useState([]);
  const [pointsSetting, setPointsSetting] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [updateReason, setUpdateReason] = useState("");
  const [adminRemark, setAdminRemark] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftPoints, setGiftPoints] = useState("");
  const [selectedRedeem, setSelectedRedeem] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Cache and abort control
  const dataLoadedRef = useRef(false);
  const abortControllerRef = useRef(null);

  const brandData = {
    stats: [
      { value: "6+", label: "YEARS OF EXCELLENCE" },
      { value: "1,270+", label: "SATISFIED CLIENTS" },
      { value: "8,592+", label: "SUCCESSFUL DELIVERIES" }
    ],
    qualityFeatures: [
      { icon: "🏭", title: "Greystone 303 Grade", description: "Semi water proof plywood" },
      { icon: "💧", title: "Greystone 710 Grade", description: "Boiling water proof plywood" },
      { icon: "📏", title: "Multiple Thickness", description: "19mm, 16mm, 12mm, 9mm, 6mm" },
      { icon: "👑", title: "Greystone ULTRA PRIME", description: "Premium Diamond Club quality" }
    ]
  };

  const loadData = useCallback(async (showFullLoading = false) => {
    if (showFullLoading && !dataLoadedRef.current) {
      setLoading(true);
    } else if (dataLoadedRef.current) {
      setRefreshing(true);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const [usersRes, billsRes, pendingRes, giftsRes, redeemsRes, pointsRes] = await Promise.all([
        api("getAllUsers"), api("getAllBills"), api("getPendingBills"),
        api("getAllGifts"), api("getAllRedeems"), api("getPointSetting")
      ]);
      
      if (usersRes.success) setUsers(usersRes.users);
      if (billsRes.success) setBills(billsRes.bills);
      if (pendingRes.success) setPendingBills(pendingRes.pendingBills);
      if (giftsRes.success) setGifts(giftsRes.gifts);
      if (redeemsRes.success) setRedeems(redeemsRes.redeems);
      if (pointsRes.success) setPointsSetting(pointsRes.pointsPerThousand);
      
      dataLoadedRef.current = true;
    } catch (error) {
      if (error.name !== 'AbortError') console.error("Load error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  const handleApproveBill = async () => {
    setActionLoading(true);
    const res = await api("approveBill", { billNo: selectedBill.billNo, adminRemark });
    setActionLoading(false);
    if (res.success) {
      alert(`Bill approved! Points added: ${res.pointsAdded}`);
      setShowApproveModal(false);
      setSelectedBill(null);
      setAdminRemark("");
      loadData(false);
    } else alert(res.error);
  };

  const handleCancelBill = async () => {
    if (!cancelReason) {
      alert("Please enter a reason for cancellation");
      return;
    }
    setActionLoading(true);
    const res = await api("cancelBill", { billNo: selectedBill.billNo, cancelReason, adminRemark });
    setActionLoading(false);
    if (res.success) {
      alert("Bill cancelled successfully");
      setShowCancelModal(false);
      setSelectedBill(null);
      setCancelReason("");
      setAdminRemark("");
      loadData(false);
    } else alert(res.error);
  };

  const handleUpdateBill = async () => {
    if (!newAmount || !updateReason) {
      alert("Please enter new amount and reason");
      return;
    }
    setActionLoading(true);
    const res = await api("updateBill", { billNo: selectedBill.billNo, newAmount: Number(newAmount), reason: updateReason });
    setActionLoading(false);
    if (res.success) {
      alert("Bill updated successfully!");
      setShowUpdateModal(false);
      setSelectedBill(null);
      setNewAmount("");
      setUpdateReason("");
      loadData(false);
    } else alert(res.error);
  };

  const handleUpdateGift = async (gift) => {
    const newName = prompt("Enter new gift name:", gift.name);
    const newPoints = prompt("Enter new points:", gift.points);
    if (newName && newPoints) {
      setActionLoading(true);
      const res = await api("updateGift", { oldName: gift.name, newName, points: Number(newPoints), active: true });
      setActionLoading(false);
      if (res.success) {
        alert("Gift updated!");
        loadData(false);
      } else alert(res.error);
    }
  };

  const handleAddGift = async () => {
    if (!giftName || !giftPoints) {
      alert("Please enter gift name and points");
      return;
    }
    setActionLoading(true);
    const res = await api("addGift", { name: giftName, points: Number(giftPoints) });
    setActionLoading(false);
    if (res.success) {
      alert("Gift added!");
      setShowGiftModal(false);
      setGiftName("");
      setGiftPoints("");
      loadData(false);
    } else alert(res.error);
  };

  const handleDeleteGift = async (giftName) => {
    if (window.confirm(`Delete ${giftName}?`)) {
      setActionLoading(true);
      const res = await api("deleteGift", { name: giftName });
      setActionLoading(false);
      if (res.success) {
        alert("Gift deleted!");
        loadData(false);
      } else alert(res.error);
    }
  };

  const handleUpdateRedeemStatus = async () => {
    if (!selectedStatus) {
      alert("Please select a status");
      return;
    }
    if (selectedStatus === "Approved" && !trackingId) {
      alert("Please enter tracking ID");
      return;
    }
    if (selectedStatus === "Cancelled" && !cancelReason) {
      alert("Please enter reason for cancellation");
      return;
    }
    setActionLoading(true);
    const res = await api("updateRedeemStatus", { id: selectedRedeem.id, status: selectedStatus, trackingId, cancelReason });
    setActionLoading(false);
    if (res.success) {
      alert(`Redeem marked as ${selectedStatus}!`);
      setShowStatusModal(false);
      setSelectedStatus("");
      setTrackingId("");
      setCancelReason("");
      setSelectedRedeem(null);
      loadData(false);
    } else alert(res.error);
  };

  const handleUpdatePointsSetting = async () => {
    const newValue = prompt("Enter points per ₹1000:", pointsSetting);
    if (newValue) {
      setActionLoading(true);
      const res = await api("updatePointSetting", { pointsPerThousand: Number(newValue) });
      setActionLoading(false);
      if (res.success) {
        alert("Points setting updated!");
        setPointsSetting(Number(newValue));
        loadData(false);
      } else alert(res.error);
    }
  };

  const getStatusOptions = (currentStatus) => {
    switch(currentStatus) {
      case "Pending": return ["Approved", "Cancelled"];
      case "Approved": return ["Delivered", "Cancelled"];
      default: return [];
    }
  };

  // Skeleton Loader for Admin Dashboard
  if (loading) {
    return (
      <div className="admin-container">
        <div className="hero-section skeleton-hero"></div>
        <div className="admin-header skeleton-header">
          <div className="skeleton-text"></div>
          <div className="skeleton-btn"></div>
        </div>
        <div className="admin-tabs-skeleton">
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-stats"></div>
          <div className="skeleton-table"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {refreshing && <div className="toast-refresh">Refreshing data...</div>}

      {/* Admin Header - Top */}
      <div className="admin-header">
        <div className="header-left">
          <div className="logo-small">
            <span className="tree-icon-small">🌳</span>
            <h1>Admin Panel</h1>
          </div>
          <p className="welcome-text">GREYSTONE Management</p>
        </div>
        <div className="header-right">
          <div className="points-setting">
            <span>Points/₹1000: {pointsSetting}</span>
            <button onClick={handleUpdatePointsSetting} className="small-btn" disabled={actionLoading}>Edit</button>
          </div>
          <button onClick={onLogout} className="logout-btn" disabled={actionLoading}>🚪 Logout</button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="admin-tabs">
        <button className={activeTab === "pending" ? "tab-active" : "tab"} onClick={() => setActiveTab("pending")}>
          ⏳ Pending ({pendingBills.length})
        </button>
        <button className={activeTab === "allbills" ? "tab-active" : "tab"} onClick={() => setActiveTab("allbills")}>📄 Bills</button>
        <button className={activeTab === "users" ? "tab-active" : "tab"} onClick={() => setActiveTab("users")}>👥 Users</button>
        <button className={activeTab === "gifts" ? "tab-active" : "tab"} onClick={() => setActiveTab("gifts")}>🎁 Gifts</button>
        <button className={activeTab === "redeems" ? "tab-active" : "tab"} onClick={() => setActiveTab("redeems")}>📦 Redeems</button>
      </div>

      {/* Tab Content - All the data tables */}
      {activeTab === "pending" && (
        <div className="admin-section">
          <h3>Pending Approvals ({pendingBills.length})</h3>
          {pendingBills.length === 0 ? (
            <div className="no-data-message">✨ No pending bills</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Bill No</th><th>Mobile</th><th>Amount</th><th>Points</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pendingBills.slice(0, 30).map((bill, i) => (
                    <tr key={i}>
                      <td>{bill.billNo}</td>
                      <td>{bill.mobile}</td>
                      <td>₹{bill.amount}</td>
                      <td><strong>{bill.points.toFixed(2)}</strong></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn approve-btn" onClick={() => { setSelectedBill(bill); setShowApproveModal(true); }} disabled={actionLoading} title="Approve Bill">✓</button>
                          <button className="action-btn cancel-btn" onClick={() => { setSelectedBill(bill); setShowCancelModal(true); }} disabled={actionLoading} title="Cancel Bill">✗</button>
                          <button className="action-btn edit-btn" onClick={() => { setSelectedBill(bill); setNewAmount(bill.amount); setShowUpdateModal(true); }} disabled={actionLoading} title="Edit Bill">✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "allbills" && (
        <div className="admin-section">
          <h3>All Bills ({bills.length})</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Bill No</th><th>Mobile</th><th>Amount</th><th>Points</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bills.slice(0, 50).map((bill, i) => (
                  <tr key={i}>
                    <td>{bill.billNo}</td>
                    <td>{bill.mobile}</td>
                    <td>₹{bill.amount}</td>
                    <td>{bill.points.toFixed(2)}</td>
                    <td><span className={`status-${bill.status.toLowerCase()}`}>{bill.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-section">
          <h3>All Users ({users.length})</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{users.reduce((sum, u) => sum + u.totalPoints, 0).toFixed(0)}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Mobile</th><th>Name</th><th>Points</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.slice(0, 50).map((u, i) => (
                  <tr key={i}>
                    <td>{u.mobileNumber}</td>
                    <td>{u.name}</td>
                    <td><strong>{u.totalPoints.toFixed(2)}</strong></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "gifts" && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Gifts</h3>
            <button onClick={() => setShowGiftModal(true)} className="add-btn" disabled={actionLoading}>+ Add</button>
          </div>
          <div className="gifts-admin-grid">
            {gifts.map((gift, i) => (
              <div key={i} className="gift-admin-card">
                <div>
                  <div className="gift-name">🎁 {gift.name}</div>
                  <div className="gift-points">{gift.points} points</div>
                </div>
                <div className="gift-actions">
                  <button onClick={() => handleUpdateGift(gift)} className="edit-btn" disabled={actionLoading} title="Edit Gift">✏️</button>
                  <button onClick={() => handleDeleteGift(gift.name)} className="delete-btn" disabled={actionLoading} title="Delete Gift">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "redeems" && (
        <div className="admin-section">
          <h3>Redeem Requests</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{redeems.filter(r => r.status === "Pending").length}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{redeems.filter(r => r.status === "Approved").length}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{redeems.filter(r => r.status === "Delivered").length}</div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Mobile</th><th>Gift</th><th>Points</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {redeems.slice(0, 30).map((redeem, i) => (
                  <tr key={i}>
                    <td>{redeem.id}</td>
                    <td>{redeem.mobile}</td>
                    <td>{redeem.gift}</td>
                    <td>{redeem.points}</td>
                    <td><span className={`status-${redeem.status.toLowerCase()}`}>{redeem.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" onClick={() => { setSelectedRedeem(redeem); setShowRedeemModal(true); }} disabled={actionLoading} title="View Details">👁️</button>
                        {getStatusOptions(redeem.status).length > 0 && (
                          <select className="status-select" onChange={(e) => { setSelectedRedeem(redeem); setSelectedStatus(e.target.value); setTrackingId(""); setCancelReason(""); setShowStatusModal(true); }} value="" disabled={actionLoading}>
                            <option value="">Change</option>
                            {getStatusOptions(redeem.status).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hero Section - AT THE BOTTOM as you want */}
      <div className="hero-section admin-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>GREYSTONE Admin</h1>
          <p>Complete Management Dashboard</p>
          <div className="hero-badges">
            <span>🏆 25 Year Guarantee</span>
            <span>🌿 Eco-Friendly</span>
            <span>💪 Termite Proof</span>
          </div>
        </div>
      </div>
      
      {/* Quality Features - AT THE BOTTOM */}
      <div className="quality-features">
        <h2>Quality Standards</h2>
        <div className="quality-grid">
          {brandData.qualityFeatures.map((feature, idx) => (
            <div key={idx} className="quality-card">
              <div className="quality-icon">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats - AT THE BOTTOM */}
      <div className="brand-stats-footer">
        <div className="stats-container">
          {brandData.stats.map((stat, idx) => (
            <div key={idx} className="brand-stat">
              <span className="stat-number">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="footer-note">
          <p>🌳 GREYSTONE - Premium Plywood | Since 2020</p>
        </div>
      </div>

      {/* All Modals */}
      {showApproveModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Approve Bill</h3>
            <p>Bill: <strong>{selectedBill.billNo}</strong> | Amount: ₹{selectedBill.amount}</p>
            <p>Points to add: <strong>{selectedBill.points.toFixed(2)}</strong></p>
            <textarea placeholder="Admin remark (optional)" value={adminRemark} onChange={e => setAdminRemark(e.target.value)} className="form-input" rows="2" />
            <div className="modal-actions">
              <button onClick={handleApproveBill} className="submit-btn approve-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Approve"}
              </button>
              <button onClick={() => setShowApproveModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Cancel Bill</h3>
            <p>Bill: <strong>{selectedBill.billNo}</strong></p>
            <textarea placeholder="Cancel reason *" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="form-input" rows="3" />
            <div className="modal-actions">
              <button onClick={handleCancelBill} className="submit-btn cancel-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Confirm Cancel"}
              </button>
              <button onClick={() => setShowCancelModal(false)} className="cancel-btn">Back</button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Update Bill</h3>
            <p>Current Amount: ₹{selectedBill.amount}</p>
            <input type="number" placeholder="New Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="form-input" />
            <textarea placeholder="Reason for update *" value={updateReason} onChange={e => setUpdateReason(e.target.value)} className="form-input" rows="2" />
            <div className="modal-actions">
              <button onClick={handleUpdateBill} className="submit-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Update"}
              </button>
              <button onClick={() => setShowUpdateModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showGiftModal && (
        <div className="modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Gift</h3>
            <input placeholder="Gift Name" value={giftName} onChange={e => setGiftName(e.target.value)} className="form-input" />
            <input type="number" placeholder="Points Required" value={giftPoints} onChange={e => setGiftPoints(e.target.value)} className="form-input" />
            <div className="modal-actions">
              <button onClick={handleAddGift} className="submit-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Add Gift"}
              </button>
              <button onClick={() => setShowGiftModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedRedeem && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Update Status to {selectedStatus}</h3>
            {selectedStatus === "Approved" && (
              <input placeholder="Tracking ID *" value={trackingId} onChange={e => setTrackingId(e.target.value)} className="form-input" />
            )}
            {selectedStatus === "Cancelled" && (
              <>
                <textarea placeholder="Cancel reason *" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="form-input" rows="3" />
                <p className="warning-text">⚠️ Points will be refunded to the user</p>
              </>
            )}
            <div className="modal-actions">
              <button onClick={handleUpdateRedeemStatus} className="submit-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Confirm"}
              </button>
              <button onClick={() => setShowStatusModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRedeemModal && selectedRedeem && (
        <div className="modal-overlay" onClick={() => setShowRedeemModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Redeem Details</h3>
            <div className="details-container">
              <div className="detail-row"><strong>ID:</strong> {selectedRedeem.id}</div>
              <div className="detail-row"><strong>Mobile:</strong> {selectedRedeem.mobile}</div>
              <div className="detail-row"><strong>Gift:</strong> {selectedRedeem.gift}</div>
              <div className="detail-row"><strong>Points:</strong> {selectedRedeem.points}</div>
              <div className="detail-row"><strong>Address:</strong> {selectedRedeem.address}</div>
              <div className="detail-row"><strong>Status:</strong> {selectedRedeem.status}</div>
              {selectedRedeem.trackingId && (
                <div className="detail-row"><strong>Tracking ID:</strong> {selectedRedeem.trackingId}</div>
              )}
              {selectedRedeem.approvedAt && (
                <div className="detail-row"><strong>Approved:</strong> {new Date(selectedRedeem.approvedAt).toLocaleString()}</div>
              )}
              {selectedRedeem.deliveredAt && (
                <div className="detail-row"><strong>Delivered:</strong> {new Date(selectedRedeem.deliveredAt).toLocaleString()}</div>
              )}
            </div>
            <button onClick={() => setShowRedeemModal(false)} className="cancel-btn">Close</button>
          </div>
        </div>
      )}
      
      {actionLoading && (
        <div className="loading-overlay">
          <div className="spinner-large"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
}