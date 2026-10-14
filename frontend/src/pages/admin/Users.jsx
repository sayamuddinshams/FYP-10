import { useEffect, useState } from 'react';
import { useAsync, useDebounce, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { cn, formatDate, timeAgo } from '../../utils/format';
import userService from '../../services/userService';
import PageHeader from '../../components/dashboard/PageHeader';
import DataTable from '../../components/dashboard/DataTable';
import { Input, Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Dropdown from '../../components/common/Dropdown';
import { RoleBadge, UserStatusBadge, VerificationBadge } from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import Pagination from '../../components/common/Pagination';
import Icon from '../../components/common/icons';

const PAGE_LIMIT = 8;

const ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'owner', label: 'Owner / Agent' },
  { value: 'admin', label: 'Admin' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

function filterClasses(active) {
  return cn(
    'inline-flex h-10 items-center rounded-lg border px-3.5 text-sm font-medium transition-colors select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
    active
      ? 'border-brand-700 bg-brand-700 text-white shadow-sm'
      : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-800'
  );
}

export default function Users() {
  useDocumentTitle('Users');
  const toast = useToast();
  const { confirm } = useModals();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () => userService.list({ role, status, query: debouncedQuery, page, limit: PAGE_LIMIT }),
    [role, status, debouncedQuery, page]
  );

  useEffect(() => {
    setPage(1);
  }, [role, status, debouncedQuery]);

  const users = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  async function handleSuspendToggle(user) {
    const suspending = user.status !== 'suspended';
    const ok = await confirm({
      title: suspending ? `Suspend ${user.name}?` : `Reactivate ${user.name}?`,
      message: suspending
        ? `This user will no longer be able to log in or interact with the platform. Their listings will remain but are hidden.`
        : `The user will regain full access to their account and listed properties.`,
      confirmLabel: suspending ? 'Suspend user' : 'Reactivate user',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await userService.setStatus(user.id, suspending ? 'suspended' : 'active');
      toast.success(suspending ? `${user.name} has been suspended.` : `${user.name} has been reactivated.`);
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    const name = editUser.name.trim();
    if (!name) {
      toast.error('Name is required.', 'Cannot save');
      return;
    }
    try {
      if (editUser.status !== editUser._original.status) {
        await userService.setStatus(editUser.id, editUser.status);
      }
      await userService.updateProfile(editUser.id, { name, phone: editUser.phone, role: editUser.role });
      toast.success('User profile updated.');
      setEditUser(null);
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
            <p className="truncate text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (u) => <RoleBadge role={u.role} /> },
    { key: 'status', label: 'Status', render: (u) => <UserStatusBadge status={u.status} /> },
    { key: 'joined', label: 'Joined', render: (u) => <span className="text-sm text-slate-600">{formatDate(u.joinedAt)}</span>, hideOnMobile: true },
    {
      key: 'activity',
      label: 'Last Activity',
      align: 'right',
      render: (u) => <span className="text-sm text-slate-500">{timeAgo(u.lastActivity)}</span>,
      hideOnMobile: true,
    },
  ];

  const actions = (u) => (
    <Dropdown
      ariaLabel={`Actions for ${u.name}`}
      trigger={
        <Button variant="outline" size="sm">
          Actions
          <Icon name="chevronDown" className="h-4 w-4" />
        </Button>
      }
      items={[
        { label: 'View profile', icon: <Icon name="eye" className="h-4 w-4" />, onClick: () => setViewUser(u) },
        { label: 'Edit details', icon: <Icon name="edit" className="h-4 w-4" />, onClick: () => setEditUser({ ...u, _original: u }) },
        '-',
        {
          label: u.status === 'suspended' ? 'Reactivate' : 'Suspend',
          icon: <Icon name={u.status === 'suspended' ? 'check' : 'x'} className="h-4 w-4" />,
          tone: 'danger',
          onClick: () => handleSuspendToggle(u),
        },
      ]}
    />
  );

  const hasActiveFilters = Boolean(debouncedQuery) || role !== 'all' || status !== 'all';

  function clearFilters() {
    setQuery('');
    setRole('all');
    setStatus('all');
  }

  const emptyBlock = hasActiveFilters ? (
    <EmptyState
      icon="search"
      title="No users match your filters"
      message="No accounts match this search and filter combination. Try a different query or clear the filters."
      actionLabel="Clear filters"
      onAction={clearFilters}
    />
  ) : (
    <EmptyState
      icon="inbox"
      title="No users yet"
      message="Registered tenants, owners and admins will appear here as they join RentLink."
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage tenant, owner and admin accounts across the platform."
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <Input
          label="Search users"
          placeholder="Search by name, email or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="xl:max-w-sm"
          rightIcon={
            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
              <Icon name="search" className="h-4 w-4" />
            </span>
          }
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div>
            <span id="users-role-filter" className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </span>
            <div role="group" aria-labelledby="users-role-filter" className="flex flex-wrap gap-1.5">
              {ROLE_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={role === opt.value}
                  onClick={() => setRole(opt.value)}
                  className={filterClasses(role === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span id="users-status-filter" className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </span>
            <div role="group" aria-labelledby="users-status-filter" className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={status === opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={filterClasses(status === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500" role="status" aria-live="polite">
        {loading ? 'Loading users…' : `${total.toLocaleString()} user${total === 1 ? '' : 's'} found`}
      </p>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable columns={columns} rows={users} rowKey="id" loading={loading} empty={emptyBlock} actions={actions} />
          {!loading && users.length > 0 && <Pagination page={page} pages={pages} onChange={setPage} />}
        </>
      )}

      {/* View profile modal */}
      <Modal
        open={Boolean(viewUser)}
        onClose={() => setViewUser(null)}
        title={viewUser?.name}
        description={`${viewUser?.email || 'No email on file'}`}
        size="md"
      >
        {viewUser && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-5 text-center">
              <Avatar name={viewUser.name} size="lg" />
              <div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <RoleBadge role={viewUser.role} />
                  <UserStatusBadge status={viewUser.status} />
                  <VerificationBadge status={viewUser.verification} />
                </div>
                <p className="mt-2 text-sm text-slate-500">Member since {viewUser.memberSince || formatDate(viewUser.joinedAt)}</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Phone</dt>
                <dd className="mt-0.5 text-slate-800">{viewUser.phone || '–'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Location</dt>
                <dd className="mt-0.5 text-slate-800">
                  {[viewUser.area, viewUser.city, viewUser.district].filter(Boolean).join(', ') || '–'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Bio</dt>
                <dd className="mt-0.5 text-slate-700">{viewUser.bio || 'No bio provided.'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Properties</dt>
                <dd className="mt-0.5 text-slate-800">{viewUser.propertyCount || 0} listed · {viewUser.approvedCount || 0} approved</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Joined</dt>
                <dd className="mt-0.5 text-slate-800">{formatDate(viewUser.joinedAt)}</dd>
              </div>
            </dl>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewUser(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewUser(null);
                  setEditUser({ ...viewUser, _original: viewUser });
                }}
              >
                Edit profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title="Edit user"
        description={`Update profile details for ${editUser?.name}.`}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-user-form">
              Save changes
            </Button>
          </div>
        }
      >
        {editUser && (
          <form id="edit-user-form" onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Full name"
              required
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              placeholder="e.g. Ayesha Khan"
            />
            <Input
              label="Phone"
              value={editUser.phone || ''}
              onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              placeholder="+92 3xx xxxxxxx"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Role"
                value={editUser.role}
                disabled={editUser._original.role === 'admin'}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="tenant">Tenant</option>
                <option value="owner">Owner / Agent</option>
                <option value="admin">Admin</option>
              </Select>
              <Select
                label="Status"
                disabled={editUser._original.role === 'admin'}
                value={editUser.status}
                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
            {editUser._original.role === 'admin' && (
              <p className="text-xs text-slate-500">Admin accounts cannot have their role or status changed.</p>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}