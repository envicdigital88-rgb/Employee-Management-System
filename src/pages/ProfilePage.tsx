import React, { useState } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserIcon, LockIcon, ShieldAlertIcon, CheckIcon } from 'lucide-react';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function ProfilePage() {
  const { currentUser, updateProfile, updatePassword } = useHrms();

  // Profile forms state
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [dob, setDob] = useState(currentUser?.dateOfBirth || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Other');
  
  // Password forms state
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorProfile(null);
    setProfileSaved(false);

    try {
      await updateProfile({
        phone,
        address,
        dateOfBirth: dob,
        gender: gender as 'Male' | 'Female' | 'Other'
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setErrorProfile(err.message || 'Failed to update profile.');
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setPasswordSaved(false);

    if (password !== confirm) {
      setErrorPassword('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorPassword('Password must be at least 6 characters.');
      return;
    }

    try {
      await updatePassword(password);
      setPasswordSaved(true);
      setPassword('');
      setConfirm('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setErrorPassword(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your personal details and manage account credentials."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Personal details edit */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Personal Information"
              subtitle="Edit your contact details and background info"
            />

            <form onSubmit={handleSaveProfile} className="space-y-4 p-5">
              {errorProfile && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                  {errorProfile}
                </div>
              )}
              {profileSaved && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={currentUser.firstName} disabled />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={currentUser.lastName} disabled />
                </div>
                <div>
                  <label className={labelClass}>Preferred Name</label>
                  <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={currentUser.preferredName || '—'} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Job Title / Role</label>
                  <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={currentUser.role} disabled />
                </div>
                <div>
                  <label className={labelClass}>Work Email</label>
                  <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={currentUser.email} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="profile_phone">
                    Phone Number
                  </label>
                  <input
                    id="profile_phone"
                    className={fieldClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="profile_gender">
                    Gender
                  </label>
                  <select
                    id="profile_gender"
                    className={fieldClass}
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="profile_dob">
                  Date of Birth
                </label>
                <input
                  id="profile_dob"
                  type="date"
                  className={fieldClass}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="profile_address">
                  Current Residential Address
                </label>
                <textarea
                  id="profile_address"
                  className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[80px]"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right column: Security / Change Password */}
        <div>
          <Card>
            <CardHeader
              title="Account Security"
              subtitle="Change your login credentials"
            />

            <form onSubmit={handleSavePassword} className="space-y-4 p-5">
              {errorPassword && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                  {errorPassword}
                </div>
              )}
              {passwordSaved && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <div>
                <label className={labelClass} htmlFor="profile_password">
                  New Password
                </label>
                <input
                  id="profile_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={fieldClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="profile_confirm">
                  Confirm Password
                </label>
                <input
                  id="profile_confirm"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={fieldClass}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <Button type="submit" variant="secondary" className="w-full">
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
