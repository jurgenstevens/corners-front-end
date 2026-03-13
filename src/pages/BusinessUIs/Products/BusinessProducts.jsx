// ASSO_03
import { useState } from "react";
import styles from "./BusinessProducts.module.css";

/*
  NOTE:
  ActivityItem and MobileFooter should be extracted
  into reusable components in the future:
  
  components/ActivityItem/ActivityItem.jsx
  components/MobileFooter/MobileFooter.jsx
*/

const fakeActivity = [
  {
    id: 1,
    type: "request",
    user: "Hannah",
    title: "Cafe Bustello Request",
    subtitle: "Requested by Hannah",
    time: "1d",
    actionable: true,
  },
  {
    id: 2,
    type: "trending",
    user: "Tom",
    title: "Guanciale Votes Threshold Met",
    subtitle: "10/10 Votes Reached",
    time: "1d",
    actionable: false,
  },
  {
    id: 3,
    type: "added",
    user: "Jurgen",
    title: "Lucky Strike 100s Gold",
    subtitle: "Requested by Jurgen",
    time: "1d",
    actionable: true,
  },
  {
    id: 4,
    type: "system",
    user: "Corners",
    title: "Reminder",
    subtitle: "You haven’t approved any product requests yet.",
    time: "4d",
    actionable: false,
  },
];

const filters = ["All", "Requests", "Trending", "Added"];

const BusinessProducts = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredActivity =
    activeFilter === "All"
      ? fakeActivity
      : fakeActivity.filter((item) =>
          item.type.toLowerCase().includes(activeFilter.toLowerCase())
        );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.feedContainer}>
        <h2 className={styles.header}>Products</h2>

        {/* Filter Tabs */}
        <div className={styles.filterRow}>
          {filters.map((filter) => (
            <button
              key={filter}
              className={`${styles.filterButton} ${
                activeFilter === filter ? styles.activeFilter : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <div className={styles.feedList}>
          {filteredActivity.map((item) => (
            <div key={item.id} className={styles.activityItem}>
              <div className={styles.leftIndicator}></div>

              <div className={styles.activityContent}>
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
                <span className={styles.time}>{item.time}</span>
              </div>

              {item.actionable && (
                <div className={styles.actions}>
                  <button className={styles.approve}>✓</button>
                  <button className={styles.reject}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Footer Nav */}
      <div className={styles.mobileFooter}>
        <span>🏠</span>
        <span>🔍</span>
        <span>➕</span>
        <span className={styles.notificationWrapper}>
          🔔
          <span className={styles.notificationBadge}>5</span>
        </span>
        <span className={styles.profileCircle}></span>
      </div>
    </div>
  );
};

export default BusinessProducts;
