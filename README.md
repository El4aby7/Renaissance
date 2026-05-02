# Renaissance Hotel - Deployment & Setup Guide

This document outlines the steps required to fully configure the Supabase backend and deploy the Renaissance Hotel static website to GitHub Pages.

## 1. Supabase Backend Setup

### A. Create Project & Get Credentials
1. Create a new project on [Supabase](https://supabase.com).
2. Go to **Project Settings -> API**.
3. Copy the **Project URL** and **anon public** key.
4. Open `config.js` in your project and replace the placeholders:
   ```javascript
   SUPABASE_URL: "https://your-project-url.supabase.co",
   SUPABASE_ANON_KEY: "your-anon-key",
   ```

### B. Database Schema
Run the following SQL in the Supabase SQL Editor to create the required tables:

```sql
-- 1. Create 'rooms' table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    room_type TEXT NOT NULL,
    thumbnail TEXT,
    images TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create 'bookings' table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10,2),
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    confirmation_number TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create 'contact_messages' table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- 'unread', 'read'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create 'settings' table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.280024805507!2d31.222007575871103!3d30.057506817951154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840e761e4d685%3A0xd01a820fea961b3e!2sCairo%20Marriott%20Hotel!5e0!3m2!1sen!2seg!4v1777573596336!5m2!1sen!2seg'),
('social_instagram', 'https://instagram.com'),
('social_facebook', 'https://facebook.com'),
('social_linkedin', 'https://linkedin.com')
ON CONFLICT (key) DO NOTHING;
```

### C. Storage Bucket
1. Go to **Storage** in the Supabase dashboard.
2. Create a new bucket named **`room-images`**.
3. **Important:** Mark the bucket as **Public**.

### D. Row Level Security (RLS) Policies
Run the following SQL to secure your tables. This ensures public users can only read rooms/settings and insert bookings/messages, while authenticated admin users can do everything.

```sql
-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 1. Rooms Policies
-- Public can read rooms
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT USING (true);
-- Admins can do everything
CREATE POLICY "Admins can manage rooms" ON rooms USING (auth.role() = 'authenticated');

-- 2. Bookings Policies
-- Public can create bookings
CREATE POLICY "Public can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
-- Admins can do everything
CREATE POLICY "Admins can manage bookings" ON bookings USING (auth.role() = 'authenticated');

-- 3. Contact Messages Policies
-- Public can create messages
CREATE POLICY "Public can insert messages" ON contact_messages FOR INSERT WITH CHECK (true);
-- Admins can do everything
CREATE POLICY "Admins can manage messages" ON contact_messages USING (auth.role() = 'authenticated');

-- 4. Settings Policies
-- Public can read settings
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
-- Admins can do everything
CREATE POLICY "Admins can manage settings" ON settings USING (auth.role() = 'authenticated');

-- 5. Storage Policies (for room-images bucket)
-- Allow public to read images
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT 
USING (bucket_id = 'room-images');

-- Allow authenticated admins to upload/delete/update images
CREATE POLICY "Admins can manage images" ON storage.objects 
FOR ALL USING (auth.role() = 'authenticated' AND bucket_id = 'room-images');
```

## 2. GitHub Pages Deployment Guide

Because this project uses strictly Vanilla HTML, CSS, and JS with no build step, deploying to GitHub Pages is extremely straightforward.

1. **Initialize Git & Push to GitHub**:
   - Open a terminal in your project root.
   - Run `git init`
   - Run `git add .`
   - Run `git commit -m "Initial commit"`
   - Create a repository on GitHub and push your code.
   
2. **Enable GitHub Pages**:
   - Navigate to your repository on GitHub.
   - Click on **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment**, set the **Source** to `Deploy from a branch`.
   - Under **Branch**, select `main` (or `master`) and folder `/(root)`.
   - Click **Save**.

3. **Verify Deployment**:
   - In a few minutes, your site will be live at `https://[your-username].github.io/[repository-name]`.
   - Because we use standard `<a href="page.html">` linking and no frontend router history APIs, routing will work flawlessly on GitHub Pages out of the box.

*Note on Security: Your `config.js` contains your Supabase URL and Anon key. Since it's a frontend app, this is normal and unavoidable. The Anon key is safe to expose as long as your Row Level Security (RLS) policies are correctly implemented (as shown above).*
