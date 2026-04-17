/* --- HERO SECTION ASSETS (PRODUCTION GRID CONFIG) ---
   Fully optimized Cloudinary resources.
   
   Changes for Perfection:
   1. w_1080:       Resized from 4K/2K. Perfect for Col-lg-2 grid slots (Retina ready).
   2. e_sharpen:50: Added to images to make them "pop" at this smaller size.
   3. br_4m:         Video bitrate capped at 4Mbps (Perfect for 1080px width).
*/

const heroContent = {
    // 1. Vertical Hero Image (The Trekker)
    heroImg01: "https://res.cloudinary.com/duyqkhmyz/image/upload/f_auto,q_auto:best,w_1080,e_sharpen:50/v1770293349/hero_img_1_c7bft2.jpg",

    // 2. Landscape Hero Image (The Scenery)
    heroImg02: "https://res.cloudinary.com/duyqkhmyz/image/upload/f_auto,q_auto:best,w_1080,e_sharpen:50/v1770288716/hero-img02_niqcy8.jpg",

    // 3. Optimized Video (~4MBps)
    heroVideo: "https://res.cloudinary.com/duyqkhmyz/video/upload/vc_auto,q_auto,w_1080,br_4m/v1770293259/hero_Video_vqigtq.mp4",

    // 4. Instant Video Poster (Zero-latency placeholder)
    videoPoster: "https://res.cloudinary.com/duyqkhmyz/video/upload/so_0,w_1080,q_auto,f_auto/v1770293259/hero_Video_vqigtq.jpg"
};

export default heroContent;