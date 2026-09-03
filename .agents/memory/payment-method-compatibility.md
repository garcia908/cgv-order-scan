---
name: Payment method compatibility
description: Durable rule for changing payment options while preserving historical orders.
---

When changing customer-facing payment methods, preserve old enum values at the API boundary when existing database rows may contain them. Limit the new values in the customer UI, and label legacy values as historical in staff-facing surfaces.

**Why:** Strictly replacing an enum made historical rows invalid for response validation and could break the staff order list after deployment.

**How to apply:** Treat API/schema compatibility and customer choices separately; only remove legacy values after an explicit data migration and a retention decision.