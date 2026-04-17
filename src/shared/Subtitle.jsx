import React from 'react'

//====== UI COMPONENT: SUBTITLE =======//

/*
  Reusable typography item.
  Ensures consistent H3 styling (via 'section__subtitle') across the app,
  abstracting the class logic away from the parent component.
*/
const Subtitle = ({ subtitle }) => {
    return (
        <h3 className='section__subtitle'>
            {subtitle}
        </h3>
    )
}

//====== EXPORT =====//
export default Subtitle;