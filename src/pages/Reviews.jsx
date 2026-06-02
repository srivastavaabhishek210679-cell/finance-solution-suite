import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Star, ThumbsUp, MessageSquare, TrendingUp, Award,
  Filter, Search, Calendar, ArrowLeft
} from 'lucide-react'

function Reviews() {
  const navigate = useNavigate()
  const [filterRating, setFilterRating] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = {
    averageRating: 4.6,
    totalReviews: 1247,
    fiveStarCount: 892,
    fourStarCount: 245,
    threeStarCount: 78,
    twoStarCount: 21,
    oneStarCount: 11
  }

  const reviews = [
    {
      id: 1,
      author: 'John Smith',
      role: 'CFO',
      rating: 5,
      date: '2026-05-05',
      title: 'Excellent reporting platform',
      text: 'This dashboard has transformed how we manage our financial reports. The automation features save us hours every week, and the compliance tracking is invaluable.',
      helpful: 45,
      verified: true
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      role: 'HR Manager',
      rating: 5,
      date: '2026-05-04',
      title: 'Great for HR analytics',
      text: 'Love the HR analytics features. The employee turnover tracking and automated reports make my job so much easier. Highly recommend!',
      helpful: 32,
      verified: true
    },
    {
      id: 3,
      author: 'Mike Chen',
      role: 'Operations Manager',
      rating: 4,
      date: '2026-05-03',
      title: 'Very useful, minor issues',
      text: 'Overall a great platform. The operations reports are comprehensive. Would love to see more customization options for dashboards.',
      helpful: 18,
      verified: true
    },
    {
      id: 4,
      author: 'Emma Davis',
      role: 'Analyst',
      rating: 5,
      date: '2026-05-02',
      title: 'Best reporting tool I\'ve used',
      text: 'The AI insights feature is incredible. It caught anomalies we would have missed. The export functionality works perfectly for presentations.',
      helpful: 56,
      verified: true
    }
  ]

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating))

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500" />
          Reviews & Ratings
        </h1>
        <p className="text-gray-400">User feedback and testimonials</p>
      </div>

      {/* Overall Rating Card */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Overall Rating */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-white mb-2">{stats.averageRating}</div>
            <div className="flex gap-1 mb-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <div className="text-gray-400">Based on {stats.totalReviews.toLocaleString()} reviews</div>
          </div>

          {/* Right: Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}StarCount`]
              const percentage = (count / stats.totalReviews) * 100

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex gap-1 w-24">
                    {renderStars(rating)}
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-400 text-right">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-white">98%</span>
          </div>
          <div className="text-sm text-gray-400">Satisfaction Rate</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-white">+23%</span>
          </div>
          <div className="text-sm text-gray-400">Rating Improvement</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">856</span>
          </div>
          <div className="text-sm text-gray-400">Written Reviews</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Write Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-white font-semibold text-lg">
                  {review.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{review.author}</span>
                    {review.verified && (
                      <span className="px-2 py-0.5 bg-blue-900 text-blue-300 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{review.role}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex gap-1 mb-1">
                  {renderStars(review.rating)}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>
            <p className="text-gray-300 mb-4">{review.text}</p>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
              <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Helpful ({review.helpful})</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Reply</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reviews

