import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Clock, 
  User, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationNotes, setValidationNotes] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${id}`);
      setReport(response.data.report);
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (action) => {
    if (!validationNotes.trim()) {
      toast.error('Please provide validation notes');
      return;
    }

    setIsValidating(true);
    try {
      await axios.post(`http://localhost:5000/api/reports/${id}/validate`, {
        action,
        notes: validationNotes
      });
      
      toast.success(`Report ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchReport();
      setValidationNotes('');
    } catch (error) {
      toast.error('Failed to validate report');
    } finally {
      setIsValidating(false);
    }
  };

  const deleteReport = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/reports/${id}`);
      toast.success('Report deleted successfully');
      navigate('/reports');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      under_investigation: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'under_investigation':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report not found</h2>
          <Link to="/reports" className="text-green-600 hover:text-green-700">
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/reports"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Reports
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {report.category}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Reported {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {(user?.role === 'ngo' || user?.role === 'government') && report.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleValidation('approve')}
                    disabled={isValidating}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleValidation('reject')}
                    disabled={isValidating}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </>
              )}
              
              {user?.role === 'researcher' && report.status === 'approved' && (
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              )}
              
              {(user?._id === report.reporter?._id || user?.role === 'ngo' || user?.role === 'government') && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/reports/${id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={deleteReport}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{report.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Severity Level
                    </h4>
                    <p className="text-gray-900 capitalize">{report.severity}</p>
                  </div>
                  
                  {report.estimatedArea && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Estimated Area Affected
                      </h4>
                      <p className="text-gray-900">{report.estimatedArea}</p>
                    </div>
                  )}
                </div>

                {report.impactAssessment && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Impact Assessment
                    </h4>
                    <p className="text-gray-700">{report.impactAssessment}</p>
                  </div>
                )}

                {report.tags && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Photo Evidence
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`http://localhost:5000${photo}`}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(`http://localhost:5000${photo}`, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Coordinates
                    </h4>
                    <p className="text-gray-900 font-mono">
                      {report.location.coordinates.latitude?.toFixed(6)}, {report.location.coordinates.longitude?.toFixed(6)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Address
                    </h4>
                    <p className="text-gray-900">
                      {report.location.address.city && `${report.location.address.city}, `}
                      {report.location.address.state && `${report.location.address.state}, `}
                      {report.location.address.country}
                    </p>
                  </div>
                </div>
                
                {/* Simple map placeholder */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Map view would be integrated here with coordinates: {report.location.coordinates.latitude?.toFixed(4)}, {report.location.coordinates.longitude?.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Reporter
              </h2>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Name
                  </h4>
                  <p className="text-gray-900">
                    {report.reporter.firstName} {report.reporter.lastName}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Role
                  </h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {report.reporter.role}
                  </span>
                </div>
                
                {report.reporter.organization && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Organization
                    </h4>
                    <p className="text-gray-900">{report.reporter.organization}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Points
                  </h4>
                  <p className="text-gray-900 font-semibold">{report.reporter.points || 0}</p>
                </div>
              </div>
            </div>

            {/* Validation Section for NGOs/Govt */}
            {(user?.role === 'ngo' || user?.role === 'government') && report.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validation Notes *
                    </label>
                    <textarea
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Provide detailed notes for your decision..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleValidation('approve')}
                      disabled={isValidating || !validationNotes.trim()}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleValidation('reject')}
                      disabled={isValidating || !validationNotes.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4 mr-2 inline" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Validation History */}
            {report.validator && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation History</h2>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Validated By
                    </h4>
                    <p className="text-gray-900">
                      {report.validator.firstName} {report.validator.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Validated On
                    </h4>
                    <p className="text-gray-900">
                      {new Date(report.validatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {report.validationNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Notes
                      </h4>
                      <p className="text-gray-700 text-sm">{report.validationNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
