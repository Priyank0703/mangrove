import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  MapPin,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "community",
    organization: "",
    city: "",
    state: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      value: "community",
      label: "Community Member",
      description: "Local residents, fishermen, and community activists",
    },
    {
      value: "ngo",
      label: "NGO Staff",
      description: "Non-governmental organization employees",
    },
    {
      value: "government",
      label: "Government Official",
      description: "Local, state, or federal government employees",
    },
    {
      value: "researcher",
      label: "Researcher",
      description: "Scientists, academics, and research institutions",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Organization validation for NGO/Government roles
    if (
      (formData.role === "ngo" || formData.role === "government") &&
      !formData.organization.trim()
    ) {
      newErrors.organization = "Organization is required for this role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Build userData, only including organization/location if present
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };
      if (formData.organization && formData.organization.trim() !== "") {
        userData.organization = formData.organization;
      }
      const location = {};
      if (formData.city && formData.city.trim() !== "")
        location.city = formData.city;
      if (formData.state && formData.state.trim() !== "")
        location.state = formData.state;
      if (formData.country && formData.country.trim() !== "")
        location.country = formData.country;
      if (Object.keys(location).length > 0) {
        userData.location = location;
      }

      const result = await register(userData);
      if (result.success) {
        toast.success(
          "Registration successful! Welcome to Community Mangrove Watch."
        );
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <span className="text-4xl">🌿</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Join the Community
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create your account and start contributing to mangrove conservation
            efforts worldwide
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/80 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-2xl border border-white/20">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                      errors.firstName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.firstName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                      errors.lastName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Username and Email */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                        errors.username
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                Your Role in Conservation *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.value}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.role === role.value
                        ? "border-green-500 bg-green-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() =>
                      handleChange({
                        target: { name: "role", value: role.value },
                      })
                    }
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="ml-4">
                        <label className="block text-sm font-semibold text-gray-900 cursor-pointer">
                          {role.label}
                        </label>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    {formData.role === role.value && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Organization (for NGO/Government) */}
            {(formData.role === "ngo" || formData.role === "government") && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                  Organization Details
                </h3>
                <div className="space-y-2">
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      required
                      value={formData.organization}
                      onChange={handleChange}
                      className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                        errors.organization
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter organization name"
                    />
                  </div>
                  {errors.organization && (
                    <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.organization}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                Location (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-gray-300 transition-all duration-200"
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State/Province
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-gray-300 transition-all duration-200"
                    placeholder="Enter state"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-gray-300 transition-all duration-200"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border-2 border-green-600 text-green-600 font-medium rounded-xl hover:bg-green-600 hover:text-white transition-all duration-200"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600 mt-8">
          <p>
            By creating an account, you agree to our{" "}
            <a
              href="#"
              className="text-green-600 hover:text-green-500 font-medium transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-green-600 hover:text-green-500 font-medium transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
