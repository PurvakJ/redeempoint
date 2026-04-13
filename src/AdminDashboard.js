// ================= React Frontend - AdminDashboard.js (FIXED REDEEM SECTION) =================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [products, setProducts] = useState([]);
  const [redeems, setRedeems] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPoints, setProductPoints] = useState("");
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
    if (showFullLoading && !dataLoadedRef.current) setLoading(true);
    else if (dataLoadedRef.current) setRefreshing(true);
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      const [usersRes, billsRes, pendingRes, giftsRes, redeemsRes, productsRes] = await Promise.all([
        api("getAllUsers"), api("getAllBills"), api("getPendingBills"),
        api("getAllGifts"), api("getAllRedeems"), api("getProducts")
      ]);
      
      if (usersRes.success) setUsers(usersRes.users);
      if (billsRes.success) setBills(billsRes.bills);
      if (pendingRes.success) setPendingBills(pendingRes.pendingBills);
      if (giftsRes.success) {
        const sortedGifts = giftsRes.gifts.sort((a, b) => a.points - b.points);
        setGifts(sortedGifts);
      }
      if (redeemsRes.success) setRedeems(redeemsRes.redeems);
      if (productsRes.success) setProducts(productsRes.products);
      
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
      if (abortControllerRef.current) abortControllerRef.current.abort();
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

  const handleAddProduct = async () => {
    if (!productName || !productPoints) {
      alert("Please enter product name and points");
      return;
    }
    setActionLoading(true);
    const res = await api("addProduct", { name: productName, points: Number(productPoints) });
    setActionLoading(false);
    if (res.success) {
      alert("Product added successfully!");
      setShowProductModal(false);
      setProductName("");
      setProductPoints("");
      loadData(false);
    } else alert(res.error);
  };

  const handleUpdateProduct = async (product) => {
    const newName = prompt("Enter new product name:", product.name);
    const newPoints = prompt("Enter new points per unit:", product.points);
    if (newName && newPoints) {
      setActionLoading(true);
      const res = await api("updateProduct", { oldName: product.name, newName, points: Number(newPoints) });
      setActionLoading(false);
      if (res.success) {
        alert("Product updated!");
        loadData(false);
      } else alert(res.error);
    }
  };

  const handleDeleteProduct = async (productName) => {
    if (window.confirm(`Delete product "${productName}"? This will affect existing bills.`)) {
      setActionLoading(true);
      const res = await api("deleteProduct", { name: productName });
      setActionLoading(false);
      if (res.success) {
        alert("Product deleted!");
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

  // Function to handle approve redeem (opens modal for tracking ID)
  const handleApproveRedeem = (redeem) => {
    setSelectedRedeem(redeem);
    setSelectedStatus("Approved");
    setTrackingId("");
    setCancelReason("");
    setShowStatusModal(true);
  };

  // Function to handle deliver redeem
  const handleDeliverRedeem = (redeem) => {
    setSelectedRedeem(redeem);
    setSelectedStatus("Delivered");
    setTrackingId("");
    setCancelReason("");
    setShowStatusModal(true);
  };

  // Function to handle cancel redeem
  const handleCancelRedeem = (redeem) => {
    setSelectedRedeem(redeem);
    setSelectedStatus("Cancelled");
    setTrackingId("");
    setCancelReason("");
    setShowStatusModal(true);
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

  // Helper to check what actions are available for a redeem status - FIXED: case insensitive comparison
  const getAvailableActions = (currentStatus) => {
    // Convert to lowercase for case-insensitive comparison
    const status = currentStatus?.toLowerCase();
    switch(status) {
      case "pending":
        return ["approve", "cancel"];
      case "approved":
        return ["deliver", "cancel"];
      case "delivered":
        return [];
      case "cancelled":
        return [];
      default:
        return [];
    }
  };

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

      <div className="admin-header">
        <div className="header-left">
          <div className="logo-small">
            <span className="tree-icon-small">🌳</span>
            <h1>Admin Panel</h1>
          </div>
          <p className="welcome-text">GREYSTONE Management</p>
        </div>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn" disabled={actionLoading}>🚪 Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === "pending" ? "tab-active" : "tab"} onClick={() => setActiveTab("pending")}>
          ⏳ Pending ({pendingBills.length})
        </button>
        <button className={activeTab === "allbills" ? "tab-active" : "tab"} onClick={() => setActiveTab("allbills")}>📄 Bills</button>
        <button className={activeTab === "users" ? "tab-active" : "tab"} onClick={() => setActiveTab("users")}>👥 Users</button>
        <button className={activeTab === "products" ? "tab-active" : "tab"} onClick={() => setActiveTab("products")}>📦 Products</button>
        <button className={activeTab === "gifts" ? "tab-active" : "tab"} onClick={() => setActiveTab("gifts")}>🎁 Gifts</button>
        <button className={activeTab === "redeems" ? "tab-active" : "tab"} onClick={() => setActiveTab("redeems")}>📦 Redeems</button>
      </div>

      {activeTab === "pending" && (
        <div className="admin-section">
          <h3>Pending Approvals ({pendingBills.length})</h3>
          {pendingBills.length === 0 ? (
            <div className="no-data-message">✨ No pending bills</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Bill No</th><th>Mobile</th><th>Products</th><th>Total Points</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pendingBills.slice(0, 30).map((bill, i) => (
                    <tr key={i}>
                      <td>{bill.billNo}</td>
                      <td>{bill.mobile}</td>
                      <td>
                        <div className="products-list">
                          {bill.products && bill.products.map((p, idx) => (
                            <div key={idx}>{p.name} x{p.quantity} ({p.pointsPerUnit} pts)</div>
                          ))}
                        </div>
                       </td>
                      <td><strong>{bill.totalPoints?.toFixed(2)}</strong></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn approve-btn" onClick={() => { setSelectedBill(bill); setShowApproveModal(true); }} disabled={actionLoading} title="Approve Bill">✓ Approve</button>
                          <button className="action-btn cancel-btn" onClick={() => { setSelectedBill(bill); setShowCancelModal(true); }} disabled={actionLoading} title="Cancel Bill">✗ Cancel</button>
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
                <tr><th>Bill No</th><th>Mobile</th><th>Products</th><th>Total Points</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bills.slice(0, 50).map((bill, i) => (
                  <tr key={i}>
                    <td>{bill.billNo}</td>
                    <td>{bill.mobile}</td>
                    <td>
                      <div className="products-list">
                        {bill.products && bill.products.map((p, idx) => (
                          <div key={idx}>{p.name} x{p.quantity}</div>
                        ))}
                      </div>
                    </td>
                    <td>{bill.totalPoints?.toFixed(2)}</td>
                    <td><span className={`status-${bill.status?.toLowerCase()}`}>{bill.status}</span></td>
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

      {activeTab === "products" && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Products & Points</h3>
            <button onClick={() => setShowProductModal(true)} className="add-btn" disabled={actionLoading}>+ Add Product</button>
          </div>
          <div className="products-admin-grid">
            {products.map((product, i) => (
              <div key={i} className="product-admin-card">
                <div>
                  <div className="product-name">📦 {product.name}</div>
                  <div className="product-points">{product.points} points per unit</div>
                </div>
                <div className="product-actions">
                  <button onClick={() => handleUpdateProduct(product)} className="edit-btn" disabled={actionLoading} title="Edit Product">✏️</button>
                  <button onClick={() => handleDeleteProduct(product.name)} className="delete-btn" disabled={actionLoading} title="Delete Product">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "gifts" && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Gifts (Sorted by Points)</h3>
            <button onClick={() => setShowGiftModal(true)} className="add-btn" disabled={actionLoading}>+ Add Gift</button>
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

      {/* FIXED REDEEM SECTION - Now shows proper action buttons */}
      {activeTab === "redeems" && (
        <div className="admin-section">
          <h3>Redeem Requests</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{redeems.filter(r => r.status?.toLowerCase() === "pending").length}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{redeems.filter(r => r.status?.toLowerCase() === "approved").length}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{redeems.filter(r => r.status?.toLowerCase() === "delivered").length}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-value">{redeems.filter(r => r.status?.toLowerCase() === "cancelled").length}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mobile</th>
                  <th>Gift</th>
                  <th>Points</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Tracking ID</th>
                  <th>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {redeems.slice(0, 30).map((redeem, i) => {
                  const availableActions = getAvailableActions(redeem.status);
                  return (
                    <tr key={i}>
                      <td>{redeem.id}</td>
                      <td>{redeem.mobile}</td>
                      <td>{redeem.gift}</td>
                      <td>{redeem.points}</td>
                      <td className="address-cell">{redeem.address?.substring(0, 30)}...</td>
                      <td><span className={`status-${redeem.status?.toLowerCase()}`}>{redeem.status}</span></td>
                      <td>{redeem.trackingId || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn" 
                            onClick={() => { setSelectedRedeem(redeem); setShowRedeemModal(true); }} 
                            disabled={actionLoading} 
                            title="View Details"
                          >
                            👁️ View
                          </button>
                          {availableActions.includes("approve") && (
                            <button 
                              className="action-btn approve-btn" 
                              onClick={() => handleApproveRedeem(redeem)}
                              disabled={actionLoading}
                              title="Approve Redeem"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {availableActions.includes("deliver") && (
                            <button 
                              className="action-btn deliver-btn" 
                              onClick={() => handleDeliverRedeem(redeem)}
                              disabled={actionLoading}
                              title="Mark as Delivered"
                            >
                              📦 Deliver
                            </button>
                          )}
                          {availableActions.includes("cancel") && (
                            <button 
                              className="action-btn cancel-btn" 
                              onClick={() => handleCancelRedeem(redeem)}
                              disabled={actionLoading}
                              title="Cancel Redeem"
                            >
                              ✗ Cancel
                            </button>
                          )}
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Approve Bill Modal */}
      {showApproveModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Approve Bill</h3>
            <p>Bill: <strong>{selectedBill.billNo}</strong></p>
            <div className="products-details">
              {selectedBill.products && selectedBill.products.map((p, idx) => (
                <div key={idx}>{p.name} x{p.quantity} = {p.quantity * p.pointsPerUnit} points</div>
              ))}
            </div>
            <p>Total Points to add: <strong>{selectedBill.totalPoints?.toFixed(2)}</strong></p>
            <textarea 
              placeholder="Admin remark (optional)" 
              value={adminRemark} 
              onChange={e => setAdminRemark(e.target.value)} 
              className="form-input" 
              rows="2" 
            />
            <div className="modal-actions">
              <button onClick={handleApproveBill} className="submit-btn approve-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Approve"}
              </button>
              <button onClick={() => setShowApproveModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Bill Modal */}
      {showCancelModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Cancel Bill</h3>
            <p>Bill: <strong>{selectedBill.billNo}</strong></p>
            <textarea 
              placeholder="Cancel reason *" 
              value={cancelReason} 
              onChange={e => setCancelReason(e.target.value)} 
              className="form-input" 
              rows="3" 
            />
            <div className="modal-actions">
              <button onClick={handleCancelBill} className="submit-btn cancel-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Confirm Cancel"}
              </button>
              <button onClick={() => setShowCancelModal(false)} className="cancel-btn">Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Product</h3>
            <input 
              placeholder="Product Name" 
              value={productName} 
              onChange={e => setProductName(e.target.value)} 
              className="form-input" 
            />
            <input 
              type="number" 
              placeholder="Points per Unit" 
              value={productPoints} 
              onChange={e => setProductPoints(e.target.value)} 
              className="form-input" 
            />
            <div className="modal-actions">
              <button onClick={handleAddProduct} className="submit-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Add Product"}
              </button>
              <button onClick={() => setShowProductModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Gift Modal */}
      {showGiftModal && (
        <div className="modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Gift</h3>
            <input 
              placeholder="Gift Name" 
              value={giftName} 
              onChange={e => setGiftName(e.target.value)} 
              className="form-input" 
            />
            <input 
              type="number" 
              placeholder="Points Required" 
              value={giftPoints} 
              onChange={e => setGiftPoints(e.target.value)} 
              className="form-input" 
            />
            <div className="modal-actions">
              <button onClick={handleAddGift} className="submit-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : "Add Gift"}
              </button>
              <button onClick={() => setShowGiftModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Redeem Status Modal */}
      {showStatusModal && selectedRedeem && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Update Status to {selectedStatus}</h3>
            <p>Redeem ID: <strong>{selectedRedeem.id}</strong></p>
            <p>Gift: {selectedRedeem.gift}</p>
            <p>Points: {selectedRedeem.points}</p>
            
            {selectedStatus === "Approved" && (
              <div className="form-group">
                <label>Tracking ID *</label>
                <input 
                  placeholder="Enter tracking ID" 
                  value={trackingId} 
                  onChange={e => setTrackingId(e.target.value)} 
                  className="form-input" 
                />
                <small>This tracking ID will be shared with the user</small>
              </div>
            )}
            
            {selectedStatus === "Delivered" && (
              <div className="form-group">
                <p className="info-text">✅ Mark this redeem request as delivered. No additional information needed.</p>
              </div>
            )}
            
            {selectedStatus === "Cancelled" && (
              <div className="form-group">
                <label>Cancellation Reason *</label>
                <textarea 
                  placeholder="Enter reason for cancellation" 
                  value={cancelReason} 
                  onChange={e => setCancelReason(e.target.value)} 
                  className="form-input" 
                  rows="3" 
                />
                <p className="warning-text">⚠️ Points will be refunded to the user</p>
              </div>
            )}
            
            <div className="modal-actions">
              <button onClick={handleUpdateRedeemStatus} className="submit-btn" disabled={actionLoading}>
                {actionLoading ? <div className="spinner"></div> : `Confirm ${selectedStatus}`}
              </button>
              <button onClick={() => setShowStatusModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Redeem Details Modal */}
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
              {selectedRedeem.requestedAt && (
                <div className="detail-row"><strong>Requested:</strong> {new Date(selectedRedeem.requestedAt).toLocaleString()}</div>
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