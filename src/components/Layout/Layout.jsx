import React from "react";

import Header from "../Header/Header";
import Routers from "../../router/Router";
import Footer from "../Footer/Footer";

/**
 * Main application layout component.
 * Wraps the router content between the global Header and Footer.
 * 
 * @component
 */
const Layout = () => {
    return (
        <>
            <Header />
            <Routers />
            <Footer />
        </>
    )
}

export default Layout;