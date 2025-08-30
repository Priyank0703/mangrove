import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, TrendingUp, Users, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/leaderboard?timeframe=${timeframe}`);
      setLeaderboard(response.data.leaderboard);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 text-gray-400 font-bold">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Leaderboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Celebrate the top contributors who are making a difference in mangrove conservation
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</div>
              <div className="text-gray-600">Active Contributors</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalReports}</div>
              <div className="text-gray-600">Reports Submitted</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalPoints}</div>
              <div className="text-gray-600">Total Points Earned</div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.avgPoints}</div>
              <div className="text-gray-600">Average Points</div>
            </div>
          </div>
        )}

        {/* Timeframe Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Timeframe:</span>
            {['week', 'month', 'year', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Top Contributors</h2>
          </div>

          {leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((user, index) => (
                <div
                  key={user._id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${getRankColor(index + 1)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                          </span>
                          {user.organization && (
                            <span className="text-sm text-gray-500">
                              {user.organization}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {user.reportsSubmitted} reports
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {user.reportsValidated} validated
                          </span>
                          {user.location?.city && (
                            <span className="flex items-center">
                              <span className="w-4 h-4 mr-1">📍</span>
                              {user.location.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {user.points}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-500">Check back later for leaderboard updates</p>
            </div>
          )}
        </div>

        {/* Current User Position */}
        {user && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Position</h2>
            
            {leaderboard.find(u => u._id === user._id) ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(leaderboard.findIndex(u => u._id === user._id) + 1)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600">You're in the top contributors!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{user.points || 0}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Start submitting reports to earn points and climb the leaderboard!
                </p>
                <div className="text-2xl font-bold text-gray-400">{user.points || 0} points</div>
              </div>
            )}
          </div>
        )}

        {/* How Points Work */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Points Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Reports</h3>
              <p className="text-gray-600">Earn 10 points for each report submitted</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Validated</h3>
              <p className="text-gray-600">Earn 25 bonus points when your report is approved</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Climb Ranks</h3>
              <p className="text-gray-600">Compete with other community members for top positions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
