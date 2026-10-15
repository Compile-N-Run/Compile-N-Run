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
                    Click <strong>"Edit this page"</strong> to suggest a correction, or report it in the{' '}
                    <a href="https://forum.compilenrun.com/c/tutorial-feedback" rel="noopener">Tutorial Feedback</a> category on our forum.
                    Your feedback is greatly appreciated!
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                    💬 Have a question about this tutorial, or want to share what you built?
                    Join the discussion at <a href="https://forum.compilenrun.com/" rel="noopener">forum.compilenrun.com</a> and ask in{' '}
                    <a href="https://forum.compilenrun.com/c/questions-help" rel="noopener">Questions &amp; Help</a>.
                </p>
            </div>

            <Comments />
        </>
    );
}
