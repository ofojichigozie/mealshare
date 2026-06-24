import { useEffect, useState } from 'react';
import { useHousehold } from '../hooks';
import { format } from 'date-fns';
import { CreateHouseholdModal } from '../components/household/CreateHouseholdModal';

export const Household = () => {
  const {
    household,
    updateHousehold,
    addMember,
    removeMember,
    leaveHousehold,
    isFetching,
    isUpdating,
    isAddingMember,
    isRemovingMember,
    isLeaving,
  } = useHousehold();
  const [isEditing, setIsEditing] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberIdentifier, setNewMemberIdentifier] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (household) {
      setHouseholdName(household.name);
    }
  }, [household]);

  const handleUpdateName = async () => {
    if (!household) return;

    const result = await updateHousehold(household.id, {
      name: householdName,
    });

    if (result) {
      setIsEditing(false);
    }
  };

  const handleAddMember = async () => {
    if (!household) return;

    const success = await addMember(household.id, {
      usernameOrEmail: newMemberIdentifier,
    });

    if (success) {
      setNewMemberIdentifier('');
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!household) return;

    if (
      !confirm(
        `Are you sure you want to remove ${memberName} from the household?`
      )
    )
      return;

    await removeMember(household.id, userId);
  };

  const handleLeaveHousehold = async () => {
    if (!household) return;

    if (!confirm('Are you sure you want to leave this household?')) return;

    await leaveHousehold(household.id);
  };

  const isCreator = household?.createdBy?.id === currentUser.id;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading household...</p>
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Household
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your household and members
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            You are not part of any household yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create a new household or join an existing one to start sharing
            meals and expenses.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary w-full"
            >
              Create Household
            </button>
            <div className="card bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">
                Join Household
              </h3>
              <p className="text-sm text-gray-600">
                To join an existing household, contact a household member and
                ask them to add you using your email or username.
              </p>
            </div>
          </div>
        </div>

        <CreateHouseholdModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Household Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Manage your household and members
        </p>
      </div>

      {/* Household Name */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Household Name
        </h2>
        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="input-field flex-1"
            />
            <button
              onClick={handleUpdateName}
              className="btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setHouseholdName(household?.name || '');
              }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 break-words">
              {household?.name}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-outline self-start sm:self-auto"
            >
              Edit Name
            </button>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Members
          </h2>
          {isCreator && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn-primary self-start sm:self-auto"
            >
              Add Member
            </button>
          )}
        </div>

        {showAddMember && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
              <input
                type="text"
                value={newMemberIdentifier}
                onChange={(e) => setNewMemberIdentifier(e.target.value)}
                className="input-field flex-1"
                placeholder="Enter username or email"
              />
              <div className="flex gap-2 sm:gap-0 sm:space-x-3">
                <button
                  onClick={handleAddMember}
                  className="btn-primary flex-1 sm:flex-none"
                  disabled={isAddingMember}
                >
                  {isAddingMember ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="btn-outline flex-1 sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {household?.members?.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    @{member.username} • Joined{' '}
                    {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              {isCreator && member.id !== currentUser.id && (
                <button
                  onClick={() => handleRemoveMember(member.id, member.name)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base self-start sm:self-auto"
                  disabled={isRemovingMember}
                >
                  {isRemovingMember ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Household */}
      <div className="card border-2 border-red-200">
        <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4">
          Danger Zone
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          Once you leave the household, you will lose access to all shared data.
        </p>
        <button
          onClick={handleLeaveHousehold}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLeaving}
        >
          {isLeaving ? 'Leaving...' : 'Leave Household'}
        </button>
      </div>

      <CreateHouseholdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};
