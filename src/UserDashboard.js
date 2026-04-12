// ================= React Frontend - UserDashboard.js (Optimized) =================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";

export default function UserDashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [billNo, setBillNo] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [activeTab, setActiveTab] = useState("bills");
  const [pointsPerThousand, setPointsPerThousand] = useState(1);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Cache refs
  const dataLoadedRef = useRef(false);
  const abortControllerRef = useRef(null);

  // GREYSTONE Brand Data
  const brandData = {
    name: "GREYSTONE",
    tagline: "Premium Plywood & Furniture Solutions",
    founded: "2020",
    features: ["🌟 Quality Assured", "🌿 Eco-Friendly", "💪 10 Year Warranty"],
    products: [
      { name: "GREYSTONE CHAUGATH", description: "5×2.5 inch & 6×2.5 inch | 25 year guarantee", icon: "🚪" },
      { name: "VENEER", description: "4mm thickness | Buram Teak, Santos, White Ash, Red Oak", icon: "🌳" },
      { name: "GREYSTONE LAMINATES", description: "Thickness: 0.72mm to 1.25mm", icon: "📐" },
      { name: "GREYSTONE FLUSH DOORS", description: "30mm, 32mm | Water proof", icon: "🚪" }
    ]
  };

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading && !dataLoadedRef.current) {
      setLoading(true);
    } else if (dataLoadedRef.current) {
      setRefreshing(true);
    }
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const [userRes, giftsRes, pointsRes] = await Promise.all([
        api("getUserData", { mobileNumber: user.mobileNumber }),
        api("getAllGifts"),
        api("getPointSetting")
      ]);
      
      if (userRes.success) setUserData(userRes);
      if (giftsRes.success) {
        const activeGifts = giftsRes.gifts.filter(gift => gift.active === true);
        setGifts(activeGifts.sort((a, b) => a.points - b.points));
      }
      if (pointsRes.success) setPointsPerThousand(pointsRes.pointsPerThousand);
      
      dataLoadedRef.current = true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Load error:", error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.mobileNumber]);

  useEffect(() => {
    loadData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  const addBill = async () => {
    if (!billNo || !amount || !ref) {
      alert("Please fill all fields");
      return;
    }
    setSubmitLoading(true);
    const res = await api("addBill", {
      mobileNumber: user.mobileNumber,
      billNo,
      referenceName: ref,
      amount: Number(amount)
    });
    setSubmitLoading(false);
    if (res.success) {
      alert(res.message || "Bill submitted for admin approval!");
      setBillNo("");
      setAmount("");
      setRef("");
      // Silent refresh without full loading screen
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

  // Skeleton Loader
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

  const calculatedPoints = (Number(amount) / 1000) * pointsPerThousand;

  return (
    <div className="dashboard-container">
      {refreshing && <div className="toast-refresh">Refreshing data...</div>}

      {/* Dashboard Header - Top */}
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

      {/* Points Bar */}
      {getPointsBar()}

      {/* Tabs Section */}
      <div className="tabs">
        <button className={activeTab === "bills" ? "tab-active" : "tab"} onClick={() => setActiveTab("bills")}>📄 Add Bill</button>
        <button className={activeTab === "history" ? "tab-active" : "tab"} onClick={() => setActiveTab("history")}>📊 History</button>
        <button className={activeTab === "redeem" ? "tab-active" : "tab"} onClick={() => setActiveTab("redeem")}>🎁 Redeem</button>
        <button className={activeTab === "redeem-history" ? "tab-active" : "tab"} onClick={() => setActiveTab("redeem-history")}>📜 Redeems</button>
      </div>

      {/* Tab Content */}
      {activeTab === "bills" && (
        <div className="bill-form">
          <h3>Add New Bill</h3>
          <div className="info-banner">⏳ Requires admin approval before points are credited</div>
          <input placeholder="Bill Number" value={billNo} onChange={e => setBillNo(e.target.value)} className="form-input" disabled={submitLoading} />
          <input placeholder="Reference Name" value={ref} onChange={e => setRef(e.target.value)} className="form-input" disabled={submitLoading} />
          <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className="form-input" disabled={submitLoading} />
          {amount && <div className="points-preview">🌟 You will earn: {calculatedPoints.toFixed(2)} points</div>}
          <button onClick={addBill} className="submit-btn" disabled={submitLoading}>
            {submitLoading ? <div className="spinner"></div> : "Submit for Approval"}
          </button>
        </div>
      )}

      {activeTab === "history" && (
        <div className="history-section">
          <h3>Bill History</h3>
          {userData.bills?.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Bill No</th><th>Reference</th><th>Amount</th><th>Points</th><th>Status</th><th>Remark</th></tr></thead>
                <tbody>
                  {userData.bills.slice(0, 20).map((bill, i) => (
                    <tr key={i}>
                      <td>{bill.billNo}</td>
                      <td>{bill.ref}</td>
                      <td>₹{bill.amount}</td>
                      <td>{bill.points.toFixed(2)}</td>
                      <td><span className={`status-${bill.status.toLowerCase()}`}>{getStatusBadge(bill.status)}</span></td>
                      <td>{bill.adminRemark || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userData.bills.length > 20 && <div className="show-more">+ {userData.bills.length - 20} more bills</div>}
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
                <thead><tr><th>Gift</th><th>Points</th><th>Status</th><th>Tracking</th><th>Date</th></tr></thead>
                <tbody>
                  {userData.redeems.slice(0, 20).map((redeem, i) => (
                    <tr key={i}>
                      <td>{redeem.gift}</td>
                      <td>{redeem.points}</td>
                      <td><span className={`status-${redeem.status.toLowerCase()}`}>{redeem.status}</span></td>
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
      
      {/* Hero Section - AT THE BOTTOM as you want */}
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
      
      {/* Products Showcase - AT THE BOTTOM */}
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
      
      {/* Footer - AT THE BOTTOM */}
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