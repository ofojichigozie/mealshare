import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { notify } from '../utils/notification';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user, logout } = useAuth();
  const {
    updateProfile,
    changePassword,
    isUpdatingProfile,
    isChangingPassword,
  } = useProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      notify.error('Password must be at least 6 characters');
      return;
    }

    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    if (success) {
      setShowChangePasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    notify.success('Logged out successfully');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Profile Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Manage your account information
        </p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Profile Information
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-outline self-start sm:self-auto"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3 sm:gap-0">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                  });
                }}
                className="btn-outline"
                disabled={isUpdatingProfile}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Full Name</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Username</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                @{user?.username}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Email</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Change Password
          </h2>
          {!showChangePasswordForm && (
            <button
              onClick={() => setShowChangePasswordForm(true)}
              className="btn-outline self-start sm:self-auto"
            >
              Change Password
            </button>
          )}
        </div>

        {showChangePasswordForm ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="input-field"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="input-field"
                minLength={6}
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3 sm:gap-0">
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="btn-outline"
                disabled={isChangingPassword}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm sm:text-base text-gray-600">
            Click "Change Password" to update your account password
          </p>
        )}
      </div>

      {/* Logout */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          Sign Out
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          Sign out of your account on this device
        </p>
        <button
          onClick={handleLogout}
          className="btn-secondary w-full sm:w-auto"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
