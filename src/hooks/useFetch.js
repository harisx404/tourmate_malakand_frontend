import { useState, useEffect } from "react";
import { toast } from "react-toastify";

//===== CUSTOM HOOK: DATA FETCHING =====//

/**
 * Custom hook for fetching data from an API Endpoint.
 * Handles loading states, errors, and data normalization.
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Object} An object containing:
 * - data: The fetched data (normalized).
 * - error: Error message if fetch failed.
 * - loading: Boolean indicating if request is in progress.
 */
const useFetch = (url) => {

    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        /*
          AbortController Strategy:
          Creates a signal to cancel the specific fetch request if the component
          unmounts before the request completes (prevents "Can't perform a React state
          update on an unmounted component" memory leak warnings).
        */
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(url, { signal });
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await res.json();

                /*
                  Data Normalization:
                  Handles both { data: [...] } and directly array responses.
                  This ensures compatibility with different backend response formats.
                */
                if (result.data) {
                    setData(result.data);
                } else {
                    // Fallback for simple arrays or different structures, but warn about it.
                    // Ideally, this should be strictly 'setData(result.data)' if the API is consistent.
                    // console.warn("API response does not contain 'data' property:", result);
                    setData(result);
                }
                setLoading(false);

            } catch (error) {
                /*
                  Error Filtering:
                  We strictly ignore 'AbortError' because it is an intentional cancellation
                  triggered by the cleanup function, not a network failure.
                */
                if (error.name === 'AbortError') {
                    // Fetch aborted
                } else {
                    setError(error.message);
                    setLoading(false);
                    // Notify user of data fetching failures via toast for immediate feedback.
                    toast.error(error.message);
                }
            }
        };

        fetchData();

        // Cleanup: triggers the abort signal if dependencies change or component unmounts
        return () => {
            controller.abort();
        };
    }, [url]);

    return {
        data,
        error,
        loading
    }
};

export default useFetch;