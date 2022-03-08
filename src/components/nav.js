import React from 'react';
/* eslint react/prop-types: 0 */
import styles from './nav.scss';

const Nav = (props) => {
    const dots = [];
    for (let i = 1; i <= props.totalSteps; i += 1) {
        const isActive = props.currentStep === i;
        dots.push((
            <span
                key={`step-${i}`}
                className={`${'dot'} ${isActive ? 'active' : ''}`}
                onClick={() => i < props.currentStep && props.goToStep(i)}
            >&bull;</span>
        ));
    }

    return (
        <div className='nav d-flex justify-content-center'>{dots}</div>
    );
};

export default Nav;
