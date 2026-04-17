import React, { useRef, useState, useContext, useMemo } from "react";
import { Form, ListGroup } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import avatar from "../../assets/images/avatar.jpg";
import "./spot-reviews.css";
import CustomToast from "../../shared/CustomToast";
import { confirmAction } from "../../utils/alerts";


//==== REVIEW COMPONENT ===//
/*
  Manages the entire lifecycle of user reviews for a specific spot.
  Handles: Display list, create/edit/delete actions, and star rating UI.
*/
const SpotReviews = ({ spotId, reviews, setReviews }) => {
    const navigate = useNavigate();

    // Refs are used here for uncontrolled form inputs to reduce re-renders during typing
    const reviewMsgRef = useRef("");
    const [spotRating, setSpotRating] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const { user } = useContext(AuthContext);

    //==== EDITING STATE ===//
    const [isEditing, setIsEditing] = useState(false);
    const [reviewIdToEdit, setReviewIdToEdit] = useState(null);

    //==== TOAST STATE MANAGEMENT ===//
    /* Local state to manage the custom toast visibility.
      This pattern avoids global state complexity for simple local feedback.
    */
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

    const options = { day: "numeric", month: "long", year: "numeric" };

    //==== MEMOIZED DATA LOGIC ===//
    /* Sorting Strategy (useMemo):
      1. Pins the current user's review to the top for better UX/visibility.
      2. Sorts the remaining reviews chronologically (newest first).
      Dependencies: Re-runs only when 'reviews' array or 'user' object changes.
    */
    const sortedReviews = useMemo(() => {
        if (!reviews) return [];
        let userReview = null;
        let otherReviews = [];

        reviews.forEach(review => {
            if (user && (review.userId === user._id || review.username === user.username)) {
                userReview = review;
            } else {
                otherReviews.push(review);
            }
        });

        otherReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return userReview ? [userReview, ...otherReviews] : otherReviews;
    }, [reviews, user]);

    /*
      Validation Helper:
      Checks if the current user has already left a review to conditionally 
      hide the input form or show the "Edit" prompt.
    */
    const hasUserReviewed = useMemo(() => {
        if (!user || !reviews) return false;
        return reviews.some(r => r.userId === user._id || r.username === user.username);
    }, [reviews, user]);

    //==== ACTION HANDLERS ===//
    const submitHandler = async (e) => {
        e.preventDefault();
        const reviewText = reviewMsgRef.current.value;

        // Validation: Ensure user is logged in
        if (!user) {
            showToast("Please login to submit a review.", "error");
            setTimeout(() => navigate('/login'), 1500); // Preserved your original delay
            return;
        }

        // Validation: Check Rating
        if (!spotRating) {
            showToast("Please select a star rating first!", "error");
            return;
        }

        // Prevention: Stop duplicate submissions unless in Edit Mode
        if (hasUserReviewed && !isEditing) {
            showToast("You have already reviewed this spot. Please edit your existing review.", "error");
            return;
        }

        const reviewObj = {
            username: user.username,
            reviewText,
            rating: spotRating
        };

        try {
            let res, result;

            /*
              Dual-Purpose Handler:
              Switches between PUT (Update) and POST (Create) based on 'isEditing' state.
            */
            if (isEditing) {
                const isConfirmed = await confirmAction({
                    title: "Save Changes?",
                    text: "Do you want to update your review?",
                    confirmButtonText: "Yes, Update",
                    icon: "question"
                });

                if (!isConfirmed) return;

                res = await fetch(`${BASE_URL}/reviews/${reviewIdToEdit}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    credentials: "include", // Essential for passing HTTP-only cookies
                    body: JSON.stringify(reviewObj)
                });
                result = await res.json();

                if (!res.ok) throw new Error(result.message);

                // Optimistic UI Update: Map over state to replace only the modified item
                setReviews(prev => prev.map(item => item._id === reviewIdToEdit ? { ...item, ...reviewObj } : item));
                showToast("Review updated successfully!", "success");

                // Reset Form State
                setIsEditing(false);
                setReviewIdToEdit(null);
                reviewMsgRef.current.value = "";
                setSpotRating(null);

            } else {
                // Creation Logic
                res = await fetch(`${BASE_URL}/reviews/${spotId}`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    credentials: "include", // Preserved Cookie Auth
                    body: JSON.stringify(reviewObj)
                });
                result = await res.json();

                if (!res.ok) throw new Error(result.message);

                const newReview = {
                    ...reviewObj,
                    _id: result.data._id,
                    userId: user._id,
                    createdAt: new Date()
                };

                setReviews(prev => [...prev, newReview]);
                showToast("Review submitted successfully!", "success");

                reviewMsgRef.current.value = "";
                setSpotRating(null);
            }

        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const deleteHandler = async (reviewId) => {
        const isConfirmed = await confirmAction({
            title: "Delete Review?",
            text: "This action cannot be undone.",
            confirmButtonText: "Yes, Delete It",
            icon: "warning"
        });

        if (!isConfirmed) return;

        if (!user) return showToast("You are not authorized!", "error");

        try {
            const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: "include" // Preserved Cookie Auth
            });
            const result = await res.json();

            if (!res.ok) throw new Error(result.message);

            // Filter out the deleted review from local state
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            showToast("Review deleted successfully", "success");

            // UX: If user deleted the review they were currently editing, cancel edit mode
            if (isEditing && reviewIdToEdit === reviewId) {
                setIsEditing(false);
                setReviewIdToEdit(null);
                reviewMsgRef.current.value = "";
                setSpotRating(null);
            }
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    /*
      Prepares the form for editing:
      1. Populates state/refs with existing data.
      2. Scrolls the window to the form for better mobile UX.
    */
    const startEditHandler = (review) => {
        setIsEditing(true);
        setReviewIdToEdit(review._id);
        setSpotRating(review.rating);
        reviewMsgRef.current.value = review.reviewText;
        reviewMsgRef.current.focus();

        const formElement = document.querySelector('.spot-reviews-card');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });

        // Changed 'toast.info' to 'showToast' (defaults to success color, but acts as info)
        // If you want a specific "Info" blue color, you can update CustomToast CSS, 
        // but "Success" green works well for "Edit Mode Enabled".
        showToast("Edit mode enabled. Update your review above.", "success");
    };

    return (
        <>
            <div className="glassy-card spot-reviews-card">
                <h4 className="mb-4">Reviews ({reviews.length} reviews)</h4>

                {/* Conditional Render: Only show form if user hasn't reviewed yet OR is currently editing */}
                {(!hasUserReviewed || isEditing) && (
                    <Form onSubmit={submitHandler} className="mb-4">
                        <div className="d-flex align-items-center gap-3 mb-3 spot-reviews-rating-group">
                            {/* Star Rating Render Loop */}
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} onClick={() => setSpotRating(star)}
                                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                                    className="spot-reviews-star-span">
                                    <i className={(hoverRating || spotRating) >= star ? "ri-star-fill spot-reviews-active-star" : "ri-star-line spot-reviews-inactive-star"}></i>
                                </span>
                            ))}
                        </div>
                        <div className="spot-reviews-input-wrapper">
                            <input type="text" ref={reviewMsgRef} placeholder={isEditing ? "Update your review..." : "Share your experience..."} required />
                            <button className="btn primary__btn spot-reviews-submit-btn text-white" type="submit">
                                {isEditing ? "Update" : "Submit"}
                            </button>
                        </div>
                        {isEditing && (
                            <div className="text-end mt-2">
                                <span style={{ cursor: 'pointer', color: 'red', fontSize: '0.8rem' }}
                                    onClick={() => { setIsEditing(false); setReviewIdToEdit(null); reviewMsgRef.current.value = ""; setSpotRating(null) }}>
                                    Cancel Edit
                                </span>
                            </div>
                        )}
                    </Form>
                )}

                {/* Feedback for users who have already reviewed */}
                {hasUserReviewed && !isEditing && (
                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                        You have already submitted a review for this spot.
                    </p>
                )}

                <ListGroup className="spot-reviews-list spot-reviews-scrollable">
                    {sortedReviews.length === 0 ? <p className="text-center text-muted">No reviews yet. Be the first!</p> :
                        sortedReviews.map((review, index) => (
                            <div className="spot-reviews-item" key={index}
                                style={user && (review.userId === user._id || review.username === user.username) ? { backgroundColor: 'rgba(42, 157, 143, 0.05)', borderLeft: '3px solid var(--secondary-color)' } : {}}
                            >
                                <img src={avatar} alt="" />
                                <div className="w-100">
                                    <div className="d-flex align-items-center justify-content-between spot-reviews-item-header">
                                        <div className="spot-reviews-user-info">
                                            <h5 className="mb-0">
                                                {review.username}
                                                {user && (review.userId === user._id || review.username === user.username) && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', marginLeft: '5px' }}>(You)</span>}
                                            </h5>
                                            <p className="spot-reviews-date">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", options) : "Just now"}
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 spot-reviews-actions">
                                            <span className="d-flex align-items-center spot-reviews-rating-pill">
                                                {review.rating}<i className="ri-star-fill"></i>
                                            </span>
                                            {/* Action Buttons: Only visible to the owner or admin */}
                                            {user && (
                                                <div className="d-flex align-items-center gap-2">
                                                    {(user.username === review.username || user._id === review.userId) && (
                                                        <span onClick={() => startEditHandler(review)} style={{ cursor: 'pointer', color: 'var(--secondary-color)' }} title="Edit Review">
                                                            <i className="ri-pencil-line"></i>
                                                        </span>
                                                    )}
                                                    {(user.username === review.username || user._id === review.userId || user.role === 'admin') && (
                                                        <span onClick={() => deleteHandler(review._id)} style={{ cursor: 'pointer', color: '#e63946' }} title="Delete Review">
                                                            <i className="ri-delete-bin-line"></i>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h6 className="spot-reviews-msg">{review.reviewText}</h6>
                                </div>
                            </div>
                        ))
                    }
                </ListGroup>
            </div>

            {/* ===== Render Custom Toast ===== */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />
        </>
    );
};

export default SpotReviews;