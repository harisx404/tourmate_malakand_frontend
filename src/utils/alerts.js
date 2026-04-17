import Swal from "sweetalert2";

//--- [ THEME CONFIGURATION ] ---//

/*
 * Maps internal UI components to custom CSS classes.
 * Establish contract with global stylesheet for 'glass' UI theme.
 */
const GLASS_CLASSES = {
    popup: "glass-popup",
    confirmButton: "glass-confirm",
    cancelButton: "glass-cancel",
    container: "glass-container" // High-level hook for CSS
};

/*
 * Shared configuration to enforce design consistency across all alerts.
 * Note: buttonsStyling must be false to allow GLASS_CLASSES to override native SweetAlert styles.
 */
const baseOptions = {
    customClass: GLASS_CLASSES,
    buttonsStyling: false, // Disables default Swal button styles to use our CSS
    showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
    hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' }
};

//--- [ PUBLIC INTERACTION METHODS ] ---//

/*
 * Asynchronous confirmation wrapper.
 * Abstracts the Swal object lifecycle, returning a simple Boolean result.
 * UX: Defaults focus to the Cancel button to prevent accidental confirmations.
 */
export const confirmAction = async ({
    title = "Are you sure?",
    text = "This action cannot be undone.",
    confirmButtonText = "Confirm",
    cancelButtonText = "Go Back",
    icon = "warning",
} = {}) => {
    const result = await Swal.fire({
        ...baseOptions,
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        focusCancel: true,
    });

    return result.isConfirmed;
};

export const showBlockingError = (title = "Error!", text = "Something went wrong.") => {
    return Swal.fire({
        ...baseOptions,
        title,
        text,
        icon: "error",
        confirmButtonText: "Got it",
    });
};

/*
 * Transient success feedback.
 * Uses a timer (2.5s) to auto-dismiss, preventing flow interruption.
 */
export const showBlockingSuccess = (title = "Success!", text = "Everything looks good.") => {
    return Swal.fire({
        ...baseOptions,
        title,
        text,
        icon: "success",
        confirmButtonText: "Perfect",
        timer: 2500,
        timerProgressBar: true,
    });
};