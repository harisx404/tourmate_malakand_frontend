import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, FormGroup, Button } from "reactstrap";
import imageCompression from 'browser-image-compression';
import CustomToast from "../../shared/CustomToast";
import { confirmAction } from "../../utils/alerts";
import "./spot-form.css";


//==== DOMAIN CONFIGURATION ===//
/* Static data sources for dropdowns and pills. 
  Kept outside the component to prevent recreation on every render.
*/
const TAG_OPTIONS = [
    "Mountain", "River", "Snowfall", "Waterfall", "Historical",
    "Religious", "Lake", "Hiking", "Camping", "Trekking",
    "Park", "Government Guest House", "Rest House", "Valley",
    "Meadow", "Desert", "Forest", "Museum", "Fort"
];

const SEASON_OPTIONS = ["All Seasons", "Summer", "Winter", "Spring", "Autumn"];

const DISTRICT_OPTIONS = [
    "Malakand", "Lower Swat", "Upper Swat", "Lower Dir", "Upper Dir",
    "Buner", "Shangla", "Lower Chitral", "Upper Chitral", "Bajaur"
];


//==== UI COMPONENT: CUSTOM DROPDOWN ===//
const SpotGlassDropdown = ({ options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef(null);

    /*
      Click-Outside Logic:
      Detects clicks anywhere in the document. If the click is NOT inside 
      the dropdown ref, it closes the menu. Essential for custom UI controls.
    */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropRef.current && !dropRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value) => {
        onChange({ target: { id: "district", value: value } });
        setIsOpen(false);
    };

    return (
        <div className={`spt_frm_dropdown ${isOpen ? "open" : ""}`} ref={dropRef}>
            <div className="spt_frm_drop_trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{selected || "Select District"}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? "rotate" : ""}`}></i>
            </div>
            {isOpen && (
                <div className="spt_frm_drop_menu">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            className={`spt_frm_drop_item ${selected === opt ? "active" : ""}`}
                            onClick={() => handleSelect(opt)}
                        >
                            {opt}
                            {selected === opt && <i className="ri-check-line"></i>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


//==== MAIN FORM COMPONENT ===//
const SpotForm = ({ initialData, onSubmit, isLoading, onCancel, formTitle }) => {
    // === Standardized Toast State === //
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const closeToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };

    const showToast = (message, type = "success") => {
        setToastState({ show: true, message, type });
    };


    /*
      Dirty State Tracking:
      Used to warn the user if they attempt to navigate away 
      with unsaved changes.
    */
    const [isDirty, setIsDirty] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const [formData, setFormData] = useState({
        title: "", city: "", district: "", location: "", proximity: "",
        desc: "", features: "", history: "",
        tags: [], bestSeason: [], lat: "", lng: ""
    });

    // Separate state for existing (URL) images vs new (File) uploads
    const [existingImages, setExistingImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // Stores references to blob URLs for cleanup
    const objectUrlsRef = useRef([]);

    /*
      Hydration Effect (Edit Mode):
      Populates the form fields if 'initialData' is provided.
      Handles normalization of nested objects (like geometry) and arrays.
    */
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                city: initialData.city || "",
                district: initialData.district || "",
                location: initialData.location || "",
                proximity: initialData.proximity || "",
                desc: initialData.desc || "",
                features: initialData.features || "",
                history: initialData.history || "",
                tags: Array.isArray(initialData.tags) ? initialData.tags : [],
                bestSeason: Array.isArray(initialData.bestSeason) ? initialData.bestSeason : [],
                lat: initialData.geometry?.coordinates?.[1] || "",
                lng: initialData.geometry?.coordinates?.[0] || ""
            });

            let photos = [];
            if (initialData.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
                photos = initialData.images;
            } else if (initialData.photo) {
                photos = [initialData.photo];
            }
            setExistingImages(photos.filter(p => p));
        }
    }, [initialData]);

    /*
      Memory Leak Prevention:
      Revokes all created ObjectURLs when the component unmounts.
      Prevents browser memory bloat from image previews.
    */
    useEffect(() => {
        return () => {
            objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Navigation Guard: Intercepts browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setIsDirty(true);
    };

    const toggleSelection = (field, value) => {
        setFormData(prev => {
            const currentArray = prev[field];
            if (currentArray.includes(value)) {
                return { ...prev, [field]: currentArray.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...currentArray, value] };
            }
        });
        setIsDirty(true);
    };

    //==== IMAGE PROCESSING LOGIC ===//
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const currentTotal = existingImages.length + imageFiles.length;

        if (currentTotal + files.length > 4) {
            showToast("Maximum 4 images allowed.", "error");
            return;
        }

        try {
            setIsCompressing(true);
            const compressedFiles = [];
            const newPreviews = [];

            /*
              Adaptive Compression Strategy:
              Iterates through uploads and applies different compression settings
              based on the initial file size to balance quality vs performance.
              Converts everything to WebP format for modern optimization.
            */
            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;

                // Deduplication check
                const isDuplicate = imageFiles.some(f => f.name === file.name.replace(/\.[^/.]+$/, "") + ".webp");
                if (isDuplicate) continue;

                let finalFile = file;
                const sizeInMB = file.size / 1024 / 1024;

                if (sizeInMB <= 2.4) {
                    const conversionOptions = {
                        maxSizeMB: 2.4,
                        maxWidthOrHeight: 3840,
                        useWebWorker: true,
                        fileType: "image/webp",
                        initialQuality: 0.95,
                        alwaysKeepResolution: true
                    };
                    const convertedBlob = await imageCompression(file, conversionOptions);
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    finalFile = new File([convertedBlob], newFileName, { type: "image/webp" });
                } else {
                    const compressionOptions = {
                        maxSizeMB: 2.4,
                        maxWidthOrHeight: 2560,
                        useWebWorker: true,
                        fileType: "image/webp",
                        initialQuality: 0.85
                    };
                    const compressedBlob = await imageCompression(file, compressionOptions);
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    finalFile = new File([compressedBlob], newFileName, { type: "image/webp" });
                }

                compressedFiles.push(finalFile);

                // Create ephemeral preview URL
                const previewUrl = URL.createObjectURL(finalFile);
                newPreviews.push(previewUrl);
                objectUrlsRef.current.push(previewUrl);
            }

            if (compressedFiles.length > 0) {
                setImageFiles(prev => [...prev, ...compressedFiles]);
                setPreviews(prev => [...prev, ...newPreviews]);
                setIsDirty(true);
            }
        } catch (error) {
            console.error(error);
            showToast("Image processing failed", "error");
        } finally {
            setIsCompressing(false);
            e.target.value = "";
        }
    };

    const removeExisting = async (index) => {
        const isConfirmed = await confirmAction({
            title: "Remove Image?",
            text: "This image will be removed from the list.",
            confirmButtonText: "Yes, Remove",
            icon: "warning"
        });

        // Track deletions to send to backend for cleanup on submit
        if (!isConfirmed) return;
        const imageToDelete = existingImages[index];
        setDeletedImages(prev => [...prev, imageToDelete]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    };

    const removeNew = (index) => {
        URL.revokeObjectURL(previews[index]);
        objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== previews[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const requiredText = ["title", "city", "district", "location", "proximity", "features", "desc", "lat", "lng"];
        for (const field of requiredText) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`, "error");
                if (field !== 'district') document.getElementById(field)?.focus();
                return false;
            }
        }
        if (formData.tags.length === 0) return (showToast("Select at least 1 Tag.", "error"), false);
        if (formData.bestSeason.length === 0) return (showToast("Select at least 1 Season.", "error"), false);

        const lat = parseFloat(formData.lat);
        const lng = parseFloat(formData.lng);
        if (isNaN(lat) || lat < -90 || lat > 90) return (showToast("Invalid Latitude (-90 to 90)", "error"), false);
        if (isNaN(lng) || lng < -180 || lng > 180) return (showToast("Invalid Longitude (-180 to 180)", "error"), false);

        if (existingImages.length === 0 && imageFiles.length === 0) {
            showToast("At least 1 image is required!", "error");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        /*
          Data Assembly:
          Uses FormData instead of JSON because we are transmitting binary files (images).
          Complex structures (arrays/objects) must be serialized or appended manually.
        */
        const uploadData = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'tags' || key === 'bestSeason') {
                uploadData.append(key, formData[key].join(','));
            } else if (key !== 'lat' && key !== 'lng') {
                const val = typeof formData[key] === 'string' ? formData[key].trim() : formData[key];
                uploadData.append(key, val);
            }
        });

        // GeoJSON standard format
        const geometry = { type: "Point", coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)] };
        uploadData.append("geometry", JSON.stringify(geometry));

        imageFiles.forEach(file => uploadData.append("images", file));

        if (deletedImages.length > 0) {
            uploadData.append("deletedImages", JSON.stringify(deletedImages));
        }

        try {
            await onSubmit(uploadData);
            setIsDirty(false);
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    return (
        <div className="spt_frm_wrapper">
            {/* --- Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <div className="spt_frm_glass_card">
                <h2 className="spt_frm_heading">{formTitle}</h2>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col lg={4} md={6}><FormGroup className="spt_frm_group"><label className="spt_frm_label">Title <span className={`spt_frm_req_star ${formData.title ? 'hidden' : ''}`}>*</span></label><input id="title" type="text" className="spt_frm_input" value={formData.title} onChange={handleChange} /></FormGroup></Col>
                        <Col lg={4} md={6}><FormGroup className="spt_frm_group"><label className="spt_frm_label">City <span className={`spt_frm_req_star ${formData.city ? 'hidden' : ''}`}>*</span></label><input id="city" type="text" className="spt_frm_input" value={formData.city} onChange={handleChange} /></FormGroup></Col>
                        <Col lg={4} md={12}>
                            <FormGroup className="spt_frm_group">
                                <label className="spt_frm_label">District <span className={`spt_frm_req_star ${formData.district ? 'hidden' : ''}`}>*</span></label>
                                <SpotGlassDropdown
                                    options={DISTRICT_OPTIONS}
                                    selected={formData.district}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6} md={6}><FormGroup className="spt_frm_group"><label className="spt_frm_label">Location Name <span className={`spt_frm_req_star ${formData.location ? 'hidden' : ''}`}>*</span></label><input id="location" type="text" className="spt_frm_input" value={formData.location} onChange={handleChange} /></FormGroup></Col>
                        <Col lg={6} md={6}><FormGroup className="spt_frm_group"><label className="spt_frm_label">Proximity <span className={`spt_frm_req_star ${formData.proximity ? 'hidden' : ''}`}>*</span></label><input id="proximity" type="text" className="spt_frm_input" value={formData.proximity} onChange={handleChange} /></FormGroup></Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <FormGroup className="spt_frm_group">
                                <label className="spt_frm_label">Best Seasons <span className={`spt_frm_req_star ${formData.bestSeason.length > 0 ? 'hidden' : ''}`}>*</span></label>
                                <div className="spt_frm_pill_container">
                                    {SEASON_OPTIONS.map((season) => (
                                        <div key={season} className={`spt_frm_pill ${formData.bestSeason.includes(season) ? "active" : ""}`} onClick={() => toggleSelection("bestSeason", season)}>
                                            {season} <i className="ri-check-line spt_frm_pill_icon"></i>
                                        </div>
                                    ))}
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <FormGroup className="spt_frm_group">
                                <label className="spt_frm_label">Tags <span className={`spt_frm_req_star ${formData.tags.length > 0 ? 'hidden' : ''}`}>*</span></label>
                                <div className="spt_frm_pill_container">
                                    {TAG_OPTIONS.map((tag) => (
                                        <div key={tag} className={`spt_frm_pill ${formData.tags.includes(tag) ? "active" : ""}`} onClick={() => toggleSelection("tags", tag)}>
                                            {tag} <i className="ri-check-line spt_frm_pill_icon"></i>
                                        </div>
                                    ))}
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col lg={3} md={6}>
                            <FormGroup className="spt_frm_group">
                                <label className="spt_frm_label">Latitude <span className={`spt_frm_req_star ${formData.lat ? 'hidden' : ''}`}>*</span></label>
                                <input id="lat" type="number" step="any" className="spt_frm_input" value={formData.lat} onChange={handleChange} placeholder="34.xxxx" />
                            </FormGroup>
                        </Col>
                        <Col lg={3} md={6}>
                            <FormGroup className="spt_frm_group">
                                <label className="spt_frm_label">Longitude <span className={`spt_frm_req_star ${formData.lng ? 'hidden' : ''}`}>*</span></label>
                                <input id="lng" type="number" step="any" className="spt_frm_input" value={formData.lng} onChange={handleChange} placeholder="72.xxxx" />
                            </FormGroup>
                        </Col>
                        <Col lg={6} md={12}><FormGroup className="spt_frm_group"><label className="spt_frm_label">Key Features <span className={`spt_frm_req_star ${formData.features ? 'hidden' : ''}`}>*</span></label><input id="features" type="text" className="spt_frm_input" value={formData.features} onChange={handleChange} /></FormGroup></Col>
                    </Row>

                    <Row>
                        <Col md={12}><FormGroup className="spt_frm_group"><label className="spt_frm_label">Description <span className={`spt_frm_req_star ${formData.desc ? 'hidden' : ''}`}>*</span></label><textarea id="desc" rows="5" className="spt_frm_textarea" value={formData.desc} onChange={handleChange} ></textarea></FormGroup></Col>
                    </Row>
                    <Row>
                        <Col md={12}><FormGroup className="spt_frm_group"><label className="spt_frm_label">History (Optional)</label><textarea id="history" rows="5" className="spt_frm_textarea" value={formData.history} onChange={handleChange}></textarea></FormGroup></Col>
                    </Row>

                    <FormGroup className="spt_frm_group mt-4">
                        <label className="spt_frm_label">Gallery (Max 4) <span className={`spt_frm_req_star ${existingImages.length + imageFiles.length > 0 ? 'hidden' : ''}`}>*</span></label>

                        {(existingImages.length + imageFiles.length) < 4 && (
                            <label htmlFor="file-upload" className={`spt_frm_upload_box ${isCompressing ? 'processing' : ''}`}>
                                {isCompressing ? (
                                    <>
                                        <div className="spt_frm_spinner"></div>
                                        <p className="spt_frm_upload_text">Compressing High Quality Images...</p>
                                        <p className="spt_frm_limit_text">Please wait</p>
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-image-add-line spt_frm_upload_icon"></i>
                                        <p className="spt_frm_upload_text">Click to upload images</p>
                                        <p className="spt_frm_limit_text">{imageFiles.length + existingImages.length} / 4 uploaded</p>
                                        <input type="file" id="file-upload" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                        <span className="spt_frm_upload_label">Choose Files</span>
                                    </>
                                )}
                            </label>
                        )}

                        <div className="spt_frm_grid">
                            {existingImages.map((src, index) => (
                                <div key={`exist-${index}`} className="spt_frm_grid_item">
                                    <img src={src} alt="Existing" className="spt_frm_img" />
                                    {index === 0 && <span className="spt_frm_cover_badge">Cover</span>}
                                    <button type="button" className="spt_frm_remove_btn" onClick={() => removeExisting(index)}><i className="ri-delete-bin-line"></i></button>
                                </div>
                            ))}
                            {previews.map((src, index) => (
                                <div key={`new-${index}`} className="spt_frm_grid_item">
                                    <img src={src} alt="New" className="spt_frm_img" />
                                    {(existingImages.length === 0 && index === 0) && <span className="spt_frm_cover_badge">Cover</span>}
                                    <button type="button" className="spt_frm_remove_btn" onClick={() => removeNew(index)}><i className="ri-close-line"></i></button>
                                </div>
                            ))}
                        </div>
                    </FormGroup>

                    <div className="spt_frm_actions">
                        <Button type="button" className="spt_frm_btn_cancel" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="spt_frm_btn_submit" disabled={isLoading || isCompressing}>
                            {(isLoading || isCompressing) ? "Processing..." : (initialData ? "Save Changes" : "Publish Spot")}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default SpotForm;