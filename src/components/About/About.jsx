import React from "react";
import Slider from "react-slick";
import avatar from "../../assets/images/avatar.jpg";
import "./about.css";

//====== Static configuration for team member profiles ======// 
const aboutData = [
    {
        id: 1,
        name: "Muhammad Haris",
        role: "Lead Developer",
        desc: "I worked as the core developer of this project, handling frontend design, component structure, and overall system flow. I focused on building a clean, user-friendly interface that helps tourists easily explore the Malakand Division.",
        img: avatar
    },
    {
        id: 2,
        name: "Mohsin Naeem",
        role: "Project Partner",
        desc: "As a project partner, I contributed to database design, documentation, and supporting tasks. I assisted in organizing data, preparing reports, and ensuring the project followed proper academic and technical standards.",
        img: avatar
    },
    {
        id: 3,
        name: "Dr. Pervez Khan",
        role: "Project Supervisor",
        desc: "As our project supervisor, he continuously reviewed our work, provided valuable feedback, and guided us in improving both technical and conceptual aspects. His supervision played a key role in shaping the project’s quality.",
        img: avatar
    },
    {
        id: 4,
        name: "Dr. Fakhruddin",
        role: "Project Supervisor",
        desc: "As our project supervisor, he regularly guided us throughout the project timeline and development. He helped clarify concepts, monitored our progress, and provided consistent academic support to meet university standards.",
        img: avatar
    }
];

/*
  Displays team members in a responsive touch-swipe slider.
  Wraps the 'react-slick' library with custom styling and responsive breakpoints.
*/
const About = () => {
    /*
        Carousel Configuration:
        Defines how the slider behaves across different device widths.
        - 992px: Breaks down to 2 columns (Tablet mode).
        - 576px: Breaks down to 1 column (Mobile mode).
    */
    const settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        speed: 1000,
        swipeToSlide: true,
        autoplaySpeed: 3000,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="about-slider-wrapper">
            <Slider {...settings}>
                {/* Render Strategy:
                   Maps through the static data array to generate dynamic slides.
                   Uses 'id' as a stable key to optimize React's reconciliation process.
                */}
                {aboutData.map((item) => (
                    <div className="about-item" key={item.id}>
                        <div className="about-card">
                            <div className="about-card-top">
                                <div className="about-quote-icon">
                                    <i className="ri-double-quotes-l"></i>
                                </div>
                                <p className="about-desc">
                                    "{item.desc}"
                                </p>
                            </div>

                            <div className="about-member-info-wrapper">
                                <div className="about-member-img-box">
                                    <img src={item.img} alt={item.name} />
                                </div>
                                <div className="about-member-details">
                                    <h6 className="about-member-name">{item.name}</h6>
                                    <p className="about-member-role">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default About;