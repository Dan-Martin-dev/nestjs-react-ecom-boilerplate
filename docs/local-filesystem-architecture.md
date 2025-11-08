# Recommended architecture (developer uploads only)

Storage: Local filesystem on the API server (for example `/var/www/ecom/uploads` or a repo-root `uploads/`).

Serving: `nginx` serves `/uploads/*` (fast, sets cache headers). Your NestJS app can also serve files using `ServeStatic` if you prefer, but `nginx` is more efficient for static content.

Public delivery / CDN: Cloudflare (free tier) in front of your domain for HTTPS, caching, performance, and basic DDoS protection.

Admin uploads: Developers upload images directly to the server using `scp`, `rsync`, or SFTP. Optionally provide a small CLI/admin script that records image URLs in the database with Prisma after upload.

Network security: Use SSH keys + a firewall and optionally a VPN (WireGuard) or Hetzner private network to restrict admin access. You can also use a bastion host for added security.

Backup: Periodic `rsync` or backup of the `uploads/` directory to another host or to object storage for durability.

## Why this fits your constraints

- No client uploads: simplifies everything — you control when files appear on the server.
- No S3/Hetzner object storage: local FS is simplest, and Cloudflare caches the images to provide global performance.
- `nginx` + Cloudflare: `nginx` efficiently serves files and sets cache headers; Cloudflare caches globally. Together they are low-cost and robust.

---

If you want, I can also:

- Add a simple `rsync`/`scp` helper script to the `scripts/` folder for developer uploads.
- Add an example `nginx` location block that serves `/uploads` with conservative cache headers and an option for cache-busting.
- Implement a tiny NestJS admin CLI that creates DB image metadata entries after uploads.

Tell me which of those you'd like and I will implement it.
