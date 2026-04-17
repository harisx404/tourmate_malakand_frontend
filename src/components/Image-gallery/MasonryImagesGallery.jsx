import React from "react";
import galleryImages from "../../assets/data/galleryImages";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import "./masonry-gallery.css";

/*
  Masonry Images Gallery Component:
  Represents the image gallery section of the website.
  Used for displaying images in an optimal brick-like layout adapted for different screen sizes.
*/
const MasonryImagesGallery = () => {
    return (
        /*====== Layout Config: 2 Columns for Mobile (Pinterest Standard), 3 for Tablet, 4 for Desktop ======*/
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 768: 3, 992: 4 }}>
            {/*====== Gutter set to 1.2rem to maintain consistent spacing between bricks ======*/}
            <Masonry gutter="1.2rem">
                {galleryImages.map((image, index) => (
                    <img
                        className="masonry-gallery-img"
                        key={index}
                        src={image}
                        // Accessibility: Unique alt text for each image
                        alt={`Malakand Gallery Photo ${index + 1}`}

                        // --- ⚡ PERFORMANCE OPTIMIZATIONS ---
                        loading="lazy"       // Don't download until user scrolls near
                        decoding="async"     // Decode in background (no scroll freeze)

                        // --- 📐 LAYOUT STABILITY ---
                        // Critical for Masonry: Ensures image takes space immediately
                        style={{ width: "100%", display: "block", borderRadius: "10px" }}
                    />
                ))}
            </Masonry>
        </ResponsiveMasonry>
    );
};

export default MasonryImagesGallery;