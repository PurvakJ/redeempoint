// ================= React Frontend - UserDashboard.js (Quantity starts blank) =================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";

export default function UserDashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [manualBillNo, setManualBillNo] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [activeTab, setActiveTab] = useState("bills");
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(""); // Changed from 1 to empty string
  
  const dataLoadedRef = useRef(false);
  const abortControllerRef = useRef(null);

  const brandData = {
    name: "GREYSTONE",
    tagline: "Premium Plywood & Furniture Solutions",
    features: ["🌟 Quality Assured", "🌿 Eco-Friendly", "💪 10 Year Warranty"],
    products: [
      { name: "GREYSTONE CHAUGATH", description: "5×2.5 inch & 6×2.5 inch | 25 year guarantee", icon: "🚪" },
      { name: "VENEER", description: "4mm thickness", icon: "🌳" },
      { name: "GREYSTONE LAMINATES", description: "Thickness: 0.72mm to 1.25mm", icon: "📐" },
      { name: "GREYSTONE FLUSH DOORS", description: "30mm, 32mm | Water proof", icon: "🚪" }
    ]
  };

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading && !dataLoadedRef.current) setLoading(true);
    else if (dataLoadedRef.current) setRefreshing(true);
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      const [userRes, giftsRes, productsRes] = await Promise.all([
        api("getUserData", { mobileNumber: user.mobileNumber }),
        api("getAllGifts"),
        api("getProducts")
      ]);
      
      if (userRes.success) setUserData(userRes);
      if (giftsRes.success) {
        const activeGifts = giftsRes.gifts.filter(gift => gift.active === true);
        setGifts(activeGifts.sort((a, b) => a.points - b.points));
      }
      if (productsRes.success) setProducts(productsRes.products);
      
      dataLoadedRef.current = true;
    } catch (error) {
      if (error.name !== 'AbortError') console.error("Load error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.mobileNumber]);

  useEffect(() => {
    loadData();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [loadData]);

  const addBillItem = () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    const product = products.find(p => p.name === selectedProduct);
    if (!product) return;
    
    setBillItems([...billItems, {
      name: selectedProduct,
      quantity: Number(quantity),
      pointsPerUnit: product.points,
      totalPoints: quantity * product.points
    }]);
    setSelectedProduct("");
    setQuantity(""); // Reset to empty string
  };

  const removeBillItem = (index) => {
    const newItems = [...billItems];
    newItems.splice(index, 1);
    setBillItems(newItems);
  };

  const getTotalBillPoints = () => {
    return billItems.reduce((sum, item) => sum + item.totalPoints, 0);
  };

  const submitBill = async () => {
    if (billItems.length === 0) {
      alert("Please add at least one product to the bill");
      return;
    }
    if (!referenceName) {
      alert("Please enter reference name");
      return;
    }
    
    setSubmitLoading(true);
    const res = await api("addBill", {
      mobileNumber: user.mobileNumber,
      products: billItems,
      referenceName: referenceName,
      billNo: manualBillNo || null
    });
    setSubmitLoading(false);
    if (res.success) {
      alert(`Bill submitted for approval!\nBill No: ${res.billNo}\nTotal Points: ${res.totalPoints}`);
      setBillItems([]);
      setManualBillNo("");
      setReferenceName("");
      loadData(false);
    } else alert(res.error);
  };

  const redeem = async (giftName, points) => {
    if (userData.totalPoints < points) {
      alert(`Insufficient points! You need ${points} points but you only have ${userData.totalPoints.toFixed(2)} points.`);
      return;
    }
    const address = prompt("Enter Delivery Address:");
    if (!address) return;
    setSubmitLoading(true);
    const res = await api("redeem", {
      mobileNumber: user.mobileNumber,
      giftName,
      address
    });
    setSubmitLoading(false);
    if (res.success) {
      alert("Redeem request submitted successfully!");
      loadData(false);
    } else alert(res.error);
  };

  const getGiftIcon = (giftName) => {
    const icons = {
      'Charger': '🔋', 'Headphones': '🎧', 'Power Bank': '🔋',
      'Mobile Phone': '📱', 'Watch': '⌚', 'Speaker': '🔊',
      'Earbuds': '🎧', 'Smart Band': '⌚'
    };
    return icons[giftName] || '🎁';
  };

  const getPointsRange = () => {
    if (gifts.length === 0) return { min: 0, max: 100 };
    const points = gifts.map(g => g.points);
    return { min: Math.min(...points), max: Math.max(...points) };
  };

  const getPositionPercentage = (giftPoints) => {
    const { min, max } = getPointsRange();
    if (min === max) return 50;
    return ((giftPoints - min) / (max - min)) * 100;
  };

  const getPointsBar = () => {
    if (gifts.length === 0) return (
      <div className="points-bar-skeleton">
        <div className="skeleton-title"></div>
        <div className="skeleton-bar"></div>
      </div>
    );

    const { min, max } = getPointsRange();
    const userPoints = userData?.totalPoints || 0;
    const userPosition = Math.min(100, Math.max(0, ((userPoints - min) / (max - min)) * 100));

    return (
      <div className="points-bar-single">
        <div className="points-bar-header">
          <h3>🎯 Redeem Points Guide</h3>
          <div className="points-range">
            <span>{min} pts</span>
            <span>→</span>
            <span>{max} pts</span>
          </div>
        </div>
        <div className="single-bar-container">
          <div className="single-bar">
            <div className="bar-background"></div>
            <div className="bar-filled" style={{ width: `${userPosition}%` }}></div>
            {gifts.map((gift, index) => {
              const position = getPositionPercentage(gift.points);
              const isAffordable = userPoints >= gift.points;
              const isNextGift = !isAffordable && gifts.findIndex(g => g.points > userPoints) === index;
              return (
                <div key={index} className={`gift-marker ${isAffordable ? 'affordable' : 'unaffordable'} ${isNextGift ? 'next-gift' : ''}`}
                  style={{ left: `${position}%` }} onClick={() => redeem(gift.name, gift.points)}>
                  <div className={`marker-point ${isAffordable ? 'affordable' : ''} ${isNextGift ? 'next' : ''}`}>
                    <div className="marker-dot"></div>
                  </div>
                  <div className="gift-label">
                    <span className="gift-label-icon">{getGiftIcon(gift.name)}</span>
                    <span className="gift-label-name">{gift.name}</span>
                    <span className="gift-label-points">{gift.points} pts</span>
                  </div>
                </div>
              );
            })}
            <div className="user-indicator" style={{ left: `${userPosition}%` }}>
              <div className="user-dot"><span>📍</span></div>
              <div className="user-points-badge">{userPoints.toFixed(0)} pts</div>
            </div>
          </div>
        </div>
        <div className="bar-legend">
          <div className="legend-item"><div className="legend-dot available"></div><span>Available</span></div>
          <div className="legend-item"><div className="legend-dot unavailable"></div><span>Need more</span></div>
          <div className="legend-item"><div className="legend-dot next"></div><span>Next goal</span></div>
          <div className="legend-item"><div className="legend-dot user"></div><span>Your points</span></div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': '⏳ Pending Approval',
      'APPROVED': '✅ Approved',
      'CANCELLED': '❌ Cancelled'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="hero-section skeleton-hero"></div>
        <div className="dashboard-header skeleton-header">
          <div className="skeleton-text"></div>
          <div className="skeleton-points"></div>
        </div>
        <div className="points-bar-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-bar"></div>
        </div>
        <div className="tabs-skeleton">
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
          <div className="skeleton-tab"></div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  if (!userData) return <div className="error-state">Failed to load data. Please refresh.</div>;

  return (
    <div className="dashboard-container">
      {refreshing && <div className="toast-refresh">Refreshing data...</div>}

      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-small">
            <span className="tree-icon-small">🌳</span>
            <h1>GREYSTONE</h1>
          </div>
          <p className="welcome-text">Welcome, {userData.name}!</p>
        </div>
        <div className="header-right">
          <div className="points-card">
            <span className="points-label">Points</span>
            <span className="points-value">{userData.totalPoints.toFixed(2)}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </div>

      {getPointsBar()}

      <div className="tabs">
        <button className={activeTab === "bills" ? "tab-active" : "tab"} onClick={() => setActiveTab("bills")}>📄 Add Bill</button>
        <button className={activeTab === "history" ? "tab-active" : "tab"} onClick={() => setActiveTab("history")}>📊 History</button>
        <button className={activeTab === "redeem" ? "tab-active" : "tab"} onClick={() => setActiveTab("redeem")}>🎁 Redeem</button>
        <button className={activeTab === "redeem-history" ? "tab-active" : "tab"} onClick={() => setActiveTab("redeem-history")}>📜 Redeems</button>
      </div>

      {activeTab === "bills" && (
        <div className="bill-form">
          <h3>Add New Bill</h3>
          <div className="info-banner">⏳ Requires admin approval before points are credited</div>
          
          <div className="form-group">
            <label>Bill Number (Optional - Leave blank for auto-generate)</label>
            <input 
              type="text" 
              placeholder="Enter manual bill number or leave blank" 
              value={manualBillNo} 
              onChange={e => setManualBillNo(e.target.value)} 
              className="form-input" 
              disabled={submitLoading}
            />
          </div>

          <div className="multi-product-section">
            <h4>Add Products</h4>
            <div className="product-row">
              <select 
                value={selectedProduct} 
                onChange={e => setSelectedProduct(e.target.value)} 
                className="form-input product-select"
                disabled={submitLoading}
              >
                <option value="">Select Product</option>
                {products.map((product, idx) => (
                  <option key={idx} value={product.name}>
                    {product.name} - {product.points} pts/unit
                  </option>
                ))}
              </select>
              
              <input 
                type="number" 
                placeholder="Quantity *" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                className="form-input quantity-input" 
                disabled={submitLoading}
                min="1"
              />
              
              <button onClick={addBillItem} className="add-item-btn" disabled={submitLoading}>+ Add</button>
            </div>
          </div>

          {billItems.length > 0 && (
            <div className="bill-items-list">
              <h4>Bill Items</h4>
              <div className="items-container">
                {billItems.map((item, index) => (
                  <div key={index} className="bill-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-points">{item.totalPoints} pts</span>
                    <button onClick={() => removeBillItem(index)} className="remove-item-btn" disabled={submitLoading}>✗</button>
                  </div>
                ))}
                <div className="bill-total">
                  <strong>Total Points: {getTotalBillPoints()}</strong>
                </div>
              </div>
            </div>
          )}
          
          <input 
            placeholder="Reference Name *" 
            value={referenceName} 
            onChange={e => setReferenceName(e.target.value)} 
            className="form-input" 
            disabled={submitLoading} 
          />
          
          <button onClick={submitBill} className="submit-btn" disabled={submitLoading || billItems.length === 0}>
            {submitLoading ? <div className="spinner"></div> : "Submit Bill for Approval"}
          </button>
        </div>
      )}

      {activeTab === "history" && (
        <div className="history-section">
          <h3>Bill History</h3>
          {userData.bills?.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Bill No</th><th>Products</th><th>Total Points</th><th>Status</th><th>Remark</th></tr>
                </thead>
                <tbody>
                  {userData.bills.slice(0, 20).map((bill, i) => (
                    <tr key={i}>
                      <td>{bill.billNo}</td>
                      <td>
                        <div className="products-list">
                          {bill.products && bill.products.map((p, idx) => (
                            <div key={idx}>{p.name} x{p.quantity}</div>
                          ))}
                        </div>
                      </td>
                      <td>{bill.totalPoints?.toFixed(2)}</td>
                      <td><span className={`status-${bill.status?.toLowerCase()}`}>{getStatusBadge(bill.status)}</span></td>
                      <td>{bill.adminRemark || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="no-data">No bills found</p>}
        </div>
      )}

      {activeTab === "redeem" && (
        <div className="gifts-section">
          <h3>Available Gifts</h3>
          <div className="gifts-grid">
            {gifts.slice(0, 12).map((gift, index) => {
              const isAvailable = userData.totalPoints >= gift.points;
              return (
                <div key={index} className={`gift-card ${isAvailable ? 'available' : 'unavailable'}`} onClick={() => isAvailable && redeem(gift.name, gift.points)}>
                  <div className="gift-icon">{getGiftIcon(gift.name)}</div>
                  <div className="gift-name">{gift.name}</div>
                  <div className="gift-points">{gift.points} Points</div>
                  {!isAvailable && <div className="gift-locked">Need {Math.ceil(gift.points - userData.totalPoints)} more</div>}
                  {isAvailable && <div className="gift-available-badge">✓ Available</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "redeem-history" && (
        <div className="history-section">
          <h3>Redeem History</h3>
          {userData.redeems?.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Gift</th><th>Points</th><th>Status</th><th>Tracking</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {userData.redeems.slice(0, 20).map((redeem, i) => (
                    <tr key={i}>
                      <td>{redeem.gift}</td>
                      <td>{redeem.points}</td>
                      <td><span className={`status-${redeem.status?.toLowerCase()}`}>{redeem.status}</span></td>
                      <td>{redeem.trackingId || "-"}</td>
                      <td>{new Date(redeem.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="no-data">No redeem requests found</p>}
        </div>
      )}
      
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>GREYSTONE</h1>
          <p>Premium Plywood & Furniture Solutions</p>
          <div className="hero-badges">
            {brandData.features.map((feature, idx) => <span key={idx}>{feature}</span>)}
          </div>
        </div>
      </div>
      
      <div className="products-showcase">
        <h2>Our Premium Products</h2>
        <div className="products-grid-mini">
          {brandData.products.map((product, idx) => (
            <div key={idx} className="product-mini-card">
              <div className="product-mini-icon">{product.icon}</div>
              <h4>{product.name}</h4>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="brand-footer">
        <div className="footer-content">
          <div className="footer-logo">🌳 GREYSTONE</div>
          <p>Premium Plywood & Furniture Solutions | Since 2020</p>
          <div className="footer-stats">
            <span>🏆 25 Year Guarantee</span>
            <span>🌿 Eco-Friendly</span>
            <span>💪 Termite & Water Proof</span>
          </div>
        </div>
      </div>
      
      {submitLoading && <div className="loading-overlay"><div className="spinner-large"></div><p>Processing...</p></div>}
    </div>
  );
}