  const navigate = useNavigate()
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ThumbsUp, Flag, TrendingUp, Filter, Download } from 'lucide-react'
import './ReviewsRatings.css'

function ReviewsRatings() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Reviews data
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'John Smith',
      role: 'CFO',
      rating: 5,
      category: 'usability',
      title: 'Excellent financial reporting tool',
      comment: 'The dashboard has streamlined our monthly close process significantly. The automated reporting saves us 20+ hours per month.',
      date: '2 days ago',
      helpful: 12,
      flagged: false
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      role: 'Tax Manager',
      rating: 4,
      category: 'features',
      title: 'Great compliance features',
      comment: 'Love the compliance calendar and automated tax deadline reminders. Could use more customization for international tax reporting.',
      date: '1 week ago',
      helpful: 8,
      flagged: false
    },
    {
      id: 3,
      user: 'Michael Chen',
      role: 'Financial Analyst',
      rating: 5,
      category: 'performance',
      title: 'Fast and reliable',
      comment: 'Dashboard loads quickly even with large datasets. Real-time updates work perfectly.',
      date: '2 weeks ago',
      helpful: 15,
      flagged: false
    },
    {
      id: 4,
      user: 'Emily Davis',
      role: 'Compliance Officer',
      rating: 3,
      category: 'support',
      title: 'Good product, needs better documentation',
      comment: 'The platform is powerful but the learning curve is steep. More video tutorials would be helpful.',
      date: '3 weeks ago',
      helpful: 6,
      flagged: false
    }
  ])

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'usability', name: 'Usability' },
    { id: 'features', name: 'Features' },
    { id: 'performance', name: 'Performance' },
    { id: 'support', name: 'Support' },
    { id: 'value', name: 'Value for Money' }
  ]

  // Statistics
  const stats = {
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    totalReviews: reviews.length,
    fiveStars: reviews.filter(r => r.rating === 5).length,
    fourStars: reviews.filter(r => r.rating === 4).length,
    threeStars: reviews.filter(r => r.rating === 3).length,
    twoStars: reviews.filter(r => r.rating === 2).length,
    oneStars: reviews.filter(r => r.rating === 1).length
  }

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesRating = selectedFilter === 'all' || review.rating === parseInt(selectedFilter)
    const matchesCategory = selectedCategory === 'all' || review.category === selectedCategory
    return matchesRating && matchesCategory
  })

  // Mark as helpful
  const markHelpful = (reviewId) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ))
  }

  // Flag review
  const flagReview = (reviewId) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, flagged: !r.flagged } : r
    ))
  }

  // Render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        fill={i < rating ? '#f59e0b' : 'none'}
        color={i < rating ? '#f59e0b' : '#64748b'}
      />
    ))
  }

  return (
    <div className="reviews-page">
      {/* Header */}
      <div className="reviews-header">
        <div className="header-content">
          <div className="title-section">
            <Star size={32} className="header-icon" />
            <div>
              <h1>Reviews & Ratings</h1>
              <p>User feedback and ratings for the platform</p>
            </div>
          </div>
          <button className="btn-primary">
            <Star size={18} />
            Write a Review
          </button>
        </div>
      </div>

      {/* Overall Rating */}
      <div className="overall-rating-section">
        <div className="rating-summary">
          <div className="rating-number">{stats.avgRating}</div>
          <div className="rating-stars">
            {renderStars(Math.round(parseFloat(stats.avgRating)))}
          </div>
          <div className="rating-count">{stats.totalReviews} reviews</div>
        </div>

        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = stats[`${['five', 'four', 'three', 'two', 'one'][5 - stars]}Stars`]
            const percentage = (count / stats.totalReviews) * 100
            return (
              <div key={stars} className="rating-bar-row">
                <span className="star-label">{stars} stars</span>
                <div className="rating-bar">
                  <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="rating-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <Filter size={18} />
          <span>Filter by Rating:</span>
          <div className="rating-filters">
            {['all', '5', '4', '3', '2', '1'].map(rating => (
              <button
                key={rating}
                className={selectedFilter === rating ? 'active' : ''}
                onClick={() => setSelectedFilter(rating)}
              >
                {rating === 'all' ? 'All' : `${rating} stars`}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span>Category:</span>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <button className="btn-secondary" onClick={() => alert('Export reviews to CSV')}>
          <Download size={18} />
          Export Reviews
        </button>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">{review.user.charAt(0)}</div>
                <div>
                  <h4>{review.user}</h4>
                  <p className="reviewer-role">{review.role}</p>
                </div>
              </div>
              <div className="review-meta">
                <div className="review-rating">{renderStars(review.rating)}</div>
                <span className="review-date">{review.date}</span>
              </div>
            </div>

            <div className="review-content">
              <h3 className="review-title">{review.title}</h3>
              <p className="review-comment">{review.comment}</p>
              <span className="category-badge">{review.category}</span>
            </div>

            <div className="review-actions">
              <button className="helpful-btn" onClick={() => markHelpful(review.id)}>
                <ThumbsUp size={16} />
                Helpful ({review.helpful})
              </button>
              <button 
                className={`flag-btn ${review.flagged ? 'flagged' : ''}`}
                onClick={() => flagReview(review.id)}
              >
                <Flag size={16} />
                {review.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsRatings
