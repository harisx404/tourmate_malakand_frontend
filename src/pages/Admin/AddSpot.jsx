import React, { useContext, useState, useEffect } from "react";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import SpotForm from "../../components/Admin/SpotForm";
import CustomToast from "../../shared/CustomToast"; // <--- 1. Import CustomToast

/**
 * View component for creating new tourism spots.
 */
const AddSpot = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // --- 2. Standardized Toast State ---
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

    // Ensure the viewport resets to the top when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    /**
     * Submits the new spot data to the API.
     */
    const handleCreate = async (uploadData) => {
        // Enforce authentication requirement before processing
        if (!user) {
            showToast("You must be logged in!", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/spots`, {
                method: "POST",
                credentials: "include", // Send HttpOnly Cookie
                // form-data boundary is set automatically
                body: uploadData
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to create spot");

            showToast("Spot Added Successfully!", "success");

            // Provide a brief delay to ensure the success notification is perceptible before redirecting
            setTimeout(() => navigate('/admin/manage-spots'), 1500);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="pt-4 pb-4">
            <Container>
                {/* --- 3. Render Custom Toast --- */}
                <CustomToast
                    show={toastState.show}
                    message={toastState.message}
                    type={toastState.type}
                    onClose={closeToast}
                />

                <SpotForm
                    formTitle="Add New Spot"
                    initialData={null}
                    onSubmit={handleCreate}
                    isLoading={loading}
                    onCancel={() => navigate('/admin/manage-spots')}
                />
            </Container>
        </section>
    );
};

export default AddSpot;