import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import Comments from "../../../components/Comments";

export default function FooterWrapper(props) {
    return (
        <>
            <Footer {...props} />
            <br/>
            <hr/>
            <p>
                If you spot any mistakes on this website, please let me know at <a href="mailto:feedback@compilenrun.com">feedback@compilenrun.com</a>.
                I’d greatly appreciate your feedback! :)
            </p>

            <Comments/>
        </>);
}
