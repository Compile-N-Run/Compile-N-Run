import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import Comments from '../../../components/Comments';

export default function FooterWrapper(props) {
    return (
        <>
            <Footer {...props} />

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                    💡 Found a typo or mistake?
                    Click <strong>"Edit this page"</strong> to suggest a correction.
                    Your feedback is greatly appreciated!
                </p>
            </div>

            <Comments />
        </>
    );
}
