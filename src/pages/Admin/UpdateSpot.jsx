import React, { useState, useEffect, useContext } from "react";
import { Container } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import SpotForm from "../../components/Admin/SpotForm";
import Loader from "../../components/Common/Loader";
import CustomToast from "../../shared/CustomToast"; // <--- 1. Import CustomToast
import { confirmAction } from "../../utils/alerts";

/**
 * View component for editing an existing tourism spot.
 */
const UpdateSpot = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);

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

    // Retrieve existing spot details from the backend to populate the form fields
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${BASE_URL}/spots/${id}`);
                const result = await res.json();
                if (res.ok) {
                    setInitialData(result.data);
                } else {
                    showToast(result.message || "Failed to load spot", "error");
                }
            } catch (err) {
                showToast("Server Error: Could not load data", "error");
            }
        };
        fetchData();
    }, [id]);

    /**
     * Submits updated spot data to the API.
     */
    const handleUpdate = async (uploadData) => {
        // Enforce authentication requirement before processing
        if (!user) {
            showToast("You must be logged in!", "error");
            return;
        }

        // Prevent accidental submission with a browser-native confirmation dialog
        const isConfirmed = await confirmAction({
            title: "Save Changes?",
            text: "Are you sure you want to update this spot?",
            confirmButtonText: "Yes, Update",
            icon: "question"
        });

        if (!isConfirmed) return;

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/spots/${id}`, {
                method: "PUT",
                credentials: "include",
                body: uploadData
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || "Failed to update");

            showToast("Spot Updated Successfully!", "success");

            // Provide a brief delay to ensure the success notification is perceptible before redirecting
            setTimeout(() => navigate('/admin/manage-spots'), 1500);
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // Show loading indicator while fetching initial data
    // WRAPPER: Ensures Toast renders even if we are stuck on the Loading screen due to an error
    if (!initialData) {
        return (
            <>
                <CustomToast
                    show={toastState.show}
                    message={toastState.message}
                    type={toastState.type}
                    onClose={closeToast}
                />
                <Loader />
            </>
        );
    }

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
                    formTitle="Edit Spot"
                    initialData={initialData}
                    onSubmit={handleUpdate}
                    isLoading={loading}
                    onCancel={() => navigate('/admin/manage-spots')}
                />
            </Container>
        </section>
    );
};

export default UpdateSpot;