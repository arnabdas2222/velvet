# LOLIPOP / VELVET - Mobile-Responsive Media & Creator Portal

A fully responsive, sleek dark-themed media portal inspired by the LOLIPOP design, crafted for desktop and mobile phones.

## ✨ Key Features

1. **Fully Mobile-Responsive**:
   - **Adaptive Layout**: Automatically scales from 4 columns on desktop, 3 on laptops, 2 on tablets, and 1 full-width column on mobile phones.
   - **Mobile Bottom Navigation**: Sleek, app-like bottom navigation bar on smartphones (Home, Shorts, Subscriptions, Photos).
   - **Slide-out Drawer**: Touch-friendly hamburger drawer for mobile navigation.
   - **No horizontal overflow** or awkward scrolling on phones.

2. **Aspect Ratio & Mixed Dimension Engine**:
   - Handles **any image dimensions** (tall vertical portrait `9:16`, Instagram `4:5`, square `1:1`, landscape `16:9`, ultra-wide `21:9`) without distortion or clipping.
   - **Ambient Blur Backdrop**: Dual-layer rendering technology creates a softened ambient glow behind images, eliminating ugly black or letterbox bars.
   - **View Mode Switcher**: Easily toggle between **Cover Fit** (uniform grid with face-focused framing) and **Smart Adaptive** (ambient containment).
   - **Full Lightbox Modal**: Tap any card to view the uncropped, original-resolution image with left/right swipe and navigation arrows.

3. **Updated Left Sidebar**:
   - The creator name list from the left sidebar has been **completely removed** as requested.
   - Clean, elegant navigation remains: **Home**, **Shorts**, **Subscriptions**, plus **History**, **View later**, **Favorites**, and **Downloads**.

4. **16 Cards with Complete Metadata**:
   - Organized into 4 balanced sections (4 cards each = 16 cards total):
     - **Best of the week** (Cards 1–4)
     - **Trending videos** (Cards 5–8)
     - **Hot Categories** (Cards 9–12)
     - **Featured & Recommended** (Cards 13–16)
   - Each card displays:
     - **Title / Name** (bold headline)
     - **Creator Avatar**
     - **Description** (custom bio or shoot details)
     - **Instagram Follower Count** (with verified Instagram gradient badge)
     - **Duration / Video Badge** (4K UHD, EXCLUSIVE, TRENDING, 1080P)
     - **Action Menu** (one-click copy/share)

---

## 📸 How to Provide Your Own 16 Images

You can customize the 16 images, titles, descriptions, and Instagram follower counts in two simple ways:

### Method A: In-Browser Live Customizer (Easiest)
1. Open `index.html` in your browser.
2. Click the **"Replace 16 Images"** button in the sidebar (or the settings gear icon on mobile).
3. A drawer will slide open showing all 16 cards:
   - Click **"Choose local image from computer"** to select any photo from your phone or PC.
   - Edit the **Title**, **Description**, **Instagram handle**, and **Follower count**.
4. The site updates **instantly in real time**!
5. Click **"Copy Code for data.js"** if you want to permanently paste your changes into `js/data.js`.

### Method B: Directly in `js/data.js`
1. Place your 16 image files in `assets/images/` (e.g. `image1.jpg`, `image2.jpg`, etc.).
2. Open [js/data.js](file:///c:/Users/Admin/Downloads/velvet/js/data.js) in your text editor.
3. Update the fields for each of the 16 items (including the link behind each image):
   ```javascript
   {
     id: 1,
     title: "MIDNIGHT MARBLE COUTURE",
     creator: "AURA P. SCOTT",
     description: "Your custom description goes here...",
     link: "Your link", // <-- Put your target destination link here!
     followers: "3.4M",
     image: "assets/images/night-glam.jpg"
   }
   ```
4. Save the file and refresh your browser!

---

## 🚀 How to Run the Website

- **Zero dependencies required!** Just double-click `index.html` to open it directly in Chrome, Edge, Safari, Firefox, or any mobile browser.
- Or use any static web server:
  - If using VS Code: Right-click `index.html` and click **"Open with Live Server"**.
  - Or using Node: `npx serve .`
