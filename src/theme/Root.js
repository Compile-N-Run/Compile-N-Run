import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ReferralDock from '@site/src/components/ReferralDock';

// Root wraps every page; BrowserOnly keeps the dock out of SSR output.
export default function Root({children}) {
    return (
        <>
            {children}
            <BrowserOnly>{() => <ReferralDock />}</BrowserOnly>
        </>
    );
}
