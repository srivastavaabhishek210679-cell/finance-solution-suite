import { useState } from 'react'
import { Users, Share2, MessageCircle, UserPlus, Clock, Eye, Edit, Shield, Send, Paperclip, Search } from 'lucide-react'
import './Collaboration.css'

function Collaboration() {
  const [activeTab, setActiveTab] = useState('shared')
  const [selectedDashboard, setSelectedDashboard] = useState(null)
  const [newComment, setNewComment] = useState('')

  // Shared dashboards
  const [sharedDashboards, setSharedDashboards] = useState([
    {
      id: 1,
      name: 'Q1 2026 Financial Review',
      owner: 'John Smith',
      sharedWith: 5,
      lastActivity: '2 hours ago',
      permissions: ['view', 'comment'],
      comments: 12
    },
    {
      id: 2,
      name: 'Tax Compliance Dashboard',
      owner: 'Sarah Johnson',
      sharedWith: 3,
      lastActivity: '1 day ago',
      permissions: ['view', 'edit', 'comment'],
      comments: 8
    },
    {
      id: 3,
      name: 'ESG Metrics Tracker',
      owner: 'You',
      sharedWith: 7,
      lastActivity: '5 hours ago',
      permissions: ['admin'],
      comments: 15
    }
  ])

  // Team members
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'CFO',
      avatar: '👨‍💼',
      status: 'online',
      dashboards: 8
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'Tax Manager',
      avatar: '👩‍💼',
      status: 'away',
      dashboards: 5
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'mchen@company.com',
      role: 'Financial Analyst',
      avatar: '👨‍💻',
      status: 'offline',
      dashboards: 3
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.d@company.com',
      role: 'Compliance Officer',
      avatar: '👩‍⚖️',
      status: 'online',
      dashboards: 6
    }
  ])

  // Comments and activity
  const [comments, setComments] = useState([
    {
      id: 1,
      dashboardId: 1,
      user: 'John Smith',
      avatar: '👨‍💼',
      text: 'The operating expenses variance needs clarification. Can someone review the Q1 vendor contracts?',
      timestamp: '2 hours ago',
      mentions: [],
      attachments: []
    },
    {
      id: 2,
      dashboardId: 1,
      user: 'You',
      avatar: '👤',
      text: '@John Smith I\'ve reviewed the contracts. The variance is due to the new software licenses purchased in March.',
      timestamp: '1 hour ago',
      mentions: ['John Smith'],
      attachments: ['vendor-analysis.pdf']
    },
    {
      id: 3,
      dashboardId: 1,
      user: 'Sarah Johnson',
      avatar: '👩‍💼',
      text: 'Good catch! We should update the budget forecast for Q2 to reflect these recurring costs.',
      timestamp: '45 minutes ago',
      mentions: [],
      attachments: []
    }
  ])

  // Activity feed
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: 'John Smith',
      action: 'shared',
      target: 'Q1 2026 Financial Review',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      user: 'You',
      action: 'commented on',
      target: 'Q1 2026 Financial Review',
      timestamp: '1 hour ago'
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'updated',
      target: 'Tax Compliance Dashboard',
      timestamp: '3 hours ago'
    },
    {
      id: 4,
      user: 'Sarah Johnson',
      action: 'invited',
      target: 'Michael Chen to ESG Metrics Tracker',
      timestamp: '1 day ago'
    }
  ])

  // Send comment
  const sendComment = () => {
    if (newComment.trim() && selectedDashboard) {
      const comment = {
        id: comments.length + 1,
        dashboardId: selectedDashboard.id,
        user: 'You',
        avatar: '👤',
        text: newComment,
        timestamp: 'Just now',
        mentions: [],
        attachments: []
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  // Share dashboard
  const shareDashboard = (dashboardId) => {
    alert('Share dashboard functionality - Opens modal to select team members and set permissions')
  }

  return (
    <div className="collaboration-page">
      {/* Header */}
      <div className="collaboration-header">
        <div className="header-content">
          <div className="title-section">
            <Users size={32} className="header-icon" />
            <div>
              <h1>Collaboration</h1>
              <p>Share dashboards, comment on reports & work together</p>
            </div>
          </div>
          <button className="btn-primary">
            <UserPlus size={18} />
            Invite Team Member
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <Share2 className="stat-icon" style={{ color: '#3b82f6' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{sharedDashboards.length}</div>
            <div className="stat-label">Shared Dashboards</div>
          </div>
        </div>

        <div className="stat-card">
          <Users className="stat-icon" style={{ color: '#10b981' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{teamMembers.length}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>

        <div className="stat-card">
          <MessageCircle className="stat-icon" style={{ color: '#f59e0b' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{comments.length}</div>
            <div className="stat-label">Total Comments</div>
          </div>
        </div>

        <div className="stat-card">
          <Clock className="stat-icon" style={{ color: '#8b5cf6' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{activities.length}</div>
            <div className="stat-label">Recent Activities</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="collaboration-tabs">
        <button
          className={activeTab === 'shared' ? 'active' : ''}
          onClick={() => setActiveTab('shared')}
        >
          <Share2 size={18} />
          Shared Dashboards
        </button>
        <button
          className={activeTab === 'team' ? 'active' : ''}
          onClick={() => setActiveTab('team')}
        >
          <Users size={18} />
          Team Members
        </button>
        <button
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => setActiveTab('activity')}
        >
          <Clock size={18} />
          Activity Feed
        </button>
        <button
          className={activeTab === 'comments' ? 'active' : ''}
          onClick={() => setActiveTab('comments')}
        >
          <MessageCircle size={18} />
          Comments
        </button>
      </div>

      {/* Content */}
      <div className="collaboration-content">
        {/* Shared Dashboards Tab */}
        {activeTab === 'shared' && (
          <div className="shared-dashboards-section">
            <div className="dashboards-grid">
              {sharedDashboards.map(dashboard => (
                <div key={dashboard.id} className="dashboard-card">
                  <div className="dashboard-header">
                    <h3>{dashboard.name}</h3>
                    <div className="owner-info">
                      <span className="owner-label">Owner:</span>
                      <span className="owner-name">{dashboard.owner}</span>
                    </div>
                  </div>

                  <div className="dashboard-meta">
                    <div className="meta-item">
                      <Users size={16} />
                      <span>{dashboard.sharedWith} members</span>
                    </div>
                    <div className="meta-item">
                      <MessageCircle size={16} />
                      <span>{dashboard.comments} comments</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{dashboard.lastActivity}</span>
                    </div>
                  </div>

                  <div className="permissions-badges">
                    {dashboard.permissions.map(perm => (
                      <span key={perm} className={`permission-badge ${perm}`}>
                        {perm === 'view' && <Eye size={14} />}
                        {perm === 'edit' && <Edit size={14} />}
                        {perm === 'comment' && <MessageCircle size={14} />}
                        {perm === 'admin' && <Shield size={14} />}
                        {perm}
                      </span>
                    ))}
                  </div>

                  <div className="dashboard-actions">
                    <button className="btn-text" onClick={() => setSelectedDashboard(dashboard)}>
                      View Comments
                    </button>
                    <button className="btn-text" onClick={() => shareDashboard(dashboard.id)}>
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ marginTop: '1.5rem' }}>
              <Share2 size={18} />
              Share New Dashboard
            </button>
          </div>
        )}

        {/* Team Members Tab */}
        {activeTab === 'team' && (
          <div className="team-section">
            <div className="search-box">
              <Search size={20} />
              <input type="text" placeholder="Search team members..." />
            </div>

            <div className="team-grid">
              {teamMembers.map(member => (
                <div key={member.id} className="team-member-card">
                  <div className="member-header">
                    <div className="member-avatar">{member.avatar}</div>
                    <div className={`status-indicator ${member.status}`}></div>
                  </div>
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-email">{member.email}</p>
                  <div className="member-stats">
                    <span>{member.dashboards} dashboards</span>
                  </div>
                  <button className="btn-secondary">View Profile</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && (
          <div className="activity-section">
            <div className="activity-feed">
              {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.action === 'shared' && <Share2 size={18} />}
                    {activity.action === 'commented on' && <MessageCircle size={18} />}
                    {activity.action === 'updated' && <Edit size={18} />}
                    {activity.action === 'invited' && <UserPlus size={18} />}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                    </p>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="comments-section">
            {selectedDashboard ? (
              <>
                <div className="comments-header">
                  <h3>Comments on: {selectedDashboard.name}</h3>
                  <button onClick={() => setSelectedDashboard(null)}>Close</button>
                </div>

                <div className="comments-list">
                  {comments
                    .filter(c => c.dashboardId === selectedDashboard.id)
                    .map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">{comment.avatar}</div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <strong>{comment.user}</strong>
                            <span className="comment-time">{comment.timestamp}</span>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                          {comment.attachments.length > 0 && (
                            <div className="comment-attachments">
                              {comment.attachments.map((file, idx) => (
                                <span key={idx} className="attachment-badge">
                                  <Paperclip size={14} />
                                  {file}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="comment-input">
                  <input
                    type="text"
                    placeholder="Write a comment... (Use @ to mention)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                  />
                  <button onClick={sendComment}>
                    <Send size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <MessageCircle size={48} />
                <h3>Select a dashboard to view comments</h3>
                <p>Go to "Shared Dashboards" tab and click "View Comments"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collaboration
