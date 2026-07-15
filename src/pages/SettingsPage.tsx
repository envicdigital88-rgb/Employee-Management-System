import React, { useState } from 'react';
import { 
  BuildingIcon, 
  GlobeIcon, 
  MailIcon, 
  MapPinIcon, 
  DatabaseIcon, 
  AlertCircleIcon, 
  CopyIcon, 
  CheckIcon 
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { showToast } from '../components/ui/Toast';
import { useHrms } from '../store/HrmsContext';
// @ts-ignore
import schemaSql from '../../supabase_schema.sql?raw';

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-content placeholder:text-content-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-content-muted';

export function SettingsPage() {
  const { isLive, connectionError } = useHrms();

  // Company profile states
  const [name, setName] = useState('ENVIC Digital');
  const [domain, setDomain] = useState('envicdigital.com');
  const [email, setEmail] = useState('people@envicdigital.com');
  const [location, setLocation] = useState('San Francisco, US');
  const [saved, setSaved] = useState(false);

  // Database settings states
  const [dbUrl, setDbUrl] = useState(window.localStorage.getItem('SUPABASE_URL') || '');
  const [dbKey, setDbKey] = useState(window.localStorage.getItem('SUPABASE_ANON_KEY') || '');
  const [dbSaved, setDbSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Confirmation states
  const [confirmSaveCompany, setConfirmSaveCompany] = useState(false);
  const [confirmSaveDb, setConfirmSaveDb] = useState(false);
  const [confirmResetDemo, setConfirmResetDemo] = useState(false);

  const saveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveCompany(true);
  };

  const doSaveCompany = () => {
    setSaved(true);
    showToast('Company profile saved successfully!', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const saveDbSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveDb(true);
  };

  const doSaveDb = () => {
    if (dbUrl.trim() && dbKey.trim()) {
      window.localStorage.setItem('SUPABASE_URL', dbUrl.trim());
      window.localStorage.setItem('SUPABASE_ANON_KEY', dbKey.trim());
    } else {
      window.localStorage.removeItem('SUPABASE_URL');
      window.localStorage.removeItem('SUPABASE_ANON_KEY');
    }
    setDbSaved(true);
    showToast('Database settings saved. Reconnecting...', 'success');
    setTimeout(() => {
      setDbSaved(false);
      window.location.reload();
    }, 1000);
  };

  const resetToDemo = () => {
    setConfirmResetDemo(true);
  };

  const doResetToDemo = () => {
    window.localStorage.removeItem('SUPABASE_URL');
    window.localStorage.removeItem('SUPABASE_ANON_KEY');
    setDbUrl('');
    setDbKey('');
    showToast('Disconnected from database. Switching to Demo Mode...', 'info');
    setTimeout(() => window.location.reload(), 800);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage company profile and workspace preferences."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Company Information Form */}
          <Card>
            <CardHeader
              title="Company information"
              subtitle="Displayed across the workspace"
            />
            <form onSubmit={saveCompany} className="space-y-4 p-5">
              <div>
                <label className={labelClass} htmlFor="cn">
                  Company name
                </label>
                <input
                  id="cn"
                  className={fieldClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="dm">
                    Domain
                  </label>
                  <input
                    id="dm"
                    className={fieldClass}
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="em">
                    HR contact email
                  </label>
                  <input
                    id="em"
                    type="email"
                    className={fieldClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="lo">
                  Headquarters
                </label>
                <input
                  id="lo"
                  className={fieldClass}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary">
                  Save changes
                </Button>
                {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
              </div>
            </form>
          </Card>

          {/* Database Connection Form */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Database connection settings"
              subtitle="Connect to a live Supabase PostgreSQL instance"
            />

            <div className="px-5 py-3.5 border-y border-line bg-surface-raised/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <DatabaseIcon className="h-4.5 w-4.5 text-accent" />
                  <span className="font-semibold text-sm text-content">Database Connection Status</span>
                </div>
                {isLive ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live PostgreSQL (Connected)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Demo Mode (Local Seed Data)
                  </span>
                )}
              </div>

              {connectionError && (
                <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2.5 text-xs text-rose-400">
                  <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Connection Failure</p>
                    <p className="mt-0.5 opacity-90">{connectionError}</p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={saveDbSettings} className="space-y-4 p-5">
              <p className="text-xs text-content-muted leading-relaxed">
                Connect your dashboard to a Supabase PostgreSQL instance. You can find these details in your Supabase project under <strong>Project Settings → API</strong>.
              </p>

              <div>
                <label className={labelClass} htmlFor="db_url">
                  Supabase URL
                </label>
                <input
                  id="db_url"
                  className={fieldClass}
                  placeholder="https://your-project-id.supabase.co"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="db_key">
                  Supabase Anon/Public Key
                </label>
                <input
                  id="db_key"
                  type="password"
                  className={fieldClass}
                  placeholder="ey... (your public key)"
                  value={dbKey}
                  onChange={(e) => setDbKey(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary">
                  Save & Connect
                </Button>
                {(dbUrl || dbKey) && (
                  <Button type="button" variant="secondary" onClick={resetToDemo}>
                    Disconnect / Reset to Demo
                  </Button>
                )}
                {dbSaved && <span className="text-sm text-accent">Connecting...</span>}
              </div>
            </form>

            <div className="p-5 border-t border-line bg-surface-raised/20">
              <h4 className="text-xs font-semibold text-content uppercase tracking-wider">Database Setup Instructions</h4>
              <ol className="mt-2.5 text-xs text-content-muted list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>Create a free account and project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-accent underline hover:text-accent/80">Supabase</a>.</li>
                <li>Go to the <strong>SQL Editor</strong> in the Supabase Dashboard.</li>
                <li>Copy and run the database schema SQL script using the button below.</li>
                <li>Paste your credentials above, save, and enjoy your live HRMS database!</li>
              </ol>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 h-10 text-xs font-medium"
                  onClick={handleCopySql}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4 text-emerald-400" />
                      <span>Copied Schema SQL!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-4 w-4" />
                      <span>Copy Schema SQL Script</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column - Status Overview */}
        <Card className="p-6 h-fit">
          <Logo />
          <div className="mt-5 space-y-3 text-sm">
            <p className="flex items-center gap-2 text-content-muted">
              <BuildingIcon className="h-4 w-4 text-content-faint" /> {name}
            </p>
            <p className="flex items-center gap-2 text-content-muted">
              <GlobeIcon className="h-4 w-4 text-content-faint" /> {domain}
            </p>
            <p className="flex items-center gap-2 text-content-muted">
              <MailIcon className="h-4 w-4 text-content-faint" /> {email}
            </p>
            <p className="flex items-center gap-2 text-content-muted">
              <MapPinIcon className="h-4 w-4 text-content-faint" /> {location}
            </p>
          </div>
          <p className="mt-6 rounded-xl border border-line bg-surface-raised p-3 text-xs text-content-faint">
            A division of ENVIC Global — modern technology for ambitious
            businesses.
          </p>
        </Card>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={confirmSaveCompany}
        onClose={() => setConfirmSaveCompany(false)}
        onConfirm={doSaveCompany}
        title="Save Company Profile"
        message="Are you sure you want to save the company profile changes? This will update the company information across the workspace."
        confirmText="Save Changes"
        variant="primary"
      />
      <ConfirmationModal
        open={confirmSaveDb}
        onClose={() => setConfirmSaveDb(false)}
        onConfirm={doSaveDb}
        title="Save Database Settings"
        message="Saving new database credentials will reload the application and reconnect to your Supabase instance. Make sure the credentials are correct before proceeding."
        confirmText="Save & Connect"
        variant="primary"
      />
      <ConfirmationModal
        open={confirmResetDemo}
        onClose={() => setConfirmResetDemo(false)}
        onConfirm={doResetToDemo}
        title="Reset to Demo Mode"
        message="This will disconnect from the live database and switch to Demo Mode using local seed data. All changes made to the live database will remain, but won't be visible until you reconnect."
        confirmText="Disconnect & Reset"
        variant="danger"
      />
    </div>
  );
}