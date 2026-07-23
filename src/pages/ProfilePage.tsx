import React, { useState } from 'react';
import { useHrms } from '../store/HrmsContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { AvatarPicker } from '../components/ui/AvatarPicker';
import { showToast } from '../components/ui/Toast';
import { CheckIcon, ShieldCheckIcon, CameraIcon } from 'lucide-react';
import { formatDate } from '../lib/format';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function ProfilePage() {
  const { currentUser, updateProfile, updatePassword, isAdmin } = useHrms();

  // Profile forms state
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [preferredName, setPreferredName] = useState(currentUser?.preferredName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [dob, setDob] = useState(currentUser?.dateOfBirth || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Other');

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  
  // Password forms state
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);

  if (!currentUser) return null;

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorProfile(null);
    setProfileSaved(false);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorProfile('First Name, Last Name, and Work Email are required.');
      return;
    }

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        preferredName: preferredName.trim() || null,
        email: email.trim(),
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

  const handleSaveAvatar = async () => {
    try {
      await updateProfile({ avatarUrl });
      setAvatarSaved(true);
      setAvatarPickerOpen(false);
      showToast('Profile picture updated successfully!', 'success');
      setTimeout(() => setAvatarSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save avatar:', err);
      showToast(err.message || 'Failed to save profile picture.', 'error');
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
        description="Update your personal details, name, and manage account login credentials."
        actions={
          isAdmin ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Administrator Account</span>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Personal details edit */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Personal & Profile Information"
              subtitle="Edit your name, contact details, and account info"
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
                  <label className={labelClass} htmlFor="profile_fn">First Name *</label>
                  <input
                    id="profile_fn"
                    className={fieldClass}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="profile_ln">Last Name *</label>
                  <input
                    id="profile_ln"
                    className={fieldClass}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="profile_pn">Preferred Name</label>
                  <input
                    id="profile_pn"
                    className={fieldClass}
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="profile_email">Work Email Address *</label>
                  <input
                    id="profile_email"
                    type="email"
                    className={fieldClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Job Title / Role</label>
                  <input className={`${fieldClass} opacity-60 cursor-not-allowed`} value={currentUser.role} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Joined Date</label>
                  <input
                    className={`${fieldClass} opacity-60 cursor-not-allowed`}
                    value={currentUser.joinDate ? formatDate(currentUser.joinDate) : '—'}
                    disabled
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date (Leaving Date)</label>
                  <input
                    className={`${fieldClass} opacity-60 cursor-not-allowed`}
                    value={currentUser.endDate ? formatDate(currentUser.endDate) : '—'}
                    disabled
                  />
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

        {/* Right column: Profile Picture + Security */}
        <div className="space-y-6">

          {/* ── Profile Picture Card ── */}
          <Card>
            <CardHeader
              title="Profile Picture"
              subtitle="Your avatar shown across the portal"
            />
            <div className="p-5 space-y-4">

              {/* Current avatar preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar
                    src={avatarUrl || currentUser.avatarUrl}
                    name={fullName}
                    size="xl"
                    ring
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarPickerOpen(p => !p)}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent shadow-lg border-2 border-canvas transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Change profile picture"
                  >
                    <CameraIcon className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-content">{fullName}</p>
                  <p className="text-xs text-content-faint">{currentUser.role}</p>
                </div>
              </div>

              {/* Avatar saved confirmation */}
              {avatarSaved && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4" />
                  <span>Profile picture updated!</span>
                </div>
              )}

              {/* Picker — toggled by camera button */}
              {avatarPickerOpen && (
                <div className="space-y-3">
                  <AvatarPicker
                    fullName={fullName}
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    compact
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      className="flex-1"
                      onClick={handleSaveAvatar}
                    >
                      Save Picture
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setAvatarUrl(currentUser.avatarUrl || '');
                        setAvatarPickerOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Open picker button when closed */}
              {!avatarPickerOpen && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setAvatarPickerOpen(true)}
                >
                  <CameraIcon className="h-4 w-4" />
                  Change Profile Picture
                </Button>
              )}
            </div>
          </Card>

          {/* ── Account Security Card ── */}
          <Card>
            <CardHeader
              title="Account Security"
              subtitle="Update your login password"
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
                  Confirm New Password
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
