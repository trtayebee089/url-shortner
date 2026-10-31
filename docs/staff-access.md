# Users, roles and permissions

Superadmins manage all accounts at `/admin/users`. They can create accounts, assign an active role, suspend or restore accounts, send setup emails, and create or edit custom permission sets. User email addresses cannot be changed through this screen. Accounts and role definitions are retained; disabling access does not delete billing or link history.

| Role | Default access |
| --- | --- |
| Superadmin | All administration, including users and role definitions; protected console provisioning only |
| Admin | Customer, plan, subscription, payment and moderation operations; audit history; no staff/role management |
| Manager | Overview, customers, plan viewing, subscription management |
| Support | Overview, customer support, link/report moderation; no subscription/payment/audit details |
| Billing | Overview, customer/plan viewing, subscription and manual payment management |
| Viewer | Read-only overview, customers, plans and subscriptions |
| Legacy admin | Original overview/customer-directory and moderation access, preserved for previously existing admins |
| Customer | Own customer workspace only |
| Custom | Explicitly selected operations |

The migration preserves the original permissions of existing `admin` accounts by assigning `legacy-admin`. This avoids silently granting existing moderators pricing or payment permissions. Superadmins can explicitly assign the new Admin role afterwards. The Customer role and Superadmin identity cannot be edited into more privileged roles through role-definition forms. Custom role identifiers are immutable. There is no assignable `staff.manage` permission; only the protected Superadmin role receives it.

Permissions are enforced on every management API route in addition to Sanctum token abilities, active-account and email-verification middleware. Read-only and write permissions are distinct. A write permission automatically includes its corresponding view permission, subscription management includes the customer/plan reads needed for assignment, and payment recording includes subscription viewing. Customer support endpoints omit staff-directory records and billing details unless authorized. Overview responses omit financial totals and audit events when those permissions are absent.

The frontend consumes server-resolved permissions, filters navigation and action buttons, and refreshes account access when entering administration routes. Custom roles without overview access land on their first authorized screen. Client-side role values never authorize an API operation.

Changing an account's role/status revokes existing tokens. Editing/disabling a role revokes tokens for all assigned users. A disabled role grants no administrative permissions, even if the user remains an active customer. Role changes, staff account changes and setup actions are recorded in the audit log. Superadmins cannot demote/suspend themselves or another superadmin through these forms.

New accounts have random unknown passwords. Setup uses the existing email-verification and password-recovery notifications; staff must verify their email and set a password before administrative access. Setup emails can be resent from Manage access. Existing passwords are preserved when roles change. Reset URLs use resolved `shortener.frontend_url`, so cached production configuration points to the live frontend. Mail transport failures are reported without rolling back the newly created account or logging credentials.

No invitation emails are sent merely by deploying this feature. A superadmin explicitly creates an account or chooses Send setup emails. Only accounts named by that action receive messages.

Deployment uses `deploy/staff-release.sh` and the backed-up PHP file installer. Run the additive migration and rebuild Laravel caches before publishing the frontend. This release does not alter Stripe keys or enable payments.
