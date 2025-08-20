import React from 'react';
import BlogArchivePage from '@theme-original/BlogArchivePage';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function BlogArchivePageWrapper(props) {
    const { siteConfig } = useDocusaurusContext();

    // https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#json-ld
    const breadcrumbStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        name: 'Archive breadcrumb',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteConfig.url,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Archive',
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData),
                }}
            />
            <BlogArchivePage {...props} />
        </>
    );
}