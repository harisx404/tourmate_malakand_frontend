import React, { useRef } from "react";
import "./search-bar.css";
import { Col, Form } from "reactstrap";
import { useNavigate } from "react-router-dom";

/**
 * Global Search Component.
 * Acts as the primary entry point for discovering valleys, spots, and gems.
 * Implements a glassmorphism UI pattern and handles routing to the results view.
 * * @component
 * @returns {JSX.Element} Responsive search input wrapper.
 */
const SearchBar = () => {
    const searchRef = useRef("");
    const navigate = useNavigate();

    /**
     * Orchestrates the search submission process.
     * Sanitizes input to prevent empty queries and navigates via React Router state
     * to avoid cluttering the URL parameters for the initial search action.
     * * @param {Event} e - The form submission event.
     */
    const searchHandler = async (e) => {
        e.preventDefault();
        const searchTerm = searchRef.current.value;

        // Prevent routing execution for empty or whitespace-only strings
        if (searchTerm.trim() === "") {
            return;
        }

        navigate(`/search-results`, { state: { query: searchTerm } });
    };

    return (
        <Col lg="12">
            <div className="search-bar-container">
                <Form className="d-flex align-items-center justify-content-between search-bar-form" onSubmit={searchHandler}>
                    <input
                        type="text"
                        placeholder="Search for valleys or hidden spots..."
                        ref={searchRef}
                    />
                    <button className="search-bar-btn" type="submit">
                        Search
                    </button>
                </Form>
            </div>
        </Col>
    );
};

export default SearchBar;