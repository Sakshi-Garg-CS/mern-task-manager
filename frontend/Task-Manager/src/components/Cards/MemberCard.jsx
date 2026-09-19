import React from "react";
import { getProfileImageUrl } from "../../utils/imageUrl";

const MemberCard = ({ member }) => {

  const stats = [
    {
      label: "Pending",
      count: member.pendingTasks ?? 0,
      boxClass: "member-stat-pending",
    },
    {
      label: "In Progress",
      count: member.inProgressTasks ?? 0,
      boxClass: "member-stat-progress",
    },
    {
      label: "Completed",
      count: member.completedTasks ?? 0,
      boxClass: "member-stat-completed",
    },
  ];

  return (
    <article className="member-card">
      <header className="member-card-header">
        {member.profileImageUrl ? (
          <img
            src={getProfileImageUrl(member.profileImageUrl)}
            alt={member.name}
            className="member-card-avatar"
          />
        ) : (
          <div className="member-card-avatar member-card-avatar-fallback">
            {member.name?.charAt(0) || "U"}
          </div>
        )}
        <div className="member-card-info">
          <h3 className="member-card-name">{member.name}</h3>
          <p className="member-card-email">{member.email}</p>
        </div>
      </header>

      <div className="member-card-stats">
        {stats.map((stat) => (
          <div key={stat.label} className={stat.boxClass}>
            <p className="member-stat-count">{stat.count}</p>
            <p className="member-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </article>
  );
};

export default MemberCard;
