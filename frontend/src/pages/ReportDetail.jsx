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
  Trash2,
  MessageSquare,
  Award,
  Shield
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
  const [showValidationForm, setShowValidationForm] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/api/reports/${id}`);
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
      await axios.post(`/api/reports/${id}/validate`, {
        action,
        notes: validationNotes
      });

      toast.success(`Report ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchReport();
      setValidationNotes('');
      setShowValidationForm(false);
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
      await axios.delete(`/api/reports/${id}`);
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

  const canEdit = () => {
    return report && (
      report.reporter._id === user?._id ||
      ['ngo', 'government'].includes(user?.role)
    );
  };

  const canValidate = () => {
    return ['ngo', 'government'].includes(user?.role) && report?.status === 'pending';
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
              {canEdit() && (
                <Link
                  to={`/reports/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              )}

              {canValidate() && (
                <button
                  onClick={() => setShowValidationForm(!showValidationForm)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Validate
                </button>
              )}

              {canEdit() && (
                <button
                  onClick={deleteReport}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Validation Form */}
        {showValidationForm && canValidate() && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Validate Report
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validation Notes *
              </label>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Provide detailed notes about your validation decision..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleValidation('approve')}
                disabled={isValidating}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isValidating ? 'Approving...' : 'Approve'}
              </button>

              <button
                onClick={() => handleValidation('reject')}
                disabled={isValidating}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isValidating ? 'Rejecting...' : 'Reject'}
              </button>

              <button
                onClick={() => setShowValidationForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{report.description}</p>
            </div>

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Photo Evidence ({report.photos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`/uploads/${photo.filename}`}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full shadow-lg transition-opacity">
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Coordinates</h3>
                  <p className="text-gray-900">
                    {report.location.coordinates.latitude.toFixed(6)}, {report.location.coordinates.longitude.toFixed(6)}
                  </p>
                </div>

                {report.location.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                    <p className="text-gray-900">
                      {[
                        report.location.address.street,
                        report.location.address.city,
                        report.location.address.state,
                        report.location.address.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Map placeholder */}
              <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map view would be displayed here</p>
              </div>
            </div>

            {/* Additional Information */}
            {(report.tags?.length > 0 || report.estimatedArea || report.impactAssessment) && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>

                {report.tags?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.estimatedArea && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Area Affected</h3>
                    <p className="text-gray-900">
                      {report.estimatedArea.value} {report.estimatedArea.unit.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {report.impactAssessment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Impact Assessment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Biodiversity</span>
                        <p className="text-gray-900 capitalize">{report.impactAssessment.biodiversity}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Carbon Storage</span>
                        <p className="text-gray-900 capitalize">{report.impactAssessment.carbonStorage}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Coastal Protection</span>
                        <p className="text-gray-900 capitalize">{report.impactAssessment.coastalProtection}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Reporter</p>
                    <p className="text-gray-900">{report.reporter.firstName} {report.reporter.lastName}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Reported</p>
                    <p className="text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Award className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Severity</p>
                    <p className="text-gray-900 capitalize">{report.severity}</p>
                  </div>
                </div>

                {report.validator && (
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Validated by</p>
                      <p className="text-gray-900">{report.validator.firstName} {report.validator.lastName}</p>
                      {report.validatedAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(report.validatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Notes */}
            {report.validationNotes && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Validation Notes
                </h3>
                <p className="text-gray-700">{report.validationNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>

                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </button>

                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Award className="w-4 h-4 mr-2" />
                  Flag for Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
